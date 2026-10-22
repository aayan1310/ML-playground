"""Export the prepared dataset into a browser folder and the service folder.

The public and the secret outputs are deliberately separate:

  PUBLIC   --out-dir          (default: public/ml-playground)
      images/img_001.jpg ... img_060.jpg   neutral filenames (opaque ids)
      dataset.json      { train: [{id, url}], test: [{id, url}] } - no labels,
                        no embeddings, never any labels

  SECRET   --service-data-dir (default: ml-game-backend/data)
      labels.json       { "img_017": "cat", ... } true labels, all ids
      embeddings.json   { dim, ids, vectors }  id -> 512-dim vector

  PREP-ONLY --data-dir        (default: prep/data)
      id_mapping.json   opaque id -> original id/label mapping

Guards (all run before anything is written):
  * --service-data-dir and --data-dir are refused if they resolve under any
    folder named "public" or any folder named "dist" (case-insensitive).
  * --out-dir is refused if it points into ml-game-backend or into the
    service-data-dir (a public folder must never hold server-side data).
  * Existing files in --service-data-dir are never overwritten unless
    --force is passed; without it the script reports what would change.
  * --dry-run prints every file it would write, then writes nothing.

The ids are OPAQUE: a fixed-seed shuffle maps the original cat_001..dog_030 ids
onto img_001..img_060 so the filename, id or URL never reveals the class.

Run from the ``prep`` folder (after prepare_dataset.py + compute_embeddings.py):

    python export_browser_data.py --dry-run
    python export_browser_data.py --force

The TS engine (a later task) must follow the contract in ``docs/data-contract.md``.
"""

import argparse
import json
import random
import shutil
import sys
from pathlib import Path

import numpy as np

SEED = 42
DECIMALS = 6  # rounding reduces file size; see docs/data-contract.md
FORBIDDEN_DIR_NAMES = {"public", "dist"}


def parse_args(argv=None) -> argparse.Namespace:
    prep_dir = Path(__file__).resolve().parent
    project_root = prep_dir.parent
    parser = argparse.ArgumentParser(description="Export browser-ready ML Playground files.")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=prep_dir / "data",
        help="Folder with images/, manifest.json, embeddings.npy (default: prep/data). "
        "Refused if it resolves under a 'public' or 'dist' folder.",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=project_root / "public" / "ml-playground",
        help="Where to write public browser files: images + dataset.json "
        "(default: public/ml-playground). Never receives labels or embeddings.",
    )
    parser.add_argument(
        "--service-data-dir",
        type=Path,
        default=project_root / "ml-game-backend" / "data",
        help="Where to write the secret files labels.json and embeddings.json "
        "(default: ml-game-backend/data). Refused if it resolves under a "
        "'public' or 'dist' folder.",
    )
    parser.add_argument("--seed", type=int, default=SEED, help="Random seed for the id shuffle (default: 42).")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Allow overwriting existing labels.json/embeddings.json in the service data dir.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print every file that would be written and where, then write nothing.",
    )
    return parser.parse_args(argv)


def forbidden_dir_reason(path: Path) -> str | None:
    """Return a human-readable reason if ``path`` must not hold prep/secret
    files (it resolves under or is a folder named 'public' or 'dist',
    case-insensitive), else None."""
    resolved = Path(path).resolve()
    for part in resolved.parts:
        if part.lower() in FORBIDDEN_DIR_NAMES:
            return f"{resolved} is under (or is) a '{part}' folder"
    return None


def out_dir_reason(out_dir: Path, service_data_dir: Path) -> str | None:
    """Return a reason to refuse this public output dir, else None."""
    out = Path(out_dir).resolve()
    svc = Path(service_data_dir).resolve()
    if out == svc or svc in out.parents:
        return f"out-dir {out} would write into the secret service-data-dir {svc}"
    if any(part.lower() == "ml-game-backend" for part in out.parts):
        return f"out-dir {out} must not be inside ml-game-backend"
    return None


