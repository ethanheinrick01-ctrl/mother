# Exam 6 verification receipt

Local verification completed October 2, 2026. Host: macOS; real Codex in-app Chromium browser; private localhost origin `http://127.0.0.1:8766`. The exam namespace was empty before synthetic testing. No Betsy history was imported, overwritten, or tested. Raw screenshots, generated learner fixtures, ASR and expanded source-review material remain outside Git at `../exam6-private`.

## Automated checks

Run from the worktree root:

```sh
node --test tests/exam6-engine.test.cjs tests/exam6-content.test.cjs tests/exam6-media.test.cjs
node tests/exam6-contract.mjs site/nu545/exam6 --hydrated
node --test tests/engine.test.cjs tests/content.test.cjs tests/media.test.cjs
```

The scoped suite passes 33 checks: durable engine behavior, source identity, 150 original records, 30 concepts with two practice roots each, three disjoint balanced mocks, all 52 component records, 12 excluded-from-mastery source examples, privacy paths, six complete H.264/AAC films, stage times, and nonoverlapping captions. The existing Exam 3 suite passes 38 checks unchanged.

The generic skill validator initially failed because it treated script query strings as filenames and did not bind `window` for browser-only media data. `tests/exam6-contract.mjs` adapts only those two loading mechanics; it changes no validation rule. Hydrated result: 6 sections, 30 concepts, 89 cards, 162 items including 12 released self-checks, 12 cases, 1 Boss, zero errors/warnings. “1 blueprint” means one 30-question sizing blueprint shared by three distinct forms; the separate content suite verifies all three forms.

## Real browser checks

| Check | Observed result |
|---|---|
| Chapter layout | All six films appear after chapter introduction and before chapter tabs/cards; original figures, source disclosures and notes present. |
| Media | All six played decoded video and audio; captions loaded with 13–17 cues; native controls, no autoplay, stages and seeking verified. Ch40 also played through its full duration. Final middle-stage tests have one active caption cue per film. This is playback/decode and visual verification, not a claim of human auditory review. |
| Feedback | Before checking, no correctness styles. Confidence gating works. Selected wrong option/text/custom radio are #ff6b6b; correct option/text/custom radio and the entire answer line are #4cd07d. Correct radio remains unselected; other choices neutral. Shuffled indices map to the original option identities. |
| Persistence | Wrong/high-confidence draft survives reload; first scored miss survives correction; correction stays separate. Notes survive reload. Two tabs merge different chapter notes without losing answers. |
| Review/Cases | Miss returns in Review; targeted run starts. Released prose drafts and ratings save without mastery. Chapter43 conflict is visible; Chapter45 Q2 carries Q1's context. |
| Boss | Completed all25 through browser controls; no best before finish, completed best after finish. |
| Mocks | A/B/C each completed30/30 with all six chapters. 2700-second limits; timer decreases across reload. A dedicated one-second synthetic run tests actual expiry, disabled unanswered controls and persistence. No claim of waiting45minutes. |
| Versions/assistance | Saved item snapshot survives an in-memory current-item edit, then current item restored. Assisted fixture stays flagged and cannot earn mastery. |
| Backup | Export UI produces complete JSON; UI paste merge deduplicates. Clean storage restore recovers119 attempts,30 mastered clusters,2 notes and1 correction. File-input import also merges successfully; a wrong-course envelope is rejected with119 attempts preserved. All are synthetic. |
| Phone | Actual390×844 emulation: all10 main views and all6 chapter pages have390px document scroll width; practice radios and confidence fit. Wide tables use keyboard-focusable contained scrolling. |
| Keyboard | Skip link focuses main; Space/arrow keys choose radios, confidence is selectable; video controls support keyboard playback. |

The browser's ordinary backup download event and file-link download helper both timed out without a confirmed downloaded file. The link remains available, and the independently verified copyable JSON fallback supports complete export/restore. This is an explicit native-download verification limitation in this browser, not a claim that a file was saved. Native video/backup download links exist; confirm ordinary file saving once in Betsy's target browser during coordinated integration.

Phone checks required CDP device emulation because the browser viewport setting alone left `innerWidth` at1280; receipts verify actual390. Temporary overrides and synthetic progress are removed for handoff. The preview server implements HTTP byte ranges; Python's basic server did not permit accurate film seeking in this browser.

## Private receipt inventory

- `automated-tests.txt`, `baseline-tests.txt`, `contract.txt`.
- `mock-browser.json`, `phone-browser.json`, `final-film-browser.json`, `cold-restore-receipt.json`.
- `feedback.jpg`, chapter film/phone captures, mock captures and final preview.
- `reviewed-items.json`, `editorial-review-with-evidence.html`, source intake originals in the assigned packet.
- `cold-restore-backup.json` and `synthetic-progress.json` are test fixtures only, never release assets.

No hosted testing is claimed. No deployment occurred. Existing exam files and shared selectors/checkpoint were not modified.
