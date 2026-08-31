# VG video preproduction review package

Status: `VG PASS — PUBLIC CHECKPOINT VERIFIED; G7A READY / NOT STARTED`

Date: 2026-08-31  
Target: IFC ClashTrace product film  
Mode: joint creation / bounded refinement approved

## 1. Stage boundary

This package is the complete reviewable plan required by VG. It does **not** create or claim a final film.

| In VG now | Held for G7A after explicit VG approval |
|---|---|
| Narrative, sentence-level script, Chinese translation, shot list, visual styleframes, voice/music auditions, beat map, mix targets, capture plan, privacy/license/fact ledgers, backup plan | Final narration synthesis, official product capture, live AI call, Remotion implementation, final sound effects, edit, subtitles, mix, render and audiovisual QA |

The user approved the creative package and selected voice H on 2026-08-31. The bounded logic repair passed, and the exact 25-path GitHub checkpoint was uploaded and verified at primary content head `a2ee7abd86c00d3516d8aff24151f7b66ecef496`. VG is formally closed as `PASS`; G7A is ready but remains not started. This closure does not authorize Sites, provider-key, YouTube or G7A production actions.

## 2. Frozen creative direction

| Item | VG decision |
|---|---|
| Core proposition | **From geometry, to result, to evidence. Every relationship. Traceable.** |
| Audience | Academic assessors first; BIM coordination and technical reviewers second |
| Positioning | Product-first cinematic promotion with academic credibility as proof; clean, precise and premium, inspired by the restraint and pacing of Apple product films but visually original to IFC ClashTrace |
| Runtime | `172.2 s`, inside the approved `165–175 s` range and below the `180 s` hard limit |
| Format | `1920 × 1080`, `16:9`, `30 fps`; final export belongs to G7A |
| Narration | **Selected H:** local Apache-2.0 `Kokoro-82M af_heart`, following the `V2 Warm Modern` performance direction; English female voice, target `114–118 wpm`, restrained warmth and no announcer affect. D is retained only as an unselected backup; C is rejected because its no-reference output was male |
| Music | Selected `M2 — Masking the Masters`, Eugenio Mininni, Mixkit, source duration about `3:40` |
| Subtitle strategy | Manually proofread English and Simplified Chinese sidecar tracks; keep the clean master free of permanent full-sentence burn-in; prepare a Chinese burn-in fallback only if the delivery platform cannot expose captions reliably |
| Product evidence | Real interface and deterministic browser calculation; compositing may frame or annotate it but never substitute a generated imitation for product operation |
| AI evidence | One separately recorded, fresh-consent call on the controlled four-record pack `C01/C03/C05/C08`; never send the larger PG-E clinic pack to AI |

## 3. Music, voice and mix specification

### 3.1 M2 beat map

- Music source window: `00:38.506–03:30.706` of the full M2 file (`172.199881 s`).
- Working beat grid: `100.000069 BPM`; source-file grid phase `00:00.106208955`; the selected trim begins exactly on grid point `00:38.506182`, so the trim-relative first beat is `00:00.000`; beat interval `0.599999585 s`.
- Strict edit-grid acceptance: `98.258%` transient coverage within `33 ms`, matched-point mean absolute error `8.377 ms`, and estimated segment drift `2.538 ms`; all pass the frozen `98% / 10 ms / 5 ms` thresholds. The separate Librosa beat-track fit contains `270` detected beats with `13.461 ms` maximum and `3.602 ms` mean model residual.
- Shot boundaries use beats `0 / 16 / 32 / 48 / 72 / 96 / 120 / 144 / 168 / 192 / 216 / 240 / 264 / 287`.
- Full-frame impact cuts are limited to three or fewer. The single accelerando montage is the loudest visual beat and must not recur.
- The precise trim, fades and music edit are G7A work; VG freezes only the intended source window and grid.

Machine-readable analysis:

