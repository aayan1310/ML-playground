# ML Playground — Deep Project Analysis (2026-10-20)

Audience: an external reviewer/assistant taking over context. Written from the
working tree as it stands today, including uncommitted changes. Nothing here is
committed to git unless noted.

---

## 1. What this project is

An educational, browser-only web game that teaches kids how machine learning
works, using cats vs dogs as the example. The student:

1. Sorts pictures into a "cat" box and a "dog" box (the student does the
   labelling, and may make mistakes).
2. Presses **Train** — a real scikit-learn `LogisticRegression` trains on the
   student's labels via a real FastAPI backend.
3. Tests the model on held-out images it has never seen, seeing the real
   prediction + confidence, then the real revealed answer (mandatory reveal
   after every prediction).
4. Sees how many predictions matched, with an age-appropriate explanation that
   the model learned from labelled examples and was tested on separate images.

**Core design principle:** nothing is mocked. No fake ML, no fake confidence,
no local hard-coded data. Every model action hits the real backend. Images are
never uploaded by students — they pick from a fixed bundled set of 60 Oxford-IIIT
Pet images. Each image was precomputed ONCE offline into a 512-dim ResNet18
embedding; the browser never runs ML — it only talks to the FastAPI service,
which trains on the stored vectors.

The repository has three code areas plus prep tooling and docs. There is a
partner's larger game (Next.js/Phaser "study website") this is meant to slot
into later; that is out of scope here.

---

## 2. Repository layout (current)

```
ML playground/
  prep/                      # offline data pipeline (torch, run once)
    prepare_dataset.py       # downloads Oxford-IIIT Pet -> images + manifest.json
    compute_embeddings.py    # ResNet18 -> embeddings.npy
    export_browser_data.py   # opaque ids + JSON files (hardened; two archived variants)
    evaluate_offline.py      # accuracy/confidence tables (+ --json-input mode)
    demo_terminal.py         # terminal demo (needs data path update)
    data/                    # manifest.json, embeddings.npy, id_mapping.json (prep-internal)
  ml-game-backend/           # FastAPI + sklearn service  (Stage 2/3/4 DONE)
    app/main.py              # routes, CORS, image mount, error envelope
    app/ml.py                # all ML logic: pool, setup, train, predict, reveal
    data/                    # dataset.json, embeddings.json, labels.json + images/ (server-only)
    tests/                   # 75 tests, all passing
  ml-game-frontend/          # Vite + React 19 app  (Stage 5a DONE)
    src/api.js               # real API client, imageUrl() -> localhost:8000
    src/i18n.js              # en / ru / ur translation module
    src/App.jsx              # shell, language selector, forest theme
    src/screens/Intro.jsx    # intro screen
    src/screens/Stage1.jsx   # Stage 1 full state machine (~620 lines)
    src/components/Guide.jsx # CSS robot + speech bubble
    src/SortingGame.*        # OLD prototype, now orphaned/unused (keep or archive)
  docs/
    PLAN.md                  # master plan (Stage 0-4 recorded done; §5 API table STALE)
    GAME-FLOW-PLAN.md        # gameplay decisions, rev 5 (authoritative gameplay)
    data-contract.md         # API contract (header still says "PROPOSED" — stale)
    evaluation.md            # real numbers the engine should match
    adr-ml-service.md, data-layout.md, STAGE0_AUDIT.md, evaluation-results.json
    CONCEPT-IMAGE.jpg        # visual reference (model cannot view images)
  archive/                   # superseded FastAPI version, old contract revs, old export scripts
  khair-labs-analysis/       # unrelated analysis docs of another repo
```

**Git state:** 3 commits total ("Initial commit", "2ND COMMIT (MASTER PLAN AND
GAME PLAN GIVEN)", "2ND COMMIT (PART 2)"). Everything from Stages 0–5a is
UNCOMMITTED working-tree changes (intentionally — task rules said do not
commit). `git status` shows ~20 modified files + ~15 untracked files.

---

## 3. The data pipeline (offline, done once)

1. `prep/prepare_dataset.py` — needs torch. Downloads Oxford-IIIT Pet
   (`binary-category`), fixed seed 42, picks 30 cats + 30 dogs, resizes longer
   side ≤512px, writes `data/images/` (`cat_001..dog_030`) and
   `data/manifest.json` (22 train / 8 test per class). Cross-checks the dataset's
   binary label against filename capitalization (cat breeds uppercase, dogs
   lowercase) and stops on disagreement.
