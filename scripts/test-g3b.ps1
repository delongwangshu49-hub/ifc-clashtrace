[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ((Get-Location).Path -ne $projectRoot) {
    throw "Run this script from the project root."
}
if ($PSVersionTable.PSVersion.Major -lt 7) {
    throw "PowerShell 7 or later is required."
}

$pythonExe = Join-Path $projectRoot ".venv/Scripts/python.exe"
if (-not (Test-Path -LiteralPath $pythonExe -PathType Leaf)) {
    throw "Missing project Python environment. Run scripts/setup-g1.ps1 first."
}

function Get-GitWorktreeState {
    $state = @(git status --porcelain=v1 --untracked-files=all)
    if ($LASTEXITCODE -ne 0) { throw "Unable to read Git worktree state." }
    return $state -join "`n"
}

function Assert-Close {
    param(
        [double]$Actual,
        [double]$Expected,
        [string]$Label
    )
    if ([math]::Abs($Actual - $Expected) -gt 1e-12) {
        throw "$Label expected $Expected but observed $Actual."
    }
}

$gitStateBefore = Get-GitWorktreeState

& $pythonExe ".\scripts\g2-reference-clash.py" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G2 reference validation failed during G3B." }
$g2Reference = Get-Content -LiteralPath "outputs/local-only/g2/reference-results.json" -Raw | ConvertFrom-Json
$g2ByCase = @{}
foreach ($result in $g2Reference.results) { $g2ByCase[$result.case_id] = $result }
if (-not $g2ByCase.C04.aabb_guard_applied -or
    $g2ByCase.C04.classification_path -ne "c04_controlled_aabb_guard" -or
    $g2ByCase.C04.raw_surface_status -ne "CLASH" -or
    $g2ByCase.C04.observed_status -ne "CLEAR") {
    throw "C04 no longer preserves its explicitly scoped controlled AABB evidence."
}
$aabbOutsideC04 = @(
    $g2Reference.results |
        Where-Object {
            $_.case_id -ne "C04" -and
            ($_.aabb_guard_applied -or $null -ne $_.minimum_aabb_overlap_m)
        }
)
if ($aabbOutsideC04.Count -ne 0) {
    throw "A non-C04 G2 case inherited the controlled AABB classification guard."
}

& $pythonExe ".\scripts\g3b-tolerance-proof.py" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G3B tolerance proof failed." }
$proof = Get-Content -LiteralPath "outputs/local-only/g3b/tolerance-results.json" -Raw | ConvertFrom-Json
if ($proof.status -ne "PASS" -or
    $proof.semantic_id -ne "STRUCTURE_EROSION_INTERIOR_DEPTH_V1" -or
    $proof.case_count -ne 13 -or
    $proof.aabb_classification_permitted) {
    throw "G3B tolerance proof top-level contract failed."
}
if ($proof.status_counts.CLASH -ne 4 -or
    $proof.status_counts.CLEAR -ne 3 -or
    $proof.status_counts.NOT_EVALUATED -ne 6) {
    throw "G3B proof status distribution changed."
}

$proofByCase = @{}
foreach ($result in $proof.results) { $proofByCase[$result.case_id] = $result }
$expectedCaseIds = 1..13 | ForEach-Object { "G3B$($_.ToString('00'))" }
if ((($proofByCase.Keys | Sort-Object) -join "`n") -cne (($expectedCaseIds | Sort-Object) -join "`n")) {
    throw "G3B proof case IDs changed."
}

Assert-Close $proofByCase.G3B01.maximum_interior_depth_m 0.0 "touching depth"
Assert-Close $proofByCase.G3B02.maximum_interior_depth_m 0.0019 "below-threshold depth"
Assert-Close $proofByCase.G3B03.maximum_interior_depth_m 0.002 "equal-threshold depth"
Assert-Close $proofByCase.G3B04.maximum_interior_depth_m 0.0021 "above-threshold depth"
Assert-Close $proofByCase.G3B13.maximum_interior_depth_m 0.0020000000005 "minutely-above-threshold depth"
if ($proofByCase.G3B13.maximum_interior_depth_exact_m -cne "0.0020000000005") {
    throw "The exact decimal certificate for G3B13 changed."
}
if ($proofByCase.G3B01.observed_status -ne "CLEAR" -or
    $proofByCase.G3B02.observed_status -ne "CLEAR" -or
    $proofByCase.G3B03.observed_status -ne "CLEAR" -or
    $proofByCase.G3B04.observed_status -ne "CLASH" -or
    $proofByCase.G3B13.observed_status -ne "CLASH") {
    throw "The strict 2 mm threshold semantics failed."
}

Assert-Close $proofByCase.G3B05.maximum_interior_depth_m 0.0015 "3 mm thin-structure depth"
Assert-Close $proofByCase.G3B06.maximum_interior_depth_m 0.002 "4 mm thin-structure depth"
Assert-Close $proofByCase.G3B07.maximum_interior_depth_m 0.0021 "4.2 mm thin-structure depth"
if ($proofByCase.G3B05.observed_status -ne "NOT_EVALUATED" -or
    $proofByCase.G3B06.observed_status -ne "NOT_EVALUATED" -or
    $proofByCase.G3B07.observed_status -ne "CLASH") {
    throw "Thin-structure tolerance semantics failed."
}

if ($proofByCase.G3B08.observed_status -ne "NOT_EVALUATED" -or
    $proofByCase.G3B08.maximum_interior_depth_m -ge $proof.tolerance_m -or
    $proofByCase.G3B08.world_aabb_minimum_overlap_m -le $proof.tolerance_m -or
    $proofByCase.G3B08.aabb_used_for_classification) {
    throw "The rotated thin-structure fixture did not expose AABB false precision."
}
if ($proofByCase.G3B09.observed_status -ne "CLASH" -or
    $proofByCase.G3B09.certificate -ne "center_crossing_inradius") {
    throw "The rotated oblique centre-crossing certificate failed."
}

foreach ($caseId in @("G3B10", "G3B11", "G3B12")) {
    $result = $proofByCase[$caseId]
    if ($result.observed_status -ne "NOT_EVALUATED" -or
        $null -ne $result.maximum_interior_depth_m -or
        [string]::IsNullOrWhiteSpace($result.diagnostic)) {
        throw "$caseId did not fail closed with a diagnostic."
    }
}
if ($proofByCase.G3B10.reliability_signal_source -ne "fixture_precondition" -or
    $proofByCase.G3B11.reliability_signal_source -ne "fixture_precondition") {
    throw "G3B10/G3B11 must identify caller-supplied fixture preconditions as their reliability source."
}
if ($proofByCase.G3B12.certificate -ne "unsupported" -or
    $proofByCase.G3B12.reliability_signal_source -ne "analytic_certificate") {
    throw "G3B12 must fail closed because the analytic certificate family is unsupported."
}
foreach ($caseId in @("G3B05", "G3B06", "G3B08")) {
    if ($proofByCase[$caseId].certificate -ne "degenerate_tolerance_core" -or
        [string]::IsNullOrWhiteSpace($proofByCase[$caseId].diagnostic)) {
        throw "$caseId must fail closed when the tolerance erosion core is empty or degenerate."
    }
}
if (@($proof.results | Where-Object { $_.aabb_used_for_classification }).Count -ne 0) {
    throw "A G3B proof case used world-axis AABB overlap for classification."
}

& ".\scripts\test-g3a.ps1" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G1/G2/G3A regression failed during G3B." }

$gitStateAfter = Get-GitWorktreeState
if ($gitStateAfter -cne $gitStateBefore) {
    throw "Git worktree state changed during the G3B suite."
}

Write-Output "G3B_SEMANTIC=STRUCTURE_EROSION_INTERIOR_DEPTH_V1"
Write-Output "G3B_TOLERANCE_M=0.002"
Write-Output "G3B_THRESHOLD_BELOW_EQUAL_ABOVE=PASS"
Write-Output "G3B_STRICT_THRESHOLD_SUB_EPSILON_REGRESSION=PASS"
Write-Output "G3B_THIN_STRUCTURE_3_4_4_2_MM=PASS"
Write-Output "G3B_ROTATED_OBLIQUE=PASS"
Write-Output "G3B_ROTATED_AABB_DIVERGENCE=PASS"
Write-Output "G3B_C04_ONLY_AABB_SCOPE=PASS"
Write-Output "G3B_FAILURE_CLOSED=6/6"
Write-Output "G3B_G1_G2_G3A_G3A_R1_REGRESSION=PASS"
Write-Output "G3B_GIT_WORKTREE_UNCHANGED=PASS"
Write-Output "G3B_LOCAL_TEST=PASS"
