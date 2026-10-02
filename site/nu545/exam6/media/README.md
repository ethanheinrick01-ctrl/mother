# Exam 6 scholarly explainers

Six original source-bounded scripts, Clear synthetic narration from AI Voice Generator, and adapted OpenStax artwork. No remote playback dependencies; $0 per study use. Existing free allowance was inspected before generation; final UI showed 20K/30K used. No purchase or upgrade. Provider attribution: https://www.aidocmaker.com/

Original art and SHA-256 records are under figures/provenance.json. CC BY license links and each alteration are visible in the player. Scripts, word-aligned stage timing, caption alignment code and render code are under animation-source. The source packet controls teaching and scoring; outside art does not expand tested facts.

## Chapter 40
Source wall and bolus crops; traveling row deformation and added chyme particles.

## Chapter 41
Source wall crop; traveling contraction, schematic blocking lesion and proximal accumulation; open immobile lumen comparison.

## Chapter 42
Original micrograph rotated and progressively compressed to illustrate villous flattening; partial geometric recovery is schematic.

## Chapter 43
Thin and thick filament pixels separated by color, with thin-filament translation preserving length; calcium dots and span marker added.

## Chapter 44
Unannotated trabecular crop; smoothly expanded marrow-space mask illustrates supporting bone removal.

## Chapter 45
Frontal hip section retained with labels; localized superior-head deformation and tint illustrate collapse and partial remodeling. Adult figure is a location reference.

Rebuild: run local Whisper with word timestamps on audio/chNN-clear.mp3, then align_narration.py ASR_DIRECTORY and render_chapters.py CHAPTER. Python dependencies: Pillow and NumPy. FFmpeg/FFprobe must be on PATH. Arial path is macOS-specific and may be replaced with a local sans-serif font on another OS. No user progress is read by these scripts.

Optional review frames: add `--qa-dir /outside/public/site/frames` to the renderer. Review captures are not emitted to the public media folder by default.
