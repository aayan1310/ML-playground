# archive/fastapi-backend/

The **old** ML Playground backend: a FastAPI server that trained scikit-learn
`LogisticRegression` on served embeddings at request time.

It is kept here only as a reference for the game rules (at-least-3-per-box,
no overlap, 16 test images scored with true labels, `prediction/confidence/
probabilities/actual/correct` payload) and for the original tests. It is
**superseded**: the browser app will implement the same rules in TypeScript over
the static files in `public/ml-playground/` (see `docs/data-contract.md`).

Not runnable as-is and not part of any future build. No torch anywhere here;
the old prep lives at `prep/` now.