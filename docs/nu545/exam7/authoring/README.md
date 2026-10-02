# Rebuilding Exam 7 content

These inputs regenerate only Exam 7. They require the existing private source packet; no deck or released case capture is bundled here. The script reuses collected slide-and-notes JSON and PPTX note relationships; it does not repeat bulk extraction.

From the repository root:

```sh
python3 docs/nu545/exam7/authoring/components.py
python3 docs/nu545/exam7/authoring/supplement.py
python3 docs/nu545/exam7/authoring/build.py --packet "/absolute/path/NU545 Unit 7" --review-dir "/absolute/private/exam7-review"
python3 docs/nu545/exam7/authoring/media.py
node --test tests/*.test.cjs
```

`items.tsv` is the 120-item editorial input; `coverage.tsv` is the 51-prompt teaching input; `supplement.py` generates the comparison cards; `components.py` maintains the component audit. The study-guide prompt text is read verbatim from the supplied text extraction. `build.py` includes additional chapter teaching and the ten original case models. The separate media renderer and scripts are bundled under the exam's media/animation-source directory.

The review ledger describes the reviewed revision. Editing content requires a fresh source/key and rendered review; do not retain old approval claims for altered questions. Existing question IDs and first-answer snapshots must not be rewritten. New competencies require new stable concept IDs and new learning evidence.
