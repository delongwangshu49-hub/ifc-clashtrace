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
| G0A | `step(G0A): establish local governance baseline` | `f2c457a0327b3cf3727916fa0919e36a47aa526d` | Repository `ifc-clashtrace`; commit pending | Pending | Pending | `Public` (user confirmed) | `LOCAL_PASS / GITHUB_UPLOAD_PENDING` |

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

## Verification checklist

- [x] PowerShell 7 major version is at least 7 (`7.6.4`).
- [x] Local Git repository exists on branch `main`.
- [x] No Git remote is configured.
- [x] Repository-local author identity is non-personal and non-routable.
- [x] Public candidate files contain no detected key, token, credential, personal email, machine username, or absolute local path.
- [x] No workspace file exceeds the G0A 1 MiB review threshold (largest reviewed file: 56,373 bytes).
- [x] Ignore rules cover secrets, dependencies, caches, temporary files, private outputs, browser data, and archives.
- [x] GitHub repository name (`ifc-clashtrace`) and visibility (`Public`) are explicitly confirmed by the user.
- [ ] GitHub web commit message contains `G0A` and the local short SHA.
- [ ] GitHub key files, commit record, Markdown rendering, and visibility are rechecked after upload.

## Exceptions and incidents

- 2026-08-25 — The first `pwsh` version probe was affected by outer-shell quoting and returned no valid version. No project mutation relied on that result; the isolated retry verified PowerShell `7.6.4`.
- 2026-08-25 — The first `git init` ran under the sandbox execution identity and triggered Git's ownership protection. Before repair, the repository was verified to have zero branch refs, zero packed objects, zero commits, and zero remotes. Only that failed `.git` directory was removed, then the repository was reinitialized on `main` under the workspace-owner context.
- 2026-08-25 — The first publication scan included its own audit script and correctly reported the script's detection regexes plus its non-routable author placeholder. The script was excluded from the web candidate (not from local evidence), and a full rerun on the three upload candidates passed with zero path, email, and credential hits.
