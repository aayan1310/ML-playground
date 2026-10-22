# ML Playground: Game Flow Plan (revision 5)

Companion to `docs/PLAN.md` (revision 2). This document describes how the playground plays, screen by screen, and what that implies for data and the API.

**Nothing in this document is implemented.** Technical and API items are **proposals** that must be checked against the Master Plan and the API contract before any implementation. They do not override either document.

**Status labels used throughout**
- **Confirmed:** decided by you in your feedback.
- **Proposed:** my suggestion, not yet approved.
- **Undecided:** needs a decision.

**Naming.** The documentation already uses "Level 1 to 8" for the whole game. In this document, **Level 1, 2 and 3 mean the playground's three levels**, each with three **Stages**. If the two ever need to be told apart, say "Playground Level".

## Revision notes: revision 5 (training-image pool rules, this update)

1. **Pool design replaced by a remaining-pool system (confirmed).** Each category has its own available training pool. At each stage 10 candidates per category are drawn at random from that category's remaining pool. Selected images leave the pool; displayed but unselected candidates stay available and may be offered again. Carryover examples stay locked in the sorting areas and are not part of the new candidates. New section 3.6.
2. **Removed:** the requirement for three disjoint pools and 30 distinct training images per category, and the "Level 1 is 8 per category short" finding. The derived minimum is now **15 training images per category** (section 8.5). Level 1's reported 22 per category would meet it if the counts are confirmed; they are reported, not verified.
3. **The displayed pool stays fixed while the player completes the stage (confirmed).** What happens on a browser reload or a repeated stage remains Undecided, with recommended defaults (3.6).
4. **Test images are unchanged:** separate from training, chosen by the player, used once per level, at least nine distinct per level.
5. **API and data proposals updated:** the service, not the browser, draws the candidates (only the service knows the labels). Conflict rows 12 and 14, acceptance checks 16, 17, 20, 21 and new checks 27 to 30, and the open-decision lists were updated.
6. **Arithmetic checked:** per category 22 to 19 to 17 to 12 available, and 3 to 5 to 10 selected in total.
7. No other confirmed gameplay or UI decision was changed. The Master Plan and the data contract were not edited.

## Revision notes: revision 4 (visual direction)

1. **New section 7A, Visual and UI direction,** based on your description and the concept image: a bright, kid-friendly look in the style of the concept, a simple interface with clear elements and instructions, and a cartoon anime-style teacher or robot as a guide. The centre of the concept image (the sorting lesson and "Train Your Model") is the focus.
2. The teacher is described as a **scripted guide** (fixed text from the translation file), not the AI teacher of the project documentation (section 7A.4). That is a proposal.
3. Differences between the concept image and the confirmed flow are listed in 7A.2 and 7A.3, not silently resolved. The main one: the concept shows the pool on the left and the categories on the right, while you confirmed the pool on the right and the categories on the left. The confirmed layout is kept.
4. Status table, acceptance checks and open decisions extended. No gameplay rule, count or data decision was changed.

## Revision notes: revision 3.1 (pool size correction)

1. **Pool size corrected:** the selection pool holds **10 images per category at every stage** (20 in Level 1, 30 in Level 2), not 10 images in total. *(The disjoint-pool part is superseded in revision 5.)*
2. The Stage 3 feasibility conflict raised in revision 3 came from the wrong pool size and is **withdrawn**. No stage requires more images per category than its pool holds.
3. Added the calculation of distinct training images required if pools cannot overlap: **30 per category** (60 for Level 1, 90 for Level 2). The reported Level 1 data (22 training pictures per category) would be 8 per category short. This must be verified. *(Superseded in revision 5: pools may reuse unselected images, so this requirement no longer applies.)*
4. Updated the affected tables, state rules, proposals, data requirements, acceptance checks and the list of open items. No other confirmed decision was changed.

## Revision notes: revision 3

1. **Training pool (confirmed):** each stage shows a different pool, with no overlap between the stages of a level. The player may use any subset; unselected images are never used for training. New section 3.6. (Pool size corrected in revision 3.1. The no-overlap rule is superseded in revision 5.)
2. **Feasibility conflict flagged:** this was based on a misreading of the pool size and is withdrawn in revision 3.1.
3. **Prediction pictures (confirmed):** the player chooses each of the three test pictures from the level's unused test pictures. Used pictures are marked and cannot be chosen again within the level, so a level needs at least nine eligible test pictures. This replaces the earlier Option A/B proposal.
4. **Movement and Reset (confirmed, restated):** unaccepted pictures can be dragged back to the pool or between categories; Reset clears the stage's unaccepted selections; locked examples never move.
5. **Wrong-image feedback:** the established behavior is kept and the approval discussion is removed.
6. **Data, state, API proposals and acceptance checks** updated for stage pools and player-chosen test pictures, and the Master Plan conflict list extended.

## Revision notes: revision 2 (what changed from revision 1)

1. **Removed** the mission/level selection screen. Levels run in order starting at Level 1 (confirmed).
2. **Sorting:** wrong placements are now allowed temporarily; the game validates on **Train**, names the wrong images, and does not train. Wrong images stay where the player put them, highlighted, instead of being sent back to the pool (confirmed behavior, my earlier layout detail replaced).
3. **Carryover:** 3, 5 and 10 are **total** examples per category at each stage. Earlier examples stay locked in place, and the player selects only the additional ones (confirmed). Cumulative tables added for Levels 1 and 2.
4. **Training:** each stage trains a fresh model from the full accumulated set, not an incrementally updated one (confirmed).
5. **Predictions:** exactly three per stage on unseen test images, each with a Reveal button (confirmed). A rule for choosing and tracking the three images is proposed.
6. **Removed from the required flow:** rewards, XP and charts of confidence across stages, and the "before and after on the same picture" comparison. They now live in the Future Ideas section.
7. **Level 3 categories** are undecided; candidates are listed as suggestions only.
8. **Technical implications** rewritten as proposals, with a list of conflicts against the Master Plan (section 9).

---

## 1. Purpose

Teach children, in simple language, that:
1. A model learns from labelled examples.
2. Adding examples changes how the model behaves.
3. Confidence is not the same as being right.

The game must not promise that confidence will rise, or accuracy will improve, as examples are added. Both usually trend that way but not always.

The design keeps your original layout: image pool on the **right**, category sorting areas on the **left**, drag from the pool into the slots, and it follows the look of the concept image (see section 7A). Whether the integrated game keeps this theme or adopts the partner app's design is a separate, still open Master Plan decision (D5).

