# IFC ClashTrace

IFC ClashTrace is a deterministic browser/Web IFC feasibility project for traceable MEP-to-structure hard-clash detection. It is a Web micro-prototype, not a runtime LLM agent and not a certified engineering compliance tool.

## Current checkpoint

G1 proves the dual geometry routes. G2 freezes a deterministic eight-case IFC4 acceptance dataset. G3A hardens that frozen contract. G3B now fixes the general `2 mm` meaning as a strict, rotation-invariant structure-interior depth threshold and confines the historical world-axis AABB guard to C04 evidence only.

The frozen G2/G3A contract includes:

- 3 expected `CLASH` cases, 4 expected `CLEAR` cases, and 1 expected `NOT_EVALUATED` case;
- touching, 1 mm sub-tolerance intrusion, clear separation, modeled opening, diagonal pierce, and missing-geometry coverage;
- a human-authored constructive operation ledger, machine-readable ground truth, file hashes, fixed/rebuildable GUIDs, and CC0-1.0 data licensing;
- IfcOpenShell `0.8.5` reference results matching all 8 expected statuses and all 3 expected clash pairs;
- an independent repository-relative path–SHA-256 baseline for all 16 IFC files;
- isolated regeneration that cannot silently rewrite the committed G1/G2 fixtures;
- exact assertions for the approved rule, IFC4 schema, metre unit, shared project coordinates, and `0.002 m` tolerance;
- negative tests that reject rule, schema, unit, coordinate-system, tolerance, status, path, and hash mutations.

The eight cases are a public contract acceptance suite, not a hidden holdout set and not evidence of general real-project accuracy. G3B adds 12 analytic proof fixtures for touching, `1.9/2.0/2.1 mm` boundaries, `3.0/4.0/4.2 mm` thin structures, rotation, oblique crossing, explicit AABB divergence, and failure-closed behavior. See `docs/data-and-licenses.md`, `docs/g3a-contract-hardening.md`, and `docs/g3b-tolerance-semantics.md` for evidence and limitations.

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

## Boundaries through G3B

- G3B defines and validates the general tolerance semantic on a bounded analytic proof family; it does not implement the browser product detector.
- Metre units and a shared project coordinate system.
- Browser penetration distance is not claimed; the field remains unavailable until the later product implementation independently satisfies the G3B reliability boundary.
- IfcOpenShell raw surface intersection reports C04 as an intersection; only C04 may apply its parsed world-bounds overlap guard (`~0.001 m < 0.002 m`). No other G2 or G3B case may inherit AABB classification.
- World-axis AABB may be a future broad-phase candidate filter only; it cannot output a clash, penetration distance, or general clear result.
- G3 remains blocked by G3C and the later core-engine step.
- No formal UI or visual design has started; that remains blocked until the Design Gate.
- No third-party or private project IFC is included in the G2 dataset.

## AI assistance

AI-assisted implementation prompts and human verification are summarized in `PROMPTS.md`. Clash status is always decided by deterministic geometry code.

## License status

Project code is licensed under the MIT License in `LICENSE`. IFC files and accompanying ground-truth data generated by this project are dedicated under CC0-1.0 as described in `data/generated/LICENSE.md`. Third-party dependencies and any future external data retain their own licenses; dependency details are recorded in `docs/g1-feasibility.md`.
