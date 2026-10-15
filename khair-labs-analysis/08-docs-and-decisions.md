# 08 - docs & decisions

> **Roman Urdu khulasa:** `docs/` mein poora plan, current status, 18 decisions (ADR D01-D18), product brief, design system, security review aur archive hai. `AGENTS.md` har session ka rule book hai.

## `docs/` inventory

| File | What it is |
|---|---|
| `KHAIR_LABS_BUILD_PLAN.md` | The master hand-off (v1.3): product, decisions, architecture, phases 0-11, design workflow, rules |
| `STATUS.md` | Current state + evidence + open deviations + next step (updated every session) |
| `agreement/` (adr) | `adr/D01..D18` one-page decision records |
| `product/PRODUCT.md` | Product brief (who, what, promise, constraints, voice) |
| `product/AI_Quest_Planning_EN.md` | Earlier full product plan (5 modules, Django, Qwen3, safety) - content/safety reference |
| `product/SHOWCASE_QUESTIONS.md` | The 26 temporary showcase questions for owner review (generated) |
| `design/DESIGN.md` | Design system (tokens, type, shape/motion, components, rules) |
| `design/direction.md` | App-wide direction contract |
| `design/findings.md` | Impeccable findings log |
| `design/landing-edits.md` | The landing copy edit list (must match `edits.mjs`) |
| `design/Khair Labs.html` | 942 KB one-page design source of truth (**never edited**) |
| `design/lab-entries-final.html` | Approved lab-entry animation reference |
| `design/labs-menu-spotlight.html` | Approved Labs Spotlight menu reference |
| `security/phase-2-review.md` | Tier 2 security review + manual login test results |
| `archive/README.md`, `archive/memory.md` | Historical old docs (do not follow) |

## The build plan (`KHAIR_LABS_BUILD_PLAN.md`) in brief