- `artifacts/vg/analysis/beat_data.json`
- `artifacts/vg/analysis/grid_drift.json`
- `docs/vg-shotcraft-manifest.json`

### 3.2 V2 delivery and pronunciation

The selected Ava audition establishes timbre and delivery, not the distribution source. A paid Azure Speech resource would create usage charges even for a non-commercial project, so it is removed from the plan. The user selected **H**, local Apache-2.0 `Kokoro-82M af_heart`; it has no API charge and keeps the final script on the workstation. G7A must freeze the H model and voice-pack hashes, synthesis settings and pronunciation overrides before locally synthesizing the final narration. Candidate D (`Parler Laura`, audition median `180.0 Hz`) is retained only as an unselected backup. Candidate C, a no-reference Chatterbox generation, was correctly identified by the user as male; an objective pitch check also found a `117.6 Hz` median versus H at `193.5 Hz`, so C remains rejected and the file is retained only as audit evidence. `af_bella` remains rejected/backup.

| Term | Approved reading |
|---|---|
| IFC / IFC4 | “eye-eff-see” / “eye-eff-see four” |
| MEP | “em-ee-pee” |
| 2 mm | “two millimetres” |
| 50 mm | “fifty millimetres” |
| NOT_EVALUATED | Natural prose: “not evaluated”; do not read the underscore |
| IFC ClashTrace | “eye-eff-see Clash Trace”, with a short separation between “Clash” and “Trace” |

Delivery notes: keep sentence endings settled, not breathy; pause `180–260 ms` after commas, `420–620 ms` after sentences, and `700–900 ms` before the final tagline. Numbers stay calm and factual. The legacy performance reference is `artifacts/vg-auditions/V2-warm-modern-ava.mp3`; the selected voice audition is `artifacts/vg-auditions/V2-zero-cost-kokoro-af_heart-pcm16.wav` (H). D is not selected.

### 3.3 Voice–music relationship

These are G7A targets, not a completed mix:

- Narration remains dominant, approximately `-16 LUFS` during spoken passages; final programme target approximately `-14 LUFS`, with final true peak no higher than `-1 dBTP`.
- M2 sits approximately `10–14 LU` below narration, normally around `-28 to -26 LUFS` during speech; it may rise to about `-21 to -19 LUFS` in deliberate gaps and visual peaks.
- Side-chain ducking starting point: `8–10 dB`, attack `60–90 ms`, release `300–450 ms`; automate by sentence instead of leaving one static music level.
- Keep narration centre and dry; keep music wider. SFX must not mask consonants or numeric claims.
- Final acceptance requires measured loudness plus listening checks on headphones, laptop speakers and a phone speaker.

## 4. Sentence-level narration and translation

The English script is `272 words`. Every sentence fits its assigned shot at the slow edge of `114 wpm` plus at least `420 ms` of sentence-end breathing room. Chinese is a meaning-preserving subtitle translation, not a second narration track.

