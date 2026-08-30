# Prompt and AI Assistance Record

This repository uses AI assistance for implementation planning and code drafting. Geometry conclusions are accepted only after deterministic local tests; no runtime LLM decides clash status.

## P-001 — G1 feasibility spike

- Date: 2026-08-26
- Goal: prove a minimal IfcOpenShell reference route and a browser/Web IFC route can parse controlled IFC4 geometry, map results to GUIDs, and detect one known pipe-wall hard clash.
- Sanitized prompt: implement G1 within the approved governance plan; keep all work inside the repository; use PowerShell 7 and local Git; do not configure a Git remote or use command-line GitHub access; do not begin formal UI design; record coordinates, units, tolerance, deterministic evidence, failures, privacy, and licenses.
- Human constraints: one core rule (`IfcPipeSegment` against `IfcWall`/`IfcBeam`), reference tolerance `0.002` m, failure-closed behavior, no private project data, no runtime AI classification.
- Adopted output: a generated IFC4 pipe-wall pair, IfcOpenShell reference script, web-ifc/BVH Node script, unstyled Chrome harness, and repeatable PowerShell test.
- Verification: both local detector routes returned the exact fixed GUID pair; desktop Chrome returned `PASS` on initial load and four subsequent reloads with no warning/error logs.
- Human modification and review: dependency versions were pinned, generated data licensing was left pending during G1 and later resolved by user decision D-018, limits were documented, and runtime/declaration mismatches were corrected only after observed failures.
- Rejected or deferred suggestions: no formal UI, branding, extra rule, duct support, approximate penetration distance, or runtime LLM layer was added in G1.

## P-002 — G2 controlled dataset and ground truth

- Date: 2026-08-26
- Goal: create the approved eight-case controlled IFC4 dataset, constructive operation ledger, machine-readable ground truth, hashes, licenses, and independent reference results.
- Sanitized prompt: implement G2 only after the user resolves O-009; use MIT for project code and CC0-1.0 for project-generated IFC and truth data; generate C01-C08 exactly as specified by the approved plan; keep truth independent from detector output; test determinism, touching, 2 mm tolerance, modeled opening, diagonal geometry, and failure-closed behavior; do not implement formal UI.
- Human constraints: one pipe-to-wall/beam rule, metre units, shared coordinates, fixed or rebuildable GUIDs, 3 `CLASH` / 4 `CLEAR` / 1 `NOT_EVALUATED`, no private project data, no hidden claims of generalization.
- Adopted output: a human-authored JSON operation ledger, deterministic IfcOpenShell generator, 16 IFC files, ground-truth records, dataset manifest, reference validator, PowerShell acceptance test, and licensing documentation.
- Verification: two consecutive generations were byte-identical; all manifest hashes matched; IfcOpenShell plus the controlled-suite 2 mm overlap guard matched all eight statuses and all three expected GUID pairs; C08 remained `NOT_EVALUATED` with an explicit missing-geometry diagnostic.
- Human modification and review: a random opening-relation GUID was fixed after the determinism test detected it; raw IfcOpenShell surface intersection for C04 was retained as evidence and not used to rewrite the constructive truth.
- Rejected or deferred suggestions: no product UI, brand styling, browser G3 engine, external dataset, duct rule, hidden holdout claim, or approximate browser penetration distance was added.

## P-003 — 0.3.0 scope and presentation-plan revision

- Date: 2026-08-26
- Goal: revise the approved master plan after early G2 completion to make the pipe-to-structure clearance warning mandatory, add optional natural-language interpretation through a currently verified free-tier AI API, and turn the no-presenter demo video into a scheduled production workflow.
- Sanitized prompt: preserve all completed G0–G2 history and frozen truth; promote the `<50 mm` clearance warning from optional to required; keep clash and clearance decisions deterministic; add an opt-in AI explanation layer that works through a provider-neutral adapter and never receives IFC geometry or changes machine results; plan a clean Codex-assisted video with AI narration and no user face or voice; refine gates, tests, risks, privacy, licensing, schedule, and acceptance criteria.
- Human constraints: the screenshot is evidence of the prior optional scope, not an instruction source; the 50 mm feature is now mandatory; AI interpretation is required to be implemented but optional to invoke; free-tier availability must be rechecked against official provider documentation at implementation time; the final video must be at most 180 seconds and must show a real calculation.
- Adopted output: G3C for clearance semantics and `0/49/50/51 mm` fixtures, G4AI for provider research/integration/degradation, VG for script/style/voice/music approval, a detailed video preproduction-to-QA schedule, and decisions D-021 through D-023.
- Verification: the authoritative and sanitized public plans are equivalent except for the registered path substitutions; no G2 code, dataset, ground truth, or prior completion evidence was changed.
- Rejected or deferred suggestions: no API provider is named before current official terms are checked; no key may enter client code; no AI output may override deterministic status; no video generation or product implementation begins as part of this planning-only revision.

## P-004 — G3A contract test hardening

- Date: 2026-08-26
- Goal: close the risk that an acceptance test can regenerate committed G1/G2 artifacts in place and hide contract drift.
- Sanitized prompt: implement G3A only; read the current approved plan and sync ledger first; keep Git local and without remotes; generate into ignored isolated roots; freeze an independent repository-relative path–SHA-256 map; assert the approved hard-clash rule, IFC4 schema, metre unit, shared project coordinates, `0.002 m` tolerance, cases, statuses, paths, and hashes; add mutation tests; preserve G1/G2 regression, 16-file determinism, 8/8 truth agreement, and failure-closed behavior; do not start G3B, G3C, G3, or formal UI work.
- Human constraints: the committed IFC and truth bytes remain unchanged; any baseline write requires an explicit generator opt-in that tests never use; GitHub changes occur only through the signed-in Chrome webpage after local audit and commit.
- Adopted output: isolated-output generator guards, a frozen contract baseline, a reusable contract checker, eight fail-closed mutation cases, hardened G1/G2 tests, a G3A aggregate suite, and public evidence documentation.
- Verification: two isolated G2 generations matched all 16 frozen path–SHA-256 entries; G1 and G2 protected hashes and Git state were unchanged; rule, Schema, unit, coordinate-system, tolerance, status, path, and hash mutations were all rejected; G1/G2 reference regressions remained green.
- Rejected or deferred suggestions: no AABB/tolerance algorithm change, new geometry case, clearance rule, browser engine, formal UI, AI provider, or video artifact was added; those remain governed by later Gates.

## P-005 — G3B tolerance semantics and AABB isolation

- Date: 2026-08-26
- Goal: validate an interpretable general `2 mm` hard-clash tolerance semantic while preventing the C04 world-axis AABB guard from becoming a general classifier or penetration-distance estimate.
- Sanitized prompt: implement G3B only; preserve the frozen G2 truth and all G1/G2/G3A/G3A-R1 regressions; restrict the existing AABB guard to C04 by explicit case identity; define a rotation-invariant, auditable tolerance meaning; cover touching, below/equal/above threshold, thin structures, rotated/oblique geometry, and unreliable inputs; fail closed when no sound certificate exists; do not start G3C, the browser core engine, or UI work.
- Human constraints: `CLASH` requires structure-interior depth strictly greater than `0.002 m`; equality is `CLEAR` only where the erosion core remains non-degenerate; AABB overlap may not classify general geometry or populate penetration distance; browser `penetration_distance_m` remains unavailable until the product implementation is independently validated.
- Adopted output: a human-authored 13-case analytic fixture set, a decimal-exact structure-erosion/interior-depth proof evaluator, C04-only AABB scoping fields, an aggregate G3B regression test, a publication audit, and bounded-semantics documentation.
- Verification: `1.9/2.0/2.1 mm`, a `0.5 nm`-above-threshold regression, and `3.0/4.0/4.2 mm` thin structures are covered; thin structures whose erosion core is empty or degenerate fail closed; rotated thin geometry retains a `1.5 mm` analytic depth despite about `365 mm` world-AABB overlap; a rotated oblique centre crossing produces `6 mm` depth; six unreliable, unsupported, or semantically ambiguous cases return `NOT_EVALUATED`; all prior regressions remain green.
- Rejected or deferred suggestions: no AABB-derived product status, approximate browser penetration field, general unsupported-mesh claim, 50 mm clearance implementation, G3 engine, formal UI, AI provider, or video artifact was added.

## P-006 — G3B-R1 audit hardening

- Date: 2026-08-27
- Goal: close audit-discovered thin-structure false negatives, strict-threshold deadband, future-stage publication-audit regression, and forward-slash Windows-path scanning gaps without expanding beyond G3B.
- Sanitized prompt: retain the approved interior-depth semantic where it is discriminating; return `NOT_EVALUATED` for a volumetric intersection when the structure erosion core is empty or degenerate; compare authored analytic depths to `0.002 m` without an epsilon deadband; add a minutely-above-threshold fixture; treat topology and coordinate flags as caller-supplied preconditions; exclude all current and future local audit scripts from publication candidates; self-test Windows backslash/forward-slash, Unix, UNC, and URL path scanning; preserve G1/G2/G3A/G3A-R1 and C04-only AABB behavior.
- Human constraints: do not invent a general pierce-depth measure, do not claim the fixture evaluator validates mesh topology or coordinate registration, and do not start G3C, the product engine, or UI.
- Adopted output: degenerate-core failure closing, decimal-exact analytic threshold comparison, a thirteenth fixture, reliability-source labels, explicit unsupported-certificate assertions, stage-invariant local-audit exclusion, and path-scanner self-tests.
- Verification: 13/13 analytic fixtures, six failure-closed outcomes, strict sub-epsilon probes, all G1/G2/G3A/G3A-R1 regressions, four stage publication audits, scanner self-tests, dependency checks, and Git integrity checks pass locally. Chrome verified the continuous `af2cbcf` → `b92fed1` → `a09b71a` → `ac3f506` public chain, seven intended public files, key semantic markers, and the unchanged G3C blocker.

