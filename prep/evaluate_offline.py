"""Offline evaluation of the ML Playground classifier.

The reference classifier is ``sklearn`` ``LogisticRegression`` as described in
``docs/data-contract.md``. It backs BOTH the live FastAPI service
(ml-game-backend) and a future browser TS engine, and it trains on the labels
the STUDENT assigns by sorting images into boxes. Since we cannot run a real
student here, we evaluate the classifier with the TRUE labels instead, in
three ways:

  1. Perfect labels (all 22 cats + 22 dogs from the train pool, one fit).
  2. Train-size sweep:  a student may label as few as 3 images per class or up
     to all 22. For n in {3, 5, 10, 15, 22} we fit on n random cats + n random
     dogs many times and report mean AND worst (min) test accuracy.
  3. Labeling-mistake sweep:  randomly relabel a fraction of the train pool to
     simulate the student sorting some images into the wrong box (includes the
     25% case the docs highlight).

We also report the classifier's confidence (max probability) separately for
correct and wrong predictions.

Run from the ``prep`` folder (after prepare_dataset.py + compute_embeddings.py):

    python evaluate_offline.py

Optionally write the raw numbers to a JSON file for docs:

    python evaluate_offline.py --json-out ../docs/evaluation-results.json

Service-parity mode: read the FastAPI service's own data files instead of the
prep-internal manifest/npy pair (the exact trio the live service loads, e.g.
the checked-in ml-game-backend/data folder):

    python evaluate_offline.py --json-input ../ml-game-backend/data

Row-order caveat: the seeded experiments choose subsets by positional index,
and dataset.json row order differs from manifest row order, so a given seed
picks a different subset in JSON mode than in the default mode. Seeded sweep
numbers are therefore expected to differ slightly between the two modes; the
deterministic parts (baseline, perfect labels) are order-independent. The
default manifest/numpy mode is unchanged and still regenerates the numbers
recorded in docs/evaluation.md.

C-sensitivity sweep (exploratory; does not affect the default report, whose
reference C is now 10):

    python evaluate_offline.py --c-values 1 3 10 30 100
"""

import argparse
import json
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression

CAT, DOG = "cat", "dog"
# Reference for the service and the browser engine (C=10 picked via the
# C-sensitivity sweep): sklearn defaults are solver=lbfgs, penalty=l2;
# max_iter is lengthened so lbfgs is allowed to converge.
CLF = dict(C=10, max_iter=1000)

TRAIN_SIZES = [3, 5, 10, 15, 22]
MISTAKE_RATES = [0.0, 0.1, 0.2, 0.25, 0.3]
N_SEEDS = 20  # default report
C_SEEDS = 30  # the C-sensitivity sweep always uses 30 seeds per random cell
THRESHOLD = 0.70  # confidence threshold: "share of predictions below 0.70"


def parse_args() -> argparse.Namespace:
    prep_dir = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description="Evaluate the ML Playground classifier offline.")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=None,
        help="Folder with manifest.json and embeddings.npy (default: prep/data). "
        "Mutually exclusive with --json-input.",
    )
    parser.add_argument(
        "--json-input",
        type=Path,
        default=None,
        help="Read the FastAPI service's data trio (dataset.json + embeddings.json + "
        "labels.json) from this folder instead of manifest/npy, e.g. "
        "../ml-game-backend/data. Mutually exclusive with --data-dir.",
    )
    parser.add_argument("--seeds", type=int, default=N_SEEDS, help="Random seeds per experiment (default: 20).")
    parser.add_argument(
        "--json-out",
        type=Path,
        default=None,
        help="Write the raw results to this JSON file, e.g. ../docs/evaluation-results.json",
    )
    parser.add_argument(
        "--c-values",
        type=float,
        nargs="*",
        default=None,
        help="Run ONLY the C-sensitivity sweep for these C values (e.g. 1 3 10 30 100) "
        "instead of the default report. Uses 30 seeds per random cell.",
    )
    args = parser.parse_args()
    if args.json_input is not None and args.data_dir is not None:
        parser.error("--json-input and --data-dir are mutually exclusive.")
    if args.data_dir is None and args.json_input is None:
        args.data_dir = prep_dir / "data"
    return args


def label_to_int(label: str) -> int:
    return 0 if label == CAT else 1