| Shot | English narration | Simplified Chinese subtitle draft for manual review | Fact IDs |
|---|---|---|---|
| S01 | Coordination begins with a simple question: when a pipe meets structure, can every result be explained? | 协调始于一个简单的问题：当管线与结构相遇，每一项结果都能被解释吗？ | F01 |
| S02 | IFC ClashTrace turns that question into a browser feasibility prototype, built on deterministic geometry, not probabilistic judgement. | IFC ClashTrace 将这个问题转化为浏览器端可行性原型：基于确定性几何，而非概率判断。 | F01 |
| S03 | Two IFC4 files are processed locally. Rules, limits, and evidence remain visible from the start. | 两份 IFC4 文件在本地处理；规则、边界与证据从一开始就保持可见。 | F02, F03 |
| S04 | Across the interface, one review flow connects model selection, calculation, filtered results, three-dimensional focus, and the evidence behind each relationship. | 在整个界面中，一条审查流程串联模型选择、计算、结果筛选、三维聚焦，以及每一组关系背后的证据。 | F04 |
| S05 | For a realistic demonstration, we use a synthetic, twelve-by-eight-metre, one-storey clinic with seven represented pipe routes and one deliberately geometry-free segment. | 为了进行拟真演示，我们使用一个合成的 12 米 × 8 米单层诊所：包含七条有几何表达的管线，以及一条刻意不含几何的管段。 | F05 |
| S06 | Its eighty-eight wall-and-beam relationships produce four clashes, one clearance warning, eleven not-evaluated records, and seventy-two clear results in the final hosted review. | 在最终托管审查中，88 组墙梁关系产生了 4 项碰撞、1 项净距预警、11 项未评估，以及 72 项清晰结果。 | F05 |
| S07 | Select a result, and the three-dimensional view isolates the pipe and structure together. The record exposes component types, rule, measurement, and evaluation boundary. | 选择一项结果，三维视图会同时隔离对应的管线与结构；记录则展示构件类型、规则、测量值与评估边界。 | F04 |
| S08 | A hard clash requires the approved interior-depth rule to exceed two millimetres. A separate warning appears below fifty millimetres of surface clearance. | 硬碰撞要求经批准的内部深度规则严格超过 2 毫米；表面净距低于 50 毫米时，则另行产生预警。 | F06 |
| S09 | If geometry, coordinates, units, or reliability fall outside the supported contract, the product fails closed as not evaluated. Uncertainty is never silently converted to clear. | 如果几何、坐标、单位或可靠性超出支持边界，产品会以“未评估”保守失败；不确定性绝不会被静默地转为“清晰”。 | F03, F06 |
| S10 | The controlled suite agrees across authored truth, an independent reference, and the browser core in all eight cases. Nine clearance fixtures agree across both evaluator routes. | 在全部八个受控案例中，人工编制真值、独立参考与浏览器核心三方一致；九个净距夹具也在两条评估路径上一致。 | F07 |
| S11 | AI stays separate. A four-record controlled pack exposes only minimal derived fields, requires fresh consent, and cannot change deterministic status or measurement. | AI 始终保持独立。四记录受控包只公开最小化派生字段，要求重新同意，且不能更改确定性状态或测量值。 | F08 |
| S12 | This remains a focused feasibility prototype: IFC4 STEP, unprefixed metre units, established shared coordinates, and pipe relationships against walls and beams. | 这仍是一个边界明确的可行性原型：支持 IFC4 STEP、无前缀米制单位、已建立的共享坐标，以及管段与墙梁之间的关系。 | F01, F09 |
| S13 | It is not engineering certification and does not claim arbitrary-project accuracy. It offers something more disciplined: geometry, result, evidence. Every relationship. Traceable. | 它不是工程认证，也不宣称适用于任意项目的准确性。它提供更严谨的路径：几何、结果、证据。每一组关系，皆可追溯。 | F01, F07 |

## 5. Shot list and recording recipe

All times are relative to the planned `172.2 s` film. “Real capture” means G7A records the actual project surface; VG supplies only the recipe. Named motion cards are used once each and must be adapted to the real brand palette and real screenshots.

