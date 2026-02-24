'use strict';

/**
 * Unit tests for the Persona webhook helper functions.
 *
 * These tests focus on the business-critical age-verification logic and
 * the HMAC signature validation without requiring a live database or
 * external services.
 */

const crypto = require('crypto');
const {
  _isAgeVerified: isAgeVerified,
  _verifyPersonaSignature: verifyPersonaSignature,
} = require('../../src/webhooks/persona');

describe('isAgeVerified', () => {
  it('returns true for someone born exactly 18 years ago', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 18);
    dob.setDate(dob.getDate() - 1); // one day past the 18th birthday
    expect(isAgeVerified(dob.toISOString())).toBe(true);
  });

  it('returns false for someone who is 17 years old', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 17);
    expect(isAgeVerified(dob.toISOString())).toBe(false);
  });

  it('returns false for an invalid date string', () => {
    expect(isAgeVerified('not-a-date')).toBe(false);
  });

  it('returns false when birthdate is undefined', () => {
    expect(isAgeVerified(undefined)).toBe(false);
  });

  it('returns false when birthdate is null', () => {
    expect(isAgeVerified(null)).toBe(false);
  });

  it('returns true for someone who is 80 years old', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 80);
    expect(isAgeVerified(dob.toISOString())).toBe(true);
  });
});

describe('verifyPersonaSignature', () => {
  const secret = 'test_persona_secret';
  const originalEnv = process.env.PERSONA_WEBHOOK_SECRET;

  beforeAll(() => {
    process.env.PERSONA_WEBHOOK_SECRET = secret;
  });

  afterAll(() => {
    process.env.PERSONA_WEBHOOK_SECRET = originalEnv;
  });

  function buildRequest(body, timestamp, digest) {
    const bodyBuffer = Buffer.from(body, 'utf8');
    return {
      body: bodyBuffer,
      headers: {
        'persona-signature': `t=${timestamp},v1=${digest}`,
      },
    };
  }

  it('returns true for a valid signature', () => {
    const body = JSON.stringify({ data: { attributes: { name: 'inquiry.completed' } } });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signedPayload = `${timestamp}.${body}`;
    const digest = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

    const req = buildRequest(body, timestamp, digest);
    expect(verifyPersonaSignature(req)).toBe(true);
  });

  it('returns false for a tampered body', () => {
    const body = JSON.stringify({ data: { attributes: { name: 'inquiry.completed' } } });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signedPayload = `${timestamp}.${body}`;
    const digest = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

    const tamperedBody = JSON.stringify({ data: { attributes: { name: 'inquiry.expired' } } });
    const req = buildRequest(tamperedBody, timestamp, digest);
    expect(verifyPersonaSignature(req)).toBe(false);
  });

  it('returns false when the Persona-Signature header is missing', () => {
    const req = {
      body: Buffer.from('{}'),
      headers: {},
    };
    expect(verifyPersonaSignature(req)).toBe(false);
  });

  it('returns false when PERSONA_WEBHOOK_SECRET is not set', () => {
    process.env.PERSONA_WEBHOOK_SECRET = '';
    const req = {
      body: Buffer.from('{}'),
      headers: { 'persona-signature': 't=1,v1=abc' },
    };
    expect(verifyPersonaSignature(req)).toBe(false);
    process.env.PERSONA_WEBHOOK_SECRET = secret;
  });
});
