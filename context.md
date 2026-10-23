# TRI-STAR ★ FITNESS — Technical Context (MERN)

> Gamified one-page marketing site for "TRI-STAR ★ FITNESS", Indore — **now a MERN stack app**:
> **M**ongoDB (Mongoose, optional) · **E**xpress 4 API · **R**eact 19 (Vite 8, plain JavaScript + JSX) · **N**ode ≥ 18.17.
> Converted from the original Google AI Studio static export (app ID `7a2d88a9-dfe7-4c41-9977-3cbc11e2fec1`).

---

## 1. Architecture

```
┌─────────────────────────────  DEV  ─────────────────────────────┐
│  Vite dev server :3000  ──(proxy /api)──►  Express API :3001    │
│  React SPA (src/)                          Mongoose │► MongoDB  │
└──────────────────────────────────────────────────────────────────┘
┌────────────────────────────  PROD  ──────────────────────────────┐
│  npm run build → dist/   npm start → Express serves dist + /api  │
└──────────────────────────────────────────────────────────────────┘
```

- **Client** renders with fallback seed data immediately, then swaps in DB content from `GET /api/content`.
- **MongoDB is optional**: if unreachable, `dbState.mode = 'fallback'` and every API response degrades gracefully (`source: "fallback"`). The site never shows errors.
- **Gamification stays client-side** (localStorage) — no auth/user model yet.

### Commands

```bash
npm install
npm run dev            # concurrently: Express :3001 (node --watch) + Vite :3000
npm run seed           # upsert seed data    (npm run seed -- --reset = wipe+reseed)
npm run build          # vite build → dist/
npm run start          # cross-env NODE_ENV=production node server/index.js (serves dist + API)
npm test               # node:test suite → src/lib/logic.js (12 tests)
```

Env (`.env.example` → `.env`): `MONGODB_URI` (default `mongodb://127.0.0.1:27017/tristar_fitness`), `PORT=3001`, `CLIENT_ORIGIN=http://localhost:3000`.
`DISABLE_HMR=true` still disables HMR/file-watching (AI Studio agent mode) via `vite.config.js`.

---

## 2. File Map

```
├── index.html              # Slim shell: meta/fonts, pre-React theme script, #root, /src/main.jsx
├── vite.config.js          # react() plugin, '@' alias, /api proxy → :3001, HMR toggle
├── styles.css              # Global design system (unchanged from original, ~2,243 lines)
├── package.json            # MERN scripts/deps; ESM ("type": "module")
├── metadata.json           # AI Studio applet metadata (legacy)
├── server/
│   ├── index.js            # Express app: /api routes, static dist + SPA fallback, error handler
│   ├── db.js               # connectDB(): Mongoose connect w/ 5s timeout; fallback mode on failure
│   ├── models.js           # 8 schemas + COLLECTIONS registry + seedDatabase()/dropContentCollections()
│   ├── seedData.js         # Source-of-truth content: offers, plans, stats, gameIdeas, testimonials,
│   │                       #   questions, badges (+ equipment from shared logic)
│   ├── seed.js             # CLI seeder (--reset support; prints per-collection counts)
│   └── routes/
│       ├── content.js      # GET /api/content — per-collection DB query w/ per-array fallback
│       └── gymStatus.js    # GET /api/gym-status — Asia/Kolkata check via shared logic.js
└── src/
    ├── main.jsx            # createRoot + <GameStateProvider> (NO StrictMode — see §6)
    ├── App.jsx             # Section composition; drives global reveal scanner
    ├── logic.test.js       # node:test port of the original suite
    ├── lib/
    │   ├── logic.js        # Pure game math (SHARED with server routes) + EQUIPMENT_LIST
    │   ├── brand.js        # Brand constants + XP_RULES (incl. CARDIAC_ZONE:20, EQUIPMENT_VIEW:25)
    │   └── fx.js           # burst() confetti + showFloatingXP() (imperative DOM FX)
    ├── context/
    │   └── GameStateContext.jsx  # XP/badges/theme/pr100 state + localStorage persistence
    ├── hooks/
    │   ├── useContent.js   # fetch /api/content w/ instant seed fallback
    │   ├── useGymStatus.js # polls /api/gym-status every 60s; computes locally on failure
    │   └── useRevealScan.js# IntersectionObserver → .reveal-init → .reveal-in (+stagger)
    └── components/
        ├── Hud.jsx                  # Fixed top bar, level pill (state-driven), theme toggle
        ├── Hero.jsx                 # Scroll "lift" engine — rAF loop + refs, +50 XP once @ p>0.97
        ├── Quiz.jsx                 # Shuffled MCQs, slides, +25 XP/correct, badges on results
        ├── Offers.jsx               # Data cards (offer.svgIcon via dangerouslySetInnerHTML)
        ├── EquipmentLab.jsx         # React wrapper mounting EquipmentCarousel (ref container)
        ├── EquipmentCarousel.js     # Three.js: 5 procedural PBR models, software-GL box, drag orbit
        ├── Cardiac.jsx              # React wrapper mounting CardiacController
        ├── CardiacController.js     # D3 live ECG (140-pt sliding window), zone buttons +20 XP
        ├── StatsCoach.jsx           # Count-up stat cards + coach block
        ├── Plans.jsx                # Plans grid w/ WhatsApp deep links
        ├── Gamification.jsx         # Game-idea rows + live Badge Wall (from GameStateContext)
        ├── Testimonials.jsx         # Quotes grid
        ├── StoreInstagram.jsx       # Promo cards (store/IG links)
        ├── Contact.jsx              # CTA (+100 XP → WhatsApp), info cards, live hours pill
        ├── Footer.jsx               # Copyright
        ├── OverloadPill.jsx         # Fixed bottom barbell: scroll-tier plates, 100 kg PR +25 XP
        └── FloatingWhatsApp.jsx     # Floating chat button
```

