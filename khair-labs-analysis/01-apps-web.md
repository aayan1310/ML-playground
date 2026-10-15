# 01 - apps/web (Next.js 15 App Router)

> **Roman Urdu khulasa:** Ye asli frontend hai. Yahan games, lab entry ki 3D animation, landing page, AI helper aur Labs menu sab kuch hai. Content (jawab) sirf server pages import karte hain; client components ko data props ke through milta hai. two alag progress stores hain: Prompt Park aur showcase labs.

- **Package:** `@khair/web`, Next.js 15, React 19, TypeScript, Zustand.
- **Depends on:** `@khair/core`, `@khair/ui` (both source via `transpilePackages`), `three@0.186.0` (exact pin), `@phosphor-icons/react`, `zustand`.
- **Commands:** `pnpm dev` (3000), `pnpm build`, `pnpm start`, `pnpm typecheck`, `pnpm test`, `pnpm vendor` (runs before dev/build).

## next.config.ts
- `reactStrictMode: true`.
- `transpilePackages: ['@khair/core', '@khair/ui']` - both ship TS/CSS source, no build step.
- `rewrites().beforeFiles`: `'/' -> '/landing.html'` (the landing page is a built copy of the design file).
- `experimental.optimizePackageImports: ['@phosphor-icons/react']`.

## Routing map

| Route | File | Kind | Renders |
|---|---|---|---|
| `/` | `src/app/page.tsx` | server | `redirect('/landing.html')` (normally superseded by the rewrite) |
| `/landing.html` | `public/landing.html` | static | Built from `docs/design/Khair Labs.html` + `landing/edits.mjs` |
| `/sign-in` | `src/app/sign-in/page.tsx` | server | Placeholder until Phase 3; links to Prompt Park |
| `/labs/ai` | `src/app/labs/ai/layout.tsx` | layout | `<LabEntry lab="ai" />` |
| `/labs/ai/prompt-park` | `.../prompt-park/page.tsx` | server | `getWorld` + `summaries` -> `WorldView` |
| `/labs/ai/prompt-park/[level]` | `.../[level]/page.tsx` | server | `generateStaticParams`, `getLevel`, `PlayView` (main store) |
| `/labs/[lab]` | `src/app/labs/[lab]/page.tsx` | server | Showcase labs only; `dynamicParams=false`; `ShowcaseWorldView` |
| `/labs/[lab]` | `src/app/labs/[lab]/layout.tsx` | layout | `isShowcaseLab` guard else `notFound()`; `<LabEntry key={lab} lab={lab} />` |
| `/labs/[lab]/[level]` | `src/app/labs/[lab]/[level]/page.tsx` | server | `PlayView` with `showcase={{ base, worldName }}` |
| `/labs/entry-preview` | `.../entry-preview/page.tsx` + `entry-preview.tsx` | server+client | Plays all four animations; 404 unless `NEXT_PUBLIC_LAB_ENTRY_PREVIEW=true` |

Notes: the AI Lab lives in a **static** `ai` folder; STEAM/Lingo/Cyber use the **dynamic** `[lab]` folder. There are no `error.tsx` / `loading.tsx` / `not-found.tsx` files; missing content uses `notFound()`. `key={lab}` on `LabEntry` makes moving between labs a new entry (D18).

## Root layout (`src/app/layout.tsx`)
- Imports UI CSS in order: `fonts`, `globals.css`, `games.css`, `lab-entry.css`, `showcase.css`.
- `<html lang="en" data-kl="night" suppressHydrationWarning>`; `<head>` links `/labs-menu/menu.css`.
- Body: `.skip` skip link to `#main`, `<SiteNav />`, `<main id="main">{children}</main>`, `<SiteFooter />`.
- Metadata title "Khair Labs"; `viewport.themeColor` is the ink hex (metadata, not component CSS).

## Components

