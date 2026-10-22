"""All of the machine-learning logic lives here. No FastAPI imports, no torch.

Loads the real service data format (dataset.json, embeddings.json, labels.json)
and implements the Level 1 contract from docs/data-contract.md:

- stage-pool draws (10 candidates per category, fixed per stage session,
  returned as one shuffled mixed list with no category information)
- level setup data (categories, stage config, label-free test-image list)
- train with wrong-label detection (no model trained on wrong labels)
- predict limited to test-pool images, at most 3 distinct per model
- reveal only after a prediction for the same (model, test image)
- error envelope helpers (code, detail, http status)
"""

import hashlib
import json
import random
import secrets
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression

MODEL_C = 10.0
MODEL_MAX_ITER = 1000
MODEL_STORE_CAP = 500


class ApiError(Exception):
    """Contract error: snake_case code, detail payload, HTTP status."""

    def __init__(self, code: str, detail, status: int):
        super().__init__(f"{code}: {detail}")
        self.code = code
        self.detail = detail
        self.status = status


@dataclass(frozen=True)
class LevelConfig:
    level_id: str
    categories: tuple  # ordered; index order is the tie-break order
    candidates_per_category: int
    stage_totals_per_category: tuple  # cumulative totals per stage
    predictions_per_stage: tuple  # prediction limit per model, by stage
    min_training_per_category: int
    min_test: int

    def expected_counts(self, stage: int) -> dict:
        total = self.stage_totals_per_category[stage - 1]
        return {category: total for category in self.categories}

    def prediction_limit(self, stage: int) -> int:
        return self.predictions_per_stage[stage - 1]


LEVELS = {
    "1": LevelConfig(
        level_id="1",
        categories=("cat", "dog"),
        candidates_per_category=10,
        # Stage 1: one example per animal and a single prediction, so the
        # weak result motivates Stage 2 (5 each, 3 predictions).
        stage_totals_per_category=(1, 5, 10),
        predictions_per_stage=(1, 3, 3),
        min_training_per_category=15,
        min_test=9,
    ),
}


