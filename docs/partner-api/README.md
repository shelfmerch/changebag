# Partner API (Developer Docs)

This folder contains everything you need to integrate a third-party app with the **Changebag Partner API**.

## Quick start

### 1) Get an API key

- API keys are issued per business (per customer app).
- Keys can be created by an admin via:
  - `POST /api/admin/api-partners` (admin JWT required)
  - or the server script: `npm --prefix server run create-api-partner -- <businessName> <businessEmail> <contactName> [rateLimitPerMinute]`

### 2) Call the API

Send your key as `X-API-Key`.

```bash
curl -s \
  -H "X-API-Key: YOUR_API_KEY" \
  "https://api.changebag.org/api/partner/causes?page=1&limit=25"
```

## Base URLs

Recommended (namespaced):

- `https://api.changebag.org/api/partner`

Compatibility alias (no `/api`):

- `https://api.changebag.org/partner`

Public causes aliases (if you want a simpler path for customers):

- `https://api.changebag.org/api/causes`
- `https://api.changebag.org/causes`

## Endpoints

### `POST /api/partner/register`

Self-service registration. Returns an API key immediately (treat it like a password).

```bash
curl -s \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Acme Inc","businessEmail":"dev@acme.com","contactName":"Jane Doe"}' \
  "https://api.changebag.org/api/partner/register"
```

### `GET /api/partner/me`

Validate your API key and see your partner metadata.

### `GET /api/partner/causes`

Fetch causes from the database.

**Query params**

- `page` (default `1`)
- `limit` (default `25`, max `100`)
- `search` (searches `title` and `description`)
- `category`
- `isOnline` (`true` / `false`)

**Response**

- `success`: boolean
- `page`, `limit`, `total`, `totalPages`, `count`
- `causes`: array of objects:
  - `causeId`, `causeTitle`, `description`, `imageUrl`, `category`, `status`, `isOnline`
  - `totalTotes`, `claimedTotes`, `availableTotes`
  - `sponsorUrl`, `claimUrl`, `causeUrl`, `waitlistUrl` — full Changebag URLs for partner apps to link to
  - `createdAt`, `updatedAt`

**Adding Sponsor & Claim buttons**

Each cause includes `sponsorUrl`, `claimUrl`, `causeUrl`, and `waitlistUrl`. Use them to link users to Changebag:

- **Claim a Tote** — show when `availableTotes > 0`. Link to `claimUrl`. Open in new tab.
- **Sponsor This Cause** — always available. Link to `sponsorUrl`. Open in new tab.
- **Join Waitlist** — for causes with no totes. Link to `waitlistUrl`.

## Rate limits

Rate limiting is enforced per API key (per partner). The default is **60 requests/min**.

You can override per partner with `rateLimitPerMinute` when creating the partner.

When you hit the limit you’ll receive HTTP `429` and a JSON body containing `retryAfterSeconds`.

## Versioning & stability

- Current endpoints are treated as **v1**.
- Breaking changes should be introduced under a new path (e.g. `/api/partner/v2/...`).

## Files included

- `openapi.yaml`: OpenAPI spec you can import into Postman/Insomnia
- `postman_collection.json`: ready-to-import Postman collection

