/**
 * VERA SENTINEL: News Source Verification
 * Only allows whitelisted news orgs to push to the feed.
 */

const NEWS_WHITELIST = Object.freeze(['GlobeAndMail', 'CBC_Verified', 'TheGuardian_CA']);

let billingService = {
  checkNewsOrgStatus: async () => false,
};

const sourceApiKeys = new Map();

function setBillingService(service) {
  if (!service || typeof service.checkNewsOrgStatus !== 'function') {
    throw new TypeError('setBillingService expects an object with checkNewsOrgStatus(sourceId)');
  }

  billingService = service;
}

function setSourceApiKey(sourceId, apiKey) {
  if (!NEWS_WHITELIST.includes(sourceId)) {
    throw new Error('SENTINEL_REJECT: Unauthorized news source.');
  }

  if (!apiKey || typeof apiKey !== 'string') {
    throw new TypeError('setSourceApiKey expects a non-empty apiKey string');
  }

  sourceApiKeys.set(sourceId, apiKey);
}

function isApiKeyValid(sourceId, apiKey) {
  const expectedApiKey = sourceApiKeys.get(sourceId);

  if (!expectedApiKey) {
    return false;
  }

  return expectedApiKey === apiKey;
}

async function validateNewsSource(sourceId, apiKey) {
  if (!NEWS_WHITELIST.includes(sourceId)) {
    throw new Error('SENTINEL_REJECT: Unauthorized news source.');
  }

  if (!isApiKeyValid(sourceId, apiKey)) {
    throw new Error('SENTINEL_REJECT: Invalid source credentials.');
  }

  const hasAccess = await billingService.checkNewsOrgStatus(sourceId);

  if (!hasAccess) {
    throw new Error('SENTINEL_REJECT: Platform fee status invalid.');
  }

  return true;
}

module.exports = {
  NEWS_WHITELIST,
  validateNewsSource,
  setBillingService,
  setSourceApiKey,
};
