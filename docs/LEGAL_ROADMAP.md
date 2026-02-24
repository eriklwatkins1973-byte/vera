# Vera – Legal & Regulatory Roadmap

## Applicable Legislation (Canada)

| Act | Relevance | Vera Compliance |
|---|---|---|
| **Online Harms Act (Bill C-63)** | Platforms must take reasonable steps to protect minors from harmful content | Mandatory 18+ ID verification on registration blocks all minor access |
| **PIPEDA / Quebec Law 25** | Personal information must be limited to what is necessary | "Verify & Shred" architecture stores zero PII post-verification |
| **CASL** | Electronic commercial messages require express consent | Vera does not send marketing email; transactional messages only |
| **Criminal Code s.163.1** | Child sexual abuse material offences | Adult-only verified userbase + content moderation pipeline |

## Privacy-by-Design Principles (Per OPC Framework)

1. **Proactive not reactive** – privacy built into the data model from day one.
2. **Privacy as the default** – no optional data collection; all fields are
   necessary for platform operation.
3. **Privacy embedded into design** – the "Verify & Shred" protocol is
   architecturally enforced, not a policy choice.
4. **Full functionality** – zero-sum trade-off between privacy and functionality
   is avoided; users get full social features with zero PII exposure.
5. **End-to-end security** – bcrypt hashing, HTTPS, HMAC webhook verification.
6. **Visibility and transparency** – open-source architecture, documented data
   model, no hidden collection.
7. **Respect for user privacy** – users can delete their account and all
   associated data with a single request.

## Data Retention Policy

| Data Element | Retention |
|---|---|
| `email_hash` | Until account deletion |
| `password_hash` | Until account deletion |
| `age_verified` (boolean) | Until account deletion |
| `persona_inquiry_id` | **Deleted immediately after verification** |
| `stripe_customer_id` | Until account deletion (Stripe controls underlying data) |
| Server logs | 30 days, no PII logged |

## Liability Reduction

The "Verify & Shred" model means that even a complete database breach would
expose **no personally identifying information**.  The bcrypt-hashed email
cannot be reversed without the original plaintext and is not exposed to Vera
employees.

## Roadmap

- [ ] Obtain Privacy Impact Assessment (PIA) from qualified Canadian privacy counsel
- [ ] Register as a platform under the Online Harms Act when regulations are finalized
- [ ] Integrate Digital ID (DIACC Pan-Canadian Trust Framework) as an alternative verifier
- [ ] Third-party security audit (SOC 2 Type II)
- [ ] CSAM detection pipeline (PhotoDNA or equivalent)
- [ ] Establish Trust & Safety team before public launch