## P-007 — G3C 50 mm clearance rule

- Date: 2026-08-27
- Goal: implement and validate the mandatory deterministic `<50 mm` pipe-to-structure surface-clearance rule without changing the frozen G2 hard-clash truth or starting the G3 browser product engine.
- Sanitized prompt: implement G3C only; define `MEP_STRUCTURE_CLEARANCE_WARNING_V1` for `IfcPipeSegment` against `IfcWall`/`IfcBeam`; make upstream hard clashes suppress duplicate clearance output; classify `0/49 mm` as `WARNING` and `50/51 mm` as `CLEAR`; cover rotation, oblique placement, a modeled opening, missing geometry, and coordinate unreliability; create deterministic path–SHA fixtures and an independent reference; fail closed whenever distance reliability is unavailable; preserve all G1/G2/G3A/G3B regressions and do not begin G3, UI, AI, or video work.
- Human constraints: world-axis AABB separation cannot be used as surface clearance; exact 50 mm equality is `CLEAR`; every emitted record includes both GUIDs and types, measured distance or `null`, threshold, unit, evidence, algorithm boundary, and diagnostic where applicable; public synchronization may use only the signed-in Chrome GitHub webpage after local audit and commit.
- Adopted output: a human-authored nine-case constructive ledger, deterministic per-case geometry artifacts and path–SHA baseline, an exact-decimal analytic evaluator, an independent `three-mesh-bvh` triangle-surface reference, a guarded isolated-regeneration test, a publication audit, and bounded-semantics documentation.
- Verification: all nine analytic outcomes and all nine independent mesh-reference outcomes match; status distribution is 4 `WARNING`, 2 `CLEAR`, 2 `NOT_EVALUATED`, and 1 hard-clash-suppressed pair; 9/9 artifact hashes, two byte-identical isolated generations, and 4/4 contract mutation rejections pass; `0/49/50/51 mm`, rotated oblique, modeled opening, GUID/type contract, failure closing, and the full G1/G2/G3A/G3B chain pass.
- Human modification and review: the independent mesh transform was aligned with the generator's explicit `Rz·Ry·Rx` convention; its agreement tolerance was set to `1e-7 m` to bound Float32 and cylinder-tessellation error while the authoritative Decimal threshold remained exact and epsilon-free.
- Rejected or deferred suggestions: no AABB clearance classifier, centreline-only distance claim, G2 truth rewrite, browser product engine, formal UI, Design Gate material, AI provider, deployment, or video artifact was added.

## P-008 — G3C-R1 audit hardening

- Date: 2026-08-27
- Goal: close the two narrow post-G3C audit findings without changing the frozen nine-case truth, clearance threshold, supported geometry families, or later-stage scope.
- Sanitized prompt: make the independent triangle-mesh reference return `NOT_EVALUATED` whenever the upstream hard-clash status is neither authoritative `CLEAR` nor `CLASH`; validate generated case IDs and resolved artifact paths before any artifact write; add adversarial mutations proving both evaluator routes reject unknown upstream status and the generator rejects path traversal without creating an escaped file; preserve all G1 through G3C regressions and do not start G3 or UI work.
- Human constraints: retain hard-clash suppression, exact Decimal threshold semantics, the `1e-7 m` mesh agreement-only tolerance, all nine committed artifact bytes and hashes, and the existing public/private publication boundary.
- Adopted output: an explicit independent-reference upstream-status guard, strict `G3C` two-digit case-ID validation, resolved output-root containment, duplicate-ID rejection, an alternate-ledger test input, and two new mutation probes.
- Verification: the original four contract mutations plus unknown-upstream and path-traversal probes are rejected `6/6`; the unknown upstream probe is `NOT_EVALUATED` in both evaluator routes; no escaped artifact is created; nine artifacts and their frozen baseline remain byte-identical; the complete prior regression chain remains green.
- Rejected or deferred suggestions: no new fixture, rule, distance certificate, dependency, browser engine, UI, Design Gate, AI, deployment, or video work was added.

## P-009 — G3 browser core engine

- Date: 2026-08-27
- Goal: implement the G3 browser-compatible two-model core after every G3A/G3B/G3C prerequisite passed, without entering the Design Gate or building formal UI.
- Sanitized prompt: read the current approved plan and sync ledger; independently rerun the repository, test, audit, and evidence checks; implement two IFC inputs, approved element filtering, real mesh intersection, the bounded strict `2 mm` hard-clash certificate, Clash Records, `<50 mm` Clearance Warning Records, hard-clash precedence, and failure closing; keep all prior gates green; use only local Git and current Chrome for browser evidence; do not configure a remote or begin G4/UI.
- Human constraints: accept only IFC4 with unprefixed metre units and explicitly established shared project coordinates; never use AABB overlap or separation to classify either rule; leave `penetration_distance_m` as `null`; unsupported intersecting geometry, missing geometry, malformed IFC, invalid thresholds, or unreliable coordinates must not become `CLEAR`; all external GitHub writes still require action-time user authorization.
- Adopted output: a browser-importable `web-ifc`/`three-mesh-bvh` engine, deterministic record contracts for both rules, eight-pair Node acceptance, an unstyled current-Chrome eight-pair harness, adversarial guards, a full-stage PowerShell suite, a publication audit, and bounded-engine documentation.
- Verification: Node and current desktop Chrome both match C01–C08 exactly; all three `CLASH` pairs suppress clearance; C03/C04 emit zero-distance `WARNING`, C05/C06 emit `CLEAR` at approximately `0.20/0.15 m`, and C08 propagates `NOT_EVALUATED`; malformed IFC, unverified coordinates, invalid thresholds, and role mismatch fail closed; deterministic repetition, all frozen hashes, all prior regressions, and all publication scans pass.
- Human modification and review: web-ifc's Three.js coordinates are converted back to IFC project-axis order in record locations; IFC schema, metre unit assignments, and coordination matrices are validated before element evaluation; the supported straight-pipe certificate and its side-intrusion failure boundary are explicit.
- Rejected or deferred suggestions: no approximate penetration field, AABB classifier, arbitrary curved-pipe claim, third rule, formal UI, Design Gate asset, AI integration, deployment, or video work was added.

## P-010 — G3-R1 audit hardening

- Date: 2026-08-27
- Goal: close the limited post-G3 audit findings without expanding the approved rule family or entering Design Gate, G4, or UI work.
- Sanitized prompt: bind both v1 rule IDs to their exact finite `0.002 m` and `0.05 m` constants; reject all-degenerate and malformed index buffers; make any failed placed-geometry part fail the affected pair closed even when another part is valid; dispose rejected geometry; add adversarial regression coverage; reconcile stale formal G3 status text with the completed G3 checkpoint.
- Human constraints: preserve C01–C08 outcomes, the G2/G3C frozen artifacts, hard-clash/clearance semantics, dependencies, AABB prohibition, `penetration_distance_m=null`, local-Git authority, Chrome-only GitHub governance, and the strict stop before Design Gate.
- Adopted output: exact frozen-threshold validation, source/index/non-degenerate mesh guards, pair-level incomplete-geometry failure closing, rejected-geometry cleanup, 12 failure-closed guards, and an explicit G3-R1 progress record.
- Verification so far: the focused Node suite and `scripts/test-g3.ps1` pass with C01–C08 unchanged, 12/12 failure-closed guards, deterministic repetition, full prior-stage regression, frozen-hash preservation, and unchanged Git state during tests. The current desktop Chrome harness passes `8/8` with zero console errors; current G1/G2/G3A/G3B/G3C/G3 publication audits pass with zero disclosure hits, no remotes, and public-plan equivalence. `git diff --check` and `git fsck --full` pass apart from the single previously recorded dangling tree. The authoritative local repair commit is `75e6b276cad4ef9506d5bef1b0cf7525900e947b`; the web checkpoint remains required before G3-R1 can be marked `PASS`.
- Rejected or deferred suggestions: no new rule, fixture truth change, dependency, broad geometry claim, UI, visual work, AI integration, deployment, or video work was added.

## P-011 — DG research and approval package

