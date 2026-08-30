# PG-B-R2 static GitHub Logo canvas and scale repair

Status: `PG-B PASS / PG-B-R1 PASS / PG-B-R2 LOCAL_REPAIR_CANDIDATE_EXTERNAL_SYNC_PENDING`

Latest closed checkpoint: `PG-B · PASS`

The published Logo v2 remains independently closed as `PG-B-R1 PASS` on public GitHub `main`. The user then found its README presentation visually oversized and authorized a bounded local `PG-B-R2` repair. That repair is technically local only and must not be described as publicly verified until collective authorization and a fresh GitHub render/mapping pass.

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
- `docs/assets/brand/asset-manifest.json` freezes the cropped identity and separates local evidence from the previous public PG-B-R1 record.
- The source-named `ifc-clashtrace-github-logo-v2.png` is not a publication path; only the canonical filename is included in the upload candidate.

The previous public GitHub technical chain runs from root commit `33190860ebd64d1a3f2f2a215a0ffe74318136e4` through tip `b3b03046982011567f1108967dd84672cfad69bd`, with final evidence head `b1727db600ae169eb603c5dd6863b417faef1b9f`. That published PG-B-R1 asset is still the 1024-square, 420 px presentation. It is historical evidence only and must not be reused as proof for the cropped PG-B-R2 candidate.

## Historical v1 evidence

The superseded 1672 × 941 v1 PNG had SHA-256 `b56f3a2a3d3ef5d37599a8a84c54cf1a5f56527057db487601d7bced24793142`. Its desktop/narrow rendering and 12-path mapping through technical-chain tip `b4ce6d56282111c585f757042fa7cfefc057da0e`, plus status-tail parent `6f58bf246fc53cdc5d06a0dd61175cd24d1e3993`, remain historical evidence for v1 only.

## Closure boundary

The prior 29-path update keeps `PG-B-R1` at `PASS`. The cropped PG-B-R2 candidate is intentionally stopped before public release. It may become `PASS` only after the user gives collective publication authorization and the canonical path is rechecked for intrinsic 951 × 679 size, 240 px desktop rendering, responsive narrow rendering, transparency, alt text, layout stability, console output, binary hash, and local-to-remote mapping.

Owner-only Sites version 9 remains the prior functional preflight and version 10 the prior evidence tail. Neither contains this local repair candidate. No access, permission, key, provider, VG/G7, mobile-computation, or video change is authorized by PG-B-R2.
