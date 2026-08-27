# DG design approval package

> Status: `APPROVED`
> Fidelity: low-fidelity product direction only; this is not implemented UI.  
> Gate boundary: no G4, runtime AI, deployment, or video work is included.
> Revision: R4 incorporates the user's near-final logo feedback by increasing icon–wordmark safe space and replacing the yellow/ochre collision accent with restrained orange-red.
> Approval: explicitly approved by the user on 2026-08-27 (Asia/Hong_Kong); implementation remains blocked until a separately authorized next Gate.

## 1. Decision requested

Approve, amend, or reject the following product direction for IFC ClashTrace:

1. a public homepage with the IFC ClashTrace logo/name, two equal hero actions, scroll-based product introduction, and a conventional project footer;
2. “Launch app” and “Development log” opening the functional workspace and research-history page in new tabs;
3. a desktop-first functional workspace with evidence-first information hierarchy, deterministic results above optional AI, and result-list-driven 3D focus;
4. two user-switchable style profiles: one selected mainstream profile plus a monochrome minimal profile;
5. user-switchable Simplified Chinese/English and light/dark appearance across all three pages;
6. an explicit AI interpretation on/off preference, default off, which never changes deterministic geometry results;
7. desktop Chrome for model processing and 3D review; mobile computation and 3D review remain out of scope;
8. `C editorial technology` as the single mainstream profile, revised to use deep earth-tone surfaces, a restrained orange-red accent, disciplined corner radii, and one coherent modern sans type system;
9. an original wall–pipe–collision–dialog logo and a bounded reveal sequence that resolves into the static brand lockup.

DG does not become `PASS` until the user explicitly approves this package. Until then, formal frontend styling remains `BLOCKED_BY_DESIGN_APPROVAL`.

## 2. Target users and situations

### Primary user

A BIM coordinator, MEP engineer, design reviewer, or technically capable project reviewer who needs to check a small, pre-coordinated pair of IFC4 models and understand why a deterministic rule produced a result.

### Primary situation

The user has one MEP IFC and one structural IFC in a shared project coordinate system. They want to:

1. confirm that the files are within the supported boundary;
2. run hard-clash and `<50 mm` clearance checks locally in the browser;
3. identify the most important result quickly;
4. focus the two involved components in 3D;
5. inspect GUIDs, types, thresholds, measured evidence, and limitations;
6. optionally request a natural-language explanation without changing the deterministic record.

### Secondary situation

A visitor first learns what the project does from the public homepage, opens the development history to audit how the evidence was built, or launches a bundled controlled example to understand the product in under three minutes without reading source code.

### Explicitly unsupported situations

- general-purpose BIM coordination or issue management;
- automatic model registration;
- arbitrary schemas, exporters, geometry families, or large projects;
- certified engineering, regulatory, fire, or structural compliance review;
- mobile 3D review or phone-based IFC processing;
- chat-first analysis or AI-generated geometry decisions.

## 3. Research basis

The design direction uses the following external evidence as constraints, not as copied UI:

- Autodesk's current Clash Detective documentation places clash results, item details, and display controls together; selecting a result can select the involved items in the scene, and “Focus on Clash” returns to a clash viewpoint. This supports a tightly coupled result-list and 3D-review workspace rather than separate pages. Sources: [Results Window](https://help.autodesk.com/cloudhelp/2027/ENU/Navisworks-Clash-Detective/files/GUID-FCC9E5E1-2717-48D2-8DBE-2055CF2DC61E.htm), [Use Viewpoints with Clash Results](https://help.autodesk.com/cloudhelp/2026/ENU/Navisworks-Clash-Detective/files/GUID-A9899852-57FF-4A0C-99E6-169E9D01B1BA.htm).
- buildingSMART BCF 3.0 represents viewpoint relevance through selected components, visibility, coloring, camera, and optional clipping information, with IFC GUIDs used where possible. This supports preserving GUID identity and explicit component selection/highlighting in the review view. Sources: [BCF visualization schema](https://github.com/buildingSMART/BCF-XML/blob/release_3_0/Schemas/visinfo.xsd), [BCF API 3.0](https://github.com/buildingSMART/BCF-API/blob/release_3_0/README.md).
- WCAG 2.2 requires that color not be the only means of conveying status, specifies at least `4.5:1` contrast for normal text, and includes visible/unobscured focus requirements. This supports text labels, icons/shapes, borders, and strong keyboard focus in addition to status color. Sources: [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color), [Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [WCAG 2.2](https://www.w3.org/TR/wcag/).
- Current mainstream-style exploration uses category-level patterns rather than copying a specific site: Material 3 Expressive documents vibrant color, adaptive components, flexible typography, and contrasting shapes; Ant Design emphasizes low cognitive cost and a familiar blue enterprise action language; Atlassian treats spacing, grid, color, typography, icons, illustration, radius, and accessibility as one coordinated foundation; Webflow's 2026 trend review notes a push toward distinctive, intentionally crafted visuals rather than interchangeable template sameness. Sources: [Material Design 3](https://m3.material.io/), [Ant Design values](https://ant.design/docs/spec/values/), [Atlassian foundations](https://atlassian.design/foundations), [Webflow 2026 web design trends](https://webflow.com/blog/web-design-trends-2026).

Research does not justify expanding the product to BCF authoring, collaboration, clipping-plane tools, or a full Navisworks-like interface.

## 4. Experience principles

1. **Deterministic evidence first.** Machine status, rule, GUIDs, threshold, and geometry evidence appear before explanation or visual polish.
2. **Fail closed visibly.** `NOT_EVALUATED` is a first-class outcome with a reason and next action, never a muted error or implicit clear result.
3. **Clear public-to-product separation.** The homepage explains; the functional page performs; the development page provides evidence history.
4. **One review context inside the app.** File state, result list, 3D focus, and evidence remain in one functional workspace.
5. **Progressive disclosure.** The homepage introduces value before technical boundaries; the functional page surfaces task-critical boundaries before a run; detailed certificates and hashes open only when requested.
6. **No color-only meaning.** Every status uses a label, icon/shape, and border treatment in addition to color.
7. **Preferences do not alter facts.** Style, language, light/dark appearance, and AI availability never change deterministic records.
8. **AI is subordinate and opt-in.** AI is off by default and can explain a selected record only after the user enables it and previews the exact fields to be sent.
9. **Honest scope.** The interface repeats the desktop, schema, coordinate, geometry, privacy, and engineering-use boundaries where they affect a decision.

## 5. Information architecture

The approved candidate is a three-page public/product structure. The functional page remains one state-based workspace rather than a multi-page dashboard.

```text
Site
├─ Home `/`
│  ├─ Header: section navigation + preferences only
│  ├─ Hero: centered logo + IFC ClashTrace lockup
│  ├─ Hero continuation: concise promise + product graphic
│  ├─ Launch app → opens functional page in a new tab
│  ├─ Development log → opens research-history page in a new tab
│  ├─ scroll sections: capabilities, workflow, privacy/evidence boundaries
│  └─ Footer: contributors, GitHub, development, data/license, privacy links
├─ Functional workspace `/app` (new tab)
│  ├─ Header: logo/name + local processing + style/language/theme + AI on/off
│  ├─ Task setup (before run)
│  ├─ Controlled example
│  ├─ MEP IFC input
│  ├─ Structure IFC input
│  ├─ Supported-boundary checklist
│  └─ Run deterministic checks
│  ├─ Run feedback
│  ├─ Current phase
│  ├─ per-model validation
│  └─ failure-closed diagnostic
│  └─ Review workspace (after run)
   ├─ Summary strip
   │  ├─ CLASH
   │  ├─ WARNING
   │  ├─ NOT_EVALUATED
   │  └─ evaluated pairs / runtime
   ├─ 3D viewport
   │  ├─ focused MEP component A
   │  ├─ focused structure component B
   │  ├─ viewpoint reset
   │  └─ role legend and local-processing label
   ├─ Results panel
   │  ├─ All / Clash / Clearance / Not evaluated filters
   │  ├─ stable result rows
   │  └─ selected-record summary
   └─ Evidence drawer
      ├─ deterministic status and rule
      ├─ GUID/type/name for A and B
      ├─ tolerance or measured clearance
      ├─ location / nearest points
      ├─ detector, hashes, certificate, diagnostic
      ├─ limitations and engineering disclaimer
      └─ optional AI interpretation entry
└─ Development history `/development` (new tab)
   ├─ project question and bounded claims
   ├─ Gate timeline G0A → current completed Gate
   ├─ research, tests, failures, repairs, and evidence links
   ├─ local-vs-public history explanation without private paths
   └─ GitHub / licenses / documentation links
```

## 6. First-screen task and priority

The first public screen is the homepage hero. It contains:

1. a top utility/navigation bar without competing hero branding;
2. a centered geometric logo and `IFC ClashTrace` name directly below that bar;
3. one concise benefit statement and one complete explanation sentence below the brand lockup;
4. two equal, centered actions: `立即使用 / Launch app` and `研发进程 / Development log`, each visibly marked as opening a new tab;
5. one project-specific visual explaining pipe–structure clash traceability;
6. local-processing, deterministic-first, and failure-closed assurance text.

Scrolling then alternates graphics and complete explanatory copy for core capability, three-step workflow, traceable evidence, preference controls, and limitations. The footer provides contributors, GitHub, development history, data/license, privacy, and engineering-disclaimer links.

The functional page's first screen contains the controlled example, two fixed-role IFC inputs, supported-boundary checklist, one primary run action, local-processing notice, and non-certified-engineering disclaimer. It does not show empty charts, an empty 3D scene, marketing metrics, or AI chat.

After a run, the priority becomes:

1. run-level status and any failure-closed message;
2. count and severity of deterministic outcomes;
3. selected result and 3D context;
4. auditable evidence;
5. optional AI explanation.

## 7. Low-fidelity wireframes

The original two review assets remain deliberately grayscale and carry `data-fidelity="low"`:

- [setup state](wireframes/dg-setup.svg)
- [review state](wireframes/dg-review.svg)

They communicate the functional setup/review hierarchy only. The user's R2/R3 feedback supersedes their typography, button alignment, completeness, color, radius, branding, and missing-homepage presentation; those aspects are not approved. The revised homepage and final functional wireframes will be frozen only after the R3 logo and complete package are approved.

### Setup state, text equivalent

```text
┌ IFC ClashTrace ─ Local browser processing ─ Boundaries ┐
│ Check one MEP IFC against one structural IFC            │
│ [Use controlled example]                                │
│ MEP model       [Choose IFC]  validation status         │
│ Structure model [Choose IFC]  validation status         │
│ Supported: IFC4 · metre · shared coordinates · desktop  │
│ [Run deterministic checks]                              │
│ Files stay local. Not certified engineering review.     │
└──────────────────────────────────────────────────────────┘
```

### Review state, text equivalent

```text
┌ IFC ClashTrace ─ Run complete ─ Boundaries ─ New run ───┐
│ CLASH 3 | WARNING 2 | NOT_EVALUATED 1 | Evaluated 7/8   │
├──────────────────────────────┬───────────────────────────┤
│                              │ Filters: All Clash ...    │
│         3D VIEWPORT          │ [!] C01 Pipe—Wall        │
│   A MEP / B STRUCTURE        │ [△] C03 Clearance 0 mm   │
│   focus + reset + legend     │ [?] C08 Not evaluated    │
│                              │                           │
├──────────────────────────────┴───────────────────────────┤
│ SELECTED RECORD: status · rule · GUID A/B · evidence     │
│ [View full evidence] [Explain with AI…]                  │
│ AI is optional and cannot alter deterministic status.    │
└──────────────────────────────────────────────────────────┘
```

## 8. Interaction flow and states

### A. Start and validation

1. User chooses the controlled example or selects the MEP and structure files separately.
2. Each input retains its explicit role; drag-and-drop does not infer or swap roles silently.
3. The app validates file type, size candidate limit, IFC4 schema, metre unit, and shared-coordinate assertion before enabling the run.
4. A failure explains the unsupported condition and leaves the run disabled. It never reports `CLEAR`.

### B. Run

1. The run action changes to a non-blocking phase indicator: validate → parse → extract geometry → evaluate hard clash → evaluate clearance → finalize records.
2. Cancel is permitted if implementation can release resources safely; cancellation yields no partial “pass” summary.
3. A run-level failure produces `NOT_EVALUATED` diagnostics and a recovery action.

### C. Review

1. The summary strip provides counts with text and icons, not color alone.
2. Results default to deterministic priority: `CLASH`, then `WARNING`, then `NOT_EVALUATED`, then `CLEAR`; stable IDs break ties.
3. Selecting a row loads a repeatable focus viewpoint, highlights component A and B, and opens the compact selected-record summary.
4. Selecting a component in 3D may highlight the corresponding GUID in the evidence panel, but it cannot change a record's status.
5. “Reset focus” returns to the selected record viewpoint. “Fit models” returns to the combined model context.
6. Full evidence opens as a docked drawer so the record list and 3D context remain visible.

### D. Optional AI interpretation

1. The entry is unavailable until a deterministic record is selected.
2. Activating it opens a field-preview confirmation, not an empty chat box.
3. The preview lists the exact structured fields proposed for transmission and states that IFC bytes, meshes, file names, paths, and browser metadata are excluded.
4. The user explicitly confirms before any request.
5. Output appears in a visually separate “AI-generated interpretation” section with copy/retry/cancel/close controls.
6. Timeout, quota, malformed response, or no network returns a deterministic template explanation; the record remains unchanged.

## 9. 3D viewport and results-list relationship

- Desktop review uses an approximately `60:40` viewport-to-results split at the target demo width.
- The result row is the authoritative selection. The 3D viewport is explanatory evidence, not a second classification surface.
- Component roles remain stable: `A · MEP` and `B · STRUCTURE`. Labels, outline patterns, and the legend accompany color.
- The selected clash/clearance location uses a marker distinct from both component role treatments.
- Non-involved geometry is dimmed rather than hidden by default, preserving spatial context. A user can temporarily isolate the pair, but the control must be reversible and clearly labeled.
- The initial G4 slice includes orbit, pan, zoom, focus selected record, reset focus, fit models, pair isolate, and role legend only.
- Section planes, markups, saved viewpoints, BCF export, measurement tools, and issue workflow are explicitly deferred.

## 10. Deterministic result hierarchy

The two fixed machine rules remain `MEP_STRUCTURE_HARD_CLASH_V1` and `MEP_STRUCTURE_CLEARANCE_WARNING_V1`; the interface must display the applicable rule ID without renaming or hiding it.

```text
Run-level validity / failure closing
  └─ Deterministic record status
      ├─ CLASH — approved hard-clash certificate exceeded 2 mm
      ├─ WARNING — authoritative hard result is CLEAR and surface clearance < 50 mm
      ├─ NOT_EVALUATED — reliability or support boundary failed
      └─ CLEAR — evaluated and neither rule reported an issue
          └─ Evidence and limitations
              └─ Optional AI interpretation (never authoritative)
```

`CLEAR` is intentionally less visually dominant than `CLASH`, `WARNING`, and `NOT_EVALUATED`. Hard-clash `CLASH` suppresses the duplicate clearance result exactly as the engine contract requires.

## 11. Visual direction

### Two selectable product profiles

The site will expose exactly two named style profiles. Both share identical content, semantics, focus order, accessibility, and functional behavior.

- `大众版 / Mainstream`: selected as candidate C editorial technology, with the R3 earth-tone and typography corrections below.
- `极简版 / Minimal`: black/white/gray, direct geometry, limited radius, no decorative gradient, and the user's preferred restrained tone.

The style selection is a presentation preference, not a separate route or build. It persists locally and can be changed from each page header.

### Mainstream candidate A — Modern SaaS (unselected)

- generous whitespace, friendly rounded geometry, soft blue/violet accents, subtle gradients, and product UI shown as a polished evidence object;
- immediately recognizable as a current SaaS/AI landing page and easiest for a broad non-specialist audience to accept;
- risk: can feel generic if the clash/GUID graphic and engineering copy are not distinctive.

### Mainstream candidate B — Professional engineering (unselected)

- blue-gray palette, strict grid, squared modules, technical line illustration, and stronger evidence density;
- highest trust fit for BIM coordinators, engineering reviewers, and enterprise audiences;
- risk: less warm and less visually fashionable than A.

### Selected mainstream candidate C — Editorial technology, R3

- asymmetric editorial composition, deep earth-tone surfaces, warm stone/cream relief areas, and one restrained orange-red collision/brand accent;
- one coherent bold modern sans family across the brand and interface, with a compatible Simplified Chinese sans face and semantic weights rather than unrelated display/body fonts;
- text/background pairs deliberately alternate light-on-dark and dark-on-light for readability; bright translucent surfaces, yellow-washed page backgrounds, and low-contrast copy are excluded;
- corner radii use a small declared token set and are applied consistently; controls, cards, and media frames cannot mix missing, arbitrary, or over-rounded corners;
- premium and distinctive while remaining grounded in BIM/engineering subject matter rather than decorative fashion.

### Keywords

- restrained;
- engineering review workstation;
- evidence-first;
- calm and precise;
- compact but legible;
- high-contrast focus;
- spatial context before decoration.

### Explicit exclusions

- cyberpunk/neon styling;
- marketing hero sections after the app starts;
- glassmorphism, decorative gradients, or excessive shadows;
- bright, translucent, or uniformly yellow page backgrounds;
- red/amber/green without labels and shapes;
- chat-first layout or a persistent AI assistant avatar;
- animated backgrounds, confetti, parallax, ornamental 3D motion, or a continuously looping logo after its bounded reveal;
- dense enterprise menus unrelated to the minimum review loop;
- pseudo-precision such as an invented penetration distance.
- mismatched font families within one language, arbitrary one-off font sizes, off-center button labels/icons, incomplete descriptions, or icon-only preference controls without names.

### Proposed color strategy for later implementation

The functional wireframes do not apply final color. After the mainstream candidate is selected, implementation should test the following shared direction:

- deep earth-tone application shells and section backgrounds, balanced by warm stone/cream relief surfaces rather than an airy white canvas;
- restrained orange-red reserved for the collision cue, focused emphasis, and limited brand accents rather than large page fills;
- dark neutral 3D viewport for mesh legibility;
- status-specific text, icon, and border tokens for `CLASH`, `WARNING`, `NOT_EVALUATED`, and `CLEAR`;
- separate MEP/structure role colors in the viewport so object role is not confused with result status;
- all normal text/background pairs target WCAG 2.2 AA `4.5:1`; component boundaries and focus indicators target at least `3:1`;
- selected/focused states use a visible two-layer outline and are never represented by hue alone.

Exact hex values remain an implementation-level verification item because contrast depends on the final adjacent colors. DG approval freezes the direction, not untested color tokens.

### Typography and density

- Each language/style profile uses one declared modern sans UI family and one declared evidence-monospace family; arbitrary per-section font substitution is forbidden.
- Latin branding and interface copy use the same bold/direct sans direction as the approved reference rhythm; Simplified Chinese uses a visually compatible sans face with matched weight, width, and x-height. A separate serif display family is no longer part of candidate C.
- The implementation fallback remains `ui-sans-serif, system-ui, "Segoe UI", "Microsoft YaHei", sans-serif` unless a later licensed and locally served family passes bilingual rendering and privacy review.
- Evidence values: `ui-monospace, "Cascadia Mono", Consolas, monospace` for GUIDs, hashes, rule IDs, and measured values.
- Use tabular numerals for counts and distances.
- Compact desktop density on an 8 px spacing system; result rows remain at least 40 px high and primary controls target at least 44 px.
- Freeze one semantic type scale for display, H1, H2, H3, body, label, and caption; components consume those roles instead of one-off sizes.
- Button containers use layout centering for label and icon as one group; text baselines, left/right padding, minimum height, and icon size are tested in both languages.
- Every control has a complete visible label or accessible name; supporting text explains effect, privacy boundary, default state, and failure behavior where relevant.
- Long GUIDs and diagnostics wrap or copy; they never truncate without an accessible full value.

## 12. Language and brand strategy

- Product name and repository identity remain **IFC ClashTrace**. The R4 logo direction is an original compact isometric mark: one complete wall/structural element, one MEP pipe intersecting it, a restrained orange-red collision ring, and a small inspection dialog bubble integrated at the collision point. The concept remains approval material and is not yet a production asset.
- The homepage lockup is centered below the utility bar before explanatory copy. The horizontal compact lockup places the icon left and exact `IFC ClashTrace` wordmark right, separated by a deliberate safe gap of approximately one pipe outer diameter; favicon/app-icon and monochrome reductions must preserve the wall–pipe–collision reading.
- Simplified Chinese and English are both complete selectable interface languages. The chosen language applies to the homepage, functional page, development history, preferences, validation, empty states, errors, evidence help, and AI consent/output chrome.
- Preserve stable English machine tokens exactly: `CLASH`, `CLEAR`, `WARNING`, `NOT_EVALUATED`, rule IDs, IFC entity types, and GUID/hash field names.
- Present the human label first where helpful, for example `硬碰撞 · CLASH` and `无法求值 · NOT_EVALUATED`.
- README and public technical evidence remain English-first; the user-facing site needs a bounded two-language dictionary rather than machine-translated runtime copy.
- No national flag language selector, brand mascot, or renamed status terminology.
- One bounded logo reveal is allowed: complete wall appears, pipe enters, collision ring responds, dialog bubble emerges, and the final icon/wordmark settles. It must not imply detector progress, must stop on the static lockup, and must expose that same final state immediately under reduced-motion preferences.

### Global preference contract

- `Style`: `Mainstream` / `Minimal`.
- `Language`: `简体中文` / `English`.
- `Appearance`: `Light` / `Dark`; system-following may be added only if it does not obscure the user's explicit choice.
- `AI interpretation`: `Off` by default / `On` by explicit user action. Enabling the switch only exposes the later consent workflow; it never sends data by itself.
- Preferences are stored locally, can be changed from every page, and never alter deterministic records or model bytes.

## 13. Mobile and responsive scope

Mobile IFC processing and 3D review are **out of scope** for this prototype. The supported claim remains current desktop Chrome.

Proposed behavior below `1024 CSS px`:

- do not squeeze the 3D viewport and evidence panel into an unsafe review layout;
- show a plain desktop-required notice and the supported boundary;
- do not begin parsing or claim mobile compatibility;
- documentation and static project information may remain readable, but this is not a mobile product experience.

Tablet and mobile support may be reconsidered only after the desktop vertical slice, performance evidence, and usability test pass.

## 14. Accessibility and keyboard contract for G4

If DG is approved, implementation acceptance must include:

- logical heading/landmark structure and skip navigation;
- keyboard access for file selection, run, result filtering, record selection, evidence drawer, 3D focus controls, and AI consent controls;
- no keyboard trap in the 3D canvas or drawers;
- focus remains visible and unobscured;
- status labels and icons are available in text and accessible names;
- live regions announce run phase, completion, and failure without excessive chatter;
- the 3D canvas has a text equivalent through the selected-record evidence;
- reduced-motion preference disables nonessential camera tweening and replaces the brand reveal with its static final lockup;
- zoom to 200% does not hide deterministic evidence or actions.

These are implementation acceptance criteria, not claims that a UI already exists.

## 15. G4 handoff boundary if separately authorized

DG approval freezes the design contract only; it does not authorize implementation. If the user later gives a separate, explicit authorization to begin base G4, that Gate is limited to the following minimum vertical slice:

- public homepage with logo/name, two new-tab actions, scroll-based visual explanation, and project footer;
- development-history page populated only from sanitized public evidence;
- two-model selection and controlled example;
- input boundary validation and run feedback;
- summary, filterable deterministic results, evidence drawer;
- minimum 3D focus/isolate/reset interaction;
- desktop Chrome layout and accessibility contract;
- dual style, Simplified Chinese/English, and light/dark preference infrastructure;
- an AI interpretation enable/disable preference that defaults off and does not itself implement a provider call;
- placeholders for the later G4AI entry hierarchy, without implementing the provider or runtime request during G4 base work.

Neither DG approval nor this handoff description authorizes base G4 work, G4AI provider integration, deployment, public access changes, video production, BCF workflow, extra rules, or mobile model review. A separate user decision is required before any base G4 work. If G4 is later authorized, the homepage, development page, logo placeholder, and preference infrastructure are required presentation scope rather than optional embellishment.

## 16. Approval checklist

The user should confirm or amend each item:

- [x] Home + new-tab functional workspace + new-tab development-history architecture.
- [x] Hero logo/name, centered `立即使用` and `研发进程` actions, scroll explanation, and project footer.
- [x] Select candidate C editorial technology as the mainstream profile; retain monochrome minimal as the second switchable profile.
- [x] Give final approval to the R4 earth-tone palette, orange-red accent, unified sans typography, radius discipline, and high-contrast text direction.
- [x] Give final approval to the revised wall–pipe–collision–dialog mark, widened icon–wordmark safe space, and bounded reveal sequence.
- [x] Full Simplified Chinese/English and light/dark switching.
- [x] AI interpretation off/on preference, default off and deterministic-result neutral.
- [x] Desktop-first single-page functional review workspace.
- [x] Functional setup and review information architecture.
- [x] Result-list-driven 3D focus with stable A/B roles.
- [x] Deterministic outcome and failure closing above optional AI.
- [x] Exact English machine tokens retained in both languages.
- [x] Unified semantic typography, complete descriptions, and button/icon centering QA contract.
- [x] Shared accessible status and 3D evidence strategy across both visual profiles.
- [x] Mobile/phone computation and 3D review out of scope.
- [x] G4 boundary and deferred features.

Possible approval wording:

> I approve DG R4 in `docs/design-brief.md`, including candidate C as the earth-tone editorial-technology mainstream profile, the monochrome minimal profile, the orange-red wall–pipe–collision–dialog brand lockup with widened safe space and bounded reveal, and the homepage, functional workspace, development history, language, appearance, and AI preference contracts as written. Proceed no further than the next separately authorized Gate.

## 17. Approved DG publication set

The exact Chrome-upload candidate set contains exactly eight audited files:

1. `BIMCLASH_AGENT_MASTER_PLAN.public.md` — sanitized public plan only;
2. `PROGRESS_SYNC.md` — public checkpoint ledger;
3. `PROMPTS.md` — sanitized AI-assistance and human-verification record;
4. `README.md` — current public checkpoint summary;
5. `docs/design-brief.md` — R4 Design Gate package;
6. `docs/wireframes/dg-setup.svg` — low-fidelity setup hierarchy evidence;
7. `docs/wireframes/dg-review.svg` — low-fidelity review hierarchy evidence;
8. `scripts/test-dg.ps1` — repeatable public DG contract test.

Explicit exclusions: the authoritative local `BIMCLASH_AGENT_MASTER_PLAN.md`, every `scripts/audit-*.ps1`, supplied reference media, generated logo concept PNGs/storyboards, browser state, credentials, caches, and any formal G4 UI or animation asset. The generated logo drafts remain review-only; production vector/raster reductions and animation implementation are deferred until a separately authorized implementation Gate.
