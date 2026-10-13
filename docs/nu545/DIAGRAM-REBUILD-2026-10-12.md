# NU545 diagram rebuild · October 12, 2026

All 35 chapter films in Exams 3–7 now use original, editable anatomical and mechanism illustrations. The 1280 × 720, 60 fps H.264 exports replace the existing film and poster paths. No narration was regenerated. Native captions remain separate and selectable; the player has additional space so captions and controls do not obscure the diagrams.

## Preservation

- All 35 compressed AAC audio streams match the originals byte for byte.
- Transcripts, caption files, stage timing/text, source references and film identities are unchanged.
- Question banks, concept IDs, answers, first-response/correction logic, engine/store files, storage namespaces, notes, histories and original reference artwork are unchanged.
- A 334-file baseline comparison found only the 80 intended media, poster, manifest and player-style changes; 254 protected files are identical and none are missing.
- The Exam 4 media assertion now expects the requested 60 fps instead of 24 fps.

## Validation

- 174 applicable repository tests pass. One historical branch-isolation assertion in `tests/exam5-content.test.cjs` was already failing at intake: it assumes all changes since `9c058c6` belong to Exam 5, while the current branch also contains Exams 4, 6 and 7. That assertion was explicitly excluded; it was not rewritten to conceal a regression.
- 141 gallery checks pass: all 35 native videos play, deterministic seeking repeats the same image, last-stage buttons seek correctly, and phone layouts fit. No script errors.
- 76 integrated Lab checks pass across all five exams: playback, notes and immutable first answers after reload, complete saved-state equality, video seeking without progress changes, exported backups and non-destructive backup merges. Tests used isolated synthetic browser profiles; real learner progress was not modified.
- The longest caption in every film was inspected at 1440, 800 and 390 px: 105 screenshots with no horizontal overflow. Final review added a 16:10 contained player, 400 px minimum height and size-appropriate captions.
- All five editable ZIPs pass CRC and launch from extracted offline files with their original audio.
- Every installed MP4 matches its verified export.

## Review and recovery

The animation process includes 35 loglines, 129 timed beats, 295 stills, full 30 fps pacing renders, timestamped contact sheets, per-beat critique and repaired 60 fps finals. Original media and private QA receipts are retained in the separate local visual-redesign workspace. Each Lab links its own `media/animation-source/diagrams-v2.zip` for offline editing.

This is a saved local revision. It has not been pushed or deployed. Source-coverage gaps and the original narration's limitations remain disclosed. Author review and technical checks do not represent Ethan's visual approval.
