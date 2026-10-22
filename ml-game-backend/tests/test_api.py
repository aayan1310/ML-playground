"""API tests for the Level 1 contract (docs/data-contract.md).

Runs with system Python (has fastapi + httpx + sklearn); the backend .venv
lacks httpx, so TestClient cannot run there. No torch, no real data, and no
private labels are printed.
"""

import json
from pathlib import Path

import numpy as np
import pytest

from app import ml
from conftest import CATEGORIES, build_dataset


def _train_choices(data_dir, stage_total=5):
    labels = json.loads((data_dir / "labels.json").read_text(encoding="utf-8"))
    train = json.loads((data_dir / "dataset.json").read_text(encoding="utf-8"))["train"]
    choices = []
    for category in CATEGORIES:
        picked = [r["id"] for r in train if labels[r["id"]] == category][:stage_total]
        choices.extend({"id": i, "category": category} for i in picked)
    return choices


def _train_ok(client, data_dir, stage=2, total=5):
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": stage, "choices": _train_choices(data_dir, total)},
    )
    assert response.status_code == 200, response.text
    return response.json()


def _test_ids(data_dir, split="test"):
    rows = json.loads((data_dir / "dataset.json").read_text(encoding="utf-8"))[split]
    return [r["id"] for r in rows]


# --------------------------------------------------------------------- health
def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["Cache-Control"] == "no-store"


def test_dataset_endpoint_removed(client):
    assert client.get("/dataset").status_code == 404


# ----------------------------------------------------------------------- pool
def test_pool_shape_and_no_labels(client, data_dir):
    response = client.post(
        "/api/level/1/pool", json={"level": "1", "stage": 1, "accepted": []}
    )
    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == {"candidates"}
    candidates = body["candidates"]
    assert isinstance(candidates, list)
    assert len(candidates) == 20  # 10 per category x 2 categories, mixed
    ids = []
    for item in candidates:
        assert set(item.keys()) == {"id", "url"}
        ids.append(item["id"])
    assert len(set(ids)) == 20
    # The mixed list is still drawn 10 per true category (checked here from the
    # private labels; the response itself carries no category information).
    labels = json.loads((data_dir / "labels.json").read_text(encoding="utf-8"))
    counts = {category: 0 for category in CATEGORIES}
    for image_id in ids:
        counts[labels[image_id]] += 1
    assert counts == {category: 10 for category in CATEGORIES}
    # No key or value in the response hints at a category or a label.
    assert "category" not in response.text
    assert "label" not in response.text


def test_pool_draw_is_fixed_per_stage_session(client):
    request = {"level": "1", "stage": 1, "accepted": []}
    first = client.post("/api/level/1/pool", json=request).json()
    second = client.post("/api/level/1/pool", json=request).json()
    assert first == second


def test_pool_excludes_accepted(client, data_dir):
    labels = json.loads((data_dir / "labels.json").read_text(encoding="utf-8"))
    cat_ids = [i for i in _test_ids(data_dir, "train") if labels[i] == "cat"][:3]
    response = client.post(
        "/api/level/1/pool",
        json={"level": "1", "stage": 2, "accepted": cat_ids},
    )
    assert response.status_code == 200
    returned = {item["id"] for item in response.json()["candidates"]}
    assert not (returned & set(cat_ids))
    assert len(response.json()["candidates"]) == 20


def test_pool_unknown_level(client):
    response = client.post(
        "/api/level/9/pool", json={"level": "9", "stage": 1, "accepted": []}
    )
    assert response.status_code == 404
    assert response.json()["code"] == "unknown_level"


def test_pool_bad_stage(client):
    response = client.post(
        "/api/level/1/pool", json={"level": "1", "stage": 0, "accepted": []}
    )
    assert response.status_code == 400
    assert response.json()["code"] == "invalid_request"


def test_pool_unknown_accepted_id(client):
    response = client.post(
        "/api/level/1/pool",
        json={"level": "1", "stage": 1, "accepted": ["img_999"]},
    )
    assert response.status_code == 404
    assert response.json()["code"] == "unknown_id"


