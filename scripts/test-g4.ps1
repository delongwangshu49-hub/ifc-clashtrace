param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ((Get-Location).Path -ne $projectRoot) { throw "Run this script from the project root." }
if ($PSVersionTable.PSVersion.Major -lt 7) { throw "PowerShell 7 or later is required." }

function Get-GitWorktreeState {
    return ((git status --short) -join "`n")
}

function Assert-Contains([string]$Text, [string]$Needle, [string]$Message) {
    if (-not $Text.Contains($Needle)) { throw $Message }
}

function Get-RelativeLuminance([string]$Hex) {
    $value = $Hex.TrimStart('#')
    $channels = @(0, 2, 4 | ForEach-Object { [Convert]::ToInt32($value.Substring($_, 2), 16) / 255 })
    $linear = @($channels | ForEach-Object { if ($_ -le 0.03928) { $_ / 12.92 } else { [Math]::Pow(($_ + 0.055) / 1.055, 2.4) } })
    return 0.2126 * $linear[0] + 0.7152 * $linear[1] + 0.0722 * $linear[2]
}

function Get-ContrastRatio([string]$Foreground, [string]$Background) {
    $first = Get-RelativeLuminance $Foreground
    $second = Get-RelativeLuminance $Background
    $lighter = [Math]::Max($first, $second)
    $darker = [Math]::Min($first, $second)
    return ($lighter + 0.05) / ($darker + 0.05)
}

$gitStateBefore = Get-GitWorktreeState
$requiredFiles = @(
    "index.html"
    "app/index.html"
    "development/index.html"
    "app/ui/site.css"
    "app/ui/preferences.mjs"
    "app/ui/home.mjs"
    "app/ui/app.mjs"
    "app/ui/viewer.mjs"
    "app/ui/development.mjs"
    "scripts/g4-entry-tests.mjs"
)
$missing = @($requiredFiles | Where-Object { -not (Test-Path -LiteralPath $_ -PathType Leaf) })
if ($missing.Count -ne 0) { throw "Missing G4 product files: $($missing -join ', ')" }

$homePage = Get-Content -LiteralPath "index.html" -Raw
$app = Get-Content -LiteralPath "app/index.html" -Raw
$development = Get-Content -LiteralPath "development/index.html" -Raw
$styles = Get-Content -LiteralPath "app/ui/site.css" -Raw
$preferences = Get-Content -LiteralPath "app/ui/preferences.mjs" -Raw
$appScript = Get-Content -LiteralPath "app/ui/app.mjs" -Raw
$viewerScript = Get-Content -LiteralPath "app/ui/viewer.mjs" -Raw

foreach ($contract in @(
    'href="/app/" target="_blank" rel="noopener"'
    'href="/development/" target="_blank" rel="noopener"'
    'IFC ClashTrace'
    'brand-mark'
    'home.statement.lead'
    'home.copy.detail'
    'data-control-mode="display"'
    'wall-top'
    'pipe-back'
    'pipe-front'
    'home.showcase.title'
    'home.feature.modes.title'
    'home.feature.review.title'
    'home.feature.open.title'
    '/app/ui/previews/home-light-zh-minimal.png'
    '/app/ui/previews/home-dark-en-minimal.png'
    '/app/ui/previews/workspace-en-dark.png'
    '/app/ui/previews/development-en-dark.png'
)) { Assert-Contains $homePage $contract "Homepage contract missing: $contract" }
foreach ($contract in @('lang="en" data-style="minimal" data-theme="dark"','ifc-clashtrace.preferences.v3','localStorage.getItem(storageKey)','html:not([data-preferences-ready]) body { visibility: hidden; }')) {
    Assert-Contains $homePage $contract "Homepage first-paint preference contract missing: $contract"
}
foreach ($page in @($app, $development)) {
    foreach ($contract in @('lang="en" data-style="minimal" data-theme="dark"','ifc-clashtrace.preferences.v3','localStorage.getItem(storageKey)','history.scrollRestoration = "manual"','if (!location.hash)','addEventListener("pageshow"','scrollTo(0, 0)')) {
        Assert-Contains $page $contract "New-page top-entry contract missing: $contract"
    }
    if ($page.Contains('location.replace("/")')) { throw 'Functional and development pages must not redirect a legitimate new-tab launch back to the homepage.' }
}
if ($homePage.Contains('class="site-nav"')) { throw "Obsolete homepage section navigation remains." }

