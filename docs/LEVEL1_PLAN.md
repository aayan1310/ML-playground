# Level 1 Implementation Plan (Planning Only)

## 1. Needs my decision (must resolve before starting)

| Decision | Options/What to decide | Recommended default | What it blocks |
|---|---|---|---|
| Level 1 training-image shortfall | Close by obtaining more images (preferred), or redefine pools? | Obtain more images to meet GFP: 30 distinct training images per category in 3 disjoint pools of 10, plus >=9 separate test images | Data preparation, pool construction, Stage 1-3 feasibility |
| Dataset license verification for existing and any new images | Verify licenses for prep data (Oxford-IIIT Pet reference) and any new images | Verify before adding any new images; do not proceed to preparation changes until verified | Any data prep changes |
| Reuse SortingGame.jsx? | Refactor, Replace, or Keep as-is | Refactor to Level 1 flow (sorting -> train -> predict/reveal -> wrap-up) if clean; else replace | Frontend scope (time/complexity) |
| Reveal required before continuing? | Yes/No | Yes (player-chosen predictions, Reveal before next action) | Predict/reveal UX and acceptance |
| Stage repeat allowed? | Yes/No | No for baseline (or per plan; confirm) | Flow semantics |
| Progress survives refresh? | Yes/No | No for local-only prototype (or sessionStorage); confirm | State model |
| Training screen: show code panel and/or accuracy figure? | Both/Code only/Accuracy only/Neither | Follow GFP 7A (confirm exact wording) | UI compliance |
| Fixed curated pools vs random pools | Fixed/Random | Fixed curated pools (deterministic for demos) | Data export and tests |
| API changes vs docs/data-contract.md | Adopt GFP semantics? | Proposal required; do NOT adopt without approval | Backend contract |

## 2. Starting point (from Stage 0 audit)

Verified: public/ml-playground has 60 images, dataset.json train=44/test=16 (ids+urls only), no labels/embeddings under public; backend/data has dataset.json, labels.json (30 cat/30 dog), embeddings.json; frontend build succeeds; SortingGame.jsx is visual prototype.
Unverified: full backend test behavior, embedding dimensions recomputed, khair-labs-analysis full alignment, API behavior under full flow.
Must rework: frontend into Level 1 flow (sorting with pools on RIGHT per GFP, train/validate, predict/reveal, wrap-up). May refactor or replace SortingGame.jsx depending on decision.
Do NOT touch: partner repo, existing data unless approved; planning docs unchanged.

## 3. Level 1 acceptance definition (based on GFP sections 7A, 12)

- Stage 1 (3 per category), Stage 2 (5 total), Stage 3 (10 total) with locked carryover of correct images.
- 10 new training images per category per stage (disjoint pools).
- Validation on Train: wrong images identified, model not trained.
- Fresh model per stage trained on whole accumulated set.
- Three player-chosen predictions per stage on unused test images, with Reveal button.
- Level 1 intro/start and finish.
- English text structure ready for Roman Urdu (translation files).
- Bright kid-friendly theme from GFP 7A.
Additions (marked for review): parity with offline evaluation (C=10) on accumulated sets; backend tests pass; frontend tests cover key flows.

## 4. Proposed Level 1 API contract (proposal; needs approval)

Goal: align gameplay semantics (pools, validation, per-stage fresh model, predictions on unused test images) with service. Differences from docs/data-contract.md/PLAN.md must be resolved.
Proposed endpoints (Level 1):
- GET /api/level/1/config -> level config (categories, stages, pool sizes, test rules)
- GET /api/level/1/pools?stage=n -> training pools for stage (disjoint; 10 per category) (or bundled in config)
- POST /api/level/1/validate  -> validate student sorting (identify wrong images) before training
- POST /api/level/1/train     -> train fresh model per stage on accumulated set; returns model id/status
- GET /api/level/1/test-eligible -> unused test images for current level/session
- POST /api/level/1/predict  -> predict on chosen test image(s) (respect one-use per level)
- POST /api/level/1/reveal   -> reveal results for predictions
Constraints: embeddings/server-side labels only; FIFO/model caps per contract; predict constrained to eligible pool; C=10 (LogisticRegression lbfgs/l2, max_iter=1000) for parity with evaluation.

