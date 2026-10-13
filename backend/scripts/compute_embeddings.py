"""PART A - one-time preparation.

Turn every image listed in ``data/manifest.json`` into a 512-dimensional vector
using a pretrained ResNet18 (ImageNet weights, final classification layer
removed, L2-normalized). Rows are saved in the same order as the manifest to
``data/embeddings.npy``.

Run this once, after prepare_dataset.py, from the ``backend`` folder:

    python scripts/compute_embeddings.py

Requires the packages in ``requirements-prep.txt``. The live server does NOT
need these.
"""

import argparse
import json
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from torchvision import models


def parse_args() -> argparse.Namespace:
    backend_dir = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description="Compute image embeddings for the ML Playground.")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=backend_dir / "data",
        help="Folder holding images/, manifest.json and embeddings.npy (default: backend/data).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data_dir: Path = args.data_dir

    manifest_path = data_dir / "manifest.json"
    if not manifest_path.exists():
        raise SystemExit(
            f"{manifest_path} not found. Run scripts/prepare_dataset.py first."
        )

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    # Pretrained ResNet18 with the final fully-connected layer replaced by the
    # identity: the output is the 512-dim pooled feature vector.
    weights = models.ResNet18_Weights.IMAGENET1K_V1
    model = models.resnet18(weights=weights)
    model.fc = torch.nn.Identity()
    model.eval()

    # Standard ImageNet preprocessing that matches these weights:
    # resize to 256, center-crop to 224, tensor + normalize with ImageNet stats.
    preprocess = weights.transforms()

    vectors = []
    with torch.no_grad():
        for row in manifest:
            image_path = data_dir / "images" / row["file"]
            image = Image.open(image_path).convert("RGB")
            tensor = preprocess(image).unsqueeze(0)
            vector = model(tensor).squeeze(0).numpy()
            norm = np.linalg.norm(vector)
            if norm == 0:
                raise SystemExit(f"Zero embedding for {row['file']}.")
            vectors.append((vector / norm).astype(np.float32))

    embeddings = np.stack(vectors)
    np.save(data_dir / "embeddings.npy", embeddings)

    print(f"Computed embeddings for {len(manifest)} images.")
    print(f"Shape: {embeddings.shape} (rows match manifest.json order)")
    print(f"Wrote {data_dir / 'embeddings.npy'}")
    print("\nDone. You can now start the server:  uvicorn app.main:app --reload --port 8000")


if __name__ == "__main__":
    main()
