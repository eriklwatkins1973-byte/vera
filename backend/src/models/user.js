'use strict';

/**
 * Minimal User model.
 *
 * Vera stores NO personal PII (names, addresses, ID numbers).
 * The only identity proof stored is a boolean `age_verified` flag and the
 * anonymous Stripe / Persona inquiry IDs that are used solely to de-duplicate
 * webhook events.  ID document images and personal details are handled
 * entirely by the third-party verification provider and are never transmitted
 * to or stored on Vera infrastructure ("Verify & Shred").
 *
 * Schema (PostgreSQL):
 *
 *   CREATE TABLE users (
 *     id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     email_hash       TEXT UNIQUE NOT NULL,   -- bcrypt hash, NOT plaintext
 *     password_hash    TEXT NOT NULL,
 *     age_verified     BOOLEAN NOT NULL DEFAULT FALSE,
 *     subscription_active BOOLEAN NOT NULL DEFAULT FALSE,
 *     persona_inquiry_id  TEXT,               -- ephemeral, nulled after shred
 *     stripe_customer_id  TEXT,
 *     created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *   );
 */

const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const User = {
  /**
   * Create a new unverified user.  Only the email *hash* is stored.
   */
  async create({ emailHash, passwordHash, stripeCustomerId }) {
    const result = await pool.query(
      `INSERT INTO users (email_hash, password_hash, stripe_customer_id)
       VALUES ($1, $2, $3)
       RETURNING id, email_hash, age_verified, subscription_active, created_at`,
      [emailHash, passwordHash, stripeCustomerId || null]
    );
    return result.rows[0];
  },

  async findByEmailHash(emailHash) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email_hash = $1',
      [emailHash]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByPersonaInquiryId(inquiryId) {
    const result = await pool.query(
      'SELECT * FROM users WHERE persona_inquiry_id = $1',
      [inquiryId]
    );
    return result.rows[0] || null;
  },

  async findByStripeCustomerId(customerId) {
    const result = await pool.query(
      'SELECT * FROM users WHERE stripe_customer_id = $1',
      [customerId]
    );
    return result.rows[0] || null;
  },

  /**
   * Mark the user as age-verified and SHRED the persona inquiry reference.
   * After this call Vera holds zero personally-identifying information.
   */
  async markAgeVerifiedAndShred(id) {
    const result = await pool.query(
      `UPDATE users
       SET age_verified = TRUE, persona_inquiry_id = NULL
       WHERE id = $1
       RETURNING id, age_verified, subscription_active`,
      [id]
    );
    return result.rows[0] || null;
  },

  async setPersonaInquiryId(id, inquiryId) {
    await pool.query(
      'UPDATE users SET persona_inquiry_id = $1 WHERE id = $2',
      [inquiryId, id]
    );
  },

  async setSubscriptionActive(id, active) {
    const result = await pool.query(
      `UPDATE users SET subscription_active = $1 WHERE id = $2
       RETURNING id, age_verified, subscription_active`,
      [active, id]
    );
    return result.rows[0] || null;
  },
};

module.exports = { User, pool };