## 5. Level 1 data plan

- Known limitation: current train counts 22/22 per category < 30 required. Shortfall 8 each; obtaining more images is required before final pool construction (needs approval).
- Construct 3 disjoint pools of 10 per category for Level 1 (30 total training images per category). Track pool assignment in data files (prep/export) without leaking labels to public.
- Test pool: >=9 separate test images; enforce one-use per level (session tracking). 
- Maintain labels/embeddings server-side only. Public dataset remains ids+urls only.
- Offline evaluation: check accuracy/confidence at 3,5,10 per category with nested selections; parity target per docs/evaluation.md (C=10).

## 6. Ordered task list (A Backend, B Frontend, C E2E)

### A1: Confirm data/model readiness (read-only)
- Objective: Verify counts, pool feasibility, label/embedding coverage.
- Prereqs: Decision on image shortfall.
- Files likely: prep/*, ml-game-backend/data/*
- Deliverables: Data readiness report.
- Acceptance: Documented actual vs required.
- Verification: Python counts (read-only); show real output.

### A2: Backend contract (proposal) & skeleton alignment
- Objective: Propose Level 1 API (endpoints/shapes) and identify changes vs data-contract.md; no implementation yet.
- Prereqs: A1 + decision on API.
- Files: ml-game-backend/app/* (read-only planning context)
- Deliverables: Proposed shapes in plan; list of diffs.
- Acceptance: Review before implementation.

### B1: Frontend architecture decision (reuse/refactor/replace)
- Objective: Decide based on SortingGame.jsx audit; structure i18n (EN) and theme.
- Prereqs: Decisions table.
- Files: ml-game-frontend/src/* (context only)
- Deliverables: Recommendation with evidence.

### B2: Level 1 UI skeleton (planning)
- Objective: Plan screens (intro, sort with pools RIGHT, train, predict/reveal, stage wrap-up, level wrap-up), components, routing, states.

### C1: Test plan review
- Objective: Define backend/frontend/E2E tests and manual walkthrough.

Note: Tasks are planning-level items; no code changes. Dependencies: data shortfall resolved, API approved before implementation.

## 7. Test plan (high level)

- Backend: validation identifies wrong images, model not trained on invalid; fresh model per stage; predict limited to eligible/unused test images; FIFO/model caps; C=10 parity checks.
- Frontend: render screens, drag/tap-to-place, locked slots/carryover, Reset, wrong-sort feedback, disabled Train with explanation, missing images, API failure, expired model, loading states, used test images, language file structure (EN).
- E2E: manual walkthrough script covering Stage 1-2-3 end-to-end against real service.

## 8. Demonstration milestones

- After plan approval: ready to start A1 (data readiness) once decisions made.
- After backend contract approved + implementation: can demo API against real service.
- After frontend integrated: playable Level 1 end-to-end locally.

## 9. Risks and what could not be verified

- Data shortfall (known temporary limitation) blocks pool construction; needs image acquisition + license verification.
- GFP S9 conflicts unresolved (API/contract, pools, Train/validate, predict/reveal semantics).
- Partner design alignment and full khair-labs-analysis cross-check incomplete.
- Full backend test suite not re-run in audit; embedding dims not recomputed.

## 10. Recommended FIRST task and prerequisites

First task: A1 (Confirm data/model readiness). Prerequisites: get approval/decision on image shortfall and license verification. Report actual vs required counts, pool feasibility, and whether prep can proceed without modifying source code.

## Commands run (planning)
- Read PLAN.md (16200), GFP (53409), audit, data-contract.md, evaluation.md, AGENTS.md, khair-labs-analysis files (read-only).
- Python checks: counts from public/ml-playground and backend/data (train/test 44/16, labels 30/30, images 60).
- vite build succeeded (context only; not rerun now).
