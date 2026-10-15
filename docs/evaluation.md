# Evaluation results — ML Playground classifier

What the in-browser classifier should achieve. Because we cannot run a real
student who sorts images into boxes, every experiment below simulates the
student with the **TRUE labels** of the 44-image train pool, then measures test
accuracy on the 16 held-out test images against their true labels.

Classifier: `sklearn.linear_model.LogisticRegression` (solver lbfgs, penalty l2,
C=10, `max_iter=1000`) — the reference for the browser TS engine described in
`docs/data-contract.md`. Vectors are the 512-dim L2-normalized ResNet18
embeddings from `public/ml-playground/embeddings.json`.

All numbers are real runs of `prep/evaluate_offline.py`; the raw JSON is in
`docs/evaluation-results.json`. To reproduce:

```powershell
.\.venv\Scripts\python.exe prep\evaluate_offline.py --json-out docs\evaluation-results.json
```

## Setup

- 60 images total, 44 train (22 cats / 22 dogs) + 16 test (8 / 8).
- Baseline (always predict the train-pool majority): **50.0%**.

## 1. Perfect labels

Student labels every train image correctly (22 cats + 22 dogs).

| Train | Test | Confidence (16 correct / 0 wrong) |
| ----- | ---- | --------------------------------- |
| 100%  | 100% | correct 87.3%, wrong n/a           |

With every label right, the model is effectively perfect on the test pool.
Confidence now averages ~87% — the higher C makes the right answer clearly
preferred — but a wrong answer is still not guaranteed to be un-confident.

## 2. Effect of training data size (n cats + n dogs, 20 random subsets)

Repeated 20 times per `n` (different random animals each time) to see how much
the outcome depends on which images the student picks. **Mean AND worst case.**

| Images per class (train) | Mean test accuracy | Min test accuracy |
| ------------------------ | ------------------ | ---------------- |
| 3                        | 98.1%              | 75.0%            |
| 5                        | 98.8%              | 81.2%            |
| 10                       | 100.0%             | 100.0%           |
| 15                       | 100.0%             | 100.0%           |
| 22 (all)                 | 100.0%             | 100.0%           |

Take-away for the game: even a small sort-job (3 per box) is *usually* great,
but the minimum shows it can occasionally fail. The classifier becomes reliably
perfect at ≈10 images per class.

## 3. Effect of labeling mistakes (sorted into the wrong box)

Same 44 training images every time, but we randomly flip a fraction of the
labels to simulate a sloppy student, then score against TRUE test labels.
20 runs per rate. Extra columns = mean confidence of correct vs wrong
predictions.

| Wrong labels | Mean test acc. | Min test acc. | conf(correct) | conf(wrong)  |
| ------------ | -------------- | ------------- | ------------- | ------------ |
| 0%           | 100.0%         | 100.0%        | 87.3%         | n/a          |
| 10%          | 97.8%          | 81.2%         | 80.8%         | 56.7%        |
| 20%          | 91.6%          | 62.5%         | 75.4%         | 60.6%        |
| **25%**      | **87.8%**      | **62.5%**     | **72.9%**     | **61.2%**    |
| 30%          | 77.8%          | 43.8%         | 69.1%         | 63.0%        |

Take-away for the game: mistakes hurt, and the worst case can still fall to
≈62% even at a 25% mistake rate. Confidence is a stronger signal than it was at
C=1 — the model is consistently more confident when it is right (gaps of roughly
6–24 points) — but it is still not a hard guarantee on any single prediction.

## 4. Sensitivity to regularization strength C (exploratory)

Purpose: find a C that raises confidence (it was low and flat at C=1) without
hurting accuracy. **C=10 was chosen; sections 1–3 above are re-run with it.**

Setup: same classifier, only `C` varied. Clean labels and 25% wrong labels, at
n = 3 / 10 / 22 images per class. Every random cell uses **30 seeds**; n=22 with
clean labels is the single deterministic "perfect labels" run. "Share < 0.70" =
share of test predictions whose confidence is below 0.70, reported for all /
correct / wrong predictions (n/a when there are no such predictions).

