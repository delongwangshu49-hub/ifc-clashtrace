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
        if ($Candidate.LatestClosed -cne 'G7B') { return $false }
        if (@($Candidate.Targets | Where-Object { [string]::IsNullOrWhiteSpace($_) -or $_ -eq '#' }).Count -ne 0) { return $false }
        if ($Candidate.NextState -cne 'IN_PROGRESS') { return $false }
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
        'Latest closed checkpoint: `G7B · PASS`',
        'Status: `G7B · PASS / G7 · IN_PROGRESS`',
        'Audited Sites version 17 is publicly accessible without sign-in.',
        'Homepage', 'Functional workspace', 'Development log', 'README',
        'Navigation and footer', 'Metadata', 'Error and empty states', 'Demo screenshots',
        '| S-06 | The product exposes Industrial Minimal only. A first visit starts in English and Dark;',
        'GitHub technical head `3038d431157c0e1eb1e1f2b4a9870ddb01609921`',
        'A/B scene-label contrast ratio below 4.5:1',
        'completion state, dates, metrics, links, acceptance, public availability, permissions, or evidence'
    )) { Assert-Contains $ledger $required "Claim-ledger contract missing: $required" }

    foreach ($plan in @($localPlan, $publicPlan)) {
        foreach ($required in @(
            '### L-0095 — PG-F R3 精确上线候选准备',
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
            '| D-070 | 2026-08-30 |',
            '### L-0075 — PG-E 工程情境样例技术候选与用户 UAT 门',
            '| D-071 | 2026-08-30 |',
            '### L-0076 — PG-E 拟真单层社区诊所修复',
            '| D-072 | 2026-08-30 |',
            '### L-0077 — 拟真诊所实例与 Logo v2 集体在线更新候选',
            '| D-073 | 2026-08-30 |',
            '### L-0078 — 拟真诊所实例与 Logo v2 集体在线同步',
            '| D-074 | 2026-08-30 |',
            '### L-0079 — PG-E 审计闭环与 PG-B-R2 Logo 比例修复候选',
            '### L-0080 — PG-E / PG-B-R2 公开同步与最终托管 UAT 闭环',
            '**Gate：** `PG-C-R2 PASS`',
            '3038d431157c0e1eb1e1f2b4a9870ddb01609921'
        )) { Assert-Contains $plan $required "Expanded governance contract missing: $required" }
        foreach ($obsolete in @('允许预先编写 G7 文案和组件', '可以提前编写 G7 文案，但只能', 'PG-C-R2 LOCAL_AND_PRIVATE_PASS / GITHUB_SYNC_PENDING')) {
            if ($plan.Contains($obsolete, [StringComparison]::Ordinal)) { throw "Obsolete G7-only prewriting scope remains: $obsolete" }
        }
    }

    foreach ($required in @(
        '- Status: `PASS`. The user approved the planned work and confirmed the public GitHub action at submission time.',
        'Direct `/app/` and `/development/` visits remain valid; homepage destinations and cross-page workspace links open in new tabs.',
        '3038d431157c0e1eb1e1f2b4a9870ddb01609921'
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
        'G7B · 已通过', 'G7B · Pass', 'G7 · IN PROGRESS', '公开访问', 'Public access',
        '8/8', '9/9', '1.00 / 1.00', '3/0/0/4', 'data-claim-stage="PG-C"', 'data-claim-state="closed"'
    )) { Assert-Contains $development $required "Current development claim missing: $required" }

    $closedGates = @('G0A','G1','G2','G3A','G3B','G3C','G3','DG','G4','G4AI','G5','G6-R1','PG-C','PG-B','PG-E','VG','G7A','G7B')
    foreach ($gate in $closedGates) {
        if ($development -notmatch "(?s)<span class=`"gate-id`">$([regex]::Escape($gate))</span>.*?<span class=`"gate-status`">PASS</span>") {
            throw "Closed Gate is not represented as PASS: $gate"
        }
    }

    $closedPgB = [regex]::Match($development, '(?s)<li[^>]*data-claim-stage="PG-B"[^>]*data-claim-state="closed"[^>]*>(.*?)</li>')
    if (-not $closedPgB.Success) { throw 'PG-B closed marker is missing.' }
    foreach ($required in @('产品品牌与 Logo', 'Product brand and Logo', '墙体、管线、碰撞点与提示气泡', 'wall, pipe, collision point, and review bubble', '透明 Logo', 'transparent Logo', '>PASS<')) {
        Assert-Contains $closedPgB.Value $required "PG-B closure wording is incomplete: $required"
    }

    $activePgE = [regex]::Match($development, '(?s)<li[^>]*data-claim-stage="PG-E"[^>]*data-claim-state="closed"[^>]*>(.*?)</li>')
    if (-not $activePgE.Success) { throw 'PG-E closed marker is missing.' }
    foreach ($required in @('12 m × 8 m', 'one-storey clinic', '88 条结果', '88 results', '6/6', '6 sentinels', '开发者', 'The developer', '>PASS<')) {
        Assert-Contains $activePgE.Value $required "PG-E closure wording is incomplete: $required"
    }

    $closedG7A = [regex]::Match($development, '(?s)<li[^>]*data-claim-stage="G7A"[^>]*data-claim-state="closed"[^>]*>(.*?)</li>')
    if (-not $closedG7A.Success) { throw 'G7A closed marker is missing.' }
    foreach ($required in @('2560 × 1440', '30 fps', '166.333', '开发者完成', 'The developer completed', '>PASS<')) {
        Assert-Contains $closedG7A.Value $required "G7A closure wording is incomplete: $required"
    }

    $closedG7B = [regex]::Match($development, '(?s)<li[^>]*data-claim-stage="G7B"[^>]*data-claim-state="closed"[^>]*>(.*?)</li>')
    if (-not $closedG7B.Success) { throw 'G7B closed marker is missing.' }
    foreach ($required in @('YouTube 发布与直链', 'YouTube release and direct link', '开发者将最终母版发布', 'The developer published the final master', '公开元数据', 'public metadata', '>PASS<')) {
        Assert-Contains $closedG7B.Value $required "G7B closure wording is incomplete: $required"
    }
    if ($closedG7B.Value -match '>IN_PROGRESS<' -or $closedG7B.Value -match '>PLANNED<' -or $closedG7B.Value -match 'Unlisted') {
        throw 'G7B closure wording contains a superseded state.'
    }

    $currentGates = @('G7')
    foreach ($gate in $currentGates) {
        $match = [regex]::Match($development, "(?s)<li[^>]*data-claim-stage=`"$([regex]::Escape($gate))`"[^>]*data-claim-state=`"in-progress`"[^>]*>(.*?)</li>")
        if (-not $match.Success) { throw "In-progress stage marker is missing: $gate" }
        foreach ($required in @('开发者已完成 Sites 公开上线与托管 AI 配置', 'The developer has completed the public Sites launch and hosted AI configuration', '>IN PROGRESS<')) {
            Assert-Contains $match.Value $required "In-progress wording is incomplete for ${gate}: $required"
        }
        if ($match.Value -match '>PASS<' -or $match.Value -match '>PLANNED<') { throw "Current stage has an invalid terminal state: $gate" }
    }
    Assert-Contains $development 'YouTube release and direct link' 'Current G7B closed route is missing from the development page.'
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

    foreach ($required in @('/app/ui/previews/home-light-zh-minimal.png', '/app/ui/previews/home-dark-en-minimal.png', '/app/ui/previews/workspace-en-dark.png', '/app/ui/previews/development-en-dark.png')) {
        if (-not ($homeHtml.Contains($required, [StringComparison]::Ordinal) -or $preferences.Contains($required, [StringComparison]::Ordinal))) {
            throw "Current Industrial Minimal screenshot contract missing: $required"
        }
    }
    if ($workspace.Contains('G4AI · OPTIONAL INTERPRETATION', [StringComparison]::Ordinal)) { throw 'Workspace still presents a stale Gate label.' }
    Assert-Contains $workspace 'DETERMINISTIC REVIEW · OPTIONAL AI' 'Workspace capability eyebrow is missing.'

    $validCandidate = @{ LatestClosed='G7B'; Targets=@('/','/app/'); NextState='IN_PROGRESS'; Zh='公开访问'; En='Public access' }
    if (-not (Test-ClaimCandidate $validCandidate)) { throw 'Positive claim-guard self-test failed.' }
    $negativeCandidates = @(
        @{ LatestClosed='G7A'; Targets=@('/'); NextState='IN_PROGRESS'; Zh='公开访问'; En='Public access' },
        @{ LatestClosed='G7B'; Targets=@(''); NextState='IN_PROGRESS'; Zh='公开访问'; En='Public access' },
        @{ LatestClosed='G7B'; Targets=@('/'); NextState='PASS'; Zh='已完成'; En='Completed' },
        @{ LatestClosed='G7B'; Targets=@('/'); NextState='IN_PROGRESS'; Zh='公开访问'; En='' }
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
    foreach ($marker in @('G7B · 已通过','G7 · IN PROGRESS','Public access','data-claim-stage="VG"','data-claim-state="closed"','data-claim-stage="G7A"','data-claim-stage="G7B"','data-claim-state="in-progress"','data-claim-stage="G7"')) {
        Assert-Contains $builtDevelopment $marker "Private-candidate build disagrees with development source: $marker"
    }
    foreach ($marker in @('home-light-zh-minimal-','home-dark-en-minimal-','workspace-en-dark-','development-en-dark-')) {
        Assert-Contains $builtHome $marker "Private-candidate build disagrees with homepage source: $marker"
    }

    $gitStateAfter = (git status --short) -join "`n"
    if ($gitStateAfter -cne $gitStateBefore) { throw 'Git worktree state changed during the PG-C suite.' }

    'PGC_SURFACES_INVENTORIED=8/8'
    "PGC_CLOSED_GATES=$($closedGates.Count)/$($closedGates.Count)"
    "PGC_CURRENT_GATES=$($currentGates.Count)/$($currentGates.Count)"
    'PGC_LATEST_CLOSED=G7B/PASS'
    'PGC_CURRENT_GATE=G7/IN_PROGRESS'
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
