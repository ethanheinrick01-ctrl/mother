# Exam 4 verification

Verified October 2, 2026 against baseline 9c058c6. [Sanitized receipt](verification-receipt.json) records the supported claims. Private QA, screenshots, synthetic backups and full review material remain outside the repository in NU545 LAB/exam4-private-qa.

## Automated verification

`node --test tests/*.test.cjs`: 74 passed, zero failed. This includes 36 focused Exam 4 content/engine/media checks plus accepted existing-exam regressions. The hydrated v2 validator passed with no errors or warnings: six sections, 29 mastery concepts, 33 teaching cards, 159 total items including 26 released self-checks, one Boss blueprint and one mock blueprint with three separate forms. No shared engine file changed. Relevant runtime JavaScript syntax checks and sanitized public-file scanning are included in the final handoff.

The complete 896,024-character browser-created synthetic export also passed an offline roundtrip through the accepted store: all 114 attempts, 15 runs, first responses, saved snapshots, notes and correction records retained exactly. Importing it again was idempotent. This engine test is distinct from browser transfer proof.

## Real Chrome verification

| Behavior | Observed result |
|---|---|
| All six guides | All 33 cards inspected; films immediately after chapter introduction, before tabs/cards. Nine original figure disclosures opened and images loaded. |
| All six films | Actual native playback with audio enabled; native controls, no autoplay, English captions loaded/shown. All 24 stage jumps sought to the expected time. Local poster, transcript, script, renderer and attribution links resolve. |
| Practice | Rendered and checked questions from all chapters; confidence required before feedback. Choice and confidence drafts survived reload. |
| Red/green feedback | Selected wrong option/text/radio red; correct option/text/radio and full Correct answer line identical green. Correct radio remained unselected; other distractors neutral. No correctness shown before checking. |
| Corrections | Correction saved separately; first wrong response and scoring stayed intact after reload. |
| Review/mastery | Four-question targeted run completed. Two distinct unassisted roots earned mastery; low confidence/miss returned to review. Reading and films alone earned no mastery. |
| Released cases | Both Chapter 29 sets retained. Source model reveal requires confidence, records assistance, and never awards automatic mastery. Prose drafts survive reload; all six case chapters opened/revealed in phone QA. |
| Boss | Early-ended 1/25 run saved 24 unanswered and could not set a best. Complete 25/25 run recorded a completed best. |
| Mock A, B, C | All 75 original questions checked and all three forms completed. Own 40:00 timer; Mock A preserved checked answers and elapsed time after reload. |
| Expiry | Imported synthetic 40-minute expired run closed; 0/25, 25 unanswered, and completion state survived reload. |
| Cross-tab | Different chapter notes merged; later same-chapter edit visible in the other tab. Stale competing question response did not replace the earlier checked answer/confidence. |
| Backup text/import | Complete export visibly rendered and copied; valid 52,438-character QA backup imported through the UI twice without duplication. Wrong exam, future schema and malformed JSON rejected without clearing progress. |
| Saved versions | Synthetic archived question deliberately used a different saved key from the current public item; old prompt, key, checked response and correct score retained after import/reload, with revision warning. Fixture never enters the public bank. |
| Keyboard | Enter starts/checks, Space selects answer/confidence, Tab reaches rationale disclosure. Feedback receives focus. |
| Phone | Actual CSS viewport 390×844: all six guides, six case chapters, 11 assessment runs, coverage, and nine top-level modes have no page-wide horizontal overflow. One long Chapter 29 component label was fixed and rechecked. Native Chrome zoom required calibrating the viewport tool; DOM confirmed 390px. |
| Progress isolation | QA origin 127.0.0.1:8774 only. Clean learner preview 127.0.0.1:8776 shows zero attempts/mastery. No real Betsy history was cleared or seeded. |

Meaningful stage seeking requires an HTTP server with byte-range support. Initial Python basic-server seeking failed because seekable ranges were empty; the included loopback range server resolved all 24 stage jumps. There is no shared-engine seeking fix.

## Remaining manual verification dependencies

Native JSON file download was clicked on both full QA and small clean exports, but the browser tool returned no downloaded-file receipt. Native file-chooser upload is blocked until the human enables the Chrome ChatGPT extension’s **Allow access to file URLs** setting; no browser permissions were expanded. The complete large JSON field interrupted the browser bridge during attempted single paste; smaller UI imports and the exact complete engine import succeeded. Direct file:// browser launch was not verified because the browser tool supports http/https.

These are recorded verification gaps, not passing browser receipts. The working copy is a supported-content local handoff, not an unconditional publication-ready certification. Before integration release, manually verify Download backup → saved JSON → file chooser import, plus a complete large clipboard roundtrip. Use disposable QA progress, never Betsy’s real history.
