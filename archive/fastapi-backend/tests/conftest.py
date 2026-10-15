"""Shared pytest fixtures.

We build a tiny synthetic dataset (fake embeddings + manifest) in a temp folder
so the tests never need torch and never download anything. The data folder is
pointed at via MLPLAYGROUND_DATA_DIR *before* the app is imported.
"""

import json
import os
import tempfile
from pathlib import Path

import numpy as np
import pytest


def _build_fake_dataset(root: Path) -> None:
    rng = np.random.default_rng(1234)
    manifest = []
    vectors = []
    (root / "images").mkdir(parents=True, exist_ok=True)

    # 4 train + 2 test per class -> 8 train, 4 test.
    layout = [
        ("train", "cat", 4),
        ("train", "dog", 4),
        ("test", "cat", 2),
        ("test", "dog", 2),
    ]
    for split, label, count in layout:
        # Nicely separated clusters so the classifier can learn perfectly.
        center = np.array([1.0, 0.0, 0.0]) if label == "cat" else np.array([0.0, 1.0, 0.0])
        for i in range(count):
            image_id = f"{label}_{split}_{i}"
            manifest.append(
                {
                    "id": image_id,
                    "label": label,
                    "split": split,
                    "file": f"{image_id}.jpg",
                }
            )
            vector = center + rng.normal(0.0, 0.02, size=3)
            vectors.append((vector / np.linalg.norm(vector)).astype(np.float32))

    (root / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    np.save(root / "embeddings.npy", np.stack(vectors))


@pytest.fixture(scope="session")
def data_dir():
    tmp = Path(tempfile.mkdtemp(prefix="mlpg_test_"))
    _build_fake_dataset(tmp)
    return tmp


@pytest.fixture(scope="session")
def client(data_dir):
    os.environ["MLPLAYGROUND_DATA_DIR"] = str(data_dir)
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
