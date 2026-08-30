# PG-B-R2 static GitHub Logo canvas and scale repair

Status: `PG-B PASS / PG-B-R1 PASS / PG-B-R2 PASS`

Latest closed checkpoint: `PG-E · PASS`

The user found the original Logo v2 README presentation visually oversized and authorized a bounded `PG-B-R2` repair. The cropped canonical asset is now publicly verified on GitHub and included in the owner-only Sites version 11 deployment.

## Answer first

The local repair preserves every visible Logo v2 pixel and alpha value without resampling, recoloring, or generative editing. It crops only excess transparent canvas, leaving a 48 px breathing margin, then displays the result at 240 px in the README. GIF usage remains cancelled and no animation path is reintroduced.

## Logo v2 contract

- Canonical path: `docs/assets/brand/ifc-clashtrace-github-logo.png`
- Format: PNG, RGBA, transparent background
- Intrinsic size: 951 × 679
- Alpha content bounds: `(48, 48)–(902, 630)`
- Transparent margin: 48 px on every alpha-content side
- File size: 43,185 bytes
- SHA-256: `07e2d9285312ff9905b300dbd62d1fdce96e20cad2c4d7d797bde53f774862fb`
- README display width: 240 px with height derived from the intrinsic aspect ratio
- Crop operation: source rectangle `(36, 172)–(986, 850)` from the 1024-square source; PNG re-encoded losslessly with no visible-pixel modification or image generation

The mark still depicts the same metallic pipe crossing layered light/dark wall panels, with a framed clash marker and inspection alert. Only unused transparent border area is removed.

## Local and public verification

- The binary signature, RGBA color type, intrinsic dimensions, alpha bounds, file size, SHA-256, metadata markers, README path, width, and alt text are guarded by `scripts/test-pg-b.ps1`.
- Local Chromium renders the candidate at 240 × 171.3542 at both 1280 × 720 and 360 × 640; natural size remains 951 × 679, document widths match their viewports, and console warnings/errors are zero.
- The immutable GitHub README at technical head `3038d431157c0e1eb1e1f2b4a9870ddb01609921` reports natural size 951 × 679 and renders it at 240 × 171.354 px; console warnings/errors are zero.
- All 30 audited public paths, including the PNG bytes, match the local candidate. A brief stale `raw/main` CDN response is not used as evidence; the immutable commit render and byte mapping are authoritative.
- `docs/assets/brand/asset-manifest.json` freezes the cropped identity and separates the final PG-B-R2 evidence from previous PG-B-R1 history.
- The source-named `ifc-clashtrace-github-logo-v2.png` is not a publication path; only the canonical filename is included in the upload candidate.

The previous public GitHub technical chain from `33190860ebd64d1a3f2f2a215a0ffe74318136e4` through `b1727db600ae169eb603c5dd6863b417faef1b9f` remains historical PG-B-R1 evidence only; it is not reused as proof for PG-B-R2.

## Historical v1 evidence

The superseded 1672 × 941 v1 PNG had SHA-256 `b56f3a2a3d3ef5d37599a8a84c54cf1a5f56527057db487601d7bced24793142`. Its desktop/narrow rendering and 12-path mapping through technical-chain tip `b4ce6d56282111c585f757042fa7cfefc057da0e`, plus status-tail parent `6f58bf246fc53cdc5d06a0dd61175cd24d1e3993`, remain historical evidence for v1 only.

## Closure boundary

The user gave collective publication authorization. The canonical path passed intrinsic 951 × 679 size, 240 px desktop rendering, transparency, alt text, console, binary hash, and 30/30 local-to-remote mapping checks, so `PG-B-R2` is `PASS`.

Owner-only Sites version 11 contains the repair. Access remains restricted to one owner; no access, permission, key, provider, VG/G7, mobile-computation, or video change was introduced by PG-B-R2.