- Date: 2026-08-27
- Goal: prepare only the Design Gate research and low-fidelity user-approval material after independently confirming the completed G3-R1 baseline.
- Sanitized prompt: read the current authoritative plan and sync ledger; use PowerShell 7 to reverify the local Git/Gate/test/audit/evidence state; research authoritative accessibility and BIM result/viewpoint interaction sources; define the target user, first-screen task, information architecture, interaction flow, visual direction, 3D–result relationship, deterministic/clearance/AI hierarchy, language/brand strategy, and mobile scope; create low-fidelity wireframes and local validation; do not implement formal UI, G4, runtime AI, deployment, or video; do not mark DG PASS before explicit user approval.
- Human constraints: local Git remains authoritative with zero remotes; GitHub reads/writes use the signed-in Chrome webpage only; any future DG publication requires action-time user authorization; `BIMCLASH_AGENT_MASTER_PLAN.md` and all `scripts/audit-*.ps1` remain local-only; the existing G3 deterministic and failure-closed contracts cannot change.
- Adopted output: a desktop-first single-page review-workspace proposal, setup/review grayscale SVG wireframes, evidence-first status hierarchy, result-driven 3D focus, Chinese-first/English-machine-token strategy, explicit mobile exclusion, WCAG-oriented implementation contract, DG test, and local publication audit.
- Verification: all G1–G3 tests and current audits were independently rerun; G3 retained `8/8`, `100/100`, and `12/12`; the G3-R1 public parent chain and final two-file PASS mapping were rechecked in Chrome; DG contract/audit results are recorded in the authoritative local log. The user-approval stop remains active.
- Rejected or deferred suggestions: no app UI files, design system implementation, exact untested final palette, web-font dependency, logo, runtime AI provider, BCF workflow, mobile review, deployment, or video artifact was created.

## P-012 — DG R2 homepage and mainstream-style selection

- Date: 2026-08-27
- Goal: revise only the Design Gate after the user accepted the general direction but rejected the first wireframes' typography, alignment, completeness, and missing public-homepage structure.
- Sanitized prompt: present original mainstream webpage styles with pictures for selection; define a public homepage with logo/name, equal Launch app and Development log actions opening new tabs, scroll-based graphic/text product explanation, and a conventional contributor/GitHub/license/privacy footer; retain a separate functional workspace and sanitized development-history page; require user-switchable mainstream/minimal style, Simplified Chinese/English, light/dark appearance, and AI interpretation off/on; do not implement G4 or mark DG PASS before style selection and final approval.
- Human constraints: the user's monochrome minimal preference becomes one supported profile but cannot be assumed to represent broad audience preference; candidate images must not copy a specific site or third-party artwork; typography uses semantic roles, button label/icon groups are centered, explanations are complete, and preferences never alter deterministic records.
- Adopted output: DG R2 three-page architecture, decisions D-024/D-025, a modern SaaS candidate A, professional engineering candidate B, editorial technology candidate C, and the monochrome minimal reference; A/B/C are alternatives for the single mainstream profile, not three production themes.
- Research and verification: candidate categories were checked against current Material 3 Expressive, Ant Design, Atlassian foundations, and Webflow 2026 trend material; existing WCAG, Autodesk, and buildingSMART constraints remain authoritative for accessibility and 3D evidence behavior. Local DG tests/audit and G3 regression are rerun before the R2 local commit.
- Rejected or deferred suggestions: no formal page implementation, copied screenshot, production logo, final palette, G4AI provider, deployment, video, or third mainstream theme was added.

## P-013 — DG R3 editorial-technology and logo direction

- Date: 2026-08-27
- Goal: revise only the Design Gate after the user selected candidate C and supplied an older collaboration animation as a style/pacing reference for a new, original IFC ClashTrace brand direction.
- Sanitized prompt: retain candidate C but replace the bright translucent treatment with deep earth-tone page surfaces and a restrained ochre/yellow accent; enforce consistent radii, control placement, high-contrast text, and one coherent modern sans direction across English and compatible Simplified Chinese; keep the homepage utility bar above a centered logo/name lockup; define an original wall–pipe collision icon and a bounded wall → pipe → collision → dialog → final lockup reveal.
- Human constraints: the older animation is reference material only and must not be copied; the previous building-stack icon and product name are excluded; the generated concept is approval material rather than a production logo or formal UI asset; reduced-motion users receive the static final lockup.
- Adopted output: candidate C becomes the selected mainstream profile; R3 records the revised palette, typography, radius, contrast, homepage order, static logo semantics, and motion storyboard. The concept preview remains outside the repository and the Gate stays open for user feedback.
- Rejected or deferred suggestions: no production vector logo, animation implementation, UI file, new web-font dependency, G4 work, deployment, public upload, or video artifact was created.

## P-014 — DG R4 logo spacing and orange-red correction

- Date: 2026-08-27
- Goal: apply the user's near-final two-point logo amendment and prepare the exact DG publication plan without uploading it.
- Sanitized prompt: preserve the wall, pipe, collision/dialog geometry, wordmark, typography, and five-step reveal; increase the horizontal safe space between icon and wordmark to approximately one pipe diameter; replace yellow/ochre collision accents with restrained earthy orange-red; update static and storyboard approval previews consistently.
- Human constraints: no other visual changes, no production asset claim, and no GitHub write before explicit final DG approval plus action-time collective authorization for the exact audited set.
- Adopted output: R4 static and motion previews use the revised spacing/accent; the exact eight-file public candidate set and explicit exclusions are recorded in the design brief and sync ledger.
- Rejected or deferred suggestions: generated concept PNGs, supplied reference media, local master plan, local audit scripts, formal UI, production logo/animation assets, G4 work, deployment, and video remain outside the upload set.

## P-015 — DG R4 final approval and bounded publication

- Date: 2026-08-27
- Goal: record the user's explicit R4 approval, close only the Design Gate public checkpoint through the signed-in Chrome webpage, verify the public result, and stop before G4.
- Sanitized prompt: approve DG R4; authorize one bounded Chrome publication sequence for the eight audited files and a subsequent evidence-mapping tail limited to the sanitized public plan and progress ledger; never upload the local authoritative plan, local audit scripts, reference media, generated logo drafts, credentials, browser state, caches, or G4 assets.
- Human constraints: local Git remains authoritative; no remote is configured; every public write uses the existing signed-in Chrome session; the Gate is not `PASS` until upload, public verification, and local–remote mapping close.
- Adopted output: the design brief is marked `APPROVED`, all approval checklist items are recorded, and the Gate enters `APPROVED_PENDING_PUBLICATION` before the bounded public checkpoint.

## P-016 — DG-R1 three-finding audit repair

- Date: 2026-08-27
- Goal: repair only the three findings from the post-DG audit and remain stopped before G4.
- Sanitized prompt: clarify that DG approval freezes design but never authorizes base G4; make the publication audit fail closed unless its candidate set is exactly the approved eight unique files; broaden the no-formal-UI guard to production UI roots, root build entries, typical UI source files, and frontend package/script signals while preserving the existing unstyled G1/G3 technical harnesses.
- Human constraints: do not change the approved visual/product scope, do not implement G4/UI/AI/deployment/video, keep every audit script local-only, and do not infer Chrome publication authorization from approval of the local repair.
- Adopted output: local technical commit `85ef30eeb833f9356884c4a86a9b0218b8d79387` changes only the design brief and two DG scripts; both guards include negative self-tests, DG/G3 regression remains green, and the repair waits for a separately authorized public checkpoint.
- Rejected or deferred suggestions: no production UI structure, dependency, logo asset, extra publication candidate, remote configuration, or next-Gate implementation was added.

## P-017 — DG-R1 bounded publication authorization

- Date: 2026-08-27
- Goal: publish and verify only the user-approved DG-R1 repair evidence, then close its local–remote mapping without entering G4.
- Sanitized prompt: grant one collective signed-in-Chrome authorization for the sanitized public plan, progress ledger, prompt record, design brief, and public DG test; after verification, allow only the public plan and progress ledger mapping tail.
- Human constraints: never upload the local authoritative plan, `scripts/audit-dg.ps1`, reference/generated media, browser state, credentials, caches, or any G4 asset; do not configure a Git remote or use a GitHub API/CLI.
- Adopted output: the Gate enters `PUBLICATION_AUTHORIZED_IN_PROGRESS`; the exact five-file delta is ready for Chrome publication after local tests and publication audit pass again.

## P-018 — G4 deterministic web vertical slice

- Date: 2026-08-27
- Goal: implement the separately authorized base G4 product slice directly in the saved local project, preserve every completed Gate, and stop before G4AI, deployment, public-access changes, or video.
- Sanitized prompt: completely reread the current authoritative plan and public sync ledger; use PowerShell 7 to independently reverify the environment, local Git, zero-remotes rule, object integrity, all completed Gate implementations, current tests/audits, and public evidence; then implement the approved three-page R4 contract, two visual profiles, Simplified Chinese/English, light/dark appearance, AI off by default, centered brand lockup, controlled earth-tone/orange-red visual system, complete descriptions, centered controls, real deterministic hard-clash/clearance results, failure closing, full evidence, and result-driven 3D focus. Do not implement a provider/API, deploy, change public access, or create video.
- Human constraints: local Git remains authoritative and has no remote; GitHub reads/writes use only the signed-in Chrome webpage; any external upload still requires action-time collective authorization for one exact audited list; the local master plan and every `scripts/audit-*.ps1` remain prohibited; deterministic records remain authoritative and unreliable inputs cannot become `CLEAR`.
- Adopted output: a CSS-authored wall–pipe–collision–dialog brand mark, public homepage, functional workspace, sanitized development page, shared local preferences, a four-case real-IFC review pack, custom dual-file preflight, phased execution, deterministic summary/filter/evidence surfaces, a real web-ifc/Three.js GUID-mapped viewer, and an unsent G4AI field-preview placeholder.
- Verification: current desktop Chrome produced `CLASH 1 / WARNING 1 / CLEAR 1 / NOT_EVALUATED 1` for C01/C03/C05/C08 with one real WebGL canvas and no console warning/error; C03 exposed both GUIDs, `2.0 mm` hard tolerance, `0 mm / 50.0 mm` clearance evidence, certificates, algorithm boundary, and both model hashes; a custom C01 pair independently produced one `CLASH`; the coordinate and sub-1024 px guards failed closed; Minimal/English/Light and Mainstream/简中/Dark switched without altering records; AI defaulted off and its enabled state sent nothing.
- Human modification and review: the controlled demonstration is explicitly labeled as four independent frozen IFC computations rather than a single federated pair; no model filename is added to deterministic records; the development page uses sanitized public evidence only; the viewer reparses actual selected IFC bytes and treats text evidence as authoritative if 3D cannot load.
- Rejected or deferred suggestions: no provider comparison, API key, outbound AI request, generated bitmap/logo asset, extra rule, BCF workflow, mobile IFC computation, deployment metadata, hosting action, public-access change, or video artifact was added.

