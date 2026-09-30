# Renal figure animation layer

Original: OpenStax College, Anatomy & Physiology (2013), figure 2710, CC BY 3.0. The untouched original is bundled with the Guide.

The built-in imagegen tool removed labels, leaders, magenta annotations and printed water arrows to prepare a non-destructive animation background. The generated image was visually compared to the original for cell/vessel orientation and relationships. This edited art is an AI-assisted teaching adaptation, not an unchanged textbook figure. Pixel dimensions and tissue geometry are schematic.

Prompt: remove only lettering, leader lines, printed flow arrows and magenta marks; retain the collecting-tubule lumen, epithelial-cell column, storage-vesicle outlines, red vessel, perspective and academic illustration colors; add no new labels, molecules or medical structures.

Saved cleaned image: renal-clean.png. Renderer: render_adh_academic.py. Course narration authority: CH21S25–26 and CH22S14/17. No new graded facts come from this supplemental figure.

## Testis and epididymis animation layer

Original: OpenStax *Anatomy & Physiology*, version 8.25 (2016), Figure 28.1.3, CC BY 4.0. The unchanged original is `figures/testis-epididymis.jpg`; its source URL and hash are in `figures.json`.

The built-in imagegen tool removed lettering and leader lines while retaining the testis cross-section, seminiferous tissue, epididymis, ductus deferens, vessels, orientation and academic colors. The result was inspected against the original, and the animation route was manually corrected to follow the deferens and epididymis rather than the neighboring red vessel. No diagnostic accuracy or exact anatomical scale is claimed for the schematic overlays.

Cleaned output: `testis-clean.png`, 1306 × 1205 pixels. The renderer scales crop coordinates from the 743 × 686 original reference. Motion depicts normal sperm direction as orientation, then the source-described retrograde infection route and site of inflammation. Course authority: the Chapter 26 sources disclosed in `chapter-films.json`. Original artwork remains separately accessible.

## Lymphatic animation layer

Original: OpenStax College, *Anatomy & Physiology* (2013), Figure 2201, CC BY 3.0. The unchanged original is `figures/lymphatic-system.jpg`; its source URL and hash are in `figures.json`.

The built-in imagegen tool removed printed labels, leaders and printed directional arrows while retaining the body, lymphatic channels and nodes, red capillaries, green lymphatic capillary and background tissue. The generated background was inspected against the original. Added microorganism motion follows the green channel; stage-specific node overlays are schematic and are removed for the latent comparison.

Cleaned output: `lymphatic-clean.png`, 1218 × 1291 pixels. The renderer scales crop coordinates from the 1115 × 1181 original reference. The CDC micrograph is bundled unchanged and is not generatively edited. Course authority: the Chapter 27 sources disclosed in `chapter-films.json`.

All three cleaned images are explicitly disclosed as AI-assisted adaptations in the player and attribution file. They do not replace the source references or establish new examinable claims.

## Cleaned layer integrity

- `renal-clean.png`: SHA-256 `2ae9c232018109bddc620962745376c6b4f3413866c3765f62bcafd0e9f0357b`
- `testis-clean.png`: SHA-256 `4ef4fdff1a61e3fbd7b0c0503cd53618fcd0139d13b9c169ead232188faa4da5`
- `lymphatic-clean.png`: SHA-256 `6e939a80dde5a07d935e5e74d28b6632f1b0d66f1beb57baeeae39d830e04f86`
