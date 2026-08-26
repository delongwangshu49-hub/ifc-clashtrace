# IFC ClashTrace

IFC ClashTrace is a deterministic browser/Web IFC feasibility project for traceable MEP-to-structure hard-clash detection. It is a Web micro-prototype, not a runtime LLM agent and not a certified engineering compliance tool.

## Current checkpoint

G1 proves one controlled IFC4 pipe-wall `pierce` through two independent geometry routes:

- IfcOpenShell `0.8.5` reference geometry tree;
- web-ifc `0.0.77` plus three-mesh-bvh `0.9.14` in Node.js and desktop Google Chrome.

Both routes return the same fixed pipe/wall GUID pair. The reference detector reports `0.2` m penetration against the recorded `0.002` m tolerance. See `docs/g1-feasibility.md` for evidence and limitations.

## Reproduce G1 on Windows

Requirements: PowerShell 7 and Python 3.13 on Windows x64.

```powershell
pwsh -NoLogo -NoProfile -File .\scripts\setup-g1.ps1
pwsh -NoLogo -NoProfile -File .\scripts\test-g1.ps1
```

The setup script downloads Node.js `24.19.0` LTS from the official distribution, verifies its SHA-256 against the official manifest, and installs all dependencies into ignored project-local directories.

To run the unstyled browser-only technical harness:

```powershell
.\.tools\node-v24.19.0-win-x64\node.exe .\scripts\g1-static-server.mjs
```

Open `http://127.0.0.1:4173/spikes/g1-browser/` in desktop Chrome. A successful run displays `PASS`, the two IFC4 schemas, and the mapped GUID pair.

## Boundaries at G1

- One generated, known-over-tolerance pipe-wall pierce only.
- Metre units and a shared project coordinate system.
- Browser penetration distance is not claimed; the field remains unavailable until validated.
- Touching, sub-tolerance intrusion, openings, missing geometry, containment, and the eight-case accuracy gate remain G2/G3 work.
- No formal UI or visual design has started; that remains blocked until the Design Gate.
- Generated IFC files are rebuilt locally and are not included in the G1 public checkpoint because their public license has not yet been approved.

## AI assistance

AI-assisted implementation prompts and human verification are summarized in `PROMPTS.md`. Clash status is always decided by deterministic geometry code.

## License status

No project-wide code or generated-data license has been granted yet. Third-party dependencies retain their own licenses; dependency details are recorded in `docs/g1-feasibility.md`.
