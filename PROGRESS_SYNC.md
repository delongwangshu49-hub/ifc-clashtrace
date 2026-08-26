# IFC ClashTrace — Progress and GitHub Sync Ledger

This ledger maps validated local Git checkpoints to independent GitHub web commits. It intentionally contains no credentials, browser account details, personal identity, or absolute local paths.

## Rules

- Local Git is the authoritative development history.
- No Git remote is configured; GitHub changes are made only in the user's signed-in Google Chrome session.
- A GitHub commit SHA is not expected to match its local Git SHA.
- Public uploads are limited to reviewed, sanitized publication candidates.
- A step becomes `PASS` only after local validation, GitHub web upload, web verification, and mapping registration all pass.
- To terminate the unavoidable self-reference created when this public ledger records its own publication, the final ledger-publication SHA is registered in the body of one subsequent empty local `sync(<STEP_ID>)` commit in the authoritative local Git history; that closure commit changes no file and is not republished recursively.

## Checkpoints

| Step | Local commit subject | Local SHA | GitHub commit URL / remote SHA | Uploaded at (Asia/Hong_Kong) | Web verification | Visibility | Status / exception |
|---|---|---|---|---|---|---|---|
| G0A | `step(G0A): establish local governance baseline` | `f2c457a0327b3cf3727916fa0919e36a47aa526d` | [GitHub commit `12c78eee68c28ac3dd4bc33ccd437ced9bd6d5b2`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/12c78eee68c28ac3dd4bc33ccd437ced9bd6d5b2) | 2026-08-25 23:12 +08:00 | `PASS`: 3 files, commit message, Markdown rendering, placeholders, and repository metadata verified | `Public` | `PASS` |
| G1 | `step(G1): prove dual geometry feasibility` | `d262474cc6820c7bae9ba77acea2aa754af5bdd0` | [GitHub final commit `0b338141c33ce3add5f81e6d5251c175a67a074a`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/0b338141c33ce3add5f81e6d5251c175a67a074a); range starts at [`1be60cb2f3608703ba0c9334c018041ea88bab3a`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/1be60cb2f3608703ba0c9334c018041ea88bab3a) | 2026-08-26 11:49–11:53 +08:00 | `PASS`: 17 audited files, 3 directory paths, 6-commit chain, public visibility, and absence of `data/` verified in Chrome | `Public` | `PASS`; two GitHub new-file seed titles were asynchronously replaced by Copilot defaults, but SHA/content/range mapping passed |
| G1-R1 | `fix(G1): reconcile checkpoint status evidence` | `b4e010f7dec1b6fb1d2b2736efd0c6e63fdd9295` | [Governance repair `2de8c45684a3d1d894527674bb644510e4881483`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/2de8c45684a3d1d894527674bb644510e4881483) → [evidence repair `30b01b5679145298ca0aa1bd02697e61eae9a767`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/30b01b5679145298ca0aa1bd02697e61eae9a767) | 2026-08-26 12:19 +08:00 | `PASS`: public plan shows G1 `PASS`; public ledger contains G1 mapping; evidence shows completed status and four subsequent Chrome reloads; no `data/` directory | `Public` | `PASS`; one-time consistency repair, no G2 work |
| G2 | `step(G2): freeze controlled dataset and ground truth` | `7da4adfcdaef7729ba52d2a2c98c8741fdcc9c01` | [First commit `d4b974f101348d5707418c4078965dea0d8d7fc2`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/d4b974f101348d5707418c4078965dea0d8d7fc2) → [final commit `4fcc3cd47197a10771f5ce52b2e0a039d6434dc1`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/4fcc3cd47197a10771f5ce52b2e0a039d6434dc1) | 2026-08-26 13:19–13:29 +08:00 | `PASS`: public visibility, continuous 11-commit chain, exact titles/local mapping, licenses, scripts, manifests, ledgers, truth, 3 G1 fixtures, and all 16 paired G2 IFC files verified in Chrome | `Public` | `PASS`; no CLI remote/API/origin; large-file virtualization false negatives were closed with full file-content controls |
| G2-S1 | `sync(G2): record verified GitHub checkpoint` | `c6765d54ffbc776cb82576867ae93846c851e118` | [Public plan `b19235fc35d7dc3d41f10d1c1b50f94bff387c43`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/b19235fc35d7dc3d41f10d1c1b50f94bff387c43) → [public ledger `1fb4dee9a2dda1396b3ddf8fdf6bbc21d575f7c4`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/1fb4dee9a2dda1396b3ddf8fdf6bbc21d575f7c4) → [data evidence `822a86bb2ca49e02a34175fb74038ba62b4c0562`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/822a86bb2ca49e02a34175fb74038ba62b4c0562) | 2026-08-26 13:41–13:44 +08:00 | `PASS`: public plan shows G2 `PASS` and stop-at-G2 rule; public ledger shows the G2 local/remote mapping; data evidence shows `PASS`; exact 3-commit tail and final SHA verified in Chrome | `Public` | `PASS`; final evidence publication tail registered in local authoritative history |
| G2-S2 | `sync(G2): register PASS evidence tail` | `732cf5fc159da4d3b939b7d6c7587c183c5dfa0b` | [Public plan tail `093af832e9c80863a663938531c3d65fe54a190a`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/093af832e9c80863a663938531c3d65fe54a190a) → [public ledger tail `044c598deedbdd8854367378db3fcc870d9aa0d1`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/044c598deedbdd8854367378db3fcc870d9aa0d1) | 2026-08-26 13:45–13:46 +08:00 | `PASS`: exact titles and local short SHA `732cf5f`, public G2 PASS status, prior tail mapping, and final remote HEAD verified in Chrome | `Public` | `PASS`; registered by local closure commit `62dcbbf5e31febdc470c275c8a6579413f1b1ef4` |
| G2-R1 | `fix(G2): reconcile final checkpoint evidence` | `3d43890902106e477799e00d19b290bc5e09077d` | [Public plan repair `1943544a685918c4d506dd76b3489aeb5b50d18b`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/1943544a685918c4d506dd76b3489aeb5b50d18b) → [public ledger repair `92ee708f9dc4caddbc902d0f09878e08f631a6ef`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/92ee708f9dc4caddbc902d0f09878e08f631a6ef) → [prompt evidence repair `f6fc9516b57092d38eefd3f93e868a68b1cfe873`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/f6fc9516b57092d38eefd3f93e868a68b1cfe873) | 2026-08-26 14:12–14:14 +08:00 | `PASS`: exact titles/local mapping and all three repaired files present; final mapping publication and closure verification follow under the self-reference rule | `Public` | `PASS`; evidence-only consistency repair, no data/algorithm/test/license change |
| G2-S3 | `sync(G2): record consistency repair checkpoint` | `d069ea5654ccf330d2e3702456ceddae4592d84a` | [Final public plan `eb349918a79e734a494483e97a59edf574c169ef`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/eb349918a79e734a494483e97a59edf574c169ef) → [final public ledger `5b86d20d71561c28cd0b5d1030079f57a23da26e`](https://github.com/delongwangshu49-hub/ifc-clashtrace/commit/5b86d20d71561c28cd0b5d1030079f57a23da26e) | 2026-08-26 14:16–14:18 +08:00 | `PASS`: public/main, G2 Gate PASS, L-0016 PASS, G2-S2/G2-R1 mappings, four-reload wording, and continuous repair history verified in Chrome | `Public` | `PASS`; registered by local closure commit `cfe9d2070aad75aa0a840460533952bb55d2187a` |

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

## G2 publication checkpoint

The G2 checkpoint contains the 46 audited publication candidates mapped to local step commit `7da4adfcdaef7729ba52d2a2c98c8741fdcc9c01`. It was uploaded only through the signed-in Chrome GitHub webpage as 11 consecutive commits from `d4b974f101348d5707418c4078965dea0d8d7fc2` through `4fcc3cd47197a10771f5ce52b2e0a039d6434dc1`.

The public set includes the MIT code license, CC0-1.0 generated-data notice, G2 data/license evidence, deterministic generator, reference validator, test, dataset manifest, operation ledger, machine truth, three relicensed historical G1 generated fixtures, and 16 G2 IFC files. It excludes the local SSOT, local audit scripts, external/private/stress datasets, credentials, runtimes, caches, and browser state.

Chrome verification confirmed the repository remained `Public`; the 11 exact commit titles all contained `G2` and local short SHA `7da4adf`; the `g2` directory contained exactly 16 C01–C08 MEP/structure files; licenses and key data markers were present; and the final remote SHA was `4fcc3cd47197a10771f5ce52b2e0a039d6434dc1`.

## Verification checklist

- [x] PowerShell 7 major version is at least 7 (`7.6.4`).
- [x] Local Git repository exists on branch `main`.
- [x] No Git remote is configured.
- [x] Repository-local author identity is non-personal and non-routable.
- [x] Public candidate files contain no detected key, token, credential, personal email, machine username, or absolute local path.
- [x] No G2 publication candidate exceeds the 1 MiB review threshold (largest reviewed file was 84,445 bytes at audit start and remains below 89,000 bytes with the complete consistency-repair log).
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
- 2026-08-26 — A read-only post-step review found that the public plan, public ledger, and evidence status had not received the final G1 completion state. The user approved a one-time repair; both corrective web commits included `G1` and local short SHA `b4e010f`, and all three public documents were rechecked successfully.
- 2026-08-26 — GitHub's large code views initially produced false-negative `body.innerText` checks for content below the virtualized viewport. No file was rewritten; complete values from the page's `file content` control confirmed the manifest's final C08 path and the truth file's `NOT_EVALUATED` record, while the README rendering confirmed G2 reproduction and license notices.
