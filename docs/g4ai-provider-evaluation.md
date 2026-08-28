# G4AI provider evaluation

> Status: implementation-day official-source review completed on 2026-08-28 (Asia/Hong_Kong). Free availability, limits, model catalogs, data controls, and terms can change; this document is a dated boundary, not a permanent promise.

## Decision

After reviewing the three dated alternatives, the user explicitly selected **GroqCloud Free Plan** with `openai/gpt-oss-20b` for the controlled adapter and then approved the quota-reservation policy below. The choice is intentionally replaceable: provider-specific HTTP, authentication, error mapping, and model settings live behind a provider-neutral interface and never enter the deterministic IFC engine.

The selected model appears in Groq's official Free Plan table at `30 RPM`, `1,000 RPD`, `8,000 TPM`, and `200,000 TPD`. Groq states that exact limits are organization-specific and should be checked in the account Limits page. The official Structured Outputs guide shows strict JSON Schema support for `openai/gpt-oss-20b`. An account and server-side API key are required. The services agreement is described as global, but actual account, regional, export-control, and model availability was demonstrated only for the controlled 2026-08-28 live sequence; future availability is not inferred from that result.

## Approved quota policy

- Automated and public-CI tests use mocks and consume zero live calls.
- A development day is capped at five intentional live analyses; the completed validation sequence used four, after separate action-time authorization for each call, and is now closed.
- Stop nonessential live use at least 24 hours before a professor review or product demonstration and reserve at least `40,000` daily tokens for that event. A `20,000`-token warning floor triggers mock-only work.
- The implementation caps completion at `900` tokens per call. Dividing `200,000 TPD` by that output cap gives about `222` calls, but this is only a lower-information equivalence because input, schema, and reasoning tokens also count. It is not a guaranteed call count; the account Limits page and response headers remain authoritative.
- If any rate, daily-token, account, model, or provider boundary is unavailable, G4AI fails closed to local deterministic explanation while the product's deterministic analysis remains fully usable.

## Official-source comparison

| Candidate | Free boundary checked 2026-08-28 | Rate/account boundary | Data handling boundary | Decision and exit condition |
|---|---|---|---|---|
| GroqCloud Free Plan | Official Free Plan table includes `openai/gpt-oss-20b` | `30 RPM / 1,000 RPD / 8K TPM / 200K TPD`; limits apply at organization level and exact account limits can differ; Groq account and API key required | Usage metadata is retained without input/output. Inference content is not retained by default, but may be logged for reliability or abuse investigations for up to 30 days; all customers may enable ZDR; retained customer data is stored in US GCP buckets | **Selected.** Exit if the model leaves the free plan, strict schema stops working, account/region access fails, retention controls become incompatible, or live reliability is inadequate |
| Google Gemini Developer API Free Tier | `gemini-2.5-flash-lite` input/output is free of charge | Limits are project/tier/model dependent and should be read from the active project; Google account/API key required | Official pricing marks free-tier content as “used to improve our products” | Not selected for this privacy-sensitive optional layer. Reconsider only with a data boundary acceptable to the project and a separately audited server-side adapter |
| Hugging Face Inference Providers | Free users receive `$0.10` monthly credit, explicitly subject to change | Hugging Face account/token required; routed requests may reach an external inference provider | Hugging Face says routed request/response bodies are not stored and debugging logs exclude user data/tokens, but the downstream provider's separate policy still applies | Not selected: the credit is too small for a stable demo claim and the two-layer policy adds complexity. Retain only as a future adapter candidate |

## Selected-provider safety facts

- API: `POST https://api.groq.com/openai/v1/chat/completions`.
- Authentication: `Authorization: Bearer <server-side key>`; the key is read only from `GROQ_API_KEY` in the server environment.
- Model: `openai/gpt-oss-20b` with strict JSON Schema response format and no tools.
- Customer obligations: the customer must have rights to inputs, provide required notices/consents, evaluate output accuracy, and must not rely on model output as professional advice.
- Ownership boundary: Groq's services agreement states that inputs and outputs are Customer Data and the customer retains intellectual-property rights in Customer Data, subject to applicable model terms and law.
- Data location/retention: potential retained customer data is in US GCP buckets; reliability/abuse logs may exist up to 30 days unless ZDR is enabled. The UI discloses this before consent.
- Security: Groq's official security guide requires environment variables or secret storage and warns against hardcoding keys. G4AI follows that rule and does not log provider response bodies.

## Official URLs

- Groq rate limits: https://console.groq.com/docs/rate-limits
- Groq data handling and ZDR: https://console.groq.com/docs/your-data
- Groq Structured Outputs: https://console.groq.com/docs/structured-outputs
- Groq API reference: https://console.groq.com/docs/api-reference
- Groq security onboarding: https://console.groq.com/docs/production-readiness/security-onboarding
- Groq services agreement (last modified 2026-06-22 when checked): https://console.groq.com/docs/legal/services-agreement
- Groq contractual framework overview: https://console.groq.com/docs/legal/contractual-framework-overview
- Google Gemini Developer API pricing: https://ai.google.dev/gemini-api/docs/pricing
- Google Gemini API rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Hugging Face Inference Providers pricing: https://huggingface.co/docs/inference-providers/pricing
- Hugging Face Inference Providers security: https://huggingface.co/docs/inference-providers/security

## Claim boundary

The selected free quota is enough for controlled development and a demonstration candidate under the approved budget; it is not a production capacity, uptime, or permanent-free guarantee. No public CI test consumes live quota. The controlled live sequence was limited to sanitized generated records, each call received action-time authorization, and no key or raw provider payload was recorded. Its fourth and final attempt passed; no further live call is required for G4AI closure.
