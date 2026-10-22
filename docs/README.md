# docs/

Project write-ups. Start with the root `AGENTS.md`.

| Doc | Purpose |
| --- | ------- |
| `data-contract.md` | The backend REST contract: level config, endpoints, validation order, error codes, rules, privacy model. |
| `data-layout.md` | Which data files are public vs server-only, and the export-script guards. |
| `adr-ml-service.md` | Why the classifier runs in a FastAPI service instead of the browser. |
| `PLAN.md` | Master plan (stages, risks, decisions). |
| `GAME-FLOW-PLAN.md`, `LEVEL1_PLAN.md` | Game flow and Level 1 design. |
| `evaluation.md` | Offline accuracy/confidence numbers for `LogisticRegression(C=10)`: train-size sweep and labeling-mistake sweep. |
| `evaluation-results.json` | Raw numbers behind `evaluation.md`, produced by `prep/evaluate_offline.py --json-out docs/evaluation-results.json`. |
| `STAGE0_AUDIT.md`, `PROJECT-ANALYSIS.md` | Earlier audits and analysis. |
| `Memory.md` | The previous agent's session notes (history; `AGENTS.md` wins on conflicts). |

Read `data-contract.md` before touching the API, and `data-layout.md` before
touching anything under `public/` or `ml-game-backend/data/`.
