# VG public-checkpoint manifest

Status: `COMPLETE / PRIMARY_REMOTE_VERIFIED / CLOSURE_TAIL_INCLUDED`

Date: 2026-08-31

This manifest records the exact public-safe VG checkpoint that the user collectively authorized and that was uploaded through the signed-in Chrome GitHub workflow. It does not authorize a Sites change, deployment, provider call, G7A start or final-video action.

## Included paths

The Chrome GitHub checkpoint was limited to these 25 paths:

1. `.gitignore`
2. `BIMCLASH_AGENT_MASTER_PLAN.public.md`
3. `docs/vg-video-preproduction.md`
4. `docs/vg-video-preproduction.zh-CN.md`
5. `docs/vg-shotcraft-manifest.json`
6. `docs/vg-publication-manifest.md`
7. `scripts/analyze-vg-bgm.py`
8. `scripts/analyze-vg-voice-f0.py`
9. `scripts/build-vg-keyframe-board.py`
10. `scripts/generate-vg-sfx-auditions.py`
11. `scripts/test-vg-preproduction.ps1`
12. `artifacts/vg/analysis/beat_data.json`
13. `artifacts/vg/analysis/grid_drift.json`
14. `artifacts/vg/analysis/voice_f0.json`
15. `artifacts/vg/keyframes/VG-keyframe-table-4k.png`
16. `artifacts/vg/styleframes/index.html`
17. `artifacts/vg/styleframes/sf01.html`
18. `artifacts/vg/styleframes/sf02.html`
19. `artifacts/vg/styleframes/sf03.html`
20. `artifacts/vg/styleframes/styleframes.css`
21. `artifacts/vg/styleframes/SF01-opening.png`
22. `artifacts/vg/styleframes/SF02-product.png`
23. `artifacts/vg/styleframes/SF03-evidence-ai.png`
24. `artifacts/vg-auditions/README.md`
25. `artifacts/vg-auditions/sfx/README.md`

The 4K contact sheet is included only as a visibly labelled composition proxy. Its bottom banner states that repeated legacy material is temporary and that G7A must replace every shot with the correct current product capture. The three styleframes are visual-direction evidence, not final video frames.

## Explicit exclusions

- `BIMCLASH_AGENT_MASTER_PLAN.md` remains the local-only SSOT because it contains an absolute project path and private execution history.
- `docs/assets/brand/ifc-clashtrace-github-logo-v2.png` and `.svg` are unrelated source-named user assets and remain excluded.
- Every `artifacts/vg-auditions/*.mp3`, `artifacts/vg-auditions/*.wav` and `artifacts/vg-auditions/sfx/*.wav` file remains local-only. Mixkit tracks may be used in the edited film under the applicable licence but are not redistributed as repository source assets.
- Every individual `artifacts/vg/keyframes/KF*.png` file remains local-only because it is a disposable proxy without the contact sheet's persistent warning banner.
- `artifacts/vg/styleframes/board-full.png` and `raw-*.png` remain local-only redundant render intermediates.
- No final narration, recording, provider response, Remotion project, subtitle master, mix, render or final video belongs to VG or this checkpoint.

## Completion checks

1. `scripts/test-vg-preproduction.ps1 -Scope Local` passes with 13 scripts/shots/keyframes, selected voice H, strict timing and beat-grid assertions, and zero final-video files.
2. `scripts/test-vg-preproduction.ps1 -Scope Public` passes against this allowlist and rejects tracked MP3/WAV or individual proxy keyframes.
3. Public-plan sanitization contains `<PROJECT_ROOT>` and no local absolute path, username, credential, token or provider key.
4. The exact candidate path count remains 25; any addition or removal requires a revised manifest before authorization.
5. The later upload uses the signed-in Chrome GitHub workflow, records the remote SHA and performs immutable-path and rendered-file checks. Sites remains owner-only and unchanged.
6. Visual QA confirms that all three styleframes render cleanly and the 4K contact sheet keeps its full-width orange warning legible: it is a VG composition proxy, and G7A must replace repeated legacy material with the correct current product capture.

## Current local readiness record

The 2026-08-31 bounded repair completed with both audit scopes passing:

- `Local`: 13 script rows, 13 shot rows, 272 words, 13 individual keyframes, 3 styleframes, 9 frozen motion recipes, H voice, P1 SFX, strict beat-grid pass and zero video files.
- `Public`: the same content/timing/beat/voice assertions plus exactly 25 unique existing allowlisted paths; no MP3/WAV, individual `KF*.png`, private master plan or final video enters the candidate.
- Tightest narration margin at `114 wpm + 420 ms` is `0.233 s`.
- Sanitized local/public master-plan equivalence, Python syntax compilation, JSON parsing, Git whitespace validation and the public text privacy/credential scan pass.
- Visual inspection of `SF01–SF03` and the 4K contact sheet passes; the contact-sheet proxy warning is visibly present.

## Remote checkpoint record

- Previous remote head: `1086eb8f43a7570148075badb295480bbdb461c0`.
- Primary content chain: `8cc327a506fb992f7563ae1d257d13d5e1138785` → `5996f1e770ffb9f9caf28970abbbf12c0fae7b3f` → `905375b04e8fa3956a3e47e4774920c37ee10391` → `85758365422c853a40972c288a52dd9458578e09` → `f0f343a2d9715becff4140442167beab3fd15235` → `9d081a79daed65c3e56e9c57d40f1c753b86e960` → `595a39407bf77abc20047730bd6fd9bed0407513` → `a2ee7abd86c00d3516d8aff24151f7b66ecef496`.
- Per-commit file counts: `2 / 4 / 5 / 3 / 1 / 8 / 1 / 1 = 25`.
- Immutable tree checks passed at primary content head `a2ee7abd86c00d3516d8aff24151f7b66ecef496` for all eight destination directories.
- Exclusion checks found no MP3/WAV, individual `KF*.png`, redundant styleframe intermediates, private master plan or final video.
- GitHub rendered `SF01–SF03` and the 4K contact sheet. Visual inspection confirmed the contact sheet's full-width orange replacement warning.

The same-path closure tail only changes status/evidence text and the audit expectation from pending to verified. It remains inside the authorized allowlist. VG is `PASS`; G7A is `READY / NOT_STARTED`.
