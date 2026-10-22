STATUS: PROPOSED. Not approved. Not implemented.

# Level 1 Data Contract (PROPOSED)

## 1. Level configuration (PROPOSED)

The schema supports **any number of categories and is not hard-coded to two**;
Level 1 uses two as a configuration value, not as an assumption in the schema.

- Ordered categories: the category list is ordered; category indexes are the
  positions in that list (used for tie-breaking in predictions).
- Candidates per category per stage: 10.
- Cumulative per-category totals per stage: 1, 5, 10 (Level 1). Stage 1
  deliberately uses one example per category.
- Prediction limit per model, by the stage it was trained for: 1, 3, 3
  (Level 1). `predictions_per_stage` is a list indexed by stage.
- Minimum training-pool size per category (derived from the rules): >=15.
- Minimum test-pool size: >=9 (3 predictions x 3 stages, all distinct).

Level 1 values:

| Level | Categories (ordered) | Stage totals (cum./category) | Candidates/stage (per cat) | Min training (per cat) | Min test |
|---|---|---|---|---|---|
| 1 | [cat, dog] | 1, 5, 10 | 10 | >=15 | >=9 |

**Level 1 arithmetic** (per category, 22 available reported):

| Stage | Available at start | Candidates drawn | New selected | Available after |
|---|---:|---:|---:|---:|
| 1 | 22 | 10 | 3 | 19 |
| 2 | 19 | 10 (from 19) | 2 | 17 |
| 3 | 17 | 10 (from 17) | 5 | 12 |

All draws are >=10 available, and the derived minimum of 15 is satisfied
(22 >= 15). Cats and dogs are tracked separately; the numbers are identical
for both.

**Configuration JSON (corrected schema):**

```json
{
  "level_id": "1",
  "categories": [{"id": "cat"}, {"id": "dog"}],
  "candidates_per_category": 10,
  "stage_totals_per_category": [1, 5, 10],
  "predictions_per_stage": [1, 3, 3],
  "min_training_per_category": 15,
  "min_test": 9
}
```

A three-category level uses the same schema with three entries in
`categories` and the same stage totals per category; nothing in this
contract assumes exactly two categories.

## 2. Endpoints (PROPOSED)

### GET /health

- Request: none.
- Response: `200 {"status": "ok"}`.

### GET /api/level/:id/setup (level initialization)

- Request: none (path level id only).
- Response JSON: the level's categories, stage configuration and the
  **label-free test-image list** (ids and URLs only) the frontend needs to
  initialize the level and run the prediction pool. **Never labels,
  embeddings, or training candidates.**

```json
{
  "level": "1",
  "categories": ["cat", "dog"],
  "stage_totals_per_category": [1, 5, 10],
  "candidates_per_category": 10,
  "predictions_per_stage": [1, 3, 3],
  "test_images": [
    {"id": "img_045", "url": "images/img_045.jpg"},
    {"id": "img_012", "url": "images/img_012.jpg"}
  ]
}
```

- Worked example: the frontend calls `GET /api/level/1/setup` once when the
  level starts; `test_images` lists every eligible test picture for the level
  (Level 1: all 16). The player may pick any of them for predictions, once
  each, per level.
- Unknown level id -> `unknown_level` (404), same error envelope as the other
  endpoints.

### POST /api/level/:id/pool (stage pool)

- Request JSON: `{"level": "1", "stage": 1, "accepted": ["img_001"]}`
  (`accepted` may be empty for stage 1; it lists ids the player has already
  accepted for training in earlier stages).
- Response JSON: **one shuffled, mixed list** of candidate ids and URLs.
  **No category keys, no labels, no ordering hint about the true class**:
  the service draws 10 candidates per category from each category's
  available pool, shuffles them into a single list, and returns only `id`
  and `url` per item. The draw is fixed for that stage session; re-renders
  and Reset never redraw it.

