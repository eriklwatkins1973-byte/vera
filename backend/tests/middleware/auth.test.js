'use strict';

/**
 * Integration-style tests for the auth middleware.
 * The JWT secret is set via process.env before requiring the module.
 */

process.env.JWT_SECRET = 'test_jwt_secret_for_unit_tests';
process.env.DATABASE_URL = 'postgres://localhost/vera_test'; // won't be connected

const jwt = require('jsonwebtoken');
const { authenticate, requireVerifiedSubscriber } = require('../../src/middleware/auth');

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('authenticate middleware', () => {
  it('calls next() for a valid JWT', () => {
    const token = jwt.sign({ id: 'user-1', age_verified: true, subscription_active: true }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe('user-1');
  });

  it('returns 401 when no token is provided', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for an invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalidtoken' } };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for an expired token', () => {
    const token = jwt.sign({ id: 'user-1' }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('requireVerifiedSubscriber middleware', () => {
  it('returns 403 when user is not age-verified', () => {
    const token = jwt.sign(
      { id: 'user-2', age_verified: false, subscription_active: true },
      process.env.JWT_SECRET
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    requireVerifiedSubscriber(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when user does not have an active subscription', () => {
    const token = jwt.sign(
      { id: 'user-3', age_verified: true, subscription_active: false },
      process.env.JWT_SECRET
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    requireVerifiedSubscriber(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() for a fully verified subscriber', () => {
    const token = jwt.sign(
      { id: 'user-4', age_verified: true, subscription_active: true },
      process.env.JWT_SECRET
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    requireVerifiedSubscriber(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
