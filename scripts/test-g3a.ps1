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

$gitStateBefore = Get-GitWorktreeState

$baselineWriteRejections = 0
foreach ($generator in @(
    ".\scripts\g1-generate-controlled.py"
    ".\scripts\g2-generate-controlled.py"
)) {
    & $pythonExe $generator --output-root $projectRoot 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        throw "$generator accepted a repository-root write without explicit opt-in."
    }
    $baselineWriteRejections += 1
}

& ".\scripts\test-g1.ps1"
if ($LASTEXITCODE -ne 0) { throw "G1 regression failed during G3A." }

& ".\scripts\test-g2.ps1"
if ($LASTEXITCODE -ne 0) { throw "G2 regression failed during G3A." }

& $pythonExe ".\scripts\test-g3a-contract-mutations.py"
if ($LASTEXITCODE -ne 0) { throw "G3A contract mutation tests failed." }

$gitStateAfter = Get-GitWorktreeState
if ($gitStateAfter -cne $gitStateBefore) {
    throw "Git worktree state changed during the G3A regression suite."
}

Write-Output "G3A_G1_REGRESSION=PASS"
Write-Output "G3A_G2_REGRESSION=PASS"
Write-Output "G3A_BASELINE_WRITE_GUARDS=$baselineWriteRejections/2"
Write-Output "G3A_16_IFC_DETERMINISM=PASS"
Write-Output "G3A_GROUND_TRUTH_MATCH=8/8"
Write-Output "G3A_FAILURE_CLOSED=PASS"
Write-Output "G3A_GIT_WORKTREE_UNCHANGED=PASS"
Write-Output "G3A_LOCAL_TEST=PASS"