2. `prep/compute_embeddings.py` — needs torch. ResNet18 (ImageNet weights,
   `model.fc = Identity`), standard ImageNet preprocessing, `eval()` +
   `no_grad`, L2-normalized, writes `data/embeddings.npy` (60×512, manifest
   order).
3. `prep/export_browser_data.py` — numpy only. Shuffles ids with seed 42 into
   opaque `img_001..img_060` (filenames never reveal class), shuffles train/test
   with seed+1. Writes `public/ml-playground/` (images + dataset.json only) and
   prep-only `id_mapping.json`; `labels.json` and `embeddings.json` go to
   `ml-game-backend/data/` and NEVER to `public/`.
4. `prep/evaluate_offline.py` — numpy + sklearn. Reference
   `LogisticRegression(C=10, lbfgs, l2, max_iter=1000)`: perfect-label accuracy,
   train-size sweep, labeling-mistake sweep, confidence on correct vs wrong.
   `--json-input` mode added in Stage 4 for parity testing.

The checked-in `.venv` does NOT contain torch; steps 1–2 need
`prep/requirements-prep.txt` installed. Steps 3–4 are cheap and re-runnable.

**Key data facts:** Level 1 = 44 train images (22 cat + 22 dog) + 16 test
(8+8). Dataset in `ml-game-backend/data/`: dataset.json (train/test split with
id+url), embeddings.json (dim 512, L2-normalized, 6 decimals), labels.json
(id->cat|dog). Total 60 ids; ids opaque.

---

## 4. The backend (Stages 2–4, DONE, 75/75 tests passing)

Run: `uvicorn app.main:app --reload --port 8000` from `ml-game-backend/`.
Python: `C:\Users\ZAH\AppData\Local\Programs\Python\Python312\python.exe`
(system; the backend `.venv` lacks httpx, so tests run on system python).
CORS: exactly `http://localhost:5173`. Images served by the service at
`/images/...` from `ml-game-backend/data/images/`. All responses
`Cache-Control: no-store`.

### Level configuration (`app/ml.py`, LevelConfig for level "1")
- categories: `("cat", "dog")` (ordered — tie-break order)
- candidates_per_category: 10
- stage_totals_per_category: (3, 5, 10) — cumulative per category per stage
- predictions_per_stage: 3
- min_training_per_category: 15, min_test: 9

### Endpoints (exact, from `app/main.py`)

| Endpoint | Body | Returns |
|---|---|---|
| `GET /health` | — | `{status:"ok"}` |
| `GET /api/level/1/setup` | — | `{level, categories, stage_totals_per_category, candidates_per_category, predictions_per_stage, test_images:[{id,url}]}` — NO labels/embeddings |
| `POST /api/level/1/pool` | `{level, stage, accepted:[id]}` | `{candidates:[{id,url} x20]}` — ONE shuffled flat mixed list, no category info |
| `POST /api/level/1/train` | `{level, stage, choices:[{id,category}]}` | `{model_id, counts}` |
| `POST /api/level/1/predict` | `{model_id, test_id}` | `{category, confidence, probabilities:[{category,p}]}` |
| `POST /api/level/1/reveal` | `{model_id, test_id}` | `{true_category, match}` |

Errors: `{"code", "detail"}` envelope. Codes: `invalid_request` (400),
`unknown_level` (404), `unknown_id` (404), `not_in_train_pool`,
`not_in_test_pool`, `duplicate_id`, `wrong_counts`, `wrong_labels`
(detail `{wrong_ids, wrong_count}`, 400), `pool_too_small`,
`prediction_limit_reached`, `model_not_found` (404), `not_predicted_yet` (409),
`numeric_failure` (500).

### Behavior details that matter
- **Pool draws are deterministic** per `(level, stage, accepted)` and cached, so
  the same stage always shows the same 20 images in the same order (seeded by
  sha256 of the draw key, not global random).
- `train` validates in order: non-empty choices -> known ids -> in train pool ->
  no duplicates -> exact counts per category (3/3 for stage 1) -> every
  placement matches the TRUE label. If any label is wrong: `wrong_labels` with
  the wrong ids and **no model is trained**. Only then does it fit
  `LogisticRegression(C=10, max_iter=1000)` on the 6 vectors.
- Models are in-memory, newest 500 kept, never persisted. Fresh model each
  train (retrained on the full accumulated set — relevant for stages 2/3).