def load_service_data(data_dir: Path):
    """Load the FastAPI service's private data trio (the exact files the live
    service loads from MLPLAYGROUND_DATA_DIR):

        dataset.json    {train: [{id, url}], test: [{id, url}]}
        embeddings.json {dim, ids, vectors}
        labels.json     {id: category}

    Returns (train_ids, test_ids, labels, vectors): ids in dataset.json row
    order, vectors as a dict of float numpy arrays. Raises SystemExit with a
    clear message on any inconsistency (kept standalone; prep does not import
    from ml-game-backend).
    """
    data_dir = Path(data_dir)
    names = ("dataset.json", "embeddings.json", "labels.json")
    missing = [name for name in names if not (data_dir / name).exists()]
    if missing:
        raise SystemExit(
            "Missing service data file(s): " + ", ".join(missing) + f" in {data_dir}."
        )

    try:
        dataset = json.loads((data_dir / "dataset.json").read_text(encoding="utf-8"))
        embeddings = json.loads((data_dir / "embeddings.json").read_text(encoding="utf-8"))
        labels = json.loads((data_dir / "labels.json").read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Service data file(s) in {data_dir} are not valid JSON: {exc}") from exc

    if not isinstance(dataset, dict) or not isinstance(dataset.get("train"), list) or not isinstance(dataset.get("test"), list):
        raise SystemExit("dataset.json must be an object with 'train' and 'test' lists.")
    if not isinstance(embeddings, dict) or not isinstance(embeddings.get("ids"), list) or not isinstance(embeddings.get("vectors"), list):
        raise SystemExit("embeddings.json must be an object with 'ids' and 'vectors' lists.")
    if not isinstance(labels, dict):
        raise SystemExit("labels.json must be an object mapping image id to category.")

    dim = embeddings.get("dim")
    if not isinstance(dim, int) or dim <= 0:
        raise SystemExit("embeddings.json 'dim' must be a positive integer.")
    emb_ids = embeddings["ids"]
    vectors_raw = embeddings["vectors"]
    if len(emb_ids) != len(vectors_raw):
        raise SystemExit(
            f"embeddings.json has {len(emb_ids)} ids but {len(vectors_raw)} vectors."
        )
    if len(set(emb_ids)) != len(emb_ids):
        raise SystemExit("embeddings.json contains duplicate ids.")

    train_ids, test_ids = [], []
    for split, target in (("train", train_ids), ("test", test_ids)):
        for row in dataset[split]:
            if not isinstance(row, dict) or "id" not in row or "url" not in row:
                raise SystemExit(f"dataset.json {split} rows must have 'id' and 'url'.")
            target.append(row["id"])
    all_ids = train_ids + test_ids
    if len(set(all_ids)) != len(all_ids):
        raise SystemExit("dataset.json contains duplicate ids (or an id in both splits).")
    if set(all_ids) != set(emb_ids) or set(all_ids) != set(labels):
        raise SystemExit(
            "dataset.json, embeddings.json and labels.json must cover the same ids."
        )
    for image_id, category in labels.items():
        if not isinstance(category, str) or not category:
            raise SystemExit(
                f"labels.json: id {image_id!r} has an invalid category value."
            )

    vectors = {}
    for image_id, vec in zip(emb_ids, vectors_raw):
        if not isinstance(vec, list) or len(vec) != dim:
            raise SystemExit(
                f"embeddings.json vector for {image_id!r} has the wrong length (expected {dim})."
            )
        vectors[image_id] = np.asarray(vec, dtype=float)
    return train_ids, test_ids, labels, vectors


def reference_predict(train_ids, test_ids, labels, vectors):
    """Fit the reference classifier on the given train ids (their true labels)
    and predict every test id. Mirrors the live service: string labels,
    ``LogisticRegression(**CLF)``, probabilities read back via
    ``model.classes_`` (never assumed column order), ties broken by the lowest
    class index. Used by the backend parity tests
    (ml-game-backend/tests/test_parity.py).
    """
    features = np.stack([vectors[i] for i in train_ids])
    target = np.array([labels[i] for i in train_ids])
    model = LogisticRegression(**CLF)
    model.fit(features, target)
    classes = [str(c) for c in model.classes_]
    results = {}
    for image_id in test_ids:
        proba = model.predict_proba(vectors[image_id].reshape(1, -1))[0]
        by_category = {c: float(proba[classes.index(c)]) for c in classes}
        ordered = [by_category[c] for c in classes]
        best = int(np.argmax(ordered))
        results[image_id] = {
            "category": classes[best],
            "confidence": float(ordered[best]),
            "probabilities": by_category,
        }
    return results


def load_eval_data(data_dir: Path, json_input: bool = False):
    """Return (X_cat, X_dog, X_test, y_test) from either supported data format.

    Default (json_input=False): prep's manifest.json + embeddings.npy, original
    ids, manifest row order - the unchanged behaviour that produced the numbers
    recorded in docs/evaluation.md.

    json_input=True: the service's dataset.json + embeddings.json + labels.json
    (opaque ids, dataset.json row order). Because the seeded experiments choose
    subsets by positional index, a seed picks a different subset than in the
    default mode (see the module docstring's row-order caveat); the
    deterministic parts (baseline, perfect labels) are order-independent.
    """
    if json_input:
        train_ids, test_ids, labels, vectors = load_service_data(data_dir)
        cat_ids = [i for i in train_ids if labels[i] == CAT]
        dog_ids = [i for i in train_ids if labels[i] == DOG]
        X_cat = np.stack([vectors[i] for i in cat_ids])
        X_dog = np.stack([vectors[i] for i in dog_ids])
        X_test = np.stack([vectors[i] for i in test_ids])
        y_test = np.array([label_to_int(labels[i]) for i in test_ids])
        return X_cat, X_dog, X_test, y_test

    manifest = json.loads((data_dir / "manifest.json").read_text(encoding="utf-8"))
    embeddings = np.load(data_dir / "embeddings.npy")
    index = {row["id"]: i for i, row in enumerate(manifest)}

    train_rows = [row for row in manifest if row["split"] == "train"]
    test_rows = [row for row in manifest if row["split"] == "test"]

    X_test = embeddings[[index[row["id"]] for row in test_rows]]
    y_test = np.array([label_to_int(row["label"]) for row in test_rows])
    X_cat = embeddings[[index[row["id"]] for row in train_rows if row["label"] == CAT]]
    X_dog = embeddings[[index[row["id"]] for row in train_rows if row["label"] == DOG]]
    return X_cat, X_dog, X_test, y_test


def confidence_summary(model, X_test, y_true_test):
    """Test accuracy plus mean confidence of correct vs wrong predictions."""
    proba = model.predict_proba(X_test)  # columns = [cat, dog]
    confidence = proba.max(axis=1)
    correct = model.predict(X_test) == y_true_test
    acc = float(correct.mean())
    ans = {"test_accuracy": acc}
    if correct.any():
        ans["correct_count"] = int(correct.sum())
        ans["confidence_correct_mean"] = float(confidence[correct].mean())
    if (~correct).any():
        ans["wrong_count"] = int((~correct).sum())
        ans["confidence_wrong_mean"] = float(confidence[~correct].mean())
    return ans


def run_c_sweep(data_dir: Path, c_values, json_input: bool = False) -> dict:
    """C-sensitivity surface: C x {clean, 25%% wrong} x n in {3, 10, 22}.

    For each cell reports mean/min test accuracy, mean confidence on correct and
    wrong predictions, and the share of predictions with confidence below 0.70
    (<code>THRESHOLD</code>) for all / correct / wrong predictions.

    n=22 with clean labels is the single deterministic "perfect labels" run;
    every other cell uses ``C_SEEDS`` seeds. Subsets use RandomState(100+seed),
    label flips use RandomState(200+seed).
    """
    X_cat, X_dog, X_test, y_test = load_eval_data(data_dir, json_input=json_input)
    n_cat, n_dog = X_cat.shape[0], X_dog.shape[0]
    X_train = np.vstack([X_cat, X_dog])
    y_train = np.array([0] * n_cat + [1] * n_dog)

    print(f"C-sensitivity sweep (C in {c_values}; {C_SEEDS} seeds per random cell)")
    print(f"Training pool: {n_cat + n_dog} ({n_cat} cats / {n_dog} dogs)   Test pool: {X_test.shape[0]}\n")

    header = (f"| C | labels | n/class | runs | mean acc | min acc | conf(corr) | conf(wrong) | "
              f"<0.70 all | <0.70 corr | <0.70 wrong |")
    print(header)
    print("|---" * 11)

    cells = []
    for c in c_values:
        for mistake_rate in (0.0, 0.25):
            for n in (3, 10, n_cat):
                deterministic = mistake_rate == 0.0 and n == n_cat
                n_runs = 1 if deterministic else C_SEEDS
                accuracies, conf_all, conf_correct, conf_wrong = [], [], [], []
                for seed in range(n_runs):
                    if n == n_cat:
                        Xn, yn = X_train, y_train.copy()
                    else:
                        rng = np.random.RandomState(100 + seed)
                        ci = rng.choice(n_cat, size=n, replace=False)
                        di = rng.choice(n_dog, size=n, replace=False)
                        Xn = np.vstack([X_cat[ci], X_dog[di]])
                        yn = np.array([0] * n + [1] * n)
                    if mistake_rate > 0.0:
                        rng = np.random.RandomState(200 + seed)
                        flipped = rng.random(yn.size) < mistake_rate
                        yn[flipped] = 1 - yn[flipped]
                    model = LogisticRegression(**{**CLF, "C": c})
                    model.fit(Xn, yn)
                    proba = model.predict_proba(X_test).max(axis=1)
                    correct = model.predict(X_test) == y_test
                    accuracies.append(float(correct.mean()))
                    conf_all.extend(proba.tolist())
                    conf_correct.extend(proba[correct].tolist())
                    conf_wrong.extend(proba[~correct].tolist())

                def share_below(confs):
                    return float(np.mean(np.array(confs) < THRESHOLD)) if confs else None

                row = {
                    "C": c,
                    "mistake_rate": mistake_rate,
                    "n_per_class": n,
                    "runs": n_runs,
                    "mean_test_accuracy": float(np.mean(accuracies)),
                    "min_test_accuracy": float(np.min(accuracies)),
                    "confidence_correct_mean": float(np.mean(conf_correct)) if conf_correct else None,
                    "confidence_wrong_mean": float(np.mean(conf_wrong)) if conf_wrong else None,
                    "below07_all": share_below(conf_all),
                    "below07_correct": share_below(conf_correct),
                    "below07_wrong": share_below(conf_wrong),
                }
                cells.append(row)

                wrong_conf = "n/a" if row["confidence_wrong_mean"] is None else f"{row['confidence_wrong_mean']:.1%}"
                wrong_low = "n/a" if row["below07_wrong"] is None else f"{row['below07_wrong']:.1%}"
                labels = "clean" if mistake_rate == 0.0 else "25% wrong"
                print(f"| {c:<4} | {labels:<9} | {n:>7} | {n_runs:>4} | "
                      f"{row['mean_test_accuracy']:7.1%} | {row['min_test_accuracy']:7.1%} | "
                      f"{row['confidence_correct_mean']:6.1%} | {wrong_conf:>9} | "
                      f"{row['below07_all']:7.1%} | {row['below07_correct']:9.1%} | {wrong_low:>11} |")

    return {"c_values": c_values, "seeds_per_random_cell": C_SEEDS, "threshold": THRESHOLD, "cells": cells}


def main() -> None:
    args = parse_args()
    json_input = args.json_input is not None
    data_dir: Path = args.json_input if json_input else args.data_dir

    if args.c_values:
        results = {"setup": {"model": "sklearn.linear_model.LogisticRegression", "params": CLF}}
        results["c_sweep"] = run_c_sweep(data_dir, args.c_values, json_input=json_input)
        if args.json_out:
            args.json_out.write_text(json.dumps(results, indent=2), encoding="utf-8")
            print(f"\nWrote raw results to {args.json_out}")
        return

    X_cat, X_dog, X_test, y_true_test = load_eval_data(data_dir, json_input=json_input)
    train_size = int(X_cat.shape[0] + X_dog.shape[0])
    test_size = int(X_test.shape[0])

    if json_input:
        print(f"Input: service data trio from {data_dir} "
              "(dataset.json / embeddings.json / labels.json)")
    print(f"Training pool: {train_size} images ({X_cat.shape[0]} cats / {X_dog.shape[0]} dogs)   "
          f"Test pool: {test_size} images")
    print(f"Embedding dimension: {X_test.shape[1]}\n")

    results = {
        "setup": {
            "n_train": train_size,
            "n_test": test_size,
            "dim": int(X_test.shape[1]),
            "model": "sklearn.linear_model.LogisticRegression",
            "params": CLF,
            "seeds": args.seeds,
        }
    }

    # --- Baseline: always predict the majority class of the train pool ---
    majority = int(X_cat.shape[0] < X_dog.shape[0])
    baseline_acc = float(np.mean(y_true_test == majority))
    print(f"Baseline (always predict {CAT if majority == 0 else DOG}): test accuracy {baseline_acc:.1%}")
    results["baseline_test_accuracy"] = baseline_acc

    # --- 1. Perfect labels ------------------------------------------------
    X_train = np.vstack([X_cat, X_dog])
    y_train = np.array([0] * X_cat.shape[0] + [1] * X_dog.shape[0])
    clf = LogisticRegression(**CLF)
    clf.fit(X_train, y_train)
    perfect = confidence_summary(clf, X_test, y_true_test)
    train_acc = float(clf.score(X_train, y_train))
    print(f"\n1. Perfect labels: train {train_acc:.1%}, test {perfect['test_accuracy']:.1%}")
    print(f"   Confidence on {perfect.get('correct_count', 0)} correct and "
          f"{perfect.get('wrong_count', 0)} wrong predictions (mean): "
          f"correct={perfect.get('confidence_correct_mean')}, wrong={perfect.get('confidence_wrong_mean')}")
    perfect["train_accuracy"] = train_acc
    results["perfect_labels"] = perfect

    # --- 2. Train-size sweep (mean and min across seeds) ------------------
    print(f"\n2. Train-size sweep (n cats + n dogs per class, {args.seeds} seeds):")
    size_rows = []
    for n in TRAIN_SIZES:
        accuracies = []
        for seed in range(args.seeds):
            rng = np.random.RandomState(100 + seed)
            choose_cat = rng.choice(X_cat.shape[0], size=n, replace=False)
            choose_dog = rng.choice(X_dog.shape[0], size=n, replace=False)
            Xn = np.vstack([X_cat[choose_cat], X_dog[choose_dog]])
            yn = np.array([0] * n + [1] * n)
            model = LogisticRegression(**CLF)
            model.fit(Xn, yn)
            accuracies.append(float(model.score(X_test, y_true_test)))
        mean_acc, min_acc = float(np.mean(accuracies)), float(np.min(accuracies))
        print(f"   n={n:>2}:  mean test accuracy {mean_acc:6.1%}   min {min_acc:6.1%}")
        size_rows.append({"n_per_class": n, "mean_test_accuracy": mean_acc, "min_test_accuracy": min_acc})
    results["train_size_sweep"] = size_rows

    # --- 3. Labeling-mistake sweep ---------------------------------------
    print(f"\n3. Labeling-mistake sweep ({args.seeds} seeds per rate, accuracy vs TRUE test labels):")
    mistake_rows = []
    for rate in MISTAKE_RATES:
        accuracies = []
        conf_correct, conf_wrong = [], []
        for seed in range(args.seeds):
            rng = np.random.RandomState(200 + seed)
            y_noisy = y_train.copy()
            if rate > 0:
                flipped = rng.random(y_noisy.size) < rate
                y_noisy[flipped] = 1 - y_noisy[flipped]
            model = LogisticRegression(**CLF)
            model.fit(X_train, y_noisy)
            proba = model.predict_proba(X_test).max(axis=1)
            correct = model.predict(X_test) == y_true_test
            accuracies.append(float(correct.mean()))
            conf_correct.extend(proba[correct].tolist())
            conf_wrong.extend(proba[~correct].tolist())
        row = {
            "mistake_rate": rate,
            "mean_test_accuracy": float(np.mean(accuracies)),
            "min_test_accuracy": float(np.min(accuracies)),
            "confidence_correct_mean": float(np.mean(conf_correct)) if conf_correct else None,
            "confidence_wrong_mean": float(np.mean(conf_wrong)) if conf_wrong else None,
            "n_correct": len(conf_correct),
            "n_wrong": len(conf_wrong),
        }
        wrong_conf = "n/a" if row["confidence_wrong_mean"] is None else f"{row['confidence_wrong_mean']:.1%}"
        print(f"   {rate:>4.0%} wrong labels:  mean {row['mean_test_accuracy']:6.1%}  "
              f"min {row['min_test_accuracy']:6.1%}   conf(correct) "
              f"{row['confidence_correct_mean']:.1%}  conf(wrong) {wrong_conf}")
        mistake_rows.append(row)
    results["mistake_sweep"] = mistake_rows

    if args.json_out:
        args.json_out.write_text(json.dumps(results, indent=2), encoding="utf-8")
        print(f"\nWrote raw results to {args.json_out}")


if __name__ == "__main__":
    main()