def test_pool_rejects_test_id_as_accepted(client, data_dir):
    test_id = _test_ids(data_dir)[0]
    response = client.post(
        "/api/level/1/pool",
        json={"level": "1", "stage": 1, "accepted": [test_id]},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "not_in_train_pool"


def _accepted_train_ids(data_dir, category, count):
    labels = json.loads((data_dir / "labels.json").read_text(encoding="utf-8"))
    train = json.loads((data_dir / "dataset.json").read_text(encoding="utf-8"))["train"]
    return [r["id"] for r in train if labels[r["id"]] == category][:count]


def test_pool_too_small_when_available_below_draw(client, data_dir):
    """15 train cats - 6 accepted = 9 available < 10 candidates -> 400."""
    accepted = _accepted_train_ids(data_dir, "cat", 6)
    response = client.post(
        "/api/level/1/pool",
        json={"level": "1", "stage": 2, "accepted": accepted},
    )
    assert response.status_code == 400
    body = response.json()
    assert set(body.keys()) == {"code", "detail"}
    assert body["code"] == "pool_too_small"
    assert body["detail"] == {"category": "cat", "available": 9, "needed": 10}


def test_pool_too_small_reports_the_short_category(client, data_dir):
    """Only the short category is named; the other one is still drawable."""
    accepted = _accepted_train_ids(data_dir, "dog", 6)
    response = client.post(
        "/api/level/1/pool",
        json={"level": "1", "stage": 2, "accepted": accepted},
    )
    assert response.status_code == 400
    body = response.json()
    assert body["code"] == "pool_too_small"
    assert body["detail"] == {"category": "dog", "available": 9, "needed": 10}


def test_pool_precedence_unknown_id_before_not_in_train_pool(client, data_dir):
    """accepted violates steps 2 and 3 at once -> unknown_id (404) wins."""
    accepted = ["img_999", _test_ids(data_dir)[0]]
    response = client.post(
        "/api/level/1/pool",
        json={"level": "1", "stage": 1, "accepted": accepted},
    )
    assert response.status_code == 404
    assert response.json()["code"] == "unknown_id"


# ---------------------------------------------------------------------- setup
ALLOWED_SETUP_KEYS = {
    "level",
    "categories",
    "stage_totals_per_category",
    "candidates_per_category",
    "predictions_per_stage",
    "test_images",
    "id",
    "url",
}


def _leaf_keys(obj):
    if isinstance(obj, dict):
        keys = set(obj.keys())
        for value in obj.values():
            keys |= _leaf_keys(value)
        return keys
    if isinstance(obj, list):
        keys = set()
        for item in obj:
            keys |= _leaf_keys(item)
        return keys
    return set()


def test_setup_shape_config_and_no_labels(client, data_dir):
    response = client.get("/api/level/1/setup")
    assert response.status_code == 200
    assert response.headers["Cache-Control"] == "no-store"
    body = response.json()
    assert body["level"] == "1"
    assert body["categories"] == ["cat", "dog"]
    assert body["stage_totals_per_category"] == [1, 5, 10]
    assert body["candidates_per_category"] == 10
    assert body["predictions_per_stage"] == [1, 3, 3]
    test_images = body["test_images"]
    assert len(test_images) == len(_test_ids(data_dir))  # 9+9 = 18 in the fixture
    for item in test_images:
        assert set(item.keys()) == {"id", "url"}
    # Exactly the dataset's test ids, disjoint from the training pool.
    assert {i["id"] for i in test_images} == set(_test_ids(data_dir))
    assert not ({i["id"] for i in test_images} & set(_test_ids(data_dir, "train")))
    # Only id/url-style fields anywhere; no labels, embeddings or vectors.
    assert _leaf_keys(body) <= ALLOWED_SETUP_KEYS
    text = response.text
    assert "label" not in text
    assert "embedding" not in text
    assert "vector" not in text


def test_setup_unknown_level(client):
    response = client.get("/api/level/9/setup")
    assert response.status_code == 404
    assert response.json()["code"] == "unknown_level"


def test_setup_urls_resolve_to_served_images(client):
    response = client.get("/api/level/1/setup")
    assert response.status_code == 200
    test_images = response.json()["test_images"]
    assert test_images, "setup returned no test images"
    for item in test_images:
        assert item["url"].startswith("images/"), item["url"]
        image = client.get("/" + item["url"])
        assert image.status_code == 200, item["url"]
        assert image.headers["content-type"].startswith("image/"), item["url"]


def test_frontend_sequence_setup_pool_train_predict_reveal(client, data_dir):
    """The exact call sequence a frontend can run for Stage 1, using only
    label-free setup + pool data (labels come from the private fixture only
    to pick correct training choices, as a player would by sorting)."""
    setup = client.get("/api/level/1/setup").json()
    pool = client.post(
        "/api/level/1/pool",
        json={"level": "1", "stage": 1, "accepted": []},
    ).json()
    assert len(pool["candidates"]) == 20

    labels = json.loads((data_dir / "labels.json").read_text(encoding="utf-8"))
    per_category = {"cat": [], "dog": []}
    for item in pool["candidates"]:
        per_category[labels[item["id"]]].append(item["id"])
    choices = [
        {"id": image_id, "category": category}
        for category, image_ids in per_category.items()
        for image_id in image_ids[:1]
    ]
    train = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 1, "choices": choices},
    )
    assert train.status_code == 200, train.text
    model_id = train.json()["model_id"]

    test_id = setup["test_images"][0]["id"]
    predict = client.post(
        "/api/level/1/predict",
        json={"model_id": model_id, "test_id": test_id},
    )
    assert predict.status_code == 200, predict.text

    reveal = client.post(
        "/api/level/1/reveal",
        json={"model_id": model_id, "test_id": test_id},
    )
    assert reveal.status_code == 200, reveal.text
    assert set(reveal.json().keys()) == {"true_category", "match"}


