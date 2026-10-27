# ML Playground

An educational web game that teaches children how machine learning works,
by teaching a robot ("Robo") to tell cats from dogs.

The student is the teacher. They sort example pictures into a **Cats** box
and a **Dogs** box, press **Train**, and then test Robo on pictures it has
never seen, with a prediction and a confidence score for each. The lesson:
a model is only as good as its examples. Too few, or wrongly sorted, make a
weak and unsure model; more good examples make a confident one.

Students never upload anything. There is no login, no database and no
personal data: every picture comes from a fixed, bundled set of 60 photos.

## How it works

1. **Once, offline:** a pretrained image network (ResNet18, ImageNet weights)
   turned each of the 60 photos into 512 numbers (an *embedding*). This is
   the only deep learning, and it is not part of the game.
2. **In the game:** each Train press trains a fresh, small classifier
   (scikit-learn `LogisticRegression`) on the embeddings of the pictures the
   student sorted. It takes well under a second and needs no GPU.
3. **Testing:** the model predicts "cat" or "dog" for a new picture, with a
   confidence percentage.

The true labels stay on the server. The browser only sees opaque ids
(`img_001`…`img_060`) and learns an answer one picture at a time, after
making a prediction. If any picture is in the wrong box, the server refuses
to train, so no model is ever trained on wrong labels.

## The game (Level 1)

1. **Main menu:** choose English, اردو (Urdu) or Roman Urdu, then Begin Lesson.
2. **Introduction:** a 14-turn conversation between the Teacher and Robo
   about what machine learning is, voiced in English and Urdu (Roman Urdu
   plays the Urdu voice). The text types along with the voice.
3. **Stage 1, classroom lesson:** the Teacher and Robo explain examples,
   labels, models, predictions and mistakes.
4. **Quiz:** 5 random questions from a bank of 26, then a report with the
   score and a review of missed questions.
5. **Stage 2, hands-on:**
   - Round 1: sort 1 cat and 1 dog, train, and make 1 prediction. Robo is
     unsure or wrong, and the Teacher explains why.
   - Round 2: keep those two, add 4 more of each, train again. Robo
     re-predicts the same picture with more confidence, then the student
     makes 2 more predictions.

## Tech stack

| Part | Technology |
| --- | --- |
| Frontend (`ml-game-frontend/`) | React 19, Vite 8, plain CSS, Oxlint |
| Backend (`ml-game-backend/`) | Python 3.12, FastAPI, scikit-learn, NumPy, managed with uv |
| Offline prep (`prep/`) | PyTorch + torchvision (ResNet18), run once; not needed to play |

## Getting started