---

## 2. Decision status

| # | Item | Status |
|---|---|---|
| 1 | No mission/level selection screen; levels in sequence from Level 1 | **Confirmed** |
| 2 | Three levels, three stages each | **Confirmed** |
| 3 | Wrong placement is allowed in the UI, but wrong examples are never used to train | **Confirmed** |
| 4 | Validation happens when Train is clicked; wrong images are identified; no model is trained | **Confirmed** |
| 5 | Reset only affects the current stage's new selections; earlier completed stages and carried-over examples stay | **Confirmed** |
| 6 | Carried-over examples are locked in their original categories | **Confirmed** |
| 7 | 3, 5, 10 are total per category per stage; carryover fills the slots | **Confirmed** |
| 8 | Each stage trains a fresh model from the full accumulated set | **Confirmed** |
| 9 | Three predictions per stage on unseen test images, each with a Reveal button | **Confirmed** |
| 10 | Revealed test images are not added to the training set | **Confirmed** |
| 11 | Level 1 is cats and dogs | **Confirmed** |
| 12 | Level 2 uses the same flow with three fruit categories; apples, bananas, oranges as working examples; dataset and labels still to verify | **Confirmed** (flow), **Undecided** (final categories and dataset) |
| 13 | Level 3 uses the same flow; categories undecided | **Confirmed** (flow), **Undecided** (categories) |
| 14 | Rewards, XP, progress charts | Not required. Future idea only |
| 15 | The player chooses each of the three test pictures from unused test pictures; a used picture cannot be chosen again within the level | **Confirmed** |
| 16 | Whether the player can repeat a stage after training | **Undecided** |
| 17 | Whether the player must press Reveal before continuing | **Undecided** (proposed: optional) |
| 18 | Whether progress is saved if the player leaves or refreshes | **Undecided** |
| 19 | The API and data changes in section 8 | **Proposed** |
| 20 | Training pool per stage: 10 candidate images **per category**, drawn at random from that category's remaining available pool; displayed but unselected candidates stay available and may reappear in later stages | **Confirmed** |
| 21 | The player may use any subset of the candidates; only selected, correctly sorted images enter the training set, and an image selected for training leaves the available pool | **Confirmed** |
| 22 | Unaccepted pictures can be dragged back to the pool and between categories; Reset clears the stage's unaccepted selections | **Confirmed** |
| 23 | The display rule needs at least 15 training images per category (derived); the reported Level 1 data has 22 per category | **Reported, to verify** (sections 3.6 and 8.5) |
| 24 | The service draws each stage's candidates (only it knows the labels); pool rules configurable by level | **Proposed** (section 8.1). Configurability by level is **Confirmed**. |
| 25 | Visual direction: bright, colorful and attractive to children, in the style of the concept image | **Confirmed** |
| 26 | Simple interface with clear elements and instructions that guide the child | **Confirmed** |
| 27 | A cartoon anime-style teacher or robot character guides the child | **Confirmed** |
| 28 | The guide speaks fixed, scripted text and is not the AI teacher feature | **Proposed** (7A.4) |
| 29 | Layout side: the concept image shows pool left and categories right; the confirmed layout is pool right and categories left | **Undecided** (7A.3). The confirmed layout is kept for now. |
| 30 | Whether to show a code panel and an accuracy figure as in the concept's "Train Your Model" screen | **Undecided** (7A.2) |
| 31 | Theme values defined as named tokens so the look can be swapped | **Proposed** (7A.5) |
| 32 | Who produces the art assets, and the rights to reuse the concept image's characters | **Undecided** (7A.8) |
| 33 | The displayed candidate pool stays fixed while the player completes the stage (no reshuffle on re-render) | **Confirmed** |
| 34 | Whether the candidate pool and the available pools survive a browser reload, and whether a repeated stage keeps the same candidates | **Undecided** (3.6, with recommended defaults; ties to items 16 and 18) |

---

## 3. Stage structure and carryover

### 3.1 The rule

Each level has three stages. The numbers 3, 5 and 10 are the **total number of examples per category at that stage**. They are not extra examples added at every stage. The player keeps what they already sorted and only adds the difference.

**Stage totals and new picks**

| Stage | Total per category | New per category | Carried (locked) per category |
|---|---:|---:|---:|
| 1 | 3 | 3 | 0 |
| 2 | 5 | 2 | 3 |
| 3 | 10 | 5 | 5 |

### 3.2 Level 1: cats and dogs (2 categories)

| Stage | Total cats | Total dogs | New cats to select | New dogs to select | Total training images |
|---|---:|---:|---:|---:|---:|
| Stage 1 | 3 | 3 | 3 | 3 | 6 |
| Stage 2 | 5 | 5 | 2 | 2 | 10 |
| Stage 3 | 10 | 10 | 5 | 5 | 20 |

- **Stage 1:** select and correctly sort 3 cats and 3 dogs. Train. Make three predictions.
- **Stage 2:** the 3 cats and 3 dogs from Stage 1 are already in their slots and locked. Select 2 more cats and 2 more dogs. Train on all 10. Make three new predictions.
- **Stage 3:** the 5 cats and 5 dogs from Stages 1 and 2 are in their slots and locked. Select 5 more cats and 5 more dogs. Train on all 20. Make three new predictions.

### 3.3 Level 2: three fruit categories

Working categories (final categories and dataset to be verified): apples, bananas, oranges.

| Stage | Apples | Bananas | Oranges | New per category | Total training images |
|---|---:|---:|---:|---:|---:|
| Stage 1 | 3 | 3 | 3 | 3 | 9 |
| Stage 2 | 5 | 5 | 5 | 2 | 15 |
| Stage 3 | 10 | 10 | 10 | 5 | 30 |

### 3.4 Level 3

Same structure: 3, then 5, then 10 total per category, carryover locked, the player selects only the additional examples. **Number and names of categories are undecided.** If Level 3 has three categories, its totals match the Level 2 table (9, 15, 30). With a different number of categories the totals are (3, 5, 10) times that number.

### 3.5 Training uses the whole accumulated set

Each stage trains a **new** model on **all** correctly labelled examples accumulated so far. The earlier stage's model is not updated or reused. Stage 2's model learns from 10 images (Level 1), not from the four new ones.

### 3.6 Training pools: the remaining-pool system (confirmed)