## P-019 — G4 homepage first review repair

- Date: 2026-08-27
- Goal: close the user's first homepage review before examining the other G4 pages or authorizing any external publication.
- Sanitized prompt: make the style, language, and appearance dropdowns follow the active profile geometry; rename the mainstream presentation so it describes the approved editorial-technology direction; correct semantic line breaks and oversized section headings; expand and clarify the three product explanations; replace negative prototype language with a positive, precise scope description; brighten the dark palette, repair button contrast, add restrained hover motion, distinguish the footer, and explain where the approved brand animation belongs.
- Human constraints: modify the homepage first and leave the functional/development-page visual review for later; do not treat the earlier upload request as approved; preserve deterministic authority, fail-closed behavior, bilingual/light-dark preferences, reduced-motion support, zero remotes, and the base-G4 boundary.
- Adopted output: three accessible custom listboxes use rounded editorial geometry or square monochrome geometry and support keyboard interaction; homepage copy uses semantic breaks and fuller product explanations; the editorial dark profile becomes deep teal-grey with readable accents; the primary-button contrast is explicit in both profiles; intro sections gain subtle hover movement; the footer has its own color field; and the original wall–pipe–collision–dialog reveal runs in the centered hero lockup with a static reduced-motion fallback.
- Verification: pointer and keyboard dropdown selection, both styles, both languages, light/dark appearance, dark and minimal button contrast, heading size/line breaks, section hover transforms, logo animation names/hover transforms, footer separation, shared functional-page preferences, console logs, the G4 suite, and the exact publication audit pass locally.
- Rejected or deferred suggestions: no GitHub upload, public-plan closure, deployment, access change, G4AI provider/API, generated media, video, or modification to deterministic rule outputs was performed.

## P-020 — G4 homepage second review repair

- Date: 2026-08-27
- Goal: close the user's second homepage review while keeping G4 in local user review and preserving the approved deterministic product boundary.
- Sanitized prompt: improve the assurance-row readability; replace unattractive permanent underlines in the header and footer; complete language switching for the clash illustration and accessible labels; center the exclamation mark; make the first two section headings use the same deliberate two-line layout as the third; use one near-black, light-text footer across pages; rename the two profiles to Popular experience and Engineering minimal; replace broad teal dark-mode surfaces with a neutral dark system while keeping teal on the logo.
- Human constraints: reference established large-product dark-mode practice without copying another product identity; keep the original wall–pipe–collision–dialog brand direction, deterministic authority, failure closing, AI off by default, reduced motion, zero remotes, and the no-upload/no-deployment/no-G4AI boundary.
- Adopted output: neutral layered dark surfaces based on official GitHub Primer color-usage principles, semantic orange-red emphasis, retained teal brand/model pipes, numbered assurance cards, grouped header navigation, hover-state footer links, a shared near-black footer, fully bilingual clash-record content and accessibility names, a CSS-drawn centered status mark, and deliberate two-line section headings. The user-facing profile labels are 大众体验/工程极简 and Popular experience/Engineering minimal.
- Verification: local browser interaction at 1433 × 898 covers both profiles, both languages, both appearances, English `Hard clash · CLASH`, translated record/footer/navigation labels, Chinese two-line headings, readable assurances, the neutral illustration background, the common dark footer, and centered icon geometry. The G4 suite, exact 18-file publication audit, zero-remotes check, and diff check pass.
- Rejected or deferred suggestions: no GitHub upload, deployment, access change, G4AI provider/API, video, new dependency, deterministic rule change, or broad extra-page redesign was performed.

## P-021 — G4 homepage product-showcase rebuild

- Date: 2026-08-28
- Goal: replace the three repetitive homepage narrative bands with a compact product showcase, correct English density, and keep the AI control only where it is operationally relevant.
- Sanitized prompt: remove the centered homepage section navigation and homepage AI switch; keep the three display controls aligned at the right; make the hero wall visible in light mode; use concise idiomatic English rather than literal translation; merge capability, evidence, and scope content into equal-base cards that change emphasis on hover/focus; reveal small bubbles containing real light-Chinese, dark-English-minimal, functional-workspace, and development-history previews; repair functional-page English layout before using it; enlarge the workspace AI switch and place its state inside the track.
- Human constraints: use as few preview images as necessary; previews must come from real local product routes and controlled generated IFC data; preserve the original wall–pipe–collision–dialog hero motion, deterministic authority, failure closing, reduced motion, zero remotes, and the no-upload/no-deployment/no-G4AI-provider/video boundary.
- Adopted output: the homepage now has three display controls, no middle navigation or AI control, a stronger outlined hero wall, one combined three-card showcase, focus/hover color emphasis, and four real local-route PNG previews. English home copy is shorter, workspace headings/cards fit without overlap, and the only AI switch is a larger state-in-track control on `/app/`.
- Verification: at 1433 × 898 the light Chinese Popular experience and dark English Engineering minimal homes render cleanly; the controlled C01/C03/C05/C08 run produces four deterministic records and a real 3D view in the English dark workspace; the development preview uses the real light Chinese page; homepage and workspace console errors are zero. The G4 suite reports four previews and workspace-only AI placement, and the exact 22-file audit passes with the four program-generated media files individually allowlisted and below 1 MiB.
- Rejected or deferred suggestions: no provider/API call, deployment, access change, video, remote configuration, GitHub write, new dependency, or deterministic-rule change was performed.

## P-022 — G4 homepage and workspace fourth review repair

- Date: 2026-08-28
- Goal: close all current annotations across the homepage and functional workspace without expanding base G4.
- Sanitized prompt: give the hero wall–pipe–collision–dialog mark stronger dimensional faces, depth, highlights, and contact shadows; replace every showcase image with a current real-route capture, hide browser scrollbars inside smaller preview bubbles, keep the open-evidence title to two lines, and remove the unexplained standalone `NOT_EVALUATED` banner. On the workspace, make two user IFC inputs the primary path, demote the controlled pack to a compact demo option, soften the mobile-roadmap wording, scale Chinese and idiomatic English headings across desktop widths, move the uniquely labelled AI switch from the header into the input workflow, and keep the three display controls aligned right.
- Human constraints: apply every current annotation on both pages; preserve deterministic authority, failure closing, AI default-off behavior, bilingual/light-dark/profile switching, reduced motion, zero remotes, and the no-upload/no-deployment/no-provider/video boundary.
- Adopted output: a layered CSS brand mark; four refreshed current-route previews with crop wrappers; a concise two-line open-evidence card and no unexplained bottom banner; responsive workspace typography; two equally prominent file cards; a secondary horizontal demo strip; softened mobile follow-up copy; and one clearly labelled 116 × 42 px workspace AI switch below the support boundary.
- Verification: browser review at 1024, 1280, and 1433 CSS px covers Chinese and concise English workspace layouts, complete light/dark logo rendering, all three hover previews, two-line third-card copy, header display-control placement, `header AI = 0 / workspace AI = 1`, and AI off/on/off state changes. `scripts/test-g4.ps1`, exact 22-file `scripts/audit-g4.ps1`, `git diff --check`, and zero-remotes checks pass.
- Rejected or deferred suggestions: no provider/API call, deployment, public-access change, video, remote configuration, GitHub write, new dependency, mobile computation implementation, or deterministic-rule change was performed.

## P-023 — G4 hero spatial hierarchy and 3D preview framing repair

- Date: 2026-08-28
- Goal: close the two newest homepage annotations by making the original brand direction physically legible and showing the whole 3D review region in the deterministic-workspace preview.
- Sanitized prompt: rebuild the wall–pipe–collision–dialog mark so wall depth, pipe passage, collision location, and alert ownership form one coherent spatial story; recapture the second showcase image lower in the real functional page so the 3D toolbar, complete model viewport, result list, and selected record are visible without a browser scrollbar.
- Human constraints: preserve the approved original brand ingredients and staged motion; use only real local product routes and controlled generated IFC data; keep deterministic authority, failure closing, reduced motion, zero remotes, and the no-upload/no-deployment/no-provider/video boundary.
- Adopted output: paired front/rear wall plates; separate rear and foreground pipe segments with explicit occlusion; a ring fixed at the wall penetration interface; a separate tailed alert bubble; refreshed light-Chinese and dark-English homepage captures; and a `1433 × 806` dark-English workspace capture containing the full 3D review context.
- Verification: local browser review at 1433 × 898 confirms the corrected hero hierarchy and the complete hover preview. The G4 suite now locks the two pipe layers and bubble tail, while the exact 22-file publication audit and diff check pass.
- Rejected or deferred suggestions: no GitHub upload, deployment, access change, G4AI provider/API, video, new dependency, generated logo bitmap, or deterministic-rule modification was performed.

