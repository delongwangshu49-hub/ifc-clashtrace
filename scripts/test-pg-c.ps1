[CmdletBinding()]
param([switch]$SkipRegression)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if ($PSVersionTable.PSVersion.Major -lt 7) { throw 'PG-C requires PowerShell 7 or newer.' }

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $projectRoot
try {
    function Assert-Contains([string]$Text, [string]$Needle, [string]$Message) {
        if (-not $Text.Contains($Needle, [StringComparison]::Ordinal)) { throw $Message }
    }

    function Test-ClaimCandidate([hashtable]$Candidate) {
        if ($Candidate.LatestClosed -cne 'PG-C') { return $false }
        if (@($Candidate.Targets | Where-Object { [string]::IsNullOrWhiteSpace($_) -or $_ -eq '#' }).Count -ne 0) { return $false }
        if ($Candidate.FutureState -cne 'PLANNED') { return $false }
        if ([string]::IsNullOrWhiteSpace($Candidate.Zh) -or [string]::IsNullOrWhiteSpace($Candidate.En)) { return $false }
        return $true
    }

    $gitStateBefore = (git status --short) -join "`n"
    $homeHtml = Get-Content -LiteralPath 'index.html' -Raw
    $workspace = Get-Content -LiteralPath 'app/index.html' -Raw
    $development = Get-Content -LiteralPath 'development/index.html' -Raw
    $preferences = Get-Content -LiteralPath 'app/ui/preferences.mjs' -Raw
    $appScript = Get-Content -LiteralPath 'app/ui/app.mjs' -Raw
    $developmentScript = Get-Content -LiteralPath 'app/ui/development.mjs' -Raw
    $readme = Get-Content -LiteralPath 'README.md' -Raw
    $progress = Get-Content -LiteralPath 'PROGRESS_SYNC.md' -Raw
    $ledger = Get-Content -LiteralPath 'docs/content-claim-ledger.md' -Raw
    $localPlan = Get-Content -LiteralPath 'BIMCLASH_AGENT_MASTER_PLAN.md' -Raw
    $publicPlan = Get-Content -LiteralPath 'BIMCLASH_AGENT_MASTER_PLAN.public.md' -Raw

    foreach ($required in @(
        'Latest closed checkpoint: `PG-C · PASS`',
        'Status: `PG-B · TECH_PASS_EXTERNAL_SYNC_PENDING`',
        'Homepage', 'Functional workspace', 'Development log', 'README',
        'Navigation and footer', 'Metadata', 'Error and empty states', 'Demo screenshots',
        '| S-06 | Every load of the shared homepage route resets to Popular experience, English, and Light.',
        'GitHub technical-chain tip `40c7270b6fc9b56f6976b938297d2b475eef7e39`',
        'A/B scene-label contrast ratio below 4.5:1',
        'completion state, dates, metrics, links, acceptance, public availability, permissions, or evidence'
    )) { Assert-Contains $ledger $required "Claim-ledger contract missing: $required" }

    foreach ($plan in @($localPlan, $publicPlan)) {
        foreach ($required in @(
            '当前 Gate：`PG-B — TECH_PASS_EXTERNAL_SYNC_PENDING`',
            '直至项目结束的所有后续阶段文案和组件',
            '不得伪造完成状态、日期、指标、链接、验收、公开可用性、权限或证据',
            '预写不构成阶段启动、Gate 通过、用户验收、外部写入、部署/公开访问授权',
            '| D-054 | 2026-08-29；2026-08-30 扩展 |',
            '| D-063 | 2026-08-30 |',
            '### L-0070 — PG-C 新会话入口与亮色图注定向修复',
            '| D-065 | 2026-08-30 |',
            '| D-066 | 2026-08-30 |',
            '### L-0072 — PG-C-R2 共享主页重置、功能页顶部与审计修复',
            '### L-0073 — PG-B 浅色品牌动效与 README 本地候选',
            '### L-0074 — PG-B 取消 GIF 并采用静态 GitHub Logo',
            '**Gate：** `PG-C-R2 PASS`',
            '40c7270b6fc9b56f6976b938297d2b475eef7e39'
        )) { Assert-Contains $plan $required "Expanded governance contract missing: $required" }
        foreach ($obsolete in @('允许预先编写 G7 文案和组件', '可以提前编写 G7 文案，但只能', 'PG-C-R2 LOCAL_AND_PRIVATE_PASS / GITHUB_SYNC_PENDING')) {
            if ($plan.Contains($obsolete, [StringComparison]::Ordinal)) { throw "Obsolete G7-only prewriting scope remains: $obsolete" }
        }
    }

    foreach ($required in @(
        '- Status: `PASS`. Local verification, owner-only Sites version 8, and the approved GitHub `main` checkpoint are complete.',
        'Direct `/app/` and `/development/` visits remain valid; homepage destinations and cross-page workspace links open in new tabs.',
        'Technical-chain tip `40c7270b6fc9b56f6976b938297d2b475eef7e39`'
    )) { Assert-Contains $progress $required "Progress-sync repair closure missing: $required" }
    foreach ($obsolete in @(
        'The first direct visit to `/app/` or `/development/` in a new tab returns to `/`',
        'internal routes stay in the current tab',
        'LOCAL_AND_PRIVATE_PASS / GITHUB_SYNC_PENDING'
    )) {
        if ($progress.Contains($obsolete, [StringComparison]::Ordinal)) { throw "Obsolete PG-C entry/sync claim remains in progress ledger: $obsolete" }
    }
    $legacyReferenceRoot = Join-Path (Split-Path -Qualifier $projectRoot) 'CODEX-RA'
    $savedProjectRoot = 'D:' + '\CODEX-RA-TEST'
    $savedLegacyRoot = 'D:' + '\CODEX-RA'
    $sanitizedLocal = $localPlan.Replace($savedProjectRoot, '<PROJECT_ROOT>').Replace($savedLegacyRoot, '<LEGACY_REFERENCE_ROOT>').Replace($projectRoot, '<PROJECT_ROOT>').Replace($legacyReferenceRoot, '<LEGACY_REFERENCE_ROOT>').TrimEnd()
    if ($sanitizedLocal -cne $publicPlan.TrimEnd()) { throw 'Sanitized public master is not equivalent to the local master.' }

    foreach ($required in @(
        'PG-C · PASS', 'PG-B · 本地候选', 'PG-B · Local candidate', '仅所有者 · 私有', 'Owner-only · Private',
        '8/8', '9/9', '1.00 / 1.00', '3/0/0/4', 'data-claim-stage="PG-C"', 'data-claim-state="closed"'
    )) { Assert-Contains $development $required "Current development claim missing: $required" }

    $closedGates = @('G0A','G1','G2','G3A','G3B','G3C','G3','DG','G4','G4AI','G5','G6-R1','PG-C')
    foreach ($gate in $closedGates) {
        if ($development -notmatch "(?s)<span class=`"gate-id`">$([regex]::Escape($gate))</span>.*?<span class=`"gate-status`">PASS</span>") {
            throw "Closed Gate is not represented as PASS: $gate"
        }
    }

    $activePgB = [regex]::Match($development, '(?s)<li[^>]*data-claim-stage="PG-B"[^>]*data-claim-state="in_progress"[^>]*>(.*?)</li>')
    if (-not $activePgB.Success) { throw 'PG-B in-progress marker is missing.' }
    foreach ($required in @('静态产品标', 'static product mark', '不再使用 GIF', 'no longer uses GIF', '>LOCAL CANDIDATE<', '仍待行动时授权', 'await action-time authorization')) {
        Assert-Contains $activePgB.Value $required "PG-B in-progress wording is incomplete: $required"
    }
    if ($activePgB.Value -match '>PASS<' -or $activePgB.Value -match '(?i)completed|accepted') { throw 'PG-B is presented as externally complete before GitHub verification.' }

    $plannedGates = @('PG-E','VG','G7A','G7B','G7')
    foreach ($gate in $plannedGates) {
        $match = [regex]::Match($development, "(?s)<li[^>]*data-claim-stage=`"$([regex]::Escape($gate))`"[^>]*data-claim-state=`"planned`"[^>]*>(.*?)</li>")
        if (-not $match.Success) { throw "Planned-stage marker is missing: $gate" }
        foreach ($required in @('尚未开始', 'Not started', '>PLANNED<')) {
            Assert-Contains $match.Value $required "Planned-stage wording is incomplete for ${gate}: $required"
        }
        if ($match.Value -match '>PASS<' -or $match.Value -match '(?i)completed|accepted') { throw "Later stage is presented as complete: $gate" }
    }
    Assert-Contains $development 'YouTube upload and direct-link validation' 'Current G7B planned route is missing from the development page.'
    if ($development.Contains('Video embed and public-access revalidation', [StringComparison]::Ordinal)) { throw 'Superseded G7B homepage-embed plan remains on the development page.' }

    foreach ($surface in @(
        @{ Name = 'workspace'; Text = $workspace },
        @{ Name = 'development'; Text = $development }
    )) {
        $zhCount = [regex]::Matches($surface.Text, 'data-zh=').Count
        $enCount = [regex]::Matches($surface.Text, 'data-en=').Count
        if ($zhCount -eq 0 -or $zhCount -ne $enCount) { throw "$($surface.Name) bilingual text pairs are incomplete." }
        $zhMetaCount = [regex]::Matches($surface.Text, 'data-zh-content=').Count
        $enMetaCount = [regex]::Matches($surface.Text, 'data-en-content=').Count
        if ($zhMetaCount -ne 1 -or $enMetaCount -ne 1) { throw "$($surface.Name) bilingual metadata pair is incomplete." }
    }
    foreach ($required in @('home.meta.title', 'home.meta.description', '[data-i18n-content]')) {
        Assert-Contains $preferences $required "Homepage bilingual metadata contract missing: $required"
    }
    foreach ($required in @('data-i18n="home.meta.title"', 'data-i18n-content="home.meta.description"')) {
        Assert-Contains $homeHtml $required "Homepage metadata hook missing: $required"
    }
    foreach ($script in @($appScript, $developmentScript)) {
        Assert-Contains $script '[data-zh-content][data-en-content]' 'Runtime bilingual metadata translation is missing.'
        Assert-Contains $script '[data-zh-aria][data-en-aria]' 'Runtime bilingual accessibility-label translation is missing.'
    }
    Assert-Contains $workspace 'data-runtime-copy="true"' 'Dynamic run-description marker is missing.'

    foreach ($page in @($homeHtml, $workspace, $development)) {
        foreach ($attribute in @('href', 'src')) {
            foreach ($match in [regex]::Matches($page, "$attribute\s*=\s*[`"']([^`"']*)[`"']", [Text.RegularExpressions.RegexOptions]::IgnoreCase)) {
                $target = $match.Groups[1].Value
                if ([string]::IsNullOrWhiteSpace($target) -or $target -eq '#') { throw "Empty or placeholder $attribute target found." }
                if ($target -match '^https?://' -and $target -notmatch '^https://github\.com/delongwangshu49-hub/ifc-clashtrace(?:/|$)') {
                    throw "Unexpected external target in public page: $target"
                }
            }
        }
    }

    foreach ($required in @('data-snapshot-gate="G4"', 'data-snapshot-state="historical"', '历史 G4 截图', 'Historical G4 capture')) {
        if (-not ($homeHtml.Contains($required, [StringComparison]::Ordinal) -or $preferences.Contains($required, [StringComparison]::Ordinal))) {
            throw "Historical screenshot contract missing: $required"
        }
    }
    if ($workspace.Contains('G4AI · OPTIONAL INTERPRETATION', [StringComparison]::Ordinal)) { throw 'Workspace still presents a stale Gate label.' }
    Assert-Contains $workspace 'DETERMINISTIC REVIEW · OPTIONAL AI' 'Workspace capability eyebrow is missing.'

    $validCandidate = @{ LatestClosed='PG-C'; Targets=@('/','/app/'); FutureState='PLANNED'; Zh='尚未开始'; En='Not started' }
    if (-not (Test-ClaimCandidate $validCandidate)) { throw 'Positive claim-guard self-test failed.' }
    $negativeCandidates = @(
        @{ LatestClosed='DG'; Targets=@('/'); FutureState='PLANNED'; Zh='尚未开始'; En='Not started' },
        @{ LatestClosed='PG-C'; Targets=@(''); FutureState='PLANNED'; Zh='尚未开始'; En='Not started' },
        @{ LatestClosed='PG-C'; Targets=@('/'); FutureState='PASS'; Zh='已完成'; En='Completed' },
        @{ LatestClosed='PG-C'; Targets=@('/'); FutureState='PLANNED'; Zh='尚未开始'; En='' }
    )
    foreach ($candidate in $negativeCandidates) {
        if (Test-ClaimCandidate $candidate) { throw 'A negative claim-guard self-test was not rejected.' }
    }

    foreach ($script in @('app/ui/preferences.mjs','app/ui/home.mjs','app/ui/app.mjs','app/ui/development.mjs')) {
        & '.\.tools\node-v24.19.0-win-x64\node.exe' --check $script
        if ($LASTEXITCODE -ne 0) { throw "JavaScript syntax check failed: $script" }
    }

    & pwsh -NoLogo -NoProfile -File 'scripts/test-g6.ps1' -SkipRegression:$SkipRegression
    if ($LASTEXITCODE -ne 0) { throw 'G6 build/deployment regression failed during PG-C.' }

    $builtDevelopment = Get-Content -LiteralPath 'dist/client/development/index.html' -Raw
    $builtHome = Get-Content -LiteralPath 'dist/client/index.html' -Raw
    foreach ($marker in @('PG-C · PASS','data-claim-state="closed"','data-claim-stage="PG-B"','data-claim-state="in_progress"','data-claim-stage="G7"')) {
        Assert-Contains $builtDevelopment $marker "Private-candidate build disagrees with development source: $marker"
    }
    foreach ($marker in @('data-snapshot-gate="G4"','data-snapshot-state="historical"')) {
        Assert-Contains $builtHome $marker "Private-candidate build disagrees with homepage source: $marker"
    }

    $gitStateAfter = (git status --short) -join "`n"
    if ($gitStateAfter -cne $gitStateBefore) { throw 'Git worktree state changed during the PG-C suite.' }

    'PGC_SURFACES_INVENTORIED=8/8'
    "PGC_CLOSED_GATES=$($closedGates.Count)/$($closedGates.Count)"
    "PGC_PLANNED_GATES=$($plannedGates.Count)/$($plannedGates.Count)"
    'PGC_BILINGUAL_METADATA=3/3'
    'PGC_EMPTY_TARGET_GUARD=PASS'
    'PGC_FUTURE_COMPLETION_GUARD=PASS'
    'PGC_ZH_EN_MISMATCH_GUARD=PASS'
    'PGC_HISTORICAL_SCREENSHOT_MARKER=PASS'
    'PGC_SOURCE_BUILD_FACT_PARITY=PASS'
    'PGC_G6_REGRESSION=PASS'
    'PGC_LOCAL_TEST=PASS'
} finally {
    Pop-Location
}
