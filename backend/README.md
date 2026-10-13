# ML Playground - Backend

Backend for the "ML Playground" kids' ML game. Students sort bundled cat and dog
images into two boxes, press **Train**, then test the model on unseen images and
see a prediction plus a confidence score.

The trick that makes this fast: a pretrained image model turns every image into a
list of numbers (an **embedding**) **once, offline**. The live server only trains
a tiny scikit-learn classifier on those stored numbers, so **the live server
never needs torch**.

## Two parts

- **PART A - one-time preparation** (`scripts/`, needs torch). Downloads images
  and computes embeddings.
- **PART B - the live API** (`app/`, no torch). Serves the game.

---

## Part A - one-time preparation (run these once)

Open PowerShell and go to the backend folder:

```powershell
cd "C:\Users\ZAH\Desktop\Aayan\ML playground\backend"
```

Create and activate a virtual environment, then install the prep packages:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-prep.txt
```

> If `.\.venv\Scripts\Activate.ps1` is blocked by the execution policy, run this
> once in the same window and try again:
> `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
> (When the venv is active you should see `(.venv)` at the start of the prompt.)

Run the two preparation scripts (the first one downloads the dataset, so it can
take a few minutes):

```powershell
python scripts\prepare_dataset.py
python scripts\compute_embeddings.py
```

Check the printed example filenames to confirm cats and dogs look right. This
creates `data\images\`, `data\manifest.json` and `data\embeddings.npy`.

See `data\README.md` for the dataset source and the license warning.

---

## Part B - run the live server

In the same backend folder with the venv active, install the runtime packages:

```powershell
pip install -r requirements.txt
```

Start the server:

```powershell
uvicorn app.main:app --reload --port 8000
```

Open **http://127.0.0.1:8000/docs** in a browser and use the interactive page to:

1. `GET /dataset` to see the train and test image ids.
2. `POST /train` with the ids you put in the cat and dog boxes.
3. `POST /predict` with a `model_id` and a test image id.

> If `manifest.json` / `embeddings.npy` are missing, the server stops with a clear
> message telling you to run the two prep scripts first.

---

## Part B - run the tests

The tests use a tiny fake dataset (no torch, no downloads), so they are fast:

```powershell
pip install -r requirements.txt
pytest
```

---

## API contract

| Method | Path       | Body                                   | Returns |
| ------ | ---------- | -------------------------------------- | ------- |
| GET    | `/health`  | -                                      | `{"status": "ok"}` |
| GET    | `/dataset` | -                                      | `{"train": [{"id", "url"}], "test": [{"id", "url"}]}` (no true labels) |
| POST   | `/train`   | `{"cat_ids": [...], "dog_ids": [...]}` | `{"model_id", "n_cat", "n_dog", "train_accuracy", "test_accuracy"}` |
| POST   | `/predict` | `{"model_id", "image_id"}`             | `{"prediction", "confidence", "probabilities": {"cat", "dog"}, "actual", "correct"}` |

`test_accuracy` is measured on the 16 held-out test images using their **true**
labels. Images are served at `/images/<file>`.

### Rules

- At least 3 images per box.
- The same id may not be in both boxes.
- Unknown ids -> `400`; ids outside the train pool are rejected.
- Unknown `model_id` -> `404`.
- CORS is enabled for `http://localhost:3000`.

### Configuration

- `MLPLAYGROUND_DATA_DIR` (optional) overrides the data folder (default
  `backend\data`). Used by the tests to point at a temporary dataset.

---

## Folder layout

```
backend/
  app/
    __init__.py
    main.py            # FastAPI routes only
    ml.py              # all ML logic (no FastAPI, no torch)
  scripts/
    prepare_dataset.py # PART A, needs torch
    compute_embeddings.py # PART A, needs torch
  tests/
    conftest.py        # synthetic dataset fixture
    test_api.py
  data/                # created by the prep scripts
    README.md          # dataset source + license warning
    images/            # cat_001.jpg ... dog_030.jpg
    manifest.json
    embeddings.npy
  requirements-prep.txt  # PART A packages (torch, torchvision, pillow, numpy)
  requirements.txt       # PART B packages (fastapi, uvicorn, scikit-learn, numpy, pytest, httpx)
```

The live server must **not** need torch.
