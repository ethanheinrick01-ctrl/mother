# Exam 5 verification receipt

Verified locally October 2, 2026 by Codex root. No additional agents, merge, push or deployment. Implementation is present for the supported packet; two native browser I/O confirmations remain unavailable. This is not a publication-ready or full official-exam coverage claim.

## Automated checks

`node --test tests/content.test.cjs tests/engine.test.cjs tests/media.test.cjs tests/exam5-content.test.cjs tests/exam5-engine.test.cjs`

Final result: **73 tests passed, zero failed, skipped or cancelled**. Existing content/engine/media suites remain untouched. Exam 5’s eight focused content/media checks and 27 assessment/persistence checks run against its own data and storage identity. They validate all 136 original roots, every option/key/rationale/source, 32 concepts with two distinct taught roots, disjoint forms and deliberate allocations, all 56 prompts/233 component judgments, source exclusions, released self-check isolation, and all six local films. Engine checks cover confidence, first-answer immutability, corrections, snapshots, assistance, retry distances, mastery, run identity, timer expiry, early Boss behavior, cross-tab collisions, quota failure, corrupt/future data and import preservation.

Every shipped JS file passed `node --check`. `git diff --check` passed. Public inventory: 54 files, 24,312,529 bytes at the final scan. No raw decks, PDFs, case captures, learner exports, family screenshots, credentials, signed download URLs or private absolute source paths are in the public site. Runtime JS/CSS/HTML has no fetch, remote import, socket, beacon or external media requirement. Scholarly attribution links are optional outbound source access, not playback dependencies.

Clean preview byte-range verification: HTTP **206**, `Content-Range: bytes 0-1023/1905118`, `Content-Length: 1024`, `Accept-Ranges: bytes`, `Content-Type: video/mp4` for the Chapter 38 MP4. Preview binds only to 127.0.0.1. Final movie probes verify H.264 1280×720, 24 fps, AAC, local timed VTT and narration-aligned duration.

The skill’s unmodified v2 validator was also attempted. Its parser treats cache-busting query strings as filename characters; it then assumes a different window global and a removed `L.srcBase` helper. A private compatibility run normalized those three loader assumptions without changing shared files. It reached all 148 original/released records with no warnings; its only two reported errors required shared stems for the two Chapter 38 examples whose supplied records have no shared introduction. Those empty source introductions are intentionally preserved rather than invented. The exam-specific validators cover the accepted nursing implementation directly. The generic validator is **not reported as passing**.

## Real-browser checks

Chrome through CUA, isolated QA origin `http://127.0.0.1:8755`. All progress is synthetic; no Betsy history was read or modified. A separate clean deliverable preview on port 8756 was verified with zero attempts, zero runs and zero mastery, using `nu545-exam5-progress-v1` and revision r2. Localhost and deployed-site storage remain separate origins.

| Behavior | Observed result |
|---|---|
| All six chapter explainers | Actual native playback: not paused, readyState 4, correct durations, English captions showing. All 30 stage jumps checked with active cues and matching times. All six also played, captioned and sought at measured 390px width. No autoplay. Posters, transcripts, sources and editable animation/download links present. |
| Topic and chapter Practice | Questions rendered and checked in every chapter. A new fibrosis topic earned mastery only after its two distinct unassisted high-confidence roots. Hint-assisted correct response did not earn mastery. |
| Adaptive Review | Due queue generated from earlier responses; targeted run, confidence, feedback and saved first response checked. Miss spacing was also observed extending a short practice run. |
| Released Cases | All 12 rendered. Prose draft and confidence survived reload, supplied answer revealed, comparison self-check saved. Chapter 34’s DRG/VRG conflict warning preserves the supplied answer explicitly as unresolved and unscored. No automatic case mastery. |
| Boss | All 25 checked, final 25/25 result and completed best observed. A subsequent incomplete Boss did not change the completed best. |
| Mocks A/B/C | Every question rendered and checked. Each completed with 24/24; all three saved results inspected. These scores are synthetic test data, not learner performance. |
| Timer | A full 2160-second mock retained its original run and elapsed time on reload (36:00 to 35:34). A separate developer-created two-item, one-second synthetic mock expired through the production timer/reload path, disabled responses and left unchecked drafts unscored. Shipped mock duration stays 2160 seconds. An attempted debug change to a saved start time was rejected by immutable merge behavior. |
| Wrong feedback and shuffling | Checked wrong option/text/radio RGB 255,107,107; keyed option/text/radio RGB 76,208,125; correct-answer line identical green. Correct radio remained unselected, wrong selection remained selected, other distractors neutral. Original option identity remained correct under shuffled letters. No correctness classes before checking. |
| Confidence and corrections | Checking without confidence recorded no attempt. First wrong answer remained wrong/high confidence after a separate correct correction and reload. |
| Durable drafts and notes | Choice/confidence/hint history and prose drafts survived reload. Notes saved on two chapters in different tabs and appeared together. |
| Cross-tab progress | A keyboard-scored second-tab attempt merged into first-tab history (110 to 111) without losing earlier notes, correction or first response. |
| Saved question versions | The first scored r1 snapshot remained r1 after loading r2; its original wrong response remained index 1. Revised question keys, explanations and the new fibrosis concept did not reset or rescore it. Saved-run warning explains retained versions. |
| Backup merge | Export API generated the full synthetic JSON. Pasted import merged without duplicate attempts. Malformed, wrong-course and future-schema imports rejected while preserving work. A developer-created browser File containing that export exercised the production file-input change/FileReader/import path: “Progress merged,” still 111 attempts, old r1 response and correction preserved. |
| Keyboard | Enter started topic practice; Space selected answer and confidence; Enter checked with correct feedback. Focusable navigation, fieldsets and feedback inspected. |
| Phone layout | Measured CSS width 390; document scrollWidth 390 on home, guide index, all six chapters, coverage, Practice, Review, Cases, Boss, Mocks, Progress, Sources and Backup. No page-wide overflow. Temporary viewport override reset afterward. |

## Remaining native I/O confirmation

The automation download event and `downloadMedia` both timed out for the generated backup link. The app now leaves an explicit “Download ready JSON backup” link after pressing Download backup, and its local Blob contains the verified export payload. This confirms generation and a usable link, **not successful native file saving**. Native download completion remains to be confirmed on the user’s browser.

The Chrome file chooser was detected, but `setFiles` requires the ChatGPT extension’s “Allow access to file URLs” permission; native fallback did not expose a usable picker. FileReader/import behavior is verified with a synthetic browser File; **native file selection is not confirmed**. No permission or browser security setting was changed. No protected browser page was accessed through a workaround.

To enable file upload, open chrome://extensions, click Details under the ChatGPT browser extension, and enable "Allow access to file URLs." See [here](https://developers.openai.com/codex/app/chrome-extension#upload-files) for details.

## Evidence location

Full tool receipts, synthetic exports, media stage readbacks, rendered editorial HTML/PDF, phone checks and screenshots are in the private sibling `exam5-private`, outside Git and the public site. Main receipts: `final-test-output.txt`, `browser-media.json`, `browser-phone-films.json`, `browser-assessments.json`, `browser-cross-tab-keyboard.json`, `browser-backup-fixture.json`, `browser-phone-layout.json`, `browser-clean-preview.json`, `editorial.html`, `editorial-review.pdf`. The handoff contains sanitized findings, not learner records or private captures. The private port-8755 server was stopped and its listener absence verified; the clean port-8756 preview remains running.
