# Seven chapter explainer release — September 30, 2026

Ethan approved the revised scholarly visual style and AI Voice Generator Clear narration, then authorized placing an explainer first in each chapter. Codex root completed and inspected the set personally.

| Chapter | Mechanism | Runtime |
| --- | --- | --- |
| 21 | ADH synthesis/release, water reabsorption and DI mechanisms | 58 seconds |
| 22 | Insulin supply versus tissue response | 49 seconds |
| 23 | Adipose storage, heat production and inflammation | 57 seconds |
| 24 | Ovarian cycle and endometrial tissue changes | 57 seconds |
| 25 | Ductal in situ versus invasive breast disease | 55 seconds |
| 26 | Epididymitis site and retrograde route | 55 seconds |
| 27 | Syphilis local/systemic/latent comparisons | 60 seconds |

Each chapter renders exactly one local MP4 before its chapter tabs and study cards. All seven have H.264 video, AAC audio, a poster, default English captions, a transcript, stage-seek controls, and exact course-source disclosures. Original scholarly images remain accessible beside each chapter's study content. Attribution and adaptation disclosures are in `site/nu545/exam3/media/ATTRIBUTION.md`; editable source scripts and timing maps are bundled in `animation-source/`.

Local in-app browser QA confirmed first-position rendering in all seven chapters, native playback, caption display, and stage seeking. At 390 × 844, all seven chapters had one 328-pixel player, document scroll width of 390 pixels, and stage button heights of at least 45 pixels. A wide Chapter 27 table was corrected with a keyboard-accessible scrolling container. Responsive film buttons now use two columns on phones. Deployment asset versions avoid stale app/CSS caching.

Encoded frames were personally reviewed, including phase boundaries and final corrections to the cycle image crop, breast boundary comparison, male-anatomy route, and lymphatic route. Captions preserve the authored wording rather than medical transcription errors. Stage timing was aligned to the actual generated audio.

The 9 content and 27 engine tests passed. The 2 additional media tests verify all seven assets, codecs, durations, caption intervals, stage times and source references, plus an unchanged question bank and storage namespace. All 195 authored questions, form membership, stable IDs, content revision, engine and store files are unchanged by this release. Bank SHA-256: `ea74c736e28de4d7f7008f8a0cfbd9bb0eca00644aaa819fecf9acaf0fcab6d5`.

This release completes the seven-film integration. It does not close unavailable textbook coverage: 30 guide prompts remain Direct at slide depth, 20 Partial and 2 Missing. No voice/model call occurs during study; there is no per-study fee. NU518 files are unchanged. Publication and live readback are separate receipts recorded in CHECKPOINT.md.