**The rule.** Each category has its own **available training pool**, which starts as all of that category's training images. At each stage the game draws **10 candidate images per category at random** from that category's available pool and shows them (20 candidates in Level 1; 30 in Level 2 with three categories). The player selects the stage's required new examples from the candidates. Selected images leave the available pool. Candidates that were displayed but not selected stay available and may be offered again in a later stage.

**Three ideas, kept apart**

| Idea | Meaning |
|---|---|
| Candidate display | An image that was displayed but not selected may be displayed in more than one stage. |
| Training selection | An image can be selected for the accumulated training set only once. |
| Carryover | Images selected in earlier stages stay in the sorting areas as locked examples. They are not part of the new candidates and do not count as new selections. |

**Rules (confirmed)**
1. Each category has its own available training pool.
2. 10 candidates per category are chosen at random at each stage. No particular random method is required.
3. An image may appear in several stages' candidates if it has not been selected for training.
4. Once selected for training, an image leaves the available pool and is never offered again as a new candidate.
5. Carryover examples stay locked in their sorting slots and are not counted as new selections.
6. The cumulative training examples per category stay **3, 5 and 10**.
7. Each stage trains a fresh model on the whole accumulated set of correctly labelled examples for that stage.
8. Test images are never mixed into the training pool. They stay separate and follow the prediction and Reveal rules.
9. The pool rules (candidates per category, new selections per stage, number of categories) are configurable by level and not tied to two categories.
10. The displayed pool for a stage stays fixed while the player completes the stage. It is not redrawn during sorting, dragging, Reset or an ordinary re-render of the screen.

**Level 1 arithmetic, per category** (22 cat images and 22 dog images are reported; if the reported counts are confirmed)

| Stage | Available at the start | Candidates displayed | New selected | Available after | Total selected (locked after Train) |
|---|---:|---:|---:|---:|---:|
| 1 | 22 | 10 | 3 | 19 | 3 |
| 2 | 19 | 10 (drawn from the 19; may include Stage 1 candidates that were not selected) | 2 | 17 | 5 |
| 3 | 17 | 10 (drawn from the 17; may include earlier candidates that were not selected) | 5 | 12 | 10 |

This holds for cats and dogs separately: 22, 19, 17, 12 available, and 3, 5, 10 selected in total. After Stage 3, 12 images per category remain unused. Each stage displays 20 candidates in all (10 cats and 10 dogs).

**When the available pool shrinks.** An image is counted as selected for training when the stage's training succeeds, because until then the player can still move, remove or Reset the picks, and validation can fail. Before then, the stage's placed pictures simply sit in slots and the stage's candidate pool is unchanged. This follows from the Reset and validation rules and is not a new rule.

**Fixed during the stage (confirmed), and what is still undecided.** The stage's candidates are drawn once, when the stage starts, and kept as part of the stage's state. Re-renders, resizing, dragging, Reset and similar interface changes never redraw them, and Reset returns pictures to this same set. Two things are **Undecided**, because they depend on the open decisions about saving progress and repeating a stage (items 16 and 18):
- *A full browser reload, or leaving and coming back.* Recommended default: if progress is not saved, a reload restarts the level from Stage 1 with new draws; if progress is saved, the stage's candidates and the available pools are saved with it, so the player sees the same pictures.
- *A repeated stage.* Recommended default: the stage's selections return to the available pool and the player chooses again from the same candidates.

**Data consequence (if the reported counts are confirmed).** The display rule needs at least 15 training images per category (section 8.5). Level 1 reports 22, so it does not need additional training images merely to show 10 candidates per category at every stage. This does not settle image licensing, image quality, embedding integrity, label correctness or the other data checks, which still have to be verified.

**Test images are unchanged.** They stay separate from the training pool, are chosen by the player, and a test image cannot be reused within the same level (5.5). The reuse of unselected training candidates does not apply to test images. A level needs at least nine distinct test images; 16 are reported.

---

## 4. Overall flow

```text
Start -> Level 1 (no selection screen)
   |
   v
Level intro
   |
   v
Stage 1:  Sort -> Train (validate) -> Predict x3 with Reveal -> Stage wrap-up
   |
   v
Stage 2:  Sort (carried examples locked) -> Train (validate) -> Predict x3 with Reveal -> Stage wrap-up
   |
   v
Stage 3:  same as Stage 2
   |
   v
Level wrap-up -> Level 2 (same flow) -> Level 3 (same flow) -> End
```

Levels are played in order. There is no mission or level selection screen for now.

---

## 5. Screens and behavior

### 5.1 Level intro (proposed content, confirmed to exist only as a transition)
One or two lines about what the player will teach the computer. Start button. Example: "Teach the computer to tell cats from dogs."

### 5.2 Sort screen

**Layout (confirmed from your description):** category areas on the **left**, image pool on the **right**.

**Slots**
- Each category has as many slots as the stage's **total** per category (3, 5 or 10).
- At Stage 2 and 3 the first slots hold the carried-over examples, visibly **locked** (lock icon, different style). The remaining slots are empty.
- A counter per category, for example "3 of 5".

**Pool (confirmed: 10 new images per category at every stage)**
- Shows **10 candidate training images per category** for the current stage (20 in Level 1, 30 in Level 2), drawn at random from each category's remaining available pool (3.6) and shown mixed together. The candidates may include images that were displayed in an earlier stage but not selected. The displayed pool stays fixed while the player completes the stage.
- The number refers to the images currently offered, not to the size of the dataset.
- The player does not have to use every image. Only the correctly sorted selections that fill the required slots become training examples. Unselected images are not used for training at this stage; they stay in the category's available pool and may be offered again in a later stage.
- Pictures already accepted in an earlier stage never appear in the pool.
- Images placed in a slot leave the pool. Images dragged back return to this stage's pool.

**Placing**
- The player drags a picture from the pool into a category slot. **Placement is never blocked because it is wrong.**
- **(Confirmed)** The player can drag an unaccepted picture back to the pool and move it between category slots at any time before training succeeds.
- Locked pictures cannot be moved or removed. An attempt shows a short message ("This one is already learned").
- Dropping onto a category with no free slot is rejected with a message; the picture goes back to where it came from. To place it there, free a slot first.
- Dragging is never the only way: tap a picture, then tap a slot (and a keyboard method). Proposed, because the game is for children on mixed devices.

