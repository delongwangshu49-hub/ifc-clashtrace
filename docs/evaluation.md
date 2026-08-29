# G5 evaluation and external-sample evidence

Status: local technical `PASS` on 2026-08-29. This report is a bounded acceptance result, not a claim of arbitrary IFC, exporter, project, or engineering accuracy. The public checkpoint remains pending until the separately authorized browser publication and SHA-mapping tail are complete.

## Answer first

- The eight public controlled cases match the constructive operation ledger, the IfcOpenShell reference, and the browser product core in all `8/8` statuses. All expected clash pairs also match. For the binary hard-clash cases this is `3` true positives, `0` false positives, `0` false negatives, `4` true negatives, and `1` deliberate `NOT_EVALUATED` abstention: precision and recall are both `1.00` on this public acceptance set.
- The nine G3C supplemental fixtures match the exact analytic evaluator and the independent triangle-mesh reference in `9/9` cases. The distribution is four `WARNING`, two `CLEAR`, two `NOT_EVALUATED`, and one hard-clash-suppressed pair.
- The buildingSMART PCERT sample pair opens in both web-ifc and IfcOpenShell, with all observed product GUIDs unique and geometry generated without reported iterator failures. The product correctly returns `NOT_EVALUATED`, because the files declare millimetres and the HVAC sample contains no `IfcPipeSegment`. This is a compatibility diagnostic, not an accuracy result.
- Six mock AI preservation/degradation checks pass (`6/6`, factual-preservation rate `1.00`); all five invalid/unavailable paths return the exact local fallback without mutating the structured deterministic request. The same-origin non-streaming mock endpoint recorded median first-byte and completion times of about `40.7 ms` and `41.1 ms` across five calls. No key or external request was used.
- O-005 is closed conservatively: formal support remains IFC4 only, under the already frozen unprefixed-metre/shared-coordinate/type/geometry boundary. IFC4X3 remains exploratory and is not advertised as supported.

## Controlled-case metrics and three-way consistency

The controlled source of truth is the human-authored constructive operation ledger, not either detector. `scripts/g2-reference-clash.py` is the IfcOpenShell route. `scripts/g5-evaluate-controlled.mjs` runs the shipped web-ifc/Three.js core five times per case and compares statuses and GUID pairs without changing the ground truth.

| Evidence | Result |
| --- | ---: |
| Controlled cases | 8 |
| Exact product status matches | 8/8 |
| Exact IfcOpenShell status matches | 8/8 |
| Three-way status matches | 8/8 |
| Exact expected product clash-pair matches | 8/8 |
| Stable product status across five repeats | 8/8 |
| Hard-clash precision / recall | 1.00 / 1.00 |
| Deliberate failure-closed abstentions | 1 |

These cases are all public and were used during development. They are contract acceptance evidence and do not estimate generalization to unseen projects.

## Clearance supplements

The nine G3C records cover touching, 49/50/51 mm boundaries, hard-clash deduplication, rotated/oblique placement, a modeled opening, missing geometry, and unreliable coordinates. The exact-decimal analytic path and the independent `three-mesh-bvh` triangle-surface path both match all nine authored expectations. No AABB result is allowed to classify clearance.

## Official buildingSMART sample

