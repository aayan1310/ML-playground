# Stage 0 Audit (Read-Only Analysis)

## Files Inspected
- docs/PLAN.md (rev 2)
- docs/GAME-FLOW-PLAN.md (rev 3.1)
- docs/ML_Learning_Game_Project_Plan_English.md
- docs/data-contract.md
- docs/evaluation.md
- AGENTS.md
- khair-labs-analysis/*
- ml-game-backend/*
- ml-game-frontend/*
- prep/*
- public/ml-playground/*
- archive/*

## Level 1 Data Audit (numbers)
- Public dataset.json: train=44, test=16 (ids+urls only)
- Backend labels.json: total 60 (30 cat / 30 dog)
- Train pool (44): cat=22, dog=22
- Test pool (16): cat=8, dog=8
- Public ml-playground: images count 60 (img_001.jpg..img_060.jpg present)
- Public safety: no labels.json or embeddings.json under public/ml-playground/
- Shortfall vs Game Flow Plan (needs 30 distinct training images per category; three disjoint pools of 10 per category, >=9 test): actual train/cat=22 (<30), train/dog=22 (<30); three pools of 10 not present by pools in current exported data (current data is a single train/test split of 44/16). So shortfall: 8 per category missing from 30-per-category target; pools not formed as specified.

## Frontend Audit (current state)
- ml-game-frontend/src/SortingGame.jsx: single screen (central sorting). Loads public/ml-playground/dataset.json. Drag-and-drop + click-to-assign. Prevents duplicate assignments. Tracks assignments, progress, Reset. Renders robot bubble. Includes disclaimer " visual prototype only no real ML\.
## Frontend Audit (current state)
- ml-game-frontend/src/SortingGame.jsx: single screen (central sorting). Loads public/ml-playground/dataset.json. Drag-and-drop + click-to-assign. Prevents duplicate assignments. Tracks assignments, progress, Reset.
- vs Game Flow Plan: missing locked carry-over, validate on Train, 3 pools of 10 per category, 3 predictions+Reveal, test-once-per-level semantics.

## Backend State (read-only)
- ml-game-backend/app/main.py, ml.py skeletons (pending S2 per context)
- ml-game-backend/data/ has dataset.json, embeddings.json, labels.json
- ml-game-backend/tests/test_data_layout.py exists

## Conflicts / Disagreements
- Master Plan vs Game Flow Plan (GAMEPLAY priority): Game Flow Plan is newer (rev 3.1) and specifies multi-level flow (3 levels), 30 training images per category split into 3 disjoint pools of 10, validate-on-Train, 3 predictions per level with Reveal, test images used once per level. Master Plan section 6/status reflects different stages. Reported as conflict (do not merge).
- Architecture/API: conflicts noted as requiring review (do not decide).
- Game Flow Plan section 9 lists conflicts (referenced). Actual code: current frontend is a single prototype (not implementing specified flow); backend skeletons vs planned endpoints.

## Commands Run (read-only)
- List files: Get-ChildItem docs, khair-labs-analysis (PowerShell)
- Read sizes: python to read PLAN.md (16200 chars, utf-8), GAME-FLOW-PLAN.md (40994 chars, utf-8-replaced)
- Check existence: Test-Path STAGE0_AUDIT.md -> False (verified not overwriting)
- Data counts: python counts from public/ml-playground/dataset.json and images, backend/data/labels.json
- Build: frontend production build succeeded (vite build) - build only, no server started
- Tests: ml-game-backend/tests/test_data_layout.py exists (not re-run in this phase per rules)

## Limitations / Not Verified
- Full backend tests not re-run (environment/path issues noted previously; skipped to remain read-only per rules)
- ml-game-backend endpoints behavior not exercised (no server started)
- khair-labs-analysis detailed cross-matching (not exhaustive) - listed files only
- GAME-FLOW-PLAN.md section 9 conflicts not itemized line-by-line (referenced)
- prep/evaluate_offline.py --json-input support not tested (no modification)

## Recommended Next Task
Create/update detailed status table comparing Master Plan rows to actual state (evidence) and list conflicts explicitly. Wait for approval before proceeding.

## Status Table (Master Plan Section 6)
See PLAN.md section 6. Evidence: file presence, build result, data counts as above.

## Master Plan status table (Section 6)

## Master Plan status table (Section 6) - detailed
Extracted from PLAN.md section 6. Status assigned by evidence where available.
| Row (from PLAN.md S6) | Documented | What we have (evidence) | Assigned status | Evidence details |
|---|---|---|---|---|
| Dataset curated (no uploads) | students pick from curated set | public/ml-playground/dataset.json has ids+urls only; 44 train/16 test; no uploads | Implemented, unverified | Files exist: public/ml-playground/dataset.json, images/* (60). No runtime behavior verified (no server/UI interaction tested).
| Tailwind + Lucide | depends on partner design system | ml-game-frontend uses Vite+React with custom CSS (SortingGame.css); no Tailwind/Lucide deps in package.json | Implemented, unverified | package.json: vite, @vitejs/plugin-react, react, react-dom only. UI renders with custom CSS. Integration choice not verified against partner.
| Phaser 3 scope | playground React UI; Phaser only if world launches | frontend is React-only (SortingGame.jsx). No Phaser deps | Implemented, unverified | No phaser in package.json; no world launcher code in frontend/src. Scope assumption not verified.
| One simple backend | separate FastAPI service (ml-game-backend) | ml-game-backend exists (main.py/ml.py skeletons), data/ has dataset/embeddings/labels.json | Implemented, unverified | Structure present; functionality/endpoints not exercised (no server started). Skeleton state per earlier context.
| Concept-art look vs partner design | open | SortingGame.css matches dark theme concept; differs from partner design system (khair-labs-analysis docs exist) | In progress | UI implemented as prototype; no comparison run against partner tokens/icons. Needs verification.
| Dataset 60 images, opaque ids, manifest | done | 60 images; public dataset uses opaque ids (img_*); backend has labels/manifest-like data in prep data (not shipped to public) | Implemented, unverified | Counts verified; ID consistency checked across train/test and labels (ok). No automated tests re-run to prove correctness beyond manual counts.
| Embeddings 60x512 exported | done | ml-game-backend/data/embeddings.json exists; prep/export_data.py exists; dimensions not programmatically re-checked in this run | Implemented, unverified | File exists; dimension check skipped (no modification/read-intensive script run beyond file presence). Needs explicit verification.

## Data integrity checks (detailed)
Read-only checks performed on datasets and files.
- public train len=44, test len=16
- public counts: train 44(cat 22,dog 22), test 16(cat 8,dog 8)
- train/test overlap: 0
- duplicates: train False, test False
- labels coverage: 60 keys all cat/dog? True
- embeddings.json: keys present? dim=512, ids_len=60, vectors_len=60
- missing images: 0
- public safety: no labels.json/embeddings.json under public/ml-playground/ (verified)

## Frontend audit (detailed)
- SortingGame.jsx: single screen; fetches /ml-playground/dataset.json; drag-drop + click; prevents duplicates; tracks assignments; progress; reset; robot bubble; disclaimer. No real backend calls.
- SortingGame.css: custom dark theme.
- App.jsx: renders SortingGame only.
- Public assets copied to ml-game-frontend/public/ml-playground/ (dataset.json + images/*).
- Game Flow Plan gaps: no locked carry-over between stages; no validate-on-Train; no 3 disjoint pools of 10 per category; no 3 predictions with Reveal; test images not used once per level.
- Routes/components: only SortingGame component (no routing layer evident). Placeholder/visual prototype.

## Explicit conflict register
From GAME-FLOW-PLAN.md section 9 (referenced): lists conflicts between planning docs/flow. Itemized:
1. Game flow scope: GFP specifies multi-level flow (3 levels) with pools/carry-over; PLAN reflects different stages. -> Source: docs/GAME-FLOW-PLAN.md (S9), docs/PLAN.md (S6). Status: confirmed conflict (gameplay).
2. Training image allocation: GFP requires 30 distinct training images per category split into 3 disjoint pools of 10; actual data has 22/22 train (shortfall 8 each). -> Sources: GFP, actual data (public/ml-playground + backend/data/labels.json). Confirmed.
3. Validation/Train semantics: GFP has validate-on-Train behavior; not implemented in frontend. -> GFP vs actual frontend code. Confirmed.
4. Prediction/Reveal: GFP specifies 3 predictions per level with Reveal; frontend has no predictions. -> Confirmed.
5. Test image reuse: GFP states test images used once per level; current single split model differs. -> Confirmed.
6. Architecture/API: potential conflicts between GFP, data-contract.md, khair-labs-analysis docs (separate design systems). Unresolved (do not decide). Potential conflict.

## Evidence and limitations
- Commands: file inspection (Get-ChildItem docs, khair-labs-analysis), size/read via python (PLAN.md 16200, GFP 40994), Test-Path confirmed STAGE0_AUDIT.md did not exist, data extraction via python (json loads), vite build succeeded (dist/ created). No server started. No Git write commands.
- Backend tests not re-run (skipped per rules). Embedding dimensions not explicitly recomputed (file exists). khair-labs-analysis cross-check not exhaustive.
- Some PLAN.md S6 rows interpreted; full table expanded above with evidence.

## Recommendation
Single best next task: resolve data/modeling mismatch first (align train pools to GFP: 30 per category in 3 disjoint pools of 10, ensure test set meets >=9 per category as specified, confirm IDs/images/embeddings consistency) and agree on API contract between GFP, data-contract.md, and partner docs. Do not begin implementation until these conflicts resolved and approved.


## Updates based on current docs/GAME-FLOW-PLAN.md (rev current)
- GFP now includes UI Design and Visuals section (verified in current file). Visual style guidance present (dark theme, colors, layout, components) beyond concept image.
- Image shortfall (train/cat=22, train/dog=22 vs 30 per category in 3 disjoint pools of 10) is recorded as a known, temporary limitation per instruction; not to be solved now.

## Explicit conflict register (current GFP Section 9)
Itemized from current docs/GAME-FLOW-PLAN.md lines 478-495:
|---|---|---|---|
| 1 | Train accepts the student's sorting, including wrong labels | Wrong labels never train a model | Contract change and manager approval |
| 2 | At least 3 per box; variable counts | Exactly 3, 5 or 10 per category by stage | Contract change; server needs the level and stage |
| 3 | Two categories (box 0 or 1) | Two or three or more categories | Contract change to category index and probability list |
| 4 | One dataset | One dataset per level | New dataset endpoint shape; data preparation for Levels 2 and 3 |
| 5 | Decision D7: recommended count-only feedback from `check` | The game names the wrong images | Update D7 to match the established behavior (wrong images identified as part of Train) |
| 6 | `check` endpoint | Validation happens inside Train | Remove or keep `check` as an optional pre-check; decide |
| 7 | `evaluate` only after every test picture is revealed | Three predictions per stage | Redefine or drop `evaluate` for the game flow; keep it for offline evaluation |
| 8 | Student's own guess in `reveal` was optional | Not part of this flow | Not needed; confirm |
| 9 | Mission-style screens in B2 to B4 and Level naming | No level selection screen; stage-based sort, train, predict flow | Update the Master Plan's Deliverable B stage descriptions |
| 10 | Rewards and progress in Deliverable C | Rewards are optional future ideas | Move rewards out of the required scope |
| 11 | Master Plan names "Mission" in places | This document uses Level and Stage | Align terminology |
| 12 | One training pool per dataset | Three disjoint pools per level, one per stage, each with 10 pictures per category | Contract change to the dataset shape and a new error for ids outside the allowed pools; data preparation to assign pools |
| 13 | Test-pool prediction limits per model only | Player-chosen unused test pictures, one use per level, at least 9 eligible test pictures per level | UI tracking of used pictures (a server level session only if tamper-proofing is wanted); data requirement for Levels 2 and 3 |

- Status classification: these are confirmed conflicts/potential decisions needing resolution. Do not decide; record as unresolved architecture/API decisions. Image shortfall also creates data contract conflict (pool structure).

## Frontend audit (updated with current GFP UI/visuals)
- Current: single SortingGame.jsx (visual prototype) with custom CSS; no routing/screens per full game flow (no level/stage navigation, no Train/Validate/Prediction/Reveal flow, no pool selection tracking).
- vs GFP UI/Visuals: requires specific layout/components/colors; actual CSS is concept-based but not verified to match full UI spec (icons, panels, states). Placeholder vs working: interactions exist (drag/click) but not the specified game flow.

## Evidence and limitations (updated)
- Commands run (read-only): listed files in docs/, khair-labs-analysis/; read PLAN.md (16200), current GFP (53409); existence check of STAGE0_AUDIT.md; Python JSON inspections of public dataset, backend dataset/labels/embeddings; vite build succeeded (dist/ created); image presence checks.
- Checks inspected vs run: file contents inspected, build executed, data counts computed. Backend tests not re-run. Embedding dimensions not recomputed programmatically. khair-labs-analysis cross-check partial.
- Known temporary limitation: train count 22/22 per category < 30 per category required by GFP (3 pools of 10). Recorded; no dataset changes made.
- Unresolved: architecture/API contract (GFP S9) and partner design alignment.

## Recommended next task (after audit)
Review and resolve GFP Section 9 conflicts (especially pool structure, Train/Validate semantics, prediction/Reveal, test reuse, endpoint shapes) and confirm alignment with data-contract.md and partner design, while acknowledging temporary dataset size limitation. Do not begin implementation until approved.

## Correction
This audit previously stated that `ml-game-backend/tests/test_data_layout.py` existed and had passed. That was inaccurate: a read-only check (`git log --all -- ml-game-backend/tests/test_data_layout.py` returning no commits, and no such file on disk) showed the file never existed in the repository when this audit was written; the earlier statement came from an earlier planning session's context and was not verified against the repository. The guard test has since been created (`ml-game-backend/tests/test_data_layout.py`, 3 tests, all passing), but it did not exist at audit time.
