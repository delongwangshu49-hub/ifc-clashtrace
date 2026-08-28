# G4 deterministic web vertical slice

> Status: base G4 and the bounded G4-R1 runtime-state/evidence correction are `PASS`. The correction is published, verified in Chrome, and mapped to the local technical history; the project remains strictly stopped at G4-R1.

## Scope delivered

G4 connects the completed G3 deterministic browser core to the user-approved DG R4 product contract without adding a provider, API, deployment, public-access change, or video workflow.

The slice contains three public/product routes:

- `/` — centered IFC ClashTrace brand lockup, equal new-tab workspace/development actions, a combined hover/focus product showcase with four real local-route previews, and project footer;
- `/app/` — primary `A1/A2` two-file setup, a secondary `B · DEMO` controlled-example option, boundary validation, a clearly labelled optional AI explanation control, phased run feedback, deterministic summary/results/evidence, and real IFC 3D review;
- `/development/` — sanitized research question, verified metrics, completed Gate timeline, failure/repair narratives, and public evidence links.

All three routes share locally persisted `Popular experience / Engineering minimal`, `简体中文 / English`, and `Light / Dark` preferences. The `AI interpretation Off / On` control appears only beside the `/app/` input workflow, defaults off, identifies itself independently of the switch state, and changes no deterministic record.

## Deterministic workflow

The functional workspace offers two input paths:

1. a controlled review pack using frozen C01, C03, C05, and C08 IFC pairs;
2. one local MEP IFC and one local structural IFC with fixed, non-swappable roles.

The controlled review pack is a presentation bundle, not one federated model pair. It runs four independent real `evaluateIfcPair` computations from the frozen IFC bytes so one review context demonstrates the complete deterministic hierarchy:

- C01 → `CLASH`;
- C03 → hard result `CLEAR`, clearance result `WARNING` at `0 mm`;
- C05 → clearance result `CLEAR` at approximately `200 mm`;
- C08 → `NOT_EVALUATED` with missing-geometry diagnostics.

Custom files are preflighted for `.ifc`, the 25 MiB candidate limit, IFC4 header declaration, and metre length-unit evidence. The user must explicitly confirm shared project coordinates because the application does not register models; this confirmation is unchecked on every first load and is never inferred or auto-selected. The G3 engine then remains authoritative for schema, unit, coordination transform, geometry, frozen thresholds, and failure closing.

## Results and evidence

The review surface provides:

- text/icon/border status counts for `CLASH`, `WARNING`, `NOT_EVALUATED`, and `CLEAR`;
- stable result rows and All / Clash / Clearance / Not-evaluated filters;
- selected-record summaries with exact rule ID and both GUIDs;
- a docked full-evidence drawer containing types, names, GUIDs, tolerance, measured clearance, detector, certificate, diagnostics, algorithm boundary, and model SHA-256 values;
- `CLASH` precedence over duplicate clearance output exactly as specified by G3;
- `NOT_EVALUATED` as a first-class record and run-level failure state rather than a muted error.

The Three.js viewer reparses the selected pair's actual IFC bytes through local `web-ifc`, streams `IfcPipeSegment`, `IfcWall`, and `IfcBeam` meshes, and maps them by GUID. Result selection loads the matching pair, dims non-involved geometry, highlights stable A/B roles, and provides focus, fit-models, and reversible pair-isolation controls. Orbit, pan, and zoom are supplied by local Three.js controls. The adjacent deterministic record is the text equivalent and remains authoritative if 3D loading fails.

## AI boundary

No G4 file contains a provider endpoint, API adapter, API key, or request flow. With AI off, the entry is disabled and explains the boundary. Turning the preference on only reveals a preview of proposed structured fields plus a deterministic template; it explicitly excludes IFC bytes, meshes, filenames, paths, and browser metadata and states that nothing was sent.

Provider comparison, current official free-tier research, key storage, consent submission, live calls, timeout/rate-limit behavior, and provider-specific degradation belong only to separately authorized G4AI.

## Offline and privacy behavior

Runtime code, Three.js, web-ifc, WASM, controlled IFC fixtures, styles, and all product routes are served from the local project. The deterministic workflow makes no external request. External URLs appear only as user-invoked public documentation/GitHub links.

Custom model bytes stay in the current browser page memory. Filenames are displayed only in the local setup state and are not copied into Clash or Clearance Warning Records. Refreshing the page releases that in-memory selection. The interface repeats that the prototype is not certified engineering, regulatory, fire, or structural-safety review.

## Accessibility and responsive acceptance

