# NU545 Exam 6 local integration handoff

Implementation and local handoff are complete. This branch has not been merged, pushed, deployed, or connected to the shared picker. Source completeness is not claimed; one browser-native download check remains unconfirmed as detailed below.

- Branch/worktree: `NU545-exam6` at `../NU545-exam6` relative to the canonical repository.
- Baseline: `9c058c6`, containing accepted Exam 3 scholarly films and red/green answer feedback.
- Integration commit: resolve with `git rev-parse NU545-exam6`; this document is included in that commit.
- Local preview: http://127.0.0.1:8766/site/nu545/exam6/
- Start preview from this worktree: `python3 tests/exam6-preview.py`.
- Namespace: `nu545-exam6-progress-v1`; never substitute another exam's key.

## Inventory

Six chapters (40–45), 89 teaching cards, 52 guide-prompt records with component tables, 30 supported mastery clusters, 60 original Topic Practice roots, adaptive Review, 12 clearly identified released self-checks, a 25-question within-unit Boss, three disjoint 30-question mocks, Progress, notes, and mergeable Backup. Confidence, immutable first answers, corrections, drafts, snapshots, assistance, run IDs, mock timing and cross-tab merge use the accepted engine.

| Chapter | Film | Duration |
|---|---|---:|
| 40 | Mixing and propulsion | 40.680 s |
| 41 | When intestinal flow stops | 46.296 s |
| 42 | Celiac injury and absorptive surface | 47.016 s |
| 43 | From calcium release to relaxation | 47.040 s |
| 44 | Bone loss and structural integrity | 52.536 s |
| 45 | Femoral-head injury in Perthes disease | 48.816 s |

Each film is local H.264/AAC with approved Clear narration, native controls, captions, transcript, stage jumps, poster, download link, exact course sources, preserved OpenStax original art, license/alteration disclosure and editable animation source. No system speech, subscription upgrade or purchase. Existing provider free quota used; final observed account meter 20K/30K. Studying costs $0 per use.

## Evidence and limits

[Coverage](coverage.md): 17 Direct at supplied-slide depth, 34 Partial, 1 Missing. The assigned textbook was not supplied. Prompt 26's muscle-mass laboratory association is Missing; no answer is invented. The matrix identifies named textbook topics and specific absent components for every partial prompt. Exact textbook page numbers cannot be given without that edition's pages. Obtain the assigned McCance/Huether ninth-edition passages for Chapters 40–45 listed in the matrix, plus instructor clarification of the 23 records in [SOURCE-ISSUES.md](SOURCE-ISSUES.md). In particular, Chapter 43 case 2 supplies a Gomphosis key but a Syndesmosis rationale; it remains visibly unscored.

Official evidence establishes November 16–18 and 40 points. Question count, timing, weights, resources and attempts remain unconfirmed. The three 30-question/45-minute forms and equal chapter allocations are explicitly [practice design](blueprint.md), not exam predictions.

All 150 authored items were read in rendered form and validated in a separate source/key pass by the same author. [DNA](professordna.md), [editorial record](editorial-review.md), [complete original item sheet](editorial-review.html) and per-item review hashes are included. No independent reviewer is claimed.

[Verification](VERIFICATION.md): 33 scoped and 38 unchanged baseline automated checks pass; hydrated contract has no errors/warnings. Browser checks cover all six films, every mode, all mocks, Boss completion, answer colors/identity, confidence, corrections, reload, two-tab notes, snapshots, assistance, timer expiry, clean restore, keyboard and 390 px layouts. File import and wrong-course rejection also passed. Synthetic progress was backed up privately then removed; handoff preview shows 0 attempts, 0 notes, 0 runs and 0 mastered.

The in-app browser did not return a confirmed native backup download. Persistent download links and a copyable JSON export are provided; the full copyable export/cold restore and file import paths passed. Confirm native backup/video file saving in Betsy's target browser during integration. No hosted verification is claimed.

## Coordinated integration

1. Review and cherry-pick this branch's commit into the agreed integration branch. Do not reset or switch another worker's checkout.
2. Add the proposed NU545 class-picker entry: **Exam 6 · Digestive & musculoskeletal systems** → `/nu545/exam6/` (or relative `exam6/` from `/nu545/`). Root/class picker files were deliberately untouched here.
3. Run the scoped checks and shared regression suite in VERIFICATION.md. Confirm all four exam links together in the final integration pass.
4. Verify actual target-browser downloads and deployed media byte-range seeking, captions, sources and mobile layout. Localhost and hosted origins have separate browser storage; transfer only Betsy's own export if needed.
5. Publish only through the separately authorized integration pass. Exclude `../exam6-private` and the original source packet.

No shared-engine change is needed. Exam-local UI additions are a contained focusable Progress table, an export-text fallback, explicit component/conflict disclosures, and an 80 ms stage-seek offset. The optional common validator loader improvement is documented above; common skill/engine files were not edited.
