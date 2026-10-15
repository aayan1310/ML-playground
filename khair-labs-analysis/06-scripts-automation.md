# 06 - scripts / automation

> **Roman Urdu khulasa:** Ye sab cross-platform Node scripts hain (Windows/macOS/Linux par ek jaisi chalti hain). Inse doctor check, landing build, API generate, bundle check, screenshots aur real-Chrome e2e tests chalte hain. Koi bash ya Makefile nahi.

All scripts are plain Node (`.mjs`) run from the repo root unless noted. Package scripts that call them live in the root `package.json`.

| Script | npm command | Purpose |
|---|---|---|
| `doctor.mjs` | `pnpm doctor` | Check required tools |
| `build-landing.mjs` | `pnpm build:landing` | Build the landing copy (+ `--check`) |
| `gen-api.mjs` | `pnpm gen:api` | Regenerate `packages/api` from Django schema |
| `check-bundle.mjs` | `pnpm check:bundle` | Enforce three.js stays lazy |
| `screenshots.mjs` | `pnpm screenshots` | Capture screenshots |
| `compare-shots.mjs` | `pnpm compare-shots` | Pixel-compare two screenshot folders |
| `vendor-ai.mjs` | `pnpm vendor` (predev/prebuild) | Copy pinned AI libraries to `public/vendor` |
| `test-showcase.mjs` | `pnpm test:showcase` | E2E showcase labs (manual, not CI) |
| `test-nav-menu.mjs` | `node scripts/test-nav-menu.mjs` | E2E Labs menu + entry (manual) |
| `test-lab-entry.mjs` | `pnpm test:lab-entry` | E2E lab entry animations (manual) |
| `test-ai-helper.mjs` | `node scripts/test-ai-helper.mjs` | E2E AI helper with real downloads (manual) |
| `test-lab-cubes.mjs` | `node scripts/test-lab-cubes.mjs` | E2E landing cube motion (manual) |

## `doctor.mjs`
Checks: Node 24 (from `process.versions.node`), `pnpm --version` present and major >=10, `uv --version` present, Python **3.12 via uv** (`uv python find 3.12`, then its `--version`), `docker --version`. Uses `spawnSync` with `shell` on win32. Prints ok/fail + a fix per check; **exits 1 if any failed**, 0 if all ok. No files written, no network.

## `build-landing.mjs`
Reads `docs/design/Khair Labs.html` (never edited), normalizes line endings to LF, applies `apps/web/landing/edits.mjs` `applyEdits`, and writes `apps/web/public/landing.html`. `--check` compares the committed copy to the built result (LF-normalized) and exits 1 with an error if different. (An edit failing to match throws loudly.)

## `gen-api.mjs`
1. In `backend/`: `uv run python manage.py spectacular --file ../packages/api/openapi.json --format openapi-json --validate --fail-on-warn`.
2. In repo root: `pnpm --filter @khair/api gen` (openapi-typescript -> `src/schema.d.ts`).
Writes `openapi.json` + `schema.d.ts`. CI fails if `packages/api` differs afterwards.

## `check-bundle.mjs`
After `pnpm build`, enforces the D16 rule.
- Requires `apps/web/.next/app-build-manifest.json` (else tells you to build first).
- Walks `.next/static/chunks/*.js` looking for the marker `THREE.WebGLRenderer`; asserts **exactly one** chunk contains it and that it is >= 200000 bytes.
- Fails if any page's files, or `build-manifest.json` (`polyfillFiles`, `rootMainFiles`, pages), reference the three.js chunk.
- Fails if `public/landing.html` contains `/_next/`, or matches `/lab-entry|\/ai-helper\/helper\.js|.*three/`, or references the chunk paths.
- Prints checked routes; exit 1 on any problem. Read-only.