foreach ($contract in @(
    'id="mep-file"'
    'id="structure-file"'
    'id="shared-coordinates"'
    'id="run-checks"'
    'id="review-panel"'
    'id="viewer"'
    'id="result-list"'
    'id="evidence-drawer"'
    'id="preview-ai-fields"'
    'data-control-mode="display"'
    'data-control-mode="ai"'
    'workspace-ai-note'
    'controlled-example-title'
    'id="controlled-review"'
    'Review pack · C01 / C03 / C05 / C08'
    'PG-E · Realistic one-storey clinic · 88 pairs'
    '<p class="card-index">A1</p>'
    '<p class="card-index">A2</p>'
    '<p class="card-index">B · DEMO</p>'
)) { Assert-Contains $app $contract "Functional workspace contract missing: $contract" }
if (($app.Split('data-control-mode="ai"').Count - 1) -ne 1) { throw "Functional workspace must expose exactly one AI control after results." }
if ($app.Contains('workspace-ai-option') -or $app.Contains('OPTIONAL EXPLANATION')) { throw "Obsolete pre-run AI control card remains." }
foreach ($obsoleteInputIndex in @('<p class="card-index">B1</p>', '<p class="card-index">B2</p>', '<p class="card-index">A · DEMO</p>', '<p class="card-index">B</p>')) {
    if ($app.Contains($obsoleteInputIndex)) { throw "Obsolete functional-workspace input index remains: $obsoleteInputIndex" }
}
if ($app -match '<input\s+id="shared-coordinates"[^>]*\schecked(?:\s|>)') {
    throw "Shared-coordinate confirmation must be unchecked by default."
}

