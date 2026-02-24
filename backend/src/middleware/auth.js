'use strict';

const jwt = require('jsonwebtoken');

/**
 * Express middleware that verifies the JWT from the Authorization header.
 * Attaches `req.user = { id, age_verified, subscription_active }` on success.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware that additionally requires age verification AND an active
 * subscription before allowing access to protected social features.
 */
function requireVerifiedSubscriber(req, res, next) {
  authenticate(req, res, () => {
    if (!req.user.age_verified) {
      return res.status(403).json({ error: 'Age verification required' });
    }
    if (!req.user.subscription_active) {
      return res.status(403).json({ error: 'Active subscription required' });
    }
    return next();
  });
}

module.exports = { authenticate, requireVerifiedSubscriber };
