STATUS: PROPOSED. Not approved. Not implemented.

# Level 1 Data Contract (PROPOSED)

## 1. Scope and vocabulary
- prediction, confidence (largest probability; not a guarantee)
- label, reveal, candidate, available pool, accepted example

## 2. Level configuration
- level id, category names, candidates per category per stage (10), stage totals (3,5,10), predictions per stage (3), min training per category (15), min test (9)
- Level 1: categories [cat, dog]; 3 stages with totals 3/5/10
- Extensible to 3+ categories (schema same)

## 3. Endpoints (PROPOSED)
- GET /health
- GET /api/level/:id/config (or level data; browser must not receive labels)
- POST /api/level/:id/pool: returns 10 candidates per category drawn from available pool (training ids minus accepted). Service knows labels.
- POST /api/level/:id/train: validate; wrong_labels -> 400, no model. success -> model_id and counts.
- POST /api/level/:id/predict: model_id + test id -> category, confidence, probabilities (k, sum 1, ties lowest index); <=3 distinct per model; no repeats; test-only.
- POST /api/level/:id/reveal: only after predict for that (model,id); returns true category and match.
- OPEN QUESTION: check/evaluate (retain as optional audit or drop)? Recommendation: drop evaluate for gameplay, keep check only if needed pre-validate; requires approval.

## 4. Error codes (PROPOSED)
{code, detail}, snake_case. Examples: invalid_request, unknown_id, not_in_train_pool, not_in_test_pool, duplicate_id, wrong_counts, wrong_labels, not_predicted_yet, prediction_limit_reached, model_not_found, pool_too_small, rate_limited, numeric_failure.

## 5. Rules
- Cache-Control no-store; no labels/embeddings in responses before allowed.
- labels/embeddings never under public/.
- in-memory models, newest 500 kept (oldest evicted); one worker unless state moves.
- C=10 constant.
- startup validation: ids/labels/embeddings consistent; train/test disjoint; >=15 training per category; >=9 test; image files exist.

## 6. Privacy/threat model
- browser sees only what returned; wrong-image feedback reveals training labels (by design); reveal discloses test label only after prediction; scripting can still learn; rate limits not sufficient to prevent.

## 7. Differences vs previous contract and PLAN.md (table)
| Item | Previous/PLAN | Proposed (rev5-based) | Status |
|---|---|---|---|
| Pools | disjoint fixed pools | available pool + draw 10 candidates per category per stage (cumulative) | CONFLICT - requires approval |
| Train validation | implicit | validate on Train -> wrong_labels + no model | PROPOSED change |
| Predictions | not specified | 3 player-chosen, unused test images, Reveal | PROPOSED |
| Endpoints | check/evaluate present | under review (open) | OPEN |

## 8. Open questions
- repeat stage? (default no)
- progress survives reload? (default no, sessionStorage)
- Reveal required before continuing? (default yes)
- train must verify selections from candidates issued? (default yes)
- rate limits? (propose values later)
- check/evaluate retention? (recommend drop evaluate, review check)

## 9. Contract test cases (properties)
- 10 candidates per category drawn only from available pool; none already accepted; fixed during stage
- wrong_labels returns specific ids; no model created
- predict <=3 distinct per model; no repeats; test-only
- reveal only after predict


## Appendix: Data layout reference
- See docs/data-layout.md for current facts and proposed changes (PROPOSED).

## Verification summary (A1)
- Copied data-contract.md to archive/docs/data-contract.rev1.md
- Rewrote data-contract.md as PROPOSED Level 1 contract
- Created adr-ml-service.md (PROPOSED), data-layout.md (PROPOSED)
- Verified no secrets under public/ or ml-game-frontend/public/
- Checked test_data_layout.py existence: not present in ml-game-backend/tests/ (only conftest.py); guard test not runnable as named file

## Contradictions vs PLAN.md
- Pools: PLAN assumed fixed pools; rev5 -> available pool + candidates drawn by service (CONFLICT).
- Train: validate on Train (wrong_labels, no model) vs implicit (PROPOSED change).
- Gameplay: stage totals 3/5/10 with locked carryover, 3 predictions + Reveal per rev5 (CONFLICT where different).