| Shot | Time / beats | Picture and action | Source type | Motion recipe | Required close-up / subtitle zone | Backup |
|---|---|---|---|---|---|---|
| S01 | `00:00.0–00:09.6` / `0–16` | Dark opening. “TRACEABLE” acts as a window onto product fragments, then resolves to the canonical mark and the question. | Styleframe + canonical logo + real screenshot texture | `text-as-mask` once; final product takeover held at least 20 frames | Keep bottom 15% clear; no dense UI text | Static SF01 with restrained 2.5D push |
| S02 | `00:09.6–00:19.2` / `16–32` | Product page appears first as precise linework, then becomes the real interface. | Real homepage screenshot/capture | `wall-reveal-moves.wireframe-draw-on` once; linework and interface must pixel-align | Magnify “browser-local” and “deterministic” claims only | Direct cut from dark to complete homepage |
| S03 | `00:19.2–00:28.8` / `32–48` | Homepage feature blocks step through Local / Deterministic / Evidence. | Real homepage capture | `word-relay-filmstrip` once; page cards move only on word changes | Right-side keywords; captions remain bottom-centre | Three beat-synced hard cuts between feature blocks |
| S04 | `00:28.8–00:43.2` / `48–72` | One continuous guided interface tour establishes the two real input routes: custom A1/A2 file inputs first, controlled B · DEMO selector second, then Run → filters → evidence. Do not load a case in this orientation shot. | Fresh real workspace capture | `cursor-flyover` once; camera and pointer arrive together; four click SFX maximum | Reframe A1/A2, B · DEMO, Run and evidence entry at 150–180% effective scale | Four short crop inserts from the same fresh capture |
| S05 | `00:43.2–00:57.6` / `72–96` | Demonstrate PG-E only through the two custom file inputs: click **Choose MEP IFC**, open a neutral capture-staging folder and select the PG-E MEP file; click **Choose structural IFC** and select the matching structure file; confirm shared coordinates; then Run the actual deterministic calculation and establish the clinic in 3D. Never load PG-E from the example selector in the film. | Fresh continuous product + native file-picker capture | Native screen movement; no generated replacement; allow both file selections and the authentic processing state to breathe | Both fixed roles, two selected public filenames, shared-coordinate confirmation and Run action; no username/repository path in the picker | Pre-recorded real take of the same two staged PG-E files; never replace the file-picker actions with a dropdown selection |
| S06 | `00:57.6–01:12.0` / `96–120` | Calculation completes; counts land, then six views accelerate into the selected result list and stop. | Real PG-E result capture | `beat-cut-moves.beat-cut-accelerando` once; `16→12→8→6→4f`, then long hold | Counts `4 / 1 / 11 / 72`; caption never covers summary | Static summary followed by one slow push |
| S07 | `01:12.0–01:26.4` / `120–144` | Select a clash record; 3D focuses the pipe and structure. Freeze product time while the editorial camera arcs around the evidence plane, then resume. | Real PG-E capture | `tension-camera-moves.bullet-time-freeze-orbit` once; product pixels remain unaltered during freeze | Selected pair, status and component types | Straight real 3D orbit plus focused-record crop |
| S08 | `01:26.4–01:40.8` / `144–168` | Move from the clash evidence to the warning boundary; stop and annotate `>2 mm` and `<50 mm`. | Real evidence drawer capture | `speed-ramp-freeze.freeze-annotate` once; two annotations in one freeze, then dissolve | Exact threshold signs are mandatory; show `50 mm` equality as non-warning only if readable | Two static 200% crops with simple rule-line draw |
| S09 | `01:40.8–01:55.2` / `168–192` | Open the deliberately geometry-free record; the interface states NOT_EVALUATED and why. Contract chips for units/coordinates/reliability appear beside the real evidence. | Real PG-E evidence capture + editorial labels | Native 2.5D separation; no extra time-freeze card | Reason text and `NOT_EVALUATED`; no raw file path/GUID | Controlled `C08` failure-closed record if the clinic reason text is too dense |
| S10 | `01:55.2–02:09.6` / `192–216` | Development/evaluation surface: `8/8` three-way agreement and `9/9` clearance agreement, immediately followed by the bounded-evidence disclaimer. | Real development page / evidence docs | `spotlight-hero-card` once, adapted to one evidence card; one contour-light pass, not two decorative glints | Metrics and “controlled acceptance” qualifier together | Clean split-screen of evaluation table and scope sentence |
| S11 | `02:09.6–02:24.0` / `216–240` | Use the visible B · DEMO control: point-select `Review pack · C01 / C03 / C05 / C08`, click **Load example**, run the four-record deterministic pack as one controlled batch, then show the exact minimal-field preview, fresh unchecked→checked consent, one real provider request, labelled explanation and unchanged deterministic summary. Waiting time may be honestly compressed between recorded states, but success may never be fabricated. Never use native file pickers for the controlled pack. | Separate fresh real workspace capture; external AI only here | No repeated named card; editorial crop follows the actual point-selection interaction | Dropdown option, Load example, `1/1/1/1`, minimal fields, provider disclosure, fresh consent and unchanged deterministic facts | If provider fails: show the real labelled local fallback and state that AI is unavailable; never fake success |
| S12 | `02:24.0–02:38.4` / `240–264` | Supported-contract words lock around the product: IFC4 STEP / metre / shared coordinates / pipe vs wall & beam. Then “feasibility prototype” takes priority. | Real development/evidence page + typography | Restrained editorial typography and shallow multiplane move; no new library signature | “Prototype, not certification” visible before cut | Static SF03 plus scope list |
| S13 | `02:38.4–02:52.2` / `264–287` | Return from evidence detail to the canonical brand mark. Final line appears in three measured beats: Geometry. Result. Evidence. Then the tagline. | SF01/SF02 palette + canonical logo | `white-flash-logo-simplify-cut` once, recoloured to brand coral/ink/cream; flash stays below comfort threshold | Final tagline centred; captions end before logo hold | Direct cream-field logo resolve without flash |

