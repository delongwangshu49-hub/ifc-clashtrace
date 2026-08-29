# G6 privacy, license, and provider audit

Audit date: 2026-08-29. Candidate state: private-only; public access is not approved.

## Candidate and privacy result

- Secret scan: no API key, token, cookie, password, private key, or credential value is present in tracked candidate files or browser assets. `.env.local` remains ignored and was not read, packaged, logged, or copied.
- Identity scan: no private email, phone number, personal name, employer/client/school identity, browser profile, or account menu appears in candidate text or media. Git author metadata uses the non-personal project identity already accepted by governance.
- Path scan: source, docs, static bundles, archive entries, and error responses contain no absolute workstation path. Build and test products stay under ignored local output roots.
- Media scan: the four real-route previews were byte-normalized to PNG. Their only ancillary chunks are color/gamma/physical-density declarations; they contain no EXIF, text, filename, software, path, timestamp, account, notification, or private-model metadata. Each remains below 1 MiB.
- Data scan: only the 16 CC0 project-generated C01–C08 IFC files are staged. G5 buildingSMART samples and all external/private input roots remain excluded.
- Governance scan: the local authoritative master plan and every `scripts/audit-*.ps1` remain excluded from publication. Git has no remote, and no remote credential is introduced by the build.

## License result

Project code remains MIT and project-generated IFC/evidence data remains CC0-1.0. Runtime and build dependencies are listed in `THIRD-PARTY-NOTICES.md`; the full locked transitive inventory is `docs/dependency-licenses.json`. Every locked package entry contains license metadata. The deployed WebAssembly binary is the unmodified MPL-2.0 `web-ifc` artifact and is not relicensed. No externally licensed IFC or ambiguous-license data is redistributed.

Result: license audit PASS for the private candidate.

## AI data-flow and key audit

The browser sends no data when AI is merely enabled. After deterministic computation, it can build only locale, frozen rule boundaries, status counts, local record aliases, allowlisted element types, and existing bounded measurements. Before each request it displays that derivative and requires fresh consent. IFC bytes, meshes, GUIDs, names, filenames, paths, hashes, locations, diagnostics, browser/account metadata, and raw evidence are structurally absent.

The provider endpoint and authorization header exist only in the server Worker bundle. `GROQ_API_KEY` is an optional hosting secret; no hosted secret has been configured for this candidate. Browser bundles contain no provider endpoint, authorization header, key lookup, or source map. The Worker returns `no-store` JSON, emits only bounded error categories, and contains no application logging call. Automated G6 checks make zero live provider requests.

## Provider terms and quota snapshot

Official Groq documentation was rechecked on 2026-08-29:

- `openai/gpt-oss-20b` remains a listed production model. The Free Plan table lists 30 RPM, 1,000 RPD, 8,000 TPM, and 200,000 TPD, while Groq warns that the exact organization limit shown in the console is authoritative.
- Usage metadata is always retained but is documented as excluding customer inputs/outputs. Inference customer data is not retained by default, except temporary reliability or abuse-monitoring logs for up to 30 days; all customers may enable Zero Data Retention. Retained customer data is documented as stored in U.S. GCP buckets.
- GroqCloud use is governed by the Groq Services Agreement and incorporated URL terms, which may change. The website Terms of Use are not the cloud-service contract.

Sources: [Your Data in GroqCloud](https://console.groq.com/docs/your-data), [Rate Limits](https://console.groq.com/docs/rate-limits), [Supported Models](https://console.groq.com/docs/models), and [Groq Services Agreement overview](https://console.groq.com/docs/legal/contractual-framework-overview).

These are dated facts, not promises of permanent free access, regional availability, uptime, capacity, pricing, retention behavior, or production suitability. Before any public AI-enabled deployment, the owner must separately verify account access, exact console limits, ZDR choice, region/legal suitability, and the then-current agreement. If that check is absent or unfavorable, keep the hosted key unset; deterministic review still works and AI fails closed locally.

## Access decision and stop gate

O-006 remains pending until the user reviews the private preview. The candidate may be deployed only with owner-only private access at this stage. A public Sites deployment, hosted API-key configuration, repository upload, or access-policy change requires separate action-time authorization. Privacy or license regression blocks any public action.
