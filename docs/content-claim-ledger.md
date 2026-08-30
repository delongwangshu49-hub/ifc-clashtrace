# IFC ClashTrace content claim ledger

Status: `PG-E · IN_PROGRESS`

Latest closed checkpoint: `PG-B · PASS`

Scope date: 2026-08-30 (Asia/Hong_Kong)

This ledger controls factual claims in the homepage, functional workspace, development log, README, navigation and footer, metadata, error and empty states, and demo screenshots. The local master plan, `PROGRESS_SYNC.md`, public tests, and verified private-deployment checks are the authority in that order. A page may simplify wording, but it must not strengthen a claim beyond this ledger.

## Current status boundary

| Claim ID | Public-safe claim | Authority | Allowed state |
|---|---|---|---|
| S-01 | PG-B is the latest closed checkpoint. | Master plan L-0074; `PROGRESS_SYNC.md` PG-B closure | `PASS` |
| S-02 | PG-C closed the content audit; PG-B published and verified Logo v1. The byte-identical Logo v2 local replacement is technically prepared but not yet uploaded or externally verified. | Master plan PG-C/PG-B; v2 asset manifest and local checks; historical Chrome GitHub verification applies only to v1 | PG-C and original PG-B `PASS`; Logo v2 `TECH_PASS_EXTERNAL_SYNC_PENDING` |
| S-03 | The Sites project remains owner-only and private. | Read-only Sites access verification on 2026-08-30 | `OWNER_ONLY_PRIVATE` |
| S-04 | PG-B remains the latest closed checkpoint. PG-E is in progress with accepted visual realism, a selectable local clinic example, and 6/6 local technical sentinel preflight; full update verification, collective authorization, and online mapping are pending. VG, G7A, G7B, and G7 have not started. | Master-plan D-071/D-072; `docs/pg-e-engineering-uat.md`; PG-E public contract | PG-E `IN_PROGRESS`, never `PASS`; later stages `PLANNED` / not started only |
| S-05 | The GitHub repository is public on `main`; this does not make Sites public. | Read-only Chrome GitHub verification; Sites access verification | factual distinction only |
| S-06 | Every load of the shared homepage route resets to Popular experience, English, and Light. Homepage destinations open in new tabs; non-anchored workspace/development entries start at the top, while intentional hash links retain their target. | Master plan D-065/L-0072; executable entry tests; Chrome verification; GitHub technical-chain tip `40c7270b6fc9b56f6976b938297d2b475eef7e39` | `PASS` |

## Product and evidence claims

| Claim ID | Surface(s) | Allowed wording or value | Evidence and limit |
|---|---|---|---|
| C-01 | Home, workspace, README | Two IFC4 files are processed locally in the browser for the deterministic workflow. | G3/G4 tests; optional AI is a separately consented minimal-field path. |
| C-02 | Home, workspace, development | Hard-clash threshold `0.002 m`; clearance threshold `0.05 m`, with `< 50 mm` warning semantics. | Frozen G3/G3C contracts. No general penetration-distance claim. |
| C-03 | Home, workspace | Incomplete or unreliable evidence yields `NOT_EVALUATED`; no silent `CLEAR`. | G3-R1 failure-closed guards. |
| C-04 | Development, README | Frozen hard-clash suite `8/8`; clearance fixtures `9/9`; CLASH precision/recall `1.00/1.00`; TP/FP/FN/TN `3/0/0/4` plus one deliberate abstention. | G5 evaluation. Controlled evidence only, not arbitrary real-project accuracy. |
| C-05 | Workspace, README | Optional AI is off by default, uses preview plus fresh consent, and cannot rewrite deterministic records. | G4AI-R3 public tests and architecture. Provider availability and terms are time-sensitive. |
| C-06 | Development, README | Owner-only Sites version 4 completed basic usability acceptance; no hosted key is configured. | G6/G6-R1 deployment and privacy evidence. This is not public-access authorization. |
| C-07 | Footer, development | Code is MIT; project-generated IFC data is CC0-1.0. | `LICENSE`, `data/generated/LICENSE.md`, and data/license documentation. |
| C-08 | Workspace | Current computation support is desktop Chrome at `>= 1024 CSS px`, IFC4, uncompressed STEP, metre units, shared project coordinates, and a candidate `<= 25 MiB` limit per file. | G3/G4 bounded support contract; do not imply mobile computation or broad exporter support. |
| C-09 | Development, README, workspace | The repaired PG-E pair is a coherent 12 m × 8 m one-storey clinic with enclosure, door-gapped partitions, slab, six columns, three beams, seven grid axes, and eight ceiling-level pipe routes. Eight walls and three beams form 88 rule pairs; shipped-core preflight matches 6/6 sentinels. The user accepted its visual realism and it is now a local selectable website example. | `data/pg-e-manifest.json`, operation ledger, sentinel baseline, runtime selector, static-build packaging, and `scripts/test-pg-e.ps1`. Online upload and mapping remain pending. |
| C-10 | Development, README | PG-E includes plausible room/corridor services containing wall/beam clashes, 49 mm Warning, a disclosed 0.01 µm offset above the 50 mm non-warning boundary, 200 mm safe separation, and missing-geometry failure closing. | Human-authored operations plus shipped-core observation. Only six named pairs are independent expectations; no real-project accuracy claim. |