Mongoose collections & natural keys (used for upsert seeding):
`Offer.id`, `Plan.name`, `Stat.label`, `GameIdea.title`, `Testimonial.author`, `Badge.id`, `QuizQuestion.id`, `Equipment.id`.

---

## 3. Data Flow & State

**Content (server-owned):** `server/seedData.js` is the single copy of marketing content; Mongo seeds from it (`npm run seed`, or auto-seed on first connect when all collections are empty); `/api/content` reads DB (sorted by `_id` insertion order) and *per-collection* falls back to seed data when a collection is empty/errored. Client `useContent()` hydrates instantly from the same seed module (imported across the server/client boundary — intentional single source), then swaps in API data.

**Gamification (client-owned)** via `GameStateContext` — localStorage keys unchanged from vanilla:
`tristar_xp` (int), `tristar_badges` (JSON id array), `tristar_pr100` ('true'/'false'), `tristar_theme` ('dark'/'light').
API: `addXP(amount, originEl)` (state + floating popup), `unlockBadge(id)` (idempotent; triggers confetti burst on the wall tile via ref-scan), `toggleTheme(originEl)`, `awardOverloadPR()`; derived `levelInfo = calcLevelProgress(xp)` (50 XP/level). A pre-React inline script in `index.html` sets `data-theme` early to avoid theme flash.

**XP economy:** hero first rep +50 · quiz correct +25 · 100 kg overload PR +25 · free-trial CTA +100 · cardiac zone select +20 (once) · first 3D navigation +25 (once).

---

## 4. Converted Feature Engines (behavior parity with vanilla)

- **Hero scroll lift** — single rAF loop (smooth factor 0.12; snap on reduced-motion), refs instead of getElementById; identical math (wobble `sin(p*20)*(1−p)*2.8`, tilt clamp, clip-path reveal, glow ramp ≥0.7, meter captions, +50 XP/badge at p>0.97).
- **Quiz** — React state machine (deck shuffled once per mount/content-change, Fisher–Yates); segment colors, coach-tip box, focus-next, 280/400 ms slide phases, results rank `calcQuizRank`, `quiz_finisher`/`perfect_form` badges + burst.
- **3D Equipment Lab** — `EquipmentCarousel` class (plain JS port): PMREM RoomEnvironment, 3-point lighting, procedural canvas textures (plate/tub/bar labels, knurl normal map), 5 composite models (7–11 parts each), software-GL detection (SwiftShader/llvmpipe → fenceSync throttled loop, no AA/shadows), drag orbit + auto-spin + ResizeObserver. React wrapper passes `{ container, onXPBonus }`; **destroy() now also removes window-level pointer listeners** (fixed from vanilla leak).
- **Cardiac ECG** — `CardiacController` (plain JS port): D3 line + glow filter + mm-grid, 140-pt sliding window, BPM easing ×0.05, zone flash 0.31–0.36, HRV/recovery formulas, +20 XP once.
- **Overload pill** — scroll listener + rAF easing loops in `useEffect` w/ ref'd plates; `clank` reflow-retrigger; one-time PR bonus via `awardOverloadPR`.
- **Live gym hours** — server route (shared logic.js, Asia/Kolkata) polled each 60 s; client computes locally on fetch failure. Same hours: Mon–Sat 05:30–11:00 & 16:30–22:00, Sunday closed.
- **Reveals** — global `useRevealScan([content])` observes all `.reveal-init` with `(idx%4)*90ms` stagger; stat counters use per-card observers (ease-out cubic 1300 ms).

