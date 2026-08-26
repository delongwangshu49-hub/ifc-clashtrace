# G3A Contract Test Hardening

Status: `PASS`; the audited local step commit, Chrome GitHub web checkpoint, web verification, and mapping registration all passed.

## Risk closed

The prior G1 and G2 tests invoked their generators against tracked files under `data/`. A drifted committed artifact could therefore be overwritten before comparison, making a deterministic regeneration look like a valid baseline.

G3A separates the trusted expectation from generated output:

1. `data/ground-truth/g2-frozen-baseline.json` freezes the approved contract and the exact repository-relative path–SHA-256 mapping for all 16 G2 IFC files.
2. G1 and G2 generators default to ignored `outputs/local-only/` roots. A repository-root output requires the explicit `--allow-baseline-write` flag; tests never pass it.
3. G1 and G2 tests create a unique isolated root for every invocation, generate twice beneath it, compare each output to the committed mapping, assert protected hashes and Git worktree state are identical before and after the run, and safely remove that exact temporary root in a `finally` block.
4. `scripts/g3a-contract-check.py` validates the committed baseline and isolated generations without rewriting any accepted artifact.
5. `scripts/test-g3a-contract-mutations.py` changes copies of contract documents and proves each drift fails closed.

## Exact approved contract

The validator requires these exact values:

| Field | Required value |
|---|---|
| `rule_id` | `MEP_STRUCTURE_HARD_CLASH_V1` |
| `schema` | `IFC4` |
| `length_unit` | `metre` |
| `coordinate_system` | `shared_project_coordinates` |
| `tolerance_m` | `0.002` |

It also requires C01–C08 exactly, the frozen `3 CLASH / 4 CLEAR / 1 NOT_EVALUATED` statuses, two roles per case, canonical paths, matching manifest and ground-truth evidence hashes, actual file hashes, actual IFC schema, and actual metre unit scale.

## Negative contract mutations

Eight isolated mutations must be rejected for the intended reason:

- `rule_id`;
- Schema;
- length unit;
- coordinate system;
- tolerance;
- expected status;
- case file path;
- file SHA-256.

No mutation touches a committed data file. A negative test passes only when the validator raises the expected contract-specific diagnostic.

## Reproduction

Run from the repository root after G1 setup:

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\test-g3a.ps1
```

The accepted aggregate markers are:

```text
G3A_MUTATION_NEGATIVE_COUNT=8
G3A_G1_REGRESSION=PASS
G3A_G2_REGRESSION=PASS
G3A_BASELINE_WRITE_GUARDS=2/2
G1_ISOLATED_TEMP_ROOT_CLEANUP=PASS
G2_ISOLATED_TEMP_ROOT_CLEANUP=PASS
G3A_16_IFC_DETERMINISM=PASS
G3A_GROUND_TRUTH_MATCH=8/8
G3A_FAILURE_CLOSED=PASS
G3A_GIT_WORKTREE_UNCHANGED=PASS
G3A_LOCAL_TEST=PASS
```

## Scope boundary

G3A changes test trust and evidence only. It does not change any frozen IFC byte, G2 truth record, C04 AABB guard, tolerance algorithm, product engine, clearance rule, or UI. G3A has passed and is no longer a blocker; general tolerance semantics remain G3B, and G3 remains blocked by G3B/G3C.