def load_data(data_dir: Path):
    """Load and cross-validate dataset.json + embeddings.json + labels.json.

    Raises RuntimeError with a clear message on any inconsistency; the service
    must refuse to start on bad data (Master Plan Stage 2).
    """
    data_dir = Path(data_dir)
    names = ("dataset.json", "embeddings.json", "labels.json")
    missing = [name for name in names if not (data_dir / name).exists()]
    if missing:
        raise RuntimeError(
            "Missing data file(s): "
            + ", ".join(missing)
            + f" in {data_dir}.\n"
            "Run: python prep/export_browser_data.py"
        )

    try:
        dataset = json.loads((data_dir / "dataset.json").read_text(encoding="utf-8"))
        embeddings = json.loads((data_dir / "embeddings.json").read_text(encoding="utf-8"))
        labels = json.loads((data_dir / "labels.json").read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Data file(s) in {data_dir} are not valid JSON: {exc}") from exc

    if not isinstance(dataset, dict) or not isinstance(dataset.get("train"), list) or not isinstance(dataset.get("test"), list):
        raise RuntimeError("dataset.json must be an object with 'train' and 'test' lists.")
    if not isinstance(embeddings, dict) or not isinstance(embeddings.get("ids"), list) or not isinstance(embeddings.get("vectors"), list):
        raise RuntimeError("embeddings.json must be an object with 'ids' and 'vectors' lists.")
    if not isinstance(labels, dict):
        raise RuntimeError("labels.json must be an object mapping image id to category.")

    dim = embeddings.get("dim")
    if not isinstance(dim, int) or dim <= 0:
        raise RuntimeError("embeddings.json 'dim' must be a positive integer.")

    emb_ids = embeddings["ids"]
    vectors = embeddings["vectors"]
    if len(emb_ids) != len(vectors):
        raise RuntimeError(
            f"embeddings.json has {len(emb_ids)} ids but {len(vectors)} vectors."
        )
    if len(set(emb_ids)) != len(emb_ids):
        raise RuntimeError("embeddings.json contains duplicate ids.")
    for i, vec in enumerate(vectors):
        if not isinstance(vec, list) or len(vec) != dim:
            raise RuntimeError(
                f"embeddings.json vector {i} has the wrong length (expected {dim})."
            )

    dataset_ids = []
    for split in ("train", "test"):
        for row in dataset[split]:
            if not isinstance(row, dict) or "id" not in row or "url" not in row:
                raise RuntimeError(f"dataset.json {split} rows must have 'id' and 'url'.")
            dataset_ids.append(row["id"])
    if len(set(dataset_ids)) != len(dataset_ids):
        raise RuntimeError("dataset.json contains duplicate ids (or an id in both splits).")

    emb_set = set(emb_ids)
    data_set = set(dataset_ids)
    label_set = set(labels.keys())
    if emb_set != data_set or emb_set != label_set:
        raise RuntimeError(
            "dataset.json, embeddings.json and labels.json must cover the same ids."
        )

    for image_id, category in labels.items():
        if not isinstance(category, str) or not category:
            raise RuntimeError(
                f"labels.json: id {image_id!r} has an invalid category value."
            )

    return dataset, embeddings, labels


class MLService:
    """Holds the dataset, labels, embeddings and the in-memory trained models."""

    def __init__(self, data_dir: Path, levels: dict = None):
        self.data_dir = Path(data_dir)
        self.levels = dict(levels) if levels is not None else dict(LEVELS)
        self.dataset, self.embeddings, self.labels = load_data(self.data_dir)

        self._index = {}
        for split in ("train", "test"):
            for row in self.dataset[split]:
                self._index[row["id"]] = row
        self._vectors = {
            image_id: np.asarray(vec, dtype=float)
            for image_id, vec in zip(self.embeddings["ids"], self.embeddings["vectors"])
        }

        self._train_ids = [row["id"] for row in self.dataset["train"]]
        self._test_ids = [row["id"] for row in self.dataset["test"]]

        self._validate_levels()
        self._models = {}
        self._pool_draws = {}

    # ---------------------------------------------------------------- validation
    def _validate_levels(self):
        """Refuse to start when the data cannot satisfy a level's configuration."""
        known_categories = set()
        for level in self.levels.values():
            known_categories.update(level.categories)
        for image_id, category in self.labels.items():
            if category not in known_categories:
                raise RuntimeError(
                    f"labels.json: id {image_id!r} has unknown category {category!r}."
                )
        for level in self.levels.values():
            for category in level.categories:
                count = sum(1 for i in self._train_ids if self.labels[i] == category)
                if count < level.min_training_per_category:
                    raise RuntimeError(
                        f"Level {level.level_id}: category {category!r} has {count} "
                        f"training images, needs at least {level.min_training_per_category}."
                    )
            if len(self._test_ids) < level.min_test:
                raise RuntimeError(
                    f"Level {level.level_id}: {len(self._test_ids)} test images, "
                    f"needs at least {level.min_test}."
                )

    def _level(self, level_id: str) -> LevelConfig:
        level = self.levels.get(level_id)
        if level is None:
            raise ApiError("unknown_level", f"Unknown level: {level_id!r}.", 404)
        return level

    def _stage(self, level: LevelConfig, stage: int) -> int:
        if not isinstance(stage, int) or not (1 <= stage <= len(level.stage_totals_per_category)):
            raise ApiError(
                "invalid_request",
                f"stage must be between 1 and {len(level.stage_totals_per_category)}.",
                400,
            )
        return stage

    # --------------------------------------------------------------------- pool
    def pool(self, level_id: str, stage: int, accepted: list) -> dict:
        level = self._level(level_id)
        self._stage(level, stage)

        if accepted is None:
            accepted = []
        for image_id in accepted:
            if image_id not in self._index:
                raise ApiError("unknown_id", f"Unknown image id: {image_id!r}.", 404)
            if image_id not in set(self._train_ids):
                raise ApiError(
                    "not_in_train_pool",
                    f"Image {image_id!r} is not in the training pool.",
                    400,
                )

        accepted_set = set(accepted)
        draw_key = (level_id, stage, tuple(sorted(accepted_set)))
        if draw_key in self._pool_draws:
            return {"candidates": self._pool_draws[draw_key]}

        rng = random.Random(hashlib.sha256(repr(draw_key).encode("utf-8")).hexdigest())
        drawn = []
        for category in level.categories:
            available = [
                i for i in self._train_ids if self.labels[i] == category and i not in accepted_set
            ]
            if len(available) < level.candidates_per_category:
                raise ApiError(
                    "pool_too_small",
                    {
                        "category": category,
                        "available": len(available),
                        "needed": level.candidates_per_category,
                    },
                    400,
                )
            drawn.extend(rng.sample(available, level.candidates_per_category))

        # One mixed list, shuffled so the response carries no category
        # information (docs/data-contract.md section 2).
        rng.shuffle(drawn)
        candidates = [
            {"id": image_id, "url": self._index[image_id]["url"]} for image_id in drawn
        ]
        self._pool_draws[draw_key] = candidates
        return {"candidates": candidates}

    # -------------------------------------------------------------------- setup
    def setup(self, level_id: str) -> dict:
        """Level initialization data for the frontend: config + test images.

        Ids and URLs only, never labels or embeddings.
        """
        level = self._level(level_id)
        return {
            "level": level_id,
            "categories": list(level.categories),
            "stage_totals_per_category": list(level.stage_totals_per_category),
            "candidates_per_category": level.candidates_per_category,
            "predictions_per_stage": list(level.predictions_per_stage),
            "test_images": [
                {"id": image_id, "url": self._index[image_id]["url"]}
                for image_id in self._test_ids
            ],
        }

    # -------------------------------------------------------------------- train
    def train(self, level_id: str, stage: int, choices: list) -> dict:
        level = self._level(level_id)
        self._stage(level, stage)

        if not isinstance(choices, list) or len(choices) == 0:
            raise ApiError("invalid_request", "'choices' must be a non-empty list.", 400)

        ids = []
        placed = {}
        for choice in choices:
            if not isinstance(choice, dict) or "id" not in choice or "category" not in choice:
                raise ApiError(
                    "invalid_request", "each choice needs 'id' and 'category'.", 400
                )
            image_id = choice["id"]
            category = choice["category"]
            if category not in level.categories:
                raise ApiError(
                    "invalid_request",
                    f"Unknown category {category!r} for level {level_id!r}.",
                    400,
                )
            ids.append(image_id)
            placed[image_id] = category

        # 2. every id is known
        for image_id in ids:
            if image_id not in self._index:
                raise ApiError("unknown_id", f"Unknown image id: {image_id!r}.", 404)

        # 3. every id is in the training pool (test ids rejected)
        train_set = set(self._train_ids)
        for image_id in ids:
            if image_id not in train_set:
                raise ApiError(
                    "not_in_train_pool",
                    f"Image {image_id!r} is not in the training pool.",
                    400,
                )

        # 4. no duplicates
        if len(set(ids)) != len(ids):
            seen = set()
            dupes = sorted({i for i in ids if i in seen or seen.add(i)})
            raise ApiError("duplicate_id", {"duplicates": dupes}, 400)

        # 5. counts per category match the stage totals
        expected = level.expected_counts(stage)
        actual = {category: 0 for category in level.categories}
        for category in placed.values():
            actual[category] += 1
        if actual != expected:
            raise ApiError(
                "wrong_counts",
                {"counts": actual, "expected": expected},
                400,
            )

        # 6. every placement matches the true label -> else no model is trained
        wrong_ids = [i for i in ids if placed[i] != self.labels[i]]
        if wrong_ids:
            raise ApiError(
                "wrong_labels",
                {"wrong_ids": sorted(wrong_ids), "wrong_count": len(wrong_ids)},
                400,
            )

        # 7. train a fresh model on the whole accumulated set
        features = np.stack([self._vectors[i] for i in ids])
        target = np.array([placed[i] for i in ids])
        try:
            classifier = LogisticRegression(C=MODEL_C, max_iter=MODEL_MAX_ITER)
            classifier.fit(features, target)
        except Exception as exc:
            raise ApiError("numeric_failure", f"Training failed: {exc}", 500) from exc

        model_id = "mdl_" + secrets.token_hex(3)
        while model_id in self._models:
            model_id = "mdl_" + secrets.token_hex(3)
        self._models[model_id] = {
            "classifier": classifier,
            "level_id": level_id,
            "stage": stage,
            "categories": level.categories,
            "predictions": {},
        }
        while len(self._models) > MODEL_STORE_CAP:
            oldest = next(iter(self._models))
            del self._models[oldest]

        return {"model_id": model_id, "counts": actual}

    # ------------------------------------------------------------------ predict
    def _model(self, model_id: str) -> dict:
        model = self._models.get(model_id)
        if model is None:
            raise ApiError(
                "model_not_found",
                f"Unknown model_id: {model_id!r}. Train a model first.",
                404,
            )
        return model

    def predict(self, level_id: str, model_id: str, test_id: str) -> dict:
        self._level(level_id)
        model = self._model(model_id)

        if test_id not in self._index:
            raise ApiError("unknown_id", f"Unknown image id: {test_id!r}.", 404)
        if test_id not in set(self._test_ids):
            raise ApiError(
                "not_in_test_pool",
                f"Image {test_id!r} is not in the test pool.",
                400,
            )

        predictions = model["predictions"]
        if test_id in predictions:
            raise ApiError(
                "duplicate_id",
                f"Image {test_id!r} was already predicted by this model.",
                400,
            )
        limit = self._level(model["level_id"]).prediction_limit(model["stage"])
        if len(predictions) >= limit:
            raise ApiError("prediction_limit_reached", {"limit": limit}, 400)

        features = self._vectors[test_id].reshape(1, -1)
        try:
            probabilities = model["classifier"].predict_proba(features)[0]
        except Exception as exc:
            raise ApiError("numeric_failure", f"Prediction failed: {exc}", 500) from exc

        classes = list(model["classifier"].classes_)
        by_category = {
            category: float(probabilities[classes.index(category)])
            for category in model["categories"]
        }
        # ordered probability list; np.argmax gives the lowest index on ties
        ordered = [by_category[c] for c in model["categories"]]
        category = model["categories"][int(np.argmax(ordered))]
        confidence = max(ordered)

        predictions[test_id] = category
        return {
            "category": category,
            "confidence": confidence,
            "probabilities": [
                {"category": c, "p": by_category[c]} for c in model["categories"]
            ],
        }

    # ------------------------------------------------------------------- reveal
    def reveal(self, level_id: str, model_id: str, test_id: str) -> dict:
        self._level(level_id)
        model = self._model(model_id)

        if test_id not in self._index:
            raise ApiError("unknown_id", f"Unknown image id: {test_id!r}.", 404)
        if test_id not in set(self._test_ids):
            raise ApiError(
                "not_in_test_pool",
                f"Image {test_id!r} is not in the test pool.",
                400,
            )
        if test_id not in model["predictions"]:
            raise ApiError(
                "not_predicted_yet",
                f"Image {test_id!r} has not been predicted by this model.",
                409,
            )

        predicted = model["predictions"][test_id]
        true_category = self.labels[test_id]
        return {"true_category": true_category, "match": predicted == true_category}