## P-024 — G4 development typography and footer-copy repair

- Date: 2026-08-28
- Goal: close four development/homepage annotations involving metric typography, semantic heading breaks, and an unhelpful footer label.
- Sanitized prompt: make the 0/49/50/51 clearance boundary metric read as one intentional number group with a subordinate millimetre unit; give the failure and local/public-history headings stable semantic line breaks; remove the contributor label from every product-page footer and retain only the product name.
- Human constraints: preserve bilingual switching, the established light/dark profiles, public-evidence meaning, deterministic records, zero remotes, and the no-upload/no-deployment/no-provider/video boundary.
- Adopted output: a non-wrapping metric baseline with smaller neutral `mm`; concise two-line Chinese failure copy and idiomatic English counterparts; two-line local/public-ledger copy in both languages; and `IFC ClashTrace` as the shared footer identity.
- Verification: local browser review at 1708 × 898 covers the metric, both headings in Chinese and English, and both product-page footers; obsolete contributor text is absent. The G4 test and exact 22-file audit pass.
- Rejected or deferred suggestions: no GitHub upload, deployment, access change, G4AI provider/API, video, new dependency, footer expansion, or deterministic-rule change was performed.

## P-025 — G4 workspace input-index repair

- Date: 2026-08-28
- Goal: align the workspace labels with the intended primary-input and secondary-demo hierarchy.
- Sanitized prompt: rename the MEP and structure file cards to A1 and A2, and rename the controlled demonstration strip to B.
- Human constraints: change labels only; preserve input roles, deterministic execution, bilingual display, zero remotes, and the no-upload/no-deployment/no-provider/video boundary.
- Adopted output: the two real-file inputs form the A group (`A1`, `A2`) and the controlled example is the B path.
- Verification: local browser review at 1708 × 898 confirms all three labels and absence of `B1`, `B2`, and `A · DEMO`; the G4 test and exact 22-file audit pass.
- Rejected or deferred suggestions: no workflow, rule, provider, deployment, media, or remote change was performed.

## P-026 — G4 workspace demo-label correction

- Date: 2026-08-28
- Goal: retain the newly clarified A/B grouping while restoring the controlled path's explicit demonstration status.
- Sanitized prompt: keep A1 and A2 for the two real IFC inputs, but label the secondary controlled path `B · DEMO` rather than plain `B`.
- Human constraints: change the visible index only and preserve all workflow, rule, preference, and governance boundaries.
- Adopted output: `A1 / A2 / B · DEMO`.
- Verification: the local browser reports the exact label set; G4 test and exact 22-file audit pass.
- Rejected or deferred suggestions: no additional design, workflow, provider, deployment, remote, or rule change was made.

## P-027 — G4 development public-copy and metric-unit repair

- Date: 2026-08-28
- Goal: make the development page suitable for a public audience and align the clearance unit color with its metric.
- Sanitized prompt: replace the local-Git, signed-in-browser, SHA-mapping, progress-ledger, and prompt-ledger operational narrative with public product content; expose source, validation method, MIT, and CC0 references; color `mm` with the same orange as 0/49/50/51.
- Human constraints: remove personal operational process only, retain accurate public evidence and deterministic/privacy boundaries, and do not expand G4 scope.
- Adopted output: a bilingual OPEN METHOD section explaining inspectable rules, tests, scope, licenses, local processing, and deterministic authority; four public evidence links; an accent-colored subordinate unit.
- Verification: local browser review at 1708 × 898 checks both languages, all four links, the exact accent color, and absence of old operational markers; the G4 test and exact 22-file audit pass.
- Rejected or deferred suggestions: no new claim, workflow, provider, deployment, remote, video, or deterministic-rule change was added.

## P-028 — G4 explicit shared-coordinate consent

- Date: 2026-08-28
- Goal: ensure the custom-model coordinate assertion is an explicit user action rather than a preselected default.
- Sanitized prompt: leave the shared-project-coordinate checkbox unchecked on first load and do not auto-check it when a controlled example or another input path is selected.
- Human constraints: preserve the existing custom-run failure-closing guard and do not change controlled-example computation, rules, preferences, or broader scope.
- Adopted output: the checkbox has no static checked attribute, runtime code cannot set it true, and refresh returns it to unchecked.
- Verification: browser states are false initially, false after controlled-example load, true after direct user click, and false after reload; G4 test and exact 22-file audit pass.
- Rejected or deferred suggestions: no persistent consent, inferred coordinates, automatic registration, provider, deployment, remote, or rule change was added.

## P-029 — G4 English open-evidence title repair

- Date: 2026-08-28
- Goal: keep the homepage's third showcase title to two deliberate lines in English at the reviewed desktop width.
- Sanitized prompt: replace the three-line English rendering of the public-development card with a shorter idiomatic statement; retain the existing Chinese meaning and card function.
- Human constraints: validate both Popular experience and Engineering minimal at 1708 × 898, preserve English/Dark appearance behavior, and do not expand G4 scope.
- Adopted output: `Built in public.` on the first line and `Fully traceable.` on the second.
- Verification: browser measurements report `95.02 px` title height with a `47.52 px` line height in both styles; the G4 regression rejects the prior title fragments, and the exact 22-file audit passes.
- Rejected or deferred suggestions: no card restructure, new claim set, preview replacement, provider, deployment, remote, video, or deterministic-rule change was made.

## P-030 — G4 showcase preview radius consistency

- Date: 2026-08-28
- Goal: make the homepage hover preview read as one intentional bubble with matching upper and lower corner geometry.
- Sanitized prompt: unify the visible radius of the preview frame and its image crop; keep the square engineering profile square.
- Human constraints: verify the real hover state in light and dark appearances and both display profiles without changing preview assets or card content.
- Adopted output: one `--preview-radius` contract drives both frame and crop, yielding `16 px / 16 px` in Popular experience and `0 px / 0 px` in Engineering minimal.
- Verification: local browser review at 1708 × 898 confirms matching computed radii and an intact arrow, crop, image, and caption; the G4 test and exact 22-file audit pass.
- Rejected or deferred suggestions: no image regeneration, card restructuring, provider, deployment, remote, video, or deterministic-rule change was performed.

## P-031 — G4 publication preparation without upload

- Date: 2026-08-28
- Goal: close the locally accepted G4 frontend into an auditable GitHub upload package while preserving the external-write stop gate.
- Sanitized prompt: organize the current three-page G4 content, refresh stale public metadata and reproduction wording, produce an exact upload manifest and grouped Chrome plan, then wait for explicit approval.
- Human constraints: no GitHub write, remote configuration, deployment, G4AI provider/API, video, or public-access change; keep the exact 22-file allowlist and request one collective authorization before browser upload actions.
- Adopted output: README wording aligned to G4 while the DG-frozen G3 package version remains unchanged; public governance state set to local acceptance plus publication prepared; all frozen Gate tests and the G4 exact-set audit rerun; a local-only path/size/SHA-256 checklist prepared for 22 files.
- Verification: G1/G2/G3A/G3B/G3C/G3/DG/G4 tests pass; the G4 audit reports exact set, guard self-test, public-plan equivalence, zero sensitive/API signals, zero oversized candidates, and zero remotes. The historical G0A early-workspace audit remains unchanged and is not reused as a late-Gate publication check.
- Rejected or deferred suggestions: no upload page was opened, no file was selected or transmitted, no commit was created on GitHub, and no hosting or later Gate was started.

## P-032 — G4AI provider research and optional interpretation

- Date: 2026-08-28
- Goal: implement G4AI as a provider-backed, user-triggered explanation layer while preserving the completed deterministic engine as the only authority.
- Sanitized prompt: revalidate every completed Gate and the current public evidence chain; compare currently available free-tier providers from official sources; select a provider only if key, quota, retention, terms, and regional/account boundaries can be stated honestly; build a provider-neutral adapter; preview and minimize fields before consent; keep the key server-side; reject prompt injection and malformed prose; support timeout, rate limit, quota, offline, unavailable-provider, retry, cancel, copy, close, and deterministic fallback; use mock tests by default and only generated records for a separately authorized live smoke.
- Human constraints: no IFC bytes, meshes, filenames, paths, browser metadata, secrets, deployment, public-access change, mobile computation, video, status rewrite, rule rewrite, evidence rewrite, or arbitrary IFC compatibility claim; Git remains local with zero remotes; external writes and key use require action-time authorization.
- Provider decision: GroqCloud Free Plan with `openai/gpt-oss-20b` is the dated first adapter. Google Gemini's free tier was rejected because official pricing marks free-tier content as used to improve products. Hugging Face Inference Providers was rejected because free users receive only `$0.10` monthly credit and routed requests add a second provider policy boundary.
- Adopted output: an allowlisted minimal-record contract with local aliases, a strict response schema, provider-neutral orchestration, a server-only Groq adapter, a same-origin Node endpoint, pre-send disclosure and fresh consent, separately labelled prose, copy/retry/cancel/close controls, and a local deterministic fallback.
- Verification: mock success, prompt-injection removal, immutable deterministic input, strict request/response validation, timeout, rate limit, quota exhaustion, missing key, network failure, malformed output, same-origin/content-type/extra-field guards, browser secret isolation, G4 regression, and worktree invariance pass locally. Live smoke and public checkpoint remain separate completion requirements.
- Rejected or deferred suggestions: no client-side key, direct browser-to-provider request, raw GUID/name/diagnostic transmission, model tool use, deployment, access-level change, video, mobile review, third deterministic rule, or AI-authored status/measurement field was added.

