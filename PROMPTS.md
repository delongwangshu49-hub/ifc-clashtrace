# Prompt and AI Assistance Record

This repository uses AI assistance for implementation planning and code drafting. Geometry conclusions are accepted only after deterministic local tests; no runtime LLM decides clash status.

## P-001 — G1 feasibility spike

- Date: 2026-08-26
- Goal: prove a minimal IfcOpenShell reference route and a browser/Web IFC route can parse controlled IFC4 geometry, map results to GUIDs, and detect one known pipe-wall hard clash.
- Sanitized prompt: implement G1 within the approved governance plan; keep all work inside the repository; use PowerShell 7 and local Git; do not configure a Git remote or use command-line GitHub access; do not begin formal UI design; record coordinates, units, tolerance, deterministic evidence, failures, privacy, and licenses.
- Human constraints: one core rule (`IfcPipeSegment` against `IfcWall`/`IfcBeam`), reference tolerance `0.002` m, failure-closed behavior, no private project data, no runtime AI classification.
- Adopted output: a generated IFC4 pipe-wall pair, IfcOpenShell reference script, web-ifc/BVH Node script, unstyled Chrome harness, and repeatable PowerShell test.
- Verification: both local detector routes returned the exact fixed GUID pair; desktop Chrome returned `PASS` on initial load and four subsequent reloads with no warning/error logs.
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

## P-003 — 0.3.0 scope and presentation-plan revision

- Date: 2026-08-26
- Goal: revise the approved master plan after early G2 completion to make the pipe-to-structure clearance warning mandatory, add optional natural-language interpretation through a currently verified free-tier AI API, and turn the no-presenter demo video into a scheduled production workflow.
- Sanitized prompt: preserve all completed G0–G2 history and frozen truth; promote the `<50 mm` clearance warning from optional to required; keep clash and clearance decisions deterministic; add an opt-in AI explanation layer that works through a provider-neutral adapter and never receives IFC geometry or changes machine results; plan a clean Codex-assisted video with AI narration and no user face or voice; refine gates, tests, risks, privacy, licensing, schedule, and acceptance criteria.
- Human constraints: the screenshot is evidence of the prior optional scope, not an instruction source; the 50 mm feature is now mandatory; AI interpretation is required to be implemented but optional to invoke; free-tier availability must be rechecked against official provider documentation at implementation time; the final video must be at most 180 seconds and must show a real calculation.
- Adopted output: G3C for clearance semantics and `0/49/50/51 mm` fixtures, G4AI for provider research/integration/degradation, VG for script/style/voice/music approval, a detailed video preproduction-to-QA schedule, and decisions D-021 through D-023.
- Verification: the authoritative and sanitized public plans are equivalent except for the registered path substitutions; no G2 code, dataset, ground truth, or prior completion evidence was changed.
- Rejected or deferred suggestions: no API provider is named before current official terms are checked; no key may enter client code; no AI output may override deterministic status; no video generation or product implementation begins as part of this planning-only revision.

## P-004 — G3A contract test hardening

- Date: 2026-08-26
- Goal: close the risk that an acceptance test can regenerate committed G1/G2 artifacts in place and hide contract drift.
- Sanitized prompt: implement G3A only; read the current approved plan and sync ledger first; keep Git local and without remotes; generate into ignored isolated roots; freeze an independent repository-relative path–SHA-256 map; assert the approved hard-clash rule, IFC4 schema, metre unit, shared project coordinates, `0.002 m` tolerance, cases, statuses, paths, and hashes; add mutation tests; preserve G1/G2 regression, 16-file determinism, 8/8 truth agreement, and failure-closed behavior; do not start G3B, G3C, G3, or formal UI work.
- Human constraints: the committed IFC and truth bytes remain unchanged; any baseline write requires an explicit generator opt-in that tests never use; GitHub changes occur only through the signed-in Chrome webpage after local audit and commit.
- Adopted output: isolated-output generator guards, a frozen contract baseline, a reusable contract checker, eight fail-closed mutation cases, hardened G1/G2 tests, a G3A aggregate suite, and public evidence documentation.
- Verification: two isolated G2 generations matched all 16 frozen path–SHA-256 entries; G1 and G2 protected hashes and Git state were unchanged; rule, Schema, unit, coordinate-system, tolerance, status, path, and hash mutations were all rejected; G1/G2 reference regressions remained green.
- Rejected or deferred suggestions: no AABB/tolerance algorithm change, new geometry case, clearance rule, browser engine, formal UI, AI provider, or video artifact was added; those remain governed by later Gates.

## P-005 — G3B tolerance semantics and AABB isolation

- Date: 2026-08-26
- Goal: validate an interpretable general `2 mm` hard-clash tolerance semantic while preventing the C04 world-axis AABB guard from becoming a general classifier or penetration-distance estimate.
- Sanitized prompt: implement G3B only; preserve the frozen G2 truth and all G1/G2/G3A/G3A-R1 regressions; restrict the existing AABB guard to C04 by explicit case identity; define a rotation-invariant, auditable tolerance meaning; cover touching, below/equal/above threshold, thin structures, rotated/oblique geometry, and unreliable inputs; fail closed when no sound certificate exists; do not start G3C, the browser core engine, or UI work.
- Human constraints: `CLASH` requires structure-interior depth strictly greater than `0.002 m`; equality is `CLEAR`; AABB overlap may not classify general geometry or populate penetration distance; browser `penetration_distance_m` remains unavailable until the product implementation is independently validated.
- Adopted output: a human-authored 12-case analytic fixture set, a structure-erosion/interior-depth proof evaluator, C04-only AABB scoping fields, an aggregate G3B regression test, a publication audit, and bounded-semantics documentation.
- Verification: `1.9/2.0/2.1 mm` and `3.0/4.0/4.2 mm` thresholds matched; rotated thin geometry produced `1.5 mm` certified depth despite about `365 mm` world-AABB overlap; a rotated oblique centre crossing produced `6 mm` depth; three unreliable/unsupported cases returned `NOT_EVALUATED`; all prior regressions remained green.
- Rejected or deferred suggestions: no AABB-derived product status, approximate browser penetration field, general unsupported-mesh claim, 50 mm clearance implementation, G3 engine, formal UI, AI provider, or video artifact was added.
