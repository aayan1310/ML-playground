# 02 - packages/core

> **Roman Urdu khulasa:** Ye package poore project ka dimagh hai: types, scoring rules (XP/stars/hearts/badges/streak), prompt checks, level content, aur lab catalog. Rules yahan TypeScript mein hain aur backend mein Python mirror bhi hai. Content mein jawab (answers) hote hain, is liye sirf server pages ise import karte hain.

- **Package:** `@khair/core`, private, ESM (`type: module`). **No build step** - `.ts` sources are exported directly and compiled by consumers (`transpilePackages`).
- **Exports:** `./types`, `./rules`, `./checks`, `./content` (server only), `./catalog.json`, `./showcase` (server only), `./labs` (client-safe).
- **tsconfig:** target ES2022, `strict`, `noEmit`, `moduleResolution: bundler`, `resolveJsonModule`, `allowImportingTsExtensions`. Tests/scripts import with explicit `.ts` extensions.

## `src/types.ts` - shared content data model

Pure data types so content can move to a database later.

**`Check` union** (evaluated by `checks.ts`):
```ts
type Check =
  | { kind:'any'; words: readonly string[]; label: string }
  | { kind:'none'; words: readonly string[]; label: string }
  | { kind:'number'; label: string }
  | { kind:'minWords'; n: number; label: string }
  | { kind:'maxWords'; n: number; label: string }
  | { kind:'pattern'; source: string; flags?: string; label: string }
  | { kind:'count'; source: string; min: number; label: string }
```
`label` is the human-readable line shown to the learner.

**Common base:** `type Base = { q: string; explain: string }`.

**`Item` union (17 members):**

| Type | Key fields | Meaning |
|---|---|---|
| `ChoiceItem` | `options`, `answer`, `show?` | Multiple choice |
| `TfItem` | `statement`, `labels:[string,string]`, `answer:0\|1` | True/false |
| `SpotItem` | `tokens[]`, `answer`, `label?` | Tap the wrong word; `label` is the sr name |
| `OrderItem` | `steps[]` | Put steps in order |
| `SortItem` | `buckets[]`, `chips:{text,bucket}[]` | Sort chips into buckets |
| `RevealItem` | `goal`, `template`, `cards`, `outputs` | Fog Machine; output keyed by sorted needed ids joined `"+"` |
| `BuildItem` | `slots[]`, `chips:{text,slot:number\|null}[]` | Snap blocks into slots; `null` = decoy |
| `FixItem` | `tokens[]`, `faults:{index,options,answer}[]` | Fix broken tokens |
| `CompareItem` | `context?`, `a`, `b`, `better:0\|1`, `reasons[]`, `reason` | Pick the better answer + why |
| `WriteItem` | `goal`, `starter?`, `hint?`, `example?`, `checks`, `live?` | Free-text prompt |

**Signature games (7):** `NextWordItem` (`rounds` with `WordOption={word,p}`; `flat`), `FogHuntItem` (`seconds`, `prompts` with `fog` indices), `StreamItem` (`choices` tone ok/bad/mid, `cards`), `MatchItem` (`roles`, `answers`, optional `labels`), `PatternItem` (`need`, `examples`), `BadStepItem` (`wrong`, `fix`), `NarrowItem` (`chips`, `stages`; last stage equals target).

**Containers:** `Zone = 1|2|3|4`; `Level = { id, title, zone, boss?, how, tip, items }`; `World = { id, name, topic, lead, levels }`; `LevelSummary = Pick<Level,...> & { count }` - explicitly answer-free, safe for the world page.

## `src/rules.ts` - progress scoring (single source of truth)

Pure functions, unit-tested. Components must call these and never decide progress themselves (AGENTS.md invariant). This is the TS half of the paired `rules.ts`/`rules.py` mirror.

**Constants:** `HEARTS=3`, `XP_CORRECT=10`, `XP_FIRST_CLEAR=20`, `XP_PERFECT=10`, `BOSS_GATE_STARS=2`.

**`levelKey(worldId, levelId)` -> `` `${worldId}/${levelId}` ``** - the canonical composite key used everywhere.

| Function | Signature | Behavior / edge cases |
|---|---|---|
| `loseHeart` | `(hearts)=>number` | `max(0, hearts-1)` |
| `starsFor` | `(heartsLeft)=>number` | clamp to `[0,3]`; **stars = hearts left** |
| `xpForRun` | `(correct, stars, prevStars)=>{base,clear,perfect,total}` | `base=correct*10` always paid; `clear = (stars>0 && prevStars===0) ? 20 : 0`; `perfect = (stars===3 && prevStars<3) ? 10 : 0`. `(5,3,0)=80`, `(5,2,1)=50`, `(5,3,2)=60`, `(5,3,3)=50`, `(5,0,0)=50` |
| `bestStars` | `(prev,next)=>number` | `max`; stars never decrease |
| `bossGateMissing` | `(worldId, levels, stars)=>string[]` | ids of non-boss levels with `< 2` stars |
| `isUnlocked` | `(worldId, levels, index, stars)=>boolean` | boss open iff no missing; index 0 always open; else previous level ≥ 1 star |
| `currentIndex` | `(worldId, levels, stars)=>number` | first unlocked level with 0 stars; `-1` if none |
| `badgesAfterRun` | `({badges,stars,boss,worldId})=>string[]` | dedupe; `first-level` if stars>0; `perfect-level` if 3; if boss & stars>0 add `world-<id>` + `prompt-master` |
| `dayKey` | `(d)=>string` | UTC `YYYY-MM-DD` |
| `addDay` | `(days, today)=>string[]` | add if absent, then sort (ISO = chronological) |
| `streak` | `(days, today)=>number` | consecutive days ending today or yesterday (UTC); 0 if stale |

