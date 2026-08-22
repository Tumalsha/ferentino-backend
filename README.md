# Ferentino Backend

Express + MongoDB API backing the Ferentino Price Analyzer. Replaces the
frontend's localStorage-only data with real server-side storage (shared
across every device and browser) and real authentication (hashed
passwords + JWT, replacing the old client-side-only login check).

## 1. Set up MongoDB Atlas (free tier is enough for this)

1. Go to https://www.mongodb.com/cloud/atlas and create a free account.
2. Create a free ("M0") cluster.
3. Under Database Access, create a database user with a password.
4. Under Network Access, add `0.0.0.0/0` (allow from anywhere) — simplest
   for a small internal tool; tighten later if needed.
5. Click "Connect" → "Drivers" → copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/`

## 2. Local setup

```
npm install
cp .env.example .env
```

Edit `.env`:
- Paste your MongoDB connection string into `MONGODB_URI` (add `/ferentino` before the `?` to name the database).
- Generate a `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- Set `SEED_ADMIN_USERNAME` and `SEED_ADMIN_PASSWORD` to your real admin login.

## 3. Seed the database

```
npm run seed
```

This creates your admin user (hashed, never stored in plain text) and
pre-fills default discount rates for every category × brand combination.
Safe to re-run — it skips anything that already exists.

**After seeding succeeds, remove `SEED_ADMIN_USERNAME`/`SEED_ADMIN_PASSWORD`
from `.env`** so the plain-text password isn't left sitting in a file.

## 4. Run it

```
npm run dev
```

Visit `http://localhost:4000/health` — should return `{"status":"ok"}`.

## 5. Deploy

This is a standard long-running Node/Express server, so it needs a host
that keeps a process running (unlike the static Vercel frontend). Render
or Railway both have simple free/low-cost tiers:

1. Push this folder to its own GitHub repo.
2. On Render (or Railway): "New Web Service" → connect the repo.
3. Build command: `npm install` — Start command: `npm start`.
4. Add the same environment variables from `.env` (except the SEED_ ones)
   in the host's dashboard.
5. Once deployed, run the seed step once via the host's shell/console, or
   temporarily add the SEED_ vars, redeploy, then remove them again.
6. Update `CORS_ORIGIN` to include your real Vercel frontend URL.

## API reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/login | — | `{ username, password }` → `{ token }` |
| GET | /api/price-overrides | Public | Retail price edits (read by View + Admin) |
| PUT | /api/price-overrides/:rowKey | Admin | `{ field, value, categoryId, size, pattern }` |
| GET | /api/dealer-prices | Admin | Landing Price inputs |
| PUT | /api/dealer-prices/:rowKey | Admin | `{ field, value }` |
| GET | /api/rate-configs | Admin | Discount rate configs |
| PUT | /api/rate-configs/:categoryId/:brand | Admin | `{ stepKey, rate }` or `{ focRatio }` |

Protected routes need `Authorization: Bearer <token>` from the login response.

## Not done yet

The frontend still reads/writes localStorage — it hasn't been pointed at
this API yet. That's the next step once this backend is deployed and
confirmed working.
