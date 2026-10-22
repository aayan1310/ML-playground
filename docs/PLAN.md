# ML Playground: Master Plan

Part of the **ML Learning Game** (see `ML_Learning_Game_Project_Plan_English.md`). This plan covers only the ML Playground section: its backend, ML logic, UI, content, tests and integration. It follows the project documentation. Where the build departs from it, the departure is listed in section 3 so nobody is surprised.

---

## 1. What we are building

A short, hands-on lesson where a student:

1. Sorts pre-provided cat and dog pictures into two boxes (data labeling).
2. Trains a small model on their sorted pictures.
3. Tests the model on pictures it has never seen and sees each prediction with a confidence level.
4. Sees accuracy, the mistakes, and a plain-language explanation of why mistakes happen.
5. Finishes with a Mission Complete summary (XP, badge, what they learned).

**Main concepts to land** (from the manager's brief):
- A model learns patterns from the examples it is given.
- Better and more examples give better predictions.
- A prediction comes with a confidence, and confidence is not the same as being right.
- Wrong labels in training produce a worse model.

**Documentation levels this covers:** Level 3 (Data Labeling), Level 4 (Train Your First Model), Level 5 (Prediction Challenge), Level 6 (Accuracy Detective). Levels 1, 2, 7, 8 and the Final Project are outside this plan.

**Not in scope:** the 2D world, character select, AI teacher chat or voice, the study-website dashboard (other people's parts). We only make the playground work inside them.

---

## 2. Decisions already made

| Decision | Choice | Reason |
|---|---|---|
| Images | Curated, pre-provided; students do not upload | Avoids unsafe or irrelevant images; keeps results predictable |
| Pictures | 60 cat/dog images: 44 for training (22 + 22), 16 for testing (8 + 8) | 20 to 30 per category as requested; test pictures stay unseen |
| Image ids | Opaque (`img_001` to `img_060`), lists shuffled | Filenames and order must not reveal the answer |
| Features | Pretrained ResNet18 embeddings (512 numbers per image), computed once offline | Makes a tiny model accurate on real photos |
| Live model | scikit-learn `LogisticRegression`, C = 10, trained on stored embeddings | Fast, explainable, matches the documentation |
| Backend | FastAPI + Uvicorn + scikit-learn + NumPy + Pydantic + Pytest | Required by the project documentation |
| Folder | Standalone backend folder (`ml-game-backend/`, currently `ml-service/`), managed with `uv`, Python 3.12 | Documentation allows a separate backend; matches the partner's tooling |
| Labels and embeddings | Stored only on the server, never under `public/` | Students must not be able to read the answers |
| Models | Held in memory, newest 500 kept, no student data stored | Documentation section 9 (privacy) |

---

## 3. Where this plan departs from the documentation

Each item needs a yes from the manager (or partner).

| Documentation says | We do | Status |
|---|---|---|
| Collect and label data, "such as cats and dogs" | Students pick from a curated set, no uploads | The manager's concept mentioned uploads; the user chose curated. Confirm. |
| Tailwind CSS + Lucide React | Match whichever design system the integrated app uses (the partner's app has its own tokens and icons) | Open |
| Phaser 3 for the whole experience | Playground screens are React UI; Phaser is only for the world that launches them | Open |
| One simple backend first | Playground is a separate FastAPI service, next to the partner's Django backend | Confirm with partner. See risk R1. |
| Concept-art look | The concept art and the partner's design system differ | Open. See Stage 6. |

---

## 4. Current status (as of this plan)

| Area | State |
|---|---|
| Dataset: 60 images, opaque ids, manifest | Done |
| Embeddings (60 x 512) and exported JSON data | Done |
| Offline evaluation (clean, size sweep, mistake sweep) | Done, documented |
| Terminal demo (`demo_terminal.py`) | Done, needs data path updated |
| C chosen (C = 10) | Done, needs the 25%-wrong confidence check |
| Reorganization (prep/, docs/, archive/, AGENTS.md) | Done |
| Contract rewrite as FastAPI service contract | In progress (opencode S1) |
| FastAPI service (Stage 2) | Done, including the Stage 2B follow-up (dev CORS for `http://localhost:5173`, `/images` served by the service; see `docs/adr-ml-service.md`) |
| Service tests (Stage 3) | Done: 65 passed, recorded under Stage 3 in section 6 |
| Parity tooling (Stage 4) | Done: offline reference and live service verified in parity; 6 parity tests + full suite 71 passed, recorded under Stage 4 in section 6 |
| UI, integration, content, polish | Not started |

---

## 5. Architecture

```text
Study website / game (Next.js, React, Phaser)
        |
        |  Playground screens (React)
        |  same-origin HTTP calls
        v
ML Playground service (FastAPI)
   |  dataset list (ids + image urls, no labels)
   |  train  -> model in memory
   |  predict / evaluate / check
   v
Data files on the server only
   dataset.json, embeddings.json, labels.json
Images are served by the website: public/ml-playground/images/
```

**Why embeddings:** a pretrained network turns each picture into 512 numbers describing what is in it. A small model on those numbers learns "cat vs dog" from a handful of examples. The embeddings are computed once offline, so the live service needs no image processing and no torch.

### API (snake_case JSON, errors as `{code, detail}`)

| Endpoint | Purpose | Returns |
|---|---|---|
| `GET /health` | Liveness | `{status}` |
| `GET /api/ml/dataset` | Train and test pictures, no labels | `{train:[{id,url}], test:[{id,url}]}` |
| `POST /api/ml/train` `{choices:[{id,box}]}` | Train on the student's sorting (box 0 = Cat, 1 = Dog) | `{model_id, count_per_box}` |
| `POST /api/ml/predict` `{model_id, image_id}` | Predict one test picture | `{image_id, box, confidence, probabilities, true_box, correct}` |
| `POST /api/ml/evaluate` `{model_id}` | Predict all test pictures | `{accuracy, correct, total, per_item}` |
| `POST /api/ml/check` `{model_id}` | How many of the student's own sorting choices were wrong | `{correct, total, wrong_ids}` |

Rules: `predict` accepts only test-pool ids; `check` uses only the model's own training choices (it cannot be used to look up answers); ties go to box 0; confidence is the larger probability; responses carry `Cache-Control: no-store`. Error codes: `invalid_box`, `unknown_id`, `not_in_train_pool`, `not_in_test_pool`, `duplicate_id`, `too_few_in_box` (400); `model_not_found` (404); `numeric_failure` (500). Bad data files stop the service at startup instead of producing API errors.

The full contract lives in `docs/data-contract.md`.

---

## 6. Build stages

Each stage ends with something you can run or look at, and a stop for review. Stages map to the documentation phases.

### Stage 0: Data and evaluation (documentation Phase 4 groundwork). Done
Pictures, ids, embeddings, offline evaluation, demo.
**Done when:** you can run `demo_terminal.py` and see accuracy and confidence per test picture.
**Remaining:** record the 25%-wrong confidence rows for C = 10 in `docs/evaluation.md` (wrong predictions should show clearly lower confidence than right ones).

### Stage 1: Contract and data layout
- `ml-service/` (or `ml-game-backend/`) created with `app/`, `tests/`, `data/`.
- `labels.json` and `embeddings.json` moved to the service's `data/`; `public/ml-playground/` keeps only `images/` and `dataset.json`.
- Guard test: fails if `labels.json` or `embeddings.json` exist under `public/`.
- `docs/data-contract.md` Part 2 rewritten as the service contract above.
- `docs/adr-ml-service.md`: one page on why a separate FastAPI service exists, how it differs from the partner's single-backend rule, and its offline limit.

**Done when:** the files moved, the originals were verified identical before removal, the guard test passes, and the contract is approved.

### Stage 2: FastAPI service
- Service loads data at startup (refuses to start on bad data).
- C = 10 in one config constant; models in memory, newest 500; Pydantic models in `app/schemas/`.
- All endpoints above with the error envelope.
- CORS off by default.

**Done when:** `uvicorn` starts, `/docs` shows the endpoints, and you can train and predict by hand in the browser.

### Stage 3: Service tests. Done
- Synthetic fixture (small, deterministic data), not the real data.
- Tests for every error code, validation order, the label-privacy rule (no labels anywhere in `/api/ml/dataset`), model cap and eviction, `predict` limited to test ids, `check` not usable as an answer oracle, ties to box 0, probabilities sum to 1.

**Done when:** `pytest` passes, run from the service folder only.

**Status (recorded 2026-10-19, based on the Stage 3 gap-fill task's report; the tests were not rerun for this documentation update).** Complete. Reported command, run from `ml-game-backend/`:

`C:\Users\ZAH\AppData\Local\Programs\Python\Python312\python.exe -m pytest tests/ -q` -> **65 passed** (previously 55).

The gap-fill task changed only `ml-game-backend/tests/test_api.py`; no production code was changed and no defects were found. Added coverage: `pool_too_small` error responses; training and prediction `numeric_failure` handling (500 with the error envelope, no model stored); and multi-violation validation-precedence tests matching the short-circuit order in `docs/data-contract.md` section 3 (the applicable API contract for this service). Existing tests already cover the other applicable precedence cases.

**Superseded requirements (historical bullets above, kept unchanged, not completed implementations).** Two of the bullets above name endpoints from this plan's earlier API (section 5) that are no longer part of the current API contract (`docs/data-contract.md`): the label-privacy rule mentioning `/api/ml/dataset` is superseded by the contract's endpoint set, and privacy is tested against the current API's responses instead (no labels or embeddings in pool, train, predict or reveal responses; the retired endpoint is verified absent). The public `check`-as-oracle bullet is not applicable because `check` is not part of the current public API; train-time validation replaces it (see the contract's decision table and `docs/adr-ml-service.md`). Neither retired endpoint was restored.

### Stage 4: Parity tooling. Done
- `prep/evaluate_offline.py --json-input` reads the exact same data files as the service.
- Re-run with C = 10; the service must reproduce the numbers in `docs/evaluation.md`.

**Done when:** the reference script and the live service give the same accuracy on the same sorted sets.

**Status (recorded 2026-10-19, based on the Stage 4 implementation task's final report; the commands below were not rerun for this documentation update).** Complete. What was built: `prep/evaluate_offline.py --json-input <dir>` reads the service's own data trio (`dataset.json` + `embeddings.json` + `labels.json`) through a shared loader, and `ml-game-backend/tests/test_parity.py` compares the offline reference fit against the actual FastAPI HTTP endpoints (train + predict) on the real service data.

Reported verification results:

- Parity tests, from `ml-game-backend/`: `C:\Users\ZAH\AppData\Local\Programs\Python\Python312\python.exe -m pytest tests\test_parity.py -q` -> **6 passed**.
- Full backend suite, same folder and interpreter: `... -m pytest tests -q` -> **71 passed** (65 from Stage 3 + 6 parity).
- Parity covered all three Level 1 stage totals (3, 5 and 10 training images per category) against **all 16 test ids**: predicted categories matched exactly, overall accuracy was identical, and confidence / per-category probabilities matched within `1e-9` (same sklearn process, identical inputs).
- The default NumPy/manifest mode of `evaluate_offline.py` stayed **byte-identical** to its pre-refactor output, so the numbers recorded in `docs/evaluation.md` still reproduce from that mode.
- JSON-mode deterministic results match the documented baseline and perfect-labels results (baseline 50.0%, perfect labels 100% test accuracy, mean confidence 87.3%).

Known limitation, not a parity failure: the evaluator's **seeded sweep** cells can differ slightly between JSON and NumPy modes because a seed picks subsets by positional index and dataset.json row order differs from manifest row order. This is documented in the script; the deterministic results and the on-demand parity comparisons are unaffected.

With this, the backend build (Stages 0 to 4) is complete. Stages 5 to 10 (UI, integration, content, polish, deployment) are not started; this stage changes nothing about the frontend or the game flow.

### Stage 5: Playground UI (documentation Phases 2 to 4; needs the partner's repo)
Screens, matching the concept art:

1. **Intro.** One-line mission and a Start button.
2. **Sort the pictures** ("Data Collect Karna"). A pool of pictures and two boxes, Cat and Dog. Drag or tap to place. Counter per box. Needs at least 3 in each box to continue. Hint available. Students may make mistakes on purpose.
3. **Check my data** (optional step). Shows how many of their own placements were wrong via `check`, so they can fix them.
4. **Train your model.** A short animation while `train` runs; shows how many pictures per box it learned from.
5. **Test the model.** Unseen pictures one at a time; the model shows its guess and confidence; the student sees whether it was right.
6. **Accuracy detective.** `evaluate` results: accuracy, list of right and wrong, plain-language reason for each wrong one, and a "what if you used fewer or wrong pictures" prompt.
7. **Mission Complete.** Summary, XP, badge, "try again".

Requirements for all screens:
- English and Roman Urdu/Urdu text in a single translation file, not hard-coded.
- Mobile-friendly, large touch targets, keyboard-accessible alternative to drag.
- Loading and error states for every API call (service down, model expired).
- Hints and a quiz question per level (documentation section 3).
- No student names or progress shown publicly.

**Done when:** a student can play from the intro to Mission Complete in a local browser with no console errors.

### Stage 6: Look and feel (documentation Phase 8, started early)
- Resolve the design-system question: concept art, the partner's tokens, or concept art built from the partner's tokens.
- Add character, sound-free animations, polished transitions.

**Done when:** the playground looks like the same game as the rest of the app and passes the manager's review.

### Stage 7: Website and game integration (documentation Phases 3 and 5)
- Register the playground as a location ("ML Playground") that launches from the world map.
- Save completion, score and rewards through the partner's existing progress system, never separate storage.
- Decide hearts, stars and XP mapping with the partner.
- Same-origin routing so the browser only talks to the website, which forwards `/api/ml/*` to the service.

**Done when:** completing the mission shows up in the student's progress on the study dashboard.

### Stage 8: Teaching quality and content (documentation Phases 4 and 6)
- Plain-language explanations for every kind of result: confident and right, confident and wrong, unsure and right, unsure and wrong.
- Short Urdu/Roman Urdu and English copy reviewed by a person.
- Optional hooks for the AI teacher (a "why was this wrong?" question the teacher can answer), added only after the teacher exists.
- Decide whether a harder pair of classes is needed so that "more data helps" is visible (cats vs dogs reaches 100% from 10 pictures per box, so the effect only shows with very small or mislabeled sets).

### Stage 9: Testing and polish (documentation Phase 8)
- Backend: `pytest`. Frontend: ESLint and Vitest for utilities and key components.
- End-to-end walkthrough of the full mission, including: service down, expired model, all pictures in one box, wrong sorting on purpose, repeating the mission.
- Accessibility check and performance check on a phone-sized screen.

### Stage 10: Deployment and privacy (documentation Phase 9)
- Hosting for the FastAPI service; environment variables; same-origin routing in production.
- Privacy review: no student data stored, no labels exposed, `no-store` headers.
- Dataset license check (the pictures come from the Oxford-IIIT Pet dataset; confirm terms allow this use and credit it).
- Decide whether the desktop or offline version needs the service bundled (see R1).

---

## 7. Risks and open questions

| # | Risk or question | Owner | Plan |
|---|---|---|---|
| R1 | The service needs Python running next to the website, so the playground is not fully offline. The partner's project values offline-first learning. | Manager + partner | State it now, record it in the ADR, revisit before deployment. Alternatives (run the model in the browser) were discussed and rejected for now because the documentation specifies FastAPI + scikit-learn. |
| R2 | The partner's app may be under a feature freeze, so a new playground could need an exemption. | Partner | Ask early; Stage 7 waits on the answer. |
| R3 | Design: concept art vs the partner's design system. | Manager | Get one clear choice before Stage 5 UI polish. |
| R4 | Label leakage if someone moves labels or embeddings into `public/`. | Us | Guard test in CI; code review rule. |
| R5 | Confidence too timid or overconfident. C = 10 gives roughly 87% on perfect labels, but the behaviour with wrong labels is unconfirmed. | Us | Check the 25%-wrong rows; adjust C in one place if needed. |
| R6 | Cat vs dog is too easy for the "more data helps" lesson. | Manager | Decide whether a second, harder pair is worth adding. |
| R7 | Image license for the Oxford-IIIT Pet pictures. | Us | Verify before any public deployment. |
| R8 | Wrong predictions could confuse young students without good explanations. | Us | Stage 8 copy and a review by a teacher. |
| R9 | Where the Python tab or "show me the code" idea fits. | Manager | Parked until the manager asks for it. |

---

## 8. Definition of done (whole playground)

- [ ] Student plays intro to Mission Complete with no errors, on desktop and phone.
- [ ] Training uses the student's own sorting; predictions and accuracy come from the real FastAPI + scikit-learn service.
- [ ] No labels or embeddings reachable from the browser.
- [ ] English and Urdu/Roman Urdu text available.
- [ ] Progress and rewards saved through the integrated app's existing system.
- [ ] `pytest` and frontend tests pass; the offline reference script matches the service.
- [ ] `docs/` is current: contract, evaluation, ADR, README, AGENTS.md.
- [ ] Manager, partner and a teacher have each seen it and signed off.

---

## 9. How to work with opencode

1. One stage at a time. Ask for a plan first, approve it, then let it build.
2. It stops at the end of each stage and shows: files changed, tests run and their results, what it could not verify.
3. No git commands unless you ask; no new dependencies without approval; no edits to the partner's code until Stage 7 and only with their agreement.
4. Nothing is deleted. Things that go away are moved to `archive/`, and moves of data files are verified byte-for-byte first.
5. Every stage's prompt starts with: current state, goal, files it may touch, files it must not touch, tests that must pass, and what "done" looks like.
6. Before each new stage, paste its latest summary here and have it reviewed before moving on.

---

## 10. Progress to show others

| Milestone | What you can show |
|---|---|
| After Stage 0 (now) | Terminal demo: pictures, embeddings, predictions with confidence |
| After Stage 2 | Interactive API page: train and predict from a browser |
| After Stage 4 | A report showing the service reproduces the offline numbers |
| After Stage 5 | A playable local playground |
| After Stage 7 | Playground inside the game with saved progress |
| After Stage 10 | A deployed version |

Suggested checkpoint messages: end of Stage 2 to the manager ("the real backend runs"), end of Stage 5 to the teacher ("try the lesson"), start of Stage 7 to the partner ("here is what I need from your app").