### 5.1 Frozen motion-source manifest

All nine named cards and style keys were revalidated against `gallery/api/library.json`. `docs/vg-shotcraft-manifest.json` freezes the exact card document, demo TSX, reference-media path and SHA-256 for each selected motion recipe. G7A may adapt layout, product sources and brand tokens, but must preserve each recipe's verified timing, easing, masks and documented failure-avoidance parameters. S05, S09, S11 and S12 remain native/editorial capture moves rather than invented Gallery cards.

## 6. Keyframe previsual table

VG now includes thirteen static `1920 × 1080` keyframes plus one `3840 × 2160` contact sheet. They are disposable composition proxies, not final video frames. Several intentionally reuse earlier project previews or styleframe rasters as a time-saving VG expedient. **No current keyframe bitmap is approved to enter the G7A timeline as product evidence.** Generated UI is not substituted for product operation.

- Contact sheet: `artifacts/vg/keyframes/VG-keyframe-table-4k.png`
- Individual frames: `artifacts/vg/keyframes/KF01-*.png` through `KF13-*.png`
- Rebuild recipe: `scripts/build-vg-keyframe-board.py`

G7A treats each keyframe only as the composition target for its matching shot. Before implementation, every placeholder must be replaced with the exact current product surface and state below. Motion may be refined, but hierarchy, product state, claim placement and caption-safe area may not drift without an explicit reason recorded in the take notes.

| Shots | Mandatory final replacement source | Acceptance guard |
|---|---|---|
| S01 / S13 | Rebuild editorial layers from the canonical logo and verified brand tokens | No flattened VG styleframe used as the final brand scene |
| S02–S04 | Fresh current homepage/workspace capture at the approved language, style and theme | Current labels and layout match the live product; no `app/ui/previews/*` raster remains visible as product evidence |
| S05–S09 | Fresh PG-E take loaded through the two native file pickers, followed by the matching calculation/results/evidence states | File roles, filenames, shared-coordinate confirmation, `4/1/11/72`, selected records and 3D focus all belong to the same take chain |
| S10 | Fresh current development/evaluation surface plus verified editorial claim layers | `8/8`, `9/9` and the controlled-evidence qualifier remain together |
| S11 | Fresh point-selected `Review pack · C01 / C03 / C05 / C08` take plus the separately consented AI interaction | No PG-E data, no native file picker, exact `1/1/1/1`, preview and fresh consent visible |
| S12 | Rebuilt editorial typography from the frozen supported-contract claims | No stale screenshot required; every word matches F01/F09 |