- `predict` accepts only test-pool ids, max 3 distinct per model (stage limit),
  rejects duplicates (`duplicate_id`). Ties go to lowest category index;
  confidence = max probability.
- `reveal` requires that model to have predicted that exact test id
  (`not_predicted_yet`, 409 otherwise). This is the ONLY deliberate label leak.

### Tests (`ml-game-backend/tests/`, 75 passed)
- `conftest.py`: synthetic fixture (15 train + 9 test per category, 3-dim
  vectors) driving most tests via `MLPLAYGROUND_DATA_DIR`.
- `test_api.py` (~807 lines): shape tests, no-label-leak tests (setup/pool
  responses checked for forbidden substrings and exact key allowlists),
  wrong_labels, limits, error envelopes, a full frontend-sequence integration
  test.
- `test_parity.py` (6): offline evaluator vs live service, tolerance 1e-9.
- `test_data_layout.py`, `test_export_guard.py`: data integrity + export safety.
- Stage 4 parity: npy-mode baseline hash
  `A1B11290D0157D5F4017AD8D599D10ABC2EF0938DC0006341CA9507CABF5BFE0`
  (byte-identical post-refactor); JSON-mode deterministic cells match
  `docs/evaluation.md` (baseline 50.0%, perfect labels 100%, conf 0.873228…).
  Seeded sweeps legitimately differ between modes (row-order limitation, not a
  parity failure).

---

## 5. The frontend (Stage 5a, DONE — how the game works RIGHT NOW)

`ml-game-frontend/`: Vite 8.3.4 + React 19.2 + oxlint. Scripts: `dev`, `build`,
`lint`, `preview`. **Zero new dependencies added** for Stage 5a (native
drag-and-drop, CSS, fetch). The old prototype `SortingGame.jsx` still exists on
disk but is orphaned (nothing imports it) — its lint warning is pre-existing.

Run: `npm run dev` (frontend on :5173) + backend on :8000. No proxy in
`vite.config.js`; the backend's CORS allows :5173 directly.

### Architecture of the new code
- `src/api.js` — thin real API client. `API_BASE = import.meta.env.VITE_API_BASE
  || 'http://localhost:8000'`. `imageUrl(path)` resolves backend-relative paths
  (`images/img_007.jpg`) against the backend origin (images would otherwise
  accidentally load from the Vite server). `ApiError` (code/detail/status) and
  `NetworkError` classes.
- `src/i18n.js` — SINGLE translation module. Languages: `en` (default), `ru`
  (Roman Urdu, UNREVIEWED draft), `ur` (Urdu, UNREVIEWED draft). `makeT(lang)`
  returns `t(key, params)` with `{placeholder}` substitution. Every
  user-facing string goes through this; no hard-coded strings in components.
  Language `<select>` in the header; `dir="rtl"` is set on the app wrapper for
  Urdu.
- `src/App.jsx` — shell: language state, screen switch (intro | stage), forest
  CSS background + translucent "game frame".
- `src/components/Guide.jsx` — pure-CSS robot character + speech bubble; a
  `scanning` prop adds a gentle idle pulse during the REAL train request (no
  fake progress simulation).
- `src/screens/Intro.jsx` — title, guide bubble, instructions, Start button.
- `src/screens/Stage1.jsx` — the whole Stage 1 state machine (~620 lines).

### The player flow as implemented (Level 1, Stage 1 only)

1. **Introduction** (`screen: intro`): title "Level 1: Cats or Dogs?", robot
   guide with speech bubble, short instructions, Start button.
2. **Load the stage**: on mount, `GET /setup` then `POST /pool {level:1,
   stage:1, accepted:[]}`. Payload is validated (categories length 2, integer
   stage totals, test_images >= predictions_per_stage, pool length ==
   categories*10, every candidate has string id+url). Failure -> full error
   screen with a retry button (re-fetches; no silent local fallback ever).
   Loading spinner while in flight.
3. **Sorting** (phase `sorting`): 20 mixed candidate cards in a pool panel
   (LEFT on desktop), two category trays stacked on the RIGHT (Cat tray =
   cyan/blue, Dog tray = golden/yellow), each with 3 visible slots. Header
   mascot is an emoji cat/dog badge (placeholder, not extracted art). Shows:
   filled/total counter per tray, unsorted count, Train button, Reset button.
   - Input: **drag-and-drop** (HTML5), **click-to-select + "To Cats"/"To Dogs"
     buttons**, keyboard (cards are focusable `<button>`s, `aria-pressed`,
     Escape deselects). Drag is never the only way to play.
   - Placed images disappear from the pool and appear in a slot; clicking a
     filled slot returns the image to the pool (correction). No image is ever
     in two slots. Reset clears only this stage's selections.
   - Train is disabled until 3+3 are placed.
