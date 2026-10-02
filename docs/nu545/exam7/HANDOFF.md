# NU545 Exam 7 local handoff

Supported implementation is built, personally reviewed and verified. Source completeness is separate: 133 Direct / 13 Partial / 20 Missing of 166 components. Missing textbook facts and unresolved packet conflicts remain visible and excluded from scored keys. Not deployed or presented as a complete reconstruction of the real exam.

- Worktree: `/Users/ethanheinrick/Desktop/AI SHIZ/mom labs/NU545 LAB/NU545-exam7`
- Branch: `NU545-exam7`
- Baseline: `9c058c6`, accepted scholarly-film and feedback release
- Commit: the tip commit containing this handoff (`git log -1 --format='%H %s'`); exact hash is returned in the chat receipt
- Clean local preview: http://localhost:8877/nu545/exam7/
- Restart preview: `python3 docs/nu545/exam7/tools/preview.py --port 8877`
- Private packet: `/Users/ethanheinrick/Desktop/NU545 Unit 7`
- Private QA and screenshots: sibling `exam7-private/`; these are outside the repository and public site

Inventory: ten chapter guides and films; 120 original MC; ten original prose cases; Topic Practice, adaptive Review, Cases, 25-question Boss, three distinct 20-question/30-minute practice mocks, Progress, notes and Backup. Seventy-one automated tests pass. Real-browser media, assessments, persistence, feedback and 390px layout checks are documented with their limits.

Review records: [Professor DNA](professordna.md), [component matrix](COMPONENT-COVERAGE.md), [blueprint](BLUEPRINT.md), [entire-bank review](EDITORIAL-REVIEW.md), [item ledger](editorial-ledger.json), [media/license record](MEDIA-README.md), [QA](QA.md), [verification receipt](verification.json), [remaining source requests](SOURCE-ADJUDICATION.md).

Integration: cherry-pick the reviewed tip commit during the coordinated pass. Proposed picker destination `/nu545/exam7/`, label “Exam 7 — Genes, cancer, skin, shock and burns.” The shared picker and existing exams were untouched. See [integration notes](INTEGRATION-NOTES.md) for two optional renderer fixes to coordinate; no shared engine fix is required.

Limitations: actual exam count/time/weights remain unknown; textbook passages are still needed for 33 partial/missing components. File-picker import was blocked by browser-extension access settings, while full pasted backup restoration succeeded. Responsive proof uses a real 390px browser iframe. No physical-device or live-host deployment verification is claimed.
