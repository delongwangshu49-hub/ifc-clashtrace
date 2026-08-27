# G3B tolerance semantics and AABB isolation

Status: `PASS` (G3B-R1)

## Decision

The hard-clash tolerance is interpreted as a strict interior-depth threshold relative to the final structure solid.

For pipe solid `P`, final structure solid `S`, and tolerance `t = 0.002 m`, define the interior depth of a point `x` inside `S` as its minimum Euclidean distance to the boundary of `S`. Let `D` be the greatest such depth attained by any point in `P ∩ S`.

- `D > t` with a non-degenerate eroded structure core: `CLASH`;
- no volumetric intersection, touching only, or a certified `D <= t` with a non-degenerate erosion core: `CLEAR`;
- a volumetric intersection where the structure erosion core is empty or degenerate: `NOT_EVALUATED`;
- missing closed-solid topology, unverified shared coordinates, numerical unreliability, or no complete certificate: `NOT_EVALUATED`.

Equivalently, a pair clashes only when the pipe solid intersects the structure solid after the structure is eroded inward by `2 mm`. Equality is not a clash where a non-degenerate eroded core exists. If erosion removes or collapses the whole structure while a volumetric intersection remains, this semantic cannot safely distinguish a tolerated intrusion from a full pierce, so it fails closed instead of reporting `CLEAR`. The semantic is asymmetric by design: the structure is the tolerance-bearing target and the pipe is the penetrating solid.

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

For a centre crossing, the exact maximum interior depth is the oriented box inradius. For a face-normal centred pipe, the exact depth follows from the finite axis interval and the nearest structure face. Classification uses decimal arithmetic on the authored analytic coordinates, without an epsilon deadband, and emits `maximum_interior_depth_exact_m` as a decimal string alongside the display-oriented numeric value; a separately checked world/local round trip must remain within the certificate tolerance. Both certificates therefore remain invariant under the fixture's rigid transforms. If neither certificate applies, the proof returns `NOT_EVALUATED`; it does not estimate.

G3B10 and G3B11 verify how the evaluator responds to caller-supplied/prevalidated reliability signals. They do not implement or prove general mesh-topology validation or coordinate registration. G3B12 independently exercises the unsupported analytic-certificate path.

This proof is reference evidence for G3B, not the G3 browser product engine. A later general mesh implementation must establish a closed final solid and an auditable surface-distance/interior test, or retain the same failure-closed boundary.

## Acceptance fixtures

| Case | Geometry | Certified depth | Expected |
|---|---|---:|---|
| G3B01 | cap touching | `0 mm` | `CLEAR` |
| G3B02 | cap intrusion below threshold | `1.9 mm` | `CLEAR` |
| G3B03 | cap intrusion at threshold | `2.0 mm` | `CLEAR` |
| G3B04 | cap intrusion above threshold | `2.1 mm` | `CLASH` |
| G3B05 | full pierce through `3.0 mm` thin structure; empty erosion core | `1.5 mm` | `NOT_EVALUATED` |
| G3B06 | full pierce through `4.0 mm` thin structure; degenerate erosion core | `2.0 mm` | `NOT_EVALUATED` |
| G3B07 | full pierce through `4.2 mm` thin structure | `2.1 mm` | `CLASH` |
| G3B08 | rigidly rotated `3.0 mm` thin structure; empty erosion core | `1.5 mm` | `NOT_EVALUATED` |
| G3B09 | rotated structure and oblique centre-crossing pipe | `6.0 mm` | `CLASH` |
| G3B10 | no reliable closed/manifold interior | unavailable | `NOT_EVALUATED` |
| G3B11 | shared project coordinates not verified | unavailable | `NOT_EVALUATED` |
| G3B12 | skew layout outside the analytic certificate family | unavailable | `NOT_EVALUATED` |
| G3B13 | cap intrusion `0.5 nm` above threshold | `2.0000000005 mm` | `CLASH` |

G3B08 is the explicit AABB counterexample. Its exact interior depth is `0.0015 m`, while its minimum world-axis AABB overlap is approximately `0.36544 m`. An AABB-derived classification would therefore present gross false precision.

## Verification

Run:

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\test-g3b.ps1
pwsh -NoLogo -NoProfile -File .\scripts\audit-g3b.ps1
```

The suite requires:

- all 13 G3B statuses and exact analytic depths to match the human-authored fixture file;
- strict below/equal/above threshold behavior, including the `0.5 nm`-above-threshold regression;
- thin, rotated, and oblique coverage;
- six failure-closed results with diagnostics, including empty/degenerate erosion cores and an explicit unsupported certificate;
- C04-only AABB scope and zero AABB classification in G3B;
- unchanged G1/G2/G3A/G3A-R1 regressions, frozen IFC hashes, truth, cleanup behavior, and Git state;
- zero public-candidate absolute-path, personal-email, credential, or over-limit-file findings;
- zero Git remotes and unchanged dependency/license scope.

The initial G0A audit script is a historical baseline audit and is not stage-invariant: when rerun after project-local ignored runtimes were installed, its whole-workspace large-file count fails by design. G0A history, its five-file commit tree, zero-remotes rule, and three-file sanitized publication candidate are checked separately; current publication safety is governed by the G3B audit.

## Boundary after G3B

G3B does not implement the browser detector, clearance rule, or UI. Browser `penetration_distance_m` remains `null` until a product implementation independently satisfies this semantic and reliability boundary. G3 remains blocked by G3C and the later G3 engine step.

## Original verified checkpoint

The authoritative local implementation is commit `a443a0d875a2d46a7af3e8589d571fd42375ee17` (`step(G3B): define auditable tolerance semantics`). On 2026-08-26 23:54–23:56 +08:00, the reviewed public candidate was uploaded only through the user's signed-in Chrome session as a continuous four-commit chain:

1. root evidence `983c6e0b3114a8e4356ea2cf204954d4c727546e`;
2. tolerance tests `e586659a766a106bbc90e2aaf6d247fce0ac64e9`;
3. tolerance fixtures `3f1c0855596d78b4f8617a155d0b59211188852c`;
4. tolerance evidence `54c1bab44042573a4d7e719ffc67b7cc3373121f`.

Chrome verification confirmed `Public` visibility, branch `main`, exact parent continuity, the local short-SHA mapping in every title, the C04-only guard, all 12 original fixtures, the AABB counterexample, the then-documented failure-closed boundary, and the explicit G3C blocker. G3B-R1 supersedes the unsafe thin-structure and threshold-edge conclusions through the verified chain below. No Git remote, CLI remote, GitHub API, or `origin` was used.

## G3B-R1 verified checkpoint

The authoritative repair is local commit `03b6e67b7ae19a758021f29ba779c83f5e5efffb` (`fix(G3B): harden tolerance and audit evidence`). Chrome published and verified the continuous public chain:

1. root evidence `af2cbcf98275b846dd5de38489fa9c5b7706df3f`;
2. exact-threshold scripts and tests `b92fed1f33189682d9d58c9b92c94115a28333d2`;
3. thirteen-case fixture `a09b71ab578fd365d136b1ae4ad88edf416ca063`;
4. semantic evidence `ac3f5069e16a3a36816748714373649693899827`.

The web review confirmed `Public/main`, exact parent continuity, all seven intended public files, fixture version `1.1.0`, G3B13's exact decimal, degenerate-core failure closing, explicit reliability-signal sources, the unsupported-certificate assertion, absence of the former `math.isclose` classification deadband, C04-only AABB evidence, and the unchanged G3C blocker. Local audit scripts were not uploaded. No Git remote, CLI remote, GitHub API, or `origin` was used.
