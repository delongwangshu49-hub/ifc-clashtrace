# IFC ClashTrace — Progress and GitHub Sync Ledger

This ledger maps validated local Git checkpoints to independent GitHub web commits. It intentionally contains no credentials, browser account details, personal identity, or absolute local paths.

## Rules

- Local Git is the authoritative development history.
- No Git remote is configured; GitHub changes are made only in the user's signed-in Google Chrome session.
- A GitHub commit SHA is not expected to match its local Git SHA.
- Public uploads are limited to reviewed, sanitized publication candidates.
- A step becomes `PASS` only after local validation, GitHub web upload, web verification, and mapping registration all pass.

## Checkpoints

| Step | Local commit subject | Local SHA | GitHub commit URL / remote SHA | Uploaded at (Asia/Hong_Kong) | Web verification | Visibility | Status / exception |
|---|---|---|---|---|---|---|---|
| G0A | `step(G0A): establish local governance baseline` | `f2c457a0327b3cf3727916fa0919e36a47aa526d` | [GitHub commit `12c78eee68c28ac3dd4bc33ccd437ced9bd6d5b2`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/12c78eee68c28ac3dd4bc33ccd437ced9bd6d5b2) | 2026-08-25 23:12 +08:00 | `PASS`: 3 files, commit message, Markdown rendering, placeholders, and repository metadata verified | `Public` | `PASS` |
| G1 | `step(G1): prove dual geometry feasibility` | `d262474cc6820c7bae9ba77acea2aa754af5bdd0` | [GitHub final commit `0b338141c33ce3add5f81e6d5251c175a67a074a`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/0b338141c33ce3add5f81e6d5251c175a67a074a); range starts at [`1be60cb2f3608703ba0c9334c018041ea88bab3a`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/1be60cb2f3608703ba0c9334c018041ea88bab3a) | 2026-08-26 11:49–11:53 +08:00 | `PASS`: 17 audited files, 3 directory paths, 6-commit chain, public visibility, and absence of `data/` verified in Chrome | `Public` | `PASS`; two GitHub new-file seed titles were asynchronously replaced by Copilot defaults, but SHA/content/range mapping passed |

## G0A publication candidate

Files eligible for the first GitHub web checkpoint after final review:

- `.gitignore`
- `PROGRESS_SYNC.md`
- `BIMCLASH_AGENT_MASTER_PLAN.public.md` (sanitized derivative; to be generated and scanned before upload)

Files intentionally excluded from the first public candidate:

- `BIMCLASH_AGENT_MASTER_PLAN.md` — local governance source containing an absolute workspace path; it must not be uploaded as-is.
- `scripts/audit-g0a.ps1` — local, re-runnable audit evidence; its detection expressions intentionally contain path and credential patterns, so it is not part of the G0A web upload.
- `.git/` — local history and repository configuration; never uploaded through the web file interface.
- Any ignored secret, dependency, cache, temporary, private output, local data, browser profile, screenshot, recording, archive, or dump.

## G1 publication checkpoint

The G1 checkpoint contains 17 audited source, evidence, dependency-lock, setup, test, and intentionally unstyled browser-spike files. It was uploaded only through the signed-in Chrome GitHub webpage in six consecutive commits mapped to local step commit `d262474cc6820c7bae9ba77acea2aa754af5bdd0`.

Files intentionally excluded from the G1 public checkpoint:

- `data/generated/g1/` — deterministic generated IFC fixtures and manifest remain local because the user has not yet approved a public data license.
- `BIMCLASH_AGENT_MASTER_PLAN.md` — local SSOT containing absolute workspace paths; only its sanitized derivative is public.
- `scripts/audit-g0a.ps1` and `scripts/audit-g1.ps1` — local audit evidence whose detection expressions intentionally contain sensitive-pattern examples.
- Local runtimes, virtual environments, dependency trees, caches, temporary upload staging, browser state, and local outputs.

Chrome verification confirmed the repository remained `Public`, the `main` tree contained the three expected G1 directory paths and all 17 files, no `data/` directory was present, and the six remote SHA values formed one continuous G1 checkpoint after G0A.

## Verification checklist

- [x] PowerShell 7 major version is at least 7 (`7.6.4`).
- [x] Local Git repository exists on branch `main`.
- [x] No Git remote is configured.
- [x] Repository-local author identity is non-personal and non-routable.
- [x] Public candidate files contain no detected key, token, credential, personal email, machine username, or absolute local path.
- [x] No workspace file exceeds the G0A 1 MiB review threshold (largest reviewed file: 59,711 bytes).
- [x] Ignore rules cover secrets, dependencies, caches, temporary files, private outputs, browser data, and archives.
- [x] GitHub repository name (`ifc-clashtrace`) and visibility (`Public`) are explicitly confirmed by the user.
- [x] GitHub web commit message contains `G0A` and the local short SHA.
- [x] GitHub key files, commit record, Markdown rendering, and visibility are rechecked after upload.

## Exceptions and incidents

- 2026-08-25 — The first `pwsh` version probe was affected by outer-shell quoting and returned no valid version. No project mutation relied on that result; the isolated retry verified PowerShell `7.6.4`.
- 2026-08-25 — The first `git init` ran under the sandbox execution identity and triggered Git's ownership protection. Before repair, the repository was verified to have zero branch refs, zero packed objects, zero commits, and zero remotes. Only that failed `.git` directory was removed, then the repository was reinitialized on `main` under the workspace-owner context.
- 2026-08-25 — The first publication scan included its own audit script and correctly reported the script's detection regexes plus its non-routable author placeholder. The script was excluded from the web candidate (not from local evidence), and a full rerun on the three upload candidates passed with zero path, email, and credential hits.
- 2026-08-26 — A prior Computer Use attempt was stopped before upload because the target URL could not be verified. After the user explicitly approved a folder-first alternative, the G1 checkpoint was completed with direct Chrome control only.
- 2026-08-26 — GitHub's new-file page asynchronously replaced the prepared commit titles for `scripts/g1-generate-controlled.py` and `spikes/g1-browser/index.html` with Copilot-generated defaults. The resulting commits were not retried or rewritten; file contents, full SHA values, sequence, and surrounding G1/local-SHA commits were verified and the exception is recorded here.