# ---------------------------------------------------------------------- train
def test_train_success(client, data_dir):
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": _train_choices(data_dir)},
    )
    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == {"model_id", "counts"}
    assert body["counts"] == {"cat": 5, "dog": 5}
    assert body["model_id"].startswith("mdl_")
    assert "accuracy" not in response.text and "test" not in response.text


def test_train_wrong_labels_no_model(client, data_dir):
    choices = _train_choices(data_dir)
    # swap categories of a cat choice and a dog choice: counts stay 3/3,
    # but two placements no longer match their true labels
    cat_choice = next(c for c in choices if c["category"] == "cat")
    dog_choice = next(c for c in choices if c["category"] == "dog")
    cat_choice["category"], dog_choice["category"] = dog_choice["category"], cat_choice["category"]
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": choices},
    )
    assert response.status_code == 400
    body = response.json()
    assert body["code"] == "wrong_labels"
    assert body["detail"]["wrong_count"] == 2
    assert len(body["detail"]["wrong_ids"]) == 2


def test_train_wrong_labels_does_not_create_model(trained_client, data_dir):
    """A wrong-labels attempt must not add a model to the store."""
    import app.main as main

    store_before = len(main.service._models)
    choices = _train_choices(data_dir)
    # swap a cat placement with a dog placement: counts stay valid,
    # but two labels are wrong
    cat_choice = next(c for c in choices if c["category"] == "cat")
    dog_choice = next(c for c in choices if c["category"] == "dog")
    cat_choice["category"], dog_choice["category"] = dog_choice["category"], cat_choice["category"]
    response = trained_client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": choices},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "wrong_labels"
    assert len(main.service._models) == store_before


def test_train_unknown_id(client, data_dir):
    choices = _train_choices(data_dir)
    choices[0]["id"] = "img_999"
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": choices},
    )
    assert response.status_code == 404
    assert response.json()["code"] == "unknown_id"


def test_train_rejects_test_id(client, data_dir):
    choices = _train_choices(data_dir)
    choices[0]["id"] = _test_ids(data_dir)[0]
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": choices},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "not_in_train_pool"


def test_train_duplicate_id(client, data_dir):
    choices = _train_choices(data_dir)
    choices.append(dict(choices[0]))
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": choices},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "duplicate_id"