The external run used the buildingSMART [`Certification-datasets`](https://github.com/buildingSMART/Certification-datasets/tree/e6f1c1d80ac216e1c1d6f88d4650f13d8c8277b7/IFC%204.0.2.1%20%28IFC%204%29/PCERT-Sample-Scene) files `Building-Hvac.ifc` and `Building-Structural.ifc` at source commit `e6f1c1d80ac216e1c1d6f88d4650f13d8c8277b7`. The repository license is [CC BY 4.0](https://github.com/buildingSMART/Certification-datasets/blob/e6f1c1d80ac216e1c1d6f88d4650f13d8c8277b7/LICENSE). The files were kept under the ignored local external-data directory and are not redistributed.

Browser-verified SHA-256 values are `11a8552bc555fa44dfdc49374d1ab2da0a16104c10f086af509f500ce03fa2b3` for HVAC and `68be722391e7aaa53bb9278645a02aa4b6382f13cc07548a1612e9b1dc3def67` for Structural. web-ifc opens both as IFC4. IfcOpenShell reports unit scale `0.001`, builds `5` and `16` geometry items with no reported iterator failures, and observes `10/10` plus `22/22` unique product GUIDs. The structural file includes four walls and six beams; the HVAC file has no `IfcPipeSegment`.

The shipped UI accepts the files into local memory, runs after explicit shared-coordinate confirmation, returns one `NOT_EVALUATED` record, and exposes `only unprefixed metre IFC length units are supported` in the evidence drawer. It does not crash, return `CLEAR`, or manufacture a clash pair. The directory does not provide audited clash-pair ground truth, so no accuracy figure is derived from it.

## Performance record

In the project-local Node.js process, 40 controlled measurements (eight cases, five repeats) covered IFC parsing, mesh extraction, classification, and evidence assembly. The observed case times ranged from about `0.22 ms` to `33.04 ms`; the median of per-case medians was about `3.23 ms`, and the largest observed per-case p95 was about `33.04 ms`. These tiny generated models do not predict large-model performance.

The Chrome usability run is a separate end-to-end UI observation: the four-case review pack completed in `9,685 ms`, and the official sample pair reached its failure-closed result in `3,201 ms`. Both exposed summary, records, 3D/evidence controls, and an explicit diagnostic. Browser timing includes staged progress and rendering and is not directly comparable with the core-only timings.

## AI preservation, degradation, and readability

`scripts/g5-evaluate-ai.mjs` uses a project-local mock provider only. It covers valid prose, unconfigured provider, malformed object, uppercase machine-status injection, numeric-measurement injection, and an unknown record reference. All six leave the serialized deterministic request unchanged. The five invalid/unavailable cases return the exact trusted local template; provider prose cannot carry status or measurement fields.

The endpoint is intentionally non-streaming, so “first byte” means POST start to the first readable response after provider completion, while completion means parsed JSON. Five mock calls with a controlled provider delay produced median observations of about `40.7 ms` and `41.1 ms`. These are local plumbing measurements, not Groq latency or an uptime promise.

The minimum human readability evidence is the dated G4AI-R3 L-0054 content audit: after unsupported-claim repair, both English and Simplified Chinese bounded-prose live results were accepted, with the deterministic `1/1/1/1` summary unchanged. G5 made no new live request and retained no provider prose; this is reuse of authorized dated evidence, not a fresh blind study.

## Failures, limits, and allowed claims

Allowed claims are limited to the exact public controlled metrics, the dated local timings, the two-parser official-sample compatibility observations, deterministic failure closing, and the dated mock/live AI evidence. Do not claim arbitrary IFC support, real-project accuracy, code compliance, safety, constructability, certification, unseen-data performance, large-model performance, permanent provider availability, or permanent free quota.

Known product boundaries remain: IFC4 STEP only; unprefixed metre units; explicitly established shared project coordinates with equal transforms; `IfcPipeSegment` against `IfcWall`/`IfcBeam`; closed reliable tessellations; the frozen 2 mm and 50 mm rules; unsupported or unreliable geometry returns `NOT_EVALUATED`. IFC4X3, prefixed units, generic HVAC flow segments, automatic registration, extra rules, mobile computation, deployment, public-access changes, and video are outside G5.

## Reproduce

Run PowerShell 7 from the repository root after the ignored official samples have been locally acquired and their hashes verified:

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\test-g5.ps1 -RequireOfficialSamples
```

The machine-readable run products are written only below `outputs/local-only/g5/`. They are not publication candidates because they contain environment-specific timings and external-sample observations.
