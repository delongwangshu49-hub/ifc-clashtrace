# PG-B static GitHub Logo and README asset audit

Status: `TECH_PASS_EXTERNAL_SYNC_PENDING`

Latest closed checkpoint: `PG-C · PASS`

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

## External stop gate

Before PG-B can become `PASS`:

1. obtain action-time authorization for the exact public GitHub write set;
2. upload only that authorized set through the signed-in GitHub webpage flow;
3. verify the real GitHub README at desktop and narrow widths for correct transparency, scale, alt text, layout stability, and no broken source;
4. record the verified remote SHA, time, file scope, and local-to-remote mapping.

No Sites, permission, key, public-access, PG-E, VG, G7, or video action is authorized by this local PG-B refinement.