G7A asset-ingest fails if a shot has no `FINAL_SOURCE_VERIFIED` record or if a reused VG/legacy raster remains visible as product evidence. This explicit replacement gate is the practical consequence of using the keyframe table as a fast preproduction aid.

## 7. Visual styleframe system

The three frames are not competing redesigns; they are a single dark→light→dark chapter system:

| Frame | Role | Guardrails |
|---|---|---|
| `SF01-opening.png` | Brand question and final traceability motif | Deep ink, one coral accent, large negative space, no imitation Apple logo/type assets |
| `SF02-product.png` | Product body and deterministic calculation | Real workspace image, warm cream field, exact PG-E counts, crisp browser UI |
| `SF03-evidence-ai.png` | Evidence boundary and AI separation | Real/faint product backdrop, explicit consent boundary, no suggestion that AI calculates or rewrites results |

Files: `artifacts/vg/styleframes/SF01-opening.png`, `SF02-product.png`, and `SF03-evidence-ai.png`. Editable sources remain in the same directory.

## 8. Capture list, privacy and continuity

### 8.1 Approved material set

- Public/synthetic project surfaces only: homepage, workspace, development/evaluation surface, controlled G2/G3C data, synthetic PG-E clinic, canonical product logo and project-owned screenshots.
- PG-E is approved for the deterministic product demonstration only. It is specifically excluded from the AI request because the record set is too large and outside the six-record cap.
- The AI shot uses exactly `C01/C03/C05/C08`, one record each for CLASH / WARNING / CLEAR / NOT_EVALUATED.
- External gallery samples are motion references only. No third-party sample footage, logo, screenshot or typography is copied into the film.

### 8.2 Privacy checklist for every G7A capture

- Clean browser profile; hide bookmarks, extensions, account avatar, notifications, tabs and unrelated history.
- No local filesystem path, Windows username, repository path, commit credential, API key, provider key, console payload or private Sites administration surface.
- No customer/clinic/patient data: PG-E is programmatically generated CC0-style synthetic project material, not a real clinic project.
- Crop GUIDs and hashes unless a short controlled alias is the intended evidence; prefer `R01–R04` for AI.
- Verify language, theme and browser width before each take; invalidate stale product state between input changes.
- Capture at a high enough raster scale that 180–260% editorial zoom remains sharp.
- Record one continuous deterministic calculation take plus isolated pickups; never splice a generated loading/result state into the continuous take.
- Keep the AI call separate from PG-E and record the pre-send preview before consent is checked.

### 8.3 Continuity state sheet

| Sequence | Required state |
|---|---|
| Homepage | English / Engineering minimal / selected dark or light theme according to shot |
| PG-E start | No stale results; PG-E loaded through **Choose MEP IFC** and **Choose structural IFC** from a neutral public staging folder; shared-coordinate confirmation visible and performed in take; never use the example dropdown |
| PG-E result | Exact final exclusive counts `4 / 1 / 11 / 72`; selected clash and warning IDs recorded in take notes |
| Evidence | One clash, one warning, one NOT_EVALUATED reason; drawer and 3D focus agree with selected row |
| Controlled AI | Point-select `Review pack · C01 / C03 / C05 / C08` in B · DEMO and click **Load example**; deterministic summary `1/1/1/1`; preview shown; consent initially unchecked; one request only; never use native file pickers |

## 9. Subtitle and on-screen copy plan

- English captions reproduce the approved narration exactly, with punctuation adjusted only for readability.
- Simplified Chinese captions use the table in section 4 as the translation baseline; a human pass checks threshold signs, counts, IFC terms and the difference between “clear” and “clearance”.
- One caption cue contains one complete idea, normally one or two lines, with at least `6` frames between unrelated cue changes. Avoid orphaning numbers or comparison signs.
- Keep captions inside the lower `10–12%` safe area but move them above any product control or evidence value. On-screen title copy is not duplicated as a simultaneous full caption if the narration can pause.
- Deliverables in G7A: clean master plus manually checked `en.srt` and `zh-CN.srt`; a Chinese burn-in review derivative is optional/fallback, not the canonical clean master.
- The final YouTube caption upload and public playback checks remain G7B, not VG or G7A.

