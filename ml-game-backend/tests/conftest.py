"""Shared pytest fixtures.

Builds a tiny synthetic dataset in the real service JSON format
(dataset.json + embeddings.json + labels.json) in a temp folder so the tests
never need torch, never touch the real data, and never print private labels.

Size: 15 train + 9 test per category (meets the Level 1 minimums of 15/9);
3-dim embeddings with well-separated per-category clusters.
"""

import json
import os
import tempfile
from pathlib import Path

import numpy as np
import pytest

CATEGORIES = ("cat", "dog")
N_TRAIN_PER_CATEGORY = 15
N_TEST_PER_CATEGORY = 9
DIM = 3


def build_dataset(root: Path, categories=CATEGORIES) -> dict:
    rng = np.random.default_rng(1234)
    (root / "images").mkdir(parents=True, exist_ok=True)

    dataset = {"train": [], "test": []}
    labels = {}
    ids = []
    vectors = {}

    for index, category in enumerate(categories):
        center = np.zeros(len(categories))
        center[index] = 1.0
        for split, count in (("train", N_TRAIN_PER_CATEGORY), ("test", N_TEST_PER_CATEGORY)):
            for i in range(count):
                image_id = f"{category}_{split}_{i:02d}"
                vector = center + rng.normal(0.0, 0.02, size=len(categories))
                vector = vector / np.linalg.norm(vector)
                dataset[split].append({"id": image_id, "url": f"images/{image_id}.jpg"})
                labels[image_id] = category
                ids.append(image_id)
                vectors[image_id] = vector.astype(float).tolist()

    order = list(ids)
    rng.shuffle(order)
    (root / "dataset.json").write_text(json.dumps(dataset), encoding="utf-8")
    (root / "embeddings.json").write_text(
        json.dumps(
            {
                "dim": len(categories),
                "ids": order,
                "vectors": [vectors[i] for i in order],
            }
        ),
        encoding="utf-8",
    )
    (root / "labels.json").write_text(json.dumps(labels), encoding="utf-8")

    # tiny files with a real JPEG magic header so /images serving is testable
    jpeg_stub = b"\xff\xd8\xff\xe0" + b"\x00" * 60
    for split in ("train", "test"):
        for row in dataset[split]:
            (root / "images" / f"{row['id']}.jpg").write_bytes(jpeg_stub)
    return labels


@pytest.fixture()
def data_dir(tmp_path):
    build_dataset(tmp_path)
    return tmp_path


@pytest.fixture()
def client(data_dir, monkeypatch):
    monkeypatch.setenv("MLPLAYGROUND_DATA_DIR", str(data_dir))
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def trained_client(client, data_dir):
    """A client with one stage-2 model trained on correct choices (5 per category,
    3 predictions allowed)."""
    labels = json.loads((data_dir / "labels.json").read_text(encoding="utf-8"))
    train = json.loads((data_dir / "dataset.json").read_text(encoding="utf-8"))["train"]
    choices = []
    for category in CATEGORIES:
        picked = [row["id"] for row in train if labels[row["id"]] == category][:5]
        choices.extend({"id": image_id, "category": category} for image_id in picked)
    response = client.post(
        "/api/level/1/train",
        json={"level": "1", "stage": 2, "choices": choices},
    )
    assert response.status_code == 200, response.text
    client.model_id = response.json()["model_id"]
    return client
