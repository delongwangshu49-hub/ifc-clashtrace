# G4AI optional interpretation architecture

> Status: local implementation, simulated validation, and the separately authorized controlled live sequence are complete; the public checkpoint is required before G4AI can become `PASS`.

## Authority boundary

G4AI consumes a minimal derivative of records already produced by G3/G4. It has no import path into `app/core/ifc-clash-engine.mjs`, cannot call geometry code, and returns no status, rule, threshold, distance, GUID, model hash, or evidence field. The browser renders each AI explanation beside the unchanged deterministic record status. If prose conflicts with a machine record, the machine record is authoritative.

## Data flow

```text
deterministic records in browser memory
  -> allowlisted minimal derivative
  -> visible pre-send preview
  -> unchecked consent checkbox
  -> same-origin local server endpoint
  -> provider-neutral service
  -> Groq adapter with server-side environment key
  -> strict JSON response validation
  -> separate AI panel beside immutable deterministic facts
```

The minimal request contains only:

- locale;
- frozen public rule IDs and thresholds;
- counts for `CLASH`, `WARNING`, `CLEAR`, and `NOT_EVALUATED`;
- per-record local aliases such as `R01`;
- existing deterministic status;
- allowlisted IFC types (`IfcPipeSegment` and `IfcWall`/`IfcBeam`);
- existing finite measurement kind/value/threshold, or `null` where unavailable.

It explicitly excludes GUIDs, names, IFC bytes, meshes, filenames, paths, hashes, free-form diagnostics, locations, browser metadata, and account data. Unsupported types collapse to `UNAVAILABLE`. The server rejects extra fields, changed rule boundaries, inconsistent counts, non-finite values, duplicate aliases, oversized bodies, wrong content types, and cross-origin requests.

## Prompt and output controls

There is no user-authored prose in the provider request. Local aliases replace GUIDs and all free-form model strings are discarded, so an IFC name or diagnostic cannot become a prompt instruction. The provider receives fixed system instructions, the minimized JSON facts, no tools, and a strict JSON Schema.

The provider-return schema contains no free-form prose. It uses a closed object whose required property names are the exact actionable local references; each property permits only attention, rationale-category, and next-step-category enums. This makes missing, duplicate, and unknown references structurally impossible under strict decoding. The Groq adapter sorts the trusted properties by attention and materializes the codes through bilingual local templates; the provider-neutral validator then independently requires the exact actionable reference set. This keeps status and measurement presentation in deterministic UI components and makes arbitrary provider prose structurally impossible.

## Key and runtime boundary

`scripts/g4ai-local-server.mjs` reads `GROQ_API_KEY` from the process environment and never returns or logs it. The browser has no provider endpoint, authorization header, or key handling. `.env.example` contains an empty placeholder only; real `.env*` files remain ignored. The adapter uses the built-in Node `fetch`, so G4AI adds no dependency and does not change the frozen G3 geometry packages.

The original `scripts/g1-static-server.mjs` and `npm run g4:serve` remain available for fully offline G4 operation. `npm run g4ai:serve` adds the optional same-origin API. If the key, network, quota, provider, or response is unavailable, the deterministic UI and 3D review continue to work.

## User controls and degradation

- AI is off by default.
- Turning it on sends nothing.
- The user must open a pre-send preview, inspect the exact minimized records, and check a fresh consent box before the send button becomes enabled.
- The request can be cancelled.
- Success can be copied or closed.
- Retry is offered only for retryable errors.
- The request locale follows the active UI language. Trusted code materialization uses Chinese only for `zh-CN` and English only for `en`; changing the UI language invalidates any earlier preview or interpretation so stale-language output cannot remain visible or be resent.
- Timeout, rate limit, quota exhaustion, missing key, network failure, provider failure, cross-origin rejection, and malformed response return a local deterministic template or explicit error without changing machine records.

## Automated evidence

`scripts/test-g4ai.ps1` and `scripts/g4ai-tests.mjs` cover:

- minimal-field allowlisting and prohibited-field absence;
- prompt-injection strings in GUID/name/diagnostic fields never reaching the provider body;
- request/response schema validation and deterministic-input immutability;
- mock success;
- timeout, cancellation, rate limit, quota exhaustion, no network, missing provider, and malformed responses;
- deterministic template fallback;
- same-origin, content-type, size, and extra-field rejection;
- browser code containing no provider endpoint, authorization header, or key access;
- preview, second consent, send, retry, cancel, copy, and close contracts;
- full G4/G3 regression and worktree invariance.

Live quota is never used by automated tests. The controlled live sequence used only the generated review-pack derivative after explicit key-use authorization for every attempt.

## Controlled live evidence

On 2026-08-28, four minimal-field calls were made from the local same-origin server after four separate action-time confirmations. Every call used the same generated C01/C03/C05/C08 derivative; no IFC bytes, GUIDs, names, paths, hashes, diagnostics, key, or raw provider payload entered the evidence record.

1. A free-prose schema authenticated and returned JSON, but semantic validation rejected unreliable prose as `malformed_response`; the local deterministic fallback rendered and machine results stayed unchanged.
2. A dynamic-array constraint was rejected by the provider as `provider_rejected`; failure closing remained intact.
3. A static-array schema was accepted, but its actionable-reference set was not reliable and was rejected as `malformed_response`.
4. A closed object with the exact required actionable keys (`R01`, `R02`, `R04`) and enum-only values passed. The adapter materialized trusted Simplified Chinese templates locally, the UI displayed the separate AI label, the deterministic summary remained `CLASH/WARNING/CLEAR/NOT_EVALUATED = 1/1/1/1`, the evidence drawer was unchanged, and Chrome reported zero warning/error console entries.

The final contract returns language-independent codes only. Local trusted templates produce Chinese for `zh-CN` and English for `en`; automated tests cover both languages, and a language change cancels any in-flight request and invalidates prior preview/result state so stale-language output cannot remain visible. No additional live call is needed to validate that deterministic local mapping.

## Current Chrome evidence

On 2026-08-28, the local product route was first exercised in the user's current desktop Chrome with the optional server deliberately started without a provider key. The review pack completed with one record in each deterministic state. AI was initially off; enabling it sent nothing. The pre-send view exposed only `R01`–`R04`, the four status counts, allowlisted IFC types, rule/measurement kinds, and the dated provider disclosure. The send control remained disabled until a fresh consent checkbox was selected. The resulting `provider_unconfigured` response rendered the labelled local template, left all four deterministic records and the evidence drawer unchanged, and exposed working copy and close controls. The later controlled four-attempt live sequence is recorded above, including the three failure-closed attempts and final successful Chinese rendering.

The same logged-in Chrome session performed a read-only public-history check. The current public tip was the G4-R1 ledger commit `bb3b59ec95b2a379725215dbe44caedf3b7cdfe3`; all six supplied G4-R1 checkpoint URLs resolved. The failed flattened upload and both cleanup commits also resolved, the corrected `app/ui/app.mjs` and `scripts/test-g4.ps1` paths existed, and the two root-level error paths returned `File not found`. No public write occurred during these checks.
