# G2 Controlled Dataset, Ground Truth, and Licenses

Status: `PASS`. Local G2 data generation, ground-truth validation, reference comparison, audited step commit, GitHub web checkpoint, and Chrome verification all pass. The authoritative local step commit is `7da4adfcdaef7729ba52d2a2c98c8741fdcc9c01`; the continuous 11-commit GitHub checkpoint runs from [`d4b974f101348d5707418c4078965dea0d8d7fc2`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/d4b974f101348d5707418c4078965dea0d8d7fc2) through [`4fcc3cd47197a10771f5ce52b2e0a039d6434dc1`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/4fcc3cd47197a10771f5ce52b2e0a039d6434dc1).

G5 additionally uses two buildingSMART PCERT sample files as ignored local compatibility inputs only. They remain copyright buildingSMART International and licensed CC BY 4.0 at the source repository; this project does not redistribute them. Their source commit, exact hashes, parser observations, and accuracy limitation are recorded in `docs/evaluation.md`.

## Dataset contract

The dataset identifier is `IFC_CLASHTRACE_CONTROLLED_G2_V1`. It contains eight deterministic IFC4 case pairs in metre units and shared project coordinates. The human-authored source of truth is `data/g2-operation-ledger.json`; detector output is never used to rewrite expected status.

| Case | Constructive condition | Expected | Reference |
|---|---|---:|---:|
| C01 | Pipe pierces a 0.2 m wall | `CLASH` | `CLASH` |
| C02 | Pipe pierces a 0.4 m beam | `CLASH` | `CLASH` |
| C03 | Pipe cap exactly touches wall face | `CLEAR` | `CLEAR` |
| C04 | Pipe intrudes 0.001 m, below 0.002 m tolerance | `CLEAR` | `CLEAR` after controlled overlap guard |
| C05 | Pipe has a 0.2 m clear gap | `CLEAR` | `CLEAR` |
| C06 | Pipe passes through a modeled 0.5 m square opening | `CLEAR` | `CLEAR` |
| C07 | Diagonal pipe pierces wall | `CLASH` | `CLASH` |
| C08 | Pipe has no geometric representation | `NOT_EVALUATED` | `NOT_EVALUATED` |

The generated artifacts are:

- `data/generated/g2/`: 16 IFC files, one MEP and one structure model per case;
- `data/ground-truth/g2-ground-truth.json`: eight normalized assessment records;
- `data/ground-truth/g2-frozen-baseline.json`: independent repository-relative path–SHA-256 and approved-contract baseline;
- `data/dataset-manifest.json`: source, license, redistribution, limitations, relative paths, and SHA-256 for every IFC;
- `data/g2-operation-ledger.json`: constructive operations, fixed GUID seeds, expected status, and split policy.

## Ground-truth independence

Expected statuses come from explicitly authored constructive operations:

- a full solid traversal is `CLASH`;
- touching is excluded;
- 0.001 m intrusion is below the 0.002 m threshold;
- modeled void geometry surrounds the pipe in C06;
- missing pipe geometry is `NOT_EVALUATED`, never `CLEAR`.

The generator converts those operations into IFC. The reference validator reads the generated IFC independently and compares its observations to the fixed records. A detector mismatch fails validation; it does not edit the ledger or truth.

## Reference result and C04 limitation

IfcOpenShell `0.8.5` `clash_intersection_many` returns the expected surface intersections for C01, C02, and C07 and no intersection for C03, C05, and the final voided geometry in C06. C08 is rejected before clash classification because its pipe has no `Representation`.

For C04, raw surface intersection returns `CLASH` and reports an intersection chord of approximately `0.199 m`; that number is not the pipe's intrusion depth. The reference validator independently reads world-coordinate meshes and obtains a minimum axis-aligned bounding-box overlap of `0.0009999999999998899 m`, below `0.002 m`, so the controlled case is classified `CLEAR`.

