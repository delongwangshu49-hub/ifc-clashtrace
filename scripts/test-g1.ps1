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
$nodeExe = Join-Path $projectRoot ".tools/node-v24.19.0-win-x64/node.exe"
if (-not (Test-Path -LiteralPath $pythonExe -PathType Leaf)) {
    throw "Missing project Python environment. Run scripts/setup-g1.ps1 first."
}
if (-not (Test-Path -LiteralPath $nodeExe -PathType Leaf)) {
    throw "Missing project Node.js runtime. Run scripts/setup-g1.ps1 first."
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

function New-IsolatedTestRoot([string]$Parent) {
    $parentFullPath = [System.IO.Path]::GetFullPath($Parent)
    $testRoot = Join-Path $parentFullPath ([System.Guid]::NewGuid().ToString("N"))
    $testRootFullPath = [System.IO.Path]::GetFullPath($testRoot)
    $expectedPrefix = $parentFullPath + [System.IO.Path]::DirectorySeparatorChar
    if (-not $testRootFullPath.StartsWith($expectedPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to create an isolated G1 test root outside its approved parent."
    }
    New-Item -ItemType Directory -Path $testRootFullPath -Force | Out-Null
    return $testRootFullPath
}

$baselinePaths = @(
    "data/generated/g1/g1-mep.ifc"
    "data/generated/g1/g1-structure.ifc"
    "data/generated/g1/manifest.json"
)
$gitStateBefore = Get-GitWorktreeState
$baselineHashesBefore = Get-PathHashMapping $baselinePaths
$isolatedParent = Join-Path $projectRoot "outputs/local-only/g3a-tests/g1"
$isolatedTestRoot = New-IsolatedTestRoot $isolatedParent
$runOne = Join-Path $isolatedTestRoot "run-1"
$runTwo = Join-Path $isolatedTestRoot "run-2"

try {
& $pythonExe ".\scripts\g1-generate-controlled.py" --output-root $runOne | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G1 isolated controlled model generation failed." }
& $pythonExe ".\scripts\g1-generate-controlled.py" --output-root $runTwo | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G1 second isolated controlled model generation failed." }

$committedManifest = Get-Content -LiteralPath "data/generated/g1/manifest.json" -Raw | ConvertFrom-Json
foreach ($file in $committedManifest.files) {
    $runOnePath = Join-Path $runOne $file.path
    $runTwoPath = Join-Path $runTwo $file.path
    $runOneHash = (Get-FileHash -LiteralPath $runOnePath -Algorithm SHA256).Hash.ToLowerInvariant()
    $runTwoHash = (Get-FileHash -LiteralPath $runTwoPath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($runOneHash -ne $file.sha256 -or $runTwoHash -ne $file.sha256) {
        throw "G1 isolated generation differs from the committed path-SHA baseline for $($file.path)."
    }
}
& $pythonExe ".\scripts\g1-reference-spike.py" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G1 IfcOpenShell reference spike failed." }
& $nodeExe ".\scripts\g1-web-ifc-spike.mjs" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G1 web-ifc/BVH spike failed." }

$manifestPath = Join-Path $projectRoot "data/generated/g1/manifest.json"
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
foreach ($file in $manifest.files) {
    $candidatePath = Join-Path $projectRoot $file.path
    $actualHash = (Get-FileHash -LiteralPath $candidatePath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualHash -ne $file.sha256) {
        throw "Generated IFC hash mismatch for $($file.path)."
    }
}

$reference = Get-Content -LiteralPath "outputs/local-only/g1/reference-result.json" -Raw | ConvertFrom-Json
$webIfc = Get-Content -LiteralPath "outputs/local-only/g1/web-ifc-result.json" -Raw | ConvertFrom-Json
if ($reference.status -ne "PASS" -or $webIfc.status -ne "PASS") {
    throw "One or more G1 detector routes did not pass."
}
if ($reference.clash_count -ne 1 -or $webIfc.clash_count -ne 1) {
    throw "Expected exactly one clash from each detector route."
}
if ($reference.pairs[0].element_a.global_id -ne $webIfc.pairs[0].element_a.global_id -or
    $reference.pairs[0].element_b.global_id -ne $webIfc.pairs[0].element_b.global_id) {
    throw "Reference and web-ifc routes returned different GUID pairs."
}
if ($reference.tolerance_m -ne 0.002 -or $webIfc.tolerance_m -ne 0.002) {
    throw "G1 tolerance evidence is not 0.002 m."
}
if ($reference.unit_scale_to_metre[0] -ne 1 -or $reference.unit_scale_to_metre[1] -ne 1) {
    throw "G1 reference models are not metre-based."
}
if (-not $webIfc.guid_mapping_complete) {
    throw "web-ifc GUID mapping is incomplete."
}

$baselineHashesAfter = Get-PathHashMapping $baselinePaths
$gitStateAfter = Get-GitWorktreeState
if ($baselineHashesAfter -cne $baselineHashesBefore) {
    throw "G1 committed baseline changed while tests were running."
}
if ($gitStateAfter -cne $gitStateBefore) {
    throw "G1 Git worktree state changed while tests were running."
}
} finally {
    if (Test-Path -LiteralPath $isolatedTestRoot -PathType Container) {
        $cleanupTarget = (Resolve-Path -LiteralPath $isolatedTestRoot).Path
        $expectedPrefix = [System.IO.Path]::GetFullPath($isolatedParent) + [System.IO.Path]::DirectorySeparatorChar
        if (-not $cleanupTarget.StartsWith($expectedPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw "Refusing to clean an isolated G1 test root outside its approved parent."
        }
        Remove-Item -LiteralPath $cleanupTarget -Recurse -Force
    }
}
if (Test-Path -LiteralPath $isolatedTestRoot) {
    throw "G1 isolated test root was not cleaned."
}

Write-Output "G1_REFERENCE_STATUS=$($reference.status)"
Write-Output "G1_WEB_IFC_STATUS=$($webIfc.status)"
Write-Output "G1_MATCHED_GUID_PAIR=$($reference.pairs[0].element_a.global_id)|$($reference.pairs[0].element_b.global_id)"
Write-Output "G1_REFERENCE_PENETRATION_M=$($reference.pairs[0].distance_m)"
Write-Output "G1_TOLERANCE_M=$($reference.tolerance_m)"
Write-Output "G1_ISOLATED_GENERATION=PASS"
Write-Output "G1_ISOLATED_TEMP_ROOT_CLEANUP=PASS"
Write-Output "G1_BASELINE_HASHES_UNCHANGED=PASS"
Write-Output "G1_GIT_WORKTREE_UNCHANGED=PASS"
Write-Output "G1_LOCAL_TEST=PASS"
