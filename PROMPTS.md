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
