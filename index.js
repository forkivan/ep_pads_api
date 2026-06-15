'use strict';

const settings = require('ep_etherpad-lite/node/utils/Settings');
const { collectPads, getUser } = require('./lib/data');

// Config (settings.json -> "ep_pads_api": { ... }). All optional.
//   requireAuth : only logged-in users may call the API (default true)
//   basePath    : URL prefix for the endpoints           (default "/pads-api")
const cfg = settings.ep_pads_api || {};
const requireAuth = cfg.requireAuth !== false;
const basePath = String(cfg.basePath || '/pads-api').replace(/\/+$/, '');

exports.expressCreateServer = (hookName, context) => {
  const app = context.app;

  // Gate: when requireAuth is on, reject anyone without a logged-in session.
  const gate = (req, res, next) => {
    if (!requireAuth) return next();
    if (!getUser(req)) return res.status(401).json({ error: 'authentication required' });
    next();
  };

  // GET /pads-api/pads -> [{ id, lastEdited, creator }]
  app.get(`${basePath}/pads`, gate, async (req, res) => {
    try {
      const pads = await collectPads();
      res.set('Cache-Control', 'no-store');
      res.json({ pads });
    } catch (err) {
      console.error('[ep_pads_api] /pads failed:', err);
      res.status(500).json({ error: 'internal error' });
    }
  });
};