## 5. API Reference

| Route | Response |
|---|---|
| `GET /api/health` | `{ status, db: 'mongo'\|'fallback', uptime }` |
| `GET /api/content` | `{ source: 'database'\|'database+fallback'\|'fallback', data: { offers, plans, stats, gameIdeas, testimonials, badges, questions, equipment } }` |
| `GET /api/gym-status` | `{ open, hour, minute, day }` (Asia/Kolkata) |
| other `/api/*` | 404 `{ error: 'Unknown API route' }` |

Prod mode (dist exists): everything non-`/api` falls back to `index.html` (SPA routing ready).

---

## 6. Gotchas / Notes for Future Sessions

1. **No `<React.StrictMode>`** — deliberate: double-invoked effects would mount/unmount the Three.js/D3 imperative controllers twice and leak canvases/listeners.
1a. **Ref wiring is load-bearing on every heavily-instrumented component** — the Hero engine silently no-ops if a ref is missing (`if (!heroSection) return`). When adding ref-driven sections, double-check each `ref={...}` survives edits.
2. `useContent()` imports `../../server/seedData.js` — intentional cross-tree import for the single source of truth; server-side `EQUIPMENT_LIST` likewise comes from `src/lib/logic.js` (works because logic.js is DOM-free).
3. Controllers keep imperative `innerHTML` rendering + global element IDs (`cardiac-svg`, `eq-three-canvas`, …) — fine because exactly one instance exists; if you ever render multiples, scope IDs per container.
4. Component class names match the original CSS exactly — `styles.css` is untouched; never rename classes without checking `styles.css`.
5. Theme transition: context writes `data-theme` on `<html>`; the head's pre-React script prevents first-paint flash. Persisted theme is stored via state effect (all four LS keys rewritten together, as vanilla `AppState.save()` did).
6. `node --watch` requires Node ≥ 18.11; `npm start` uses `cross-env` (Windows-safe `NODE_ENV`).
7. Bundle is ~890 kB (three.js + d3). Vite warns on 500 kB; consider dynamic `import()` per heavy section if this matters.
8. MongoDB was **not installed** on this machine during conversion — the fallback path was verified live (`/api/health → db:fallback`). To test the DB path: install/start MongoDB, restart `npm run dev`, expect `[db] connected` and `/api/content source: "database"`.
9. Hardcoded business facts (phone `076930 06065`, WhatsApp `917693006065`, IG `@TRISTARFITNESS`, store `tristarfitness.emitra.dev/store`, 5.0★ ×51 reviews, coach Mohit Sen, footer year 2026) live in `src/lib/brand.js`, contact components, and footer.

## 7. Verification Log (2026-10-23)

- `npm install` → 182 packages ✅ · `npm test` → 12/12 ✅ · `npm run build` → dist (890 kB js / 35 kB css) ✅
- Prod Express: `/` 200 SPA, `/api/health` ok, `/api/gym-status` live (IST), `/api/nope` → 404 ✅
- Dev: Vite :3000 + proxy → Express :3001 ✅ · full React render, **0 console errors** ✅
- Browser probes: equity canvas mounted + 5 tabs, ECG path streaming (~6.4 kB of `d` data), terminated correctly ✅
- XP round-trip confirmed live: quiz answer → `tristar_xp = "25"` in localStorage ✅
- **Hero scroll-lift bug fixed**: the rAF engine bailed silently because `heroRef` was declared but never attached to the `<section class="hero-scroll-track">` — `heroSection` was `null`, so the guard `if (!heroSection …) return` killed the loop before the first frame (transform never written, meter stuck at 0 %). Fix: `ref={heroRef}` on the section. Verified via console probe: effect now sees the hero element and schedules the loop (`scrollableDist ≈ 1680 px` on a 670 px viewport).
- **OverloadPill never-visible bug fixed (same failure mode)**: `OverloadPill` declared its own `heroRef` for the *sibling* `<Hero />` section — `heroRef.current` was permanently `null`, so the scroll listener never attached and `.visible` was never added (pill stayed `opacity: 0`/`translateY(120%)` forever). Fix: resolve `document.getElementById('hero')` inside the effect (mirrors the vanilla impl), drop the dead ref, and remove `leftPlates/rightPlates` from the effect deps (recreated per render — would re-bind the listener and reset the weight readout on every XP gain). Verified via synthetic scroll event: `.visible` added, all 8 plates `.loaded`, +25 PR XP once, `tristar_pr100` persisted.
