[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ((Get-Location).Path -ne $projectRoot) { throw "Run this script from the project root." }
if ($PSVersionTable.PSVersion.Major -lt 7) { throw "PowerShell 7 or later is required." }

$pythonExe = Join-Path $projectRoot ".venv/Scripts/python.exe"
$nodeExe = Join-Path $projectRoot ".tools/node-v24.19.0-win-x64/node.exe"
foreach ($runtime in @($pythonExe, $nodeExe)) {
    if (-not (Test-Path -LiteralPath $runtime -PathType Leaf)) {
        throw "Missing project-local runtime. Run scripts/setup-g1.ps1 first."
    }
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
        throw "Refusing to create an isolated G3C test root outside its approved parent."
    }
    New-Item -ItemType Directory -Path $testRootFullPath -Force | Out-Null
    return $testRootFullPath
}

$baselinePath = "data/ground-truth/g3c-clearance-baseline.json"
$ledgerPath = "data/g3c-operation-ledger.json"
$baseline = Get-Content -LiteralPath $baselinePath -Raw | ConvertFrom-Json
$artifactPaths = @($baseline.cases | ForEach-Object { $_.artifact.path })
$protectedPaths = @($ledgerPath, $baselinePath) + $artifactPaths
$gitStateBefore = Get-GitWorktreeState
$protectedHashesBefore = Get-PathHashMapping $protectedPaths
$isolatedParent = Join-Path $projectRoot "outputs/local-only/g3c-tests"
$isolatedTestRoot = New-IsolatedTestRoot $isolatedParent
$runOne = Join-Path $isolatedTestRoot "run-1"
$runTwo = Join-Path $isolatedTestRoot "run-2"

