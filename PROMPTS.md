# Prompt and AI Assistance Record

This repository uses AI assistance for implementation planning and code drafting. Geometry conclusions are accepted only after deterministic local tests; no runtime LLM decides clash status.

## P-001 — G1 feasibility spike

- Date: 2026-08-26
- Goal: prove a minimal IfcOpenShell reference route and a browser/Web IFC route can parse controlled IFC4 geometry, map results to GUIDs, and detect one known pipe-wall hard clash.
- Sanitized prompt: implement G1 within the approved governance plan; keep all work inside the repository; use PowerShell 7 and local Git; do not configure a Git remote or use command-line GitHub access; do not begin formal UI design; record coordinates, units, tolerance, deterministic evidence, failures, privacy, and licenses.
- Human constraints: one core rule (`IfcPipeSegment` against `IfcWall`/`IfcBeam`), reference tolerance `0.002` m, failure-closed behavior, no private project data, no runtime AI classification.
- Adopted output: a generated IFC4 pipe-wall pair, IfcOpenShell reference script, web-ifc/BVH Node script, unstyled Chrome harness, and repeatable PowerShell test.
- Verification: both local detector routes returned the exact fixed GUID pair; desktop Chrome returned `PASS` on initial load and three consecutive reloads with no warning/error logs.
- Human modification and review: dependency versions were pinned, generated data licensing was left pending user decision, limits were documented, and runtime/declaration mismatches were corrected only after observed failures.
- Rejected or deferred suggestions: no formal UI, branding, extra rule, duct support, approximate penetration distance, or runtime LLM layer was added in G1.
