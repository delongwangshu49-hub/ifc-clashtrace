# PG-B-R1 static GitHub Logo v2 update

Status: `PG-B PASS / PG-B-R1 TECH_PASS_EXTERNAL_SYNC_PENDING`

Latest closed checkpoint: `PG-B · PASS`

The original PG-B publication remains historical `PASS`. This document defines a local replacement candidate only; it does not claim that Logo v2 is already on GitHub or verified there.

## Answer first

The user-selected Logo v2 is copied byte-for-byte to the existing canonical README path, so GitHub needs one binary replacement rather than a new duplicate asset. The README displays it at 420 px with updated alternative text. GIF usage is cancelled and no animation path is reintroduced.

## Logo v2 contract

- Canonical path: `docs/assets/brand/ifc-clashtrace-github-logo.png`
- Format: PNG, RGBA, transparent background
- Intrinsic size: 1024 × 1024
- Alpha content bounds: `(84, 220)–(938, 802)`
- File size: 45,662 bytes
- SHA-256: `2da1f6c80b25d85495ffcd4932424ef7316a1be5d2334ceca941af13932de597`
- README display width: 420 px with height derived from the intrinsic aspect ratio
- Copy operation: binary identity only; no re-encoding, cropping, recoloring, or image generation

The mark depicts a metallic pipe crossing layered light/dark wall panels, with a framed clash marker and inspection alert. The transparent 1024-square canvas is preserved exactly as supplied.

## Local verification

- The binary signature, RGBA color type, intrinsic dimensions, alpha bounds, file size, SHA-256, metadata markers, README path, width, and alt text are guarded by `scripts/test-pg-b.ps1`.
- At 1280 × 720 the README image candidate renders at 420 × 420; at 360 × 640 it scales to 328 × 328 without horizontal overflow.
- `docs/assets/brand/asset-manifest.json` freezes the v2 identity and explicitly marks external synchronization as pending.
- The source-named `ifc-clashtrace-github-logo-v2.png` is not a publication path; only the canonical filename is included in the upload candidate.

The public test validates the frozen local evidence record only. It does not perform a live GitHub mapping check.

## Historical v1 evidence

The current public README still carries the previously verified 1672 × 941 v1 PNG with SHA-256 `b56f3a2a3d3ef5d37599a8a84c54cf1a5f56527057db487601d7bced24793142`. Its desktop/narrow rendering and 12-path mapping through technical-chain tip `b4ce6d56282111c585f757042fa7cfefc057da0e`, plus status-tail parent `6f58bf246fc53cdc5d06a0dd61175cd24d1e3993`, remain historical evidence for v1 only and must not be presented as verification of v2.

## External stop gate

Logo v2 may be uploaded only with the exact collectively authorized online-update set. After upload, GitHub must be rechecked for natural 1024 × 1024 size, 420 px desktop rendering, responsive narrow rendering, transparency, alt text, layout stability, console output, canonical binary hash, and local-to-remote mapping. Until then `PG-B-R1` remains `TECH_PASS_EXTERNAL_SYNC_PENDING`.

No GitHub/Sites write, deployment, access/permission/key change, provider request, VG/G7, mobile computation, or video action is authorized by this local candidate.