- **Use:** read fully, work **one phase at a time**, each phase ends with a pass/fail check and evidence in the PR. If the code disagrees with the plan, stop and ask.
- **Product:** web app (PWA), Electron desktop app, Django backend, on-device AI (Phase 8), PostgreSQL -> Supabase.
- **Beta scope (2A):** Prompt Park exactly as today + backend/accounts/sync/web/desktop/Supabase. Content, games, questions and scoring are frozen.
- **Product rules:** beginners 11-18, mobile-first 360px/44px, every level a game (≤1 quiz), no AI/internet needed to learn, prompts stay on device, minors (nicknames only), plain short copy, Arcade Night tokens only, progress only in `rules.ts`, client components never import content.
- **Phases 0-7** (beta) and **8-11** (after). Review tiers: T0 CI green; T1 + AI review in a fresh context; T2 + security review + human sign-off (auth, students' data, migrations on user tables, anything in `backend/accounts/`).
- **Beta exit criteria:** 2 weeks with real classes, no blockers, <1% sync failures, clean-laptop test passed.

## All 18 decisions (ADRs)

| # | Title | Decision | Status |
|---|---|---|---|
| D01 | Desktop shell | Electron (bundles Chromium; consistent WebGPU/WASM/Pyodide/TF.js) | Accepted |
| D02 | Backend & DB | Django + DRF on PostgreSQL; Supabase from Phase 6, through Django only | Accepted |
| D03 | Existing app scope | Only Prompt Park; other worlds are future content (Phase 10) | Accepted |
| D04 | Student sign-in | Guest play stays; class code + nickname + 4-digit PIN; teachers email + password; no student emails | Default |
| D05 | Auth mechanism | Django session cookies + CSRF, same-origin (Next proxies `/api/*`); no tokens in localStorage | Default |
| D06 | Product name | **Khair Labs**; footer "© 2026 Khair Labs, a project of Idara Al Khair" | Decided |
| D07 | Theme | **Night only**, no switcher, everywhere; Day tokens removed/ignored | Decided |
| D08 | Beta scope | Prompt Park as-is + backend/accounts/sync/web/desktop/Supabase; freeze | Accepted |
| D09 | Hosting | Self-hosted; web (Next standalone) + Django as Docker behind HTTPS reverse proxy, one domain | Decided |
| D10 | Desktop platforms | Windows only at launch; macOS later | Default |
| D11 | Repo & license | Private during beta; all rights reserved; no LICENSE file | Decided |
| D12 | Tools | pnpm workspaces, Node 24, Python 3.12 via uv (never system python) | Accepted |
| D13 | Electron address | Fixed `127.0.0.1:43117`; never random; show an error if taken | Default |
| D14 | Bundle a model in installer | **OPEN** - decide before Phase 8 | Open |
| D15 | Design source, landing, external code | `Khair Labs.html` is source of truth; `/` is a tested copy (edit list); nothing from CDNs (pinned self-hosted libs); model files from pinned hosts only; AI helper (2026-10-08) | Decided |
| D16 | Lab entry animations | One per lab (Hyperdrive/Orbit/Word Weaver/Breach), overlay, ≤3.5s, skippable, lazy three.js 0.186.0, tokens only | Decided (amended by D18) |
| D17 | Showcase content | STEAM/Lingo/Cyber World 1, 3 levels each, 26 questions, existing game types, separate local `kl-showcase` store, **temporary** | Decided |
| D18 | Nav + Labs Spotlight menu | Logo, Labs ▾, For Teachers, XP, Sign in; shared framework-free menu; live CSS/SVG icons; one animation speed; **entry animation plays on every entry** | Decided |

## Key design decisions detail

### D15 - landing + external code
- Design source: `docs/design/Khair Labs.html`; the app must match its nav, brand, blur, footer, logo, colours, fonts, base styles. Prompt Park stays frozen.
- `/` = `apps/web/public/landing.html`, built by `pnpm build:landing` from the original + `apps/web/landing/edits.mjs`; `landing.test.mjs` fails on any other difference.
- Nothing from CDNs: WebLLM 0.2.85 + Transformers.js 3.8.1 installed with pnpm, copied to `public/vendor/` by `pnpm vendor`, served same-origin. Dynamic imports accept only `/vendor/` and `/ai-helper/`.
- Model files (only allowed outside hosts): `huggingface.co` (pinned commits: Qwen2.5-0.5B ~520MB, SmolLM2-135M ~140MB, SmolLM2-360M q4f16 ~205MB), `*.hf.co` CDN, `raw.githubusercontent.com` (WebLLM `.wasm` at a pinned commit); every file size/SHA-256 checked. Gemini Nano contacts no host.
- Privacy: prompts/answers never leave the device; the page makes no `/api` call; only Prompt Park progress syncs.

### D16/D18 - lab entry
- Overlay `LabEntry` in each lab's `layout.tsx`; plays on **every** entry (nav, landing click, direct link, back/forward, refresh, moving between labs); world<->level movement does not replay (`key={lab}` makes lab moves new).
- Timing 3.2-3.4s, title at 2.5-2.75s, hard cap 3.5s (`endAt = min(duration, 3.25s)` + 150ms fade). Always skippable (Skip + Escape). Reduced motion / no WebGL = simple fade (900ms).
- three.js 0.186.0 (+ types) exact pin, lazy chunk only (~348KB), dynamic import; enforced by `pnpm check:bundle`.
- Colours from live Night tokens; a test fails on any hex colour. Weak devices halve particle counts; pixel ratio capped at 2; clock pauses when hidden; everything freed after each play.
- Design exemption: additive glow, screen flash, blurred Skip, elastic title overshoot are allowed **inside the overlay only**.

### D17 - showcase labs
- All four labs open. STEAM Science Sparks (sort/order/choice), Lingo Word Market (match/spot/order), Cyber Password Fort (sort/spot/choice); 26 items; not in `WORLDS`/`catalog.json`.
- Same rules (hearts/stars/XP); progress in `kl-showcase`, never synced. Lab pages reuse the AI Lab world page with a Preview chip.
- Optional wording fields `labels` (match) and `label` (spot) let the same games fit languages/messages; 34/34 Prompt Park screens stayed pixel-identical.

### D18 - nav / menu
- Top bar: logo, Labs ▾, For Teachers (`/sign-in?for=teachers`), XP, Sign in. How it works and Roadmap move into the menu + footer. Day-streak pill gone.
- One shared framework-free component in `apps/web/public/labs-menu/` used by landing + app; worlds from `packages/core/src/labs.ts`; stars read on-device from the two stores.
- Phone (≤767px): top sheet with four ≥44px cards then How it works/Roadmap. Live icons (CSS/SVG only, no three.js), paused when closed; atom script stops when closed.
- Motion rule added to `AGENTS.md` and both direction files: looping animations keep one steady speed.

## Security review (`docs/security/phase-2-review.md`)
Tier 2 review; signed off by the owner with recorded decisions. Protects against: PIN guessing (5-try lockout, per-IP/per-code throttles, equal timing), class-code guessing, IP spoofing (`NUM_PROXIES=0`), login CSRF/cross-site writes, cross-teacher access (404), student over-read, XP cheating (server recompute), double first-clear pay (row lock), run replays (unique), over-retention (delete class cascades), minors' PII (no student email constraint, no real names, hashes, ids-only logs), account enumeration, cached private data, insecure prod start.

12 known gaps (detail lives in the file); the two must-dos before beta launch are the teacher invite code (Phase 3) and teacher password recovery (Phase 4). Manual login test list: **21/21 passed** (2026-10-07).

## `AGENTS.md` (the operating contract)
- Start/finish every session: read `STATUS.md` + plan, do **one phase**, state the pass/fail check before coding, update `STATUS.md` last with evidence. Stop if the plan and code disagree or a decision is OPEN.
- Commands (doctor, JS, backend, catalog, screenshots, API client, uv).
- Layout, conventions (strict TS, small PRs, conventional commits, never push to `main`, progress only in `rules.ts`, client never imports content, Arcade Night tokens, motion rule, shared Labs menu, mobile-first).
- Beta freeze (Phases 0-7): no content/games/questions/scoring changes; design changes only to match the design file; allowed: tested bug fixes + minimum account UI + D16-D18 exceptions.
- Never-do list (secrets/.env/real data, minor PII, rule changes without mirror+vectors, Electron port, model caching in SW, sending prompts to backend, new colors/fonts/patterns).
- Review tiers T0/T1/T2; definition of done = tests pass + evidence in the PR + STATUS updated.

## `STATUS.md` highlights (current state)
- Phases 0, 1, 2 done; design work, AI helper, lab entry animations merged. Showcase labs and nav-menu branches built locally, **not pushed, no PR, CI not run**.
- Phase 3 not started.
- Backend evidence: 147 passed on real Postgres 16, coverage 99.3%.
- Lab entry suite: 69/69 and 76/76 on real Chrome 154; nav-menu suite 129/129; showcase suite 89/89.
- Deviations: API fields `snake_case`; added `GET /auth/csrf`; no prod Docker image yet (Phase 4); no Django admin; unlock order not enforced server-side; guest import XP assumes all items answered correctly; production requires `REDIS_URL`.
