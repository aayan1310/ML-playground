# Data folder

## Dataset: Oxford-IIIT Pet

- **Name:** Oxford-IIIT Pet Dataset
- **Source:** https://www.robots.ox.ac.uk/~vgg/data/pets/
- **Downloaded via:** `torchvision.datasets.OxfordIIITPet` (see `../prepare_dataset.py`)

The `images/` folder holds a small fixed subset (30 cats, 30 dogs) copied from
the Oxford-IIIT Pet Dataset, resized so the longer side is at most 512px.

- `manifest.json` - one entry per image: `{id, label, split, file}`.
- `embeddings.npy` - one 512-dim vector per image, same order as the manifest.

The raw downloaded dataset is stored in `raw/oxford-iiit-pet/` (git-ignored) and
can be deleted; re-running the prep scripts downloads it again.

## License warning

**Check the dataset's license/terms before using these images in any public or
commercial product.** At the time of writing the Oxford-IIIT Pet Dataset is
distributed for non-commercial research purposes, and the original images were
collected from the web, so they may carry their own copyright. Do your own
license check before shipping anything public.
