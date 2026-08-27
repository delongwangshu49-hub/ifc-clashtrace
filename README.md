# IFC ClashTrace

IFC ClashTrace is a deterministic browser/Web IFC feasibility project for traceable MEP-to-structure hard-clash detection. It is a Web micro-prototype, not a runtime LLM agent and not a certified engineering compliance tool.

## Current checkpoint

G1 proves the dual geometry routes. G2 freezes a deterministic eight-case IFC4 acceptance dataset. G3A hardens that frozen contract. G3B defines a strict, rotation-invariant structure-interior depth threshold, fails closed when the `2 mm` erosion core is empty or degenerate, and confines the historical world-axis AABB guard to C04 evidence only. G3C adds a separate, deterministic `<50 mm` pipe-to-structure surface-clearance contract with hard-clash deduplication and failure-closed records. G3C-R1 also requires both evaluator routes to fail closed on an unknown upstream hard-clash status and prevents generated artifact paths from escaping their selected output root. G3 integrates both deterministic rules into a browser-compatible two-IFC core using `web-ifc` and `three-mesh-bvh`.

The R4 Design Gate package in `docs/design-brief.md` is user-approved. It freezes the three-page and preference contracts, editorial technology as the earth-tone mainstream profile, a restrained orange-red accent, unified sans typography, disciplined radii, a centered homepage brand lockup, widened icon–wordmark safe space, and an original wall–pipe–collision–dialog reveal. No formal UI, G4 slice, runtime AI, deployment, or video work has started; the public checkpoint and local–remote evidence mapping are tracked in `PROGRESS_SYNC.md`.

The frozen G2/G3A contract includes:

- 3 expected `CLASH` cases, 4 expected `CLEAR` cases, and 1 expected `NOT_EVALUATED` case;
- touching, 1 mm sub-tolerance intrusion, clear separation, modeled opening, diagonal pierce, and missing-geometry coverage;
- a human-authored constructive operation ledger, machine-readable ground truth, file hashes, fixed/rebuildable GUIDs, and CC0-1.0 data licensing;
- IfcOpenShell `0.8.5` reference results matching all 8 expected statuses and all 3 expected clash pairs;
- an independent repository-relative path–SHA-256 baseline for all 16 IFC files;
- isolated regeneration that cannot silently rewrite the committed G1/G2 fixtures;
- exact assertions for the approved rule, IFC4 schema, metre unit, shared project coordinates, and `0.002 m` tolerance;
- negative tests that reject rule, schema, unit, coordinate-system, tolerance, status, path, and hash mutations.

The eight cases are a public contract acceptance suite, not a hidden holdout set and not evidence of general real-project accuracy. G3B adds 13 analytic proof fixtures for touching, `1.9/2.0/2.1 mm` plus a `0.5 nm`-above-threshold regression, `3.0/4.0/4.2 mm` thin structures, rotation, oblique crossing, explicit AABB divergence, and failure-closed behavior. G3B10/G3B11 consume caller-supplied reliability preconditions; they do not themselves validate topology or coordinate registration. G3C adds nine independent clearance cases covering `0/49/50/51 mm`, a hard-clash-suppressed pair, rotated oblique placement, a modeled opening, missing geometry, and unverified coordinates. G3 matches all eight frozen hard-clash statuses in Node and current desktop Chrome, suppresses all three confirmed hard clashes from clearance output, and fails closed on malformed IFC, unverified coordinates, non-finite or non-frozen v1 thresholds, missing/partial/invalid geometry, or unsupported intersecting geometry. See `docs/data-and-licenses.md`, `docs/g3a-contract-hardening.md`, `docs/g3b-tolerance-semantics.md`, `docs/g3c-clearance-semantics.md`, and `docs/g3-core-engine.md` for evidence and limitations.

## Reproduce G1 on Windows

Requirements: PowerShell 7 and Python 3.13 on Windows x64.

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\setup-g1.ps1
pwsh -NoLogo -NoProfile -File .\scripts\test-g1.ps1
```

The setup script downloads Node.js `24.19.0` LTS from the official distribution, verifies its SHA-256 against the official manifest, and installs all dependencies into ignored project-local directories.

To run the unstyled browser-only technical harness:

```powershell
.\.tools\node-v24.19.0-win-x64\node.exe .\scripts\g1-static-server.mjs
```

Open `http://127.0.0.1:4173/spikes/g1-browser/` in desktop Chrome. A successful run displays `PASS`, the two IFC4 schemas, and the mapped GUID pair.

## Reproduce G2 on Windows

After completing the G1 setup command above, run:

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\test-g2.ps1
```

This regenerates all 16 IFC files twice, verifies byte-for-byte determinism and manifest hashes, and compares all eight records with the independent IfcOpenShell reference route. Local detector outputs are written under the ignored `outputs/local-only/` directory.

Generation now occurs only beneath ignored, isolated output roots. Writing to the committed repository baseline requires the generator's explicit `--allow-baseline-write` opt-in and is never used by tests.

## Reproduce G3A on Windows

After completing the G1 setup command, run the full contract-hardening suite:

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\test-g3a.ps1
```

The suite runs the G1 and G2 regressions, validates the frozen 16-file path–SHA-256 map against both the committed data and two isolated generations, rejects eight contract mutations, and asserts that protected baseline hashes and Git worktree state do not change.

