# AGENTS.md - ML Playground

## Project goal

An educational web game that teaches kids (students) how machine learning works.
Students never upload images. They pick from a fixed set of bundled cat and dog
images, sort them into a "cat" box and a "dog" box (the student does the
labeling, so they can make mistakes), press **Train**, and then test the model on
images it has never seen, seeing the prediction and a confidence score.

## Architecture

- **Frontend** (`ml-game-frontend/`): Vite 8 + React 19, plain CSS (no
  Tailwind). Talks to the backend through `src/api.js`
  (`VITE_API_BASE`, default `http://localhost:8000`).
- **Backend** (`ml-game-backend/`): FastAPI + scikit-learn, Python 3.12, managed
  with uv. Trains a fresh `LogisticRegression` per Train press on precomputed
  embeddings, keeps models in memory, and serves the images at `/images`.
  The reasons for having a server are in `docs/adr-ml-service.md`.
- **Offline prep** (`prep/`): each image is precomputed ONCE into a 512-dim
  vector by a pretrained ResNet18. No torch at runtime, in the browser or on
  the server.

The earlier "static, browser-only, TypeScript engine" design was dropped. The
old FastAPI prototype in `archive/` is kept for reference only.

## Folder layout

```
ML playground/
  prep/
    prepare_dataset.py     # (torch) download Oxford-IIIT Pet -> data/images + manifest.json
    compute_embeddings.py  # (torch) ResNet18 -> 512-dim embeddings.npy
    export_browser_data.py # (numpy) opaque ids; splits public vs server-only output (guarded)
    evaluate_offline.py    # (sklearn) accuracy/confidence tables for docs
    requirements-prep.txt
    data/                  # images/, manifest.json, embeddings.npy, id_mapping.json (prep-only)
  public/ml-playground/    # PUBLIC: dataset.json (ids + urls, no labels) + images/
  ml-game-backend/
    app/main.py            # routes, CORS (http://localhost:5173 only), error envelope, /images mount
    app/ml.py              # ALL ML logic: level config, validation, train/predict/reveal, model store
    data/                  # SERVER-ONLY: dataset.json, embeddings.json, labels.json, images/
    tests/                 # pytest: test_api, test_parity, test_data_layout, test_export_guard
    pyproject.toml, uv.lock
  ml-game-frontend/
    src/App.jsx            # screen routing
    src/screens/           # MainMenu, TeacherIntro, Intro, Stage1 (classroom lesson),
                           # QuizPlaceholder (temporary), Stage2 (sort -> train -> predict)
    src/components/        # TopControls, StageGuide, TrainSequence (robot scan, portal)
    src/api.js, audio.js, i18n.js (en / ru / ur), App.css, index.css
    src/assets/            # characters, background, audio, fonts
    public/ml-playground/  # duplicate of public/ml-playground (see docs/data-layout.md)
  assets/                  # source art (characters, background, audio, fonts)
  docs/                    # see docs/README.md
  khair-labs-analysis/     # notes on the partner app (integration target)
  archive/                 # superseded code and docs, reference only
```

## Backend API (`docs/data-contract.md` is the contract)

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | `{"status":"ok"}` |
| `GET /api/level/:id/setup` | level config + label-free test images |
| `POST /api/level/:id/pool` | stage pool: 10 candidates per category, shuffled, fixed per session |
| `POST /api/level/:id/train` | validates the boxes; **no model is trained on wrong labels** (`wrong_labels` 400) |
| `POST /api/level/:id/predict` | predict one test image (per-model limit by stage: 1, 3, 3; test pool only) |
| `POST /api/level/:id/reveal` | true label + match, only after a predict for that model + image |

Errors use the envelope `{"code": "...", "detail": ...}` with snake_case codes.
The constants in `ml.py` are `MODEL_C = 10.0`, `MODEL_MAX_ITER = 1000`, and
`MODEL_STORE_CAP = 500` (FIFO eviction). Level 1 has backend stages of
1 / 5 / 10 pictures per category with 1 / 3 / 3 predictions per model
(`predictions_per_stage` is a list indexed by stage).

## Player-facing flow (Level 1)