foreach ($contract in @("G0A", "G3A", "G3B", "G3C", "G3", "DG", "8 / 8", "1.00 / 1.00", "12 / 12", 'href="/app/#controlled-review" target="_blank" rel="noopener"', 'YouTube upload and direct-link validation', "data/generated/LICENSE.md")) {
    Assert-Contains $development $contract "Development-history evidence missing: $contract"
}
if ($development.Contains('docs/g3-browser-core.md')) { throw "Development page still links to the obsolete empty validation document." }
foreach ($contract in @('class="metric-value"', 'id="failure-title"', 'id="ledger-title"', 'class="title-line"')) {
    Assert-Contains $development $contract "Development-page typography contract missing: $contract"
}
if ($homePage.Contains('IFC ClashTrace 贡献者') -or $homePage.Contains('IFC ClashTrace contributors') -or $development.Contains('IFC ClashTrace 贡献者') -or $development.Contains('IFC ClashTrace contributors')) {
    throw "Product-page footer contains the obsolete contributors label."
}
foreach ($privateWorkflowMarker in @('PROGRESS_SYNC.md', 'PROMPTS.md', '本地 Git 是开发权威历史', "user's signed-in Chrome GitHub page")) {
    if ($development.Contains($privateWorkflowMarker)) { throw "Development page exposes private publication-workflow content: $privateWorkflowMarker" }
}
$drivePathPattern = '(?i)(?<![A-Z0-9])[A-Z]' + ':[\\/]'
$unixUserPathPattern = ('/' + 'Users' + '/') + '|' + ('/' + 'home' + '/')
$uncPathPattern = ('\' + '\') + '[^\\/\s]+[\\/]'
$localPathPattern = "$drivePathPattern|$unixUserPathPattern|$uncPathPattern"
if ($development -match $localPathPattern) { throw "Development page contains a local absolute path." }
if ($development -match '(?i)scripts/audit-|audit-[a-z0-9-]+\.ps1') { throw "Development page exposes a local-only audit filename." }

foreach ($contract in @(
    'html[data-theme="light"]'
    '--radius-sm'
    '.button { display: inline-flex; align-items: center; justify-content: center'
    '@media (prefers-reduced-motion: reduce)'
    '.preference-menu { position: absolute'
    '.button-primary { background: var(--ink); border-color: var(--ink); color: var(--shell); }'
    '@keyframes pipe-trace'
    '.pipe-back {'
    '.pipe-front {'
    '.dialog-bubble::after'
    '--shell: #090909'
    'background: #0b0d10'
    '.assurance-list { display: grid'
    '.record-status .status-icon::before'
    'background: #11161b'
    'color: #d9fff4'
    'color: #fff2d9'
    '.home-header { grid-template-columns: 1fr auto'
    '.feature-showcase {'
    '.showcase-card:hover .feature-preview'
    '.feature-preview { --preview-radius: var(--radius-md);'
    '--preview-pair-width: calc(var(--preview-tile-width) + var(--preview-tile-width) + 26px)'
    'left: calc(100% - 26px - var(--preview-pair-width)); right: auto;'
    'border-radius: var(--preview-radius)'
    '.preview-image-crop { display: block; overflow: hidden; border: 1px solid var(--line); border-radius: var(--preview-radius)'
    '.toggle-track { position: relative; width: 78px; height: 34px'
    '@media (max-width: 1180px)'
    '.review-workspace { display: grid; grid-template-columns: minmax(0, 3fr) minmax(360px, 2fr)'
    'align-items: start; min-height: 700px'
    '.viewport-panel { min-width: 0; height: 700px; position: sticky'
)) { Assert-Contains $styles $contract "Style/accessibility contract missing: $contract" }
$labelBackgroundMatch = [regex]::Match($styles, '(?s)\.scene-label\s*\{.*?background:\s*(#[0-9a-fA-F]{6})')
$labelAMatch = [regex]::Match($styles, '(?s)\.label-a\s*\{.*?color:\s*(#[0-9a-fA-F]{6})')
$labelBMatch = [regex]::Match($styles, '(?s)\.label-b\s*\{.*?color:\s*(#[0-9a-fA-F]{6})')
if (-not $labelBackgroundMatch.Success -or -not $labelAMatch.Success -or -not $labelBMatch.Success) { throw 'Trace-scene label colors could not be resolved from the active CSS rules.' }
$labelAContrast = Get-ContrastRatio $labelAMatch.Groups[1].Value $labelBackgroundMatch.Groups[1].Value
$labelBContrast = Get-ContrastRatio $labelBMatch.Groups[1].Value $labelBackgroundMatch.Groups[1].Value
if ($labelAContrast -lt 4.5 -or $labelBContrast -lt 4.5) { throw "Trace-scene labels do not meet 4.5:1 contrast. A=$labelAContrast B=$labelBContrast" }

foreach ($contract in @(
    'language: "en"'
    'theme: "dark"'
    'aiEnabled: false'
    'localStorage.setItem'
    'localStorage.getItem'
    'Display controls must continue working when persistent storage is unavailable.'
    'dataset.preferencesReady = "true"'
    'ifcclashtrace:preferences'
)) { Assert-Contains $preferences $contract "Preference contract missing: $contract" }
foreach ($contract in @("preference-trigger", "preference-menu", 'role="listbox"', 'role="option"', "home.trace.status", "Hard clash · CLASH", 'controlMode === "ai"', 'class="toggle-knob"', "data-i18n-alt", '首次打开采用暗色和英语', 'First visits open in Dark and English', 'Gate · 测试 · 公开证据')) {
    Assert-Contains $preferences $contract "Custom preference dropdown contract missing: $contract"
}
foreach ($obsoleteStyleLabel in @('工业极简主页', '工业极简、暗色和英语', 'Industrial Minimal homepage', 'Industrial Minimal, Dark, and English', ' · 工业极简', ' · Industrial')) {
    if ($preferences.Contains($obsoleteStyleLabel) -or $homePage.Contains($obsoleteStyleLabel)) { throw "Obsolete single-style emphasis remains in homepage copy: $obsoleteStyleLabel" }
}
foreach ($removedStyleContract in @('pref.style', 'data-preference="style"', 'style: "mainstream"', 'style: "minimal"', 'Popular experience', 'Engineering minimal')) {
    if ($preferences.Contains($removedStyleContract) -or $homePage.Contains($removedStyleContract)) { throw "Removed display-style contract remains: $removedStyleContract" }
}
foreach ($contract in @('Built in public.\nFully traceable.')) {
    Assert-Contains $preferences $contract "English homepage title-line contract missing: $contract"
}
foreach ($obsoleteTitle in @('A public trail.', 'From method to release.')) {
    if ($preferences.Contains($obsoleteTitle)) { throw "Obsolete three-line English homepage title remains: $obsoleteTitle" }
}
if ($preferences.Contains("<select")) { throw "Native select remains in the preference controls; profile geometry cannot be guaranteed." }

foreach ($contract in @(
    'evaluateIfcPair'
    'CASES'
    '["C01", "C03", "C05", "C08"]'
    '"realistic-clinic": ["PGE"]'
    '/data/generated/pg-e/pg-e-engineering-mep.ifc'
    '/data/generated/pg-e/pg-e-engineering-structure.ifc'
    'run_status !== "PASS"'
    'NOT_EVALUATED'
    'state.sources.set'
    'viewer.focusRecord'
    'Pre-send preview (nothing sent yet)'
    'detection conclusions stay unchanged'
)) { Assert-Contains $appScript $contract "G4 runtime contract missing: $contract" }
if ($appScript -match '(?i)https://[^"''`\s]*(?:api|openai|anthropic|gemini|groq|together)') { throw "G4 base runtime contains a provider/API URL." }
if ($appScript -match '(?i)(?:api[_-]?key|access[_-]?token|authorization\s*:)') { throw "G4 base runtime contains a credential-bearing API signal." }
if ($appScript -match 'shared_coordinates\.checked\s*=\s*true') { throw "Runtime must not auto-confirm shared coordinates." }
$stateResetContract = (
    $appScript -match '(?s)function invalidateReviewState\(.*?state\.records\s*=\s*\[\].*?state\.sources\.clear\(\).*?state\.selected\s*=\s*null.*?state\.viewerSource\s*=\s*null.*?elements\.review_panel\.hidden\s*=\s*true.*?elements\.evidence_drawer\.hidden\s*=\s*true.*?elements\.ai_preview\.hidden\s*=\s*true.*?resetCoordinateConsent.*?elements\.shared_coordinates\.checked\s*=\s*false' -and
    $appScript -match '(?s)async function handleFile\(role, file\).*?invalidateReviewState\(\{ resetCoordinateConsent: true \}\);' -and
    $appScript -match '(?s)function chooseExample\(\{ focusRun = true \} = \{\}\).*?invalidateReviewState\(\{ resetCoordinateConsent: true \}\);' -and
    $appScript -match '(?s)async function runChecks\(\).*?state\.running\s*=\s*true;\s*invalidateReviewState\(\);'
)
if (-not $stateResetContract) {
    throw "G4 input mutation must revoke coordinate consent, invalidate stale evidence, and force the 3D viewer to reload."
}
foreach ($contract in @('if (focusRun) elements.run_checks.focus();','elements.use_example.addEventListener("click", () => chooseExample());','chooseExample({ focusRun: false });')) {
    Assert-Contains $appScript $contract "Workspace top-entry focus contract missing: $contract"
}

foreach ($contract in @("StreamAllMeshesWithTypes", "IFCPIPESEGMENT", "IFCWALL", "IFCBEAM", "IFCCOLUMN", "IFCSLAB", "OrbitControls", "focusRecord", "toggleIsolate", "fitModels")) {
    Assert-Contains $viewerScript $contract "3D viewer contract missing: $contract"
}

$appZhCount = [regex]::Matches($app, 'data-zh=').Count
$appEnCount = [regex]::Matches($app, 'data-en=').Count
$developmentZhCount = [regex]::Matches($development, 'data-zh=').Count
$developmentEnCount = [regex]::Matches($development, 'data-en=').Count
if ($appZhCount -lt 35 -or $appZhCount -ne $appEnCount) { throw "Functional workspace bilingual coverage is incomplete." }
if ($developmentZhCount -lt 20 -or $developmentZhCount -ne $developmentEnCount) { throw "Development page bilingual coverage is incomplete." }

$nodePath = (Resolve-Path ".tools/node-v24.19.0-win-x64/node.exe").Path
foreach ($script in @("app/ui/preferences.mjs", "app/ui/home.mjs", "app/ui/app.mjs", "app/ui/viewer.mjs", "app/ui/development.mjs")) {
    & $nodePath --check $script
    if ($LASTEXITCODE -ne 0) { throw "JavaScript syntax check failed: $script" }
}
& $nodePath "scripts/g4-entry-tests.mjs"
if ($LASTEXITCODE -ne 0) { throw "G4 entry-behavior tests failed." }

$serverProcess = $null
$previousPort = $null
$testRoot = Join-Path $projectRoot "outputs/local-only/g4-tests/$([guid]::NewGuid().ToString('N'))"
$approvedParent = (Resolve-Path "outputs/local-only").Path
try {
    New-Item -ItemType Directory -Path $testRoot -Force | Out-Null
    $resolvedTestRoot = (Resolve-Path $testRoot).Path
    if (-not $resolvedTestRoot.StartsWith("$approvedParent$([IO.Path]::DirectorySeparatorChar)", [StringComparison]::OrdinalIgnoreCase)) {
        throw "G4 test output escaped the approved local-only root."
    }
    $stdout = Join-Path $resolvedTestRoot "server.stdout.log"
    $stderr = Join-Path $resolvedTestRoot "server.stderr.log"
    $port = 4174
    $previousPort = $env:IFC_CLASHTRACE_PORT
    $env:IFC_CLASHTRACE_PORT = "$port"
    $serverProcess = Start-Process -FilePath $nodePath -ArgumentList "scripts/g1-static-server.mjs" -WorkingDirectory $projectRoot -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    $ready = $false
    for ($attempt = 0; $attempt -lt 40; $attempt += 1) {
        try {
            $probe = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -UseBasicParsing -TimeoutSec 2
            if ($probe.StatusCode -eq 200) { $ready = $true; break }
        } catch {
            Start-Sleep -Milliseconds 100
        }
    }
    if (-not $ready) { throw "G4 local server did not become ready." }

    $routeChecks = @(
        @{ Path = "/"; Type = "text/html"; Marker = "IFC ClashTrace" }
        @{ Path = "/app/"; Type = "text/html"; Marker = "review-panel" }
        @{ Path = "/development/"; Type = "text/html"; Marker = "gate-timeline" }
        @{ Path = "/app/ui/site.css"; Type = "text/css"; Marker = "review-workspace" }
        @{ Path = "/app/ui/app.mjs"; Type = "text/javascript"; Marker = "evaluateIfcPair" }
        @{ Path = "/app/ui/previews/home-light-zh-minimal.png"; Type = "image/png"; Marker = $null }
        @{ Path = "/app/ui/previews/home-dark-en-minimal.png"; Type = "image/png"; Marker = $null }
        @{ Path = "/app/ui/previews/workspace-en-dark.png"; Type = "image/png"; Marker = $null }
        @{ Path = "/app/ui/previews/development-en-dark.png"; Type = "image/png"; Marker = $null }
        @{ Path = "/node_modules/web-ifc/web-ifc.wasm"; Type = "application/wasm"; Marker = $null }
    )
    foreach ($check in $routeChecks) {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:$port$($check.Path)" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -ne 200) { throw "Route smoke failed: $($check.Path)" }
        if (-not $response.Headers."Content-Type".StartsWith($check.Type, [StringComparison]::OrdinalIgnoreCase)) {
            throw "Unexpected content type for $($check.Path): $($response.Headers.'Content-Type')"
        }
        if ($null -ne $check.Marker -and -not $response.Content.Contains($check.Marker)) {
            throw "Route content marker missing: $($check.Path)"
        }
    }
} finally {
    if ($null -ne $serverProcess -and -not $serverProcess.HasExited) {
        Stop-Process -Id $serverProcess.Id
        Wait-Process -Id $serverProcess.Id -Timeout 10 -ErrorAction SilentlyContinue
        $serverProcess.Refresh()
        if (-not $serverProcess.HasExited) { throw "G4 local test server did not stop cleanly." }
    }
    if ($null -ne $serverProcess) {
        $serverProcess.Dispose()
        $serverProcess = $null
    }
    if ($null -eq $previousPort) { Remove-Item Env:IFC_CLASHTRACE_PORT -ErrorAction SilentlyContinue } else { $env:IFC_CLASHTRACE_PORT = $previousPort }
    if (Test-Path -LiteralPath $testRoot) {
        $resolvedForRemoval = (Resolve-Path $testRoot).Path
        if ($resolvedForRemoval.StartsWith("$approvedParent$([IO.Path]::DirectorySeparatorChar)", [StringComparison]::OrdinalIgnoreCase)) {
            Remove-Item -LiteralPath $resolvedForRemoval -Recurse -Force
        } else {
            throw "Refusing to remove an unverified G4 test directory."
        }
    }
}

& ".\scripts\test-g3.ps1" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G3 regression failed during G4 validation." }

$gitStateAfter = Get-GitWorktreeState
if ($gitStateAfter -cne $gitStateBefore) { throw "Git worktree state changed during the G4 suite." }

Write-Output "G4_THREE_PAGE_ROUTES=3/3"
Write-Output "G4_CONTROLLED_REVIEW_PACK=C01,C03,C05,C08"
Write-Output "G4_FILE_ROLE_INPUTS=2/2"
Write-Output "G4_HARD_CLEARANCE_SIMULTANEOUS=PASS"
Write-Output "G4_FAILURE_CLOSED_UI=PASS"
Write-Output "G4_RESULT_FILTER_EVIDENCE=PASS"
Write-Output "G4_REAL_IFC_3D_FOCUS=PASS"
Write-Output "G4_INDUSTRIAL_ONLY_LANGUAGE_THEME_PREFERENCES=PASS"
Write-Output "G4_CUSTOM_PREFERENCE_DROPDOWNS=PASS"
Write-Output "G4_HOMEPAGE_COPY_MOTION_CONTRAST=PASS"
Write-Output "G4_HOMEPAGE_NEUTRAL_DARK_I18N=PASS"
Write-Output "G4_HOMEPAGE_INTERACTIVE_REAL_PREVIEWS=4/4"
Write-Output "G4_WORKSPACE_ONLY_AI_CONTROL=PASS"
Write-Output "G4_AI_DEFAULT_OFF_PROVIDER_ISOLATED=PASS"
Write-Output "G4_BILINGUAL_STATIC_CONTRACT=PASS"
Write-Output "G4_LOCAL_OFFLINE_ROUTE_SMOKE=PASS"
Write-Output "G4_G3_REGRESSION=PASS"
Write-Output "G4_GIT_WORKTREE_UNCHANGED=PASS"
Write-Output "G4_LOCAL_TEST=PASS"
