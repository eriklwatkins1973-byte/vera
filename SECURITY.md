# Security Policy for Vera

## 🛡️ Privacy by Design (PbD)
Vera is built on the principle of **Zero-Data Retention**. Our security architecture is specifically designed to minimize the attack surface by ensuring we never store high-value PII (Personally Identifiable Information).

### 1. Data Shredding Protocol
- All identity verification is handled via ephemeral API handshakes (Stripe Identity / Persona).
- Vera does not store ID images, birthdates, or legal names on internal databases.
- Automated webhooks trigger a `redact` command to third-party providers immediately upon successful verification.

### 2. Encryption Standards
- **In Transit:** All API communication is enforced via TLS 1.3.
- **At Rest:** Database fields use AES-256 encryption.
- **Authentication:** Passwordless-first approach utilizing Passkeys and secure biometric tokens (FaceID/Fingerprint).

### 3. Compliance Status (2026)
Vera is architected to meet the technical requirements of:
- **Bill C-63 (Canada):** Online Harms duty of care.
- **Bill S-210:** Age verification mandates.
- **GDPR/CCPA:** Right to be forgotten and data minimization.

## Reporting a Vulnerability
As Vera is currently an **Asset for Sale**, we encourage potential buyers to conduct their own independent security audits. If you discover a critical vulnerability in this prototype:
1. Please **do not** open a public issue.
2. Email your findings to: [Your Email Address]
3. We will acknowledge your report within 48 hours.

## Security Updates
This repository is a **Pre-Launch Prototype**. Security patches will be issued during the hand-off period to the acquiring party.