### `site-nav.tsx` (client)
Reads `useHydrated()` + `useProgress(s => s.xp)`. Renders `.nav > .wrap.nav-in`: brand link (`Logo` + "Khair Labs"), `<LabsMenuMount />`, and `.nav-right` with an XP pill (Phosphor `Lightning`) and a "Sign in" ghost button to `/sign-in`. Shows `0` XP and `is-loading` until hydrated (avoids mismatch).

### `site-footer.tsx` (server)
Brand link, footer nav (Labs -> `/#labs`, AI Lab -> `/labs/ai/prompt-park`, How it works -> `/#how`, Roadmap -> `/#roadmap`), and the D06 copyright line.

### `logo.tsx` (server, pure)
SVG `brand-mark`: four capsule strokes colored with tokens `--ai`, `--lingo`, `--steam`, `--cyber`. No raw hex.

### `labs-menu-mount.tsx` (client)
Hosts the shared framework-free menu (D18). Dynamic `import(/* webpackIgnore: true */ '/labs-menu/menu.js')` (must not be bundled), then `mountLabsMenu(root, { catalogUrl: '/labs-menu/catalog.json', onNavigate })`. `onNavigate` uses the Next router for app links. Keeps and calls `destroy` on unmount.

### `world-view.tsx` (client, Prompt Park)
- Exports `Stars({ n, label })` (three star icons, `off` class beyond n) and `WorldView`.
- `ZONES` 1-3: The Gate, The Workshop, The Clinic.
- Uses `useHydrated` + `useProgress(s => s.stars)`; empty stars until hydrated.
- Computes cleared count, total stars, boss gate (`bossGateMissing`), `bossOpen = UNLOCK_ALL || isUnlocked`, `mastered`.
- Left panel: header icon/name/topic, `test-chip` when `UNLOCK_ALL`, progress bar, `<details class="notebook">` of unlocked tips.
- Three zone sections with `.path` rows: `Link` when open, else `.node-row.locked`. Boss card shows missing levels or a "Take the exam" button.

### `showcase-world-view.tsx` (client, D17 showcase)
- `LAB_VIEW` per lab: steam `{ Flask, 'Science Notebook', ... }`, lingo `{ Translate, 'Word Notebook', ... }`, cyber `{ ShieldCheck, 'Safety Notebook', ... }`.
- Uses `useShowcaseHydrated`, `useShowcase(s => s.stars)`, `useShowcase(s => s.xp)`.
- Same layout/classes, plus a "Preview" chip, a note that progress is on-device only, an "XP in this preview" stat, a single World 1 zone (no boss), links from `base` (`/labs/<lab>/<level>`). Reuses `Stars`.

### `play-view.tsx` (client, the play engine)
- Props: `worldId`, `level`, `levelNumber`, `nextId`, `levelRefs`, optional `showcase`.
- Two store adapters: `PARK_STORE` (`useHydrated`/`useProgress`) or `SHOWCASE_STORE` (`useShowcase*`).
- `Game(...)` switch maps every `Item.type` to an arcade game (`NextWordGame`, `FogHuntGame`, `StreamGame`, `MatchGame`, `PatternGame`, `BadStepGame`, `NarrowGame`) or a standard game (`ChoiceGame`, `TfGame`, `SpotGame`, `OrderGame`, `SortGame`, `BuildGame`, `RevealGame`, `FixGame`, `CompareGame`, `WriteGame`).
- `Run` state machine `play | won | lost`: tracks `attempt`, item index, `hearts`, `fails`, `phase`, `summary`; `heartsRef` avoids stale values from async games.
- `advance()` computes `starsFor(hearts)`, calls `finishRun({ worldId, levelId, boss, correct, stars })`, shows the summary; won screen shows stars, XP + hearts-kept, notebook tip, and Next level (if open) or back. Lost screen: "Out of hearts", Try again.
- Keyboard: number keys click `.play [data-key=k]`, Enter continues/retries; ignores typing in a textarea.
- `LockedLevel` renders when not `UNLOCK_ALL` and the level is locked.

## Games

