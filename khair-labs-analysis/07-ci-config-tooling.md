# 07 - CI, root config & tooling

> **Roman Urdu khulasa:** CI (GitHub Actions) mein 4 jobs hain: app (typecheck/test/build/bundle), backend (real Postgres+ruff+pytest), api-client (generated client stale na ho), aur secrets (gitleaks). Root config files tools aur env set karte hain. `.design/` aur `.impeccable/` design tooling hain.

## CI: `.github/workflows/ci.yml`

Triggers: `pull_request`, and `push` to `main`. Permissions: `contents: read`, `pull-requests: read`. Four jobs run in parallel on `ubuntu-latest`.

### Job `app`
Steps: checkout, pnpm setup, Node 24 (+ pnpm cache), `pnpm install --frozen-lockfile`, then:
- `pnpm typecheck` (all workspaces)
- `pnpm test` (all workspaces)
- `pnpm check:catalog` (catalog.json not stale)
- `pnpm check:labs-menu` (labs-menu catalog.json not stale)
- `pnpm build` with `NEXT_PUBLIC_UNLOCK_ALL=false`
- `pnpm check:bundle` (three.js only in its lazy chunk, never landing/first-load)

### Job `backend`
- Postgres 16 service (`khair/khair/khair`, port 5432, `pg_isready` healthcheck).
- Env: `DATABASE_URL=postgres://khair:khair@localhost:5432/khair`, `REQUIRE_POSTGRES=1` (so the row-lock race test can never silently skip on SQLite).
- Steps: checkout, `astral-sh/setup-uv@v5`, `uv python install 3.12`, `uv sync --frozen`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run python manage.py makemigrations --check --dry-run`, `uv run pytest --cov`. Working dir `backend/`.

### Job `api-client`
checkout, pnpm setup, Node 24, setup-uv, `uv python install 3.12`, `uv sync --frozen --directory backend`, `pnpm install --frozen-lockfile`, `pnpm gen:api`, then `git diff --exit-code -- packages/api` -> **fails if the generated client is stale**.

### Job `secrets`
checkout (`fetch-depth: 0`) + `gitleaks/gitleaks-action@v2` (secret scanning on history).

## Root configuration files

| File | Controls |
|---|---|
| `package.json` | Workspace `packageManager: pnpm@11.22.0`, Node `>=24`; all top-level scripts; dev deps `axe-core 4.13.0`, `pixelmatch`, `playwright`, `pngjs` |
| `pnpm-workspace.yaml` | Packages `apps/*`, `packages/*`; `allowBuilds` (only `esbuild: true`; `onnxruntime-node`, `protobufjs`, `sharp` disabled - their browser files are copied instead) |
| `docker-compose.yml` | `postgres:16` (khair/khair/khair, `127.0.0.1:5432`, volume `pgdata`, healthcheck) + `redis:7` (`127.0.0.1:6379`). No full profile yet (Phase 4) |
| `.env.example` | Documented env template (see below) |
| `.nvmrc` | Node `24` |
| `.python-version` | `3.12` |
| `.gitignore` | `.env*` (except `.env.example`), node_modules, `.venv`, Python caches, and `apps/web/public/vendor/` (generated) |
| `.gitattributes` | `* text=auto eol=lf` (LF everywhere, prevents CRLF byte mismatches in landing checks); binary for png/jpg/ico/woff2/wasm |
| `AGENTS.md` | The agent operating contract (session ritual, commands, layout, conventions, beta freeze, never-do, review tiers, definition of done) |
| `CLAUDE.md` | One line: `@AGENTS.md` |

### `.env.example` variables
- Web: `NEXT_PUBLIC_UNLOCK_ALL` (testing only; **must be false** for real students).
- Backend: `DATABASE_URL`; production-required `SECRET_KEY`, `ALLOWED_HOSTS`; `CSRF_TRUSTED_ORIGINS` (web domain + Electron `http://127.0.0.1:43117`); `NUM_PROXIES` (prod default 1); `REDIS_URL` (**required** in production); `CATALOG_PATH`; `DJANGO_SETTINGS_MODULE`.

### `docker-compose.yml` detail
`postgres:16` with `pgdata` volume and `pg_isready -U khair`; `redis:7`. Comment notes Redis is "not used yet" but base settings consume it when `REDIS_URL` is set (throttle cache; Celery in Phase 11).

## Design tooling

### `.impeccable/config.json`
Impeccable detector config. `ignoreRules`/`ignoreFiles` empty; one explicit waiver: `bounce-easing` = `cubic-bezier(.2, .9, .25, 1.2)` for `packages/ui/src/lab-entry.css` (the approved lab-title overshoot, D16; switched off under reduced motion).

### `docs/design/direction.md` (app-wide contract)
Surface: Prompt Park world + level player. Lane: product, preservation mode. Dials VARIANCE 3 / MOTION 4 / DENSITY 5. Design language: chunky tactile arcade UI (press-down on a hard shadow, near-black ink, one lime accent). Do-not list: no new colors/raw hex, no gradients/glows/glassmorphism/purple, no eyebrow labels, **no em-dashes**, no hint/example/starter in Boss items, no progress logic in components, client never imports content, no nested interactive elements, no progress UI before hydration. Motion rule (D18): looping animations keep one speed.

### `.design/direction.md` (lab-entry contract, wins where it differs)
Surface: full-screen entry overlay per lab. Dials VARIANCE 8 / MOTION 8 / DENSITY 2. Do-not list: no raw hex, never load three.js in landing/main bundle, never leave a WebGL context/canvas/texture behind, no animation >3.5s and always a Skip button (Esc too), no sound, no autoplay on later entries, nothing flashing >3×/s, no new copy beyond names/taglines, no em-dashes.

### `docs/design/findings.md` and `.design/findings.md`
Recorded Impeccable findings and their fixes/waivers (progress-hydration flash, nested interactive sort buckets, 44px chips, write-editor text loss, timer accessibility, bounce-easing waiver, timing cap Safety margin, reduced-motion WebGL probe, STEAM portrait props, showcase copy fixes, etc.). Final `npx impeccable detect` is clean or has one documented waiver; the older `side-tab` finding in `globals.css:217` is waived and untouched.

## Tooling facts to remember
- Python is always run through `uv` (never the system `python`).
- Node 24 / pnpm 11 / Python 3.12 via uv / Docker (D12).
- No bash, no Makefile: all scripts are cross-platform Node.
- Never push to `main`; never deploy; work on a branch and open a PR.
