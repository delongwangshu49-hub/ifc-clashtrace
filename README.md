<div align="center">
  <img src="docs/assets/brand/ifc-clashtrace-github-logo.png" width="240" alt="IFC ClashTrace product logo: a metallic pipe crosses layered wall panels beside an outlined clash marker and inspection alert.">

# IFC ClashTrace

**Deterministic, browser-local IFC clash evidence with optional AI interpretation.**

[Live Site](https://ifc-clashtrace.tuned-box-0320.chatgpt.site) · [Product Film](https://www.youtube.com/watch?v=jK3OSltoTEQ) · [简体中文](README.zh-CN.md)

![Build](https://img.shields.io/badge/build-passing-2f855a?style=flat-square)
![IFC](https://img.shields.io/badge/IFC-IFC4-4b5563?style=flat-square)
![License](https://img.shields.io/badge/code-MIT-2563eb?style=flat-square)
![Data](https://img.shields.io/badge/generated_data-CC0--1.0-7c3aed?style=flat-square)
</div>

IFC ClashTrace compares one MEP IFC model with one structural IFC model directly in the browser. It produces deterministic hard-clash and surface-clearance records, links every result back to both elements and its calculation evidence, and fails closed as `NOT_EVALUATED` when the available geometry cannot support a reliable conclusion.

The public Sites deployment is live. Its optional Groq interpretation layer is server-side, consent-gated, and unable to alter deterministic records. G7 remains in progress while the final audit and bilingual GitHub delivery are being closed.

## Highlights

- **Browser-local IFC processing** — IFC bytes, meshes, filenames, paths, GUIDs, and element names are not sent to the AI provider.
- **Two deterministic rules** — strict `> 2 mm` hard-clash classification and `< 50 mm` surface-clearance warning semantics.
- **Evidence-first review** — filterable records, paired element identity, measurements, diagnostics, a full evidence drawer, and Three.js focus/isolation.
- **Failure-closed behavior** — incomplete or unsupported geometry returns `NOT_EVALUATED`; the application does not guess `CLEAR`.
- **Optional AI interpretation** — off by default, exact-field preview, fresh per-request consent, strict schema validation, and deterministic fallback.
- **Bilingual interface** — English and Simplified Chinese with persistent Light/Dark preferences.
- **Open evidence** — controlled fixtures, evaluation records, support boundaries, deployment architecture, licenses, and the development log are inspectable.

## Try it

Open the [live application](https://ifc-clashtrace.tuned-box-0320.chatgpt.site/app/), then:

1. Choose `Review pack · C01 / C03 / C05 / C08`.
2. Select **Load example**.
3. Run the deterministic checks.
4. Review one `CLASH`, one `WARNING`, one `CLEAR`, and one `NOT_EVALUATED` record.
5. Optionally enable AI, inspect the exact derivative fields, and provide fresh consent for a single interpretation request.

For a larger generated example, choose `PG-E · Realistic one-storey clinic · 88 pairs`.

## How it works

```text
MEP IFC + structural IFC
        │
        ▼
browser-local web-ifc parsing
        │
        ▼
deterministic hard-clash + clearance engine
        │
        ├── records, measurements, diagnostics and 3D evidence
        │
        └── optional minimal derivative
                │ exact preview + fresh consent
                ▼
           same-origin Worker
                │
                ├── Groq interpretation (when available)
                └── deterministic local fallback
```

The deterministic engine is always authoritative. Provider output contains prose only and cannot change status, rule, measurement, element mapping, or evidence fields.

## Quick start

### Requirements

- Node.js 24 or newer
- PowerShell 7 for the full verification suite
- Desktop Chrome for the supported interactive review path

### Install and run

```bash
npm ci
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/`.

The deterministic application works without an API key. `GROQ_API_KEY` is optional, must remain server-side, and must never be committed. See [.env.example](.env.example) and the [AI architecture](docs/g4ai-architecture.md) before enabling a local provider route.

## Verification

Run the complete current build and regression chain:

```powershell
pwsh -NoProfile -File scripts/test-g6.ps1
```

Focused public contracts are also available:

```powershell
pwsh -NoProfile -File scripts/test-pg-c.ps1
pwsh -NoProfile -File scripts/test-pg-b.ps1
pwsh -NoProfile -File scripts/test-pg-e.ps1
pwsh -NoProfile -File scripts/test-g7b.ps1
```

Current controlled evidence includes:

| Evidence | Result |
|---|---:|
| Frozen hard-clash cases | 8/8 three-way status agreement |
| Independent clearance fixtures | 9/9 agreement on both evaluator routes |
| Controlled hard-clash TP / FP / FN / TN | 3 / 0 / 0 / 4, plus one deliberate abstention |
| PG-E technical sentinels | 6/6 |
| PG-E full result set | 4 `CLASH`, 1 `WARNING`, 72 `CLEAR`, 11 `NOT_EVALUATED` |
| Hosted controlled AI check | Provider mode; deterministic `1/1/1/1` summary preserved |

These are bounded controlled results, not a claim of arbitrary real-project accuracy or engineering certification.

## Supported boundary

| Area | Current support |
|---|---|
| Schema | IFC4 |
| Encoding | Uncompressed STEP IFC |
| Length unit | Metres |
| Coordinates | Shared project coordinates; no automatic registration |
| File size | Up to 25 MiB per candidate file |
| Primary runtime | Desktop Chrome, at least 1024 CSS px |
| Hard clash | Strictly greater than 2 mm certified interior depth |
| Clearance warning | Surface distance below 50 mm |
| Mobile computation | Not currently supported |

IFC4X3 and broader exporter compatibility remain exploratory. Unsupported or ambiguous inputs fail closed.

## Privacy and AI boundary

AI is optional and disabled by default. A request is possible only after the interface displays the exact derivative and receives fresh consent. The request contract allows at most six records and excludes:

- IFC bytes and meshes;
- GUIDs, element names, filenames, paths, and hashes;
- diagnostics, browser metadata, account data, and private project content.

The hosted credential is stored as a Sites Secret and is absent from the repository, client bundle, source maps, logs, and public error bodies. Provider outages, timeouts, quota errors, malformed output, refusals, or semantic violations fail closed to a local interpretation while deterministic evidence remains available.

## Project structure

```text
app/                     browser UI, deterministic client and AI boundary
worker/                  same-origin hosted AI Worker
data/                    frozen controlled data and generated CC0 fixtures
development/             public development and evidence log
docs/                    architecture, evaluation, privacy and Gate records
scripts/                 generators, tests and publication checks
spikes/                  preserved feasibility/browser experiments
```

## Documentation

- [Evaluation and measured boundaries](docs/evaluation.md)
- [Deterministic browser core](docs/g3-core-engine.md)
- [Optional AI architecture](docs/g4ai-architecture.md)
- [Deployment architecture](docs/g6-deployment-architecture.md)
- [Privacy and license audit](docs/g6-privacy-license-audit.md)
- [Product brand and Logo evidence](docs/pg-b-github-logo.md)
- [Generated data and licenses](docs/data-and-licenses.md)
- [Content claim ledger](docs/content-claim-ledger.md)
- [Development log](https://ifc-clashtrace.tuned-box-0320.chatgpt.site/development/)

## Contributing

Issues and focused pull requests are welcome. Please preserve deterministic outputs, add a reproducible fixture for rule changes, keep unknown geometry failure-closed, and run the full G6 verification chain before proposing a change.

Do not commit private IFC files, credentials, local `.env` files, build output, browser profiles, or video production binaries.

## License

Source code is licensed under the [MIT License](LICENSE). Project-generated IFC fixtures are released under [CC0-1.0](data/generated/LICENSE.md). Third-party components retain their own licenses; see [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) and [docs/dependency-licenses.json](docs/dependency-licenses.json).

## Disclaimer

IFC ClashTrace is a focused review prototype, not engineering, regulatory, fire-safety, structural-safety, or compliance certification. Qualified reviewers must make project decisions from the complete model and evidence.
