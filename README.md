# ep_pads_api

A clean **JSON API** for Etherpad that answers something the built-in HTTP API
cannot: **which pads exist**, who **created** each one, and when it was **last
edited**.

It returns **data only** — no UI. Build your own dashboard, landing page or site
against it.

Companion plugins (each does one thing):

- **[ep_pads_view](https://www.npmjs.com/package/ep_pads_view)** — a ready-made
  HTML page on top of this API, if you don't want to write a frontend.
- **[ep_current_user](https://www.npmjs.com/package/ep_current_user)** — a
  `whoami` endpoint for the current logged-in user.

## Endpoints

Default prefix is `/pads-api` (configurable, see below).

### `GET /pads-api/pads`

```json
{
  "pads": [
    { "id": "Team-Notes", "lastEdited": "2026-06-15", "lastEditedTs": 1750000000000, "creator": "Ivan Forkaliuk" },
    { "id": "Sprint-Plan", "lastEdited": "2026-05-02", "lastEditedTs": 1746100000000, "creator": null }
  ]
}
```

- `creator` is the author of the pad's first revision; `null` for anonymous.
- `lastEdited` is an ISO date (`YYYY-MM-DD`) for display; `null` if unknown.
- `lastEditedTs` is the full last-edit timestamp in epoch milliseconds (for precise sorting); `null` if unknown.

## Why this exists (vs the built-in API)

Etherpad's official `/api/1/...` has no method for the **creator** (author of
revision 0) — only `listAuthorsOfPad`, which returns everyone who ever edited the
pad, with no way to tell who created it.

`ep_pads_api` runs inside Etherpad and reads this via the official managers
(`PadManager`, `AuthorManager`, `DB`), so you don't need direct database access
from your own app.

## Configuration

All optional. In `settings.json`:

```json
"ep_pads_api": {
  "requireAuth": true,
  "basePath": "/pads-api"
}
```

| Option        | Default      | Meaning                                                        |
|---------------|--------------|----------------------------------------------------------------|
| `requireAuth` | `true`       | Only logged-in users may call the endpoints. Set `false` to open them. |
| `basePath`    | `/pads-api`  | URL prefix for the endpoints.                                  |

## Requirements

- **Etherpad** (`ep_etherpad-lite`) — no other plugin is required.
- With the default `requireAuth: true`, callers must be **logged in**, so you
  need an authentication method (e.g.
  [`ep_openid_connect`](https://www.npmjs.com/package/ep_openid_connect)); set
  `requireAuth: false` to leave the endpoints open.

## Install

```sh
cd /path/to/etherpad
pnpm run plugins i ep_pads_api
```

## Notes

- `listAllPads()` scans all pads on each `/pads` call. For very large instances
  consider putting a short-lived cache in front (planned).
- License: Apache-2.0.
