# PG-B static GitHub Logo and README asset audit

Status: `PASS`

Latest closed checkpoint: `PG-B · PASS`

Scope date: 2026-08-30 (Asia/Hong_Kong)

The user cancelled the GIF direction and selected one supplied transparent PNG as the GitHub Logo. The repository copies that exact file byte-for-byte; it is not regenerated, retouched, recomposed, or animated.

## Static asset contract

- Path: `docs/assets/brand/ifc-clashtrace-github-logo.png`
- Format: PNG, RGBA, transparent background
- Intrinsic size: 1672 × 941
- Alpha content bounds: `(214, 68)–(1377, 892)`
- File size: 468,496 bytes
- SHA-256: `b56f3a2a3d3ef5d37599a8a84c54cf1a5f56527057db487601d7bced24793142`
- README display width: 520 px with height derived from the intrinsic aspect ratio

The mark depicts two polished wall panels, a muted-teal pipe, a coral collision ring, and a coral inspection bubble. Its transparency lets GitHub supply the surrounding page background without baking in a white or black field.

## Cancelled motion route

GIF usage is cancelled. The README contains no GIF reference, `picture` source, reduced-motion branch, generated animation layers, or motion-build script. The prior animated candidates remain recoverable from Git history but are not publication candidates.

## Accessibility and local verification

- Alt text describes the wall–pipe–collision–inspection meaning without treating the image as text.
- The fixed README width prevents the large intrinsic canvas from dominating the page while remaining responsive on narrow layouts.
- The selected PNG is below the 1 MiB per-file budget.
- The binary scan checks for local paths, EXIF/XMP markers, and account-identifying metadata.
- `docs/assets/brand/asset-manifest.json` freezes the exact dimensions, size, hash, alpha mode, and no-GIF decision.
- `scripts/test-pg-b.ps1` verifies the PNG signature, RGBA color type, dimensions, hash, README path/width/alt text, and absence of the obsolete animation chain.

The local Chromium README harness loaded the exact 1672 × 941 source successfully. It rendered at 520 × 293 in a 1280 × 720 viewport and 328 × 185 in a 360 × 640 viewport, with no horizontal overflow in either case. This is local layout evidence only and does not replace verification on the public GitHub page.

## External verification and mapping

The user authorized the exact 12-path public set. Signed-in Chrome uploaded it directly to public GitHub `main` in a continuous five-commit chain:

1. root files: `9a48c0cc350328c8138440f2bfe60c3b68f5adab` (5 paths);
2. static Logo and manifest: `729298eef672937c3407a7e1545c7998cccd2cf4` (2 paths);
3. development status: `460d803b27bbc239ddce9daa73ccb8afe65b1e62` (1 path);
4. Logo contract and claim ledger: `8c133019642d7d7210a3eaacb230bf9a2a598c40` (2 paths);
5. public regression guards: `b4ce6d56282111c585f757042fa7cfefc057da0e` (2 paths).

The public README loaded the exact 1672 × 941 image, rendered it at 520 × 293 in a 1280 × 720 viewport and 279 × 157 in a 360 × 640 viewport, had no horizontal overflow, and emitted zero browser warnings/errors. The GitHub file page reported the expected static asset and source commit. The 12/12 path mapping and five-commit parent order were verified in Chrome, so PG-B is closed as `PASS`.

No Sites, permission, key, public-access, PG-E, VG, G7, or video action occurred during PG-B closure.