def main(argv=None) -> None:
    args = parse_args(argv)
    data_dir: Path = Path(args.data_dir)
    out_dir: Path = Path(args.out_dir)
    service_data_dir: Path = Path(args.service_data_dir)
    images_out = out_dir / "images"

    # --- 0. Path guards: run before anything is read or written ----------
    problems = []
    reason = forbidden_dir_reason(service_data_dir)
    if reason:
        problems.append(f"--service-data-dir refused: {reason}")
    reason = forbidden_dir_reason(data_dir)
    if reason:
        problems.append(f"--data-dir refused: {reason} (id_mapping.json is prep-only)")
    reason = out_dir_reason(out_dir, service_data_dir)
    if reason:
        problems.append(f"--out-dir refused: {reason}")
    if problems:
        for problem in problems:
            print(f"ERROR: {problem}", file=sys.stderr)
        print("Nothing was written.", file=sys.stderr)
        raise SystemExit(2)

    # --- 1. Inputs (read-only) -------------------------------------------
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

    # --- 2. Build the full write plan (nothing written yet) ---------------
    labels_path = service_data_dir / "labels.json"
    embeddings_out_path = service_data_dir / "embeddings.json"
    secret_targets = [labels_path, embeddings_out_path]
    would_overwrite = [p for p in secret_targets if p.exists()]
    would_create = [p for p in secret_targets if not p.exists()]

    if args.dry_run:
        print("Dry run - no files will be written.")
        print(f"Would write (public, browser-readable)  -> {out_dir}")
        print(f"    {out_dir / 'dataset.json'}  (train + test, ids and urls only)")
        print(f"    {images_out}  ({len(manifest)} image files, opaque names)")
        print(f"Would write (secret, server-side only)  -> {service_data_dir}")
        for path in would_create:
            print(f"    {path}  (new)")
        for path in would_overwrite:
            suffix = "" if args.force else "  (overwrite - would need --force)"
            print(f"    {path}  (exists){suffix}")
        print(f"Would write (prep-only)                 -> {data_dir}")
        print(f"    {data_dir / 'id_mapping.json'}")
        return

    # --- 3. Refuse to overwrite service data without --force --------------
    if would_overwrite and not args.force:
        print("Refusing to overwrite existing file(s) in the service data dir "
              f"({service_data_dir}):", file=sys.stderr)
        for path in would_overwrite:
            print(f"    would overwrite: {path}", file=sys.stderr)
        for path in would_create:
            print(f"    would create:    {path}", file=sys.stderr)
        print("Re-run with --force to overwrite, or remove the file(s). "
              "Nothing was written.", file=sys.stderr)
        raise SystemExit(2)

    # --- 4. Opaque ids ----------------------------------------------------
    opaque_ids = [f"img_{n:03d}" for n in range(1, len(manifest) + 1)]
    random.Random(args.seed).shuffle(opaque_ids)
    opaque_for_row = {i: opaque_ids[i] for i in range(len(manifest))}

    original_for_id = {}
    for i, row in enumerate(manifest):
        original_for_id[opaque_for_row[i]] = {
            "original_id": row["id"],
            "label": row["label"],
            "split": row["split"],
            "file": row["file"],
        }

    # --- 5. PUBLIC: images + dataset.json (no labels, no embeddings) ------
    images_out.mkdir(parents=True, exist_ok=True)
    for i, row in enumerate(manifest):
        shutil.copy2(data_dir / "images" / row["file"], images_out / f"{opaque_for_row[i]}.jpg")

    dataset = {"train": [], "test": []}
    for i, row in enumerate(manifest):
        image_id = opaque_for_row[i]
        item = {"id": image_id, "url": f"images/{image_id}.jpg"}
        dataset[row["split"]].append(item)

    random.Random(args.seed + 1).shuffle(dataset["train"])
    random.Random(args.seed + 1).shuffle(dataset["test"])
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "dataset.json").write_text(json.dumps(dataset), encoding="utf-8")

    # --- 6. SECRET: labels.json + embeddings.json (service dir only) ------
    ids = [opaque_for_row[i] for i in range(len(manifest))]
    dim = int(embeddings.shape[1])
    vector_count = len(ids)
    rounded = np.round(embeddings, decimals=DECIMALS)

    with embeddings_out_path.open("w", encoding="utf-8") as handle:
        handle.write('{"dim": %d, "ids": %s, "vectors": [' % (dim, json.dumps(ids)))
        for i in range(vector_count):
            handle.write(json.dumps(rounded[i].tolist(), separators=(",", ":")))
            handle.write("," if i < vector_count - 1 else "")
        handle.write("]}")

    labels = {opaque_for_row[i]: row["label"] for i, row in enumerate(manifest)}
    labels_path.write_text(json.dumps(labels), encoding="utf-8")

    # --- 7. PREP-ONLY mapping file ----------------------------------------
    (data_dir / "id_mapping.json").write_text(
        json.dumps(original_for_id, indent=2), encoding="utf-8"
    )

    n_train = len(dataset["train"])
    n_test = len(dataset["test"])
    print(f"Wrote {len(manifest)} images to {images_out} (opaque filenames)")
    print(f"dataset.json:     {n_train} train, {n_test} test (no labels, interleaved)")
    print(f"embeddings.json:  {vector_count} vectors x {dim} dims -> {embeddings_out_path}")
    print(f"labels.json:      {len(labels)} true labels -> {labels_path}")
    print(f"id_mapping.json:  {data_dir / 'id_mapping.json'} (prep-only)")


if __name__ == "__main__":
    main()