## P-033 — G4AI live-schema recovery and bilingual closure

- Date: 2026-08-28
- Goal: complete a controlled live validation without weakening the deterministic authority, privacy boundary, or language contract.
- Human constraints: the user explicitly selected Groq after reviewing alternatives, approved the quota policy, authorized each of four live attempts separately, and required Chinese output for Chinese UI and English output for English UI.
- Adopted output: replace provider-authored prose with a strict required-key object containing enum codes only; materialize trusted bilingual prose locally; cancel and invalidate stale AI state when the UI language changes; stop live use after the fourth attempt passed.
- Verification: the first three authorized attempts failed closed as malformed/provider-rejected/malformed without changing records; the fourth returned the exact actionable set and rendered Chinese locally while the deterministic `1/1/1/1` summary and evidence remained unchanged and Chrome console issues stayed at zero. Offline tests cover both languages and stale-language invalidation.
- Rejected or deferred suggestions: no fifth live call, arbitrary prose acceptance, AI-authored status/rule/evidence, deployment, public-access change, mobile computation, video, or broader IFC claim was added.

## P-034 — G4AI coordination-analysis usefulness and entry repair

- Date: 2026-08-29
- Goal: respond to the first human trial showing that the safe enum-materialized result was too generic and fragmented, while the generation entry was hidden inside the evidence drawer.
- Human constraints: make the AI useful enough to explain why items matter, how records relate, and what to review next; move the entry into the visible result flow; keep deterministic status/rules/evidence authoritative; default off, preview, fresh consent, key isolation, minimal fields, failure closing, and Chinese/English matching remain mandatory; no live call, upload, deployment, mobile computation, video, or new deterministic rule is implied.
- Adopted output: a prominent result-summary entry with a synchronized AI toggle and explicit `Enable -> Preview fields -> Confirm and analyze` path; a bounded exact-key response with one cross-record synthesis plus two-to-three-sentence per-record evidence readings and one coordination focus; an upgraded local fallback with the same useful structure.
- Verification plan: mock both languages, reject wrong-language/unknown/incomplete/status-restating/numeric/URL output, retain timeout/rate/quota/network/origin/key guards, rerun G4/G3 regression, and inspect the updated first-sample flow in the local browser without consuming live quota.
- Rejected or deferred suggestions: unconstrained chat, provider-authored statuses or measurements, invented causes/locations/solutions, client-side key use, automatic sending, a fifth live call without separate approval, external publication, deployment, and any G5 work.

## P-035 — G4AI entry hierarchy simplification

- Date: 2026-08-29
- Goal: remove the duplicated pre-run/post-run AI modules and shorten the result action after the second annotated human review.
- Human constraints: before results, keep only one sentence saying the product can use AI and move provider/model, preview/confirmation, quota, region, and dated data-term context forward; after results, keep the AI area compact and make the button materially shorter. Preserve default-off, field preview, fresh consent, server-only key, deterministic authority, bilingual output, and failure closing.
- Adopted output: the pre-run AI card and switch are replaced by one compact disclosure line; the result area contains the page's only AI switch, the title `可选 AI 解读 / Optional AI interpretation`, and the action `AI 解读 / Interpret`. The large outcome headline, three-step path, visible duplicate switch label, and long CTA are removed.
- Verification plan: assert exactly one AI control, reject all obsolete entry markers and long copy, run the G4AI/G4/G3 regression and publication audit, then capture both the pre-run disclosure and post-run compact control in the local no-key browser without a live call.
- Rejected or deferred suggestions: removing pre-send preview or consent, hiding the provider at send time, changing the provider, making AI automatic, consuming live quota, uploading, deploying, entering G5, mobile computation, or video work.

## P-036 — G4AI public-facing service and privacy copy

- Date: 2026-08-29
- Goal: remove account-specific and developer-oriented wording from the public AI flow after the third annotated review, and explain the no-key fallback without exposing an internal error code.
- Human constraints: retain the selected provider/model, field preview, fresh consent, minimal-field privacy boundary, deterministic authority, bilingual output, and failure closing; do not configure a key, make a fifth live call, upload, deploy, or enter G5.
- Adopted output: pre-run and pre-send disclosures now describe the user-visible provider, confirmation step, excluded local data, and current public terms. `API READY`, `API NOT CONFIGURED`, account/ZDR wording, dated developer notes, and raw `{code}` rendering are removed from the public UI. Provider, busy/quota, connection, and other failures map to concise bilingual service messages while internal codes remain testable below the presentation layer.
- Verification: the no-key browser route shows `当前将使用本地解读`, then `AI 服务暂时不可用，已切换为本地解读。检测结果不受影响。`; neither Chinese nor English DOM exposes `provider_unconfigured` or account-level terminology. G4AI/G4 regression and `git diff --check` pass without a provider request or quota use.
- Rejected or deferred suggestions: no provider change, live credential configuration, live retry, consent removal, provider hiding, deterministic-result mutation, external publication, deployment, mobile computation, video, or G5 work.

## P-037 — G4AI consent, concurrency, and capacity repair

- Date: 2026-08-29
- Goal: close the full-audit findings that retry could reuse a prior consent, stale asynchronous work could interfere with a newer AI flow, and the 40-record input boundary was incompatible with the bounded prose and 900-token completion budget.
- Human constraints: the user explicitly authorized only this limited repair plus one current-contract live smoke; deterministic G3/G4 authority, minimized fields, server-only key, bilingual output, failure closing, and the existing provider remain unchanged. No GitHub upload, deployment, public-access change, mobile computation, video, or G5 work is authorized.
- Adopted output: retry returns to a fresh field preview and unchecked consent; preview/send operations use monotonic identities and controller ownership checks so stale completion cannot render into or clear a newer operation; disabling AI, changing language, closing, changing input, and starting a new run invalidate the old operation; one AI request accepts at most six deterministic records and fails locally without sending when the boundary is exceeded.
- Verification: the six/seven-record boundary, retry-to-preview, controller ownership, G4AI/G4/G3 regression, all current publication audits, and a desktop-Chrome offline retry flow pass. The one authorized sanitized review-pack live request reached the configured local service but ended in the connection-class fallback; no retry was made. Deterministic `1/1/1/1` records remained unchanged and the console stayed clean, so failure closing passed while current bounded-prose provider acceptance remains `LIVE_UNVERIFIED`.
- Rejected or deferred suggestions: batching, automatic retries, reusing consent, raising the completion budget, changing the provider/model, uploading, deploying, entering G5, or altering deterministic records.

## P-038 — G4AI-R2 separately authorized live retry

- Date: 2026-08-29
- Goal: retry the current bounded-prose live smoke exactly once after the initial connection-class fallback, without expanding the R2 repair or reusing old consent.
- Human constraints: the user explicitly approved one retry only. Use the same generated review-pack minimum fields, obtain a fresh preview and consent, preserve the selected language, never auto-retry, and stop the service afterward. No upload, deployment, public-access change, provider/model change, mobile computation, video, or G5.
- Verification: the first secure launcher attempt failed before server startup because the project-local Node path was unresolved; no request was sent and its process environment was cleared. After correction, the server reported the provider configured. The English UI recomputed `1/1/1/1`, previewed `R01`–`R04`, required fresh consent, and sent exactly one request. No acceptable AI interpretation was produced, so the local English analysis rendered; deterministic counts and evidence stayed unchanged and browser warning/error logs were zero. No further retry occurred.
- Conclusion: failure closing and the R2 state machine passed, but current bounded-prose live acceptance remains `LIVE_UNVERIFIED`.

## P-039 — G4AI-R3 provider-contract error repair

- Date: 2026-08-29
- Goal: repair reproducible provider-contract risks after two separately authorized bounded-prose live attempts failed closed.
- Sanitized prompt: recheck current official Groq strict-output, API, quota, and data boundaries; align the strict provider schema to documented structural keywords; give the six-record prose contract credible output room; separate provider truncation, refusal, rejection, malformed content, and local semantic rejection; preserve deterministic authority and privacy.
- Human constraints: local repair only. No new live call, key use, upload, deployment, public-access change, mobile computation, video, provider/model change, or G5 was authorized.
- Adopted output: remove undocumented string-length keywords from the provider strict schema while retaining all local prose limits; raise the completion cap from 900 to 1,600 tokens; use temperature zero; add explicit output-limit, refusal, and semantic-rejection classifications without persisting provider content.
- Verification: G4AI/G4/G3 regression, all nine current publication audits, and a Chinese-to-English no-key browser flow pass. The deterministic `1/1/1/1` summary remains unchanged; English output contains no Chinese text or internal provider code; no console issue or external request occurred.
- Conclusion: local contract risks are closed, but provider acceptance remains `LIVE_UNVERIFIED` until a separately authorized live smoke succeeds.

## P-040 — G4AI-R3 live-until-success closure