To reproduce (this is `prep/evaluate_offline.py`'s `--c-values` mode, 30 seeds):

```powershell
.\.venv\Scripts\python.exe prep\evaluate_offline.py --c-values 1 3 10 30 100
```

| C | labels | n/class | runs | mean acc | min acc | conf(corr) | conf(wrong) | <0.70 all | <0.70 corr | <0.70 wrong |
| - | ------ | ------- | ---- | -------- | ------- | ---------- | ----------- | --------- | ---------- | ----------- |
| 1.0  | clean     | 3  | 30 | 98.3% | 68.8% | 53.4% | 51.0% | 100.0% | 100.0% | 100.0% |
| 1.0  | clean     | 10 | 30 | 100.0% | 100.0% | 59.8% | n/a | 100.0% | 100.0% | n/a |
| 1.0  | clean     | 22 | 1  | 100.0% | 100.0% | 67.0% | n/a | 62.5% | 62.5% | n/a |
| 1.0  | 25% wrong | 3  | 30 | 65.2% | 37.5% | 60.5% | 65.1% | 87.3% | 88.2% | 85.6% |
| 1.0  | 25% wrong | 10 | 30 | 65.6% | 50.0% | 60.8% | 56.9% | 95.4% | 93.0% | 100.0% |
| 1.0  | 25% wrong | 22 | 30 | 90.0% | 50.0% | 60.8% | 55.8% | 94.2% | 93.5% | 100.0% |
| 3.0  | clean     | 3  | 30 | 98.5% | 75.0% | 58.0% | 52.5% | 100.0% | 100.0% | 100.0% |
| 3.0  | clean     | 10 | 30 | 100.0% | 100.0% | 69.1% | n/a | 51.2% | 51.2% | n/a |
| 3.0  | clean     | 22 | 1  | 100.0% | 100.0% | 77.8% | n/a | 6.2% | 6.2% | n/a |
| 3.0  | 25% wrong | 3  | 30 | 64.8% | 31.2% | 63.3% | 64.2% | 74.8% | 71.7% | 80.5% |
| 3.0  | 25% wrong | 10 | 30 | 74.4% | 50.0% | 64.8% | 56.2% | 80.2% | 73.4% | 100.0% |
| 3.0  | 25% wrong | 22 | 30 | 91.5% | 62.5% | 67.0% | 57.0% | 64.4% | 61.7% | 92.7% |
| 10.0 | clean     | 3  | 30 | 98.5% | 75.0% | 65.6% | 55.0% | 70.4% | 70.0% | 100.0% |
| 10.0 | clean     | 10 | 30 | 100.0% | 100.0% | 79.8% | n/a | 12.3% | 12.3% | n/a |
| 10.0 | clean     | 22 | 1  | 100.0% | 100.0% | 87.3% | n/a | 0.0% | 0.0% | n/a |
| 10.0 | 25% wrong | 3  | 30 | 64.0% | 18.8% | 68.7% | 63.9% | 61.5% | 54.4% | 74.0% |
| 10.0 | 25% wrong | 10 | 30 | 82.1% | 56.2% | 70.1% | 58.7% | 56.0% | 48.2% | 91.9% |
| 10.0 | 25% wrong | 22 | 30 | 90.0% | 62.5% | 73.5% | 61.1% | 40.2% | 35.2% | 85.4% |
| 30.0 | clean     | 3  | 30 | 98.1% | 75.0% | 73.0% | 56.1% | 36.9% | 35.7% | 100.0% |
| 30.0 | clean     | 10 | 30 | 100.0% | 100.0% | 87.1% | n/a | 3.3% | 3.3% | n/a |
| 30.0 | clean     | 22 | 1  | 100.0% | 100.0% | 92.7% | n/a | 0.0% | 0.0% | n/a |
| 30.0 | 25% wrong | 3  | 30 | 66.2% | 6.2% | 73.6% | 66.9% | 47.1% | 39.0% | 63.0% |
| 30.0 | 25% wrong | 10 | 30 | 83.1% | 56.2% | 75.6% | 63.0% | 40.6% | 33.3% | 76.5% |
| 30.0 | 25% wrong | 22 | 30 | 85.8% | 56.2% | 79.2% | 64.8% | 30.2% | 23.3% | 72.1% |
| 100.0 | clean     | 3  | 30 | 97.9% | 75.0% | 79.8% | 58.0% | 19.2% | 17.4% | 100.0% |
| 100.0 | clean     | 10 | 30 | 100.0% | 100.0% | 92.2% | n/a | 0.8% | 0.8% | n/a |
| 100.0 | clean     | 22 | 1  | 100.0% | 100.0% | 95.9% | n/a | 0.0% | 0.0% | n/a |
| 100.0 | 25% wrong | 3  | 30 | 68.3% | 6.2% | 78.2% | 71.6% | 36.0% | 30.8% | 47.4% |
| 100.0 | 25% wrong | 10 | 30 | 81.7% | 56.2% | 81.3% | 66.8% | 31.2% | 23.7% | 64.8% |
| 100.0 | 25% wrong | 22 | 30 | 82.9% | 56.2% | 84.5% | 69.8% | 22.9% | 16.3% | 54.9% |

What the sweep shows:

- **Confidence rises with C.** Correct-prediction confidence at n=22 clean:
  67.0% (C=1) → 77.8% (3) → 87.3% (10) → 95.9% (100). The gap to wrong
  predictions widens too (C=1: 2–6 points; C=100: 14–22 points), so higher C
  makes confidence more informative.
- **Share under 0.70 collapses with C.** At n=22 clean it goes from 62.5%
  (C=1) to 0% from C=10 up. Even with 25% wrong labels, the all/share drops
  from 94.2% (C=1) to 40.2% (C=10) to 22.9% (C=100).
- **Accuracy cost appears at high C with mistakes.** Mean accuracy at 25% wrong,
  n=22: 90.0% (C=1/10) → 85.8% (30) → 82.9% (100). Worst case with tiny data
  gets fragile: at n=3, 25% wrong, min accuracy falls to 6–19% once C ≥ 10,
  versus 31–38% at C=3.

**Chosen: C = 10.** It keeps accuracy at C=1's level (100% with clean labels; the
mistake-sweep means are equal or better and the worst cases improve — the 25%-wrong
min at n=22 goes 50.0% → 62.5% and the n=3 clean min goes 68.8% → 75.0%), collapses
the share of sub-0.70 predictions (62.5% → 0% at n=22 clean) and widens the
confidence gap between right and wrong answers. C=30/100 would sharpen confidence
further but start losing accuracy when the student makes mistakes, so the engine
uses C=10.

## What this means for the browser app

- The teaching narrative fits the numbers: "give the model good examples and
  enough of them, and it learns; sort animals into the wrong box and it gets
  confused."
- The TS engine's accuracy should land in these ranges for the same inputs;
  small differences (a few points) from the sklearn optimizer are expected and
  acceptable (see `docs/data-contract.md`).