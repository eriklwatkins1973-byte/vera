# Vera | Technical & Operational Transition Guide
**Target Audience:** Acquiring Engineering/Operations Team

This document outlines the 4-step process for transferring all Vera assets from the Seller to the Buyer.

## 1. Codebase Transfer (GitHub)
The Vera codebase is hosted on GitHub. To transfer ownership:
1. Navigate to `Repository Settings > Danger Zone`.
2. Select **Transfer Ownership**.
3. Enter the Buyer's GitHub username/Organization.
4. *Note:* All commit history, issues, and documentation will remain intact.

## 2. Infrastructure & API Handover
Vera utilizes a "Verify & Shred" architecture. The following accounts must be transitioned:
- **Stripe Identity:** The Buyer must be added as a 'Team Administrator' in the Stripe Dashboard. Once confirmed, ownership will be transferred to the Buyer’s legal entity.
- **Domain Registry:** The domain `[YourVeraDomain].ca/.com` will be pushed to the Buyer's registrar (e.g., GoDaddy, Namecheap) via EPP/Authorization code.
- **Hosting:** If utilizing Vercel/Netlify for the landing page, the project will be transferred via the platform's 'Transfer Project' feature.

## 3. Environment Secrets
Upon sale, a `secrets.env` template will be provided containing:
- `STRIPE_SECRET_KEY` (For verification logic)
- `DATABASE_URL` (For the PostgreSQL instance)
- `ID_WEBHOOK_SECRET` (For the shredding handshake)

## 4. Post-Sale Support (The "Handoff")
To ensure a seamless transition, the Seller offers:
- **Phase A (Week 1):** Two 60-minute technical deep-dives with the Buyer's lead engineer.
- **Phase B (Week 2):** As-needed email support for environment configuration.
- **Phase C (Final):** Formal sign-off and removal of Seller from all admin seats.

---
**Disclaimer:** Vera is sold as-is. Post-transition development and legal compliance monitoring are the responsibility of the Buyer.
