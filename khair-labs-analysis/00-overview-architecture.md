# 00 - Overview & Architecture

> **Roman Urdu khulasa:** Khair Labs ek learning-game app hai (11-18 saal ke bachon ke liye). Ek hi codebase 4 tarah se chalti hai: web app, Electron desktop app, Django backend, aur on-device AI (baad mein). Students ke liye rules (XP, stars, hearts) TypeScript aur Python dono mein hain aur ek hi test file se test hote hain. Backend kabhi student ka XP khud nahi leta, wo dobara calculate karta hai.

---

## 1. Product

- **Who:** complete beginners aged ~11-18, many on phones and school laptops. Many have never written a prompt.
- **What:** every topic is a **World**, every lesson is a **Level** (a game), each world ends with a **Boss** exam. The only real world today is **Prompt Park** (World 1 of the AI Lab): 12 levels + Boss, 52 items.
- **Promise:** 3 hearts, up to 3 stars, XP, instant feedback that explains why. Help fades by zone; the Boss gives no help. Learning never needs an AI model or internet.
- **Name:** Khair Labs (D06). Footer: "© 2026 Khair Labs, a project of Idara Al Khair".
- **Audience rule:** minors - no real names, no student emails, **nicknames only**.

## 2. What ships

One codebase that becomes:

1. **Web app** - Next.js 15, installable PWA (Phase 4), offline after first visit.
2. **Desktop app** - Electron, Windows first (D01, D10), fixed port `127.0.0.1:43117` (D13).
3. **Backend** - Django + DRF: accounts, classes, progress sync, XP/badges.
4. **On-device AI** - Phase 8 (a small model downloaded once, then offline; prompts never leave the device). The *landing page* already has a working AI helper (D15).
5. **Database** - PostgreSQL 16 in Docker locally, **Supabase Postgres** in production (Phase 6).

Guests can still play with no account. An account only adds cross-device saving and appearing in a teacher's class.

## 3. Architecture and data flow

```
Browser / Electron window
   |
   v
Next.js (apps/web)         <- renders pages, games run client-side, rules from packages/core
   |  /api/*  (Next rewrite, same origin)  <- Phase 3
   v
Django + DRF (backend)     <- accounts, progress, XP, badges, teacher data
   |
   v
PostgreSQL  (Docker locally -> Supabase in production)
```

Key design choices:

- **Content stays in `packages/core`.** It is TypeScript, rendered at build time. Django does **not** store content; it reads a generated `packages/core/catalog.json` (world/level ids, item counts, boss flags, order) to validate runs.
- **Rules exist twice, tested once.** `rules.ts` runs on-device (instant feedback, offline); `backend/gamification/rules.py` recomputes XP/stars/badges/streak on the server so the server never trusts a client XP number. Both are tested against `packages/core/test-vectors/rules.json`.
- **Same origin everywhere.** Next.js rewrites `/api/*` to Django: no CORS, session cookies work on web and desktop, CSRF works normally.
- **Offline outbox** (Phase 3). Every finished run gets a `clientRunId` (UUID) and is saved locally; when online and signed in it is sent in batches to `POST /api/v1/progress/runs`. The server ignores duplicates (unique per user + `clientRunId`).
- **Guest -> account merge.** On first sign-in, local progress is imported once: stars = max per level, badges = union, days = union. XP is **recomputed by the server**, never copied from the client.

## 4. Monorepo map (current vs target)

Source: `docs/KHAIR_LABS_BUILD_PLAN.md` section 5.1.

```
khair-labs/
  apps/
    web/            Next.js 15 App Router. UI only, no business logic.        [exists]
    desktop/        Electron shell (starts web server, window, update).       [Phase 5, missing]
  backend/          Django project + DRF                                     [exists]
    config/         settings (base/dev/test/prod), urls, asgi/wsgi, health
    accounts/       users (teacher/student/admin), classrooms, codes, PINs
    progress/       runs, level bests, sync endpoint, guest import
    gamification/   XP/badges/streaks (Python mirror of rules.ts)             [logic only, no models]
    catalog/        reads packages/core/catalog.json
    llm/            Phase 11 only (after beta) - missing
  packages/
    core/           types, rules, checks, content, catalog.json, test vectors [exists]
    ui/             Arcade Night tokens, fonts, CSS                           [exists]
    api/            TS client generated from Django's OpenAPI schema          [exists]
  docs/             plan, STATUS, adr/, product/, design/, security/, archive/[exists]
  scripts/          cross-platform Node scripts (no bash, no Makefile)        [exists]
  docker-compose.yml  postgres + redis (profile "full" + django/web is Phase 4)[partial]
```

## 5. Tech stack

