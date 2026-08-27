# G3 browser core engine evidence

## Scope

G3 integrates the approved deterministic rules into one browser-importable module. It accepts one MEP IFC byte array and one structure IFC byte array, opens both with `web-ifc 0.0.77`, selects `IfcPipeSegment` against `IfcWall` and `IfcBeam`, and returns Clash Records plus non-duplicated Clearance Warning Records.

The core accepts exact IFC4 input with one unprefixed metre length unit per model. The caller must explicitly establish `shared_project_coordinates`, and both web-ifc coordination matrices must be finite and identical. The v1 rule IDs are inseparable from their frozen finite constants: hard-clash tolerance is exactly `0.002 m` and clearance threshold is exactly `0.05 m`; a caller cannot retain a v1 ID while supplying a different or non-finite threshold. A violated input contract returns a run-level `NOT_EVALUATED` diagnostic without records.

## Hard-clash certificate

The G3 product classifier does not use world-axis AABB overlap. It first requires every consumed tessellation part to have a valid triangular index buffer and at least one non-degenerate triangle, and requires its remaining geometric edges to form a closed two-manifold triangle surface after normalization. Exporter-emitted degenerate faces may be ignored only when a reliable closed surface remains; an all-degenerate part is rejected. If any placed geometry part fails extraction or validation, the entire affected element pair is `NOT_EVALUATED` even when another part was valid, so an incomplete representation cannot be classified. For each straight finite pipe mesh, it derives a rotation-invariant dominant axis from the transformed triangle vertices. It samples that axis at intervals no larger than `0.0005 m`, performs closed-mesh point-in-solid checks against the structure, and obtains triangle-surface depth from `three-mesh-bvh`.

`CLASH` requires a certified structure-interior surface depth strictly greater than `0.002 m`. Touching and a certified depth at or below the threshold are `CLEAR`. If triangle surfaces intersect away from the certified pipe axis, the engine cannot establish the approved general side-intrusion semantics and returns `NOT_EVALUATED` rather than a false `CLEAR`.

The record field `penetration_distance_m` remains `null`. `certified_maximum_interior_depth_m` is retained inside evidence only and is not presented as a universal physical penetration distance.

## Clearance integration

An authoritative upstream `CLASH` suppresses the corresponding clearance record. An upstream `NOT_EVALUATED` produces a clearance `NOT_EVALUATED` record with no distance. Only upstream `CLEAR` pairs enter `three-mesh-bvh` triangle-surface minimum-distance evaluation.

Distances strictly below `0.05 m` are `WARNING`; equality and greater distances are `CLEAR`. AABB separation is not used. Float32 IFC tessellation bounds numerical precision, and an unreliable distance query fails closed.

## Acceptance evidence

`scripts/test-g3.ps1` verifies:

- C01–C08 hard statuses match the frozen contract `8/8` (`CLASH 3 / CLEAR 4 / NOT_EVALUATED 1`);
- controlled hard-clash precision and recall are both `100%`;
- all three hard clashes suppress clearance output;
- C03 touching and C04 sub-tolerance overlap produce zero-distance clearance warnings;
- C05 and C06 return clear surface gaps of approximately `0.20 m` and `0.15 m`;
- C08 propagates upstream failure closing;
- malformed IFC, unverified coordinates, zero/non-finite/custom v1 thresholds, and role mismatch return run-level `NOT_EVALUATED`;
- all-degenerate meshes, non-triangular index counts, out-of-range/non-integer source indices, and partial placed-geometry failures are rejected or pair-level `NOT_EVALUATED`;
- a repeated C01 run is record-deterministic;
- the core imports no Node-only modules and contains no permitted AABB classification path;
- every G1/G2/G3A/G3B/G3C regression and frozen G2/G3C hash remains unchanged.

The unstyled `spikes/g3-browser/` technical harness was also run in current desktop Chrome. It returned `PASS`, exact status match `8/8`, the expected clearance/suppression outcomes, and no browser console errors. This harness is runtime evidence only and is not a Design Gate or product UI artifact.

## Bounded claims

- Straight finite pipe-axis geometry is the certified hard-clash family. Curved, branching, highly degenerate, or off-axis side-intrusion configurations are not silently generalized.
- An explicit shared-coordinate assertion and equal web-ifc transforms are necessary evidence, not automatic model registration.
- Controlled acceptance does not establish arbitrary exporter, schema, scale, topology, large-model performance, or real-project accuracy.
- G3 provides no file picker, styled results page, 3D review interaction, AI interpretation, deployment, or video output.
