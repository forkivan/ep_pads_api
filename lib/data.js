'use strict';

// Reusable data layer for ep_pads_api. Kept separate from index.js so other
// plugins (e.g. ep_pads_view) can require it directly and reuse the exact same
// logic in-process, without going over HTTP.

const padManager = require('ep_etherpad-lite/node/db/PadManager');
const authorManager = require('ep_etherpad-lite/node/db/AuthorManager');
const db = require('ep_etherpad-lite/node/db/DB');

// Read pad list with creator (author of revision 0) and last-edited date.
// Returns: [{ id, lastEdited, creator }]
async function collectPads() {
  const { padIDs } = await padManager.listAllPads();
  const pads = [];

  for (const id of padIDs) {
    let lastEdited = null;
    let creator = null;

    try {
      const pad = await padManager.getPad(id);
      const ts = await pad.getLastEdit();
      if (ts) lastEdited = new Date(ts).toISOString().slice(0, 10);
    } catch (e) { /* skip unreadable pad metadata */ }

    try {
      // The creator is the author of the very first revision.
      const rev0 = await db.get(`pad:${id}:revs:0`);
      const authorId = rev0 && rev0.meta && rev0.meta.author;
      if (authorId) creator = await authorManager.getAuthorName(authorId);
    } catch (e) { /* anonymous / missing author */ }

    pads.push({ id, lastEdited, creator });
  }

  return pads;
}

// Extract the logged-in user from the request session. Populated by auth
// plugins such as ep_openid_connect (which sets req.session.user). Returns null
// when nobody is authenticated.
function getUser(req) {
  const u = req && req.session && req.session.user;
  if (!u) return null;

  const displayName =
    u.displayname || u.name || (u.userinfo && u.userinfo.name) || null;
  const sub =
    u.username || u.sub || (u.userinfo && u.userinfo.sub) || null;

  if (!displayName && !sub) return null;
  return { displayName, sub };
}

exports.collectPads = collectPads;
exports.getUser = getUser;
