# Khair Labs - Complete Codebase Analysis

**Analysis date:** 2026-10-12
**Source repo:** `C:\Users\jhone\OneDrive\Desktop\khair-labs`
**Method:** full file inventory + deep read of every module (code, config, docs, tests).

> **Roman Urdu khulasa:** Ye folder `khair-labs` repo ka mukammal (complete) analysis hai. Har bari cheez (module) ka alag `.md` file bana diya gaya hai. Neeche index hai - jis file ko chahein kholein.

---

## What this repo is

**Khair Labs** is a learning-game app for beginners aged **11 to 18**, by Idara Al Khair. Each topic is a "world" and each lesson is a game. Today the app ships **Prompt Park** (World 1 of the AI Lab) plus three temporary preview labs (STEAM, Lingo, Cyber). It has a Next.js web app, a shared TypeScript core package, a Django + DRF backend, and rich design/tooling.

Repo status per `docs/STATUS.md`: Phases 0, 1, 2 done; design work, the on-device AI helper, lab entry animations and the showcase labs are merged or on unpushed local branches. **Phase 3 (frontend wired to backend) has not started.**

---

## The files in this folder

| # | File | What it covers |
|---|---|---|
| 00 | [00-overview-architecture.md](00-overview-architecture.md) | Product, architecture, data flow, all 18 decisions, phase plan, monorepo map |
| 01 | [01-apps-web.md](01-apps-web.md) | `apps/web`: Next.js routes, components, games, lab-entry 3D, AI helper, labs menu, stores |
| 02 | [02-packages-core.md](02-packages-core.md) | `packages/core`: types, progress rules, prompt checks, content, showcase, lab catalog, generators |
| 03 | [03-packages-ui.md](03-packages-ui.md) | `packages/ui`: Arcade Night tokens, fonts, game/lab-entry/showcase CSS |
| 04 | [04-packages-api.md](04-packages-api.md) | `packages/api`: OpenAPI schema + generated typed client |
| 05 | [05-backend-django.md](05-backend-django.md) | `backend/`: Django apps, models, endpoints, auth, progress sync, rules mirror, settings |
| 06 | [06-scripts-automation.md](06-scripts-automation.md) | `scripts/`: doctor, build-landing, gen-api, check-bundle, screenshots, e2e tests |
| 07 | [07-ci-config-tooling.md](07-ci-config-tooling.md) | CI workflow, root config files, docker-compose, env, Impeccable/design tooling |
| 08 | [08-docs-and-decisions.md](08-docs-and-decisions.md) | `docs/`: build plan, ADRs D01-D18, product, design, security, archive |
| 09 | [09-risks-gaps-next.md](09-risks-gaps-next.md) | Known gaps, risks, deviations, housekeeping, next steps |

---

## How to read this

- If you want the big picture, read **00** then **09**.
- If you own the frontend, read **01** and **03**.
- If you own content/scoring, read **02** (and its Django mirror in **05**).
- If you own the backend or security, read **05** and **08**.
- If you own tooling/CI, read **06** and **07**.

## Key facts at a glance

- **Monorepo:** pnpm workspaces + Node 24 + TypeScript strict. Python 3.12 via `uv`.
- **Web:** Next.js 15 App Router, React 19, Zustand. `apps/web`.
- **Core:** TS source only (no build step), consumed by the app. `packages/core`.
- **Backend:** Django 5.2 LTS + DRF, PostgreSQL 16, session-cookie auth + CSRF, Argon2.
- **Two progress stores (on-device only):** `kl-progress` (Prompt Park) and `kl-showcase` (preview labs).
- **Rules exist twice** (`rules.ts` and `rules.py`) and are tested against one shared file: `packages/core/test-vectors/rules.json`.
- **No content in the backend:** Django only reads `packages/core/catalog.json` (ids, item counts, boss flags, no answers).
- **Privacy:** on-device AI only, no student emails, nicknames only, prompts/answers never leave the device.
- **CI:** 4 jobs - `app`, `backend` (real Postgres 16), `api-client`, `secrets` (gitleaks).
- **Beta freeze:** no changes to content, games, questions or scoring during Phases 0-7.

## One-line per directory

```
apps/web/        Next.js 15 app (Prompt Park + showcase labs, AI helper, labs menu, lab entry)
packages/core/   Types, rules, checks, content, showcase, lab catalog, catalog.json, test vectors
packages/ui/     Arcade Night tokens + fonts + CSS (globals, games, lab-entry, showcase)
packages/api/    Generated TS client (openapi.json, schema.d.ts) - do not edit by hand
backend/         Django + DRF: config, accounts, progress, gamification, catalog
scripts/         Cross-platform Node scripts (no bash, no Makefile)
docs/            Plan, STATUS, ADRs, product, design, security, archive
.github/         CI workflow
.design/         Lab-entry direction contract + findings (Impeccable)
```
