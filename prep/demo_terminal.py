r"""Terminal demo of the ML Playground idea (no UI needed).

Pick some pictures per box, optionally put some in the WRONG box on purpose,
train a small model, then see its prediction and confidence for the 16 test
pictures it has never seen.

Run from the project root (PowerShell):
  .\.venv\Scripts\python.exe prep\demo_terminal.py --n 5
  .\.venv\Scripts\python.exe prep\demo_terminal.py --n 10 --wrong 0.25
  .\.venv\Scripts\python.exe prep\demo_terminal.py --n 3 --seed 7
"""
import argparse
import json
import random
import sys
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression

ROOT = Path(__file__).resolve().parent.parent
CANDIDATES = [ROOT / "public" / "ml-playground", ROOT / "frontend" / "public" / "ml-playground"]
BOX_NAME = {0: "Cat", 1: "Dog"}
LABEL_BOX = {"cat": 0, "dog": 1}


def find_data_dir(given):
    if given:
        return Path(given)
    for c in CANDIDATES:
        if (c / "dataset.json").exists():
            return c
    sys.exit("Could not find dataset.json. Use --data <folder>.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=5, help="pictures per box (3 to 22)")
    ap.add_argument("--wrong", type=float, default=0.0, help="share of pictures put in the wrong box, e.g. 0.25")
    ap.add_argument("--seed", type=int, default=1, help="change to pick different pictures")
    ap.add_argument("--c", type=float, default=10.0, help="regularization strength (scikit-learn C)")
    ap.add_argument("--data", default=None, help="folder with dataset.json, embeddings.json, labels.json")
    args = ap.parse_args()

    d = find_data_dir(args.data)
    dataset = json.loads((d / "dataset.json").read_text(encoding="utf-8"))
    emb = json.loads((d / "embeddings.json").read_text(encoding="utf-8"))
    labels = json.loads((d / "labels.json").read_text(encoding="utf-8"))
    vec = {i: np.array(v) for i, v in zip(emb["ids"], emb["vectors"])}

    train_ids = [p["id"] for p in dataset["train"]]
    test_ids = [p["id"] for p in dataset["test"]]
    cats = [i for i in train_ids if labels[i] == "cat"]
    dogs = [i for i in train_ids if labels[i] == "dog"]
    if not 3 <= args.n <= min(len(cats), len(dogs)):
        sys.exit(f"--n must be between 3 and {min(len(cats), len(dogs))}")

    rng = random.Random(args.seed)
    chosen = rng.sample(cats, args.n) + rng.sample(dogs, args.n)
    flip = set(rng.sample(chosen, round(args.wrong * len(chosen))))
    boxes = {}
    for i in chosen:
        true_box = LABEL_BOX[labels[i]]
        boxes[i] = 1 - true_box if i in flip else true_box
    if len(set(boxes.values())) < 2:
        sys.exit("All pictures ended up in one box. Lower --wrong.")

    ids = sorted(boxes)
    clf = LogisticRegression(C=args.c, max_iter=1000)
    clf.fit(np.array([vec[i] for i in ids]), [boxes[i] for i in ids])

    right = len(chosen) - len(flip)
    print(f"Trained on {len(chosen)} pictures ({args.n} per box). "
          f"Sorted correctly: {right} of {len(chosen)}.\n")
    print(f"{'picture':<9}{'actual':<8}{'predicted':<11}{'confidence':<12}result")
    correct = 0
    for i in test_ids:
        p = clf.predict_proba([vec[i]])[0]
        box = int(np.argmax(p))
        actual = LABEL_BOX[labels[i]]
        ok = box == actual
        correct += ok
        print(f"{i:<9}{BOX_NAME[actual]:<8}{BOX_NAME[box]:<11}{p[box]*100:>6.1f}%     {'OK' if ok else 'WRONG'}")
    print(f"\nAccuracy on {len(test_ids)} unseen pictures: {correct / len(test_ids) * 100:.1f}%")


if __name__ == "__main__":
    main()