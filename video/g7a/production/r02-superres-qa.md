# G7A R02 supersampled delivery QA

- Status: `FINAL / USER_ACCEPTED / LOGIC_REVIEW_PASS`.
- Canonical G7A deliverable: `out/r02-superres/ifc-clashtrace-r02-1440p-master.mp4` (2560 × 1440, narration + SFX + BGM). The user accepted this version as final on 2026-08-31; the no-BGM and 1080p files are compatibility derivatives only.
- Source timeline: the approved 4,990-frame / 166.333-second R02 composition; content, narration, captions, music envelope and edit timing are unchanged.
- Method: render the Remotion composition at `1.333333×` device scale for a native `2560 × 1440` raster, convert browser full range to limited-range BT.709, then apply luma-only `unsharp=5:5:0.14:3:3:0`. No chroma sharpening and no frame-by-frame neural super-resolution are used.
- Selection evidence: a 300-frame sample covering 68–78 seconds was rendered both without sharpening and with 0.14 luma sharpening. Enlarged crops of the evidence table and bilingual caption show tighter strokes without double edges, white halos or character deformation.

## Deliverables

| File | Resolution | Audio | SHA-256 |
| --- | ---: | --- | --- |
| `out/r02-superres/ifc-clashtrace-r02-1440p-master.mp4` | 2560 × 1440 | narration + SFX + BGM | `404c4576e3b315ac99b0fd67ccc0e608d132faa30aef9fa94aff10929889c2b0` |
| `out/r02-superres/ifc-clashtrace-r02-1440p-no-bgm.mp4` | 2560 × 1440 | narration + SFX | `2525c724ac9314f0c2be0dd82c5260128f6604b1ac81d3055d914b6122cdf24a` |
| `out/r02-superres/ifc-clashtrace-r02-1080p-supersampled.mp4` | 1920 × 1080 | narration + SFX + BGM | `5e38820178220d3e5af70c306e008aa49618f43cc19969bbe8b18705b79ff4c5` |
| `out/r02-superres/ifc-clashtrace-r02-1080p-no-bgm.mp4` | 1920 × 1080 | narration + SFX | `74dacae02fbcee835c52fc97825d9c01c07d2bea36d1ec49b0c9a8c969399c3f` |

## Technical checks

- All four files: H.264 High, 30 fps, exactly 4,990 declared frames, 166.333 seconds of video, yuv420p, limited-range BT.709 with matrix/transfer/primaries all signalled.
- All four files complete full video/audio decode with exit code 0.
- 1440p BGM/no-BGM compressed video MD5 is identical: `dfa73d0964317767f0cd34bdee2d6f31`.
- 1080p BGM/no-BGM compressed video MD5 is identical: `7c214502c62e38c0d9008a75631891d9`.
- BGM audio MD5 is identical across 1440p/1080p: `dfacc4af52c416d5549d8a230adec684`; no-BGM audio MD5 is likewise identical: `c0520d8c63d5d92db12c11b665a2a335`.
- BGM programme: -20.1 LUFS integrated, 6.0 LU LRA, -0.6 dBFS true peak. No-BGM: -19.8 LUFS, 6.0 LU LRA, -0.7 dBFS true peak.
- `blackdetect=d=0.5:pix_th=0.01` reports no interval.
- Representative contact sheet uses frames 150, 930, 2160, 3040, 4500 and 4920. Full-size f2160 and enlarged evidence/caption crops were visually checked for edge integrity.
- Review mode serves the 1440p BGM master by default, offers the 1440p no-BGM version, exports a 2560 × 1440 baseline, and uses the new blank `ifc-clashtrace-g7a-r02-superres-review-v4` annotation namespace.

## Final logic review

- The 13 scenes form a continuous 4,990-frame timeline with no gap or overlap. The argument proceeds from review need, through input and deterministic execution, to aggregate results, record-level evidence, numeric boundaries, failure closing, controlled verification, optional AI separation, supported scope and the final disclaimer.
- The aggregate classification is arithmetically closed: `4 CLASH + 1 WARNING + 11 NOT_EVALUATED + 72 CLEAR = 88` relationships.
- The boundary examples match the displayed rules: hard clash requires interior depth strictly greater than 2 mm; clearance warning requires less than 50 mm, so 49 mm warns and 50 mm is clear.
- `NOT_EVALUATED` is consistently presented as failure closing rather than a pass. Optional AI interpretation is separated from deterministic status and measurement.
- The `8 / 8` authored cases and `9 / 9` clearance fixtures are explicitly bounded by the later focused-prototype disclaimer; the film makes no engineering-certification or arbitrary-project accuracy claim.
- Result: no blocking narrative, arithmetic, threshold, evidence-chain or scope contradiction remains. The user also explicitly accepted the native picker-window transition as part of the final visual treatment.

## Compatibility derivative

- The 1080p version is generated only after the 1440p master is finalized, using Lanczos downsampling. It is not a simple enlargement of the prior compressed 1080p file.
- The source screenshots supplied at approximately 2,559 pixels wide are already appropriate for the 1440p master. Neural processing was therefore not applied to them, avoiding invented UI strokes or temporal shimmer.