## `src/checks.ts` - rule-based prompt scoring

Pure, instant, offline. Every result carries a human label. (Small models grade poorly, so rules are used instead.)

- `words(text)` - whitespace-separated count.
- Private `hasWord(text, w)` - empty needle -> false; plain word `^[a-z0-9']+$` -> whole-word regex; else substring.
- `NUMBER_WORDS` matches one..twelve, fifteen, twenty, thirty, forty, fifty, hundred (**not** 13/14/16-19/60/70/80/90).
- `runCheck(check, text)`: `any` -> some; `none` -> not any; `number` -> `/\d/` or number word; `minWords`/`maxWords`; `pattern` -> `RegExp(source, flags??'i')`; `count` -> `(text.match(new RegExp(source,'gi'))??[]).length >= min`. Wrapped in try/catch: **a broken regex fails (false), never crashes the level**.
- `runChecks(checks, text): { results, pass }` - per-check `{label, pass}`; `pass = results.every(r => r.pass)` (all-or-nothing).

## `src/content/` - Prompt Park (server only, holds answers)

### `content/index.ts`
- `WORLDS: World[] = [promptPark]`.
- `getWorld(id)`, `getLevel(worldId, levelId)` -> `{ world, level, index, next }` or undefined (`next` = next id or null).
- `summaries(world)` -> `LevelSummary[]` (strips `items`, adds `count`).

### `content/prompt-park.ts`
- World: `id:'prompt-park'`, `name:'Prompt Park'`, `topic:'Prompt Engineering'`.
- **13 levels across 4 zones, boss last, 52 items total:**
  - Zone 1: `next-word` (3), `fog-machine` (4), `prompt-blocks` (5), `spot-the-fog` (3)
  - Zone 2: `coach-pip` (4), `copy-my-pattern` (4), `constraint-gauntlet` (3), `step-by-step` (4)
  - Zone 3: `prompt-doctor` (5), `good-vs-excellent` (2), `reverse-engineer` (4), `prompt-shield` (3)
  - Zone 4: `prompt-master` (boss, 8)
- Authoring rules encoded in content: one signature game per level, **at most one quiz item** per level, help fades by zone, **boss gives no help**.
- Reusable `Check` constants: `ROLE`, `AUDIENCE`, `FORMAT`, `STEPS`, `NO_BLANK`, `PASS_FAIL`.
- Boss `prompt-master` is a 4-round exam: Diagnose, Judge (2× compare), Write (table/few-shot/multi-step), and "Build your bot" (6 hidden-test checks).

### `src/showcase/` (D17, server only)
- Three worlds, one per lab: `science-sparks` (steam), `word-market` (lingo), `password-fort` (cyber).
- **No boss, one zone, 3 short levels each, 26 items total** (2-3 per level).
- Only five existing game types: `sort`, `order`, `choice`, `spot`, `match`.
- `word-market` reuses the Role Remix match game with custom `labels` for languages.
- **Not in `WORLDS` and not in `catalog.json`** - the backend never accepts these runs.
- Exports: `SHOWCASE_LABS`, `SHOWCASE`, `isShowcaseLab`, `getShowcaseWorld`, `getShowcaseLevel`, `showcaseSummaries`.

## `src/labs.ts` - the lab catalog (D18)

Plain client-safe data; the **single source** for the Labs menu. A world is "open" if it has a `world` id.

Types: `WorldStore='park'|'showcase'`; `CatalogWorld={ name, world?, store? }`; `CatalogLab={ id, name, token, tag, href, worlds }`.

`LAB_CATALOG` (order ai/steam/lingo/cyber):

| Lab | href | Open World 1 | Locked worlds |
|---|---|---|---|
| `ai` AI Lab | `/labs/ai/prompt-park` | Prompt Park (`park`) | Ethics Island, ML Factory, Agent City |
| `steam` STEAM Lab | `/labs/steam` | Science Sparks (`showcase`) | Circuit Garage, Builder Yard, Art + Code, Math Quest |
| `lingo` Lingo Lab | `/labs/lingo` | Word Market (`showcase`) | Grammar Gym, Story Studio, Speak Up |
| `cyber` Cyber Lab | `/labs/cyber` | Password Fort (`showcase`) | Phish Finder, Network Maze, Ethical Hacking |

