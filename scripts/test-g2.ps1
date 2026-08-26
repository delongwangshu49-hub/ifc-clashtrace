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

function Get-PathHashMapping([string[]]$Paths) {
    $mapping = [ordered]@{}
    foreach ($path in $Paths) {
        $mapping[$path] = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    }
    return ($mapping | ConvertTo-Json -Compress)
}

$frozenBaselinePath = "data/ground-truth/g2-frozen-baseline.json"
$frozenBaseline = Get-Content -LiteralPath $frozenBaselinePath -Raw | ConvertFrom-Json
$baselineIfcPaths = @(
    $frozenBaseline.cases |
        ForEach-Object { $_.files.mep.path; $_.files.structure.path }
)
$protectedBaselinePaths = @(
    $baselineIfcPaths
    "data/g2-operation-ledger.json"
    "data/dataset-manifest.json"
    "data/ground-truth/g2-ground-truth.json"
    $frozenBaselinePath
)
$gitStateBefore = Get-GitWorktreeState
$baselineHashesBefore = Get-PathHashMapping $protectedBaselinePaths
$isolatedParent = Join-Path $projectRoot "outputs/local-only/g3a-tests/g2"
$runOne = Join-Path $isolatedParent "run-1"
$runTwo = Join-Path $isolatedParent "run-2"

& $pythonExe ".\scripts\g2-generate-controlled.py" --output-root $runOne | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G2 isolated controlled dataset generation failed." }
& $pythonExe ".\scripts\g2-generate-controlled.py" --output-root $runTwo | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G2 second isolated controlled dataset generation failed." }