### `src/components/games/games.tsx` (standard rule-based games)
Types `Outcome = { ok, checks?, points? }`, `HelpMode = 'open' | 'after-fail' | 'none'`. Components: `ChoiceGame`, `TfGame`, `SpotGame` (optional `item.label` screen-reader name), `OrderGame`, `SortGame`, `BuildGame` (decoy chips have `slot: null`), `RevealGame` ("fog machine", builds prompt from `template` `{id}` placeholders, live answer from `outputs[outKey]`), `FixGame`, `CompareGame`, `WriteGame` (uses `runChecks`, `words`, `CheckResult` from `@khair/core/checks`; `Gates` live checklist; `FogMeter`). Shared helpers: `shuffle`, `useShuffled`, `CheckButton`, `Show`, `Goal`, `Checklist`, `Gates`, `FogMeter`.

### `src/components/games/arcade.tsx` (signature mini-games)
`useCountdown` (100 ms interval, pauses when the tab is hidden, fires once via effect), `TimerBar`, `HUD`, `Ready` (with a "Play without the timer" toggle bound to `useProgress.relaxed`), `Flash`. Games: `NextWordGame` ("Think Like the AI"), `FogHuntGame`, `StreamGame`, `MatchGame` ("Role Remix", supports `item.labels`), `PatternGame` ("Pattern Machine"), `BadStepGame` ("Bug Hunt", 2 points if first try else 1), `NarrowGame` ("Reverse Engineer"). Arcade games call `onMistake` during play and `onResult` once at the end.

## Lab entry animation subsystem (`src/components/lab-entry/`)

Design intent: overlay plays on **every** lab entry (D18), is skippable, covers the page from first paint, runs at most 3.5 s, and three.js loads only when a full animation plays.

- **`config.ts`** - `LAB_IDS = ['ai','steam','lingo','cyber']`; `LABS`: ai Hyperdrive (`--ai`, 3.2/2.6, dom), steam STEAM Orbit (`--steam`, 3.3/2.75, dom), lingo Word Weaver (`--lingo`, 3.4/2.75, particles), cyber Breach (`--cyber`, 3.2/2.5, scramble). `WIRED_LABS` all four; `MAX_MS=3500`, `OUT_MS=150`, `FADE_MS=900`, `SAFETY_MS=100`; `endAt(lab) = min(duration, (MAX_MS-OUT_MS-SAFETY_MS)/1000)`.
- **`policy.ts`** (pure, tested) - `planEntry({ reducedMotion, webgl })` -> `{ kind:'full' }` or `{ kind:'fade', ms, why }`; `isWeakDevice({ cores, memoryGB })` (≤4 cores or ≤4 GB); `scaleCount` halves on weak devices.
- **`support.ts`** - `webglSupported()` (cached, releases the probe context), `prefersReducedMotion()`, `weakDevice()`, `fontsReady(ms=700)`.
- **`palette.ts`** (pure except the browser reader) - `TOKEN_NAMES` (`--bg --text --muted --accent --gold --bad --ok --ai --steam --lingo --cyber`), `parseColor`, `readPalette`, `browserPalette()`; returns null (=> fade fallback) if a token is missing/bad.
- **`math.ts`** - `clamp`, `seg`, `eio`, `eo`, `ei`, `back` (easeOutBack), `rnd`, `pick` (ported from the reference).
- **`lab-entry.tsx`** (client) - phases `cover | full | fade | done`; server renders `cover` so the lab page never flashes. Scramble helper for Cyber. Timers in a ref; focus moves to Skip and is restored after. `run()` builds the palette, checks reduced motion, probes WebGL only if it could play, locks scroll, then `simpleFade` or full. Full path: 2 s safety timer -> fade; `Promise.all([import('./player'), fontsReady()])`; waits up to 20 frames for the stage; `mod.startScene(...)`; watchdog; catch -> fade. Escape skips; Tab is trapped on Skip. Renders `.lab-entry` with `role="dialog"`, `aria-modal`, stage/flash/title and a Skip button.
- **`player.ts`** (the only static three.js importer) - `SCENES = { ai, steam, lingo, cyber }`; `startScene` creates a `WebGLRenderer` (throws `NoWebGLError`), caps pixel ratio at 2, uses a `ResizeObserver`, pauses the clock while hidden, fires title at `info.titleAt` and end at `endAt(lab)`, handles `webglcontextlost`. `dispose` frees geometries/materials/textures/instanced buffers, calls `kit.dispose()`, `renderer.dispose()` and `forceContextLoss()`, removes the canvas. Writes `dataset.weak` and `dataset.particles` (proves halving).
- **`scenes/`** - `kit.ts` (shared `Kit`: palette, fonts, sRGB canvas textures, `mix`, `glow`, `pointsMat`, `geo`, `textSprite`, `lit` lights ×PI, `starfield`, `nebula`, `makeConfetti`, `dispose`); `ai.ts`, `steam.ts`, `lingo.ts`, `cyber.ts` export the `SceneFn`s; each routes particle counts through `ctx.n(...)` for weak-device halving.

