'use strict';

const express = require('express');
const { User } = require('../models/user');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/verification/start
 * Initiates the Persona age-verification flow.
 *
 * Returns a Persona inquiry session URL that the mobile client opens in a
 * secure in-app browser.  Vera stores only the inquiry ID so that the
 * incoming webhook can be correlated; no document data ever reaches Vera.
 */
router.post('/start', authenticate, async (req, res, next) => {
  try {
    const { inquiryId } = req.body;
    if (!inquiryId) {
      return res.status(400).json({ error: 'inquiryId is required' });
    }

    await User.setPersonaInquiryId(req.user.id, inquiryId);

    // Construct the hosted Persona verification URL for the mobile client.
    const verifyUrl = `https://withpersona.com/verify?inquiry-id=${inquiryId}&template-id=${process.env.PERSONA_TEMPLATE_ID}`;
    return res.json({ verifyUrl });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/verification/status
 * Returns the current verification and subscription status for the
 * authenticated user.
 */
router.get('/status', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({
      age_verified: user.age_verified,
      subscription_active: user.subscription_active,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
