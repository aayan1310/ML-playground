STATUS: PROPOSED. Not approved. Not implemented.

# ADR: Separate FastAPI + scikit-learn service (Level 1)

## Why separate
- Project requires FastAPI + scikit-learn service (per docs/ML_Learning_Game_Project_Plan_English.md and GAME-FLOW-PLAN.md).
- Keeps labels/embeddings server-side; enforces pool/validation rules.

## vs partner single-backend rule
- Partner analysis suggests single backend in some views; routing/ownership unknown.
- Development: frontend -> http://localhost:8000 (configurable). Production routing needs partner input.

## Failure handling
- If service down: show clear error, allow retry, do NOT fake results, do NOT credit progress.
- Offline-first: cannot fully satisfy (training/prediction need service for real model). Browser-only ML is not the current setup.


## Contradictions noted (read-only)
- PLAN.md had disjoint pools + 30-per-category shortfall framing; GFP rev5 replaces with available pool + 10 candidates per category per stage (cumulative). Using GFP rev5 for gameplay.

## Stage 2B follow-up decisions (2026-10-19, approved)

### CORS: exact local frontend origin only
- Allowed origin: `http://localhost:5173`, verified empirically (`npm run dev` in
  ml-game-frontend, Vite 8.3.4, no port pinned in vite.config.js -> default 5173).
- No wildcard, no production origins (production routing is decision D3, still open).
- PLAN.md Stage 2 said "CORS off by default"; this approved exception enables
  exactly one development origin. PLAN.md was not edited.

### Image serving
- Images stay in the backend data directory (`ml-game-backend/data/images/`);
  FastAPI serves them at `/images` via a StaticFiles mount.
- The mount is created at app startup from `MLPLAYGROUND_DATA_DIR` (same source
  as the ML service), so the served directory always matches the loaded data.
- Pool image URLs use the contract format `images/<file>` (relative to the API
  root); tests verify each one resolves to real JPEG bytes.

### Rate limiting: deferred (known omission)
- The contract lists `rate_limited` / HTTP 429, but the implementation enforces
  no request rate limits yet. Deferred until after the local demo, per approved
  decision. No dependency (e.g. slowapi) was added.
- The in-service gameplay limit (max 3 distinct test predictions per model) IS
  enforced and is unaffected.

### check / evaluate endpoints: not public
- No public `check` or `evaluate` endpoints are exposed. Train validation makes
  a separate `check` redundant for gameplay; evaluation stays offline
  (`prep/evaluate_offline.py`), per the data-contract decision table.
- Documentation discrepancy (recorded, not silently fixed): PLAN.md's Stage 2
  API table still lists `POST /api/ml/evaluate` and `POST /api/ml/check`, and
  PLAN.md's error-code list includes `evaluate_failed`. PLAN.md predates the
  data contract; the contract is the authoritative API spec. PLAN.md was left
  unchanged pending the owner's call on updating it.
