# Editable chapter films

All films use the original, locally bundled Clear MP3 files. The JSON scripts and
word timings can be edited without a provider call. Caption text comes from the
written script. Do not change medical content without validating the assigned
course packet and updating the content review record.

The renderer requires Python 3, Pillow, NumPy, FFmpeg and an Arial-compatible font.
Its macOS Arial path can be changed in `font()`. From this folder, run:

```
python render_chapters.py 28 --qa-dir /private/tmp/exam4-review
python build_manifest.py
```

Replace 28 with 29–33. Review stills go outside the public artifact. Alignment
can be reproduced with `align_narration.py ASR_DIRECTORY CHAPTER` after local
Whisper word-timestamp recognition. No remote speech or ongoing API dependency
is needed to study. Rendering reuses the existing MP3; it does not generate a
new voice recording.

Full original art, licenses, hashes and all alterations are in ../ATTRIBUTION.md
and ../figures.json. The institutional and textbook artwork is for visualization.
No external medical fact becomes a scored key through its presence in a figure.
