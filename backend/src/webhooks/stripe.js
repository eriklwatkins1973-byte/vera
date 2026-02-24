'use strict';

/**
 * Stripe Identity webhook handler
 *
 * Vera uses Stripe Identity as a secondary age-signal.  When a
 * `identity.verification_session.verified` event is received we mark the
 * user as age-verified and immediately null-out any temporary reference IDs
 * ("Verify & Shred").
 *
 * Stripe webhook signature validation is mandatory – every event that fails
 * HMAC verification is rejected with 400.
 */

const Stripe = require('stripe');
const { User } = require('../models/user');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const HANDLED_EVENTS = new Set([
  'identity.verification_session.verified',
  'identity.verification_session.requires_input',
  'customer.subscription.created',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

async function stripeWebhookHandler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return res.json({ received: true });
  }

  try {
    await dispatchStripeEvent(event);
  } catch (err) {
    console.error(`Error processing Stripe event ${event.type}:`, err);
    return res.status(500).json({ error: 'Internal processing error' });
  }

  return res.json({ received: true });
}

async function dispatchStripeEvent(event) {
  switch (event.type) {
    case 'identity.verification_session.verified':
      await handleIdentityVerified(event.data.object);
      break;

    case 'identity.verification_session.requires_input':
      // Verification failed – log for support but take no action on user data.
      console.info(
        'Stripe Identity requires input for session:',
        event.data.object.id
      );
      break;

    case 'customer.subscription.created':
    case 'invoice.payment_succeeded':
      await handleSubscriptionActive(event.data.object, true);
      break;

    case 'customer.subscription.deleted':
    case 'invoice.payment_failed':
      await handleSubscriptionActive(event.data.object, false);
      break;

    default:
      break;
  }
}

/**
 * identity.verification_session.verified
 *
 * The session object contains the Stripe customer ID in metadata.  We
 * confirm the user is 18+ (Stripe enforces this within the session) and
 * then call `markAgeVerifiedAndShred` which sets age_verified = TRUE and
 * sets persona_inquiry_id = NULL – completing the "Shred" step.
 *
 * Vera never receives, stores, or logs any document data from this event.
 */
async function handleIdentityVerified(session) {
  const customerId = session.customer;
  if (!customerId) {
    console.warn('identity.verification_session.verified missing customer ID');
    return;
  }

  const user = await User.findByStripeCustomerId(customerId);
  if (!user) {
    console.warn(`No user found for Stripe customer ${customerId}`);
    return;
  }

  await User.markAgeVerifiedAndShred(user.id);
  console.info(`User ${user.id} age-verified and PII shredded via Stripe Identity`);
}

async function handleSubscriptionActive(obj, active) {
  const customerId = obj.customer;
  if (!customerId) return;

  const user = await User.findByStripeCustomerId(customerId);
  if (!user) return;

  await User.setSubscriptionActive(user.id, active);
  console.info(`User ${user.id} subscription_active set to ${active}`);
}

module.exports = stripeWebhookHandler;
