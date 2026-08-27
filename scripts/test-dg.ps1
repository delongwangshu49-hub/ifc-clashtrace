[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ((Get-Location).Path -ne $projectRoot) { throw "Run this script from the project root." }
if ($PSVersionTable.PSVersion.Major -lt 7) { throw "PowerShell 7 or later is required." }

function Assert-Contains([string]$Text, [string]$Pattern, [string]$Message) {
    if ($Text -notmatch $Pattern) { throw $Message }
}

function Get-GitWorktreeState {
    $state = @(git status --porcelain=v1 --untracked-files=all)
    if ($LASTEXITCODE -ne 0) { throw "Unable to read Git worktree state." }
    return $state -join "`n"
}

$gitStateBefore = Get-GitWorktreeState
$briefPath = "docs/design-brief.md"
$wireframePaths = @(
    "docs/wireframes/dg-setup.svg"
    "docs/wireframes/dg-review.svg"
)

if (-not (Test-Path -LiteralPath $briefPath -PathType Leaf)) { throw "Missing DG design brief." }
foreach ($wireframePath in $wireframePaths) {
    if (-not (Test-Path -LiteralPath $wireframePath -PathType Leaf)) {
        throw "Missing DG wireframe: $wireframePath"
    }
}

$brief = Get-Content -LiteralPath $briefPath -Raw
$requiredHeadings = @(
    "Decision requested"
    "Target users and situations"
    "Research basis"
    "Information architecture"
    "First-screen task and priority"
    "Low-fidelity wireframes"
    "Interaction flow and states"
    "3D viewport and results-list relationship"
    "Deterministic result hierarchy"
    "Visual direction"
    "Language and brand strategy"
    "Mobile and responsive scope"
    "Accessibility and keyboard contract for G4"
    "G4 handoff boundary if separately authorized"
    "Approval checklist"
)
foreach ($heading in $requiredHeadings) {
    Assert-Contains $brief ([regex]::Escape($heading)) "DG brief is missing required section: $heading"
}

$requiredContracts = @(
    'Status: `APPROVED`'
    'BLOCKED_BY_DESIGN_APPROVAL'
    'single-page functional review workspace'
    'result-list-driven 3D focus'
    'AI is subordinate and opt-in'
    'NOT_EVALUATED'
    'MEP_STRUCTURE_HARD_CLASH_V1'
    'Mobile IFC processing and 3D review are \*\*out of scope\*\*'
    'Simplified Chinese'
    'WCAG 2\.2'
    'Home `/`'
    'Functional workspace `/app` \(new tab\)'
    'Development history `/development` \(new tab\)'
    'Mainstream candidate A'
    'Mainstream candidate B'
    'Selected mainstream candidate C'
    '`大众版 / Mainstream`'
    '`极简版 / Minimal`'
    '`Language`: `简体中文` / `English`'
    '`Appearance`: `Light` / `Dark`'
    '`AI interpretation`: `Off` by default / `On`'
    'Button containers use layout centering'
    'Every control has a complete visible label or accessible name'
    'deep earth-tone'
    'restrained orange-red'
    'wall–pipe–collision–dialog'
    'approximately one pipe outer diameter'
    'complete wall appears, pipe enters, collision ring responds, dialog bubble emerges'
    'replaces the brand reveal with its static final lockup'
    'DG approval freezes the design contract only; it does not authorize implementation'
    'A separate user decision is required before any base G4 work'
    'Approved DG publication set'
    'exactly eight audited files'
)
foreach ($contract in $requiredContracts) {
    Assert-Contains $brief $contract "DG brief is missing contract: $contract"
}

$researchDomains = @(
    'help\.autodesk\.com'
    'github\.com/buildingSMART/BCF-XML'
    'github\.com/buildingSMART/BCF-API'
    'w3\.org/WAI/WCAG22'
    'm3\.material\.io'
    'ant\.design/docs/spec/values'
    'atlassian\.design/foundations'
    'webflow\.com/blog/web-design-trends-2026'
)
foreach ($domain in $researchDomains) {
    Assert-Contains $brief $domain "DG brief is missing required research source: $domain"
}

foreach ($wireframePath in $wireframePaths) {
    [xml]$wireframe = Get-Content -LiteralPath $wireframePath -Raw
    $root = $wireframe.DocumentElement
    if ($root.LocalName -ne "svg") { throw "$wireframePath is not an SVG document." }
    if ($root.GetAttribute("data-fidelity") -ne "low") { throw "$wireframePath is not marked low fidelity." }
    if ([int]$root.GetAttribute("width") -lt 1280 -or [int]$root.GetAttribute("height") -lt 720) {
        throw "$wireframePath is not a desktop review wireframe."
    }
    if ($wireframe.SelectNodes("//*[local-name()='script']").Count -ne 0) {
        throw "$wireframePath contains executable script."
    }
    if ($wireframe.SelectNodes("//*[@href or @*[local-name()='href']]").Count -ne 0) {
        throw "$wireframePath contains an external resource reference."
    }
    if ($wireframe.SelectNodes("//*[local-name()='title']").Count -ne 1 -or
        $wireframe.SelectNodes("//*[local-name()='desc']").Count -ne 1) {
        throw "$wireframePath lacks a single text title/description equivalent."
    }
}

function Test-IsFormalUiPath([string]$RelativePath) {
    $normalized = $RelativePath.Replace("\", "/").TrimStart([char[]]"./")
    $technicalHarnessPrefixes = @("spikes/g1-browser/", "spikes/g3-browser/")
    if ($technicalHarnessPrefixes.Where({ $normalized.StartsWith($_, [StringComparison]::OrdinalIgnoreCase) }).Count -ne 0) {
        return $false
    }

    $productionUiRoots = @("app/ui", "app/frontend", "app/site", "app/web", "src", "ui", "frontend", "web", "site", "public")
    if ($productionUiRoots.Where({
        $normalized.Equals($_, [StringComparison]::OrdinalIgnoreCase) -or
        $normalized.StartsWith("$_/", [StringComparison]::OrdinalIgnoreCase)
    }).Count -ne 0) {
        return $true
    }

    if ($normalized -notmatch "/" -and $normalized -match '^(?:index\.html|vite\.config\..+|next\.config\..+|nuxt\.config\..+|svelte\.config\..+|astro\.config\..+)$') {
        return $true
    }

    $uiSourceExtensions = @(".css", ".scss", ".sass", ".less", ".tsx", ".jsx", ".vue", ".svelte")
    $extension = [IO.Path]::GetExtension($normalized)
    return $uiSourceExtensions -contains $extension.ToLowerInvariant()
}

$formalUiGuardSelfTest = (
    @("app/ui/index.tsx", "src/App.vue", "public/index.html", "index.html", "vite.config.mjs", "styles/site.css").
        Where({ -not (Test-IsFormalUiPath $_) }).Count -eq 0 -and
    @("app/core/ifc-clash-engine.mjs", "spikes/g1-browser/index.html", "spikes/g3-browser/app.mjs", "docs/wireframes/dg-review.svg").
        Where({ Test-IsFormalUiPath $_ }).Count -eq 0
)
if (-not $formalUiGuardSelfTest) { throw "Formal UI path guard self-test failed." }

$projectFiles = @(git ls-files --cached --others --exclude-standard)
if ($LASTEXITCODE -ne 0) { throw "Unable to enumerate project files for the formal UI guard." }
$formalUiFiles = @($projectFiles | Where-Object { Test-IsFormalUiPath $_ })
if ($formalUiFiles.Count -ne 0) { throw "Formal UI implementation started during DG: $($formalUiFiles -join ', ')" }
if (Test-Path -LiteralPath ".openai/hosting.json") { throw "Deployment work started during DG." }
$package = Get-Content -LiteralPath "package.json" -Raw | ConvertFrom-Json
if ($package.version -ne "0.0.0-g3-core" -or
    @($package.dependencies.PSObject.Properties).Count -ne 3 -or
    $package.dependencies."web-ifc" -ne "0.0.77" -or
    $package.dependencies."three-mesh-bvh" -ne "0.9.14" -or
    $package.dependencies.three -ne "0.185.1") {
    throw "DG changed the frozen G3 dependency or package contract."
}
$uiPackageNames = @("react", "react-dom", "vue", "svelte", "@angular/core", "vite", "next", "nuxt", "astro", "tailwindcss")
$packageNames = @($package.dependencies.PSObject.Properties.Name)
$devDependenciesProperty = $package.PSObject.Properties["devDependencies"]
if ($null -ne $devDependenciesProperty) {
    $packageNames += @($devDependenciesProperty.Value.PSObject.Properties.Name)
}
$uiPackageSignals = @($packageNames | Where-Object { $_ -in $uiPackageNames })
$uiScriptSignals = @($package.scripts.PSObject.Properties.Name | Where-Object { $_ -in @("dev", "build", "preview", "start") })
if ($uiPackageSignals.Count -ne 0 -or $uiScriptSignals.Count -ne 0) {
    throw "Formal UI package or script signals appeared during DG."
}

& ".\scripts\test-g3.ps1" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G3 regression failed during DG." }

$gitStateAfter = Get-GitWorktreeState
if ($gitStateAfter -cne $gitStateBefore) { throw "Git worktree state changed during the DG suite." }

Write-Output "DG_REQUIRED_REVIEW_SECTIONS=$($requiredHeadings.Count)/$($requiredHeadings.Count)"
Write-Output "DG_RESEARCH_SOURCE_GROUPS=$($researchDomains.Count)/$($researchDomains.Count)"
Write-Output "DG_LOW_FIDELITY_WIREFRAMES=$($wireframePaths.Count)/$($wireframePaths.Count)"
Write-Output "DG_INFORMATION_HIERARCHY=PASS"
Write-Output "DG_3D_RESULT_RELATIONSHIP=PASS"
Write-Output "DG_AI_SUBORDINATION=PASS"
Write-Output "DG_HOME_APP_DEVELOPMENT_ARCHITECTURE=PASS"
Write-Output "DG_STYLE_LANGUAGE_THEME_AI_PREFERENCES=PASS"
Write-Output "DG_TYPOGRAPHY_ALIGNMENT_COMPLETENESS=PASS"
Write-Output "DG_LANGUAGE_BRAND_MOBILE_DECISIONS=PASS"
Write-Output "DG_FORMAL_UI_PATH_GUARD_SELF_TEST=$($formalUiGuardSelfTest.ToString().ToUpperInvariant())"
Write-Output "DG_FORMAL_UI_FILES=$($formalUiFiles.Count)"
Write-Output "DG_FORMAL_UI_PACKAGE_SIGNALS=$($uiPackageSignals.Count + $uiScriptSignals.Count)"
Write-Output "DG_G3_REGRESSION=PASS"
Write-Output "DG_GIT_WORKTREE_UNCHANGED=PASS"
Write-Output "DG_USER_APPROVAL=RECORDED"
Write-Output "DG_LOCAL_TEST=PASS"
