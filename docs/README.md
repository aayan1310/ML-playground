# docs/

Write-ups that guide the browser app work.

| Doc | Purpose |
| --- | ------- |
| `data-contract.md` | The exact schema of `public/ml-playground/*.json` (Part 1) and the writable contract for the future TypeScript engine (`parseData`, `attachLabels`, `labelCheck`, `train`, `predict`, `evaluate`, error codes) (Part 2). |
| `evaluation.md` | Real offline accuracy numbers for the classifier — train-size sweep (mean + worst) and labeling-mistake sweep (incl. 25% wrong) — the target the browser engine should match. |
| `evaluation-results.json` | Raw numbers behind `evaluation.md`, produced by `prep/evaluate_offline.py` (generated; safe to regenerate with `--json-out docs/evaluation-results.json`). |

Read `data-contract.md` before touching anything under `public/ml-playground/`
or writing the TS engine.