You need **Node.js** 20.19+ or 22.12+, **Python 3.12** and
[**uv**](https://docs.astral.sh/uv/). Run the backend and the frontend in
two terminals.

**Backend** (from `ml-game-backend/`):

```bash
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

API docs are at http://localhost:8000/docs.

**Frontend** (from `ml-game-frontend/`):

```bash
npm install
npm run dev
```

Open http://localhost:5173. The backend only accepts requests from this
exact address (CORS), so if Vite moves to another port because 5173 is
busy, free the port first. The frontend finds the backend through
`VITE_API_BASE` (default `http://localhost:8000`).

## Checks

Run these before and after any change.

Frontend (from `ml-game-frontend/`):

```bash
npm run lint
npm run build
```

Backend tests (from `ml-game-backend/`). pytest is not a project
dependency, so add it for the run:

```bash
uv run --with pytest --with httpx python -m pytest tests -q
```

The tests build their own small dataset, so they never use torch or the
real labels. They also check that the service matches the offline reference
(`test_parity.py`) and that no secret data sits in a public folder
(`test_data_layout.py`).

## Project layout

```
ML playground/
  ml-game-frontend/     React game: screens, characters, dialogue, audio, i18n
    src/screens/        MainMenu, TeacherIntro, Intro, Stage1, Quiz, QuizReport, Stage2
    src/quiz/           question bank (26), Urdu/Roman Urdu text, picking and scoring
    src/i18n.js         all on-screen text in English, Urdu and Roman Urdu
    scripts/            voice_timing.py (see "Voice lines" below)
  ml-game-backend/      FastAPI service: training, prediction, reveal, image serving
    app/ml.py           all ML logic and the Level 1 rules
    data/               SERVER-ONLY: labels.json, embeddings.json, images
    tests/              pytest suite
  prep/                 one-time pipeline: download, embed, export, evaluate
  public/ml-playground/ public data: dataset.json (ids + urls, no labels) + images
  assets/               source art, audio and fonts
  docs/                 design docs, API contract, evaluation results
  archive/              superseded code, kept for reference only
```

## Backend API

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | `{"status":"ok"}` |
| `GET /api/level/:id/setup` | level settings and the test pictures (no labels) |
| `POST /api/level/:id/pool` | the 10 candidate pictures per category to sort |
| `POST /api/level/:id/train` | checks the boxes, then trains a model |
| `POST /api/level/:id/predict` | prediction and confidence for one test picture |
| `POST /api/level/:id/reveal` | the true label, only after a prediction |

Errors use `{"code": "...", "detail": ...}`. The full contract is in
[docs/data-contract.md](docs/data-contract.md). Models are kept in memory,
so run the backend as a single worker.

## Data and privacy rules

- `labels.json` and `embeddings.json` live only in `ml-game-backend/data/`
  and must never appear under `public/` or `dist/`. A test enforces this.
- The browser never fetches labels; it learns one only through `/reveal`.
- `prep/data/manifest.json` and `id_mapping.json` are prep-only and must
  never be served.

See [docs/data-layout.md](docs/data-layout.md).

## How accurate is it?

From offline runs with correct labels ([docs/evaluation.md](docs/evaluation.md)):
the dataset is 44 training pictures (22 per class) and 16 test pictures.

- All 44 training pictures: 100% on the test pictures, about 87% average confidence.
- 3 per class: 98% on average, but as low as 75%.
- About 10 per class: reliably 100%.
- 25% of pictures in the wrong box: about 88% on average, as low as 62%.

## The prep pipeline (optional)

Only needed to rebuild the dataset. Steps 1–2 need torch
(`pip install -r prep/requirements-prep.txt` in a separate environment);
steps 3–4 need only NumPy and scikit-learn.

1. `prep/prepare_dataset.py`: download Oxford-IIIT Pet, pick 30 cats and
   30 dogs, split 22 train / 8 test per class.
2. `prep/compute_embeddings.py`: ResNet18 embeddings (512 numbers each).
3. `prep/export_browser_data.py`: assign opaque ids and write the public and
   server-only files. `--dry-run` writes nothing; `--force` overwrites.
4. `prep/evaluate_offline.py`: the accuracy tables in `docs/evaluation.md`.

## Languages and voice lines

All on-screen text is in `ml-game-frontend/src/i18n.js` and the quiz
translations in `src/quiz/questionBankTranslations.js`. The Urdu and Roman
Urdu text is a draft that still needs a native speaker's review.

Only the introduction is voiced. Its recordings are in
`ml-game-frontend/src/assets/audio/voice/introduction/`, and the text types
along with each one using the speech timings in `src/introVoiceTiming.js`.
After replacing a recording, regenerate the timings (needs ffmpeg):

```bash
python scripts/voice_timing.py
```

## Status

Built: the full Level 1 flow above, in three languages.

Still to do:

- Native-speaker review of the Urdu and Roman Urdu text.
- Voice lines beyond the introduction.
- A 10-pictures-per-class round (the backend already supports it).
- Results screens ("Accuracy Detective", "Mission Complete").
- Integration with the partner app (hosting, routing, saving progress).
- Accessibility and phone testing.

## More documentation

- [AGENTS.md](AGENTS.md): the current, detailed project reference.
- [docs/README.md](docs/README.md): index of the design docs.
- [docs/adr-ml-service.md](docs/adr-ml-service.md): why training runs on a server.

Some older docs (for example `docs/PLAN.md`) still describe an earlier
browser-only design. Where they disagree, `AGENTS.md` is correct.
