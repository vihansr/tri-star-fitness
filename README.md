# TRI-STAR ★ FITNESS (MERN)

Gamified, animation-heavy one-page website for TRI-STAR ★ FITNESS, Indore's premium fitness destination.
Convert to a MERN stack: React 19 + Vite client, Express API, MongoDB (Mongoose) content store.

## Stack

| Layer | Tech |
|---|---|
| Client | React 19, Vite 8, Three.js (3D equipment lab), D3 (live ECG telemetry), plain CSS |
| Server | Node.js + Express 4 (`/api/content`, `/api/gym-status`, `/api/health`) |
| Database | MongoDB via Mongoose (8 collections), auto-seeded, graceful fallback |

## Run Locally (dev)

**Prerequisites:** Node.js ≥ 18.17. MongoDB is *optional* — without it the API serves built-in seed content.

```bash
npm install
npm run dev        # Express API on :3001 + Vite client on :3000 (open http://localhost:3000)
```

## Environment

Copy `.env.example` to `.env` and adjust:

- `MONGODB_URI` — MongoDB connection string (default: `mongodb://127.0.0.1:27017/tristar_fitness`)
- `PORT` — Express port (default `3001`; Vite proxies `/api` here)
- `CLIENT_ORIGIN` — allowed CORS origin for production

## Database

Collections (`offers`, `plans`, `stats`, `gameIdeas`, `testimonials`, `badges`, `quizQuestions`, `equipment`) are defined in `server/models.js`. Seed content lives in `server/seedData.js`.

```bash
npm run seed        # upserts seed data (auto-seeds on first connect anyway)
npm run seed -- --reset   # wipe + reseed
```

If MongoDB is unreachable, `/api/content` returns the seed data with `source: "fallback"` — the site never breaks.

## Production

```bash
npm run build       # vite build → dist/
npm run start       # Express serves dist/ + API on PORT
```

## Tests

```bash
npm test            # node:test suite for the shared game-logic module (src/lib/logic.js)
```

## Gamification

XP, badges, theme, and overload-PR state persist client-side in `localStorage`
(`tristar_xp`, `tristar_badges`, `tristar_pr100`, `tristar_theme`) — no auth required.

## Project layout

```
server/          Express app, Mongoose models, seed data, API routes
src/             React app (components, context, hooks, lib)
styles.css       Global design system (industrial, 2px borders, hard shadows)
index.html       Vite shell (fonts, meta, #root)
```

View the original AI Studio app: https://ai.studio/apps/7a2d88a9-dfe7-4c41-9977-3cbc11e2fec1
