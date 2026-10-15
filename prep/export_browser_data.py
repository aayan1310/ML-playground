"""Export the prepared dataset into a folder the browser can load.

Places static files (no server needed) into ``public/ml-playground/``:

  images/img_001.jpg ... img_060.jpg   neutral filenames (opaque ids)
  dataset.json      { train: [{id, url}], test: [{id, url}] } - no labels
  embeddings.json   { dim, ids, vectors }  id -> 512-dim vector
  labels.json       { "img_017": "cat", ... } true labels, all 60 ids

The ids are OPAQUE: a fixed-seed shuffle maps the original cat_001..dog_030 ids
onto img_001..img_060 so the filename, id or URL never reveals the class. The
train and test lists are also shuffled so cats and dogs are interleaved. The
id -> original mapping is written to a prep-only file (never copied to public):
  prep/data/id_mapping.json

Run from the ``prep`` folder (after prepare_dataset.py + compute_embeddings.py):

    python export_browser_data.py

The TS engine (a later task) must follow the contract in ``docs/data-contract.md``.
"""

import argparse
import json
import random
import shutil
from pathlib import Path

import numpy as np

SEED = 42
DECIMALS = 6  # rounding reduces file size; see docs/data-contract.md


def parse_args() -> argparse.Namespace:
    prep_dir = Path(__file__).resolve().parent
    project_root = prep_dir.parent
    parser = argparse.ArgumentParser(description="Export browser-ready ML Playground files.")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=prep_dir / "data",
        help="Folder with images/, manifest.json, embeddings.npy (default: prep/data).",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=project_root / "public" / "ml-playground",
        help="Where to write browser files (default: public/ml-playground).",
    )
    parser.add_argument("--seed", type=int, default=SEED, help="Random seed for the id shuffle (default: 42).")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data_dir: Path = args.data_dir
    out_dir: Path = args.out_dir
    images_out = out_dir / "images"

    manifest_path = data_dir / "manifest.json"
    embeddings_path = data_dir / "embeddings.npy"
    if not manifest_path.exists() or not embeddings_path.exists():
        missing = [p.name for p in (manifest_path, embeddings_path) if not p.exists()]
        raise SystemExit(
            "Missing file(s): " + ", ".join(missing) + f" in {data_dir}. "
            "Run prepare_dataset.py and compute_embeddings.py first."
        )

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    embeddings = np.load(embeddings_path)

    if len(manifest) != len(embeddings):
        raise SystemExit("manifest.json and embeddings.npy have different numbers of rows.")

    # --- 1. Opaque ids ------------------------------------------------
    # Shuffle img_001..img_060 and assign them in manifest order, so the mapping
    # between original and opaque ids is a fixed random permutation.
    opaque_ids = [f"img_{n:03d}" for n in range(1, len(manifest) + 1)]
    random.Random(args.seed).shuffle(opaque_ids)
    opaque_for_row = {
        i: opaque_ids[i] for i in range(len(manifest))
    }  # manifest row index -> opaque id

    original_for_id = {}
    for i, row in enumerate(manifest):
        original_for_id[opaque_for_row[i]] = {
            "original_id": row["id"],
            "label": row["label"],
            "split": row["split"],
            "file": row["file"],
        }

    # --- 2. Images (neutral filenames) --------------------------------
    images_out.mkdir(parents=True, exist_ok=True)
    for i, row in enumerate(manifest):
        shutil.copy2(data_dir / "images" / row["file"], images_out / f"{opaque_for_row[i]}.jpg")

    # --- 3. dataset.json: public pools, interleaved, no labels --------
    dataset = {"train": [], "test": []}
    for i, row in enumerate(manifest):
        image_id = opaque_for_row[i]
        item = {"id": image_id, "url": f"images/{image_id}.jpg"}
        dataset[row["split"]].append(item)

    # Shuffle each pool so cats and dogs are interleaved (position does not
    # reveal the class either).
    random.Random(args.seed + 1).shuffle(dataset["train"])
    random.Random(args.seed + 1).shuffle(dataset["test"])
    (out_dir / "dataset.json").write_text(json.dumps(dataset), encoding="utf-8")

    # --- 4. embeddings.json: id -> vector (manifest order, rounded) ---
    ids = [opaque_for_row[i] for i in range(len(manifest))]
    dim = int(embeddings.shape[1])
    vector_count = len(ids)
    rounded = np.round(embeddings, decimals=DECIMALS)

    with (out_dir / "embeddings.json").open("w", encoding="utf-8") as handle:
        handle.write('{"dim": %d, "ids": %s, "vectors": [' % (dim, json.dumps(ids)))
        for i in range(vector_count):
            handle.write(json.dumps(rounded[i].tolist(), separators=(",", ":")))
            handle.write("," if i < vector_count - 1 else "")
        handle.write("]}")

    # --- 5. labels.json: true labels for all ids (reveal time only) ---
    labels = {opaque_for_row[i]: row["label"] for i, row in enumerate(manifest)}
    (out_dir / "labels.json").write_text(json.dumps(labels), encoding="utf-8")

    # --- 6. prep-only mapping file ------------------------------------
    (data_dir / "id_mapping.json").write_text(
        json.dumps(original_for_id, indent=2), encoding="utf-8"
    )

    n_train = len(dataset["train"])
    n_test = len(dataset["test"])
    print(f"Wrote {len(manifest)} images to {images_out} (opaque filenames)")
    print(f"dataset.json:     {n_train} train, {n_test} test (no labels, interleaved)")
    print(f"embeddings.json:  {vector_count} vectors x {dim} dims -> {out_dir / 'embeddings.json'}")
    print(f"labels.json:      {len(labels)} true labels -> {out_dir / 'labels.json'}")
    print(f"id_mapping.json:  {data_dir / 'id_mapping.json'} (prep-only)")


if __name__ == "__main__":
    main()