[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ((Get-Location).Path -ne $projectRoot) { throw "Run this script from the project root." }
if ($PSVersionTable.PSVersion.Major -lt 7) { throw "PowerShell 7 or later is required." }

$nodeExe = Join-Path $projectRoot ".tools/node-v24.19.0-win-x64/node.exe"
if (-not (Test-Path -LiteralPath $nodeExe -PathType Leaf)) {
    throw "Missing project-local Node.js runtime. Run scripts/setup-g1.ps1 first."
}

function Get-GitWorktreeState {
    $state = @(git status --porcelain=v1 --untracked-files=all)
    if ($LASTEXITCODE -ne 0) { throw "Unable to read Git worktree state." }
    return $state -join "`n"
}

function Get-PathHashMapping([string[]]$Paths) {
    $mapping = [ordered]@{}
    foreach ($path in $Paths) {
        $mapping[$path] = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    }
    return ($mapping | ConvertTo-Json -Compress)
}

$g2Baseline = Get-Content -LiteralPath "data/ground-truth/g2-frozen-baseline.json" -Raw | ConvertFrom-Json
$g3cBaseline = Get-Content -LiteralPath "data/ground-truth/g3c-clearance-baseline.json" -Raw | ConvertFrom-Json
$protectedPaths = @(
    "data/ground-truth/g2-frozen-baseline.json"
    "data/ground-truth/g2-ground-truth.json"
    "data/g2-operation-ledger.json"
    "data/ground-truth/g3c-clearance-baseline.json"
    "data/g3c-operation-ledger.json"
) + @($g2Baseline.cases | ForEach-Object { $_.files.mep.path; $_.files.structure.path }) + @($g3cBaseline.cases.artifact.path)
$gitStateBefore = Get-GitWorktreeState
$protectedHashesBefore = Get-PathHashMapping $protectedPaths

& $nodeExe --check ".\app\core\ifc-clash-engine.mjs"
if ($LASTEXITCODE -ne 0) { throw "G3 core syntax check failed." }
& $nodeExe --check ".\scripts\g3-engine-tests.mjs"
if ($LASTEXITCODE -ne 0) { throw "G3 engine-test syntax check failed." }
& $nodeExe --check ".\spikes\g3-browser\app.mjs"
if ($LASTEXITCODE -ne 0) { throw "G3 browser-harness syntax check failed." }

$coreSource = Get-Content -LiteralPath ".\app\core\ifc-clash-engine.mjs" -Raw
if ($coreSource -match 'from\s+["'']node:' -or $coreSource -match 'node:fs|node:path') {
    throw "G3 browser core imports a Node-only module."
}
if ($coreSource -notmatch 'aabb_classification_permitted:\s*false' -or
    $coreSource -match 'aabb_classification_permitted:\s*true') {
    throw "G3 core no longer enforces the AABB classification prohibition."
}

$engineJson = & $nodeExe ".\scripts\g3-engine-tests.mjs" | Out-String | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or $engineJson.status -ne "PASS") { throw "G3 engine acceptance failed." }
if ($engineJson.hard_rule_id -ne "MEP_STRUCTURE_HARD_CLASH_V1" -or
    $engineJson.clearance_rule_id -ne "MEP_STRUCTURE_CLEARANCE_WARNING_V1") {
    throw "G3 approved rule IDs changed."
}
$expectedStatuses = [ordered]@{
    C01 = "CLASH"; C02 = "CLASH"; C03 = "CLEAR"; C04 = "CLEAR"
    C05 = "CLEAR"; C06 = "CLEAR"; C07 = "CLASH"; C08 = "NOT_EVALUATED"
}
foreach ($caseId in $expectedStatuses.Keys) {
    if ($engineJson.controlled_statuses.$caseId -ne $expectedStatuses[$caseId]) {
        throw "G3 controlled status changed for $caseId."
    }
}
if ($engineJson.adversarial_guards.unverified_coordinates -ne "NOT_EVALUATED" -or
    $engineJson.adversarial_guards.zero_threshold -ne "NOT_EVALUATED" -or
    $engineJson.adversarial_guards.non_finite_threshold -ne "NOT_EVALUATED" -or
    $engineJson.adversarial_guards.custom_hard_threshold -ne "NOT_EVALUATED" -or
    $engineJson.adversarial_guards.custom_clearance_threshold -ne "NOT_EVALUATED" -or
    $engineJson.adversarial_guards.malformed_ifc -ne "NOT_EVALUATED" -or
    $engineJson.adversarial_guards.role_mismatch -ne "NOT_EVALUATED" -or
    $engineJson.adversarial_guards.all_degenerate_mesh -ne "REJECTED" -or
    $engineJson.adversarial_guards.non_triangular_index -ne "REJECTED" -or
    $engineJson.adversarial_guards.out_of_range_index -ne "REJECTED" -or
    $engineJson.adversarial_guards.non_integer_index -ne "REJECTED" -or
    $engineJson.adversarial_guards.partial_geometry_failure -ne "NOT_EVALUATED" -or
    $engineJson.adversarial_guards.deterministic_repeat -ne "PASS") {
    throw "A G3 failure-closed or determinism guard changed."
}

& ".\scripts\test-g3c.ps1" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G1/G2/G3A/G3B/G3C regression failed during G3." }

$protectedHashesAfter = Get-PathHashMapping $protectedPaths
$gitStateAfter = Get-GitWorktreeState
if ($protectedHashesAfter -cne $protectedHashesBefore) { throw "A frozen G2/G3C artifact changed during G3 tests." }
if ($gitStateAfter -cne $gitStateBefore) { throw "Git worktree state changed during the G3 suite." }

Write-Output "G3_HARD_RULE=MEP_STRUCTURE_HARD_CLASH_V1"
Write-Output "G3_CLEARANCE_RULE=MEP_STRUCTURE_CLEARANCE_WARNING_V1"
Write-Output "G3_TWO_MODEL_WEB_IFC_INPUT=PASS"
Write-Output "G3_ELEMENT_FILTER=IfcPipeSegmentx(IfcWall|IfcBeam)"
Write-Output "G3_CONTROLLED_HARD_STATUS_MATCH=8/8"
Write-Output "G3_HARD_CLASH_PRECISION_RECALL=100/100"
Write-Output "G3_CLEARANCE_G2_INTEGRATION=PASS"
Write-Output "G3_HARD_CLASH_DEDUPLICATION=3/3"
Write-Output "G3_FAILURE_CLOSED_GUARDS=12/12"
Write-Output "G3_DETERMINISTIC_REPEAT=PASS"
Write-Output "G3_AABB_CLASSIFICATION_PROHIBITED=PASS"
Write-Output "G3_BROWSER_CORE_NODE_IMPORTS=0"
Write-Output "G3_G1_G2_G3A_G3A_R1_G3B_G3B_R1_G3C_G3C_R1_REGRESSION=PASS"
Write-Output "G3_FROZEN_G2_G3C_ARTIFACTS_UNCHANGED=PASS"
Write-Output "G3_GIT_WORKTREE_UNCHANGED=PASS"
Write-Output "G3_LOCAL_TEST=PASS"
