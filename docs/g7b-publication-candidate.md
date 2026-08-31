# G7B limited-repair publication candidate

Status: `GITHUB_AUTHORIZED / YOUTUBE_OPERATIONS_EXCLUDED`

Date: 2026-08-31 (Asia/Hong_Kong)

This candidate incorporates D-093 and the user's later D-094 decision. D-094 closes G7B through the user's perfect-match manual acceptance of the final source film and explicitly supersedes all further YouTube operations. The candidate preserves which public-page checks actually occurred and does not imply that selectable-caption, Studio or post-Premiere platform checks were performed.

## A. Exact GitHub public candidate — 15 paths

### Root records — 4

1. `BIMCLASH_AGENT_MASTER_PLAN.public.md`
2. `PROGRESS_SYNC.md`
3. `PROMPTS.md`
4. `README.md`

### Public development surface — 1

5. `development/index.html`

### Sanitized evidence and submission records — 5

6. `docs/content-claim-ledger.md`
7. `docs/g7a-production.md`
8. `docs/g7b-publication-candidate.md`
9. `docs/g7b-submission-materials.md`
10. `docs/g7b-youtube-publication.md`

### Public tests — 2

11. `scripts/test-g7b.ps1`
12. `scripts/test-pg-c.ps1`

### Controlled public G7B assets — 3

13. `video/g7b/ifc-clashtrace-youtube-thumbnail.png`
14. `video/g7b/ifc-clashtrace-r02.en.srt`
15. `video/g7b/ifc-clashtrace-r02.zh-CN.srt`

The thumbnail and sidecars contain only the approved project presentation and narration. The full accepted MP4 is intentionally excluded.

## B. YouTube operations — explicitly excluded

No caption upload, Studio inspection, settings change, post-Premiere playback action, chat action or other YouTube operation will be performed. The two SRTs and thumbnail remain approved GitHub repository assets only. The existing title, description, hashtags, thumbnail, public-Premiere visibility, scheduled time, channel identity and video file are untouched.

## Local verification

- `scripts/test-g7b.ps1 -RequireLocalMaster`: must confirm the accepted local master, public assets, D-094 closure provenance and no-YouTube-operation boundary.
- `scripts/test-pg-c.ps1 -SkipRegression`: must confirm 18/18 closed Gates, G7B as the latest closed checkpoint, G7 as the only planned Gate, bilingual metadata and source/build parity.
- `git diff --check`: no whitespace error; only repository line-ending notices.
- Candidate inventory: exactly 15 paths; no credential value, cookie, browser/session data or private machine path found. The documented `GROQ_API_KEY = '<local secret>'` placeholder in README is an instruction, not a credential.
- Controlled asset hashes: thumbnail `21c4c940b33baba58aedc99c3cc5f4a255e188eaa32dee614555add44b4ef437`; English SRT `666dc6c8b55010ba8b48a82548b505be4dbad06a9bac684df03e428393c62c88`; Simplified Chinese SRT `b0fc9b4428b3e91496e3f3355b44b0a6bda9f40a4ef2f55ffab95f7af96aa0ef`.

The unskipped full PG-C regression still stops at the pre-existing G4 route smoke because `/app/ui/site.css` returns `text/html` instead of `text/css`. The repaired G7B/PG-C claim suite passes before that unrelated failure. This candidate does not broaden D-093 into a G4 server-route repair and does not claim a globally green regression.

## Explicit exclusions

- `BIMCLASH_AGENT_MASTER_PLAN.md` and every other private/local-only governance file;
- `video/g7a/out/r02-superres/ifc-clashtrace-r02-1440p-master.mp4` and all other full videos;
- raw captures, screenshots, narration, music, SFX, review media, QA frame dumps and local runtimes;
- `dist/`, caches, credentials, cookies, browser/session data and machine-specific paths;
- all unrelated modified or untracked worktree files;
- any Sites deployment, Sites/public-access change, permission/key change, paid action, submission email or G7/G7B completion claim.

## Action stop

The user authorized every GitHub upload required for the exact 15-path candidate. No YouTube operation, Sites action, access/permission/key change, paid action or unrelated file is authorized.
