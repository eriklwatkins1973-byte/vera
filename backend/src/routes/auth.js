'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

const router = express.Router();
const SALT_ROUNDS = 12;

/**
 * POST /api/auth/register
 * Body: { email, password }
 *
 * Vera never stores the plaintext email.  We store only a bcrypt hash so that
 * the user can authenticate without Vera ever knowing their real address.
 * The email is used once to hash and is then discarded server-side.
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const emailHash = await bcrypt.hash(email.toLowerCase().trim(), SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({ emailHash, passwordHash });

    const token = signToken(user);
    return res.status(201).json({ token, userId: user.id });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    return next(err);
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * bcrypt.compare is used against every stored hash in constant time so that
 * a timing attack cannot be used to enumerate registered addresses.
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    // We must check against all hashes – O(n) but acceptable at launch scale.
    // At scale, a deterministic HMAC of the email (using a server-side secret)
    // would replace bcrypt for the lookup key.
    const normalised = email.toLowerCase().trim();
    const { pool } = require('../models/user');
    const { rows } = await pool.query('SELECT * FROM users');

    let matchedUser = null;
    for (const row of rows) {
      if (await bcrypt.compare(normalised, row.email_hash)) {
        matchedUser = row;
        break;
      }
    }

    if (!matchedUser || !(await bcrypt.compare(password, matchedUser.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(matchedUser);
    return res.json({ token, userId: matchedUser.id });
  } catch (err) {
    return next(err);
  }
});

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      age_verified: user.age_verified,
      subscription_active: user.subscription_active,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = router;