| Area | Choice |
|---|---|
| Web | Next.js 15 App Router, React 19, TypeScript, Zustand, Phosphor icons, self-hosted fonts |
| API client | `openapi-typescript` + `openapi-fetch` (`packages/api`) |
| Backend | Django 5.2 LTS, DRF, drf-spectacular, django-environ, Argon2, pytest-django, ruff |
| Database | PostgreSQL 16 (Docker) -> Supabase Postgres |
| Queue (later) | Redis + Celery (Phase 11) |
| Desktop | Electron + electron-builder (NSIS) + electron-updater (Phase 5) |
| On-device AI | WebLLM (WebGPU) + Transformers.js (CPU), pinned + self-hosted |
| Tests | Node test runner (core/web), pytest (backend), Playwright (e2e) |
| Quality | TS strict, ruff, gitleaks, axe accessibility |
| Tools | Node 24, pnpm 11, Python 3.12 via uv, Docker (D12) |

## 6. Decisions (ADR index)

Every decision has a one-page ADR in `docs/adr/`. Full detail in file `08-docs-and-decisions.md`.

| # | Decision | Value | Status |
|---|---|---|---|
| D01 | Desktop shell | Electron (bundles Chromium) | Accepted |
| D02 | Backend / DB | Django + DRF on PostgreSQL; Supabase from Phase 6 | Accepted |
| D03 | Existing app scope | Only Prompt Park; other worlds later (Phase 10) | Accepted |
| D04 | Student sign-in | Guest stays; class code + nickname + 4-digit PIN; teachers email + password | Default |
| D05 | Auth mechanism | Django session cookies + CSRF, same-origin (Next proxies `/api/*`) | Default |
| D06 | Product name | **Khair Labs** | Decided |
| D07 | Theme | **Night only**, no switcher | Decided |
| D08 | Beta scope | Prompt Park as-is + backend/accounts/sync/web/desktop/Supabase | Accepted |
| D09 | Hosting | Self-hosted: web + Django as Docker behind HTTPS reverse proxy, one domain | Decided |
| D10 | Desktop platforms | Windows only at launch | Default |
| D11 | Repo / license | Private during beta, all rights reserved (no LICENSE file) | Decided |
| D12 | Tools | pnpm workspaces, Node 24, Python 3.12 via uv | Accepted |
| D13 | Electron address | Fixed `127.0.0.1:43117`, never random | Default |
| D14 | Bundle a model in installer | **OPEN** (after beta, Phase 8) | Open |
| D15 | Design source + landing + external code | `Khair Labs.html` is source of truth; `/` is a tested copy; nothing from CDNs | Decided |
| D16 | Lab entry animations | One per lab, overlay, max 3.5s, always skippable, lazy three.js 0.186.0 | Decided (amended by D18) |
| D17 | Showcase content | STEAM/Lingo/Cyber World 1, 26 temporary questions, separate local store | Decided (temporary) |
| D18 | Nav + Labs Spotlight menu | Logo, Labs menu, For Teachers, XP, Sign in; entry animation plays on every entry | Decided |

## 7. Phase plan (beta = 0-7, after = 8-11)

| Phase | Goal | Status |
|---|---|---|
| 0 | Clean up + foundations (ADRs, AGENTS.md, CI, doctor) | Done |
| 1 | Monorepo restructure (no behaviour change) | Done |
| 2 | Django backend v1 (Tier 2: auth + minors' data) | Done |
| 3 | Frontend wired to backend (accounts, sync, outbox, dashboard) | **Not started** |
| 4 | Web launch readiness (PWA, CSP, prod image, staging, teacher password recovery) | Not started |
| 5 | Desktop app (Electron, fixed port, installer, auto-update) | Not started |
| 6 | Move database to Supabase (lock down Data API, backups) | Not started |
| 7 | Beta launch (invite code, privacy notice, monitoring, rollback) | Not started |
| 8 | On-device AI full feature (Web Worker, Pip live mode, bundle) | After beta |
| 9 | Landing page (final `/`, archive HTML) | After beta |
| 10 | Content expansion (repeat per world) | After beta |
| 11 | Live AI (Qwen3 proxy, moderation, Celery, SSE) | After beta |

## 8. Blocking items before beta launch (from the Phase 2 security review)

- [ ] Teacher signup invite code (`TEACHER_INVITE_CODE`) - Phase 3, Tier 2.
- [ ] Teacher password recovery by email - Phase 4, Tier 2.
- [ ] Production must start with `REDIS_URL` (already enforced by settings in Phase 2).

Accepted beta risks: 4-digit PINs + lockout abuse, client-reported stars. Desktop cookie behaviour to be verified in Phase 5.

## 9. Product rules that must not break

- Mobile first: works at 360 px, touch targets ≥ 44 px.
- Every level is a game; **max one quiz question per level** (enforced by test).
- Learning/mastery never require an AI model or internet.
- Prompts and model answers stay on the device; never sent to Django or error monitoring.
- No real names / no student emails; nothing personal in logs, fixtures, prompts or PRs.
- Copy is plain and short; **no em-dashes** in UI copy.
- Arcade Night tokens only; no gradients, glows, glassmorphism or purple (lab entry overlay is exempt, D16); no raw hex in components.
- Looping animations keep one steady speed (D18).
- Progress logic lives only in `rules.ts` (+ Django mirror). Components never decide progress.
- Client components never import content modules; server pages pass data as props.
