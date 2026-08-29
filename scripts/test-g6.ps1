[CmdletBinding()]
param([switch]$SkipRegression)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if ($PSVersionTable.PSVersion.Major -lt 7) { throw 'G6 requires PowerShell 7 or newer.' }

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$nodeExe = Join-Path $projectRoot '.tools/node-v24.19.0-win-x64/node.exe'
$viteCli = Join-Path $projectRoot 'node_modules/vite/bin/vite.js'
$npmExe = Join-Path $projectRoot '.tools/node-v24.19.0-win-x64/npm.cmd'
$outputRoot = Join-Path $projectRoot 'outputs/local-only/g6'
if (-not (Test-Path -LiteralPath $nodeExe -PathType Leaf)) { throw 'Project-local Node.js runtime is missing.' }
if (-not (Test-Path -LiteralPath $viteCli -PathType Leaf)) { throw 'Run npm install before the G6 test.' }
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null

Push-Location $projectRoot
try {
    & $nodeExe 'scripts/g6-generate-license-inventory.mjs'
    if ($LASTEXITCODE -ne 0) { throw 'Dependency license inventory generation failed.' }
    & $nodeExe 'scripts/g6-prepare-build.mjs'
    if ($LASTEXITCODE -ne 0) { throw 'G6 static-input preparation failed.' }
    & $nodeExe $viteCli 'build'
    if ($LASTEXITCODE -ne 0) { throw 'G6 client build failed.' }
    & $nodeExe $viteCli 'build' '--config' 'vite.worker.config.mjs'
    if ($LASTEXITCODE -ne 0) { throw 'G6 Worker build failed.' }

    $requiredArtifacts = @('dist/client/index.html','dist/client/app/index.html','dist/client/development/index.html','dist/server/index.js','dist/.openai/hosting.json','dist/client/node_modules/web-ifc/web-ifc.wasm','dist/client/docs/data-and-licenses.md','dist/client/LICENSE')
    foreach ($relativePath in $requiredArtifacts) {
        if (-not (Test-Path -LiteralPath (Join-Path $projectRoot $relativePath) -PathType Leaf)) { throw "Missing G6 build artifact: $relativePath" }
    }
    foreach ($caseNumber in 1..8) {
        $stem = 'c{0:d2}' -f $caseNumber
        foreach ($role in @('mep', 'structure')) {
            if (-not (Test-Path -LiteralPath (Join-Path $projectRoot "dist/client/data/generated/g2/$stem-$role.ifc") -PathType Leaf)) { throw "Missing deployed controlled IFC: $stem-$role" }
        }
    }
    if (Get-ChildItem -LiteralPath (Join-Path $projectRoot 'dist') -Recurse -File -Filter '*.map') { throw 'Source maps must not be present in the G6 artifact.' }
    $unexpectedDistEntries = @(Get-ChildItem -LiteralPath (Join-Path $projectRoot 'dist') -Force | Where-Object Name -notin @('.openai', 'client', 'server'))
    if ($unexpectedDistEntries.Count -ne 0) { throw "Unexpected stale G6 distribution entry: $($unexpectedDistEntries.Name -join ', ')" }

    $hosting = Get-Content -LiteralPath (Join-Path $projectRoot 'dist/.openai/hosting.json') -Raw | ConvertFrom-Json -AsHashtable
    foreach ($key in $hosting.Keys) {
        if ($key -notin @('project_id', 'd1', 'r2', 'capabilities')) { throw "Unexpected hosting metadata key: $key" }
    }

    $browserText = (Get-ChildItem -LiteralPath (Join-Path $projectRoot 'dist/client/assets') -File | ForEach-Object {
        if ($_.Extension -in @('.js', '.css', '.html')) { Get-Content -LiteralPath $_.FullName -Raw }
    }) -join "`n"
    foreach ($prohibited in @('api.groq.com', 'Authorization', 'GROQ_API_KEY', 'gsk_')) {
        if ($browserText -cmatch ([regex]::Escape($prohibited))) { throw "Browser bundle contains prohibited server material: $prohibited" }
    }

    & $nodeExe 'scripts/g6-worker-tests.mjs'
    if ($LASTEXITCODE -ne 0) { throw 'G6 Worker boundary tests failed.' }
    & $nodeExe 'scripts/g6-verify-media.mjs'
    if ($LASTEXITCODE -ne 0) { throw 'G6 media audit failed.' }

    $licenseInventory = Get-Content -LiteralPath (Join-Path $projectRoot 'docs/dependency-licenses.json') -Raw | ConvertFrom-Json
    if ($licenseInventory.package_count -ne $licenseInventory.packages.Count -or $licenseInventory.package_count -lt 1) { throw 'Dependency license inventory count is invalid.' }
    if ($licenseInventory.packages | Where-Object { [string]::IsNullOrWhiteSpace($_.license) }) { throw 'A locked dependency is missing license metadata.' }

    $auditJson = & $npmExe 'audit' '--json' 2>$null
    if ($LASTEXITCODE -ne 0) { throw 'npm audit reported a vulnerability.' }
    $audit = $auditJson | ConvertFrom-Json
    if ($audit.metadata.vulnerabilities.total -ne 0) { throw 'npm audit vulnerability count is not zero.' }

    $previewStdout = Join-Path $outputRoot 'preview.stdout.log'
    $previewStderr = Join-Path $outputRoot 'preview.stderr.log'
    $previewProcess = Start-Process -FilePath $nodeExe -ArgumentList @($viteCli, 'preview', '--outDir', 'dist/client', '--host', '127.0.0.1', '--port', '4173', '--strictPort') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput $previewStdout -RedirectStandardError $previewStderr -PassThru
    try {
        $ready = $false
        foreach ($attempt in 1..40) {
            try {
                $response = Invoke-WebRequest -Uri 'http://127.0.0.1:4173/' -TimeoutSec 2 -SkipHttpErrorCheck
                if ($response.StatusCode -eq 200) { $ready = $true; break }
            } catch { Start-Sleep -Milliseconds 250 }
        }
        if (-not $ready) { throw 'Private local preview did not become ready.' }
        foreach ($route in @('/', '/app/', '/development/', '/node_modules/web-ifc/web-ifc.wasm', '/data/generated/g2/c01-mep.ifc')) {
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:4173$route" -TimeoutSec 10 -SkipHttpErrorCheck
            if ($response.StatusCode -ne 200) { throw "Private preview route failed: $route" }
        }
    } finally {
        if (-not $previewProcess.HasExited) { Stop-Process -Id $previewProcess.Id -Force }
    }

    if (-not $SkipRegression) {
        & pwsh -NoLogo -NoProfile -File 'scripts/test-g4ai.ps1'
        if ($LASTEXITCODE -ne 0) { throw 'G4AI regression failed during G6.' }
        & pwsh -NoLogo -NoProfile -File 'scripts/test-g5.ps1'
        if ($LASTEXITCODE -ne 0) { throw 'G5 regression failed during G6.' }
    }

    'G6_BUILD PASS'
    'G6_PRIVATE_LOCAL_PREVIEW PASS'
    'G6_LICENSE_INVENTORY PASS'
    'G6_MEDIA_METADATA PASS'
    'G6_AI_FAIL_CLOSED PASS'
    'G6_LOCAL_TEST PASS'
} finally {
    Pop-Location
}
