# G3C 50 mm Clearance Semantics and Evidence

## Gate result

G3C validates `MEP_STRUCTURE_CLEARANCE_WARNING_V1` on a separate nine-case controlled suite. It does not modify the frozen G2 hard-clash truth and does not implement the later browser product engine or any formal UI.

The rule is limited to `IfcPipeSegment` paired with `IfcWall` or `IfcBeam`, in metres and verified shared project coordinates:

- an upstream `CLASH` suppresses the clearance record for the same pair;
- otherwise, a certified minimum surface clearance `0 m <= d < 0.05 m` is `WARNING`;
- `d >= 0.05 m` is `CLEAR`, so exactly `50 mm` is not a warning;
- unavailable geometry, unverified shared coordinates, or an unsupported/unreliable distance certificate is `NOT_EVALUATED`, never `CLEAR`;
- world-axis AABB gap or overlap is not permitted to classify clearance or populate the measured distance.

## Controlled analytic method

The primary evaluator uses exact decimal arithmetic after checking the authored local coordinates against the generated world coordinates. Its supported certificate families are intentionally narrow:

1. a finite circular cylinder parallel to a certified face of a closed oriented box, with its axis projection inside that face footprint; and
2. a wall-normal finite circular cylinder passing through a rectangular opening frame, where the minimum opening-edge clearance is certified in the opening plane.

For the first family, surface clearance is the face-to-axis distance minus the cylinder radius. For the second, it is the smaller of the two radial margins to the modeled opening edges. These formulas are rotation invariant because evaluation occurs in the verified structure-local frame. A case outside either certificate family must fail closed.

The classification comparison has no epsilon deadband: the authored analytic value is compared as `Decimal` and exactly `0.05 m` is `CLEAR`. The independent triangle-mesh route uses a `1e-7 m` agreement tolerance only to account for Three.js `BufferGeometry` Float32 coordinates and cylindrical tessellation. That mesh agreement tolerance does not change or soften the rule threshold.

## Fixtures and expected records

| Case | Geometry purpose | Expected clearance result |
|---|---|---|
| G3C01 | touching surfaces | `WARNING`, `0 mm` |
| G3C02 | below threshold | `WARNING`, `49 mm` |
| G3C03 | exact threshold | `CLEAR`, `50 mm` |
| G3C04 | above threshold, `IfcBeam` | `CLEAR`, `51 mm` |
| G3C05 | confirmed hard clash | no clearance record |
| G3C06 | rotated structure and oblique pipe | `WARNING`, `30 mm` |
| G3C07 | pipe through a modeled rectangular opening | `WARNING`, `40 mm` |
| G3C08 | missing pipe geometry | `NOT_EVALUATED` |
| G3C09 | shared coordinates not established | `NOT_EVALUATED` |

The human-authored operation ledger is the source of expected status and distance. The generator creates one deterministic geometry artifact per case and a frozen repository-relative path–SHA-256 baseline. Tests generate the complete set twice in unique ignored roots, compare every artifact and the baseline byte for byte, reject rule-ID, threshold, artifact-hash, and expected-status mutations, and clean the roots in a guarded `finally` block. Detector output is never used to rewrite the expected records.

## Independent reference

The independent route constructs separate `three` meshes and uses `three-mesh-bvh 0.9.14` triangle-to-triangle surface distance. It confirms all nine expected outcomes, including physical intersection for the suppressed hard-clash pair and the final modeled opening surfaces rather than the wall's uncut outer box.

The two routes therefore have different numerical representations:

- primary: exact constructive analytic certificate with decimal threshold classification;
- reference: tessellated cylinder and triangle surface distance with bounded Float32/tessellation agreement tolerance.

Neither route uses world-axis AABB separation as a clearance value.

## Clearance Warning Record contract

Each emitted controlled record contains:

- stable record ID and `rule_id`;
- `WARNING`, `CLEAR`, or `NOT_EVALUATED`;
- both element roles, entity types, stable GUIDs, and names;
- measured and exact clearance when reliable, otherwise `null`;
- `threshold_m=0.05` and `length_unit=metre`;
- detector, certificate, repository-relative artifact path, artifact SHA-256, and algorithm boundary;
- a diagnostic for every failure-closed result.

G3C05 deliberately emits no record because the pair already has authoritative `CLASH` status. This prevents the same pair from appearing as both a hard clash and a clearance warning.

## Reproduce

After the project-local G1 runtimes are installed:

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\test-g3c.ps1
pwsh -NoLogo -NoProfile -File .\scripts\audit-g3c.ps1
```

Local generated detector outputs remain under the ignored `outputs/local-only/` tree.

## Boundaries

- These nine cases are a public contract acceptance suite, not a hidden holdout and not evidence of general real-project accuracy.
- The JSON geometry artifacts are controlled G3C proof inputs, not a substitute for later IFC parsing and browser-product integration.
- G3C does not claim arbitrary mesh topology validation, automatic coordinate registration, or a general-purpose CAD distance engine.
- The G3 browser core remains a separate step even after this Gate passes.
- Design Gate, formal UI, AI integration, deployment, and video work remain outside G3C.
