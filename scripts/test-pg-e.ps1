[CmdletBinding()]
param([switch]$SkipRegression)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if ($PSVersionTable.PSVersion.Major -lt 7) { throw 'PG-E requires PowerShell 7 or newer.' }

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $projectRoot
try {
    $pythonExe = Join-Path $projectRoot '.venv/Scripts/python.exe'
    $nodeExe = Join-Path $projectRoot '.tools/node-v24.19.0-win-x64/node.exe'
    foreach ($path in @($pythonExe,$nodeExe)) {
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing project-local runtime: $path" }
    }

    function Get-GitState {
        $state = @(git status --porcelain=v1 --untracked-files=all)
        if ($LASTEXITCODE -ne 0) { throw 'Unable to read Git worktree state.' }
        return $state -join "`n"
    }

    function Get-Hash([string]$Path) {
        return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
    }

    function New-IsolatedRoot([string]$Parent) {
        $parentFull = [IO.Path]::GetFullPath($Parent)
        $root = [IO.Path]::GetFullPath((Join-Path $parentFull ([guid]::NewGuid().ToString('N'))))
        $prefix = $parentFull + [IO.Path]::DirectorySeparatorChar
        if (-not $root.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) {
            throw 'Refusing to create a PG-E generation root outside outputs/local-only.'
        }
        New-Item -ItemType Directory -Path $root -Force | Out-Null
        return $root
    }

    $gitStateBefore = Get-GitState
    $ledgerPath = 'data/pg-e-operation-ledger.json'
    $manifestPath = 'data/pg-e-manifest.json'
    $baselinePath = 'data/ground-truth/pg-e-sentinel-baseline.json'
    $uatRecordPath = 'data/pg-e-uat-record.json'
    $documentPath = 'docs/pg-e-engineering-uat.md'
    foreach ($path in @($ledgerPath,$manifestPath,$baselinePath,$uatRecordPath,$documentPath)) {
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing PG-E contract file: $path" }
    }

    $ledger = Get-Content -LiteralPath $ledgerPath -Raw | ConvertFrom-Json
    $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    $baseline = Get-Content -LiteralPath $baselinePath -Raw | ConvertFrom-Json
    $uatRecord = Get-Content -LiteralPath $uatRecordPath -Raw | ConvertFrom-Json
    $document = Get-Content -LiteralPath $documentPath -Raw
    if ($ledger.dataset_id -cne 'IFC_CLASHTRACE_ENGINEERING_CONTEXT_PGE_V2' -or
        $manifest.dataset_id -cne $ledger.dataset_id -or $baseline.dataset_id -cne $ledger.dataset_id) {
        throw 'PG-E dataset identity drifted.'
    }
    if ($ledger.origin -cne 'programmatically_generated' -or $ledger.license_spdx_or_name -cne 'CC0-1.0' -or
        -not $ledger.redistribution_permitted -or $manifest.license_spdx_or_name -cne 'CC0-1.0') {
        throw 'PG-E origin, license, or redistribution contract drifted.'
    }
    if ($manifest.schema -cne 'IFC4' -or $manifest.length_unit -cne 'metre' -or
        $manifest.coordinate_system -cne 'shared_project_coordinates') {
        throw 'PG-E input boundary drifted.'
    }
    if ($manifest.counts.pipe_segments -ne 8 -or $manifest.counts.walls -ne 8 -or
        $manifest.counts.beams -ne 3 -or $manifest.counts.structures -ne 11 -or
        $manifest.counts.rule_structures -ne 11 -or $manifest.counts.columns -ne 6 -or
        $manifest.counts.slabs -ne 1 -or $manifest.counts.context_elements -ne 7 -or
        $manifest.counts.grid_axes -ne 7 -or $manifest.counts.display_elements -ne 26 -or
        $manifest.counts.candidate_pairs -ne 88 -or $manifest.counts.sentinels -ne 6) {
        throw 'PG-E element, pair, or sentinel counts drifted.'
    }
    if (@($ledger.engineering_context.footprint_m) -join ',' -cne '12,8' -or
        [double]$ledger.engineering_context.floor_to_floor_height_m -ne 3.2 -or
        @($ledger.grid.u_axes).Count -ne 3 -or @($ledger.grid.v_axes).Count -ne 4) {
        throw 'PG-E realistic one-storey planning context drifted.'
    }
    if ($baseline.sentinel_count -ne 6 -or @($baseline.sentinels).Count -ne 6) {
        throw 'PG-E must freeze exactly six independently authored sentinels.'
    }
    if ($uatRecord.gate -cne 'PG-E' -or $uatRecord.status -cne 'PASS') {
        throw 'PG-E structured UAT status drifted.'
    }
    $requiredUserChecks = @(
        'building_realism','example_selector_load_and_run','s01_wall_clash','s02_49mm_warning',
        's03_50mm_non_warning_boundary','s04_200mm_clearance','s05_beam_clash',
        's06_missing_geometry_failure_closed','evidence_drawer_and_3d_focus',
        'retry_cancel_and_stale_state_invalidation','language_experience_and_theme_matrix',
        'console_clean','performance_acceptable'
    )
    foreach ($check in $requiredUserChecks) {
        if ($check -notin @($uatRecord.required_user_checks.PSObject.Properties.Name)) { throw "PG-E UAT check is missing: $check" }
        if ($uatRecord.required_user_checks.$check -ne $true) { throw "PG-E final UAT check is not PASS: $check" }
    }
    if ($uatRecord.required_target.sites_version -ne 11 -or
        $uatRecord.required_target.deployment_id -cne 'appgdep_6a942076ec308191a41d58f4cf02cf3e' -or
        $uatRecord.required_target.gitHub_head -cne '3038d431157c0e1eb1e1f2b4a9870ddb01609921' -or
        $uatRecord.user_acceptance.decision -cne 'PASS' -or
        [string]::IsNullOrWhiteSpace([string]$uatRecord.user_acceptance.confirmed_at) -or
        $uatRecord.observations.tester_confirmation -ne $true -or
        $uatRecord.observations.elapsed_ms -ne 5569 -or
        @($uatRecord.observations.repair_and_retest_evidence).Count -lt 5) {
        throw 'PG-E final hosted target or acceptance evidence drifted.'
    }
    if ($uatRecord.prior_automated_preflight.functional_sites_version -ne 9 -or
        $uatRecord.prior_automated_preflight.evidence_tail_sites_version -ne 10 -or
        $uatRecord.prior_automated_preflight.candidate_records -ne 88 -or
        $uatRecord.prior_automated_preflight.evaluated_records -ne 77 -or
        $uatRecord.prior_automated_preflight.not_evaluated -ne 11) {
        throw 'PG-E prior hosted preflight evidence drifted.'
    }
    $expectedSentinels = @(
        'S01-WALL-CLASH','S02-WARNING-49MM','S03-BOUNDARY-50MM',
        'S04-SAFE-200MM','S05-BEAM-CLASH','S06-FAILURE-CLOSED'
    )
    if (Compare-Object $expectedSentinels @($baseline.sentinels.sentinel_id)) { throw 'PG-E sentinel IDs drifted.' }
    $sentinelById = @{}
    foreach ($sentinel in $baseline.sentinels) { $sentinelById[$sentinel.sentinel_id] = $sentinel }
    if ($sentinelById.'S02-WARNING-49MM'.expected_clearance_status -cne 'WARNING' -or
        [math]::Abs([double]$sentinelById.'S02-WARNING-49MM'.expected_clearance_m - 0.049) -gt 1e-12) {
        throw 'PG-E 49 mm warning sentinel drifted.'
    }
    if ($sentinelById.'S03-BOUNDARY-50MM'.expected_clearance_status -cne 'CLEAR' -or
        [double]$sentinelById.'S03-BOUNDARY-50MM'.expected_clearance_m -lt 0.05 -or
        [double]$sentinelById.'S03-BOUNDARY-50MM'.expected_clearance_m -gt 0.05000002) {
        throw 'PG-E 50 mm boundary sentinel drifted.'
    }
    if ($sentinelById.'S06-FAILURE-CLOSED'.expected_hard_status -cne 'NOT_EVALUATED' -or
        $sentinelById.'S06-FAILURE-CLOSED'.expected_clearance_status -cne 'NOT_EVALUATED') {
        throw 'PG-E failure-closed sentinel drifted.'
    }

    $protectedPaths = @($ledgerPath,$manifestPath,$baselinePath,$uatRecordPath)
    $ifcPaths = @()
    foreach ($file in $manifest.files) {
        if ([IO.Path]::IsPathRooted([string]$file.path)) { throw "PG-E manifest path is absolute: $($file.path)" }
        if (-not (Test-Path -LiteralPath $file.path -PathType Leaf)) { throw "Missing PG-E IFC: $($file.path)" }
        if ((Get-Item -LiteralPath $file.path).Length -ne [long]$file.bytes) { throw "PG-E file size drifted: $($file.path)" }
        if ((Get-Hash $file.path) -cne [string]$file.sha256) { throw "PG-E file hash drifted: $($file.path)" }
        if (-not $document.Contains([string]$file.path, [StringComparison]::Ordinal) -or
            -not $document.Contains([string]$file.sha256, [StringComparison]::Ordinal)) {
            throw "PG-E UAT document does not carry the current file identity: $($file.path)"
        }
        $text = Get-Content -LiteralPath $file.path -Raw
        foreach ($required in @('FILE_SCHEMA((''IFC4''))','CC0-1.0','IFCBUILDINGSTOREY(','IFCSITE(','IFCBUILDING(')) {
            if (-not $text.Contains($required, [StringComparison]::Ordinal)) { throw "PG-E IFC contract marker missing from $($file.path): $required" }
        }
        $driveProjectMarker = 'D:' + '\CODEX-RA'
        $windowsUserMarker = 'C:' + '\Users' + '\'
        foreach ($forbidden in @($driveProjectMarker,$windowsUserMarker,'@')) {
            if ($text.Contains($forbidden, [StringComparison]::OrdinalIgnoreCase)) { throw "PG-E IFC privacy marker detected in $($file.path): $forbidden" }
        }
        $ifcPaths += [string]$file.path
    }
    $protectedPaths += $ifcPaths
    $mepText = Get-Content -LiteralPath ($manifest.files | Where-Object role -eq 'mep').path -Raw
    $structureText = Get-Content -LiteralPath ($manifest.files | Where-Object role -eq 'structure').path -Raw
    if ([regex]::Matches($mepText, '=IFCPIPESEGMENT\(').Count -ne 8 -or
        [regex]::Matches($structureText, '=IFCWALL\(').Count -ne 8 -or
        [regex]::Matches($structureText, '=IFCBEAM\(').Count -ne 3 -or
        [regex]::Matches($structureText, '=IFCCOLUMN\(').Count -ne 6 -or
        [regex]::Matches($structureText, '=IFCSLAB\(').Count -ne 1 -or
        [regex]::Matches($structureText, '=IFCGRID\(').Count -ne 1 -or
        [regex]::Matches($structureText, '=IFCGRIDAXIS\(').Count -ne 7) {
        throw 'PG-E IFC entity counts drifted.'
    }
    foreach ($required in @(
        'Status: `PASS`',
        'User acceptance decision: PASS',
        'owner-only Sites version 11',
        '3038d431157c0e1eb1e1f2b4a9870ddb01609921',
        'all 30 authorized paths match'
    )) {
        if (-not $document.Contains($required, [StringComparison]::Ordinal)) { throw "PG-E UAT stop gate drifted: $required" }
    }

    $hashesBefore = @{}
    foreach ($path in $protectedPaths) { $hashesBefore[$path] = Get-Hash $path }
    $isolatedParent = Join-Path $projectRoot 'outputs/local-only/pg-e/generation-tests'
    $isolatedRoot = New-IsolatedRoot $isolatedParent
    $runOne = Join-Path $isolatedRoot 'run-1'
    $runTwo = Join-Path $isolatedRoot 'run-2'
    try {
        foreach ($run in @($runOne,$runTwo)) {
            & $pythonExe 'scripts/pg-e-generate-engineering.py' --output-root $run | Out-Null
            if ($LASTEXITCODE -ne 0) { throw 'PG-E isolated generation failed.' }
        }
        foreach ($relativePath in @(
            'data/generated/pg-e/pg-e-engineering-mep.ifc',
            'data/generated/pg-e/pg-e-engineering-structure.ifc',
            'data/pg-e-manifest.json',
            'data/ground-truth/pg-e-sentinel-baseline.json'
        )) {
            $committed = Join-Path $projectRoot $relativePath
            $first = Join-Path $runOne $relativePath
            $second = Join-Path $runTwo $relativePath
            if ((Get-Hash $committed) -cne (Get-Hash $first) -or (Get-Hash $first) -cne (Get-Hash $second)) {
                throw "PG-E isolated regeneration is not byte deterministic: $relativePath"
            }
        }
    }
    finally {
        if (Test-Path -LiteralPath $isolatedRoot -PathType Container) {
            $resolved = (Resolve-Path -LiteralPath $isolatedRoot).Path
            $requiredPrefix = [IO.Path]::GetFullPath($isolatedParent) + [IO.Path]::DirectorySeparatorChar
            if (-not $resolved.StartsWith($requiredPrefix, [StringComparison]::OrdinalIgnoreCase)) {
                throw 'Refusing PG-E cleanup outside outputs/local-only.'
            }
            Remove-Item -LiteralPath $resolved -Recurse -Force
        }
    }

    & $nodeExe 'scripts/pg-e-evaluate.mjs' | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'PG-E shipped-core evaluation failed.' }
    $evaluation = Get-Content -LiteralPath 'outputs/local-only/pg-e/technical-evaluation.json' -Raw | ConvertFrom-Json
    if ($evaluation.status -cne 'PASS' -or -not $evaluation.deterministic_across_repeats -or
        $evaluation.sentinel_exact_matches -ne 6 -or $evaluation.pair_count -ne 88) {
        throw 'PG-E technical evaluation contract failed.'
    }

    if (-not $SkipRegression) {
        & pwsh -NoLogo -NoProfile -File 'scripts/test-pg-b.ps1' -SkipRegression
        if ($LASTEXITCODE -ne 0) { throw 'PG-B regression failed during PG-E.' }
        & pwsh -NoLogo -NoProfile -File 'scripts/test-pg-c.ps1' -SkipRegression
        if ($LASTEXITCODE -ne 0) { throw 'PG-C/G6 regression failed during PG-E.' }
    }

    foreach ($path in $protectedPaths) {
        if ((Get-Hash $path) -cne $hashesBefore[$path]) { throw "PG-E test mutated protected baseline: $path" }
    }
    if ((Get-GitState) -cne $gitStateBefore) { throw 'PG-E test changed the Git worktree.' }

    'PGE_ORIGIN=PROGRAMMATICALLY_GENERATED'
    'PGE_LICENSE=CC0-1.0'
    'PGE_SPATIAL_CONTEXT=SITE/BUILDING/ONE_STOREY/12M_X_8M'
    'PGE_ELEMENTS=PIPES:8,WALLS:8,BEAMS:3,COLUMNS:6,SLABS:1,GRID_AXES:7'
    'PGE_CANDIDATE_PAIRS=88'
    'PGE_SENTINEL_MATCH=6/6'
    'PGE_BOUNDARIES=CLASH,49MM_WARNING,50MM_CLEAR,200MM_CLEAR,FAILURE_CLOSED'
    'PGE_ISOLATED_DETERMINISTIC_REGENERATION=PASS'
    'PGE_USER_UAT=PASS'
    'PGE_TECHNICAL_CONTRACT=PASS'
}
finally {
    Pop-Location
}
