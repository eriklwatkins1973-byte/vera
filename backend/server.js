const express = require('express');
const { registerVideoRoutes } = require('./videoRoutes');

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'vera-backend' });
});

registerVideoRoutes(app);

const port = Number(process.env.PORT || 3000);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`[VERA BACKEND] API listening on port ${port}`);
  });
}

module.exports = {
  app,
};
