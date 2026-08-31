# G7A publication manifest

Status: `FINAL_CANDIDATE / USER_AUTHORIZED_FOR_GITHUB_UPLOAD`

Date: 2026-08-31

## Public candidate

The G7A checkpoint is limited to these twelve sanitized paths:

1. `.gitignore`
2. `BIMCLASH_AGENT_MASTER_PLAN.public.md`
3. `PROGRESS_SYNC.md`
4. `PROMPTS.md`
5. `README.md`
6. `development/index.html`
7. `docs/content-claim-ledger.md`
8. `docs/g7a-production.md`
9. `docs/g7a-publication-manifest.md`
10. `scripts/test-pg-c.ps1`
11. `scripts/test-g7a-publication.ps1`
12. `video/g7a/production/r02-superres-qa.md`

The local private master plan may be updated in the same local governance commit solely to maintain the sanitized public-plan equivalence check. It is never a public candidate.

## Accepted binary identity

- Local master: `video/g7a/out/r02-superres/ifc-clashtrace-r02-1440p-master.mp4`
- SHA-256: `404c4576e3b315ac99b0fd67ccc0e608d132faa30aef9fa94aff10929889c2b0`
- Size: 23,930,481 bytes
- Picture: 2560 × 1440, 30 fps, 4,990 frames, 166.333 seconds
- Audio: narration + SFX + BGM

The hash and technical facts are public evidence. The MP4 itself is excluded from the ordinary repository and reserved for G7B.

## Explicit exclusions

- `BIMCLASH_AGENT_MASTER_PLAN.md`
- `video/g7a/out/`
- `video/g7a/public/local/`
- `video/g7a/production/input/`
- `video/g7a/production/qa/`
- `video/g7a/review/media/`
- `outputs/local-only/g7a/`
- `node_modules/`, caches, browser profiles, credentials and unrelated dirty-worktree files

## Required checks

- exact twelve-path public allowlist;
- local/public master-plan equivalence after path sanitization;
- G7A `PASS`, G7B/G7 `PLANNED`, and bilingual development-page parity;
- accepted master hash and 4,990-frame/166.333-second facts;
- `4 + 1 + 11 + 72 = 88`, `> 2 mm`, `< 50 mm`, and failure-closing wording;
- no absolute personal path, email, credential marker, or file over 1 MiB in the public candidate;
- all binary production and review paths ignored and absent from the upload set.
