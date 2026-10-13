"""Tests for the ML Playground API using a small synthetic dataset (no torch)."""

CAT_TRAIN = ["cat_train_0", "cat_train_1", "cat_train_2", "cat_train_3"]
DOG_TRAIN = ["dog_train_0", "dog_train_1", "dog_train_2", "dog_train_3"]


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_dataset_returns_pools_without_labels(client):
    response = client.get("/dataset")
    assert response.status_code == 200
    body = response.json()

    assert {item["id"] for item in body["train"]} == set(CAT_TRAIN + DOG_TRAIN)
    assert {item["id"] for item in body["test"]} == {
        "cat_test_0",
        "cat_test_1",
        "dog_test_0",
        "dog_test_1",
    }

    for item in body["train"] + body["test"]:
        assert set(item.keys()) == {"id", "url"}
        assert item["url"].startswith("/images/")

    # True labels must not leak anywhere in the response payload.
    assert '"label"' not in response.text
    assert '"split"' not in response.text


def test_train_then_predict(client):
    response = client.post("/train", json={"cat_ids": CAT_TRAIN, "dog_ids": DOG_TRAIN})
    assert response.status_code == 200, response.text
    body = response.json()

    assert body["n_cat"] == 4
    assert body["n_dog"] == 4
    assert 0.0 <= body["train_accuracy"] <= 1.0
    assert 0.0 <= body["test_accuracy"] <= 1.0
    assert body["test_accuracy"] == 1.0

    model_id = body["model_id"]

    prediction = client.post(
        "/predict", json={"model_id": model_id, "image_id": "cat_test_0"}
    )
    assert prediction.status_code == 200, prediction.text
    result = prediction.json()

    assert result["prediction"] == "cat"
    assert result["actual"] == "cat"
    assert result["correct"] is True
    assert set(result["probabilities"].keys()) == {"cat", "dog"}
    assert abs(result["probabilities"]["cat"] + result["probabilities"]["dog"] - 1.0) < 1e-6
    assert 0.0 <= result["confidence"] <= 1.0
    assert result["confidence"] == max(result["probabilities"].values())


def test_train_rejects_too_few_images(client):
    response = client.post(
        "/train",
        json={"cat_ids": CAT_TRAIN[:2], "dog_ids": DOG_TRAIN},
    )
    assert response.status_code == 400


def test_train_rejects_id_in_both_boxes(client):
    response = client.post(
        "/train",
        json={"cat_ids": CAT_TRAIN, "dog_ids": ["cat_train_0", "dog_train_1", "dog_train_2"]},
    )
    assert response.status_code == 400


def test_train_rejects_unknown_id(client):
    response = client.post(
        "/train",
        json={"cat_ids": ["not_a_real_id", "cat_train_1", "cat_train_2"], "dog_ids": DOG_TRAIN},
    )
    assert response.status_code == 400


def test_train_rejects_test_pool_id(client):
    response = client.post(
        "/train",
        json={"cat_ids": ["cat_test_0", "cat_train_1", "cat_train_2"], "dog_ids": DOG_TRAIN},
    )
    assert response.status_code == 400


def test_predict_rejects_unknown_model(client):
    response = client.post(
        "/predict", json={"model_id": "does_not_exist", "image_id": "cat_test_0"}
    )
    assert response.status_code == 404


def test_predict_rejects_unknown_image(client):
    train = client.post("/train", json={"cat_ids": CAT_TRAIN, "dog_ids": DOG_TRAIN})
    model_id = train.json()["model_id"]

    response = client.post(
        "/predict", json={"model_id": model_id, "image_id": "not_a_real_id"}
    )
    assert response.status_code == 400
