STATUS: PROPOSED. Not implemented.

# Data layout (current facts + proposed changes)

## Current (facts)
- public/ml-playground/dataset.json (ids+urls only; 44 train/16 test) - public
- public/ml-playground/images/* (60)
- ml-game-frontend/public/ml-playground/* (duplicate copy) - public
- ml-game-backend/data/dataset.json, embeddings.json, labels.json - server-side (sensitive)
- prep/ outputs in prep/data/* (internal)

## Never public
- labels.json, embeddings.json, manifest.json, id_mapping.json (prep-only)

## PROPOSED changes (needs approval)
- Move stage-level data shaping server-side; browser should not receive full training list unless needed. Consider not shipping full public/ml-playground/dataset.json to browser if replaced by level config + pool endpoint.
- Add level configuration file (server-side, e.g. ml-game-backend/data/levels/level1.json)
- Evaluate duplicate frontend copy under ml-game-frontend/public/ml-playground/ (keep only if needed for standalone build; else remove to avoid drift).
- Export scripts may need reshaping for pools (rev5). Do not modify now.


## Data integrity (verified read-only)
- public/ml-playground: no labels.json/embeddings.json (verified)
- frontend public copy also checked (no secrets)

## Canonical script (hardened)
- Canonical: prep/export_browser_data.py (prep-relative anchors, project_root=prep.parent). Guards: service-data-dir and data-dir refused if under public/ or dist/ (resolved, case-insensitive); out-dir refused if inside ml-game-backend or into service dir. --force required to overwrite service files; --dry-run prints plan, writes nothing.
- Archived: archive/export_browser_data.prep_original.py, archive/export_browser_data.root_hardened.py. Duplicate root copy removed as path.
- Guard tests: ml-game-backend/tests/test_export_guard.py validates guards (case-insensitive/../public, out-dir/refusal, dry-run); ml-game-backend/tests/test_data_layout.py enforces no secrets under public/dist and requires service files.