## Surface inventory

| Surface | Gate/status/date/metric/link/capability controls |
|---|---|
| Homepage | Product capability claims C-01/C-02/C-03; every homepage load follows S-06; development screenshot is explicitly historical G4 evidence; metadata is bilingual; GitHub, development, license, and data-license targets are non-empty. |
| Functional workspace | Input boundary C-08; error and empty states fail closed; AI boundary C-05; metadata and static interface copy are bilingual. The eyebrow is capability wording, not a stale Gate label. |
| Development log | Closed timeline through PG-B with Logo v1 historical verification and the pending Logo v2 update distinguished; PG-E shown as `IN_PROGRESS` with technical/online-update separation; VG and G7 stages remain `PLANNED`; metrics use C-04/C-09/C-10; Sites privacy uses S-03. |
| README | Closed evidence through PG-B is retained; Logo v2 local readiness is distinguished from pending GitHub verification; the PG-E selectable-example candidate and pending online update are explicit; the static PNG has no GIF dependency. |
| Navigation and footer | Targets must be non-empty and resolve to a local route, anchored workspace route, license/document route, or the established GitHub repository. Homepage destinations and cross-page workspace links open new tabs with `noopener`; ordinary page entries start at the top and intentional hash links retain their anchor. |
| Metadata | Page title and description preserve the same product and progress scope in Simplified Chinese and English. |
| Error and empty states | Missing input, no selected file, zero filtered records, unsupported input, provider failure, and incomplete geometry must not imply success or completion. |
| Demo screenshots | Four existing PNGs are historical, program-generated product captures. The development-page PNG is marked `historical` at G4 and points readers to the live development page for current status. |

## Later-stage prewriting contract

Copy and components may be prepared for every stage after the current Gate through project end only when they are hidden or explicitly marked `DRAFT`, `PLANNED`, “计划中”, “尚未开始”, or “Not started”. Prewriting must not fabricate or imply:

- completion state, dates, metrics, links, acceptance, public availability, permissions, or evidence;
- stage start, Gate passage, user acceptance, or closure of a stop gate;
- GitHub or Sites writes, deployment, public-access changes, hosted keys, or any other external authorization.

Only actual Gate evidence and required user authorization may promote a planned claim to completed wording.

## Automated failure conditions

`scripts/test-pg-c.ps1` must fail on:

1. a latest-closed checkpoint other than PG-B after PG-B closure;
2. an empty or placeholder target;
3. PG-B without `data-claim-state="closed"`, historical `PASS`, and an explicit pending Logo v2 external update; PG-E without `data-claim-state="in_progress"`, `IN PROGRESS`, accepted visual realism, a selectable one-storey clinic example, 6/6 technical evidence, and explicit pending authorization/online mapping; or VG/G7 stages without `planned`/`PLANNED` and matched “尚未开始” / “Not started” wording;
4. mismatched Simplified Chinese/English claim pairs or metadata;
5. a historical development screenshot without its G4/historical markers;
6. source/build disagreement on the status-band and planned-stage facts;
7. regression of the G6 deployment and product contracts.
8. a homepage load that does not reset to Popular experience, English, and Light; a homepage destination that does not open a new tab with `noopener`; a non-hash workspace/development entry that does not start at the top; storage failure that breaks display controls; or an A/B scene-label contrast ratio below 4.5:1.

The user accepted the clinic's visual effect and requested preparation of one combined online update containing the selectable example and Logo v2. This authorizes local candidate work and exact upload accounting only; it does not yet authorize GitHub/Sites writes, deployment, access changes, keys, VG, G7, mobile computation, or video production.