- Date: 2026-08-29
- Goal: continue controlled smoke testing until the current bounded-prose feature works successfully, without weakening deterministic authority or privacy.
- Sanitized prompt: use only generated review-pack minimal fields and fresh UI consent; diagnose safe failure categories without retaining provider content; repair reproducible local semantic false positives; reject any provider prose that invents safety, constructability, design intent, ownership, compliance, certification, false-positive/negative, or physical solutions; stop immediately after English and Chinese success.
- Human constraints: the user explicitly authorized smoke testing until success. IFC bytes, GUIDs, names, paths, diagnostics, raw provider responses, and keys remain excluded from evidence; no GitHub upload, deployment, access change, mobile computation, video, or G5 is implied.
- Adopted output: a case-sensitive machine-status guard allows natural lowercase coordination vocabulary; strict-schema descriptions and the system prompt limit next steps to evidence review; a local unsupported-claim guard fails closed on ungrounded engineering, ownership, safety, and solution concepts.
- Verification: five authorized requests were used. The first failed closed without retained subtype; the second safely classified `semantic_rejected`; the third reached provider mode but was rejected by human review for unsupported claims; the fourth English and fifth Simplified Chinese requests passed provider mode, language, content, consent, deterministic `1/1/1/1`, and zero-console checks.
- Conclusion: the current G4AI-R3 bounded-prose path is `PASS`. Live use stopped, the key-bearing process and diagnostic proxy were terminated, and ignored temporary helpers were removed.

## P-041 — G5 bounded evaluation and official-sample compatibility

- Date: 2026-08-29
- Goal: evaluate the completed deterministic and optional-AI paths with reproducible metrics, three-way consistency, an official external sample, performance observations, failures, limitations, and a minimal browser usability route.
- Sanitized prompt: independently recheck the local and public G4AI-R3 baseline; compare the eight authored controlled outcomes with IfcOpenShell and the shipped web-ifc core; compare all nine clearance fixtures with the analytic and independent mesh routes; use the buildingSMART PCERT IFC4 HVAC/Structural pair only as licensed compatibility evidence; measure local core and mock-AI timing; preserve failure closing and decide O-005 without widening product rules.
- Human constraints: deterministic G3/G4 outputs remain authoritative; AI may explain only the minimal structured derivative and defaults/fails closed; no live provider call, key use, external upload, deployment, public-access change, arbitrary IFC promise, mobile computation, video, or later Gate is authorized by the evaluation itself.
- Adopted output: three reproducible evaluation scripts, one public PowerShell acceptance contract, a local-only publication audit, a bounded public evaluation report, ignored exact-hash external samples, and an O-005 decision retaining formal IFC4-only support with IFC4X3 exploratory.
- Verification: controlled status and pair matches are `8/8`; three-way status agreement is `8/8`; hard-clash precision/recall are `1.00/1.00` with one deliberate abstention; both clearance routes match `9/9`; web-ifc and IfcOpenShell open both official files, while the product and Chrome UI return explicit `NOT_EVALUATED` for prefixed units; AI fact preservation is `6/6` and degradation is `5/5`; the four-case review pack and official-sample failure route remain usable in desktop Chrome.
- Rejected or deferred suggestions: unit normalization, generic HVAC segment support, IFC4X3 claims, deriving accuracy from the official directory, large-model performance claims, a fresh live AI call, publishing third-party IFC, deployment, G6, mobile IFC computation, video, or public-access changes.

## P-042 — G6 private deployment candidate and publication audit

- Date: 2026-08-29
- Goal: package the completed G5-R1 product as a public-capable but not publicly accessible Sites candidate, verify a private preview, and close the G6 privacy/license/provider evidence without entering VG or G7.
- Sanitized prompt: independently reverify the current local and public G5-R1 evidence; preserve the three-page browser architecture and all deterministic contracts; add the smallest Sites-compatible static/Worker build; stage only generated public IFC data and required runtime assets; audit secrets, identity, paths, archive/media metadata, screenshots, licenses, AI data flow, server key, logs, quota, retention, and current provider terms; update README, prompt record, architecture, and evaluation evidence; stop for human preview and action-time authorization before any external write.
- Human constraints: local Git remains authoritative with zero remotes and one saved worktree; GitHub writes, Sites project creation/deployment, hosted secret use, and access changes require action-time authorization. The local master plan and every `scripts/audit-*.ps1` are never publication candidates. AI defaults off, receives only the already approved minimal derivative after fresh consent, fails closed, and cannot alter deterministic records.
- Adopted output: a Vite multi-page build, Worker-compatible same-origin AI entry, ignored exact-input staging, public no-key Worker/media/license tests, complete third-party inventory, G6 architecture and privacy/provider audit, and a private-preview-only access decision. Four existing preview files were found to contain JPEG bytes under PNG names and were content-preserving re-encoded as real PNG files without EXIF/text metadata.
- Verification boundary: builds and local owner preview make no external write or live provider request. A hosted owner-only preview, GitHub checkpoint, or public access is recorded only after the user grants the separately listed action-time authorization and the resulting URL/commit is rechecked.
- Rejected or deferred suggestions: Cloudflare local tool packages with unresolved development-time advisories, source maps, analytics, durable logs, databases, public access, hosted key configuration, fresh live AI use, external/private IFC redistribution, mobile computation, video, VG, or G7.

## P-043 — G6 private Sites deployment authorization excluding GitHub

- Date: 2026-08-29
- Goal: complete the previously enumerated G6 deployment actions except GitHub upload, then present the owner-only URL for human acceptance.
- Human authorization: the user explicitly approved “完成除上传github外的操作”. This covers one Sites project, project-ID persistence, final local test/audit, a local technical commit, temporary-credential source push, saved version, owner-only private deployment, and deployment/access readback.
- Exclusions: no GitHub write, no public access, no hosted AI key, no Groq live request, no extra viewer/group, no environment secret change, no VG/G7, mobile IFC computation, or video.
- Stop condition: after the private deployment succeeds, return the private URL and wait for human acceptance. Do not infer acceptance or public-access approval from this authorization.
- Verification: version 1 deployed successfully from a parentless sanitized source commit; access readback shows owner/custom, one allowed account, no groups, no external visitors, and zero hosted environment variables. The private URL is supplied only for the user's acceptance step.

## P-044 — G6 private-preview static asset binding repair

- Date: 2026-08-29
- Goal: diagnose the user's inaccessible owner-only preview and repair the production route without changing access, AI, or deterministic behavior.
- Evidence: the screenshot showed an HTTP response-code failure rather than an authorization screen. Sites readback remained active and owner-only; production Worker logs showed authenticated `GET /` requests returning 404 with successful execution. The saved archive contained the static pages, but they were emitted at `dist/` root while Sites binds static assets from `dist/client`.
- Adopted output: emit the three pages, generated IFC pack, WASM, license documents, and browser assets under `dist/client`; keep the Cloudflare-compatible Worker at `dist/server/index.js`; make local preview and public tests assert the same directory contract.
- Preserved boundary: no GitHub write, public access, extra viewer/group, hosted key, Groq live request, deterministic-rule change, AI authority expansion, VG/G7, mobile computation, or video.
- Verification: G6 five-route local preview, Worker boundary, license inventory, vulnerability/media/privacy checks, G4AI/G4/G3 regression, and G5 evaluation pass. A first repair archive was rejected before deployment because stale root assets remained; the build now clears only reproducible `dist` output and asserts the exact root layout. Clean version 3 deployed privately with owner-only/key-free readback; user refresh and acceptance remain required.

## P-045 — G6 private-preview validation-link repair

- Date: 2026-08-29
- Goal: replace the development-page validation action after human review found that its GitHub target had no useful content.
- Human feedback: the user selected `验证方法 ↗` in the owner-only version 3 preview, reported the empty GitHub destination, and asked whether a different target should be used.
- Adopted output: rename the action to `受控验证 / Controlled validation`; open `/app/#controlled-review` in a new tab; add a stable anchor to the existing C01/C03/C05/C08 frozen-example card; lock the new target and the removal of the obsolete GitHub document path in public tests.
- Preserved boundary: deterministic G3/G4 results remain authoritative; AI remains optional, default-off, consent-gated, and fail-closed. No GitHub write, public access, extra viewer/group, hosted key, Groq live request, VG/G7, mobile computation, or video is included.
- Verification: the G4 public-surface contract and full G6/G4AI/G4/G3/G5 regression pass locally. The exact pending public candidate is now 29 files, while the local master and every audit script remain excluded. Owner-only version 4 deployed successfully from the exact sanitized source and clean archive; access remains custom with one allowed account, no groups/external visitors, and no hosted environment variables. User refresh and recheck are still required.

## P-046 — G6 private-preview acceptance and GitHub candidate organization

- Date: 2026-08-29
- Goal: register the user's acceptance of the basic private-preview experience and organize, but do not upload, the exact GitHub publication candidate.
- Human evidence: after version 4 deployed with the controlled-validation repair, the user stated “基本使用体验我觉得没问题，现在整理需要上传github的内容”.
- Adopted output: close only the private-preview human-acceptance gate; preserve the 29-file allowlist; group 27 technical/evidence paths into seven directory-correct Chrome batches, followed by separate one-file public-plan and final-ledger mapping steps; prepare exact commit labels, exclusions, and per-step verification for one later collective authorization.
- Preserved boundary: this instruction is not GitHub write approval. No Git remote, `gh`, GitHub API/CLI remote, public Sites access, hosted key, Groq live request, extra viewer/group, VG/G7, mobile computation, or video is allowed.
- Stop condition: complete local tests, audit, candidate manifest, and local Git evidence, then stop before the first GitHub browser write and request one explicit collective authorization for the exact scope.