**Train button**
- Disabled until **every** slot in every category is filled, with a hint of what is missing ("Fill 4 more slots").
- When pressed, the game **validates before training** (5.3).

**Reset button**
- Clears only the **new, unaccepted selections of the current stage** and returns those pictures to the pool.
- Does **not** remove locked, carried-over examples.
- Does **not** affect earlier stages, their models or their predictions.
- Also clears any wrong-picture highlighting.
- Available until training succeeds for this stage.

**Missing images:** a placeholder tile with a retry, not a crash.

### 5.3 Validation on Train (confirmed behavior)

1. The player presses Train.
2. The game checks the category chosen for **every** image in the slots (carried-over and new).
3. **If any image is in the wrong category:**
   - No model is trained.
   - A clear message says how many are wrong ("2 pictures are in the wrong box.").
   - The wrong pictures are **highlighted where they are** so the player can see which ones to fix.
   - The player corrects the sorting by moving them, or uses Reset.
   - The player can press Train again.
4. **Only when every image is correct** does training proceed.

The game must not train a model from wrong choices and then show an error afterwards. Validation and training are separate steps, and a failed validation produces no model.

**When a stage's examples become locked:** when training **succeeds**. From then on they are the stage's accepted examples and carry forward.

### 5.4 Train screen
- Short loading animation while the request runs. It is a loading state and must not pretend to show what the model learns.
- On success, shows true facts only: how many pictures per category the model learned from. Example: "It learned from 10 pictures: 5 cats and 5 dogs."
- A Continue button to the prediction screen.
- If the service fails, the sorting is kept and the player can retry.

### 5.5 Predict screen: three predictions per stage (confirmed)

Flow for each of the three predictions:
1. The player selects an unused picture from the prediction pool (a test picture the model has not trained on).
2. The player asks for a prediction ("Ask the model").
3. The game shows the **predicted category** and the **confidence**. For a level with three categories, also show the probability for each category, with the top one highlighted.
4. The player can press **Reveal** to see the actual category.
5. After Reveal, the game says whether the prediction was right, in age-appropriate language.
6. The selected picture is marked as used and cannot be selected again anywhere in this level.

**Confirmed rules**
- Test pictures are **not** used for training. Revealing is an educational action, not a training action, and a revealed picture is never added to the training set.

**Prediction pool and tracking (Confirmed)**
- After a successful training stage the player chooses three test pictures from the **prediction pool**: the level's test pictures that have not yet been used for a prediction in this level.
- Used pictures are clearly marked (greyed out with a "used" mark) and cannot be selected. The pool always shows which pictures remain available.
- A picture used in any stage of the level cannot be used again in the same level. A level therefore needs **at least nine distinct eligible test pictures** (three predictions in each of three stages). Level 1 is reported to have 16 (8 + 8), which is **unverified**. Levels 2 and 3 need at least nine as a data requirement; at least three per category is recommended so the player has variety.
- The training pools and the test pool are completely separate. A test picture is never added to the training set, including after Reveal.
- The player may choose any unused pictures; no category mix is enforced.
- **Tracking (Proposed):** the browser keeps the level's used test ids. The service enforces, per model, that predictions are for test-pool pictures only, at most three distinct, with no repeats. The service holds no level session and each stage has its own model, so one-use-per-level across stages is a UI rule. Making it tamper-proof would need a level session on the server (Undecided, not proposed now).

**Continue after the three predictions.** Proposed: Continue unlocks once all three predictions have been made. Whether pressing Reveal is required is Undecided (proposed: optional but encouraged).

**Whether a "same picture again" comparison across stages is wanted** is Undecided. It would require deliberately reusing a test picture, which conflicts with the no-reuse rule above, so it is not part of the baseline.

### 5.6 Stage wrap-up (Proposed, minimal)
A short recap of the stage's three predictions, each with its confidence and, where revealed, whether it was right. A plain sentence using real numbers only. Button: next stage (or, at Stage 3, finish the level). No promises that more examples guarantee higher confidence or accuracy.

### 5.7 Level wrap-up (Proposed, minimal)
A short end-of-level message with the three teaching points in section 1, then the next level. No rewards or charts (see Future Ideas). After Level 3, an end screen.

---

## 6. State and rules