```json
{
  "candidates": [
    {"id": "img_007", "url": "images/img_007.jpg"},
    {"id": "img_002", "url": "images/img_002.jpg"},
    {"id": "img_031", "url": "images/img_031.jpg"}
  ]
}
```

- The list has `candidates_per_category` x (number of categories) entries
  (20 for Level 1). Which drawn candidates belong to which category is
  never revealed before the wrong-placement feedback on Train allows it.
- Worked example (Level 1, stage 2): request
  `{"level":"1","stage":2,"accepted":["img_007","img_002","img_014"]}` returns
  20 mixed candidates (10 cat + 10 dog drawn, order shuffled), excluding the
  accepted ids, with ids and urls only.

### POST /api/level/:id/train

- Request JSON: `{"level": "1", "stage": 1, "choices": [{"id": "img_007", "category": "cat"}, {"id": "img_002", "category": "dog"}]}`
  (the full sorted set for the stage, including carryover images, one entry per image).
- Success response JSON: model id and counts per category. A **fresh model
  is trained per stage on the whole accumulated set**.

```json
{"model_id": "mdl_9f2c4a", "counts": {"cat": 3, "dog": 3}}
```

- Wrong placements: the response is an error (HTTP 400) with code
  `wrong_labels` and the list of wrong ids. **NO model is trained.**

```json
{"code": "wrong_labels", "detail": {"wrong_ids": ["img_019"], "wrong_count": 1}}
```

- Worked example: player sorts 3 cat + 3 dog (stage 1 totals); all correct ->
  success with `model_id` and `counts: {"cat":3,"dog":3}`. If `img_019` (true
  label cat) was placed in the dog box, the response is the 400
  `wrong_labels` above and no model is created.

### POST /api/level/:id/predict

- Request JSON: `{"model_id": "mdl_9f2c4a", "test_id": "img_045"}`.
- Rules: test-pool images only; at most **three distinct** test images per
  model; no repeats; probabilities for every configured category; tie-break =
  lowest category index; confidence = maximum probability.
- Response JSON:

```json
{
  "category": "cat",
  "confidence": 0.83,
  "probabilities": [{"category": "cat", "p": 0.83}, {"category": "dog", "p": 0.17}]
}
```

- Worked example: after stage 1 training, the player picks test image
  `img_045` (unused so far this level), calls predict -> response as above.
  A second predict on `img_045` with the same `model_id` fails with
  `prediction_limit_reached` or `duplicate_id` (see error table); a second
  distinct test image for that stage-1 model fails with
  `prediction_limit_reached` (a stage-2 or stage-3 model allows 3).

### POST /api/level/:id/reveal

- Request JSON: `{"model_id": "mdl_9f2c4a", "test_id": "img_045"}`.
- Allowed **only after predict** for the same image and model.
- Response JSON:

```json
{"true_category": "dog", "match": false}
```

- Worked example: after the predict on `img_045` above, reveal returns
  `true_category` (from the server-side labels) and whether the model's
  prediction matched. Reveal without a prior predict for that (model, image)
  returns 409 `not_predicted_yet`.

## 3. Validation order (PROPOSED)

**Train** (first failing check short-circuits; nothing is written):
1. Request shape / parse -> `invalid_request` (400).
2. Every `choices[].id` is a known training id -> `unknown_id` (404).
3. Every `choices[].id` is in the stage's issued candidate set / accepted
   pool -> `not_in_train_pool` (400).
4. No duplicate ids in `choices` -> `duplicate_id` (400).
5. Counts per category match the stage's cumulative totals ->
   `wrong_counts` (400).
6. Every placement matches the true label -> on mismatch: `wrong_labels`
   (400) with `wrong_ids`; **no model is trained**.
7. Only now train the model (fresh, whole accumulated set) and return
   success.

**Predict** (first failing check short-circuits):
1. Request shape / parse -> `invalid_request` (400).
2. `model_id` exists in the in-memory store -> `model_not_found` (404).
3. `test_id` is a known test-pool id -> `not_in_test_pool` (400)
   (`unknown_id` (404) if the id does not exist at all).