Const-related fact: `MAX_MS` cap, `OUT_MS` fade and `SAFETY_MS` margin together keep the overlay under 3.5 s; measured 3.35-3.41 s.

## Store & flags

### `src/lib/flags.ts`
- `UNLOCK_ALL = process.env.NEXT_PUBLIC_UNLOCK_ALL === 'true'` - opens every level incl. Boss.
- `LAB_ENTRY_PREVIEW = process.env.NEXT_PUBLIC_LAB_ENTRY_PREVIEW === 'true'` - enables `/labs/entry-preview`.
- Both must be false in real builds.

### `src/store/progress.ts` (client)
- `useProgress` - Zustand `persist`, localStorage key **`kl-progress`** (v1): `{ xp, stars, badges, days, relaxed }`; `finishRun` computes `prevStars`, `xpForRun`, badge deltas, updates xp/stars (best), days; `setRelaxed`; `reset`.
- `useHydrated()` - subscribes to `persist.hasHydrated()` to avoid hydration mismatches.
- `useShowcase` - separate `persist`, localStorage key **`kl-showcase`** (v1): `{ xp, stars }`; `finishRun` uses the **same** rule functions but no badges/days; `reset`.
- `useShowcaseHydrated()` - same pattern for the showcase store.
- Both are localStorage-only; the showcase store never touches `kl-progress` or the backend (asserted by tests).

## Public assets