## `screenshots.mjs`
`node scripts/screenshots.mjs <baseUrl> <outDir>` (defaults `http://localhost:3000`, `shots`).
- 13 Prompt Park levels; viewports `390x844` and `1440x900`.
- Seeds a deterministic `kl-progress` localStorage and injects a fixed-seed `Math.random` (LCG) so shuffled games look identical across runs.
- Scenes: world (night/progress), sign-in, landing copy, landing original (from disk), a level feedback, and one per level.
- Uses Playwright/Chromium (`CHROMIUM_PATH` override), `reducedMotion: 'reduce'`, waits for `.lab-entry` to detach (≤6s), disables animations, waits for fonts, screenshots full page.
- Writes `out/<scene>-<viewport>.png` for each scene/viewport.

## `compare-shots.mjs`
`node scripts/compare-shots.mjs <dirA> <dirB>`. For each `.png` in A: loads both, reports MISSING/SIZE/DIFF, uses `pixelmatch` (threshold 0). Prints `ok/total identical`; exits 1 if any bad. Read-only.

## `vendor-ai.mjs`
Runs before `next dev` and `next build` (`predev`/`prebuild`).
- Copies browser files of pinned packages into `apps/web/public/vendor/`:
  - `@mlc-ai/web-llm` -> `lib/index.js`, `LICENSE` (dir `web-llm`)
  - `@huggingface/transformers` -> `dist/transformers.min.js`, `dist/ort-wasm-simd-threaded.jsep.mjs`, `.wasm`, `LICENSE` (dir `transformers`)
- Clears the output first; verifies the installed version matches the pin in `apps/web/package.json` (throws if not); writes `VERSIONS.json`.
- `public/vendor/` is generated and gitignored.

## E2E test scripts (real Chrome, manual, **not in CI**)
These open real Chrome windows, measure timing/FPS and/or download real model files. Each is invoked directly (some via pnpm) and writes evidence under `design-evidence/` next to the repo.

- **`test-showcase.mjs`** (`pnpm test:showcase`): imports showcase content from core; records fetch/console; helper `answer()` handles choice/spot/order/sort/match; groups: `labs` (landing cards -> lab page, entry animation, level play to "Level clear!", preview XP/stars, park unchanged, no `/api`), `rules` (locked links, one miss = 2 stars, replay bonuses once, out of hearts), `landing` (cards/roadmap/coming-soon toasts), `shots` (screenshots). Output `design-evidence/showcase/`.
- **`test-nav-menu.mjs`**: groups `menu`, `spotlight`, `icons` (samples animation rate at rest/hover - must not change; Steam electron speed ~1.9 rad/s), `phone` (sheet cards ≥44px), `entry` (animation plays on every entry, not on world<->level, after back/forward, refresh, direct URL; no sessionStorage), `axe` (axe-core WCAG 2 A/AA + best practice), `shots`. Output `design-evidence/nav-menu/`.
- **`test-lab-entry.mjs`**: instruments WebGL contexts, overlay life and rAF frames. Groups `ai`, `labs` (needs `NEXT_PUBLIC_LAB_ENTRY_PREVIEW=true`), `leak` (5 enter/leave rounds, no leaked context), `bundle` (three.js only after entering), `fps`, `shots`. Asserts play time ≤3.5s, reduced motion = no canvas, weak device halves particles. Output `design-evidence/lab-entry/` + `fps.json`.
- **`test-ai-helper.mjs`**: persistent Chrome profiles; scenarios `not-now`, `builtin-mock`, `no-space`, `unsupported`, `cpu-light`/`cpu-strong`, `cpu-offline-pause`, `cpu-slow`, `cpu-stalled`, `webllm`, `remove`, `remove-running`. Performs real HuggingFace downloads (some throttled via CDP), verifies resume after refresh (no piece re-downloaded), finished -> "no download needed" + zero outside requests, offline answers, remove deletes all files. About 1 GB for `all`.
- **`test-lab-cubes.mjs`**: measures the landing cube spin (must be 12 s/turn at rest **and** hover), all six faces 76x76px, and keeps the cube ≥8px inside the card over a full turn. Writes screenshots to `design-evidence/lab-cubes/`.

## Relationship to CI
Only `doctor` (manual), `build-landing`, `gen-api`, `check:catalog`, `check:labs-menu`, `build`, `check:bundle`, `typecheck`, `test` are used by the developer/CI flow. The Chrome e2e scripts are evidence tools run by a human, not gates.