4. **Train** (phase `training`): posts `choices = [{id, category}]`. While
   awaiting, controls are disabled, the robot shows the gentle pulse, and the
   status line says Robo is learning. On success -> phase `trained` shows
   "Training complete! It learned from 6 pictures: 3 cats and 3 dogs" (counts
   come from the real response) + Continue.
   - On `wrong_labels`: stays in sorting, highlights the wrong slots with a
     pulsing red border + the wrong-ids message; the player moves them or
     Resets and retries. No model was trained (true — server refuses).
   - Other API errors: inline error panel with the code and a retry button.
5. **Predictions** (phase `predicting`): grid of the 16 real test images from
   setup. Player picks one ("Ask the model") -> real `predict` -> shows the real
   predicted category, a confidence bar with the real percentage, and both
   probabilities. Then a **mandatory** "Reveal the answer" button -> real
   `reveal` -> shows the true category and either "The model got it right!" or
   "It was actually X, the model was wrong even though it was N% sure". "Next
   picture" advances. 3 rounds exactly (predictions_per_stage).
   - Used images are greyed and marked "Used", never re-selectable, never become
     training data. Current round's image can't switch after predict.
   - Predict/reveal failures show an error panel and a retry consistent with
     server state (retry predict if no prediction landed; retry reveal if the
     prediction exists server-side — reveal requires a prior predict).
   - Duplicate predict or early reveal are prevented client-side and rejected
     server-side (verified: `duplicate_id` 400, `not_predicted_yet` 409).
6. **Completion** (phase `complete`): "Stage 1 complete!", score line
   ("The model got N out of 3 predictions right"), a plain-language lesson that
   it learned from the student's labelled pictures and was tested on unseen
   ones, and an explicit note that this was Stage 1 of 3. NO replay button; no
   pretence the whole level is done. Page reload restarts the level (approved
   decision; no persistence).

### Visual direction (from the concept description, NOT from viewing the image)
This model CANNOT view images (`docs/CONCEPT-IMAGE.jpg` exists but is
 uninspectable); the design was translated from a written description:
 pure-CSS forest backdrop (sky gradient, sun, canopy blobs, layered hills),
 translucent white rounded game frame, aqua pool panel, cyan Cat tray / golden
 Dog tray, green raised Train button, rounded cards with soft shadows, emoji
 mascots, CSS robot guide. NO artwork was extracted from the concept image and
 no asset files were created. Responsive: on narrow screens the pool stacks
 above the trays. Visible focus rings (`:focus-visible`), `aria-live` regions
 for status, `aria-pressed` on selectable cards, `dir="rtl"` for Urdu.

### Known layout conflict to be aware of
`GAME-FLOW-PLAN.md` rev 4 recorded "pool RIGHT, categories LEFT" as the
confirmed layout. The Stage 5a brief explicitly instructed "image pool on the
LEFT; category trays stacked on the RIGHT" (matching the concept image). The
implementation followed the **brief** (pool left, trays right). This deviation
is deliberate and should be reconciled in the docs when someone owns that edit.

---

## 6. Verification status (Stage 5a)

Automated, all green:
- `npm run lint` (oxlint): clean except ONE pre-existing warning in the
  orphaned `SortingGame.jsx`.
- `npm run build` (vite): succeeds.
- Backend contract smoke (real `ml-game-backend/data`, via TestClient; temp
  script deleted afterwards): setup 200/16 test images/no label leaks; pool 20
  unique {id,url}/no leaks/all image URLs served 200; wrong_labels 400 +
  wrong_ids; train 200 + model_id; 3× predict+reveal correct; duplicate predict
  400 `duplicate_id`; early reveal 409 `not_predicted_yet`.
- Static checks: no label/embedding/true_category in frontend code except
  post-reveal usage; all image URLs go through `api.imageUrl`; `package.json`
  unchanged (no new deps); backend untouched by the Stage 5a task.

NOT done: a real-browser smoke test (no browser available to the agent).
Manual checks still needed: actual click-through in Chrome/Firefox, drag-and-drop
feel, mobile layout, RTL rendering for Urdu, keyboard-only playthrough,
focus-visible styling, font rendering ("Trebuchet MS" stack).

