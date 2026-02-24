'use strict';

const express = require('express');
const Stripe = require('stripe');
const { User } = require('../models/user');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/payment/create-customer
 * Creates a Stripe customer and stores the customer ID against the user.
 * Must be called before initiating the join-fee payment or subscription.
 * Requires authentication.
 */
router.post('/create-customer', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const customer = await stripe.customers.create({
      metadata: { vera_user_id: req.user.id },
    });

    // Persist the Stripe customer ID (no PII attached to the customer object)
    const { pool } = require('../models/user');
    await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [
      customer.id,
      req.user.id,
    ]);

    return res.json({ customerId: customer.id });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/payment/join
 * Creates a Stripe PaymentIntent for the one-time $3.99 join fee.
 * The client uses the returned clientSecret to complete payment via
 * Apple Pay / Google Pay native sheet.
 */
router.post('/join', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.stripe_customer_id) {
      return res.status(400).json({ error: 'Create a Stripe customer first' });
    }

    const intent = await stripe.paymentIntents.create({
      amount: 399, // $3.99 in cents
      currency: 'cad',
      customer: user.stripe_customer_id,
      automatic_payment_methods: { enabled: true },
      metadata: { vera_user_id: user.id, purpose: 'join_fee' },
    });

    return res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/payment/subscribe
 * Creates a Stripe Subscription for the $0.99/month recurring fee.
 * Should be called after the join fee has been paid and age verification
 * has succeeded.
 */
router.post('/subscribe', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.age_verified) {
      return res.status(403).json({ error: 'Age verification must be completed first' });
    }
    if (!user.stripe_customer_id) {
      return res.status(400).json({ error: 'Create a Stripe customer first' });
    }

    const subscription = await stripe.subscriptions.create({
      customer: user.stripe_customer_id,
      items: [{ price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    const paymentIntent = subscription.latest_invoice.payment_intent;
    return res.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
