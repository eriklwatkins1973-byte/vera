-- Vera database schema
-- Minimalist design: zero personal PII stored after the "Verify & Shred" step.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- bcrypt hash of the lowercased email – never the plaintext address
  email_hash          TEXT UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL,
  -- Set to TRUE after a successful Stripe Identity or Persona verification.
  -- The inquiry/session IDs that enabled this are nulled immediately after
  -- (the "Shred" step), leaving only this boolean as proof of verification.
  age_verified        BOOLEAN NOT NULL DEFAULT FALSE,
  subscription_active BOOLEAN NOT NULL DEFAULT FALSE,
  -- Ephemeral reference used only to correlate the Persona webhook event.
  -- Set to NULL once the "Shred" step is complete.
  persona_inquiry_id  TEXT,
  stripe_customer_id  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id
  ON users (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_persona_inquiry_id
  ON users (persona_inquiry_id)
  WHERE persona_inquiry_id IS NOT NULL;
