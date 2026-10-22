"""Data-layout guard tests (Stage A1).

Fails if sensitive server-side files (labels.json, embeddings.json) ever appear
under a folder the browser can load, and checks the service data folder still
has the files the service needs.

These tests never import the app; they only inspect the repository layout, so
they run without torch and without a server.
"""

import json
from pathlib import Path

import pytest

FORBIDDEN_NAMES = {"labels.json", "embeddings.json"}


def repo_root() -> Path:
    """Repository root, resolved from this file, not the current directory."""
    return Path(__file__).resolve().parents[2]


def find_forbidden_files(root: Path) -> list[str]:
    """Return every file named labels.json / embeddings.json (case-insensitive,
    at any depth) under the browser-loadable folders inside ``root``.

    Scanned (relative to root):
      public/
      ml-game-frontend/public/
      ml-game-frontend/dist/   (only if it exists)
    """
    scanned_roots = [
        root / "public",
        root / "ml-game-frontend" / "public",
        root / "ml-game-frontend" / "dist",
    ]
    offenders = []
    for scanned in scanned_roots:
        if not scanned.is_dir():
            continue
        for path in scanned.rglob("*"):
            if path.is_file() and path.name.lower() in FORBIDDEN_NAMES:
                offenders.append(str(path.relative_to(root)).replace("\\", "/"))
    return sorted(offenders)


def test_public_has_no_secret_data_files() -> None:
    """The real repo must not expose labels.json or embeddings.json to the browser."""
    offenders = find_forbidden_files(repo_root())
    assert offenders == [], (
        "Forbidden files found under a browser-loadable folder: "
        + ", ".join(offenders)
    )


def test_service_data_has_required_files() -> None:
    """The service-side data folder must keep labels.json and embeddings.json."""
    data_dir = repo_root() / "ml-game-backend" / "data"
    missing = [name for name in ("labels.json", "embeddings.json")
               if not (data_dir / name).is_file()]
    assert missing == [], f"Missing service data file(s) in {data_dir}: {missing}"


def test_scan_detects_forbidden_files(tmp_path: Path) -> None:
    """Prove the helper reports offenders, so the guard cannot silently pass."""
    fake_secret_dir = tmp_path / "public" / "ml-playground"
    fake_secret_dir.mkdir(parents=True)
    (fake_secret_dir / "labels.json").write_text(json.dumps({}), encoding="utf-8")

    offenders = find_forbidden_files(tmp_path)
    assert offenders == ["public/ml-playground/labels.json"]
