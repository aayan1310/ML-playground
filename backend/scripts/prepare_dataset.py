"""PART A - one-time preparation.

Download the Oxford-IIIT Pet dataset, pick a fixed set of 30 cat and 30 dog
images, resize them (longer side <= 512px), copy them into ``data/images`` and
write ``data/manifest.json``.

Run this once from the ``backend`` folder:

    python scripts/prepare_dataset.py

Requires the packages in ``requirements-prep.txt`` (torch, torchvision, pillow,
numpy). The live server does NOT need these.
"""

import argparse
import json
import random
from pathlib import Path

from PIL import Image
from torchvision.datasets import OxfordIIITPet

SEED = 42
PER_CLASS = 30
TRAIN_PER_CLASS = 22
LONG_SIDE = 512

CAT = "cat"
DOG = "dog"

# torchvision's OxfordIIITPet `binary-category` target is 0 for cat and 1 for dog.
BIN_CAT = 0
BIN_DOG = 1


def parse_args() -> argparse.Namespace:
    backend_dir = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description="Prepare the ML Playground dataset.")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=backend_dir / "data",
        help="Folder holding images/, manifest.json and embeddings.npy (default: backend/data).",
    )
    parser.add_argument("--seed", type=int, default=SEED, help="Random seed (default: 42).")
    parser.add_argument("--per-class", type=int, default=PER_CLASS, help="Images per class (default: 30).")
    parser.add_argument(
        "--train-per-class",
        type=int,
        default=TRAIN_PER_CLASS,
        help="How many of the per-class images go to the train pool (default: 22).",
    )
    parser.add_argument("--long-side", type=int, default=LONG_SIDE, help="Max longer side in pixels (default: 512).")
    return parser.parse_args()


def species_from_filename(image_id: str) -> str:
    """Cross-check rule: cat breed names start with a capital letter, dogs lowercase."""
    return CAT if image_id[:1].isupper() else DOG


def resize_and_copy(src: Path, dst: Path, long_side: int) -> None:
    with Image.open(src) as image:
        image = image.convert("RGB")
        width, height = image.size
        scale = long_side / max(width, height)
        if scale < 1:
            new_size = (max(1, round(width * scale)), max(1, round(height * scale)))
            image = image.resize(new_size, Image.LANCZOS)
        dst.parent.mkdir(parents=True, exist_ok=True)
        image.save(dst, "JPEG", quality=90)


def main() -> None:
    args = parse_args()
    data_dir: Path = args.data_dir
    images_dir = data_dir / "images"
    images_dir.mkdir(parents=True, exist_ok=True)

    print("Loading Oxford-IIIT Pet (downloads on first run, this can take a while)...")
    dataset = OxfordIIITPet(
        root=str(data_dir),
        split="trainval",
        target_types="binary-category",
        download=True,
    )

    cat_indices = []
    dog_indices = []
    for index, image_path in enumerate(dataset._images):
        if species_from_filename(image_path.stem) == CAT:
            cat_indices.append(index)
        else:
            dog_indices.append(index)

    if len(cat_indices) < args.per_class or len(dog_indices) < args.per_class:
        raise SystemExit(
            f"Not enough images: found {len(cat_indices)} cats and {len(dog_indices)} dogs, "
            f"but need {args.per_class} of each."
        )

    rng = random.Random(args.seed)
    rng.shuffle(cat_indices)
    rng.shuffle(dog_indices)

    chosen_cats = sorted(cat_indices[: args.per_class], key=lambda i: dataset._images[i].stem)
    chosen_dogs = sorted(dog_indices[: args.per_class], key=lambda i: dataset._images[i].stem)

    # --- Cross-check the labels: the binary-category target must agree with the
    # filename capitalization rule. Stop with an error if the two disagree. ---
    for index in chosen_cats:
        if dataset._bin_labels[index] != BIN_CAT:
            raise SystemExit(
                "Label mismatch: '%s' looks like a cat (capital letter) but the dataset "
                "says it is a dog (binary label %d). Stopping."
                % (dataset._images[index].stem, dataset._bin_labels[index])
            )
    for index in chosen_dogs:
        if dataset._bin_labels[index] != BIN_DOG:
            raise SystemExit(
                "Label mismatch: '%s' looks like a dog (lowercase letter) but the dataset "
                "says it is a cat (binary label %d). Stopping."
                % (dataset._images[index].stem, dataset._bin_labels[index])
            )

    print("\nExample of the 10 chosen cat filenames:")
    for index in chosen_cats[:10]:
        print("  ", dataset._images[index].stem)
    print("\nExample of the 10 chosen dog filenames:")
    for index in chosen_dogs[:10]:
        print("  ", dataset._images[index].stem)

    manifest = []

    def add_class(indices, label):
        order = list(range(len(indices)))
        rng.shuffle(order)
        train_positions = set(order[: args.train_per_class])
        for position, index in enumerate(indices):
            number = position + 1
            file_name = f"{label}_{number:03d}.jpg"
            split = "train" if position in train_positions else "test"
            resize_and_copy(dataset._images[index], images_dir / file_name, args.long_side)
            manifest.append(
                {
                    "id": f"{label}_{number:03d}",
                    "label": label,
                    "split": split,
                    "file": file_name,
                }
            )

    add_class(chosen_cats, CAT)
    add_class(chosen_dogs, DOG)

    (data_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    n_train = sum(1 for row in manifest if row["split"] == "train")
    n_test = sum(1 for row in manifest if row["split"] == "test")
    print(f"\nWrote {len(manifest)} images to {images_dir}")
    print(f"Wrote {data_dir / 'manifest.json'} ({n_train} train, {n_test} test)")
    print("\nNext step:  python scripts/compute_embeddings.py")


if __name__ == "__main__":
    main()
