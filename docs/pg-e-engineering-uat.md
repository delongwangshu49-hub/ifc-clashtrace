# PG-E synthetic engineering-context pack and user UAT

Status: `PASS`

Latest closed checkpoint: `PG-E · PASS`, including `PG-B-R2 · PASS` for the cropped and rebalanced Logo v2. The 30-path GitHub mapping, owner-only Sites version 11, and the authorized agent-performed hosted UAT are complete. VG, G7A, G7B, and G7 have not started. This is not a claim of real-project accuracy or public Sites access.

The first technical fixture at `59fefc47191e0ef22cf9ae7903546e96d0c21ba4` was rejected during user review because its separated test zones did not read as a normal building. The replacement candidate is local commit `d0598830b674c36df722ba74499f9277cb08983f` (`repair(PG-E): rebuild realistic one-storey clinic`). On 2026-08-30 the user confirmed that the replacement effect is satisfactory, approved preparing it as a website example, and then authorized the exact combined 29-path online update.

## Answer first

The PG-E pack is one programmatically generated IFC4 pair representing a plausible 12 m × 8 m, 3.2 m-high, one-storey community clinic. It has a ground slab, four perimeter walls, four internal partition segments with aligned door gaps, six columns, three framing beams, an A–C / 1–4 grid, and seven represented ceiling-level services routed through consultation rooms and the central circulation band. An eighth imported `IfcPipeSegment` intentionally has no geometric representation so the product can prove failure closing. These eight records are checked against eight `IfcWall` and three `IfcBeam` rule elements, forming 88 candidate records and six independently authored sentinels. The shipped browser core matches all six sentinels across three repeated local Node runs. The repaired pair is published on GitHub and deployed through owner-only Sites version 11 as `PG-E · Realistic one-storey clinic · 88 pairs`.

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

The current technical observation is 6/6 sentinel agreement across 88 candidate records: 77 receive evaluated outcomes and eleven fail closed because the intentionally geometry-free pipe is paired with all eleven rule structures. The final exclusive presentation summary is four clashes, one warning, eleven not-evaluated, and 72 clear records, with deterministic normalized output across three repeats. These Node durations are not a browser UAT performance claim.

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

## Online synchronization and final hosted UAT

- Local audited repair commit: `dec5d0d1ac780bfa3e15da48715f2737a5583bc3` (`fix(PG-E): close audit gaps and rebalance logo`).
- Public GitHub repair technical head: `3038d431157c0e1eb1e1f2b4a9870ddb01609921`.
- Public mapping: all 30 authorized paths match the local audited repair candidate byte for byte.
- Sites: owner-only private version 11, deployment `appgdep_6a942076ec308191a41d58f4cf02cf3e`, succeeded without an access-policy or environment-variable change.
- Online Chrome result: 88 records — 4 CLASH, 1 WARNING, 11 NOT_EVALUATED, 72 CLEAR; 3D evidence reached the focused-model state; console warnings/errors: 0.
- Logo v2 PG-B-R2: the immutable final-SHA GitHub README reports a 951 × 679 natural asset rendered at 240 × 171.354 px, with no console warnings/errors. A transient `raw/main` CDN cache retained the prior square image, so the immutable commit page plus 30/30 byte mapping are the authoritative verification.

The final signed-in Chrome UAT used a 1707 × 876 CSS-pixel window at devicePixelRatio 1.5. It returned 88 records in 5569 ms, inspected the 49/50/200 mm boundaries, wall/beam clashes, failure closing, evidence drawer, and 3D focus, proved stale-state invalidation with a one-record C01 rerun, exercised the language/experience/theme matrix, and reported zero home/app console warnings or errors.

## Structured UAT guard

`data/pg-e-uat-record.json` is the machine-readable acceptance record. It identifies Sites version 11, its deployment ID, and the immutable GitHub technical head; all thirteen checks are true and the decision is `PASS`. It separately freezes the historical automated preflight. `scripts/test-pg-e.ps1` rejects missing checks, incorrect targets, or a status-only acceptance decision.

## UAT record template

The human-readable companion agrees with the structured record:

```text
Tester confirmation: User authorized agent-performed final hosted UAT
Date/time (+08:00): 2026-08-30 20:30
Chrome version: signed-in Chrome extension session; exact version unavailable to restricted page context
Window / zoom: 1707 × 876 CSS px / DPR 1.5 / default zoom
MEP bytes / SHA-256: 6,992 / df47be1eccd006cb6b9ffd50058d545eb2373cc42e9a9227b19b9adc604909fb
Structure bytes / SHA-256: 18,153 / 3a8d42abdbc93b8f02519d0108fb91599dc64189091696c528317502adffc872
Building realism: PASS; one coherent single-storey clinic
Website example selector/load/run: PASS
Elements (pipes / walls / beams / columns / slabs): 8 / 8 / 3 / 6 / 1
Candidate pairs: 88
Exclusive result counts: 4 CLASH / 1 WARNING / 11 NOT_EVALUATED / 72 CLEAR
Elapsed time: 5569 ms
Peak memory: not recorded; no reliable tab measurement exposed
Console warnings/errors: 0 / 0
AI path exercised: off
Language / experience / theme states checked: English/Chinese; Popular/Engineering Minimal; Light/Dark
Retry / cancel / stale-state invalidation checked: PASS; C01 rerun returned exactly one CLASH
Observed issues: transient GitHub raw/main CDN cache only; immutable-SHA render and 30/30 mapping passed
Repair and retest evidence: evidence drawer, 3D focus, all six sentinels, state reset, and presentation matrix passed
User acceptance decision: PASS
```

## Gate boundary

The prior 29-path publication and Sites versions 9/10 remain historical evidence. The bounded repair is now verified at the 30-path GitHub technical head and owner-only Sites version 11. The user authorized the agent to execute the final hosted UAT; both records are complete and all checks pass. PG-E is therefore `PASS`. No Git remote was configured; no public Sites access, access/permission/key change, hosted provider call, VG/G7, mobile computation, or video action was introduced.