## 10. Sound-effects decision

The user selected `P1 Dry Precision`. SFX stay sparse and functional:

| Palette | Character | Intended cues | Use limit |
|---|---|---|---|
| `P1 Dry Precision` — **selected** | Short, dry, technical; least “trailer-like” | click, evidence lock, result settle | clicks only at meaningful state changes; no decorative chatter |
| `P2 Soft Glass` | Brighter, more premium, slightly more audible | consent tick, light scan, logo resolve | glass tone at most twice |
| `P3 Cinematic Air` | Wider whoosh and low impact; strongest film character | chapter move, counts landing, final resolve | low impact at most twice; never under numeric narration |

P2 and P3 are retained only as rejected/backup auditions. P1 remains a VG reference rather than final sound design; G7A may refine its synthesis and level while preserving its dry, restrained character. Files and recipe live under `artifacts/vg-auditions/sfx/` and `scripts/generate-vg-sfx-auditions.py`.

## 11. License and provenance ledger

| Asset | Source / provenance | VG licence decision | G7A requirement |
|---|---|---|---|
| Product UI, logo, screenshots, generated IFC fixtures | This repository; synthetic/project-owned | Approved in scope | Re-capture from clean state and retain source-path list |
| PG-E clinic | Programmatically generated synthetic project; documented in `docs/pg-e-engineering-uat.md` | Approved for deterministic display; excluded from AI | Show no claim that it is a real client clinic |
| M2 `Masking the Masters` | Eugenio Mininni, Mixkit Stock Music | Mixkit currently lists the track under its Free License and permits music use in YouTube/video projects; exact downloaded file and a dated licence snapshot must be frozen before final use | Record source URL, download date, file SHA-256 and licence snapshot |
| V2 Ava audition | Temporary Edge/Ava audition | Timbre reference only; not the distribution master | Do not use the Edge audition as final narration |
| Selected zero-cost V2 voice H | `hexgrad/Kokoro-82M` model and voice packs, Apache-2.0 | **Selected:** local `af_heart`; `af_bella` is not selected | Freeze model/voice hashes, synthesis settings, pronunciation overrides, final WAV SHA-256 and Apache-2.0 notice |
| Rejected C audit | Resemble AI `Chatterbox`, MIT; no reference audio or cloning | Rejected: actual output was male (`117.6 Hz` median), contrary to the required female voice | Retain only as audit evidence under `V2-zero-cost-chatterbox-default-male-rejected.wav`; never use in the film |
| Unselected backup D | Hugging Face Parler-TTS Mini v1.1, Apache-2.0; named built-in speaker `Laura`, controlled by description and no reference audio | Not selected; audition retained as a zero-cost backup and provenance record | Do not use unless a later user decision explicitly reopens the frozen H selection |
| SFX P1 | Original procedural synthesis | Selected; project-generated with no external recording | Preserve the P1 character, recipe and rendered source files |
| video-shotcraft cards | Local open-source skill/library used as motion recipes | Recipe/code reference only; no gallery sample media copied | Preserve attribution/license record for any code actually incorporated |

## 12. Fact and claim ledger

