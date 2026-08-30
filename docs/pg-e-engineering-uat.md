# PG-E synthetic engineering-context pack and user UAT

Status: `TECH_PASS_EXTERNAL_SYNC_PASS_USER_HOSTED_UAT_PENDING`

Latest closed checkpoint: `PG-B · PASS`, including `PG-B-R1 · PASS` for Logo v2. PG-E remains `IN_PROGRESS`; VG, G7A, G7B, and G7 have not started. This document now records the completed GitHub/Sites synchronization and automated hosted verification, while the user's final hosted-candidate trial remains open. It is not a claim of real-project accuracy or public Sites access.

The first technical fixture at `59fefc47191e0ef22cf9ae7903546e96d0c21ba4` was rejected during user review because its separated test zones did not read as a normal building. The replacement candidate is local commit `d0598830b674c36df722ba74499f9277cb08983f` (`repair(PG-E): rebuild realistic one-storey clinic`). On 2026-08-30 the user confirmed that the replacement effect is satisfactory, approved preparing it as a website example, and then authorized the exact combined 29-path online update.

## Answer first

The PG-E pack is one programmatically generated IFC4 pair representing a plausible 12 m × 8 m, 3.2 m-high, one-storey community clinic. It has a ground slab, four perimeter walls, four internal partition segments with aligned door gaps, six columns, three framing beams, an A–C / 1–4 grid, and ceiling-level services routed through consultation rooms and the central circulation band. Eight `IfcPipeSegment` elements are checked against eight `IfcWall` and three `IfcBeam` rule elements, forming 88 candidate pairs and six independently authored sentinels. The shipped browser core matches all six sentinels across three repeated local Node runs, and the pair is included in the public website selector and owner-only Sites version 9 as `PG-E · Realistic one-storey clinic · 88 pairs`.

No employer, customer, school, private, or real-project data is used. The IFC pair and accompanying truth data are CC0-1.0. The pack is a review fixture, not an unseen holdout and not evidence of arbitrary IFC, exporter, project, safety, constructability, compliance, or field accuracy.

## Files and frozen identity

| Role | Repository-relative path | Bytes | SHA-256 |
|---|---|---:|---|
| MEP | `data/generated/pg-e/pg-e-engineering-mep.ifc` | 6,992 | `df47be1eccd006cb6b9ffd50058d545eb2373cc42e9a9227b19b9adc604909fb` |
| Structure | `data/generated/pg-e/pg-e-engineering-structure.ifc` | 18,153 | `3a8d42abdbc93b8f02519d0108fb91599dc64189091696c528317502adffc872` |

The source operations are frozen in `data/pg-e-operation-ledger.json`; generated metadata and GUIDs are in `data/pg-e-manifest.json`; the independent expected pairs are in `data/ground-truth/pg-e-sentinel-baseline.json`. Isolated generation must reproduce both IFC files, the manifest, and the sentinel baseline byte for byte.

## Authored sentinel expectations

| Sentinel | Pair purpose | Hard status | Clearance emission/status | Authored distance |
|---|---|---|---|---:|
| S01 | Pipe through wall | `CLASH` | suppressed | — |
| S02 | 49 mm wall clearance | `CLEAR` | `WARNING` | 0.049 m |
| S03 | 50 mm boundary | `CLEAR` | `CLEAR` | 0.05000001 m |
| S04 | explicit safe beam separation | `CLEAR` | `CLEAR` | 0.200 m |
| S05 | Pipe through beam | `CLASH` | suppressed | — |
| S06 | Pipe with missing geometry | `NOT_EVALUATED` | `NOT_EVALUATED` | — |

S03 uses a disclosed 0.01 micrometre offset above 50 mm. The offset prevents Float32 tessellation from putting the nominal equality infinitesimally below the strict threshold; it does not create a deadband or change the frozen `distance < 0.05 m` rule. The local shipped-core observation is approximately `0.0500000067 m`, so it remains on the non-warning side.

Only these six pairs have independent constructive expectations. Other results among the 88 cross-product pairs are useful scene context but are not packaged as independently proven truth.

## Technical preflight

Run from the repository root with PowerShell 7:

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\test-pg-e.ps1
```

The suite verifies origin/license/privacy markers, site/building/storey organization, entity counts, file sizes and hashes, deterministic isolated regeneration, all six sentinels through the shipped core, prior PG-B/PG-C/G6 contracts, and an unchanged worktree. Machine-specific duration observations are written only below ignored `outputs/local-only/pg-e/`.

The current technical observation is 6/6 sentinel agreement, 88 evaluated product pairs, four hard clashes, one clearance warning, eleven failure-closed hard records caused by the intentionally geometry-free pipe, and deterministic normalized output across three repeats. These Node durations are not a browser UAT performance claim.

## User Chrome UAT checklist

Use the current desktop Chrome and the owner-only hosted candidate, or reproduce locally with the commands below. No provider key is needed.

```powershell
.\.tools\node-v24.19.0-win-x64\node.exe .\scripts\g1-static-server.mjs
```

Open `http://127.0.0.1:4173/app/`, then perform and record every item below:

1. Select `PG-E · Realistic one-storey clinic · 88 pairs` from the example selector and load it. For the custom-file route, select `pg-e-engineering-mep.ifc` as MEP and `pg-e-engineering-structure.ifc` as Structure.
2. Confirm the displayed IFC4/metre/shared-coordinate boundary; actively grant the shared-coordinate confirmation for this fresh pair.
3. Before reading results, orbit the full model and confirm that it reads as one coherent single-storey building: enclosed 12 m × 8 m footprint, central circulation, door gaps, slab, columns/beams, and room-serving ceiling pipe routes. Record any implausible geometry as a blocker.
4. Run the deterministic review. Record the browser version, window size, file sizes, element counts, candidate-pair count, result counts, elapsed time, and any console warning/error.
5. Filter to `CLASH`; open S01 and S05 by the GUID pairs in the baseline; verify the evidence drawer and 3D focus for both wall and beam penetrations.
6. Filter clearance warnings; verify S02 reports approximately 49 mm and S03 is not a warning. Open S03 evidence and confirm its measured value is at or just above 50 mm.
7. Open S04 and verify an explicit clear separation of approximately 200 mm.
8. Open S06 and verify missing geometry is `NOT_EVALUATED`, never `CLEAR`.
9. Trigger AI only if the current consent preview is acceptable and the provider route is intentionally configured; otherwise keep AI off and verify the deterministic workflow remains complete. If triggered, verify it cannot change any deterministic status or measurement.
10. Exercise retry/cancel, change one input and confirm stale review state is invalidated, then reselect the pair and rerun.
11. Switch Simplified Chinese/English, Popular/Engineering Minimal, and Light/Dark; repeat a run and verify filters, evidence, and 3D focus remain usable.
12. Record peak memory only if Chrome exposes a reliable measurement for the tested tab. Do not estimate it.
13. List every observed issue, its severity, reproduction steps, repair commit, and retest result. Any unresolved realism, license, performance, console, stale-state, result, evidence, or 3D-focus blocker prevents PG-E `PASS`.

## Online synchronization and hosted preflight

- Local release commit: `86751bb` (`step(PG-E): prepare clinic and logo v2 release`).
- Public GitHub chain: `33190860ebd64d1a3f2f2a215a0ffe74318136e4` through `b3b03046982011567f1108967dd84672cfad69bd`.
- Public mapping: 29/29 authorized paths match the local candidate byte for byte.
- Sites: owner-only private version 9; deployment `appgdep_6a9410376c248191952546a2416970fc` succeeded without an access-policy or environment-variable change.
- Online Chrome result: 88 records — 4 CLASH, 1 WARNING, 11 NOT_EVALUATED, 72 CLEAR; 3D evidence reached the focused-model state; console warnings/errors: 0.
- Logo v2: public GitHub natural size 1024 × 1024, desktop render 420 × 420, approximately 279.33 × 279.33 at a 360 px public-GitHub viewport, no horizontal overflow, and no console warnings/errors.

This automated hosted preflight closes external synchronization but does not replace the user's final trial of the hosted candidate.

## UAT record template

The following remains deliberately blank until the user performs the trial:

```text
Tester confirmation:
Date/time (+08:00):
Chrome version:
Window / zoom:
MEP bytes / SHA-256:
Structure bytes / SHA-256:
Building realism (PASS / FAIL, notes):
Website example selector/load/run (PASS / FAIL, notes):
Elements (pipes / walls / beams / columns / slabs):
Candidate pairs:
Hard result counts:
Clearance result counts:
Elapsed time:
Peak memory (only if reliable):
Console warnings/errors:
AI path exercised (off / local fallback / live with fresh consent):
Language / experience / theme states checked:
Retry / cancel / stale-state invalidation checked:
Observed issues:
Repair and retest evidence:
User acceptance decision (PASS / FAIL):
```

## Gate boundary

The authorization, signed-in Chrome GitHub upload, 29/29 local-to-remote mapping, owner-only Sites version 9 deployment, and automated hosted preflight are complete. PG-E cannot become `PASS` until the user performs the final hosted-candidate trial, the UAT record is completed, and any blocker is repaired and retested. No Git remote was configured; no public Sites access, GitHub CLI/API write, access/permission/key change, hosted provider call, VG/G7, mobile computation, or video action was introduced.
