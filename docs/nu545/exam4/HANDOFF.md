# NU545 Exam 4 local handoff

Working copy: `/Users/ethanheinrick/Desktop/AI SHIZ/mom labs/NU545 LAB/NU545-exam4`. Branch: `NU545-exam4`. Accepted baseline: `9c058c6`. The reviewed local commit is the tip of this branch; obtain its exact ID with `git rev-parse NU545-exam4`. Delivery is local only. No merge, push, deployment, class-picker edit or common checkpoint change was performed.

Implementation and verification: 98%. The supported learning experience is implemented; the remaining release gate is manual native backup-file and full large clipboard verification described below. Source coverage is a separate measure: 59/108 Direct at slide depth (54.6%), 35 Partial, 14 Missing. Missing textbook facts remain visible and excluded from graded keys.

Clean local preview: http://127.0.0.1:8776/nu545/exam4/. This origin showed zero attempts, zero mastery and no QA notes/runs. Synthetic QA used port 8774; neither port is the eventual GitHub Pages storage origin. Back up real progress before moving origins.

## Implemented inventory

| Chapter | Teaching | Chapter-first scholarly explainer |
|---|---|---|
| 28 | Hematologic cells, production, nutrients/iron, hemostasis, lymphoid organs, developmental comparisons | Red-cell production, deformability, clearance and iron transport/storage; 61.944 seconds |
| 29 | Anemia mechanisms/replacement, marrow/hemolysis, polycythemia, leukocytes, malignancy, platelets and DIC | DIC activation, fibrin accumulation, reduced flow, consumption and bleeding; 60.264 seconds |
| 30 | Neonatal production/HDFN, G6PD/membranes, sickling/crises, thalassemia and pediatric bleeding | Actual normal/sickle scholarly cell comparison, obstruction and distinct crises; 62.112 seconds |
| 31 | Chambers/valves/cycle, conduction, receptors and hemodynamics, coronary/pressure comparisons | Anatomical filling, closed-valve pressure phases, ejection and relaxation; 61.560 seconds |
| 32 | Hypertension, venous pooling/Raynaud, infection/immune injury and heart failure | Filling impairment versus ejection impairment and congestion; 66.432 seconds |
| 33 | Flow classes, shunts, mixing/obstruction, infant HF and defect comparisons | CDC normal/VSD heart pair, left-to-right stream and pulmonary burden; 67.920 seconds |

33 guide cards, 29 mastery concepts, nine original figure disclosures from five preserved scholarly originals. Six locally bundled Clear narrations and six H.264/AAC films, captions, transcripts, posters, four stage jumps each, native controls, downloads, source disclosures, attribution and editable scripts/renderers. External artwork supplies visualization only. No autoplay. Existing provider quota was used; no purchases or upgrades. Studying costs $0 per playback.

Practice: 58 originals, two distinct roots per mastery concept. Adaptive Review, a 25-root cumulative Boss, three held-out 25-question original mock forms and Progress/Backup share the stable namespace `nu545-exam4-progress-v1`. Confidence precedes feedback; original checked answers remain scored while corrections stay separate. 26 identifiable released cases are saved prose/self-comparisons without automatic mastery. Both Chapter 29A sets are retained.

The three mock forms use a 40-minute practice timer, one first-answer point per question and zero for unanswered items. Official evidence establishes 40 points and October 19–21; official question count, timing, weighting, attempts, permitted resources and cumulative requirements are unresolved. No Exam 3 count or timing was copied.

## Review and receipts

- [Professor DNA](professordna.md) and all 26 [sample metrics](authoring/sample-metrics.json).
- [Component coverage matrix](COVERAGE.md), [structured coverage](coverage.json), and [exact remaining source gaps](SOURCE-GAPS.md).
- [Practice blueprint](BLUEPRINT.md).
- [Full personal editorial and separate source passes](EDITORIAL-REVIEW.md), [per-item review dispositions](authoring/review-receipts.json), [editable bank](authoring/bank.json).
- [Browser/automated verification](VERIFICATION.md) and [sanitized receipt](verification-receipt.json): 74 automated tests pass; hydrated validator passes. Real browser checked all films/stages, all 75 mock questions, completed Boss, persistence/feedback, small paste import, archived keys, expiry, keyboard and phone layouts.
- Media attribution and reproducible edit source: `site/nu545/exam4/media/ATTRIBUTION.md` and `media/animation-source/README.md`.

Private packet: `/Users/ethanheinrick/Desktop/NU545 Unit 4`. Private review/QA: `/Users/ethanheinrick/Desktop/AI SHIZ/mom labs/NU545 LAB/exam4-private-qa`. Neither is tracked. No raw course decks, private capture files, learner exports, family screenshots, credentials or signed provider URLs are in the public artifact.

## Remaining release gate

Native Download backup was attempted with both full and small exports; no downloaded-file receipt was returned. Native file upload requires the human-controlled Chrome extension setting Allow access to file URLs, which was not expanded. Large single clipboard transfer interrupted browser automation; a 52,438-character browser import and exact full 896,024-character offline engine roundtrip passed. Direct file:// launch was not verified through the browser tool.

Before a publication claim, manually exercise Download backup, saved-file import and a full large clipboard roundtrip with disposable QA progress. The current handoff does not certify these as browser passes. Source gaps and the instructor format questions remain open independently of this verification gate.

## Integration instructions

Review `git show --stat NU545-exam4` and `git diff 9c058c6..NU545-exam4 -- site/nu545/exam4 docs/nu545/exam4 tests/exam4-*.test.cjs`. Integrate this local branch/commit during the coordinated four-exam pass; do not copy any private QA or packet material. Re-run the full tests and hydrated validators after integration. The proposed class-picker destination is `nu545/exam4/`, labeled **NU545 Exam 4 · Blood and circulation**. That link has not been added.

No shared engine fix is required. Three exam-local interface changes may be useful for coordinated integration: require confidence before revealing a released case answer; offer Show backup text alongside native download; wrap long coverage component labels on phones. The assistance label now covers all assistance rather than implying every source reveal is a hint. Other exams and shared files are unchanged.

The local preview server serves only `site/`, binds loopback, and supports byte ranges for seeking:

```sh
python3 docs/nu545/exam4/authoring/preview_server.py --port 8776
node --test tests/*.test.cjs
node /Users/ethanheinrick/.codex/skills/build-course-study-lab/scripts/validate-study-lab-v2.mjs site/nu545/exam4 --hydrated
```

A basic static server without HTTP byte ranges can make native stage seeking appear broken. Keep the included range server for local media QA. Preserve the storage namespace and saved question snapshots through later revisions; new competencies require new evidence and must not acquire mastery from earlier unrelated answers.
