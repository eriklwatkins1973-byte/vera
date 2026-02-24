'use strict';

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const verificationRoutes = require('./routes/verification');
const stripeWebhook = require('./webhooks/stripe');
const personaWebhook = require('./webhooks/persona');

const app = express();

// ─── Security middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// ─── Webhook routes (raw body required for signature verification) ─────────
app.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);
app.post(
  '/webhooks/persona',
  express.raw({ type: 'application/json' }),
  personaWebhook
);

// ─── JSON routes ──────────────────────────────────────────────────────────
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/verification', verificationRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Global error handler ─────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Vera API listening on port ${PORT}`));
}

module.exports = app;