---

## 7. Documentation state (stale items — report, don't silently fix)

- `docs/data-contract.md` header still says "STATUS: PROPOSED. Not approved.
  Not implemented." — it IS implemented and used. Stale label.
- `docs/PLAN.md` §5 API table still lists the RETIRED `/api/ml/*` endpoints
  (dataset/train/predict/evaluate/check with `box` params). The real API is the
  `/api/level/{id}/*` contract above. §4 row "Contract rewrite… In progress" is
  also stale (done).
- `docs/evaluation.md` line 9 mentions "browser TS engine" — the engine is now
  the sklearn service; the old "TypeScript engine in the browser" idea from
  AGENTS.md is obsolete (architecture moved to a FastAPI backend; AGENTS.md on
  disk still describes the OLD no-backend design in places — it is modified in
  the working tree but not fully rewritten).
- `AGENTS.md` (root) has been updated in the working tree but may still contain
  remnants of the earlier "no server" architecture; treat `docs/PLAN.md` +
  `docs/GAME-FLOW-PLAN.md` + `docs/data-contract.md` as the authoritative trio.
- GFP open decisions still unresolved: stage repeat (16), Reveal optional vs
  mandatory (17 — the game currently MANDATORY-reveals, per Stage 5a brief),
  reload/restart (18 — currently reload restarts level), quiz spec (GFP §9),
  RU/UR copy review, Stage 6 design decision D5/R3 (partner design system vs
  concept art).

---

## 8. Constraints and conventions in force

- PowerShell host: no grep/head/wc/heredocs; use Select-Object, python
  one-liners, or the read/write/edit/grep tools.
- Never install dependencies without approval; never add a frontend dep
  without reporting why; no new test framework without approval.
- Nothing is deleted — superseded things move to `archive/`.
- Do not commit unless a task explicitly says so.
- Do not modify backend tests or weaken assertions to make the frontend pass.
- Do not restore retired endpoints (`/api/ml/dataset`, `check`).
- Keep ids opaque everywhere the browser sees them; no label leak before the
  contract's reveal; labels.json never shipped to `public/`.
- ru/ur translations are drafts; never claim professional review.

---

## 9. What remains (next tasks, in rough order)

1. **Stage 5b**: browser smoke test + fixes; possibly carryover UI groundwork
   for stages 2–3 (locked carryover slots, cumulative 5/10 totals, accepted
   ids sent to `pool`, fresh-model-per-stage already handled server-side).
2. **Stages 2–3 of Level 1** (5 then 10 per category, carryover locking,
   prediction rounds each stage) — backend already supports all of it.
3. **Stage 6**: final visual polish (blocked on design decision D5/R3: concept
   art vs partner design system). Real mascot artwork if assets are provided.
4. **Stage 7**: partner integration (needs partner's repo).
5. **Stage 8**: quiz + RU/UR copy review by a fluent speaker.
6. Doc cleanup: fix data-contract.md status header, PLAN.md §5 API table,
   retire `/api/ml/*` references, reconcile pool-left layout in GFP, update
   AGENTS.md fully, archive `SortingGame.*`.
7. Junk file at repo root: a file literally named
   `s -ExecutionPolicy RemoteSigned) ; (& ?c?UsersZAHDesktopAayanML playground.venvScriptsActivate.ps1?)`
   (a mangled PowerShell redirect) — should be deleted/archived by an owner.

---

## 10. One-paragraph summary for handoff

The ML Playground is a kids' ML teaching game with a fully working offline data
pipeline (Oxford-IIIT Pet -> opaque 60 images + 512-dim ResNet18 embeddings), a
tested FastAPI+sklearn backend (75/75 tests; deterministic label-free pool
draws; train that refuses wrong labels; predict/reveal limited to held-out test
images; error envelopes; CORS for :5173), and — as of Stage 5a — a real,
playable React frontend for Level 1 Stage 1: intro -> sort 20 mixed candidates
into 3 cat + 3 dog slots (drag/click/keyboard) -> real training with
wrong-label highlighting -> 3 real predictions each with mandatory real reveal
-> completion summary, in en/ru/ur with a storybook-forest placeholder theme,
zero new dependencies, and nothing mocked. Stages 2–3, Stage 6 polish, quiz and
partner integration remain; several docs are stale relative to the implemented
contract; nothing is committed yet.