try {
    & $pythonExe ".\scripts\g3c-generate-clearance.py" --output-root $projectRoot 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { throw "G3C generator accepted a repository-root write without explicit opt-in." }

    foreach ($runRoot in @($runOne, $runTwo)) {
        & $pythonExe ".\scripts\g3c-generate-clearance.py" --output-root $runRoot | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "G3C isolated generation failed for $runRoot." }
    }

    foreach ($entry in $baseline.cases) {
        foreach ($runRoot in @($runOne, $runTwo)) {
            $artifactPath = Join-Path $runRoot $entry.artifact.path
            $observedHash = (Get-FileHash -LiteralPath $artifactPath -Algorithm SHA256).Hash.ToLowerInvariant()
            if ($observedHash -ne $entry.artifact.file_sha256) {
                throw "G3C isolated artifact differs from the frozen path-SHA mapping for $($entry.case_id)."
            }
        }
    }
    $committedBaselineHash = (Get-FileHash -LiteralPath $baselinePath -Algorithm SHA256).Hash
    foreach ($runRoot in @($runOne, $runTwo)) {
        $regeneratedBaseline = Join-Path $runRoot $baselinePath
        if ((Get-FileHash -LiteralPath $regeneratedBaseline -Algorithm SHA256).Hash -ne $committedBaselineHash) {
            throw "G3C regenerated baseline is not byte deterministic."
        }
    }

    $mutationFailures = 0
    $mutationIndex = 0
    foreach ($mutation in @("rule_id", "threshold_m", "artifact_hash", "expected_status")) {
        $mutated = Get-Content -LiteralPath $baselinePath -Raw | ConvertFrom-Json
        switch ($mutation) {
            "rule_id" { $mutated.rule_id = "MUTATED_CLEARANCE_RULE" }
            "threshold_m" { $mutated.threshold_m = 0.051 }
            "artifact_hash" { $mutated.cases[0].artifact.file_sha256 = "0" * 64 }
            "expected_status" { $mutated.cases[1].expected_record.status = "CLEAR" }
        }
        $mutationPath = Join-Path $isolatedTestRoot "mutation-$mutation.json"
        $mutated | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $mutationPath -Encoding utf8
        $mutationOutput = Join-Path $isolatedTestRoot "mutation-output-$mutationIndex.json"
        & $pythonExe ".\scripts\g3c-clearance-proof.py" `
            --baseline $mutationPath `
            --artifact-root $projectRoot `
            --output $mutationOutput 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { throw "G3C contract mutation unexpectedly passed: $mutation" }
        $mutationFailures += 1
        $mutationIndex += 1
    }

    $validationRoots = @($projectRoot, $runOne, $runTwo)
    for ($index = 0; $index -lt $validationRoots.Count; $index++) {
        $validationRoot = $validationRoots[$index]
        $validationBaseline = Join-Path $validationRoot $baselinePath
        $analyticOutput = Join-Path $isolatedTestRoot "analytic-$index.json"
        $meshOutput = Join-Path $isolatedTestRoot "mesh-$index.json"
        & $pythonExe ".\scripts\g3c-clearance-proof.py" `
            --baseline $validationBaseline `
            --artifact-root $validationRoot `
            --output $analyticOutput | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "G3C analytic proof failed for $validationRoot." }
        & $nodeExe ".\scripts\g3c-clearance-reference.mjs" `
            --baseline $validationBaseline `
            --artifact-root $validationRoot `
            --output $meshOutput | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "G3C independent mesh reference failed for $validationRoot." }
    }

    $analytic = Get-Content -LiteralPath (Join-Path $isolatedTestRoot "analytic-0.json") -Raw | ConvertFrom-Json
    $mesh = Get-Content -LiteralPath (Join-Path $isolatedTestRoot "mesh-0.json") -Raw | ConvertFrom-Json
    if ($analytic.status -ne "PASS" -or -not $analytic.all_expected_records_match -or
        $analytic.rule_id -ne "MEP_STRUCTURE_CLEARANCE_WARNING_V1" -or
        $analytic.threshold_m -ne 0.05 -or $analytic.case_count -ne 9 -or $analytic.record_count -ne 8 -or
        $analytic.aabb_classification_permitted) {
        throw "G3C analytic top-level contract failed."
    }
    if ($analytic.status_counts.WARNING -ne 4 -or $analytic.status_counts.CLEAR -ne 2 -or
        $analytic.status_counts.NOT_EVALUATED -ne 2 -or $analytic.status_counts.SUPPRESSED -ne 1) {
        throw "G3C status distribution changed."
    }
    if ($mesh.status -ne "PASS" -or -not $mesh.all_expected_records_match -or
        $mesh.case_count -ne 9 -or $mesh.aabb_classification_permitted -or
        $mesh.mesh_threshold_epsilon_m -gt 0.0000001) {
        throw "G3C independent triangle-mesh reference contract failed."
    }

    $byCase = @{}
    foreach ($result in $analytic.results) { $byCase[$result.case_id] = $result }
    $meshByCase = @{}
    foreach ($result in $mesh.results) { $meshByCase[$result.case_id] = $result }
    $expectedCaseIds = 1..9 | ForEach-Object { "G3C$($_.ToString('00'))" }
    if ((($byCase.Keys | Sort-Object) -join "`n") -cne (($expectedCaseIds | Sort-Object) -join "`n")) {
        throw "G3C case IDs changed."
    }
    foreach ($probe in @(
        @{ Id = "G3C01"; Status = "WARNING"; Distance = 0.0 },
        @{ Id = "G3C02"; Status = "WARNING"; Distance = 0.049 },
        @{ Id = "G3C03"; Status = "CLEAR"; Distance = 0.05 },
        @{ Id = "G3C04"; Status = "CLEAR"; Distance = 0.051 },
        @{ Id = "G3C06"; Status = "WARNING"; Distance = 0.03 },
        @{ Id = "G3C07"; Status = "WARNING"; Distance = 0.04 }
    )) {
        $result = $byCase[$probe.Id]
        if (-not $result.record_emitted -or $result.observed_status -ne $probe.Status -or
            [math]::Abs($result.clearance_distance_m - $probe.Distance) -gt 1e-12) {
            throw "$($probe.Id) clearance threshold or geometry result changed."
        }
        if (-not $meshByCase[$probe.Id].expected_match) {
            throw "$($probe.Id) no longer matches the independent triangle-mesh reference."
        }
    }
    if ($byCase.G3C05.record_emitted -or $byCase.G3C05.certificate -ne "hard_clash_precedence" -or
        $meshByCase.G3C05.record_emitted) {
        throw "Hard-clash precedence no longer suppresses duplicate clearance output."
    }
    foreach ($caseId in @("G3C08", "G3C09")) {
        if (-not $byCase[$caseId].record_emitted -or $byCase[$caseId].observed_status -ne "NOT_EVALUATED" -or
            $null -ne $byCase[$caseId].clearance_distance_m -or [string]::IsNullOrWhiteSpace($byCase[$caseId].diagnostic)) {
            throw "$caseId did not fail closed with a diagnostic."
        }
    }
    foreach ($record in $analytic.records) {
        if ($record.rule_id -ne "MEP_STRUCTURE_CLEARANCE_WARNING_V1" -or
            $record.element_a.entity_type -ne "IfcPipeSegment" -or
            $record.element_b.entity_type -notin @("IfcWall", "IfcBeam") -or
            $record.threshold_m -ne 0.05 -or $record.length_unit -ne "metre" -or
            [string]::IsNullOrWhiteSpace($record.element_a.global_id) -or
            [string]::IsNullOrWhiteSpace($record.element_b.global_id) -or
            [string]::IsNullOrWhiteSpace($record.evidence.artifact_path) -or
            [string]::IsNullOrWhiteSpace($record.evidence.artifact_sha256) -or
            $record.evidence.algorithm_boundary -notmatch "AABB separation is not used") {
            throw "A G3C Clearance Warning Record violates the approved contract."
        }
    }

    & ".\scripts\test-g3b.ps1" | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "G1/G2/G3A/G3B regression failed during G3C." }

    $protectedHashesAfter = Get-PathHashMapping $protectedPaths
    $gitStateAfter = Get-GitWorktreeState
    if ($protectedHashesAfter -cne $protectedHashesBefore) { throw "G3C protected baseline changed while tests were running." }
    if ($gitStateAfter -cne $gitStateBefore) { throw "Git worktree state changed during the G3C suite." }
} finally {
    if (Test-Path -LiteralPath $isolatedTestRoot -PathType Container) {
        $cleanupTarget = (Resolve-Path -LiteralPath $isolatedTestRoot).Path
        $expectedPrefix = [System.IO.Path]::GetFullPath($isolatedParent) + [System.IO.Path]::DirectorySeparatorChar
        if (-not $cleanupTarget.StartsWith($expectedPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw "Refusing to clean an isolated G3C test root outside its approved parent."
        }
        Remove-Item -LiteralPath $cleanupTarget -Recurse -Force
    }
}
if (Test-Path -LiteralPath $isolatedTestRoot) { throw "G3C isolated test root was not cleaned." }

Write-Output "G3C_RULE=MEP_STRUCTURE_CLEARANCE_WARNING_V1"
Write-Output "G3C_THRESHOLD_M=0.05"
Write-Output "G3C_CASE_COUNT=9"
Write-Output "G3C_RECORD_STATUS_COUNTS=WARNING:4,CLEAR:2,NOT_EVALUATED:2,SUPPRESSED:1"
Write-Output "G3C_THRESHOLD_0_49_50_51_MM=PASS"
Write-Output "G3C_ROTATED_OBLIQUE=PASS"
Write-Output "G3C_OPENING_ADJACENT=PASS"
Write-Output "G3C_HARD_CLASH_DEDUPLICATION=PASS"
Write-Output "G3C_FAILURE_CLOSED=2/2"
Write-Output "G3C_INDEPENDENT_TRIANGLE_MESH_REFERENCE=9/9"
Write-Output "G3C_PATH_SHA256_MAPPING=9/9"
Write-Output "G3C_CONTRACT_MUTATIONS_REJECTED=$mutationFailures/4"
Write-Output "G3C_ISOLATED_DETERMINISTIC_REGENERATION=PASS"
Write-Output "G3C_ISOLATED_TEMP_ROOT_CLEANUP=PASS"
Write-Output "G3C_G1_G2_G3A_G3A_R1_G3B_G3B_R1_REGRESSION=PASS"
Write-Output "G3C_GIT_WORKTREE_UNCHANGED=PASS"
Write-Output "G3C_LOCAL_TEST=PASS"
