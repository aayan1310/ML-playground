"""All of the machine-learning logic lives here. No FastAPI imports, no torch.

The live server only needs the pre-computed embeddings (``embeddings.npy``) and
the fixed labels/splits (``manifest.json``). Training a model just fits a small
scikit-learn LogisticRegression on the stored vectors.
"""

import json
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression

CAT = "cat"
DOG = "dog"
MIN_PER_BOX = 3


class InvalidInput(Exception):
    """Raised for bad requests coming from the student (maps to HTTP 400)."""


class ModelNotFound(Exception):
    """Raised when a model_id is unknown (maps to HTTP 404)."""


def load_data(data_dir: Path):
    """Load manifest + embeddings, failing clearly if the prep scripts were not run."""
    data_dir = Path(data_dir)
    manifest_path = data_dir / "manifest.json"
    embeddings_path = data_dir / "embeddings.npy"

    missing = [path.name for path in (manifest_path, embeddings_path) if not path.exists()]
    if missing:
        raise RuntimeError(
            "Missing data file(s): "
            + ", ".join(missing)
            + f" in {data_dir}.\n"
            "Run the two one-time preparation scripts first:\n"
            "  python scripts/prepare_dataset.py\n"
            "  python scripts/compute_embeddings.py"
        )

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    embeddings = np.load(embeddings_path)

    if len(manifest) != len(embeddings):
        raise RuntimeError(
            f"manifest.json has {len(manifest)} rows but embeddings.npy has "
            f"{len(embeddings)}. Re-run the preparation scripts."
        )

    return manifest, embeddings


class MLService:
    """Holds the dataset and the in-memory trained models."""

    def __init__(self, data_dir: Path):
        self.data_dir = Path(data_dir)
        self.manifest, self.embeddings = load_data(self.data_dir)
        self._index = {row["id"]: i for i, row in enumerate(self.manifest)}
        if len(self._index) != len(self.manifest):
            raise RuntimeError("manifest.json contains duplicate ids.")
        self._models = {}
        self._next_model_number = 1

    # ------------------------------------------------------------------ helpers
    def _row(self, image_id: str) -> dict:
        if image_id not in self._index:
            raise InvalidInput(f"Unknown image id: {image_id!r}")
        return self.manifest[self._index[image_id]]

    # ----------------------------------------------------------------- endpoints
    def dataset(self) -> dict:
        """Train/test pools. Deliberately does NOT reveal true labels."""
        train = []
        test = []
        for row in self.manifest:
            item = {"id": row["id"], "url": f"/images/{row['file']}"}
            (train if row["split"] == "train" else test).append(item)
        return {"train": train, "test": test}

    def train(self, cat_ids: list, dog_ids: list) -> dict:
        if len(cat_ids) < MIN_PER_BOX:
            raise InvalidInput(f"The cat box needs at least {MIN_PER_BOX} images.")
        if len(dog_ids) < MIN_PER_BOX:
            raise InvalidInput(f"The dog box needs at least {MIN_PER_BOX} images.")

        overlap = set(cat_ids) & set(dog_ids)
        if overlap:
            raise InvalidInput("These ids are in both boxes: " + ", ".join(sorted(overlap)))

        for image_id in list(cat_ids) + list(dog_ids):
            row = self._row(image_id)  # raises InvalidInput for unknown ids
            if row["split"] != "train":
                raise InvalidInput(f"Image {image_id!r} is not in the train pool.")

        ids = list(cat_ids) + list(dog_ids)
        labels = [0] * len(cat_ids) + [1] * len(dog_ids)  # 0 = cat box, 1 = dog box
        features = self.embeddings[[self._index[i] for i in ids]]
        target = np.array(labels)

        classifier = LogisticRegression(max_iter=1000)
        classifier.fit(features, target)

        model_id = f"model_{self._next_model_number}"
        self._next_model_number += 1
        self._models[model_id] = classifier

        return {
            "model_id": model_id,
            "n_cat": len(cat_ids),
            "n_dog": len(dog_ids),
            "train_accuracy": float(classifier.score(features, target)),
            "test_accuracy": self._test_accuracy(classifier),
        }

    def _test_accuracy(self, classifier) -> float:
        """Accuracy on the held-out test images, using their TRUE labels."""
        test_rows = [row for row in self.manifest if row["split"] == "test"]
        if not test_rows:
            return 0.0
        features = self.embeddings[[self._index[row["id"]] for row in test_rows]]
        target = np.array([0 if row["label"] == CAT else 1 for row in test_rows])
        return float(classifier.score(features, target))

    def predict(self, model_id: str, image_id: str) -> dict:
        classifier = self._models.get(model_id)
        if classifier is None:
            raise ModelNotFound(f"Unknown model_id: {model_id!r}. Train a model first.")

        row = self._row(image_id)  # raises InvalidInput for unknown ids
        features = self.embeddings[self._index[image_id]].reshape(1, -1)
        probabilities = classifier.predict_proba(features)[0]
        class_probabilities = {int(c): float(p) for c, p in zip(classifier.classes_, probabilities)}

        cat_probability = class_probabilities.get(0, 0.0)
        dog_probability = class_probabilities.get(1, 0.0)
        prediction = CAT if cat_probability >= dog_probability else DOG

        return {
            "prediction": prediction,
            "confidence": max(cat_probability, dog_probability),
            "probabilities": {CAT: cat_probability, DOG: dog_probability},
            "actual": row["label"],
            "correct": prediction == row["label"],
        }
