# G7A final production record

Status: `PASS / R02_FINAL_USER_ACCEPTED`

Date: 2026-08-31  
Mode: joint creation, followed by user annotation rounds and final acceptance  
Canonical deliverable: `video/g7a/out/r02-superres/ifc-clashtrace-r02-1440p-master.mp4`

## Final master

| Property | Accepted value |
|---|---|
| Picture | 2560 × 1440, 30 fps, 4,990 frames, 166.333 seconds |
| Video | H.264 High, yuv420p, limited-range BT.709 |
| Audio | English narration, SFX and BGM; AAC-LC, 48 kHz stereo |
| Programme loudness | -20.1 LUFS integrated, 6.0 LU LRA, -0.6 dBFS true peak |
| SHA-256 | `404c4576e3b315ac99b0fd67ccc0e608d132faa30aef9fa94aff10929889c2b0` |

The user selected the BGM version as the canonical G7A result. The no-BGM 1440p file and two supersampled 1080p files are compatibility derivatives only.

## Content and logic closure

The 13-scene timeline is continuous with no gap or overlap. Its narrative moves from the review need, through IFC inputs and deterministic execution, to aggregate results, record evidence, numeric boundaries, failure closing, controlled verification, optional AI separation, supported scope and the final disclaimer.

- Aggregate results close arithmetically: `4 CLASH + 1 WARNING + 11 NOT_EVALUATED + 72 CLEAR = 88`; equivalently, `4 + 1 + 11 + 72 = 88`.
- Hard clash requires structure-interior depth strictly greater than 2 mm.
- Clearance warning requires less than 50 mm; 49 mm warns and 50 mm is clear.
- `NOT_EVALUATED` is failure closing, never a silent pass.
- Optional AI interpretation cannot change deterministic status or measurement.
- The `8 / 8` authored cases and `9 / 9` clearance fixtures are controlled evidence, bounded by the focused-prototype and not engineering certification disclaimer.

No blocking narrative, arithmetic, threshold, evidence-chain or scope contradiction remains.

## Quality closure

- All four deliverables declare exactly 4,990 frames and fully decode.
- BGM/no-BGM pairs have identical compressed video streams at each resolution.
- The 1440p master was rendered from source at 1.333333× device scale and received restrained luma-only sharpening. No neural frame interpolation, frame rewriting or UI-text invention was used.
- Black-frame scanning reports no interval of at least 0.5 seconds.
- Representative opening, picker, evidence, boundary, AI, scope and closing frames were visually checked for edge integrity and temporal consistency.
- The user explicitly accepted the final picture, BGM treatment, picker transition and complete content.

Detailed technical evidence is recorded in `video/g7a/production/r02-superres-qa.md`.

## Publication boundary

The ordinary GitHub repository contains this sanitized record, the final QA record, the accepted hash and publication guards. It does not contain:

- the full MP4 or compatibility derivatives;
- raw picker recordings or source screenshots;
- narration WAV, music, SFX or review media;
- QA frame dumps, contact sheets or annotation stores;
- local runtimes, caches, credentials, private paths or the private master plan.

The complete MP4 was subsequently used by the user for the separately controlled G7B YouTube step. G7A acceptance itself did not authorize or perform a YouTube/Sites write, access or permission change, hosted-key configuration, or paid action.

## G7B delivery registration

The user uploaded this exact accepted master and scheduled a public YouTube Premiere for `2026-09-01 00:00 +08:00`:

- Watch URL: <https://www.youtube.com/watch?v=jK3OSltoTEQ>
- Video ID: `jK3OSltoTEQ`
- Visible title: `IFC ClashTrace | Deterministic IFC Clash Detection in the Browser`
- Current G7B state: `PASS / USER_FINAL_MEDIA_ACCEPTANCE_SUPERSEDES_YOUTUBE_OPERATIONS`

The user-selected public-Premiere route supersedes the earlier planned `Unlisted` route for this upload. Pre-Premiere checks verified the scheduled page, title, description, hashtags, channel identity, cover, anonymous public metadata and narrow presentation. The user then confirmed that the manually reviewed final source film perfectly matches their personal requirements and explicitly made that acceptance supersede all remaining YouTube operations. Therefore no selectable-caption, Studio, post-Premiere playback/quality or copyright-status verification is claimed. The complete record and controlled English/Simplified Chinese sidecars are in `docs/g7b-youtube-publication.md` and `video/g7b/`.