### `public/labs-menu/` (shared framework-free component, D18)
- **`menu.js`** - pure exports: `PHONE_QUERY='(max-width: 767px)'`; `TIMING={open:90, close:250, focusClose:120, clickGuard:400}`; `ELECTRON_SPEED=1.9`; `starsFor(lab, read)` (sums stars per lab's open worlds); `iconHtml(id)` (CSS/SVG only: AI neurons, STEAM orbits, Lingo glyphs, Cyber shield+scan); `spotHtml`, `listHtml`, `sheetHtml`, `menuHtml`; `mountLabsMenu(root, {...})` injects Labs button + panels, fetches the catalog (falls back to `/#labs`), renders desktop + phone sheet, handles hover/click/keyboard/focus, star chips, and the electron loop at one fixed speed. Returns `{ open, close, ready, destroy }`.
- **`boot.js`** - starts the menu on the landing page. **`menu.d.ts`** - types. **`catalog.json`** - generated from `packages/core/src/labs.ts`. **`menu.css`** - Night tokens only.
- Landing + app use the exact same files; the landing test proves it.

### `public/ai-helper/` (on-device AI helper, no backend calls)
- **`helper.js`** - `mountGate(root, host)` + `Session`: consent -> `requestPersistence` -> `checkSupport` -> `probeDevice` -> detect cached models -> choose with fallback -> space check -> start with retries -> `host.ready`. Also `progress()`, `remove()`, `wireChip`, and the full `createUi` state renderer (`idle`, `consent`, `working`, `paused`, `problem`, `ready`).
- **`models.js`** - `MODELS` (builtin Gemini Nano, webllm SmolLM2 360M, cpuStrong Qwen2.5 0.5B, cpuLight SmolLM2 135M) with pinned revisions, file sizes, SHA-256, real totals; `PRIORITY=['builtin','webllm','cpuStrong','cpuLight']`.
- **`plan.js`** (pure, tested) - `checkSupport`, `gpuIsGoodEnough`, `cpuIsStrong`, `eligible`, `choose`, `fallbackOrder`, `spaceNeeded`, `checkSpace`; `SPACE_FACTOR=1.25`, `SPACE_MARGIN=100 MB`.
- **`messages.js`** - student copy with a banned technical-word list (`BANNED_WORDS`).
- **`engines.js`** - `readEnv`, `probeDevice` (Chrome `LanguageModel` + WebGPU adapter), `storageEstimate`, `requestPersistence`, `startBuiltin`, WebLLM helpers, Transformers/CPU path with a custom cache hook; vendor URLs `/vendor/web-llm/index.js`, `/vendor/transformers/transformers.min.js`.
- **`download.js`** - resumable, SHA-256-verified downloads (4 MiB chunks, HTTP Range, `transformersCache`, `IntegrityError`, `RangeNotSupportedError`). **`sha256.js`** - streaming SHA-256. **`store.js`** - `prefs` / `readyModels`. **`helper.css`** - small additions on Night tokens.

### `public/landing.html`
Built copy of `docs/design/Khair Labs.html`; served at `/` and `/landing.html`. Its wiring is captured by `landing/edits.mjs`.

## Landing build & tests
- **`landing/edits.mjs`** - `EDITS`: exact string swaps (CTA buttons -> Prompt Park; nav replaced by `data-labs-menu` + menu CSS/script; journey/roadmap coming-soon; `ai-helper-gate`; `only-local-code`; `webllm-local`/`transformers-local`; `cube-steady-speed`; `cube-back-face`; `sign-in`; `footer-text`). `applyEdits` throws unless every `find` matches exactly once.
- **`landing/landing.test.mjs`** - built landing = source + edits; list, build and doc stay in sync.
- **`landing/ai-helper.test.mjs`** - Node tests for the pure AI-helper logic.
- **`src/components/lab-entry/lab-entry.test.ts`** - names/timing, ≤3.5 s cap, all four labs wired, `planEntry` has no memory, weak-device rules, tokens exist/distinct, no raw colours, three.js imported only by `player.ts`/`scenes/*`, overlay safety, player dispose/pixel-ratio/context-loss.
- **`src/components/labs-menu.test.ts`** - timing, HTML, catalog rendering, escaping, `starsFor`, icons with no three.js, one fixed `ELECTRON_SPEED`.
- **`src/store/showcase.test.ts`** - showcase XP/stars rules match Prompt Park, isolation from `kl-progress`, separate keys, no backend calls, route set, content imported only by server pages.

## Cross-cutting constraints observed
- Client components never import `@khair/core/content` or `/showcase` (answers); server pages pass summaries as props.
- Progress decisions live only in `rules.ts`; components call rule functions.
- No raw hex/rgb in component source or `lab-entry.css`.
- three.js is dynamically imported and stays out of the main/landing bundle.
- Motion rule (D18): menu electron loop and landing cube run at one fixed speed; hover/focus never changes speed.
- Two isolated on-device progress stores; nothing is sent to the backend yet.

## Known limits (from STATUS)
- App header has no per-lab links (the approved nav has Labs, How it works, AI Lab, Roadmap; "Labs" leads to the cards) - superseded by D18 nav.
- Arabic and Urdu text uses browser fallback fonts (no Nastaliq).
- A `next dev` server shares `apps/web/.next` with a production build; verification used a separate git worktree.
- Portrait phones show STEAM Orbit props small (reference scales the ring to width).
- The landing page has its own copy of three.js inside (hero logo), part of the approved design, untouched.