menu -> TeacherIntro -> Stage 1 start screen (`Intro copy="intro"`) ->
**Stage 1** lesson (the classroom rises over the park; once it has arrived
the teacher rises and explains ML basics in 14 dialogue lines; Skip or the
last line -> quiz) -> quiz + final report (Task 2; `QuizPlaceholder` for now,
which calls `handleQuizComplete` in `App.jsx`) -> Stage 2 start screen
(`Intro copy="stage2Intro"`, park again) -> **Stage 2** sort/train/predict
in two rounds (`Stage2.jsx`, `round` = backend stage): round 1 sorts 1+1 and
makes 1 prediction, the teacher explains why that is weak; round 2 sorts
5+5 from a fresh pool, auto re-predicts the round-1 picture, compares the
confidence, then allows 2 free predictions.

Player stage numbers are NOT backend stage numbers: Stage 2 calls the API
with `stage: 1` (3 per category). Keep that mapping in mind when adding the
5- and 10-picture stages. The classroom background is
`src/assets/classroom-background.jpg` (source: `assets/classroom_background.jpg`),
used by `.app__scene--classroom` in `App.css`.

## The data rules (IMPORTANT)

- `labels.json` and `embeddings.json` live ONLY in `ml-game-backend/data/`.
  They must never appear under any `public/` or `dist/` folder.
  `test_data_layout.py` enforces this.
- The browser never fetches labels. It only learns a true label through `/reveal`.
- Ids are opaque (`img_001…img_060`) everywhere the browser can see them.
- `manifest.json` and `id_mapping.json` are prep-internal. Never ship or serve them.
- Reference classifier: sklearn `LogisticRegression(C=10, lbfgs, l2,
  max_iter=1000)`. `test_parity.py` checks the service against
  `prep/evaluate_offline.py`. The numbers are in `docs/evaluation.md`.

## The prep pipeline (run in order)

1. `prepare_dataset.py` (torch): 30 cats + 30 dogs (seed 42), longer side
   <= 512px, 22 train / 8 test per class. It cross-checks the binary label
   against the filename-capitalization rule.
2. `compute_embeddings.py` (torch): ResNet18 with ImageNet weights,
   `fc = Identity`, eval + no_grad, L2-normalized, in manifest order.
3. `export_browser_data.py` (numpy): opaque ids (seed 42), train/test shuffle
   (seed+1).
   - Writes `public/ml-playground/` (images + dataset.json) and
     `ml-game-backend/data/` (labels.json + embeddings.json).
   - Refuses to put secrets under `public/` or `dist/`.
   - Needs `--force` to overwrite service files. `--dry-run` writes nothing.
4. `evaluate_offline.py` (sklearn): perfect labels, train-size sweep,
   labeling-mistake sweep, confidence on correct vs wrong predictions.

Steps 1-2 need torch and run once. Steps 3-4 are cheap and re-runnable.

## Commands (PowerShell)

Backend (from `ml-game-backend/`):

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000   # docs at http://localhost:8000/docs
python -m pytest tests/ -q
```

Frontend (from `ml-game-frontend/`):

```powershell
npm run dev     # http://localhost:5173 (the only CORS-allowed origin)
npm run lint
npm run build
```

Prep (from the repo root; the root `.venv` has numpy + scikit-learn, NOT torch):

```powershell
.\.venv\Scripts\python.exe prep\export_browser_data.py --dry-run
.\.venv\Scripts\python.exe prep\evaluate_offline.py --json-out docs\evaluation-results.json
```

Re-running steps 1-2 needs `pip install -r prep\requirements-prep.txt` in a
separate torch venv.

Run lint, build, and the pytest suite before and after any change.

## What still needs building

Per `docs/PLAN.md` / `docs/GAME-FLOW-PLAN.md`:
- The Stage 1 quiz (Task 2): question bank, random selection, scoring,
  report. It replaces `QuizPlaceholder`, is entered from `Stage1`'s `onDone`
  (lesson finished or skipped), and calls `handleQuizComplete` when the
  report is closed.
- The 5- and 10-picture gameplay stages of Level 1 (backend stages 2 and 3).
- An Accuracy Detective screen (results explained in plain language).
- A Mission Complete screen (XP, badge, lesson summary).
- Integration with the partner app (same-origin routing, progress saving). See
  `khair-labs-analysis/`.
- Polish: teacher copy review, ru/ur translations (the language selector is
  off via `LANGUAGE_SELECTOR_ENABLED`), accessibility, phone testing.

## Constraints

- No student uploads, database, or login. Do not add extra packages or deps
  without asking.
- The backend runs as a single worker (the model store is in memory).
- Keep labels server-side and ids opaque (see the data rules above).
- Do not commit unless asked.
- `docs/Memory.md` holds the previous agent's session notes, which are useful
  history. This file wins where the two disagree.
