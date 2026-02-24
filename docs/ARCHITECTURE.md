# Vera – Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile Client                            │
│             (React Native – iOS & Android)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / JWT
           ┌─────────────▼──────────────┐
           │      Vera API (Node.js)     │
           │   /api/auth                │
           │   /api/payment             │
           │   /api/verification        │
           └──────┬──────────┬──────────┘
                  │          │
        ┌─────────▼──┐  ┌────▼──────────────┐
        │ PostgreSQL │  │  Webhooks          │
        │ (no PII)   │  │  /webhooks/stripe  │
        └────────────┘  │  /webhooks/persona │
                        └────────────────────┘
                               ▲         ▲
                               │         │
                    ┌──────────┤         ├──────────────┐
                    │  Stripe  │         │   Persona    │
                    │ Identity │         │    (Age      │
                    │ Payments │         │ Verification)│
                    └──────────┘         └──────────────┘
```

## The "Verify & Shred" Protocol

The core privacy guarantee:

1. **Register** – user creates an account.  Only a bcrypt hash of their email
   and a bcrypt hash of their password are stored.  Zero PII.

2. **Pay** – user completes the one-time $3.99 CAD join fee via Stripe.
   Stripe handles card/Apple Pay/Google Pay processing; Vera never sees
   payment card details.

3. **Verify** – user completes the Persona age-verification flow inside a
   secure in-app WebView.  All document capture and biometric liveness
   checks occur within Persona's infrastructure.  The only data Vera
   temporarily stores is the Persona `inquiry_id` (an opaque string) used
   to correlate the incoming webhook.

4. **Shred** – when Persona sends the `inquiry.completed` webhook:
   - Vera checks the `age_verified` status (18+ confirmed).
   - Sets `users.age_verified = TRUE`.
   - **Sets `users.persona_inquiry_id = NULL`** – the only link to the
     identity check is erased.
   - Vera now holds: `{ id, email_hash, password_hash, age_verified=TRUE }`.
     No name, no DOB, no document reference – nothing that a data breach
     could expose.

5. **Subscribe** – user activates the $0.99/month subscription.  Access to
   the social features is gated by `age_verified AND subscription_active`.

## Database Schema

See [`/backend/src/db/schema.sql`](../backend/src/db/schema.sql).

Key design choices:
- `email_hash` – bcrypt hash of the lowercase email.  Used for login
  without ever storing the address in recoverable form.
- `persona_inquiry_id` – nullable; set during verification, nulled after shred.
- No `name`, `address`, `birthdate`, `national_id`, or similar columns exist.

## Security Notes

| Concern | Mitigation |
|---|---|
| Webhook forgery | HMAC-SHA256 signature verification on every Stripe and Persona event |
| Token theft | Short-lived JWTs (7 days); re-issue on sensitive changes |
| Brute-force | `express-rate-limit` on all API routes (100 req / 15 min) |
| Timing attacks | `bcrypt.compare` constant-time for password checks |
| PII in breach | Zero PII stored post-shred; bcrypt hashes are not reversible |
| Bot farms | $3.99 + ID wall makes automation economically non-viable |
