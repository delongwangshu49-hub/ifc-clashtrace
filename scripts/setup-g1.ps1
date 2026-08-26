[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ((Get-Location).Path -ne $projectRoot) {
    throw "Run this script from the project root."
}

$nodeVersion = "24.19.0"
$nodeArchiveName = "node-v$nodeVersion-win-x64.zip"
$nodeDistBase = "https://nodejs.org/dist/v$nodeVersion"
$downloadDirectory = Join-Path $projectRoot "tmp/g1-runtime"
$toolsDirectory = Join-Path $projectRoot ".tools"
$nodeDirectory = Join-Path $toolsDirectory "node-v$nodeVersion-win-x64"
$nodeArchivePath = Join-Path $downloadDirectory $nodeArchiveName
$nodeSumsPath = Join-Path $downloadDirectory "SHASUMS256.txt"
$pythonEnvironment = Join-Path $projectRoot ".venv"

New-Item -ItemType Directory -Force -Path $downloadDirectory, $toolsDirectory | Out-Null

if (-not (Test-Path -LiteralPath (Join-Path $nodeDirectory "node.exe"))) {
    Invoke-WebRequest -Uri "$nodeDistBase/$nodeArchiveName" -OutFile $nodeArchivePath
    Invoke-WebRequest -Uri "$nodeDistBase/SHASUMS256.txt" -OutFile $nodeSumsPath

    $expectedLine = Get-Content -LiteralPath $nodeSumsPath | Where-Object { $_ -match "\s+$([regex]::Escape($nodeArchiveName))$" }
    if (@($expectedLine).Count -ne 1) {
        throw "Could not resolve exactly one official SHA-256 entry for $nodeArchiveName."
    }

    $expectedHash = ($expectedLine -split "\s+")[0].ToLowerInvariant()
    $actualHash = (Get-FileHash -LiteralPath $nodeArchivePath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualHash -ne $expectedHash) {
        throw "Node.js archive SHA-256 verification failed."
    }

    Expand-Archive -LiteralPath $nodeArchivePath -DestinationPath $toolsDirectory
}

if (-not (Test-Path -LiteralPath (Join-Path $pythonEnvironment "Scripts/python.exe"))) {
    python -m venv $pythonEnvironment
}

$venvPython = Join-Path $pythonEnvironment "Scripts/python.exe"
& $venvPython -m pip install --disable-pip-version-check --requirement (Join-Path $projectRoot "requirements-g1.txt")

$nodeExe = Join-Path $nodeDirectory "node.exe"
$npmCmd = Join-Path $nodeDirectory "npm.cmd"
& $npmCmd install --ignore-scripts --no-audit --no-fund --cache (Join-Path $projectRoot "tmp/npm-cache")
& $nodeExe --version
& $npmCmd --version
& $venvPython -c "import ifcopenshell; print(ifcopenshell.version)"

Write-Output "NODE_DIRECTORY=$nodeDirectory"
