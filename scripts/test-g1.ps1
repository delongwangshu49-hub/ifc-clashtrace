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

& $pythonExe ".\scripts\g1-generate-controlled.py" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G1 controlled model generation failed." }
$firstGenerationHashes = @(
    (Get-FileHash -LiteralPath "data/generated/g1/g1-mep.ifc" -Algorithm SHA256).Hash
    (Get-FileHash -LiteralPath "data/generated/g1/g1-structure.ifc" -Algorithm SHA256).Hash
)
& $pythonExe ".\scripts\g1-generate-controlled.py" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G1 controlled model regeneration failed." }
$secondGenerationHashes = @(
    (Get-FileHash -LiteralPath "data/generated/g1/g1-mep.ifc" -Algorithm SHA256).Hash
    (Get-FileHash -LiteralPath "data/generated/g1/g1-structure.ifc" -Algorithm SHA256).Hash
)
if (Compare-Object -ReferenceObject $firstGenerationHashes -DifferenceObject $secondGenerationHashes) {
    throw "G1 controlled model generation is not byte-for-byte deterministic."
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

Write-Output "G1_REFERENCE_STATUS=$($reference.status)"
Write-Output "G1_WEB_IFC_STATUS=$($webIfc.status)"
Write-Output "G1_MATCHED_GUID_PAIR=$($reference.pairs[0].element_a.global_id)|$($reference.pairs[0].element_b.global_id)"
Write-Output "G1_REFERENCE_PENETRATION_M=$($reference.pairs[0].distance_m)"
Write-Output "G1_TOLERANCE_M=$($reference.tolerance_m)"
Write-Output "G1_LOCAL_TEST=PASS"
