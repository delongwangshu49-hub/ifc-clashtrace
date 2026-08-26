# G3B tolerance semantics and AABB isolation

Status: `TECH_PASS_SYNC_PENDING`

## Decision

The hard-clash tolerance is interpreted as a strict interior-depth threshold relative to the final structure solid.

For pipe solid `P`, final structure solid `S`, and tolerance `t = 0.002 m`, define the interior depth of a point `x` inside `S` as its minimum Euclidean distance to the boundary of `S`. Let `D` be the greatest such depth attained by any point in `P ∩ S`.

- `D > t`: `CLASH`;
- no volumetric intersection, touching only, or a certified `D <= t`: `CLEAR`;
- missing closed-solid topology, unverified shared coordinates, numerical unreliability, or no complete certificate: `NOT_EVALUATED`.

Equivalently, a pair clashes only when the pipe solid intersects the structure solid after the structure is eroded inward by `2 mm`. Equality is not a clash. The semantic is asymmetric by design: the structure is the tolerance-bearing target and the pipe is the penetrating solid.

This definition is invariant under rigid rotation and translation. It does not derive a distance from world-axis bounds.

## AABB boundary

World-axis AABB overlap may later be used only as a conservative broad-phase candidate filter. It may not:

- classify an arbitrary pair as `CLASH` or `CLEAR`;
- populate a penetration-distance field;
- stand in for Euclidean point-to-boundary depth;
- override a failed or unsupported geometry evaluation.

The historical G2 C04 path remains a deliberately narrow exception: its approximately `1 mm` minimum AABB overlap is retained only as evidence for that authored fixture. `scripts/g2-reference-clash.py` now checks `case_id == C04` before applying the guard and emits `aabb_guard_applied` plus `classification_path`. Every other G2 case must report no AABB guard and no AABB-derived overlap value.

## Bounded analytic proof

`scripts/g3b-tolerance-proof.py` proves the semantic on a deliberately bounded primitive family:

- a closed convex oriented box for the final wall/beam solid;
- a finite circular cylinder for the pipe;
- a certified face-normal centreline arrangement, or an arbitrary oblique centreline that crosses the oriented-box centre.

For a centre crossing, the exact maximum interior depth is the oriented box inradius. For a face-normal centred pipe, the exact depth follows from the finite axis interval and the nearest structure face. Both certificates operate in structure-local coordinates after a world transform, so rigid rotations do not change the result. If neither certificate applies, the proof returns `NOT_EVALUATED`; it does not estimate.

This proof is reference evidence for G3B, not the G3 browser product engine. A later general mesh implementation must establish a closed final solid and an auditable surface-distance/interior test, or retain the same failure-closed boundary.

## Acceptance fixtures

| Case | Geometry | Certified depth | Expected |
|---|---|---:|---|
| G3B01 | cap touching | `0 mm` | `CLEAR` |
| G3B02 | cap intrusion below threshold | `1.9 mm` | `CLEAR` |
| G3B03 | cap intrusion at threshold | `2.0 mm` | `CLEAR` |
| G3B04 | cap intrusion above threshold | `2.1 mm` | `CLASH` |
| G3B05 | full pierce through `3.0 mm` thin structure | `1.5 mm` | `CLEAR` |
| G3B06 | full pierce through `4.0 mm` thin structure | `2.0 mm` | `CLEAR` |
| G3B07 | full pierce through `4.2 mm` thin structure | `2.1 mm` | `CLASH` |
| G3B08 | rigidly rotated `3.0 mm` thin structure | `1.5 mm` | `CLEAR` |
| G3B09 | rotated structure and oblique centre-crossing pipe | `6.0 mm` | `CLASH` |
| G3B10 | no reliable closed/manifold interior | unavailable | `NOT_EVALUATED` |
| G3B11 | shared project coordinates not verified | unavailable | `NOT_EVALUATED` |
| G3B12 | skew layout outside the analytic certificate family | unavailable | `NOT_EVALUATED` |

G3B08 is the explicit AABB counterexample. Its exact interior depth is `0.0015 m`, while its minimum world-axis AABB overlap is approximately `0.36544 m`. An AABB-derived classification would therefore present gross false precision.

## Verification

Run:

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\test-g3b.ps1
pwsh -NoLogo -NoProfile -File .\scripts\audit-g3b.ps1
```

The suite requires:

- all 12 G3B statuses and exact analytic depths to match the human-authored fixture file;
- strict below/equal/above threshold behavior;
- thin, rotated, and oblique coverage;
- three failure-closed results with diagnostics;
- C04-only AABB scope and zero AABB classification in G3B;
- unchanged G1/G2/G3A/G3A-R1 regressions, frozen IFC hashes, truth, cleanup behavior, and Git state;
- zero public-candidate absolute-path, personal-email, credential, or over-limit-file findings;
- zero Git remotes and unchanged dependency/license scope.

The initial G0A audit script is a historical baseline audit and is not stage-invariant: when rerun after project-local ignored runtimes were installed, its whole-workspace large-file count fails by design. G0A history, its five-file commit tree, zero-remotes rule, and three-file sanitized publication candidate are checked separately; current publication safety is governed by the G3B audit.

## Boundary after G3B

G3B does not implement the browser detector, clearance rule, or UI. Browser `penetration_distance_m` remains `null` until a product implementation independently satisfies this semantic and reliability boundary. G3 remains blocked by G3C and the later G3 engine step.