**Per level**
- Level number, categories, the available training pool for each category (it shrinks as examples are accepted), the test pool, and the set of test pictures already used (shared across the level's three stages).

**Per stage**
- Stage number, total per category required, the stage's candidate pool (10 per category, drawn when the stage starts and then fixed), accepted examples (carried), new examples (selected from the pool, not yet accepted), whether training succeeded, the stage's model, the three predictions (picture, predicted category, confidence, revealed or not).

**Rules**
1. Train is enabled only when every slot of the stage is filled.
2. On Train, every image is validated. Any wrong image means no model, the wrong images are highlighted, and nothing about the stage is locked.
3. A successful Train locks the stage's new examples, and they carry forward to the next stage.
4. Carried examples are never removable and never appear in the pool.
5. Reset affects only the current stage's unaccepted selections.
6. Each stage trains a fresh model on the complete accumulated set.
7. Exactly three predictions are allowed per stage's model.
8. Test pictures are never in the training set. A revealed test picture never becomes training data.
9. A stage is complete when its three predictions have been made (and revealed, if that becomes a requirement).
10. A level is complete when its three stages are complete. Levels run in order.
11. Each stage offers 10 candidate training pictures per category, drawn at random from that category's available pool when the stage starts. The candidate pool is fixed while the stage is in progress. Candidates that were displayed but not selected may appear again in later stages.
12. Only selected, correctly sorted pictures fill the slots and enter the training set. Unselected candidates are not used for training and stay available. A picture accepted for training leaves the available pool and is never offered as a new candidate again.
13. A test picture can be selected for prediction once per level.

**Edge cases the screens must handle:** pressing Train twice (button disabled while a request is in flight); leaving or refreshing mid-stage (behavior Undecided, item 18); the service being down at Train, Predict or Reveal (sorting kept, retry offered); the stage's model expiring before predictions finish (offer to train again with the same accepted set, no re-sorting); dropping into a full category; a dragged picture dropped outside any slot; touch-only and keyboard-only play; a missing image; fixing a wrong picture when the correct category is already full (the player must free a slot first, with a clear message); an available pool with fewer than 10 pictures for a category at the start of a stage (should be impossible if the data meets the minimum in 8.5; the stage is blocked with an error, and nothing is borrowed from the test set or another category); no unused test pictures left in the prediction pool (should be impossible with at least nine eligible test pictures per level).

---

## 7. Teaching language and copy

All text in English and Roman Urdu/Urdu from one translation file. No message may claim the model examined specific features such as ears, noses, color or shape; the system has no evidence for that.

| Moment | Example (English) | What it may rely on |
|---|---|---|
| Level intro | "Teach the computer to tell cats from dogs." | Level setup |
| Wrong sorting | "2 pictures are in the wrong box. Move them or press Reset." | Validation result |
| Locked example | "This one is already learned." | State |
| Train finished | "It learned from 10 pictures: 5 cats and 5 dogs." | Accepted set counts |
| Prediction | "I think this is a dog. I'm 87% sure." | Probabilities from the model |
| Unsure prediction | "I think it's a cat, but I'm only 54% sure." | Probabilities |
| Reveal, right | "It's a dog. The model got it right." | Reveal result |
| Reveal, wrong | "It's actually a cat. The model was wrong, even though it was 82% sure." | Reveal result |
| Level end | "Examples help a model learn, but a model can be sure and still be wrong." | Fixed teaching text |

Not allowed: "more examples always make the model more sure", "the model looked at the ears".

---

## 7A. Visual and UI direction

**Source.** The concept image you supplied, a sheet covering the whole game. Only the centre row matters for the playground: the sorting lesson ("Data Collect Karna") and "Train Your Model". Everything in this section that is not labelled Confirmed is a proposal read off that image by eye; exact designs, colors and assets are still to be made.

### 7A.1 Confirmed direction
- A bright, colorful theme that appeals to children, in the style of the concept image.
- A simple interface with clear elements and clear instructions that guide the child.
- A cartoon anime-style teacher or robot character acts as the child's guide, as in the concept.

### 7A.2 What the concept image shows, and how this plan treats it

| Concept element (seen in the image) | How this plan treats it |
|---|---|
| **Sorting lesson panel:** header "Lesson 2: Data Collect Karna" with a step counter "1/6"; an instruction line with the key action in a highlighted color ("drag karo"); six pictures in a pool; two category panels, "Billi (Cat)" in soft green and "Kutta (Dog)" in warm yellow, each with three empty slots; a "Hint:" bar at the bottom; a green "Next" button | **Adopted:** instruction line with a highlighted action word, category panels with an icon and a bilingual name, slots, a hint bar, one green main button. **Differs:** the concept's pool and categories are on opposite sides to the confirmed layout (7A.3); the concept pool has 6 pictures, ours has 10 per category (20 in Level 1, 30 in Level 2); the header shows Level and Stage ("Level 1, Stage 1 of 3") instead of a lesson count. |
| **"Train Your Model" screen:** a dark-blue panel with Python and Output tabs; code on the left; on the right "Model Training Complete! Accuracy: 92%", a green progress bar, a sample prediction (picture, "Prediction: Cat", "Actual: Cat" with a check mark), and a blue "Next Mission" button | **Adopted:** a clear "training complete" message and one obvious next button. **Undecided:** the code panel and the accuracy figure. The concept's code uses a different model (a random forest) from the project's (logistic regression on image embeddings), so any code shown must match what really runs, or be left out. An overall accuracy figure is not part of the confirmed flow, which has three predictions per stage; "2 of 3 right" can be shown from those predictions and the reveals. The concept shows prediction and actual together, while the confirmed flow shows the prediction first and the actual only after Reveal, which is kept. |
| **Teacher:** a blue rounded robot with a headset, and an anime-style girl, with speech bubbles in dark-blue rounded boxes | **Adopted** as the guide (7A.4). |
| **Language:** an "Urdu / EN" switch, and Roman Urdu mixed with English ("Billi (Cat)", "Kutta (Dog)", "Hint: ...") | **Adopted:** bilingual labels, language switch available, as the documentation requires. |
| **HUD and rewards:** hearts, level, XP bar, coins, "+50 Coins" on Mission Complete | **Not part of the required flow.** Rewards and XP remain optional future ideas. |
| **Other screens:** main menu, character select, world map, AI chat, voice mode, study portal | **Outside this plan.** |

### 7A.3 Layout discrepancy to confirm
You confirmed the picture pool on the **right** and the category areas on the **left**. The concept image shows the opposite. This plan keeps the layout you confirmed. If you prefer the concept's arrangement, only the mirror of the layout changes; no rule in this document depends on the side.

### 7A.4 The teacher or robot guide (Proposed)
- **Character.** A friendly cartoon robot (blue, rounded, headset, as in the concept) is the default guide. Using the anime-style girl as well, or instead, is Undecided.
- **Where it appears.** In a corner of each playground screen, with a speech bubble.
- **What it is.** A **scripted guide**: its messages are fixed text in the translation file, chosen by game events (for example "wrong sorting" or "prediction shown"). It does not generate answers. It is **not** the AI teacher described in the project documentation (Phase 6), which is a separate feature with its own chat. Connecting this character to the AI teacher later is a future idea.
- **Rules for its messages.** One or two short sentences; one instruction at a time; encouraging and never scolding; plain words; never claims the model looked at a particular feature (ears, color, shape); text first, with no voice (voice is a later phase in the documentation).
- **Expressions.** A few simple states (neutral, happy, thinking, "oops") so feedback feels alive without much animation.

### 7A.5 Look and feel (Proposed, approximate)
- **Colors.** Bright sky-blue and navy for framing panels, light cards for the work area, a strong green for the main action button, soft green and warm yellow for the first two categories, and a third clearly different color for a third category. Exact values are to be defined, as a small set of **named theme tokens** (for example primary action, category 1, category 2, category 3, panel, text) used everywhere, never hard-coded per screen.
- **Shapes.** Rounded corners, friendly outlines, large buttons with an icon and a label, soft shadows.
- **Backgrounds.** Illustrated scenery only where it does not compete with the sorting task (behind the header or margins, not behind the pictures).
- **Text.** Large, rounded, easy to read; short sentences; the key action word highlighted.
- **Pictures.** Large enough to tell apart, the same size and crop, with no text drawn on them.
- **Category panels.** An icon plus a bilingual name ("Billi (Cat)"), a color per category and always a text label, so color is never the only cue. Locked slots show a lock icon.
- **Feedback.** Wrong pictures get a highlight, an icon and a message. Success is bright and brief. Confidence is shown as a number and a bar with plain words.
- **Motion.** Short and optional; reduced-motion settings are respected.

### 7A.6 Simplicity rules for children (Proposed)
- One main task per screen, and one primary button in the same place and style ("Next", "Train").
- An instruction line that is always visible, plus the guide's speech bubble, with a hint on request.
- A disabled button says why ("Fill 4 more slots").
- Large touch targets (the partner's notes report a 44 px rule, to be verified) and tap-to-place as well as dragging.
- Simple bilingual words; any technical word is explained ("confidence" as "how sure the model is").
- No time limits and no penalties for mistakes. Errors are friendly and say what to do.
- The layout must hold from phone width upward. With 20 or 30 pictures and up to 10 slots per category, how it stacks on a narrow screen is Undecided.

### 7A.7 Screen-by-screen notes

| Screen | Visual elements | Guide says (English examples; final text lives in the translation file and is reviewed by a fluent speaker) |
|---|---|---|
| Level intro | Level title, the categories shown as pictures, a big Start button | "Let's teach the computer to tell cats from dogs!" |
| Sort | Header "Level 1, Stage 1 of 3"; instruction line with the action word highlighted; category panels with slots; the pool; hint bar; Reset and Train buttons | "Drag 3 cats and 3 dogs into the boxes." Hint: "Pick pictures you are sure about." |
| Wrong sorting | The wrong pictures highlighted with an icon and a count message | "Oops, 2 pictures are in the wrong box. Can you find them?" |
| Train | A loading animation, then a card with the counts | "The model is learning from your pictures." Then: "It learned from 5 cats and 5 dogs." |
| Predict | The prediction pool with used pictures marked, a large picture, an "Ask the model" button, a result card with a confidence bar, a Reveal button | "Pick a new picture and see what the model thinks." |
| Reveal | The actual category with a check or cross | "It's a cat. The model got it right." or "It's a cat. The model was wrong, even though it was 82% sure." |
| Stage and level wrap-ups | A short recap and one Next button | "Examples help a model learn, but a model can be sure and still be wrong." |

### 7A.8 Assets needed (Proposed; none are assumed to exist)
Teacher character art (the robot, optionally the girl) in a few expressions; category icons; UI icons; panel and button styles; picture frames; the training animation; background art. Nothing needs to come from an external web service; the partner's notes report that nothing may load from a CDN, so assets are bundled with the app (to be verified).
**Rights.** The concept image is a mock-up. Its characters and art may be reused only if you own them or have the rights; otherwise original assets must be made or properly licensed. Who produces the art is Undecided.

### 7A.9 Relationship to the partner app's design
The partner's analysis notes describe a different style (dark background, lime accent, no gradients, no purple) than this bright concept. The Master Plan's decision D5 (concept look or partner design) remains open. Defining the look as named tokens (7A.5) lets the theme be swapped without changing the flow, screens or rules.

---

## 8. Technical implications (all Proposed; to be checked against the Master Plan and the contract before implementation)

### 8.1 What the flow needs from the service

| Requirement from this flow | Proposed approach | Notes |
|---|---|---|
| Stage-specific accumulated training set | The browser sends the **complete** accumulated set (carried plus new) with every Train request, with the level and stage | The service holds no stage session. The service checks the exact total per category for that level and stage. |
| Previously accepted images tied to their correct category and stage | The browser keeps the accepted list (image id, category, stage accepted). Since they were validated, their category is the true category. The service re-validates everything on every Train. | Locking is a UI rule; the service does not trust it. |
| Wrong selections reported without training | `train` validates first. If any image is wrong, respond 400 with a code such as `wrong_labels` and the **list of wrong image ids**, and create no model | Needs a new error code. |
| Reset | UI-only. Nothing is stored on the server before a successful Train | No endpoint needed. |
| Three predictions per stage on unseen pictures | Each trained model accepts predictions only for test-pool pictures, at most three distinct ones; a fourth or a repeated picture is rejected | Needs error codes (for example a prediction limit). |
| Reveal without leaking | `reveal` accepts a model and a picture and returns the true category only for a picture already predicted by that model. It returns that picture only | Not available before predicting. |
| Hiding hidden data | Responses list picture ids and image URLs only, never labels or embeddings. Labels and embeddings stay server-side files outside the public folder | Also needs a build check that they are not in the public output. |
| Stage candidates: 10 per category, drawn at random from each category's remaining pool | The **service** draws them, because only the service knows which pictures belong to which category and the browser must not. The browser asks for a stage's pool with the level, the stage and the ids accepted so far (the carried examples). The service takes each category's available pool as its training ids minus the accepted ids, draws 10 per category at random, and returns the ids and URLs mixed together, with no labels. The browser keeps the returned pool for the whole stage, so it stays fixed. | The service keeps no stage session and does not remember what it issued. Candidates per category, new selections per stage and number of categories come from level configuration (confirmed requirement), not from the code. |
| Enough available pictures per category at each stage | Every category needs at least 10 available pictures at the start of every stage. With totals of 3, 5 and 10 that means at least 15 training pictures per category (8.5). Checked in the data audit and at service start-up; a draw from a pool that is too small returns an error. | The service refuses to start on failure, as the Master Plan already specifies for data problems. Nothing is borrowed from the test set or another category. |
| Only selected examples enter training; accepted images leave the available pool | The Train request contains only the accumulated selected examples (carried plus new). The service checks that every id is a training picture, none is duplicated, the count per category is exact for the level and stage, and every label is correct. The next stage's pool request lists the accepted ids so those pictures are left out of the new candidates. | The service does not check that new selections came from the candidates it issued, and the game rules do not need it. Enforcing it would need signed pools or a server session (Undecided, not proposed). |
| Used test pictures tracked across a level | The browser tracks used test ids for the level. The service checks per model: test-pool only, at most three distinct, no repeats. | Cross-stage one-use is a UI rule (see 5.5). |
| An available pool that is too small | Start-up validation fails. If a draw is ever attempted from a pool with fewer than 10 pictures for a category, the stage is blocked with an error. Nothing is borrowed. | See 3.6 and 8.5. |
| Three categories | See 8.3 | |

### 8.2 Proposed request and response sketches (names are placeholders, not decisions)

- **Level data and stage pool:** per level, the category names and the test pictures (id and URL only); and a stage-pool request that takes the level, the stage and the ids accepted so far and returns that stage's candidates (id and URL only, mixed, no labels).
- **Train:** level, stage, list of `{id, category}`. Success returns a model id and the count per category. Failure returns the wrong ids (`wrong_labels`) or the validation errors that already exist (unknown id, not in train pool, duplicate id, wrong counts).
- **Predict:** model id and a test picture id. Returns the predicted category, confidence, and the probability of every category.
- **Reveal:** model id and the picture id. Returns the true category and whether the model's prediction matched.

### 8.3 Three-category support (Level 2, possibly Level 3)
The ML service and contract must support more than two categories. Things to plan and verify, not assume:
- Category becomes an index from 0 to k-1; probabilities are a list of k values that sum to 1; confidence is the largest probability; ties go to the lowest index.
- scikit-learn's logistic regression supports more than two classes, but the offline evaluation, the stored data layout, the tests and the confidence behavior have only been examined for two categories. They must be redone for three.
- Evaluation per level: at 3, 5 and 10 examples per category with random and carried-over (nested) selections, reporting accuracy and confidence ranges, so the game's wording matches reality.

### 8.4 Privacy and threat model (carry-over from the Master Plan)
- Anything sent to the browser can be read by that user. Hiding a response in the interface does not hide it.
- **Wrong-image feedback is established behavior (confirmed)** and does reveal the category of the training pictures the player tries. For pictures a child can recognize (a cat, a banana) this is an accepted part of the design.
- Test-picture answers stay behind Reveal, which requires a prior prediction. A determined user could still train a valid model and reveal answers repeatedly; the per-model cap of three predictions, rate limits and the in-memory model cap slow this down but do not prevent it.
- Labels and embeddings are never in a public file or in the dataset response.

### 8.5 Does the data exist? Data requirements and verification

| Level | Need | Status |
|---|---|---|
| 1 | At least **15 training pictures per category** (the minimum for the display rule, derived below), plus at least 9 unseen, separate test pictures. | The Stage 0 audit reports 22 training pictures per category (44 in all) and 8 test pictures per category (16). These are **reported figures, not verified in this document**. If confirmed, the display rule needs no additional training pictures (22 against a minimum of 15). |
| 2 | Three categories, at least 15 training pictures per category (45 in all) by the same arithmetic, plus at least 9 unseen test pictures (at least 3 per category recommended). | **Does not exist.** Needs sourcing, licensing and attribution, opaque ids, embeddings from the same model as Level 1, labels, integrity tests and offline evaluation. The category names are working examples to verify. |
| 3 | The same pattern for k categories: at least 15 training pictures per category, plus test pictures. | **Blocked** until the categories are chosen. |

**Where the minimum of 15 comes from (derived from the confirmed rules).** Every stage must show 10 candidates per category drawn from that category's available pool, and pictures accepted in earlier stages are removed. If a category has N training pictures, the available count at the start of each stage is: Stage 1, N (needs N >= 10); Stage 2, N - 3 (needs N - 3 >= 10, so N >= 13); Stage 3, N - 5 (needs N - 5 >= 10, so N >= 15). So 15 per category is the least that lets every stage show 10 candidates. More pictures give more variety, and Level 1 reports 22. This minimum **replaces** the earlier requirement of 30 distinct training pictures per category.

**What this does not settle.** Image licensing and attribution, image quality, embedding integrity, label correctness, and the other integrity checks below are still to be verified.

**How enough pictures per category is guaranteed (Proposed).** The data audit and the service start-up check each category's training count against the minimum for the level's configuration, and the service refuses to start if it is not met. At run time a draw from a pool that is too small fails with an error; it never borrows from the test set or another category.

**How actual dataset sizes and category distributions are verified (Proposed).** A read-only data audit that prints, for each level, the number of training pictures per category and the number of test pictures per category; checks that the training and test sets do not overlap; checks that every id has an image file, an embedding and a label; and checks that each category has at least 15 distinct training pictures (the display-rule minimum). Run it on Level 1 before the game is built, and on each new level's data when it is prepared. It is not code written in this task.

### 8.6 Does the current contract and backend support this?
Based on the Master Plan and earlier reports (not on the code, which was not seen): **no.** The backend that exists is an archived earlier version; the Master Plan's contract is two-category, accepts any count of at least three per box, allows training on wrong labels, and has `check`, `evaluate` and `reveal` behavior that differs from this flow. Section 9 lists the conflicts.

---

## 9. Conflicts with the Master Plan (to resolve before implementation)

| # | Master Plan says | This flow needs | What must happen |
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
| 12 | One fixed training pool per dataset | A per-category available pool; 10 random candidates per category at each stage drawn from the remaining pool; accepted images removed; unselected candidates may reappear | Contract change: a stage-pool request (level, stage, accepted ids) that returns candidates without labels. The service draws them because only it knows the labels. Needs approval |
| 13 | Test-pool prediction limits per model only | Player-chosen unused test pictures, one use per level, at least 9 eligible test pictures per level | UI tracking of used pictures (a server level session only if tamper-proofing is wanted); data requirement for Levels 2 and 3 |
| 14 | The dataset response lists all training and test pictures once, with fixed shuffled lists | The browser receives only the current stage's candidates, drawn per stage, plus the test pictures | Dataset response shape changes. The Master Plan's fixed shuffled lists no longer apply to training candidates, and the full training list must not be sent to the browser (it would let the player pick outside the candidates) |

The Master Plan has not been edited. These items are for review.

---

## 10. Future ideas (optional, not part of the required flow, not in acceptance criteria)

- XP, coins, badges, rewards.
- Progress charts, including a chart of average confidence by stage.
- A deliberate "same picture again" comparison across stages.
- Saved progress and resuming levels.
- A "what if some pictures were labelled wrongly" experiment (the opposite of the current rule, which only validates and blocks).
- Showing the per-category probabilities as a small bar chart for every level.
- A harder pair of categories where the effect of more examples is easier to see.

## 11. Level 3 candidate ideas (suggestions only, none approved)

- Three kinds of vehicles (for example, cars, bikes, buses).
- Three kinds of common animals other than cats and dogs.
- Three kinds of everyday objects with a clear shape difference.
- A deliberately harder set (visually similar categories) to show a less certain model.

Selection criteria to apply: educational goal, availability of properly licensed images, and whether a simple model on pretrained image features can learn the distinction from 3 to 10 examples per category.

---

## 12. Flow-level acceptance checks (for the confirmed behavior only)

A person, with automated tests where noted, must be able to:

1. Start at Level 1 with no selection screen and see 3 + 3 empty slots. (Test)
2. Drag any picture into any category, including the wrong one. (Test)
3. Be unable to press Train until all slots are filled. (Test)
4. Press Train with a wrong placement: see the wrong pictures highlighted and named, with **no model created**. (Test against the real service)
5. Fix the placement or press Reset, then train successfully. (Test)
6. See Reset clear only the current stage's new selections, leaving locked pictures and earlier stages alone. (Test)
7. Reach Stage 2 with the Stage 1 pictures locked and unmovable, select only 2 more per category, and train on all 10. (Test)
8. Reach Stage 3 with the 5 per category locked, select only 5 more per category, and train on all 20. (Test)
9. Make three predictions per stage on unseen pictures, see the category and confidence, and press Reveal for each. (Test)
10. Confirm that a revealed picture is not in any later training set and that no test picture appears in the training pool. (Test)
11. Confirm that a fourth prediction on the same stage's model is refused. (Test)
12. Play Level 2 with three categories using the same flow, with correct 9, 15 and 30 totals. (Test, after its data exists)
13. See the service-down, model-expired and missing-image cases handled without a crash. (Test)
14. Use touch and keyboard to sort, train and predict. (Manual)
15. English and Roman Urdu/Urdu text on every screen. (Manual)
16. See 10 candidate training pictures per category at each stage (20 in Level 1, 30 in Level 2), drawn from that category's remaining available pool. The candidates may include pictures shown earlier but not selected, and never include a picture already accepted for training. (Test with the real data; check these properties rather than exact random picks)
17. Finish a stage without using every candidate, and confirm the unselected candidates never appear in the training request and stay available (they may be offered again in a later stage). (Test)
18. Drag an unaccepted picture back to the pool and between categories; Reset clears only the unaccepted selections; locked pictures cannot be moved. (Test)
19. In the prediction pool, select only unused test pictures; a used picture is marked and cannot be selected; nine distinct test pictures are used across the three stages. (Test)
20. Confirm that the training and test sets are disjoint and that each category has at least 15 distinct training pictures, the display-rule minimum (data audit and service start-up test).
21. Confirm that an available pool with fewer than 10 pictures for a category blocks the stage with an error and nothing is borrowed from the test set or another category. (Test)
22. Each playground screen shows a clear instruction line, and the guide's messages appear at the key moments (intro, wrong sorting, training done, prediction, reveal, wrap-ups), all taken from the translation file. (Test that the strings come from the file; manual review)
23. A disabled button always shows why it is disabled. (Test)
24. Touch targets are large enough, and color is never the only cue (wrong pictures and categories also have an icon and text). (Manual accessibility check)
25. Theme values are named tokens, not hard-coded in components. (Code review)
26. No guide message claims what the model looked at. (Copy review)
27. The Level 1 available-pool arithmetic holds per category: 22, 19, 17, 12 available after the start and after Stages 1, 2 and 3 when the required selections are made, and the cumulative selected counts are 3, 5, 10. (Test with the real data, once the reported counts are confirmed)
28. The stage's displayed candidates do not change on re-render, resize, drag, drop or Reset during the stage. (Test)
29. A picture accepted for training is never offered as a new candidate in a later stage. (Test)
30. The test-image rules are unchanged: no test picture is ever a training candidate, and no test picture is chosen twice within a level. (Test)

---

## 13. Remaining decisions, data requirements and technical questions

**Decisions**
1. *(Closed.)* The earlier Level 1 training-data shortfall no longer applies under the remaining-pool rules, provided the reported 22 training pictures per category are confirmed (data requirement 1).
2. Level 3 categories.
3. Final Level 2 categories, once the dataset is checked.
4. Whether Reveal is required before continuing.
5. Whether a player can repeat a stage after training, and whether a repeated stage keeps the same candidates (recommended default in 3.6: yes, with the stage's selections returned to the available pool).
6. Whether progress is saved on leaving or refreshing, and where. This decides whether the stage's candidates and the available pools survive a reload (recommended defaults in 3.6).
7. Whether `check` is removed or kept as an optional pre-check.
8. Whether the minimal stage and level wrap-up screens are wanted.
9. Whether the integrated game keeps this bright concept theme or adopts the partner app's design (existing Master Plan decision D5). The concept look is the direction for the playground itself.
10. *(Closed.)* Stage candidates are drawn at random from each category's remaining pool (confirmed, 3.6).
11. Layout side: the confirmed pool on the right and categories on the left, or the concept image's mirror (7A.3).
12. Whether the training screen shows a code panel, and whether it shows an accuracy figure, a "2 of 3 right" summary, or neither (7A.2).
13. Which characters guide the child (robot only, or also the anime-style girl), and whether the guide stays scripted (7A.4).
14. Who produces the art assets, and whether the concept image's characters may be reused (7A.8).

**Data requirements**
1. Verify the Level 1 data (counts per category, ids, labels, embeddings, splits). Under the remaining-pool rules Level 1 needs at least 15 training pictures per category (22 reported) plus at least nine separate test pictures (16 reported).
2. Source, license and prepare a Level 2 dataset with at least 15 training pictures per category (45 in all; more gives variety), at least nine test pictures, embeddings and labels, and run the integrity checks.
3. Prepare a Level 3 dataset after its categories are chosen (at least 15 training pictures per category plus test pictures).
4. Run the data audit in 8.5 for every level before implementation and record the results.
5. Run offline evaluation at 3, 5 and 10 per category with nested selections for each level before writing game text that describes any trend.

**Technical questions**
1. Contract changes in section 9, reviewed and approved against the Master Plan before implementation.
2. Multiclass behavior and tests for Levels 2 and 3.
3. Server error codes for wrong labels, prediction limits, reveal order and an available pool that is too small.
4. Where stage candidates are drawn (proposed: the service, because only it knows the labels), how a stage-pool request carries the accepted ids, and how the pool rules are configured per level.
5. Whether one-use-per-level for test pictures needs a server-side level session or can stay a UI rule.
6. How wrong-image feedback and Reveal interact with rate limits and the model cap.
7. How the existing front end (including `SortingGame.jsx`) lines up with this flow; it needs an audit before work starts.
8. How the layout (up to 10 slots per category on the left, a pool of 20 or 30 pictures on the right) works on a phone, especially with three categories.
9. Whether the service should verify that new selections came from the candidates it issued. The proposed design does not, and the game rules do not need it.