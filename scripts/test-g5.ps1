[CmdletBinding()]
param([switch]$RequireOfficialSamples)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ((Get-Location).Path -ne $projectRoot) { throw "Run this script from the project root." }
if ($PSVersionTable.PSVersion.Major -lt 7) { throw "PowerShell 7 or later is required." }
$gitRoot = (Resolve-Path (git rev-parse --show-toplevel)).Path
if ($gitRoot -ne $projectRoot) { throw "Git root differs from the project root." }
if (@(git remote).Count -ne 0) { throw "G5 requires zero Git remotes." }

$nodeExe = Join-Path $projectRoot ".tools/node-v24.19.0-win-x64/node.exe"
$pythonExe = Join-Path $projectRoot ".venv/Scripts/python.exe"
if (-not (Test-Path -LiteralPath $nodeExe -PathType Leaf)) { throw "Missing project-local Node.js runtime." }
if (-not (Test-Path -LiteralPath $pythonExe -PathType Leaf)) { throw "Missing project-local Python environment." }

$beforeStatus = @(git status --porcelain=v1 --untracked-files=no)
& ".\scripts\test-g4ai.ps1" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G4AI/G4/G3 regression failed during G5." }

& $nodeExe ".\scripts\g5-evaluate-controlled.mjs" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G5 controlled evaluation failed." }
& $nodeExe ".\scripts\g5-evaluate-ai.mjs" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G5 AI evaluation failed." }

$controlled = Get-Content -LiteralPath "outputs/local-only/g5/controlled-evaluation.json" -Raw | ConvertFrom-Json
if ($controlled.status -ne "PASS" -or
    $controlled.controlled_suite.case_count -ne 8 -or
    $controlled.controlled_suite.exact_status_matches -ne 8 -or
    $controlled.controlled_suite.exact_pair_matches -ne 8 -or
    $controlled.controlled_suite.classification.true_positive -ne 3 -or
    $controlled.controlled_suite.classification.false_positive -ne 0 -or
    $controlled.controlled_suite.classification.false_negative -ne 0 -or
    $controlled.controlled_suite.classification.true_negative -ne 4 -or
    $controlled.controlled_suite.classification.abstained -ne 1 -or
    $controlled.three_way_consistency.exact_status_matches -ne 8 -or
    $controlled.clearance_supplement.analytic_exact_matches -ne 9 -or
    $controlled.clearance_supplement.independent_mesh_exact_matches -ne 9) {
    throw "G5 controlled metrics or three-way consistency differ from the accepted contract."
}

$ai = Get-Content -LiteralPath "outputs/local-only/g5/ai-evaluation.json" -Raw | ConvertFrom-Json
if ($ai.status -ne "PASS" -or $ai.factual_preservation.rate -ne 1 -or
    $ai.degradation.tested -ne 5 -or $ai.degradation.exact_local_fallbacks -ne 5 -or
    $ai.latency_ms.sample_count -ne 5 -or $ai.human_readability_check.status -ne "PASS") {
    throw "G5 AI preservation, degradation, latency, or readability evidence failed."
}

$officialPaths = @(
    "data/external/buildingsmart-pcert/Building-Hvac.ifc"
    "data/external/buildingsmart-pcert/Building-Structural.ifc"
)
$officialAvailable = $officialPaths.Where({ Test-Path -LiteralPath $_ -PathType Leaf }).Count -eq 2
if ($RequireOfficialSamples -and -not $officialAvailable) { throw "The verified buildingSMART samples are required for this acceptance run." }
if ($officialAvailable) {
    & $nodeExe ".\scripts\g5-evaluate-official.mjs" | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "G5 official web-ifc/product run failed." }
    & $pythonExe ".\scripts\g5-evaluate-official.py" | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "G5 official IfcOpenShell run failed." }
    $webOfficial = Get-Content -LiteralPath "outputs/local-only/g5/official-web-ifc.json" -Raw | ConvertFrom-Json
    $pythonOfficial = Get-Content -LiteralPath "outputs/local-only/g5/official-ifcopenshell.json" -Raw | ConvertFrom-Json
    if ($webOfficial.status -ne "PASS" -or $webOfficial.product_contract_run.run_status -ne "NOT_EVALUATED" -or
        $webOfficial.product_contract_run.diagnostic -ne "only unprefixed metre IFC length units are supported" -or
        $pythonOfficial.status -ne "PASS" -or $pythonOfficial.accuracy_claim_permitted -ne $false) {
        throw "G5 official-sample compatibility boundary differs from the accepted failure-closed result."
    }
}

$evaluation = Get-Content -LiteralPath "docs/evaluation.md" -Raw
foreach ($required in @(
    "Three-way status matches",
    "IFC4X3 remains exploratory",
    "not an accuracy result",
    "first-byte and completion",
    "No key or external request was used",
    "NOT_EVALUATED"
)) { if (-not $evaluation.Contains($required)) { throw "G5 evaluation report is missing: $required" } }

$master = Get-Content -LiteralPath "BIMCLASH_AGENT_MASTER_PLAN.md" -Raw
if ($master -notmatch '\| O-005 \| 正式支持 IFC4X3 与否 \| 已决') { throw "O-005 is not closed in the authoritative plan." }

$afterStatus = @(git status --porcelain=v1 --untracked-files=no)
if (($beforeStatus -join "`n") -ne ($afterStatus -join "`n")) { throw "G5 test changed the tracked worktree." }

Write-Output "G5_CONTROLLED_STATUS_MATCHES=8/8"
Write-Output "G5_CONTROLLED_CLASH_PRECISION=1.00"
Write-Output "G5_CONTROLLED_CLASH_RECALL=1.00"
Write-Output "G5_CLEARANCE_ANALYTIC_MATCHES=9/9"
Write-Output "G5_CLEARANCE_MESH_MATCHES=9/9"
Write-Output "G5_THREE_WAY_STATUS_MATCHES=8/8"
Write-Output "G5_AI_FACT_PRESERVATION=6/6"
Write-Output "G5_AI_DEGRADATION=5/5"
Write-Output "G5_OFFICIAL_SAMPLE_RUN=$(if ($officialAvailable) { 'PASS_FAILURE_CLOSED' } else { 'SKIPPED_NOT_PRESENT' })"
Write-Output "G5_O005=IFC4_ONLY_IFC4X3_EXPLORATORY"
Write-Output "G5_LOCAL_TEST=PASS"
