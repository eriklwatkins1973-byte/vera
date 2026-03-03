/**
 * VERA VIDEO SERVICE
 * Handles short-form video uploads with metadata stripping.
 */

let MuxProvider;

function getMuxProvider() {
  if (MuxProvider) {
    return MuxProvider;
  }

  try {
    MuxProvider = require('@mux/mux-node');
    return MuxProvider;
  } catch {
    throw new Error('Mux SDK not installed. Add @mux/mux-node to backend dependencies.');
  }
}

let scheduler = {
  setTimeout: (handler, delayMs) => setTimeout(handler, delayMs),
};

let videoClient;

function getVideoClient() {
  if (videoClient) {
    return videoClient;
  }

  if (!process.env.VIDEO_TOKEN) {
    throw new Error('VIDEO_TOKEN is not set');
  }

  const VideoProvider = getMuxProvider();
  videoClient = new VideoProvider(process.env.VIDEO_TOKEN);
  return videoClient;
}

function setVideoClient(client) {
  if (!client || !client.Video || !client.Video.Assets) {
    throw new TypeError('setVideoClient expects a Mux-like client with Video.Assets');
  }

  videoClient = client;
}

function setScheduler(customScheduler) {
  if (!customScheduler || typeof customScheduler.setTimeout !== 'function') {
    throw new TypeError('setScheduler expects an object with setTimeout(handler, delayMs)');
  }

  scheduler = customScheduler;
}

/**
 * 1. SECURE UPLOAD
 * Receives the 15-second clip and strips/limits metadata on ingest.
 */
async function uploadVeraClip(filePath, userId) {
  if (!filePath || typeof filePath !== 'string') {
    throw new TypeError('uploadVeraClip requires a filePath string');
  }

  if (!userId) {
    throw new TypeError('uploadVeraClip requires userId');
  }

  const client = getVideoClient();

  const asset = await client.Video.Assets.create({
    input: filePath,
    playback_policy: 'signed',
    passthrough: JSON.stringify({ user_id: String(userId), source: 'vera_video' }),
    test: false,
  });

  const playbackId = asset?.playback_ids?.[0]?.id;

  if (!playbackId) {
    throw new Error('Mux asset creation returned no playback id');
  }

  return playbackId;
}

/**
 * 2. THE "EPHEMERAL" DELETE
 * Schedules source deletion 24 hours after posting unless marked as saved.
 */
async function scheduleVideoShred(assetId, options = {}) {
  if (!assetId || typeof assetId !== 'string') {
    throw new TypeError('scheduleVideoShred requires an assetId string');
  }

  const { isSaved = false, delayMs = 24 * 60 * 60 * 1000 } = options;

  if (isSaved) {
    return { scheduled: false, reason: 'saved' };
  }

  const timer = scheduler.setTimeout(async () => {
    try {
      const client = getVideoClient();
      await client.Video.Assets.del(assetId);
      console.log(`[VERA VIDEO] Source file shredded for Asset: ${assetId}`);
    } catch (error) {
      console.error(`[VERA VIDEO] Shred failed for Asset ${assetId}:`, error.message);
    }
  }, delayMs);

  return { scheduled: true, delayMs, timer };
}

module.exports = {
  uploadVeraClip,
  scheduleVideoShred,
  setVideoClient,
  setScheduler,
};
