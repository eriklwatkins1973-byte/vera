# Vera | The Sovereign Adult Social Network

<div align="center">
	<img src="https://via.placeholder.com/150" alt="Vera Logo" width="120" />
	<p><b>Verified. Ad-Free. Adults Only.</b></p>
	<p><i>The solution to Canada's digital sovereignty and online harms mandates.</i></p>
</div>

---

## 🚀 The Vision
**Vera** is a turnkey social media architecture designed for the 2026 regulatory landscape. It addresses two of the industry's largest liabilities: **minor safety** and **data privacy**.

By enforcing a strict **Verify & Shred** entry protocol, Vera enables 100% human, adult-only interactions while maintaining a zero-knowledge data footprint.

## 💎 Key Value Propositions
- **Regulatory fortified:** Built-in compliance posture for Canada's **Online Harms Act (Bill C-63)** through mandatory 18+ verification.
- **Zero-data architecture:** Uses ephemeral verification APIs to confirm adulthood without storing sensitive ID documents, reducing legal liability.
- **Sustainability:** A pay-to-join model ($3.99) and micro-subscription ($0.99/mo) remove dependency on invasive ad-tech.
- **Anti-bot integrity:** The combined cost and ID wall make bot farms and coordinated inauthenticity mathematically non-viable.

## 🛠 Tech Stack & Architecture
- **Frontend:** React Native or Flutter (cross-platform iOS/Android)
- **Identity gateway:** Stripe Identity and Persona integration (Verify & Shred logic)
- **Payments:** Apple Pay / Google Pay native integration
- **Storage:** Encrypted PostgreSQL with minimalist schema (no personal PII stored)

## 📁 Repository Structure
```text
.
├── docs/       # Business plan, legal roadmap, and pitch deck
├── frontend/   # Mobile app UI mockups and components
├── backend/    # Verify & Shred API logic and webhooks
└── assets/     # Brand identity, logos, and Figma exports
```

## 📚 Business Docs Index
- [Revenue Architecture](docs/revenue-architecture.md)
- [Strategic IP & Regulatory Compliance Whitepaper](docs/strategic-ip-regulatory-compliance-whitepaper.md)
- [Technical & Operational Transition Guide](docs/technical-operational-transition-guide.md)
- [Strategic Value & Regulatory Moat](docs/strategic-value-regulatory-moat.md)
- [The "Born-Compliant" Advantage](docs/born-compliant-advantage.md)


## 🔧 Backend API Quickstart

Run the backend API:

```bash
cd backend
npm install
VIDEO_TOKEN=your_mux_token npm start
```

Health check:

```bash
curl -s http://localhost:3000/health
```

Upload a clip (returns playback ID):

```bash
curl -s -X POST http://localhost:3000/api/video/upload \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "https://storage.example.com/uploads/clip.mp4",
    "userId": "user_123"
  }'
```

Schedule 24-hour shred unless saved:

```bash
curl -s -X POST http://localhost:3000/api/video/schedule-shred \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "asset_abc123",
    "isSaved": false
  }'
```