foreach ($validationRoot in @($projectRoot, $runOne, $runTwo)) {
    $validationManifest = Join-Path $validationRoot "data/dataset-manifest.json"
    $validationTruth = Join-Path $validationRoot "data/ground-truth/g2-ground-truth.json"
    & $pythonExe ".\scripts\g3a-contract-check.py" `
        --baseline $frozenBaselinePath `
        --ledger "data/g2-operation-ledger.json" `
        --manifest $validationManifest `
        --ground-truth $validationTruth `
        --artifact-root $validationRoot | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "G3A contract validation failed for $validationRoot."
    }
}

$ledger = Get-Content -LiteralPath "data/g2-operation-ledger.json" -Raw | ConvertFrom-Json
$manifest = Get-Content -LiteralPath "data/dataset-manifest.json" -Raw | ConvertFrom-Json
$groundTruth = Get-Content -LiteralPath "data/ground-truth/g2-ground-truth.json" -Raw | ConvertFrom-Json

$expectedCaseIds = @("C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08")
$ledgerCaseIds = @($ledger.cases | Select-Object -ExpandProperty case_id)
$manifestCaseIds = @($manifest.cases | Select-Object -ExpandProperty case_id)
$truthCaseIds = @($groundTruth.records | Select-Object -ExpandProperty case_id)
foreach ($observed in @($ledgerCaseIds, $manifestCaseIds, $truthCaseIds)) {
    if (Compare-Object -ReferenceObject $expectedCaseIds -DifferenceObject $observed) {
        throw "G2 case IDs do not match C01-C08."
    }
}
if ($manifest.case_count -ne 8 -or $groundTruth.records.Count -ne 8) {
    throw "G2 must contain exactly eight controlled cases and records."
}
if ($ledger.license_spdx_or_name -ne "CC0-1.0" -or
    $manifest.license_spdx_or_name -ne "CC0-1.0" -or
    $groundTruth.license_spdx_or_name -ne "CC0-1.0") {
    throw "Generated IFC and ground-truth data must be CC0-1.0."
}
if ($ledger.evaluation_split.holdout -ne $false -or -not $ledger.evaluation_split.limitation) {
    throw "G2 must explicitly record the absence and limitation of a hidden holdout set."
}

$statusCounts = @{}
foreach ($status in @("CLASH", "CLEAR", "NOT_EVALUATED")) {
    $statusCounts[$status] = @($groundTruth.records | Where-Object status -eq $status).Count
}
if ($statusCounts.CLASH -ne 3 -or $statusCounts.CLEAR -ne 4 -or $statusCounts.NOT_EVALUATED -ne 1) {
    throw "G2 status distribution must be 3 CLASH, 4 CLEAR, and 1 NOT_EVALUATED."
}

$clashIds = @($groundTruth.records | Select-Object -ExpandProperty clash_id)
if (@($clashIds | Sort-Object -Unique).Count -ne 8) {
    throw "G2 assessment IDs must be unique."
}
$allGuids = @(
    $groundTruth.records | ForEach-Object {
        $_.element_a.global_id
        $_.element_b.global_id
    }
)
if (@($allGuids | Sort-Object -Unique).Count -ne 16) {
    throw "G2 element GUIDs must be unique across all controlled cases."
}

foreach ($case in $manifest.cases) {
    if ($case.origin -ne "programmatically_generated" -or
        $case.license_spdx_or_name -ne "CC0-1.0" -or
        $case.redistribution_permitted -ne $true -or
        -not $case.ground_truth_basis -or
        -not $case.limitations) {
        throw "Incomplete manifest metadata for $($case.case_id)."
    }
    foreach ($file in $case.files) {
        if ([System.IO.Path]::IsPathRooted($file.path)) {
            throw "Manifest path must be repository relative: $($file.path)"
        }
        $candidatePath = Join-Path $projectRoot $file.path
        if (-not (Test-Path -LiteralPath $candidatePath -PathType Leaf)) {
            throw "Missing generated IFC: $($file.path)"
        }
        $actualHash = (Get-FileHash -LiteralPath $candidatePath -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actualHash -ne $file.file_sha256) {
            throw "Generated IFC hash mismatch for $($file.path)."
        }
        $ifcText = Get-Content -LiteralPath $candidatePath -Raw
        $driveRootPattern = "[A-Z]" + [regex]::Escape(":" + [char]92)
        $unixUserPattern = "/" + "Users" + "/"
        $unixHomePattern = "/" + "home" + "/"
        $privateHeaderPattern = "(?i)$driveRootPattern|$unixUserPattern|$unixHomePattern|@"
        if ($ifcText -notmatch "CC0-1\.0" -or $ifcText -match $privateHeaderPattern) {
            throw "Generated IFC license or privacy header check failed for $($file.path)."
        }
    }
}

$truthByCase = @{}
foreach ($record in $groundTruth.records) { $truthByCase[$record.case_id] = $record }
if ($truthByCase.C03.status -ne "CLEAR" -or
    $truthByCase.C04.status -ne "CLEAR" -or
    $truthByCase.C06.status -ne "CLEAR" -or
    $truthByCase.C08.status -ne "NOT_EVALUATED") {
    throw "Critical touching, tolerance, opening, or failure-closed truth status is incorrect."
}

& $pythonExe ".\scripts\g2-reference-clash.py" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "G2 IfcOpenShell reference validation failed." }
$reference = Get-Content -LiteralPath "outputs/local-only/g2/reference-results.json" -Raw | ConvertFrom-Json
if ($reference.status -ne "PASS" -or
    $reference.case_count -ne 8 -or
    -not $reference.all_statuses_match_ground_truth -or
    -not $reference.all_clash_pairs_and_types_match_ground_truth) {
    throw "G2 reference results did not match all controlled ground-truth records."
}
$referenceByCase = @{}
foreach ($result in $reference.results) { $referenceByCase[$result.case_id] = $result }
if ($referenceByCase.C04.raw_surface_status -ne "CLASH" -or
    $referenceByCase.C04.observed_status -ne "CLEAR" -or
    $referenceByCase.C04.minimum_aabb_overlap_m -ge 0.002) {
    throw "C04 must retain the raw surface-intersection limitation and pass the 2 mm controlled-suite guard."
}
if ($referenceByCase.C08.observed_status -ne "NOT_EVALUATED" -or
    $referenceByCase.C08.missing_geometry_roles -notcontains "mep") {
    throw "C08 must fail closed with an explicit missing-MEP-geometry diagnostic."
}

$baselineHashesAfter = Get-PathHashMapping $protectedBaselinePaths
$gitStateAfter = Get-GitWorktreeState
if ($baselineHashesAfter -cne $baselineHashesBefore) {
    throw "G2 committed baseline changed while tests were running."
}
if ($gitStateAfter -cne $gitStateBefore) {
    throw "G2 Git worktree state changed while tests were running."
}

Write-Output "G2_CASE_COUNT=$($groundTruth.records.Count)"
Write-Output "G2_STATUS_COUNTS=CLASH:$($statusCounts.CLASH),CLEAR:$($statusCounts.CLEAR),NOT_EVALUATED:$($statusCounts.NOT_EVALUATED)"
Write-Output "G2_GENERATED_IFC_COUNT=$(@(Get-ChildItem -LiteralPath 'data/generated/g2' -File -Filter '*.ifc').Count)"
Write-Output "G2_ISOLATED_DETERMINISTIC_REGENERATION=PASS"
Write-Output "G2_MANIFEST_HASHES=PASS"
Write-Output "G2_PATH_SHA256_MAPPING=PASS"
Write-Output "G2_APPROVED_CONTRACT=PASS"
Write-Output "G2_BASELINE_HASHES_UNCHANGED=PASS"
Write-Output "G2_GIT_WORKTREE_UNCHANGED=PASS"
Write-Output "G2_REFERENCE_MATCH=8/8"
Write-Output "G2_FAILURE_CLOSED=PASS"
Write-Output "G2_LOCAL_TEST=PASS"