def test_train_wrong_counts(client, data_dir):
    choices = _train_choices(data_dir, stage_total=2)  # 2 per category, need 5
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": choices},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "wrong_counts"


def test_train_unknown_category(client, data_dir):
    choices = _train_choices(data_dir)
    choices[0]["category"] = "bird"
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": choices},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "invalid_request"


def test_train_invalid_body(client):
    response = client.post(
        "/api/level/1/train", json={"level": "1", "stage": 2}
    )
    assert response.status_code == 400
    assert response.json()["code"] == "invalid_request"


def test_train_level_mismatch(client, data_dir):
    response = client.post(
        "/api/level/2/train",
        json={"level": "1", "stage": 2, "choices": _train_choices(data_dir)},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "invalid_request"


def test_train_stage_totals_stage2(client, data_dir):
    """Stage 2 expects 5 per category (cumulative)."""
    choices = _train_choices(data_dir, stage_total=5)
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": choices},
    )
    assert response.status_code == 200
    assert response.json()["counts"] == {"cat": 5, "dog": 5}


def test_train_stage1_one_per_category(client, data_dir):
    """Stage 1 expects exactly 1 per category; 3 per category is rejected."""
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 1, "choices": _train_choices(data_dir, stage_total=1)},
    )
    assert response.status_code == 200, response.text
    assert response.json()["counts"] == {"cat": 1, "dog": 1}
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 1, "choices": _train_choices(data_dir, stage_total=3)},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "wrong_counts"
    assert response.json()["detail"]["expected"] == {"cat": 1, "dog": 1}


def test_train_numeric_failure_returns_500(client, data_dir, monkeypatch):
    """A failing fit surfaces as numeric_failure (500) with no model stored."""
    import app.main as main

    class BoomClassifier:
        def __init__(self, **kwargs):
            pass

        def fit(self, features, target):
            raise RuntimeError("boom fit")

    monkeypatch.setattr(ml, "LogisticRegression", BoomClassifier)
    store_before = len(main.service._models)
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": _train_choices(data_dir)},
    )
    assert response.status_code == 500
    body = response.json()
    assert set(body.keys()) == {"code", "detail"}
    assert body["code"] == "numeric_failure"
    assert "Training failed" in body["detail"]
    assert len(main.service._models) == store_before


# ------------------------------------------- train validation precedence
# Contract section 3 order: invalid_request -> unknown_id -> not_in_train_pool
# -> duplicate_id -> wrong_counts -> wrong_labels. Each test violates several
# rules at once and asserts the earliest documented code wins.
def test_train_precedence_unknown_id_beats_all_later_rules(client, data_dir):
    choices = _train_choices(data_dir)
    choices[0]["id"] = "img_999"  # unknown; also later: dup + counts + labels
    choices.append(dict(choices[1]))  # duplicate -> wrong counts too
    cat_choice = next(c for c in choices if c["category"] == "cat")
    dog_choice = next(c for c in choices if c["category"] == "dog")
    cat_choice["category"], dog_choice["category"] = dog_choice["category"], cat_choice["category"]
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": choices},
    )
    assert response.status_code == 404
    assert response.json()["code"] == "unknown_id"


def test_train_precedence_not_in_train_pool_beats_later_rules(client, data_dir):
    choices = _train_choices(data_dir)
    choices[0]["id"] = _test_ids(data_dir)[0]  # known but test-pool
    choices.append(dict(choices[1]))  # duplicate -> wrong counts too
    cat_choice = next(c for c in choices if c["category"] == "cat")
    dog_choice = next(c for c in choices if c["category"] == "dog")
    cat_choice["category"], dog_choice["category"] = dog_choice["category"], cat_choice["category"]
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": choices},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "not_in_train_pool"


def test_train_precedence_duplicate_beats_counts_and_labels(client, data_dir):
    """Stronger than test_train_duplicate_id: also violates counts and labels."""
    choices = _train_choices(data_dir)
    choices.append(dict(choices[0]))  # duplicate -> counts 6/5
    cat_choice = next(c for c in choices if c["category"] == "cat")
    dog_choice = next(c for c in choices if c["category"] == "dog")
    cat_choice["category"], dog_choice["category"] = dog_choice["category"], cat_choice["category"]
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": choices},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "duplicate_id"


