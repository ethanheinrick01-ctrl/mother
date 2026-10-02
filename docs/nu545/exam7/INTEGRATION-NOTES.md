# Coordinated integration

Base: accepted Exam 3 release 9c058c6. Branch: NU545-exam7. Apply this branch's single local commit in the final coordinated integration pass. Do not reset or switch the shared checkout. No push, merge or deployment was performed.

Owned paths are site/nu545/exam7/, docs/nu545/exam7/ and tests/exam7*. Existing exams, root/class picker and common CHECKPOINT.md remain unchanged. Proposed NU545 picker entry: **Exam 7 — Genes, cancer, skin, shock and burns**, href `exam7/` from `/nu545/` (absolute destination `/nu545/exam7/`). The final integrator owns that shared edit.

The copied core engine and utility modules are byte-identical to accepted Exam 3. Store changes only isolate `nu545-exam7-progress-v1` and `nu545-exam7`; no schema or scoring changes. Never substitute Exam 3's key.

## Exam-local renderer fixes worth coordinating

1. Finished mock countdown: baseline rendering used the current clock after completion. Exam 7's tick() uses recorded completedAt for finished/ended activities and labels the value “remaining when finished.” It leaves active expiration and saved timestamps intact. The focused regression test and real imported completed mock verify this. No shared engine fix is required; other exams may independently adopt this renderer fix during integration.
2. Backup text export: Exam 7 adds a read-only copyable JSON view alongside Download backup. Existing paste import was successfully used when browser extension file-picker access was unavailable. Other exams may adopt this convenience without schema changes.

The general skill validator treats URL cache queries as literal filenames. A private copy stripping only the query part passed the hydrated contract. Do not edit shared skill files during this isolated task.

After integration: run all repository tests, validate the combined picker links and verify hosting MIME types/media bytes if deployment is separately authorized. Local preview storage and hosted storage are different origins; move real learner history only with an intentional backup import.
