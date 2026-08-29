# G6 deployment-candidate architecture

Status: private candidate, verified 2026-08-29. This document describes the deployable shape; it does not authorize public access.

## Build and runtime

The existing three-page Vite application remains the product source. A multi-page build emits `/`, `/app/`, and `/development/`, bundles the existing browser modules without source maps, and copies only the 16 project-generated G2 IFC files, the matching data/license documents, and the upstream `web-ifc.wasm` runtime into the static artifact. No Python or native desktop component is required by the hosted runtime.

The client build emits the static application under `dist/client`, which is the Sites `ASSETS` binding boundary. The second build emits `dist/server/index.js`, a Cloudflare Worker-compatible ESM entry. Static requests are delegated to `ASSETS`; only the same-origin `/api/g4ai/status` and `/api/g4ai/interpret` routes are handled by the Worker. Keeping client and server output in these separate deployment directories prevents an apparently successful deployment whose Worker has no static asset binding.

```text
Browser-selected IFC bytes
  -> browser memory only
  -> web-ifc + three-mesh-bvh deterministic rules
  -> immutable records and local evidence UI
  -> optional allowlisted derivative preview
  -> fresh user consent
  -> same-origin Worker
  -> optional Groq adapter / deterministic local fallback
```

The browser never uploads IFC bytes for geometry evaluation. The static controlled pack uses public project-generated data. Custom filenames, bytes, meshes, GUIDs, names, paths, hashes, diagnostics, browser metadata, and account data are excluded from the AI request contract.

## AI failure boundary

AI remains off by default. Merely enabling the control sends nothing. The user must inspect the derivative and provide fresh consent for each request. The Worker accepts only the frozen exact-key contract, at most six records, JSON content, a same-origin request, and a 32 KiB body. The optional `GROQ_API_KEY` is read only from the Worker environment; it is not compiled into static assets, source maps, logs, or error bodies.

With no key, provider outage, timeout, quota exhaustion, malformed output, or local semantic rejection, the endpoint returns the trusted deterministic fallback and a bounded public error class. It never changes a status, rule, measurement, GUID mapping, or evidence record. The endpoint logs neither request nor provider response in project code.

## Access and state

The first hosted version must be owner-only private access. No database, object store, analytics, cookies, account profile, or durable application log is required. `.openai/hosting.json` is reserved for the Sites project identifier and declared capabilities; credentials are never stored there. Public deployment remains a separate user decision under O-006.

## Reproducibility

`scripts/g6-prepare-build.mjs` stages the exact public runtime inputs into an ignored local directory. `npm run build` produces the static and Worker artifacts. `scripts/test-g6.ps1` verifies the build, routes, no-key Worker behavior, package licenses, dependency vulnerability state, screenshot byte formats/metadata, and prior deterministic/AI regressions without making an external request.