def test_train_precedence_wrong_counts_beats_wrong_labels(client, data_dir):
    choices = _train_choices(data_dir, stage_total=2)  # counts 2/2, need 5/5
    cat_choice = next(c for c in choices if c["category"] == "cat")
    dog_choice = next(c for c in choices if c["category"] == "dog")
    cat_choice["category"], dog_choice["category"] = dog_choice["category"], cat_choice["category"]
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": choices},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "wrong_counts"


# --------------------------------------------------------------------- predict
def test_predict_eligible_test_image(trained_client, data_dir):
    test_id = _test_ids(data_dir)[0]
    response = trained_client.post(
        "/api/level/1/predict",
        json={"model_id": trained_client.model_id, "test_id": test_id},
    )
    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == {"category", "confidence", "probabilities"}
    assert body["category"] in CATEGORIES
    assert 0.0 <= body["confidence"] <= 1.0
    assert [p["category"] for p in body["probabilities"]] == list(CATEGORIES)
    assert abs(sum(p["p"] for p in body["probabilities"]) - 1.0) < 1e-6
    # no premature disclosure of labels or metrics
    assert "actual" not in body and "correct" not in body
    assert "accuracy" not in response.text and "true" not in response.text


def test_predict_rejects_train_image(trained_client, data_dir):
    train_id = _test_ids(data_dir, "train")[0]
    response = trained_client.post(
        "/api/level/1/predict",
        json={"model_id": trained_client.model_id, "test_id": train_id},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "not_in_test_pool"


def test_predict_unknown_id(trained_client):
    response = trained_client.post(
        "/api/level/1/predict",
        json={"model_id": trained_client.model_id, "test_id": "img_999"},
    )
    assert response.status_code == 404
    assert response.json()["code"] == "unknown_id"


def test_predict_unknown_model(client, data_dir):
    response = client.post(
        "/api/level/1/predict",
        json={"model_id": "mdl_000000", "test_id": _test_ids(data_dir)[0]},
    )
    assert response.status_code == 404
    assert response.json()["code"] == "model_not_found"


def test_predict_duplicate_and_limit(trained_client, data_dir):
    ids = _test_ids(data_dir)
    model_id = trained_client.model_id
    for image_id in ids[:3]:
        r = trained_client.post(
            "/api/level/1/predict",
            json={"model_id": model_id, "test_id": image_id},
        )
        assert r.status_code == 200, r.text
    # repeat of an already-predicted image
    r = trained_client.post(
        "/api/level/1/predict",
        json={"model_id": model_id, "test_id": ids[0]},
    )
    assert r.status_code == 400
    assert r.json()["code"] == "duplicate_id"
    # fourth distinct image
    r = trained_client.post(
        "/api/level/1/predict",
        json={"model_id": model_id, "test_id": ids[3]},
    )
    assert r.status_code == 400
    assert r.json()["code"] == "prediction_limit_reached"


def test_predict_limit_follows_model_stage(client, data_dir):
    """A stage-1 model allows one prediction; a stage-2 model allows three,
    and may predict the same test image again (it is a new model)."""
    ids = _test_ids(data_dir)
    stage1 = _train_ok(client, data_dir, stage=1, total=1)["model_id"]
    r = client.post("/api/level/1/predict", json={"model_id": stage1, "test_id": ids[0]})
    assert r.status_code == 200, r.text
    r = client.post("/api/level/1/predict", json={"model_id": stage1, "test_id": ids[1]})
    assert r.status_code == 400
    assert r.json()["code"] == "prediction_limit_reached"
    assert r.json()["detail"] == {"limit": 1}
    stage2 = _train_ok(client, data_dir, stage=2, total=5)["model_id"]
    for image_id in ids[:3]:
        r = client.post("/api/level/1/predict", json={"model_id": stage2, "test_id": image_id})
        assert r.status_code == 200, r.text


def test_predict_tie_break_lowest_index(trained_client, data_dir):
    """On equal probabilities the lowest configured category index wins."""

    class TieClassifier:
        classes_ = np.array(["cat", "dog"])

        def predict_proba(self, features):
            return np.array([[0.5, 0.5]])

    import app.main as main

    main.service._models[trained_client.model_id]["classifier"] = TieClassifier()
    response = trained_client.post(
        "/api/level/1/predict",
        json={"model_id": trained_client.model_id, "test_id": _test_ids(data_dir)[0]},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["category"] == "cat"  # lowest index in ("cat", "dog")
    assert body["confidence"] == 0.5


def test_predict_numeric_failure_returns_500(trained_client, data_dir):
    """A failing predict_proba surfaces as numeric_failure (500)."""

    class BoomClassifier:
        classes_ = np.array(["cat", "dog"])

        def predict_proba(self, features):
            raise RuntimeError("boom proba")

    import app.main as main

    main.service._models[trained_client.model_id]["classifier"] = BoomClassifier()
    response = trained_client.post(
        "/api/level/1/predict",
        json={"model_id": trained_client.model_id, "test_id": _test_ids(data_dir)[0]},
    )
    assert response.status_code == 500
    body = response.json()
    assert set(body.keys()) == {"code", "detail"}
    assert body["code"] == "numeric_failure"
    assert "Prediction failed" in body["detail"]


# ----------------------------------------- predict validation precedence
# Contract section 3 order: invalid_request -> model_not_found -> unknown_id /
# not_in_test_pool -> duplicate_id -> prediction_limit_reached.
def test_predict_precedence_model_not_found_beats_unknown_id(client):
    """model_id unknown AND test_id unknown -> model_not_found wins."""
    response = client.post(
        "/api/level/1/predict",
        json={"model_id": "mdl_nope", "test_id": "img_999"},
    )
    assert response.status_code == 404
    assert response.json()["code"] == "model_not_found"


# --------------------------------------------------------------------- reveal
def test_reveal_before_prediction_409(trained_client, data_dir):
    response = trained_client.post(
        "/api/level/1/reveal",
        json={"model_id": trained_client.model_id, "test_id": _test_ids(data_dir)[0]},
    )
    assert response.status_code == 409
    assert response.json()["code"] == "not_predicted_yet"


def test_reveal_after_prediction(trained_client, data_dir):
    labels = json.loads((data_dir / "labels.json").read_text(encoding="utf-8"))
    test_id = _test_ids(data_dir)[0]
    predict = trained_client.post(
        "/api/level/1/predict",
        json={"model_id": trained_client.model_id, "test_id": test_id},
    )
    predicted = predict.json()["category"]
    response = trained_client.post(
        "/api/level/1/reveal",
        json={"model_id": trained_client.model_id, "test_id": test_id},
    )
    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == {"true_category", "match"}
    assert body["true_category"] == labels[test_id]
    assert body["match"] == (predicted == labels[test_id])


def test_reveal_rejects_train_image(trained_client, data_dir):
    response = trained_client.post(
        "/api/level/1/reveal",
        json={
            "model_id": trained_client.model_id,
            "test_id": _test_ids(data_dir, "train")[0],
        },
    )
    assert response.status_code == 400
    assert response.json()["code"] == "not_in_test_pool"


# ------------------------------------------------------------------- CORS
# The verified frontend origin is http://localhost:5173 (Vite dev server).
# Only this exact origin is allowed; everything else gets no CORS grant.
def test_cors_preflight_allows_frontend_origin(client):
    response = client.options(
        "/api/level/1/pool",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_cors_actual_request_allows_frontend_origin(client):
    response = client.post(
        "/api/level/1/pool",
        json={"level": "1", "stage": 1, "accepted": []},
        headers={"Origin": "http://localhost:5173"},
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_cors_rejects_other_origin(client):
    response = client.post(
        "/api/level/1/pool",
        json={"level": "1", "stage": 1, "accepted": []},
        headers={"Origin": "http://evil.example"},
    )
    assert "access-control-allow-origin" not in response.headers


def test_cors_preflight_rejects_other_origin(client):
    response = client.options(
        "/api/level/1/pool",
        headers={
            "Origin": "http://evil.example",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


# ------------------------------------------------------ image serving (/images)
def test_pool_urls_resolve_to_served_images(client):
    """Every pool image URL resolves, relative to the API root, to real image
    bytes through the FastAPI /images mount (contract format: images/<file>)."""
    response = client.post(
        "/api/level/1/pool", json={"level": "1", "stage": 1, "accepted": []}
    )
    assert response.status_code == 200
    urls = [item["url"] for item in response.json()["candidates"]]
    assert urls, "pool returned no candidates"
    for url in urls:
        assert url.startswith("images/"), url
        image = client.get("/" + url)
        assert image.status_code == 200, url
        assert image.headers["content-type"].startswith("image/"), url
        assert image.content.startswith(b"\xff\xd8"), url  # JPEG magic


def test_image_missing_file_404(client):
    assert client.get("/images/img_does_not_exist.jpg").status_code == 404


def test_private_files_never_served(client, data_dir):
    """labels.json / embeddings.json / dataset.json live in the data dir root,
    not under images/, and have no public route."""
    for path in (
        "/labels.json",
        "/embeddings.json",
        "/dataset.json",
        "/images/labels.json",
        "/images/embeddings.json",
        "/images/../labels.json",
    ):
        response = client.get(path)
        assert response.status_code in (400, 404), path
        assert "cat" not in response.text


# ---------------------------------------------------------- error body / rules
def test_error_envelope_shape(client):
    response = client.post(
        "/api/level/1/predict",
        json={"model_id": "mdl_nope", "test_id": "img_001"},
    )
    body = response.json()
    assert set(body.keys()) == {"code", "detail"}
    assert body["code"] == "model_not_found"
    assert response.headers["Cache-Control"] == "no-store"


def test_model_store_fifo_eviction():
    """Store keeps the newest MODEL_STORE_CAP models (test with a small cap)."""
    import app.main as main

    original_cap = ml.MODEL_STORE_CAP
    ml.MODEL_STORE_CAP = 3
    try:
        import tempfile

        from fastapi.testclient import TestClient

        tmp = Path(tempfile.mkdtemp(prefix="mlpg_fifo_"))
        build_dataset(tmp)
        import os

        os.environ["MLPLAYGROUND_DATA_DIR"] = str(tmp)
        with TestClient(main.app) as client:
            labels = json.loads((tmp / "labels.json").read_text(encoding="utf-8"))
            train = json.loads((tmp / "dataset.json").read_text(encoding="utf-8"))["train"]
            choices = []
            for category in CATEGORIES:
                picked = [r["id"] for r in train if labels[r["id"]] == category][:5]
                choices.extend({"id": i, "category": category} for i in picked)
            model_ids = []
            for _ in range(4):
                r = client.post(
                    "/api/level/1/train",
                    json={"level": "1", "stage": 2, "choices": choices},
                )
                assert r.status_code == 200
                model_ids.append(r.json()["model_id"])
            # first model evicted
            r = client.post(
                "/api/level/1/predict",
                json={"model_id": model_ids[0], "test_id": _test_ids(tmp)[0]},
            )
            assert r.status_code == 404
            assert r.json()["code"] == "model_not_found"
            # newest model still present
            r = client.post(
                "/api/level/1/predict",
                json={"model_id": model_ids[-1], "test_id": _test_ids(tmp)[0]},
            )
            assert r.status_code == 200
    finally:
        ml.MODEL_STORE_CAP = original_cap


# --------------------------------------------------- category generalization
def test_three_category_level(tmp_path):
    """A 3-category level trains and predicts with a probability per category."""
    categories = ("cat", "dog", "bird")
    build_dataset(tmp_path, categories=categories)
    config = ml.LevelConfig(
        level_id="1",
        categories=categories,
        candidates_per_category=10,
        stage_totals_per_category=(3, 5, 10),
        predictions_per_stage=(3, 3, 3),
        min_training_per_category=15,
        min_test=9,
    )
    service = ml.MLService(tmp_path, levels={"1": config})
    labels = json.loads((tmp_path / "labels.json").read_text(encoding="utf-8"))
    train = json.loads((tmp_path / "dataset.json").read_text(encoding="utf-8"))["train"]
    choices = []
    for category in categories:
        picked = [r["id"] for r in train if labels[r["id"]] == category][:3]
        choices.extend({"id": i, "category": category} for i in picked)
    result = service.train("1", 1, choices)
    assert result["counts"] == {"cat": 3, "dog": 3, "bird": 3}
    test_id = json.loads((tmp_path / "dataset.json").read_text(encoding="utf-8"))["test"][0]["id"]
    prediction = service.predict("1", result["model_id"], test_id)
    assert [p["category"] for p in prediction["probabilities"]] == list(categories)
    assert abs(sum(p["p"] for p in prediction["probabilities"]) - 1.0) < 1e-6


# ------------------------------------------------------------ data validation
def test_startup_rejects_missing_file(tmp_path):
    build_dataset(tmp_path)
    (tmp_path / "labels.json").unlink()
    with pytest.raises(RuntimeError, match="labels.json"):
        ml.MLService(tmp_path)


def test_startup_rejects_mismatched_ids(tmp_path):
    build_dataset(tmp_path)
    labels_path = tmp_path / "labels.json"
    labels = json.loads(labels_path.read_text(encoding="utf-8"))
    labels.pop(next(iter(labels)))  # remove one id
    labels_path.write_text(json.dumps(labels), encoding="utf-8")
    with pytest.raises(RuntimeError, match="same ids"):
        ml.MLService(tmp_path)


def test_startup_rejects_bad_embedding_dim(tmp_path):
    build_dataset(tmp_path)
    emb_path = tmp_path / "embeddings.json"
    emb = json.loads(emb_path.read_text(encoding="utf-8"))
    emb["vectors"][0] = emb["vectors"][0][:1]  # wrong length (dim is 2)
    emb_path.write_text(json.dumps(emb), encoding="utf-8")
    with pytest.raises(RuntimeError, match="wrong length"):
        ml.MLService(tmp_path)


def test_startup_rejects_unknown_label(tmp_path):
    build_dataset(tmp_path)
    labels_path = tmp_path / "labels.json"
    labels = json.loads(labels_path.read_text(encoding="utf-8"))
    labels[next(iter(labels))] = "bird"  # not in the 2-category level
    labels_path.write_text(json.dumps(labels), encoding="utf-8")
    with pytest.raises(RuntimeError, match="unknown category"):
        ml.MLService(tmp_path)


def test_startup_rejects_too_small_pool(tmp_path):
    """Fewer than 15 training images per category must refuse to start."""
    build_dataset(tmp_path)
    dataset_path = tmp_path / "dataset.json"
    dataset = json.loads(dataset_path.read_text(encoding="utf-8"))
    dataset["train"] = dataset["train"][:25]  # drops below 15 for one category
    dataset_path.write_text(json.dumps(dataset), encoding="utf-8")
    labels_path = tmp_path / "labels.json"
    labels = json.loads(labels_path.read_text(encoding="utf-8"))
    kept = {r["id"] for r in dataset["train"] + dataset["test"]}
    labels = {k: v for k, v in labels.items() if k in kept}
    labels_path.write_text(json.dumps(labels), encoding="utf-8")
    emb_path = tmp_path / "embeddings.json"
    emb = json.loads(emb_path.read_text(encoding="utf-8"))
    pairs = [(i, v) for i, v in zip(emb["ids"], emb["vectors"]) if i in kept]
    emb["ids"] = [p[0] for p in pairs]
    emb["vectors"] = [p[1] for p in pairs]
    emb_path.write_text(json.dumps(emb), encoding="utf-8")
    with pytest.raises(RuntimeError, match="training images"):
        ml.MLService(tmp_path)


def test_c_equals_10_constant():
    assert ml.MODEL_C == 10.0