- skip navigation, landmarks, headings, visible text labels, accessible names, and keyboard-operable native controls are present;
- status is never encoded by color alone;
- buttons center label/icon groups with a 44 px-or-greater primary target;
- focus indicators, high-contrast earth-tone surfaces, disciplined radius tokens, and reduced-motion overrides are defined;
- the 3D canvas is keyboard-focusable and has a deterministic text equivalent without creating a keyboard trap;
- below 1024 CSS px, the workspace displays a desktop-required notice and disables parsing instead of claiming mobile support;
- static homepage and development information remain responsive and readable.

## Current Chrome acceptance

The current signed-in desktop Chrome session was used only for local product QA and read-only public evidence checks. The local product observations were:

- homepage: product title, a CSS wall–pipe–collision–dialog mark with explicit rear/front pipe occlusion at the wall interface, two `_blank` actions, three display preferences, a combined three-module product showcase, and four refreshed program-generated real-route previews; the deterministic-workspace bubble includes the complete 3D toolbar, model scene, four results, and record panel without a visible browser scrollbar;
- English homepage showcase: at `1708 × 898`, the third card reads `Built in public. / Fully traceable.` in exactly two line-heights under both Popular experience and Engineering minimal with Dark appearance active;
- homepage hover-preview geometry: the bubble frame and image crop share one radius token, verified as `16 px / 16 px` in Popular experience and `0 px / 0 px` in Engineering minimal across light and dark appearances;
- preference cross-product probe: Minimal + English + Light rendered correctly, then returned to Mainstream + 简中 + Dark; AI remained off by default;
- controlled review pack: `CLASH 1 / WARNING 1 / NOT_EVALUATED 1 / CLEAR 1`, four records, one real WebGL canvas, no console warning/error;
- C03 selected evidence: exact hard rule/clearance rule identities, both GUIDs, `2.0 mm` tolerance, `0 mm / 50.0 mm` clearance evidence, detector/certificate/boundary, and both SHA-256 values;
- AI preference: absent from the homepage/development headers and the workspace header; one labelled workspace option is off by default, displays its state inside a larger track, and enabling exposed the exact unsent field preview and deterministic fallback text before returning to off;
- responsive layout: the Chinese and concise English workspace titles, two primary file cards, secondary demo strip, and display controls remain readable at 1024, 1280, and 1433 CSS px;
- custom input: the frozen C01 MEP/structure IFC files passed boundary preflight and independently produced one `CLASH` record plus a real IFC 3D view;
- shared-coordinate guard: removing confirmation prevented the custom run and displayed an explicit failure-closed message;
- 900 px viewport: desktop-required notice visible and run disabled;
- development route: eight completed Gate labels, four verified metrics including a single-baseline orange clearance value/unit treatment, eight `PASS` markers, semantically locked bilingual failure/open-method headings, a public-facing source/validation/MIT/CC0 evidence section with no personal publication workflow, a product-name-only footer, no local absolute path, no local audit filename, and no console warning/error.

## Automated acceptance

`scripts/test-g4.ps1` validates the three route/source contracts, exact preference defaults and per-route AI placement, bilingual coverage, four real preview assets, AI-provider absence, real viewer imports/controls, JavaScript syntax, local content types including PNG and WASM, offline route smoke tests, G3 regression, temporary-output cleanup, and unchanged Git worktree state during the suite.

G4 does not claim arbitrary IFC/exporter compatibility, large-model performance, certified engineering suitability, mobile 3D review, provider-backed AI interpretation, deployment, or public hosting.

## Publication readiness

The user accepted the three-page frontend and explicitly authorized the original GitHub checkpoint. Chrome verification closed an exact 22-file public set, including four reviewed real-route preview PNGs, followed by the bounded public-plan/public-ledger mapping tail. The authorized G4-R1 repair publishes the state-reset implementation and its regression contract as `914b0d92d0ae77b3cd4ed49885690acf2de37a8c` and `ae8f16784afbaaecf2b69ab80d98f75d6340e4b6`: stale review state is invalidated when inputs change, coordinate consent is revoked for a new custom pair, and the 3D source is forced to reload. The first web upload flattened both paths into the repository root (`72eda6c6e7c6c8f89afe8a4c11188f0d83b7fb83`); Chrome verification caught it before closure, and cleanup commits `3372a89` and `58bde53` removed both unintended root files before the correct path-scoped commits were made. Maintainer-only audit scripts, the local master plan, local outputs, dependencies, browser state, model data, deployment files, G4AI provider work, and video remain excluded from publication.
