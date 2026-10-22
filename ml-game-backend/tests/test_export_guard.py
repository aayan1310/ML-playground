"""Guard tests for export_browser_data.py (secret files must never land
under a public/dist folder; dry-run must write nothing).

Everything here uses pytest's tmp_path only; the real repository is never
written to. The default-argument checks are read-only (no main() call).
"""

import json
import sys
from pathlib import Path

import numpy as np
import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "prep"))

import export_browser_data as ebd  # noqa: E402


def test_service_dir_under_public_rejected(tmp_path: Path) -> None:
    reason = ebd.forbidden_dir_reason(tmp_path / "public" / "x")
    assert reason is not None


def test_service_dir_under_public_capital_p_rejected(tmp_path: Path) -> None:
    reason = ebd.forbidden_dir_reason(tmp_path / "Public" / "x")
    assert reason is not None


def test_service_dir_with_dotdot_public_rejected(tmp_path: Path) -> None:
    (tmp_path / "a").mkdir()
    (tmp_path / "public").mkdir()
    reason = ebd.forbidden_dir_reason(tmp_path / "a" / ".." / "public" / "x")
    assert reason is not None


def test_normal_tmp_dir_accepted(tmp_path: Path) -> None:
    assert ebd.forbidden_dir_reason(tmp_path / "service") is None
    assert ebd.forbidden_dir_reason(tmp_path / "prep" / "data") is None


def test_real_default_arguments_accepted() -> None:
    """Read-only: the shipped defaults must pass every guard."""
    args = ebd.parse_args([])
    assert ebd.forbidden_dir_reason(args.service_data_dir) is None
    assert ebd.forbidden_dir_reason(args.data_dir) is None
    assert ebd.out_dir_reason(args.out_dir, args.service_data_dir) is None


def test_main_refuses_secret_dir_under_public_and_writes_nothing(tmp_path: Path) -> None:
    with pytest.raises(SystemExit):
        ebd.main(["--service-data-dir", str(tmp_path / "public" / "x")])
    assert not (tmp_path / "public" / "x").exists()


def _make_fake_inputs(root: Path) -> Path:
    data_dir = root / "prep" / "data"
    (data_dir / "images").mkdir(parents=True)
    manifest = [
        {"id": "cat_001", "label": "cat", "split": "train", "file": "cat_001.jpg"},
        {"id": "dog_001", "label": "dog", "split": "train", "file": "dog_001.jpg"},
        {"id": "cat_002", "label": "cat", "split": "test", "file": "cat_002.jpg"},
    ]
    (data_dir / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
    np.save(data_dir / "embeddings.npy", np.ones((3, 4), dtype=np.float32))
    for row in manifest:
        (data_dir / "images" / row["file"]).write_bytes(b"fake")
    return data_dir


def test_dry_run_writes_nothing(tmp_path: Path) -> None:
    data_dir = _make_fake_inputs(tmp_path)
    out_dir = tmp_path / "browser" / "ml-playground"
    service_dir = tmp_path / "service-data"

    ebd.main(
        [
            "--data-dir", str(data_dir),
            "--out-dir", str(out_dir),
            "--service-data-dir", str(service_dir),
            "--dry-run",
        ]
    )

    assert not out_dir.exists()
    assert not (service_dir / "labels.json").exists()
    assert not (service_dir / "embeddings.json").exists()
    assert not (data_dir / "id_mapping.json").exists()
