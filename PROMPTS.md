# Prompt and AI Assistance Record

This repository uses AI assistance for implementation planning and code drafting. Geometry conclusions are accepted only after deterministic local tests; no runtime LLM decides clash status.

## P-001 — G1 feasibility spike

- Date: 2026-08-26
- Goal: prove a minimal IfcOpenShell reference route and a browser/Web IFC route can parse controlled IFC4 geometry, map results to GUIDs, and detect one known pipe-wall hard clash.
- Sanitized prompt: implement G1 within the approved governance plan; keep all work inside the repository; use PowerShell 7 and local Git; do not configure a Git remote or use command-line GitHub access; do not begin formal UI design; record coordinates, units, tolerance, deterministic evidence, failures, privacy, and licenses.
- Human constraints: one core rule (`IfcPipeSegment` against `IfcWall`/`IfcBeam`), reference tolerance `0.002` m, failure-closed behavior, no private project data, no runtime AI classification.
- Adopted output: a generated IFC4 pipe-wall pair, IfcOpenShell reference script, web-ifc/BVH Node script, unstyled Chrome harness, and repeatable PowerShell test.
- Verification: both local detector routes returned the exact fixed GUID pair; desktop Chrome returned `PASS` on initial load and three consecutive reloads with no warning/error logs.
- Human modification and review: dependency versions were pinned, generated data licensing was left pending during G1 and later resolved by user decision D-018, limits were documented, and runtime/declaration mismatches were corrected only after observed failures.
- Rejected or deferred suggestions: no formal UI, branding, extra rule, duct support, approximate penetration distance, or runtime LLM layer was added in G1.

## P-002 — G2 controlled dataset and ground truth

- Date: 2026-08-26
- Goal: create the approved eight-case controlled IFC4 dataset, constructive operation ledger, machine-readable ground truth, hashes, licenses, and independent reference results.
- Sanitized prompt: implement G2 only after the user resolves O-009; use MIT for project code and CC0-1.0 for project-generated IFC and truth data; generate C01-C08 exactly as specified by the approved plan; keep truth independent from detector output; test determinism, touching, 2 mm tolerance, modeled opening, diagonal geometry, and failure-closed behavior; do not implement formal UI.
- Human constraints: one pipe-to-wall/beam rule, metre units, shared coordinates, fixed or rebuildable GUIDs, 3 `CLASH` / 4 `CLEAR` / 1 `NOT_EVALUATED`, no private project data, no hidden claims of generalization.
- Adopted output: a human-authored JSON operation ledger, deterministic IfcOpenShell generator, 16 IFC files, ground-truth records, dataset manifest, reference validator, PowerShell acceptance test, and licensing documentation.
- Verification: two consecutive generations were byte-identical; all manifest hashes matched; IfcOpenShell plus the controlled-suite 2 mm overlap guard matched all eight statuses and all three expected GUID pairs; C08 remained `NOT_EVALUATED` with an explicit missing-geometry diagnostic.
- Human modification and review: a random opening-relation GUID was fixed after the determinism test detected it; raw IfcOpenShell surface intersection for C04 was retained as evidence and not used to rewrite the constructive truth.
- Rejected or deferred suggestions: no product UI, brand styling, browser G3 engine, external dataset, duct rule, hidden holdout claim, or approximate browser penetration distance was added.
