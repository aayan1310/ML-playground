"""Stage 4 parity tests: the offline reference evaluator must agree with the
live FastAPI service on identical data (docs/PLAN.md, Stage 4).

Methodology (reviewed and approved):
- Same data: the REAL service trio in ml-game-backend/data, pointed at the app
  via MLPLAYGROUND_DATA_DIR and read by prep/evaluate_offline.py's
  --json-input loader (load_service_data).
- Same training examples: for each Level 1 stage total (3, 5, 10 per category),
  the deterministic subset = the first n sorted train ids per category. No RNG.
- Same model parameters: LogisticRegression(C=10, max_iter=1000) on both sides
  (guarded by test_config_matches_reference).
- Live side exercises the actual HTTP endpoints (POST train + POST predict),
  one model per test image because the service allows at most 3 distinct
  predictions per model.
- Offline side is the evaluator's own reference_predict (imported by path;
  prep stays standalone and is not a package).
- Compared: predicted category and overall accuracy exactly; confidence and
  per-category probabilities within 1e-9 (same sklearn process, identical
  float64 inputs, so any larger gap means real drift).

Runs with system Python (needs httpx for TestClient and sklearn); the backend
.venv lacks httpx. Does not modify any service code or data.
"""

import importlib.util
import json
from pathlib import Path

import numpy as np
import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
SERVICE_DATA_DIR = Path(__file__).resolve().parents[1] / "data"
EVALUATOR_PATH = REPO_ROOT / "prep" / "evaluate_offline.py"

CATEGORIES = ("cat", "dog")
STAGE_TOTALS = (1, 5, 10)  # Level 1 cumulative per-category totals
STAGE_FOR_TOTAL = {1: 1, 5: 2, 10: 3}
TOLERANCE = 1e-9
VECTOR_TOLERANCE = 1e-6  # 6-decimal export rounding bound (npy float32 vs JSON)


def _load_evaluator():
    spec = importlib.util.spec_from_file_location("evaluate_offline", EVALUATOR_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="module")
def evaluator():
    return _load_evaluator()


@pytest.fixture(scope="module")
def service_data(evaluator):
    if not (SERVICE_DATA_DIR / "dataset.json").exists():
        pytest.skip(f"real service data not present in {SERVICE_DATA_DIR}")
    return evaluator.load_service_data(SERVICE_DATA_DIR)


@pytest.fixture()
def real_client(monkeypatch):
    """A TestClient running the real app against the real service data dir."""
    monkeypatch.setenv("MLPLAYGROUND_DATA_DIR", str(SERVICE_DATA_DIR))
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as client:
        yield client


def _deterministic_subset(labels, train_ids, n_per_category):
    """First n sorted train ids per category (documented, RNG-free)."""
    subset = []
    for category in CATEGORIES:
        subset.extend(sorted(i for i in train_ids if labels[i] == category)[:n_per_category])
    return sorted(subset)


def test_config_matches_reference(evaluator):
    """Both sides must use the same model parameters (drift guard)."""
    from app import ml

    assert float(evaluator.CLF["C"]) == float(ml.MODEL_C)
    assert int(evaluator.CLF["max_iter"]) == int(ml.MODEL_MAX_ITER)


def test_reference_predict_uses_true_labels(evaluator, service_data):
    """Sanity: the reference on the full clean train pool is perfect on the
    test pool (matches docs/evaluation.md's deterministic perfect-labels cell)."""
    train_ids, test_ids, labels, vectors = service_data
    reference = evaluator.reference_predict(train_ids, test_ids, labels, vectors)
    correct = sum(1 for i in test_ids if reference[i]["category"] == labels[i])
    assert correct == len(test_ids)
    mean_conf = float(np.mean([reference[i]["confidence"] for i in test_ids]))
    assert abs(mean_conf - 0.8732282101796274) < 1e-6


@pytest.mark.parametrize("n_per_category", STAGE_TOTALS)
def test_parity_stage_totals(real_client, evaluator, service_data, n_per_category):
    """For each stage total, live-service predictions equal the offline
    reference on the same sorted training ids and the same test ids."""
    train_ids, test_ids, labels, vectors = service_data
    subset = _deterministic_subset(labels, train_ids, n_per_category)
    choices = [{"id": image_id, "category": labels[image_id]} for image_id in subset]

    reference = evaluator.reference_predict(subset, test_ids, labels, vectors)

    stage = STAGE_FOR_TOTAL[n_per_category]
    live_predictions = {}
    for test_id in test_ids:
        # One model per test image: the contract allows at most 3 distinct
        # predictions per model, and this keeps the real API rules intact.
        train_response = real_client.post(
            "/api/level/1/train",
            json={"level": "1", "stage": stage, "choices": choices},
        )
        assert train_response.status_code == 200, train_response.text
        model_id = train_response.json()["model_id"]

        predict_response = real_client.post(
            "/api/level/1/predict",
            json={"model_id": model_id, "test_id": test_id},
        )
        assert predict_response.status_code == 200, predict_response.text
        body = predict_response.json()
        live_predictions[test_id] = body

        ref = reference[test_id]
        assert body["category"] == ref["category"], f"{test_id}: category mismatch"
        assert abs(body["confidence"] - ref["confidence"]) <= TOLERANCE, (
            f"{test_id}: confidence {body['confidence']} vs reference {ref['confidence']}"
        )
        for item in body["probabilities"]:
            expected = ref["probabilities"][item["category"]]
            assert abs(item["p"] - expected) <= TOLERANCE, (
                f"{test_id}: p({item['category']}) {item['p']} vs reference {expected}"
            )

    live_accuracy = sum(
        1 for i in test_ids if live_predictions[i]["category"] == labels[i]
    ) / len(test_ids)
    reference_accuracy = sum(
        1 for i in test_ids if reference[i]["category"] == labels[i]
    ) / len(test_ids)
    assert live_accuracy == reference_accuracy


def test_prep_and_service_vectors_agree(service_data):
    """Format-equivalence guard: prep's embeddings.npy and the service's
    embeddings.json hold the same vectors (6-decimal export rounding only),
    aligned via prep/data/id_mapping.json. Skips if prep data is absent."""
    mapping_path = REPO_ROOT / "prep" / "data" / "id_mapping.json"
    manifest_path = REPO_ROOT / "prep" / "data" / "manifest.json"
    npy_path = REPO_ROOT / "prep" / "data" / "embeddings.npy"
    if not mapping_path.exists() or not manifest_path.exists() or not npy_path.exists():
        pytest.skip("prep data (id_mapping.json / manifest.json / embeddings.npy) not present")

    _, _, _, vectors = service_data
    mapping = json.loads(mapping_path.read_text(encoding="utf-8"))
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    embeddings = np.load(npy_path)
    row_index = {row["id"]: i for i, row in enumerate(manifest)}

    assert set(mapping.keys()) == set(vectors.keys())
    for opaque_id, info in mapping.items():
        npy_row = embeddings[row_index[info["original_id"]]].astype(float)
        max_diff = float(np.max(np.abs(vectors[opaque_id] - npy_row)))
        assert max_diff <= VECTOR_TOLERANCE, f"{opaque_id}: max abs diff {max_diff}"