This overlap guard is valid evidence for the constructed C04 geometry but is not presented as a general penetration-distance algorithm. G3 must implement and validate the product rule without converting arbitrary bounding-box overlap into an exact clash claim.

## Evaluation split

All eight cases form one `public_acceptance` split. There is deliberately no hidden holdout set because the minimum suite is needed to develop and verify the rule contract under the project deadline. Therefore:

- 8/8 agreement is contract acceptance evidence only;
- it is not an unbiased estimate of generalization;
- no accuracy claim is made for arbitrary IFC exporters or real projects;
- external compatibility and broader evaluation remain G5 work.

## Reproduction and measured result

Run from the repository root with PowerShell 7 after G1 setup:

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\test-g2.ps1
```

The accepted result is:

```text
G2_CASE_COUNT=8
G2_STATUS_COUNTS=CLASH:3,CLEAR:4,NOT_EVALUATED:1
G2_GENERATED_IFC_COUNT=16
G2_ISOLATED_DETERMINISTIC_REGENERATION=PASS
G2_MANIFEST_HASHES=PASS
G2_PATH_SHA256_MAPPING=PASS
G2_APPROVED_CONTRACT=PASS
G2_BASELINE_HASHES_UNCHANGED=PASS
G2_GIT_WORKTREE_UNCHANGED=PASS
G2_REFERENCE_MATCH=8/8
G2_FAILURE_CLOSED=PASS
G2_LOCAL_TEST=PASS
```

G3A changed the reproduction path, not the frozen G2 IFC bytes or truth records. Both generations occur under ignored `outputs/local-only/` roots and are compared to the committed baseline. Tests do not regenerate files in `data/`.

## G3C clearance supplement

G3C leaves all G2 files and truth records unchanged. It adds a separate nine-case CC0-1.0 controlled geometry suite under `data/generated/g3c/`, a human-authored construction ledger, and `data/ground-truth/g3c-clearance-baseline.json` with one repository-relative path–SHA-256 entry per artifact. The cases cover touching, `49/50/51 mm`, hard-clash suppression, rotated oblique placement, a modeled opening, missing geometry, and unverified shared coordinates.

The JSON artifacts describe only programmatically constructed finite cylinders and closed box/opening-frame solids. They contain stable generated GUIDs and no external, private, employer, client, school, or real-project model data. As with G2, the expected outcomes come from authored construction operations; the analytic evaluator and independent triangle-mesh reference can reject the baseline but cannot redefine it.

## License and privacy boundary

- Project code: MIT, see `LICENSE`.
- IFC, controlled geometry artifacts, and accompanying truth data generated by this project: CC0-1.0, see `data/generated/LICENSE.md`.
- Third-party software and any future external dataset retain their own licenses.
- Generated IFC headers use the non-personal `IFC ClashTrace contributors` label, contain no email or local path, and declare `CC0-1.0`.
- No private, employer, client, school, or real-project IFC is included.

## PG-E synthetic engineering-context UAT pair

PG-E adds one programmatically generated IFC4 pair under `data/generated/pg-e/`. It is organized as a synthetic site, building, and 12 m × 8 m community-clinic storey with perimeter walls, door-gapped partitions, a ground slab, six columns, three beams, a seven-axis grid, and ceiling-level room services. Eight pipe segments are checked against eight walls and three beams. The exact two-file identity, CC0-1.0 redistribution permission, element GUIDs, limitations, and sizes are recorded in `data/pg-e-manifest.json`; six human-authored sentinel expectations are frozen separately in `data/ground-truth/pg-e-sentinel-baseline.json`.

The six sentinels cover wall and beam clashes, 49 mm warning, the non-warning side of the 50 mm boundary, 200 mm separation, and missing-geometry failure closing. Only those six pairs are independent expectations. The full 88-pair output is an engineering-context review surface, not a hidden holdout or evidence of real-project accuracy. The user has accepted the building's visual realism; both IFC files are now included in the local website example and static-build candidate. PG-E remains in progress until full update verification, collective upload authorization, and online mapping close.
