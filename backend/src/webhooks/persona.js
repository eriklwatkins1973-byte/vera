'use strict';

/**
 * Persona webhook handler
 *
 * Persona is Vera's primary age-verification provider.  When an inquiry
 * completes successfully (`inquiry.completed`) we:
 *   1. Look up the user by the stored inquiry ID.
 *   2. Confirm the subject is 18+ from the birthdate claim in the event.
 *   3. Mark the user as age-verified.
 *   4. NULL-out the persona_inquiry_id field ("Shred" step).
 *
 * Persona webhook signature validation is mandatory.  Events that fail
 * HMAC-SHA256 verification are rejected with 400.
 *
 * Vera never logs, stores, or forwards any personally-identifying attributes
 * from the inquiry payload beyond what is described above.
 */

const crypto = require('crypto');
const { User } = require('../models/user');

const EIGHTEEN_YEARS_MS = 18 * 365.25 * 24 * 60 * 60 * 1000;

async function personaWebhookHandler(req, res) {
  if (!verifyPersonaSignature(req)) {
    console.error('Persona webhook signature verification failed');
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const eventName = payload?.data?.attributes?.name;

  try {
    if (eventName === 'inquiry.completed') {
      await handleInquiryCompleted(payload.data);
    }
    // Other Persona events (inquiry.expired, inquiry.failed, etc.) are
    // acknowledged but require no action on user data.
  } catch (err) {
    console.error(`Error processing Persona event ${eventName}:`, err);
    return res.status(500).json({ error: 'Internal processing error' });
  }

  return res.json({ received: true });
}

/**
 * inquiry.completed
 *
 * Confirms the verified subject is 18+ then performs the "Shred" step.
 * Only the boolean outcome is persisted; all PII stays within Persona.
 */
async function handleInquiryCompleted(eventData) {
  const inquiryId = eventData?.relationships?.inquiry?.data?.id;
  if (!inquiryId) {
    console.warn('Persona inquiry.completed event missing inquiry ID');
    return;
  }

  const birthdateStr =
    eventData?.attributes?.payload?.data?.attributes?.birthdate;

  if (!isAgeVerified(birthdateStr)) {
    console.info(
      `Persona inquiry ${inquiryId} completed but subject is under 18 or birthdate unavailable`
    );
    return;
  }

  const user = await User.findByPersonaInquiryId(inquiryId);
  if (!user) {
    console.warn(`No user found for Persona inquiry ${inquiryId}`);
    return;
  }

  await User.markAgeVerifiedAndShred(user.id);
  console.info(`User ${user.id} age-verified and PII shredded via Persona`);
}

/**
 * Returns true only if the supplied ISO-8601 birthdate represents someone
 * who is at least 18 years old.
 */
function isAgeVerified(birthdateStr) {
  if (!birthdateStr) return false;
  const birthdate = new Date(birthdateStr);
  if (isNaN(birthdate.getTime())) return false;
  return Date.now() - birthdate.getTime() >= EIGHTEEN_YEARS_MS;
}

/**
 * Validates the Persona webhook HMAC-SHA256 signature.
 * Persona sends the signature in the `Persona-Signature` header as
 * `t=<timestamp>,v1=<hex-digest>`.
 */
function verifyPersonaSignature(req) {
  const header = req.headers['persona-signature'] || '';
  const parts = Object.fromEntries(
    header.split(',').map((p) => p.split('='))
  );
  const { t: timestamp, v1: receivedDigest } = parts;

  if (!timestamp || !receivedDigest) return false;

  const secret = process.env.PERSONA_WEBHOOK_SECRET;
  if (!secret) return false;

  const signedPayload = `${timestamp}.${req.body.toString('utf8')}`;
  const expectedDigest = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(receivedDigest, 'hex'),
    Buffer.from(expectedDigest, 'hex')
  );
}

module.exports = personaWebhookHandler;
module.exports._isAgeVerified = isAgeVerified; // exported for unit testing
module.exports._verifyPersonaSignature = verifyPersonaSignature;