| ID | Claim | Authoritative local source | On-screen constraint |
|---|---|---|---|
| F01 | Deterministic browser/Web IFC feasibility project; not a certified engineering compliance tool | `README.md:7` | Use “feasibility prototype”, never “certified”, “compliant” or “production-ready” |
| F02 | Two IFC inputs are processed locally in the deterministic route | `README.md:13`, `app/ui/preferences.mjs:119–139` | Do not imply AI processes the model bytes |
| F03 | Formal narrow boundary and failure closing | `docs/evaluation.md:58–60`, `README.md:152–161` | Pair support wording with NOT_EVALUATED, not CLEAR |
| F04 | Workspace connects calculation, results, evidence drawer and real IFC 3D focus | `README.md:13`, `docs/pg-e-engineering-uat.md:81–84` | The selected row, drawer and 3D pair must match in the take |
| F05 | PG-E geometry, `88` records and final `4/1/11/72` counts | `docs/pg-e-engineering-uat.md:11`, `:49`, `:81–84` | State that the clinic is synthetic; do not claim all 88 pairs have independent authored truth |
| F06 | Hard clash strictly `>2 mm`; clearance warning `<50 mm`; equality does not warn | `README.md:154–160`, `docs/g3b-tolerance-semantics.md`, `docs/g3c-clearance-semantics.md` | Signs must remain visible and correct |
| F07 | Controlled `8/8` three-way agreement and `9/9` clearance agreement; not arbitrary-project accuracy | `docs/evaluation.md:3–9`, `:20–24`, `:58–60` | Qualifier must appear in the same sequence as metrics |
| F08 | AI is optional/separate, previews minimal fields, requires fresh consent, caps at six records and cannot alter deterministic facts | `README.md:15`, `README.md:168`, `docs/g4ai-architecture.md:104–112` | Show `C01/C03/C05/C08` only; never PG-E; show pre-send preview and unchanged summary |
| F09 | Supported core: IFC4 STEP, unprefixed metre units, established shared coordinates, IfcPipeSegment against IfcWall/IfcBeam | `docs/evaluation.md:60`, `README.md:152–163` | Avoid broad “IFC support” shorthand |

## 13. G7A model and execution configuration

The quality-first recommendation for the primary Codex production task is:

| Work | Model / effort | Decision |
|---|---|---|
| Composition architecture, shot implementation, timing, real-asset integration and final audiovisual review | `gpt-5.6-sol`, `xhigh` | **Primary configuration.** It is the current flagship complex-work model; xhigh is appropriate for the multi-constraint visual/code task without the latency of max on every iteration |
| Routine render/test/fix loops with already-frozen intent | Keep `gpt-5.6-sol`, lower temporarily to `high` only when iteration speed becomes the blocker | Avoid changing the model family mid-production; lower effort only for bounded mechanical adjustments |
| Final pre-export audit | `gpt-5.6-sol`, `max` for one bounded pass only if schedule and available usage permit | Use once for fact/privacy/licence/timing failure search, not for ordinary shot tuning |

Remotion plan: one `1920 × 1080`, `30 fps`, `5,166-frame` master composition; scene boundaries come from the beat JSON and section 5; each scene maps to one static keyframe and one approved video-shotcraft card or native real-capture move. Use Remotion/video-shotcraft freely. Other installed skills/plugins and free quotas are authorized for G7A when they improve quality, but paid purchases/overages, publishing, access changes and new privacy exposure still require separate authority. External generative video is optional only for abstract texture or transition material; it must never fabricate product UI, calculation or evidence.

## 14. G7A entry checklist — creative decisions satisfied

The user approved the first, second, third and fifth items in the preceding review and completed the only remaining decision by selecting **H** on 2026-08-30. The complete VG combination is therefore frozen:

1. The 13-line English script and corresponding Chinese translation.
2. The `172.2 s` shot list, including PG-E only for deterministic display and `C01/C03/C05/C08` only for AI.
3. The unified SF01→SF02→SF03 visual system and one-use motion-card allocation.
4. M2 plus the V2 performance direction, final zero-cost female voice **H (`Kokoro af_heart`)**, and the voice/music level relationship.
5. Selected SFX palette `P1 Dry Precision`.

VG is `PASS / PUBLIC_CHECKPOINT_VERIFIED`. G7A is `READY / NOT_STARTED`: this checkpoint produced no final narration, official capture, live AI request, Remotion implementation, mix, edit or render. Those actions begin only when G7A is explicitly started.
