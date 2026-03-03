const { uploadVeraClip, scheduleVideoShred } = require('./videoService');

function requireAppMethod(app, methodName) {
  if (!app || typeof app[methodName] !== 'function') {
    throw new TypeError(`registerVideoRoutes expects app.${methodName} to be a function`);
  }
}

function registerVideoRoutes(app) {
  requireAppMethod(app, 'post');

  app.post('/api/video/upload', async (req, res) => {
    try {
      const { filePath, userId } = req.body || {};

      const playbackId = await uploadVeraClip(filePath, userId);

      return res.status(201).json({
        ok: true,
        playbackId,
      });
    } catch (error) {
      return res.status(400).json({
        ok: false,
        error: error.message,
      });
    }
  });

  app.post('/api/video/schedule-shred', async (req, res) => {
    try {
      const { assetId, isSaved = false } = req.body || {};

      const result = await scheduleVideoShred(assetId, { isSaved });

      return res.status(200).json({
        ok: true,
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        ok: false,
        error: error.message,
      });
    }
  });
}

module.exports = {
  registerVideoRoutes,
};
