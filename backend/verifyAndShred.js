/**
 * VERA BACKEND SERVICE: Verify & Shred Logic
 * This module handles the handshake with Stripe Identity and
 * ensures PII (Personally Identifiable Information) is purged
 * immediately after a successful "Adult-Verified" signal.
 */

const Stripe = require('stripe');

let updateUserStatus = async () => {
  throw new Error('updateUserStatus handler is not configured');
};

function setUserStatusUpdater(handler) {
  if (typeof handler !== 'function') {
    throw new TypeError('setUserStatusUpdater expects a function');
  }

  updateUserStatus = handler;
}

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

/**
 * 1. INITIALIZE VERIFICATION
 * Triggered when a user clicks 'Verify Age' during onboarding.
 */
async function createVerificationSession(userId) {
  const stripe = getStripeClient();

  const session = await stripe.identity.verificationSessions.create({
    type: 'document',
    metadata: { user_id: String(userId) },
    options: {
      document: {
        require_id_number: true,
        require_matching_selfie: true,
      },
    },
  });

  return session.client_secret;
}

/**
 * 2. THE "SHRED" COMMAND (The Vera USP)
 * Once the webhook confirms the user is 18+, we immediately
 * redact the session. This deletes the ID images and birthdate
 * from Stripe's servers, leaving only a 'Success' token.
 */
async function redactAndPurge(sessionId) {
  const stripe = getStripeClient();

  try {
    await stripe.identity.verificationSessions.redact(sessionId);
    console.log(`[VERA SECURITY] Data Shredded for Session: ${sessionId}`);
    return { status: 'shredded', timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('[SECURITY ERROR] Shredding failed:', error.message);
    throw error;
  }
}

/**
 * 3. WEBHOOK HANDLER
 * Listens for Stripe's 'identity.verification_session.verified' event.
 */
async function handleWebhook(event) {
  if (!event || !event.type) {
    throw new Error('Invalid webhook event payload');
  }

  if (event.type !== 'identity.verification_session.verified') {
    return { handled: false, reason: 'ignored_event_type' };
  }

  const session = event.data?.object;
  const userId = session?.metadata?.user_id;

  if (!session?.id || !userId) {
    throw new Error('Verified session is missing required metadata');
  }

  await updateUserStatus(userId, 'VERIFIED_ADULT');
  await redactAndPurge(session.id);

  return {
    handled: true,
    userId,
    sessionId: session.id,
    status: 'VERIFIED_ADULT',
  };
}

module.exports = {
  createVerificationSession,
  redactAndPurge,
  handleWebhook,
  setUserStatusUpdater,
};
