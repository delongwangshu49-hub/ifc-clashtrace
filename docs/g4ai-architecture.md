# G4AI optional interpretation architecture

> Status: base G4AI is `PASS`. The bounded G4AI-R1 usefulness/discoverability repair has passed local mock, regression, publication-audit, and no-key browser acceptance, but remains `IN_PROGRESS` until any separately authorized public checkpoint is completed. No new live call or public write is implied.

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

The G4AI-R1 schema is a deliberately bounded relaxation of the live-closure enum contract. It remains a closed object whose required property names are the exact actionable local references, which keeps missing, duplicate, unknown, merged, and renamed references structurally impossible. Each required record may now contain a bounded coordination-analysis paragraph and one next step, and the response contains one bounded cross-record synthesis. Provider prose still has no status, rule, evidence, or measurement fields.

The system prompt explicitly requires a two-to-four-sentence synthesis, a two-to-three-sentence evidence reading for every actionable record, and one concrete evidence-based next step. It asks the model to compare review priority and distinguish direct conflict, reduced clearance margin, and missing evidence when those facts are present; it also rejects status-label repetition and fragmentary copy. The model may not invent causes, locations, discipline ownership, design intent, code or safety outcomes, certification, new dimensions, or preferred engineering solutions. Local validation independently rejects wrong-language text, uppercase machine status tokens, numeric metre/millimetre claims, URLs, unknown references, incomplete coverage, and overlong content. Failure still closes to a richer local analysis derived only from the same structured fields.

## Key and runtime boundary

`scripts/g4ai-local-server.mjs` reads `GROQ_API_KEY` from the process environment and never returns or logs it. The browser has no provider endpoint, authorization header, or key handling. `.env.example` contains an empty placeholder only; real `.env*` files remain ignored. The adapter uses the built-in Node `fetch`, so G4AI adds no dependency and does not change the frozen G3 geometry packages.

The original `scripts/g1-static-server.mjs` and `npm run g4:serve` remain available for fully offline G4 operation. `npm run g4ai:serve` adds the optional same-origin API. If the key, network, quota, provider, or response is unavailable, the deterministic UI and 3D review continue to work.

## User controls and degradation

- AI is off by default.
- Turning it on sends nothing.
- Before a run, one compact sentence discloses that optional AI interpretation is available, names the selected GroqCloud model, explains that the outbound fields are shown before confirmation, and points users to the provider's current public terms for availability and data handling. It contains no AI control and avoids account-specific implementation language.
- After a deterministic run, one compact entry appears directly below the result summary. It is the only AI toggle on the page and pairs that toggle with the short `AI 解读 / Interpret` action; the earlier repeated card, three-step strip, and long CTA are removed.
- The user must open a pre-send preview, inspect the exact minimized records, and check a fresh consent box before the send button becomes enabled.
- The request can be cancelled.
- Success can be copied or closed.
- Retry is offered only for retryable errors.
- The request locale follows the active UI language. Both generated prose and the local fallback are validated as Chinese only for `zh-CN` and English only for `en`; changing the UI language invalidates any earlier preview or interpretation so stale-language output cannot remain visible or be resent.
- Timeout, rate limit, quota exhaustion, missing key, network failure, provider failure, cross-origin rejection, and malformed response return a local deterministic template or explicit error without changing machine records.

## Automated evidence

`scripts/test-g4ai.ps1` and `scripts/g4ai-tests.mjs` cover:

- minimal-field allowlisting and prohibited-field absence;
- prompt-injection strings in GUID/name/diagnostic fields never reaching the provider body;
- request/response schema validation and deterministic-input immutability;
- substantive cross-record synthesis, per-record evidence reading, bounded prose, exact actionable references, and Chinese/English language matching;
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

That fourth call closed the original G4AI checkpoint and remains valid historical evidence for the enum-only contract used at the time. It does not prove the later G4AI-R1 bounded-prose contract. G4AI-R1 is therefore verified with mocks and local fallback first; any new live smoke remains a separately authorized action and is not inferred from the prior four approvals.

## G4AI-R1 human-readability repair

On 2026-08-29, the first review-pack trial exposed a real human-readability failure: the output was safe but reduced to generic status restatement and fragmented action labels, and the only generation entry sat inside the full-evidence drawer. The first repair moved the entry under the deterministic summary and rendered one synthesis plus coherent evidence-reading and coordination-focus blocks for each actionable record.

A second annotated review then showed that the initial discoverability fix overcorrected: the pre-run AI card and post-run AI card duplicated one another, two synchronized switches were visible, and the three-step strip plus long CTA repeated the consent flow already explained in the preview. The revised hierarchy now uses a single pre-run disclosure sentence for capability/provider/terms and a single compact post-run control. Preview and fresh consent remain mandatory after the short action is selected.

The change does not loosen deterministic authority. Exact record keys, minimal outbound fields, second consent, server-only key, same-origin guard, status/rule/evidence immutability, bilingual validation, timeout/cancel/retry, and failure closing all remain. The local fallback is also upgraded so a provider outage does not collapse the experience back to generic one-line fragments. Public UI copy describes the service state and fallback outcome without exposing internal provider error codes or account-level operational terminology; those details remain available only in technical evidence and tests.

## Current Chrome evidence

On 2026-08-28, the local product route was first exercised in the user's current desktop Chrome with the optional server deliberately started without a provider key. The review pack completed with one record in each deterministic state. AI was initially off; enabling it sent nothing. The pre-send view exposed only `R01`–`R04`, the four status counts, allowlisted IFC types, rule/measurement kinds, and the dated provider disclosure. The send control remained disabled until a fresh consent checkbox was selected. The resulting `provider_unconfigured` response rendered the labelled local template, left all four deterministic records and the evidence drawer unchanged, and exposed working copy and close controls. The later controlled four-attempt live sequence is recorded above, including the three failure-closed attempts and final successful Chinese rendering.

The same logged-in Chrome session performed a read-only public-history check. The current public tip was the G4-R1 ledger commit `bb3b59ec95b2a379725215dbe44caedf3b7cdfe3`; all six supplied G4-R1 checkpoint URLs resolved. The failed flattened upload and both cleanup commits also resolved, the corrected `app/ui/app.mjs` and `scripts/test-g4.ps1` paths existed, and the two root-level error paths returned `File not found`. No public write occurred during these checks.