4. `test_id` not already predicted with this model -> `duplicate_id` (400).
5. Distinct test images used with this model <= 3 ->
   `prediction_limit_reached` (400).
6. Only now compute and return the prediction.

## 4. Errors (PROPOSED)

Error body is always `{"code": "...", "detail": ...}`; codes are snake_case.

| Code | HTTP status | Meaning |
|---|---|---|
| invalid_request | 400 | body not parseable / missing fields / wrong types |
| unknown_id | 404 | id not found in dataset |
| unknown_level | 404 | level id not configured |
| not_in_train_pool | 400 | training id not in the issued candidate/accepted pool |
| not_in_test_pool | 400 | id is not a test-pool image |
| duplicate_id | 400 | id already used in this request or already predicted for this model |
| wrong_counts | 400 | per-category counts do not match the stage totals |
| wrong_labels | 400 | placements do not match true labels; includes wrong_ids; no model trained |
| not_predicted_yet | 409 | reveal called before predict for that (model, image) |
| prediction_limit_reached | 400 | the model already made its stage's limit of distinct predictions (1, 3, 3) |
| model_not_found | 404 | model id unknown or evicted |
| pool_too_small | 400 | available pool smaller than the draw (config/data error) |
| rate_limited | 429 | too many requests; retry later (**not yet implemented**: rate limiting deferred until after the local demo; the 3-predictions-per-model limit is enforced) |
| numeric_failure | 500 | training/prediction failed numerically (e.g. non-finite) |

## 5. Rules (PROPOSED)

- Every response carries `Cache-Control: no-store`.
- Test images are single-use per level and are never added to training, not
  even after reveal.
- The in-memory model store keeps the newest 500 models (FIFO eviction);
  evicted ids return `model_not_found`.
- A single worker is required while model state is in memory (no shared
  state across workers).
- `model_id` is opaque (example format `mdl_9f2c4a`, not meaningful).
- Image ids are opaque (`img_001`..`img_060`); filenames and ids never
  reveal the class.
- No labels and no embeddings appear in any response before the flow allows
  them; labels and embeddings are never under any public folder.

## 6. Privacy and threat model (PROPOSED, honest)

- The browser sees whatever any response contains; hiding a field in the UI
  is not security.
- Deliberately revealed: training labels, via the wrong-placement feedback
  (wrong ids are named on Train); a test label, only after that image is
  predicted and then revealed.
- What a scripting user can still learn: by repeatedly sorting and training,
  wrong-label feedback reveals training labels directly; reveal reveals
  test labels after prediction. Stage-pool draws do **not** reveal labels
  (candidates are one mixed list; see section 2). A patient scripting user
  can still recover much of the label set via wrong-label feedback.
- Rate limits only slow this down; they do not prevent it. No endpoint is
  claimed to be secure because the UI hides a response.

## 7. Decision table (PROPOSED, pending manager decision)

| Old endpoint | Proposal | Reason |
|---|---|---|
| check | Drop from the public API | Train validates before training; a separate check is redundant for gameplay (may remain as an internal helper, undecided) |
| evaluate | Not part of the API; stays as an offline evaluation script only | Evaluation happens offline (prep/evaluate_offline.py); the game flow uses per-stage predict/reveal instead |

## 8. Open questions (PROPOSED, unresolved)

- Routing: how this service sits under the partner's /api/* rewrite (Master
  Plan decision D3); production routing needs partner input. Unknown.
- Offline-first: real training/prediction require this service; a fully
  offline experience cannot be met honestly.
- CORS: development origin decided 2026-10-19: exactly
  `http://localhost:5173` (verified local Vite dev server). Production
  origins remain undecided (part of routing decision D3).

## 9. Appendix

See docs/data-layout.md for the data locations that back this contract.
