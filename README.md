# Vera — The Sovereign Adult Social Network

> **Verified. Ad-Free. Adults Only.**
> *Canada's answer to Digital Sovereignty and the Online Harms Act.*

---

## 🚀 The Vision

**Vera** is a turnkey social media architecture designed for the 2026 regulatory landscape.
It solves the industry's two greatest liabilities — **Minor Safety** and **Data Privacy** — by
enforcing a strict "Verify & Shred" entry protocol.

Every user is a **confirmed adult human**. No bots. No minors. No ads. No data harvesting.

---

## 💎 Key Value Propositions

| Feature | Detail |
|---|---|
| **Regulatory fortified** | Built-in compliance with Canada's **Online Harms Act (Bill C-63)** via mandatory 18+ ID verification |
| **Zero-data architecture** | "Verify & Shred" — ID documents are processed by Persona and never reach Vera's servers |
| **Sustainable revenue** | $3.99 CAD one-time join fee + $0.99/month subscription; zero dependency on ad-tech |
| **Anti-bot integrity** | The cost + ID wall makes bot farms economically non-viable |

---

## 🔐 The "Verify & Shred" Protocol

```
Register → Pay ($3.99) → Verify (Persona) → Shred inquiry ID → Access granted
```

1. User registers with an email and password — only bcrypt hashes are stored.
2. User pays the one-time $3.99 CAD join fee via Stripe (Apple Pay / Google Pay supported).
3. User completes an age check inside a secure in-app WebView powered by Persona.
4. Persona sends a webhook to Vera confirming the user is 18+.
5. Vera sets `age_verified = TRUE` and **nulls the `persona_inquiry_id`** — the only link to the identity check is erased ("Shred").
6. After subscription activation the user has full platform access. Vera holds zero PII.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native (iOS + Android) |
| Backend API | Node.js + Express |
| Identity Gateway | [Stripe Identity](https://stripe.com/identity) + [Persona](https://withpersona.com) |
| Payments | Stripe (Apple Pay / Google Pay native) |
| Database | PostgreSQL — minimalist schema, no PII columns |

---

## 📁 Repository Structure

```text
├── /backend          # "Verify & Shred" API (Node.js/Express)
│   ├── src/
│   │   ├── server.js             # Express entry point
│   │   ├── routes/               # auth, payment, verification
│   │   ├── webhooks/             # stripe.js, persona.js
│   │   ├── models/user.js        # Minimal user model (no PII)
│   │   ├── middleware/auth.js    # JWT + verified-subscriber guard
│   │   └── db/schema.sql         # PostgreSQL schema
│   ├── tests/                    # Jest unit + integration tests
│   └── .env.example
│
├── /frontend         # React Native mobile app
│   ├── App.js
│   └── src/
│       ├── navigation/           # Stack navigator
│       ├── screens/              # Onboarding, Payment, Verification, Home
│       └── components/           # VerificationBadge, AgeGateModal
│
├── /docs
│   ├── ARCHITECTURE.md           # System design + Verify & Shred deep-dive
│   ├── BUSINESS_PLAN.md          # Revenue model, market analysis
│   └── LEGAL_ROADMAP.md          # Bill C-63, PIPEDA, privacy-by-design
│
└── /assets
    └── brand/BRAND_GUIDE.md      # Colours, typography, voice & tone
```

---

## 🚀 Getting Started

### Backend

```bash
cd backend
cp .env.example .env   # fill in your Stripe + Persona keys
npm install
npm run dev            # starts on http://localhost:3000
```

### Run tests

```bash
cd backend
npm test
```

### Database

```bash
psql $DATABASE_URL -f backend/src/db/schema.sql
```

---

## 📖 Further Reading

- [Architecture & Verify & Shred deep-dive](docs/ARCHITECTURE.md)
- [Legal & Regulatory Roadmap](docs/LEGAL_ROADMAP.md)
- [Business Plan](docs/BUSINESS_PLAN.md)
- [Brand Guide](assets/brand/BRAND_GUIDE.md)
