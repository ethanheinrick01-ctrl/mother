# Chapter-first scholarly mechanism films

Ten local films are placed immediately below the chapter introduction and before tabs/study cards. Each is a focused mechanism explanation, approximately 26–31 seconds, not a substitute for the full chapter guide. Every film includes native controls, no autoplay, an English caption track, transcript, stage-jump buttons, poster, download, course-source disclosure, original scholarly artwork access and editable animation source.

The supplied PowerPoints contained no usable scholarly process artwork beyond logos. Appropriately licensed NHGRI, NIH/NCI and OpenStax illustrations supply visual context. The factual scripts remain bounded by the assigned packet. Origins, creator, license, source URL, file hashes and alterations are recorded in media/animation-source/figure-manifest.json. Original bundled reference files remain unchanged; schematic motion, crop, scale, flow particles, color fields and tissue deformation are disclosed. Rendered overlays are not presented as measured anatomy or clinical timing.

| Chapter | Film | Scientific change shown | Duration |
|---|---|---|---|
| 4 | Transcription: making the message | RNA message grows from template and departs | 26.2 s |
| 5 | Insulin: response and supply | Tissue response weakens; insulin supply contrasted | 31.1 s |
| 6 | Epigenetics: changing access | Chromatin access and methylation markers change | 27.0 s |
| 12 | Invasion: crossing a tissue boundary | Cells breach the epithelial boundary | 28.7 s |
| 13 | Adipose tissue and cancer risk | Adipose signaling changes | 27.5 s |
| 14 | Immature tissue and differentiation | Maturation contrasted with retained immature cells | 29.3 s |
| 46 | Pressure: from compression to ischemia | Compression reduces tissue flow | 28.7 s |
| 47 | The itch and barrier cycle | Scratching and epidermal thickening develop | 29.0 s |
| 48 | Burns: edema with volume depletion | Fluid leaves circulation while edema grows | 28.5 s |
| 49 | Perfusion before pressure falls | Perfusion declines before the pressure indicator falls | 26.4 s |

## Narration, costs and reproducibility

Narration was generated through the approved AI Voice Generator plugin, Clear voice. The free allowance was inspected (30,000 characters; observed counter initially zero, then 891 during generation); approximately 5,000 characters were generated for this build. No purchase, subscription upgrade or runtime API dependency was added. A definitive final provider usage counter was not recorded. The completed MP3 files are bundled, so studying incurs $0 per playback. Regeneration must recheck the current provider allowance; do not assume the remaining quota.

Scripts and time maps are in media/animation-source. Caption wording is the exact authored script. Local Whisper base word timing was used as an alignment aid (minimum text agreement approximately 0.968), then chapter playback/captions/stage transitions were browser-reviewed. ASR and review logs stay private.

The editable renderer requires Python 3, Pillow and FFmpeg/ffprobe; its current font path is macOS Arial. On another operating system, supply an equivalent licensed font path before rendering. Rendering uses only bundled art, MP3 and JSON; it does not regenerate narration or contact a provider.

```sh
python3 site/nu545/exam7/media/animation-source/render_chapters.py
python3 site/nu545/exam7/media/animation-source/render_chapters.py 48 --frames --review-dir /absolute/private/film-review
python3 docs/nu545/exam7/authoring/media.py
```

Review contact sheets are optional and must remain outside the public site. Native playback, captions and seeking were exercised for all ten films. A MIME issue in the private preview server was corrected to serve VTT as text/vtt; the bundled captions themselves were valid.
