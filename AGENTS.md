# AGENTS.md - ML Playground

## Project goal

An educational web game that teaches kids (students) how machine learning works.
Students never upload images. They pick from a fixed set of bundled cat and dog
images, sort them into a "cat" box and a "dog" box (the student does the
labeling, so they can make mistakes), press **Train**, and then test the model on
images it has never seen, seeing the prediction and a confidence score.

To keep it accurate and fast, the project uses **embeddings**: a pretrained image
model turns each image into a list of numbers ONCE, offline. The live server then
trains a small classifier on those stored numbers and **must not need torch**.

This repository currently contains only the backend (the `frontend/` folder is
empty / not built yet).

## Folder layout

```
ML playground/
  backend/
    app/
      __init__.py
      main.py              # FastAPI routes only
      ml.py                # ALL ML logic (no FastAPI, no torch)
    scripts/
      prepare_dataset.py   # PART A: download + split images (needs torch)
      compute_embeddings.py# PART A: ResNet18 -> embeddings.npy (needs torch)
    tests/
      conftest.py          # synthetic dataset fixture (no torch)
      test_api.py
    data/
      README.md            # dataset source + license warning
      images/              # cat_001.jpg ... dog_030.jpg (created by prep scripts)
      manifest.json        # [{id, label, split, file}]
      embeddings.npy       # 512-dim L2-normalized vectors, manifest order
      oxford-iiit-pet/     # raw download, git-ignored
    requirements-prep.txt  # PART A: torch, torchvision, pillow, numpy
    requirements.txt       # PART B: fastapi, uvicorn, scikit-learn, numpy, pytest, httpx
    README.md              # PowerShell setup/run/test commands
    .gitignore
  frontend/                # not built yet
```

## Two-part design

- **PART A** (`backend/scripts/`, needs torch): one-time offline preparation.
  - `prepare_dataset.py` downloads Oxford-IIIT Pet (`binary-category`), picks a
    fixed set (seed 42) of 30 cats + 30 dogs, resizes longer side to <= 512px,
    copies to `data/images/` as `cat_001.jpg` ... `dog_030.jpg`, and writes
    `data/manifest.json`. Per class: 22 train / 8 test. It cross-checks the
    dataset's cat/dog label against the filename-capitalization rule (cat breed
    names start uppercase, dog names lowercase) and stops with an error if they
    disagree, printing 10 example filenames per class.
  - `compute_embeddings.py` runs each image through a pretrained ResNet18
    (ImageNet weights, final layer removed -> 512-dim, L2-normalized) using the
    standard ImageNet preprocessing, `model.eval()` and `torch.no_grad()`, and
    writes `data/embeddings.npy` in manifest order.
- **PART B** (`backend/app/`, no torch): the live API. Loads manifest +
  embeddings at startup. Trains a scikit-learn `LogisticRegression` on the
  embeddings of the chosen ids (label = which box the student put it in) and
  keeps models in an in-memory dict.

## API contract

| Method | Path       | Body                                   | Returns |
| ------ | ---------- | -------------------------------------- | ------- |
| GET    | `/health`  | -                                      | `{"status": "ok"}` |
| GET    | `/dataset` | -                                      | `{"train": [{"id", "url"}], "test": [{"id", "url"}]}` - does NOT reveal true labels |
| POST   | `/train`   | `{"cat_ids": [...], "dog_ids": [...]}` | `{"model_id", "n_cat", "n_dog", "train_accuracy", "test_accuracy"}` |
| POST   | `/predict` | `{"model_id": "model_1", "image_id": "cat_025"}` | `{"prediction", "confidence", "probabilities": {"cat": ..., "dog": ...}, "actual", "correct"}` |

- Images are served at `/images/<file>` (static files from `data/images`).
- `test_accuracy` is measured on the 16 held-out test images using their TRUE
  labels.
- Rules: at least 3 images per box; no id in both boxes; unknown ids -> 400;
  ids outside the train pool -> 400; unknown `model_id` -> 404.
- CORS allowed origin: `http://localhost:3000`.

## Configuration

- `MLPLAYGROUND_DATA_DIR` (optional) overrides the data folder. Default:
  `backend/data`. Tests point it at a temp folder with a synthetic dataset.

## Constraints

- The live server must NOT need torch.
- Do not add a database, login, uploads, extra endpoints, or extra packages
  without asking.

## Commands (PowerShell, from `backend/`)

One-time prep (needs torch):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-prep.txt
python scripts\prepare_dataset.py
python scripts\compute_embeddings.py
```

Run the server (no torch):

```powershell
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# then open http://127.0.0.1:8000/docs
```

Run the tests (no torch, no downloads):

```powershell
pytest
```