## Reproduce G3B on Windows

After completing the G1 setup command, run:

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\test-g3b.ps1
```

The suite proves the bounded interior-depth semantic, verifies that equality at `2 mm` is `CLEAR`, demonstrates that rotated world-axis AABB overlap cannot stand in for depth, checks three `NOT_EVALUATED` paths, and reruns the full G1/G2/G3A/G3A-R1 regression chain.

## Reproduce G3C on Windows

After completing the G1 setup command, run:

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\test-g3c.ps1
```

The suite regenerates nine controlled clearance artifacts twice in isolated roots, verifies their repository-relative SHA-256 baseline, compares the exact analytic rule against an independent `three-mesh-bvh` triangle-surface reference, checks the strict 50 mm boundary and hard-clash deduplication, rejects unknown upstream status and path-traversal mutations, and reruns every G1/G2/G3A/G3B regression.

## Reproduce G3 on Windows

After completing the G1 setup command, run the integrated browser-core suite:

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\test-g3.ps1
```

The suite opens each frozen G2 MEP/structure pair through `web-ifc`, filters `IfcPipeSegment` against `IfcWall`/`IfcBeam`, evaluates the bounded hard-clash certificate, emits Clash Records and Clearance Warning Records, checks 12 failure-closed guards plus deterministic repetition, and reruns the full G1 through G3C chain.

For the unstyled current-Chrome runtime harness, start the existing local server and open the G3 path:

```powershell
.\.tools\node-v24.19.0-win-x64\node.exe .\scripts\g1-static-server.mjs
```

Open `http://127.0.0.1:4173/spikes/g3-browser/`. A passing run reports all eight exact frozen statuses. This is an automated technical harness, not product UI.

## Boundaries through G3

- G3 supports exact IFC4 files with unprefixed metre units and an explicitly established shared project coordinate system; both models must expose the same valid web-ifc coordination transform.
- The v1 rule IDs require the exact finite `0.002 m` hard-clash and `0.05 m` clearance constants; caller-supplied alternatives fail closed instead of silently changing rule meaning.
- The hard-clash classifier requires finite, indexed, closed two-manifold tessellations and certifies straight finite pipe axes against reliable structure meshes. It samples structure-interior surface depth at at most `0.5 mm` intervals, requires depth strictly greater than `2 mm`, and fails closed when an intersecting configuration is outside that certificate family.
- Each consumed placed-geometry part must validate. Degenerate faces may be skipped only when a non-degenerate closed surface remains; an all-degenerate part, an invalid index buffer, or one failed part among otherwise valid parts makes the affected pair `NOT_EVALUATED`.
- Browser penetration distance is not claimed; `penetration_distance_m` remains `null`. The certified maximum structure-interior depth is evidence for the approved status, not a general physical penetration measure.
- IfcOpenShell raw surface intersection reports C04 as an intersection; only C04 may apply its parsed world-bounds overlap guard (`~0.001 m < 0.002 m`). No other G2 or G3B case may inherit AABB classification.
- World-axis AABB may be a future broad-phase candidate filter only; it cannot output a clash, penetration distance, or general clear result.
- G3 uses triangle-surface minimum distance for the clearance rule only after an authoritative hard-clash `CLEAR`; `CLASH` suppresses the clearance record and `NOT_EVALUATED` propagates failure closing.
- The exact analytic classifier has no epsilon deadband. The independent Float32 triangle-mesh route uses a `1e-7 m` agreement tolerance only for reference comparison, not for the 50 mm rule threshold.
- Confirmed hard-clash pairs emit no clearance record; unreliable geometry or coordinates emit `NOT_EVALUATED` with a diagnostic.
- Any upstream hard-clash status other than authoritative `CLEAR` or `CLASH` fails closed in both evaluator routes; generated case IDs and resolved artifact paths are containment-guarded.
- The eight G2 cases and nine G3C cases are controlled acceptance evidence, not a claim of arbitrary IFC/exporter or real-project accuracy.
- G3 is the completed deterministic core only; file-selection UX, results UI, 3D review interaction, and visual design remain outside this Gate.
- DG R4 visual direction is user-approved; no formal UI implementation has started, and implementation remains blocked until a separately authorized G4.
- No third-party or private project IFC is included in the G2 dataset.

## AI assistance

AI-assisted implementation prompts and human verification are summarized in `PROMPTS.md`. Clash status is always decided by deterministic geometry code.

## Design Gate review

Run the local DG contract and publication audit with PowerShell 7:

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\test-dg.ps1
pwsh -NoLogo -NoProfile -File .\scripts\audit-dg.ps1
```

These checks validate the required review sections, research links, low-fidelity SVG contract, absence of formal UI/deployment files, unchanged G3 regression, and sanitized DG publication list. Passing them alone does not approve a design; DG R4 received separate explicit user approval, and later Gates still require separate authorization.

## License status

Project code is licensed under the MIT License in `LICENSE`. IFC files and accompanying ground-truth data generated by this project are dedicated under CC0-1.0 as described in `data/generated/LICENSE.md`. Third-party dependencies and any future external data retain their own licenses; dependency details are recorded in `docs/g1-feasibility.md`.