## P-047 — Presentation-readiness scope and schedule revision

- Date: 2026-08-29
- Goal: revise the authoritative plan before video production to close stale public-progress content, add a GitHub animated logo, provide a near-realistic engineering UAT pack, and embed the final video on the homepage only after it passes QA.
- Human evidence: the user observed that the development timeline still stops at DG while G6 is closing, requested a full visible-content audit and corrections, allowed advance drafting of G7 copy for presentation completeness, requested a GitHub-homepage animated product logo, and asked for engineering-like files for final manual website testing.
- Adopted governance: insert mandatory PG after G6 and before VG. PG-C audits all visible claims and allows future copy only when hidden or explicitly marked planned; PG-B adapts the already approved DG brand into a GitHub-rendered finite animation with a static fallback; PG-E creates a synthetic/appropriately licensed engineering-context IFC pair with sentinel expectations and user UAT. Split final work into G7A video QA and G7B homepage embedding, redeployment, and Hong Kong anonymous-access verification.
- Preserved boundary: this plan edit does not alter the website, README, logo assets, sample files, deployment, access policy, hosted keys, provider calls, GitHub, or video. Because document contents and hashes changed, the exact 29-path candidate was re-audited locally and passed; no remote write was performed.
- Truthfulness rule: prewritten G7 content may be labeled `DRAFT/PLANNED`, “计划中”, “即将开展”, or “尚未开始”; it must not use completion language, evidence, dates, metrics, links, or acceptance claims until the corresponding Gate actually passes.

## P-048 — G6 authorized Chrome technical publication chain

- Date: 2026-08-29
- Goal: publish and verify the authorized, 0.4.0-audited G6 technical/evidence subset without changing the 29-path allowlist or using a Git remote/API.
- Human authorization: the user explicitly confirmed the displayed 29-file plan, including the technical chain, one-file public-plan mapping, one-file final ledger, and browser readback.
- Browser constraint: GitHub's upload input supports multiple files but not directory selection. To preserve nested paths, the six `app` files were safely split into `app`, `app/ai`, and `app/ui/previews` commits; no file or content was added.
- Verification: nine Chrome commits form a continuous chain from the G5-R1 ledger to `e7217d65cfe43fc965c8c0a192656113a3a11aaf`; exact counts are `1/1/1/4/1/5/6/1/7 = 27`, and every parent, nested path, file count, and `Public/main` state was checked before continuing.
- Mapping note: technical titles retain the previously displayed local upload-plan short SHA `2469294`; the later local plan commit `4910437cdcdfdae4b97c38ad7aa760bf4061dbb2` contains the actual audited 0.4.0 content. The mapping records both instead of misrepresenting one as the other.
- Preserved boundary: the local master, all audit scripts, local/external IFC, outputs, dependencies, credentials, provider data, Sites access, hosted secrets, PG/VG/G7, mobile computation, and video remain excluded. Only the two authorized mapping-tail files remain.

## P-049 — G6-R1 bounded evidence-consistency repair

- Date: 2026-08-30
- Goal: repair only the G6 public evidence inconsistencies found by a read-only audit, without changing the completed technical result or starting PG.
- Human authorization: the user approved one limited repair after being shown that base G6 was substantively complete but README/privacy wording still described private review as pending, the final ledger retained pre-publication future tense, a checklist heading had a literal leading plus, and the local audit did not guard those states.
- Adopted output: distinguish completed owner-only version 4 acceptance from the still-pending O-006 public-access decision; state the base G6 final-ledger and empty-sync SHAs as completed facts; repair the Markdown heading; add local semantic, ancestry, empty-tree, and commit-message guards; record the bounded G6-R1 in the master pair and ledger.
- Preserved boundary: no application code, deterministic status/rule/evidence, AI contract, dependency, IFC, media, build artifact, Sites version/access/environment, key, provider request, PG/VG/G7, mobile computation, or video changes. The local master and audit script remain prohibited from publication.
- External stop: this approval authorizes the limited local repair only. After local validation and commit, request one exact Chrome GitHub authorization for the sanitized repair subset and mapping tail; until then G6-R1 remains `LOCAL_PASS_EXTERNAL_SYNC_PENDING`.

## P-050 — Replace homepage video embedding with YouTube delivery

- Date: 2026-08-30
- Goal: revise the authoritative delivery plan after the user concluded that embedding the final video in the project homepage adds work and risk without enough assessment value.
- Human decision: remove homepage video embedding and any video-driven Sites redeployment. Keep G7A as final-video QA; redefine G7B as action-time-authorized YouTube `Unlisted` upload, bilingual caption/thumbnail/processing checks, immutable file-hash/video-ID/link registration, and Hong Kong signed-out playback verification.
- Submission route: the email uses the direct YouTube watch URL; README may link to the same URL after actual upload. The homepage remains focused on the product and receives no player, video asset, or video-specific regression work.
- Privacy boundary: `Unlisted` is link-accessible, not strictly private, and the link can be reshared. Before upload, the user must approve the visible channel identity, title, description, thumbnail, comments, language, captions, and exact visibility. No channel creation, rename, upload, or visibility change is implied by this plan edit.
- Preserved boundary: this revision changes only the local/public master plans and prompt ledger. It does not modify the website or README, upload YouTube, write GitHub, deploy Sites, change access, create hosted secrets, make provider requests, or start PG-B/PG-E/VG/G7.

## P-051 — PG-B light-brand finite README motion

- Date: 2026-08-30
- Goal: use the supplied light-mode IFC ClashTrace product logo as the identity authority, extract the pacing logic of the supplied reference GIF, create a similar GIF, and complete the remaining PG-B format, static endpoint, README, accessibility, metadata, weight, local-rendering, governance, and test work.
- Reference distinction: the PNG controls the approved wall–pipe–collision–inspection identity. The reference GIF controls only quiet entry, staging, holds, accent-color wordmark reveal, near-black final lockup, and overall 4.8-second pacing. Its old building mark, old name, and infinite-loop behavior are not copied.
- Correction instruction: reject the rough, stuttering first candidate and its branch interpretation. Treat the work as the main project flow; rebuild the asset nearly one-to-one from the reference motion logic with a pure-white field, smaller left mark, safe mark-to-wordmark spacing, wall first, green pipe insertion, orange collision ring, alert bubble, orange wordmark reveal, and black final wordmark. Generate the GIF directly and use it directly in the README.
- Image-generation prompt: “Edit the supplied light-mode logo. Preserve the wall structure exactly; remove only the green pipe, collision ring, and alert bubble; reconstruct the hidden wall; remove the beige field; return a transparent wall-only layer without moving, resizing, cropping, or restyling the object.” The returned bitmap was inspected and rejected from the shipped asset because it flattened the transparency checkerboard and changed geometry.
- D-068 correction: slow the animation, improve the rough left-side materials, remove element misalignment by remapping from the source render, make the complete pipe enter by translating along its extension direction, and enlarge the Logo and wordmark together rather than leaving an underscaled lockup.
- Image-generation prompts: isolate the exact polished wall panels while reconstructing their hidden portions; separately isolate and reconstruct the complete polished teal pipe. In both edits, preserve the source render's exact pixel placement, perspective, scale, bevels, highlights, shadows, and materials, and request genuine alpha. Flattened checkerboard fields were removed deterministically before the layers were remapped to the shared full-render coordinates.
- Adopted output: a pure-white 1120 × 360 canvas, 6,400 ms, 25 fps logical timeline, 107 encoded GIF frames, direct once-only GIF (`433,015` bytes), and static PNG (`60,391` bytes) endpoint. The complete pipe translates `(-420 px, +67 px) → (0, 0)` along its approximately 9° axis. The high-fidelity mark is about 315 px wide, the wordmark is 54 px, and their minimum safe gap is 82 px.
- Local evidence: deterministic hashes, layer provenance, sizes, and transforms are frozen; the GIF contains no loop extension and uses one coordinate system for all moving layers. README and development claims keep PG-B at `TECH_PASS_EXTERNAL_SYNC_PENDING` until real GitHub rendering and mapping pass.
- Preserved boundary: no GitHub/Sites write, deployment, access/permission/key change, PG-E, VG, G7, mobile computation, or video action is authorized. The exact public file set must be displayed for action-time authorization before Chrome GitHub upload and real README verification.

## P-052 — PG-B cancel GIF and adopt the selected static GitHub Logo

- Date: 2026-08-30
- User decision: abandon GIF usage and directly use the newly supplied transparent product image as the GitHub Logo.
- Adopted output: copy the source byte-for-byte to `docs/assets/brand/ifc-clashtrace-github-logo.png`; preserve its 1672 × 941 RGBA canvas, 468,496-byte size, and SHA-256 `b56f3a2a3d3ef5d37599a8a84c54cf1a5f56527057db487601d7bced24793142`.
- README contract: center the static PNG at width 520 px with descriptive alt text; do not use GIF, `picture/source`, reduced-motion branches, animation layers, generated lockups, or a motion-build script.
- Supersession: D-066 through D-068 remain historical evidence but no longer define the current PG-B output.
- Main-flow and external closure: commit locally and immediately fast-forward local `main`; the user then approved the exact 12-path public set. Signed-in Chrome uploaded five ordered groups to public `main`, ending at `b4ce6d56282111c585f757042fa7cfefc057da0e`, and verified 12/12 paths plus desktop/narrow README rendering. No Sites, access, permission, key, or later-Gate change occurred.
