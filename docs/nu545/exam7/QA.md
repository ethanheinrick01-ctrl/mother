# Verification receipt — October 2, 2026

**71/71 automated tests pass.** The hydrated v2 content contract reports ten sections, 30 concepts, 71 guide cards, 130 items including ten ungraded cases, one Boss, no errors and no warnings. Its “mocks: 1” means one 20-question size blueprint; the content checks separately verify three distinct forms. The generic validator required a private adapter stripping only script URL cache queries. Shared skills were not edited.

Full engine checks cover immutable first responses, confidence, distinct-root mastery, assistance, retries, elapsed mock expiry, blank scoring, snapshots, corrections, imports, cross-tab merging, collision/malformed-backup protection and history retention. Exam-specific checks cover the authored bank, component mappings, three forms, Boss size, source locators, DNA, ten H.264/AAC films, caption/stage ordering, colors and chapter-first placement. A focused regression verifies completed timer display remains frozen while active expiry still closes the run.

## Real-browser results

| Area | Observed result |
|---|---|
| Chapters/films | All ten guides inspected; all ten native films played, captions shown and stage seeks exercised |
| Practice and Review | Checked questions; missed/low-confidence evidence entered review; targeted review opened and answered |
| Feedback | No correctness before checking; wrong selected option/text/radio red #ff6b6b; correct unselected option/text/radio green #4cd07d; full answer line same green; other choices neutral |
| Option identity | Original option index remains attached through shuffling; correct unselected radio stays unselected |
| Confidence and correction | Confidence required before feedback; choice/confidence persisted on reload; correction saved separately without replacing first wrong answer |
| Assistance | Hint-assisted response persisted and did not independently earn mastery |
| Cases | All ten original cases inspected, drafted, model revealed and self-check saved; no prose grading/mastery |
| Boss | 25 supported questions checked and completed in synthetic QA |
| Mocks A/B/C | All 60 questions inspected and each form completed 20/20 using synthetic QA answers |
| Timing | Active 30-minute timer retained elapsed time across reload; final renderer freezes completed time at completedAt; imported Mock A remained 29:17 when finished |
| Notes/cross-tab | Two-way note exchange across two browser tabs and surviving run history |
| Backup | Actual JSON download read from disk; 429,929-character copyable backup pasted into a fresh test origin; 64 attempts, six runs, one correction, notes and original question snapshots restored and persisted after reload |
| Saved versions | Old Mock A retained old long option wording and 20/20 original score after content revision and import; new runs showed all three final revised option sets |
| Mastery boundary | Reading/watching left clean progress at zero; prose and hints did not automatically confer mastery |
| Keyboard/390px | Keyboard selection, confidence and checking worked; actual 390px iframe had no page-wide overflow across home, nine other modes, all ten chapters and expanded question/source |
| Clean handoff | localhost preview starts at 0 attempts/0 runs/0 of 30 concepts; QA data remains at separate 127.0.0.1 origins |
| Scope | Core engine/util hashes match accepted baseline; no existing exam, shared picker or common checkpoint changed |

## Limits that remain explicit

- Browser extension file-picker access was unavailable because Allow access to file URLs was disabled. No security setting was changed. Download and full pasted backup restoration are verified; selecting an import file through that picker is not browser-verified.
- The mobile check is a real 390 CSS-pixel iframe, not physical-device testing. A requested viewport override did not actually resize Chrome, so it was not counted as proof.
- Real-time 30-minute expiration was not awaited. Engine tests use an advanced clock; the browser verifies elapsed reload behavior and frozen completed timing.
- Automatic browser approval review denied raw debugger commands. Ordinary UI/native controls and read-only DOM inspection completed the checks without bypassing that restriction.
- No deployment was performed. There is no hosted Exam 7 release claim. Source limitations remain in SOURCE-ADJUDICATION.md and the learner coverage view.

Private evidence lives outside the repository/public site in ../exam7-private: editorial-review.html, automated-tests.tap, skill-validator.json, screenshots, ASR/render records and synthetic backup. verification.json records hashes and the scope of each observation. Synthetic scores are test evidence, never Betsy's history.