Other exports:
- `STORE_KEY = { park:'kl-progress', showcase:'kl-showcase' }` (must match `apps/web/src/store/progress.ts`).
- `MENU_LINKS = { teachers:'/sign-in?for=teachers', how:'/#how', roadmap:'/#roadmap' }`.
- `isOpen(w) = w.world !== undefined`; `isPreview(lab)` - true for steam/lingo/cyber (temporary showcase content).

## Generation scripts (`scripts/`)

- **`gen-catalog.ts`** - `buildCatalog()` -> `{ worlds: WORLDS.map(...) }` where each level is `{ id, boss, items }`. **No answers.** CLI guard so tests can import `render`. `--check` reads `../catalog.json`, normalizes CRLF->LF, compares, exits 1 if stale ("Run: pnpm gen:catalog"). Default writes `packages/core/catalog.json`.
- **`gen-labs-menu.ts`** - `buildMenuCatalog()` -> `{ version, links, labs:[{ id,name,token,tag,preview,href,worlds:[{name,open}],progress:[{key,world}] }] }`. Writes to `apps/web/public/labs-menu/catalog.json`. Same CLI guard + `--check`.
- **`gen-rules-vectors.ts`** - **one-off helper**, not wired to any npm script. Emits `packages/core/test-vectors/rules.json` golden vectors for all rule functions. Header warns: do not re-run to "fix" a failing test; change `rules.ts` **and** `rules.py` together and edit vectors by hand.
- **`gen-showcase-questions.ts`** - renders `docs/product/SHOWCASE_QUESTIONS.md` (plain-text question list for the owner to review). Same CLI guard + `--check`.

## `catalog.json` (committed artifact)
`{ "worlds": [...] }`, currently one world `prompt-park` with 13 levels, each `{ id, boss, items }`. Only `prompt-master` has `boss: true`. **No answers.** Item counts match Prompt Park.

## `test-vectors/rules.json` (golden vectors)
Shared contract between `rules.test.ts` and `gamification/tests/test_rules_parity.py`. Covers `loseHeart`, `starsFor`, `xpForRun` (9 cases), `bestStars`, `bossGateMissing`, `isUnlocked`, `currentIndex`, `badgesAfterRun` (7 cases), `addDay`, `streak`, `dayKey`.

## Test coverage

- **`checks.test.ts`** - `words` counts; `any` whole-word vs substring; `none`; `number`; `min/maxWords` boundaries; `count`; broken regex returns false (no throw); `runChecks` all-or-nothing.
- **`rules.test.ts`** - direct assertions **plus** replay of every vector section (shared contract).
- **`content.test.ts`** - per-world: unique ids, one boss last; answers valid for every item type; worked examples pass checks; starters **fail** checks unedited; boss write items have no hint/example/starter; no em/en dashes; ≤1 quiz per level; every regular level has a signature game.
- **`catalog.test.ts`** - committed `catalog.json` equals `render()` (CRLF-normalized); keys exactly `['boss','id','items']` (no answer leak).
- **`showcase/showcase.test.ts`** - 3 labs/worlds, 3 levels each, no boss, zone 1; per-lab type order matches the approved order; ids lowercase-kebab and unique vs Prompt Park; 2-3 items/level; copy lengths; only allowed game types (and `play-view.tsx` has a `case` for each); structural constraints per game; no tell in answer position/length; no dashes/placeholders/unsafe words; subject mentions; helper behavior; absent from catalog/`WORLDS`; exactly 26 items; `SHOWCASE_QUESTIONS.md` equals `renderQuestions()`.
- **`labs.test.ts`** - 4 labs in order, distinct tokens, tagline lengths, taglines/world names appear in the approved design files, every open world is real in the correct store, locked worlds have no store, World 1 open / others locked, every real world present, `isPreview` exactly steam/lingo/cyber, hrefs map to real pages, `MENU_LINKS` exact, `buildMenuCatalog().progress` matches the stores, `labs-menu/catalog.json` equals `render()`, no `answer` string.

## Cross-cutting invariants
1. **Single source of progress:** `rules.ts` (mirrored by `rules.py` + shared vectors).
2. **Server/client split:** `content/` and `showcase/` hold answers and are server-only; `labs.ts` is client-safe; `LevelSummary` strips `items`.
3. **No answer leakage:** catalogs contain no answers; tests assert level objects have exactly `{boss,id,items}`.
4. **The catalog is derived, never hand-edited:** `catalog.test.ts` compares committed file to `render()`; `check:catalog`/`check:labs-menu` fail on staleness (CRLF-normalized on Windows).
5. **Showcase isolation (D17):** absent from `WORLDS`/`catalog.json`, never sent to the backend.
6. **Content authoring is machine-enforced.**
7. **Time model is UTC-only.**
8. **`gen-rules-vectors.ts` is intentionally not runnable via a script name** - vectors are a hand-maintained golden contract.
