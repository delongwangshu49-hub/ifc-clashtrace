[CmdletBinding()]
param([switch]$SkipRegression)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if ($PSVersionTable.PSVersion.Major -lt 7) { throw 'PG-B requires PowerShell 7 or newer.' }

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $projectRoot
try {
    function Assert-Contains([string]$Text, [string]$Needle, [string]$Message) {
        if (-not $Text.Contains($Needle, [StringComparison]::Ordinal)) { throw $Message }
    }

    $gitStateBefore = (git status --short) -join "`n"
    $assetPath = 'docs/assets/brand/ifc-clashtrace-github-logo.png'
    $manifest = Get-Content -LiteralPath 'docs/assets/brand/asset-manifest.json' -Raw | ConvertFrom-Json
    $readme = Get-Content -LiteralPath 'README.md' -Raw
    $brandAudit = Get-Content -LiteralPath 'docs/pg-b-github-logo.md' -Raw
    $development = Get-Content -LiteralPath 'development/index.html' -Raw

    if ($manifest.status -cne 'TECH_PASS_EXTERNAL_SYNC_PENDING') { throw 'PG-B manifest status drifted.' }
    if ($manifest.asset_type -cne 'static GitHub README logo') { throw 'PG-B asset type drifted.' }
    if ($manifest.canvas.width -ne 1672 -or $manifest.canvas.height -ne 941) { throw 'PG-B canvas dimensions drifted.' }
    if ($manifest.canvas.color_type -cne 'RGBA' -or -not $manifest.canvas.transparency) { throw 'PG-B transparency contract drifted.' }
    if ($manifest.readme.display_width_px -ne 520) { throw 'PG-B README display width drifted.' }
    if ($manifest.motion.gif_usage -ne $false -or @($manifest.motion.animated_assets).Count -ne 0) { throw 'PG-B must not use animated assets.' }

    if (-not (Test-Path -LiteralPath $assetPath -PathType Leaf)) { throw "Missing PG-B asset: $assetPath" }
    $asset = Get-Item -LiteralPath $assetPath
    $record = $manifest.assets.'ifc-clashtrace-github-logo.png'
    if ($asset.Length -ne [long]$record.bytes) { throw 'PG-B static logo size drifted.' }
    if ($asset.Length -ge 1MB) { throw 'PG-B static logo exceeds the 1 MiB budget.' }
    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $assetPath).Hash.ToLowerInvariant()
    if ($hash -cne [string]$record.sha256) { throw 'PG-B static logo hash drifted.' }

    $png = [IO.File]::ReadAllBytes((Resolve-Path $assetPath))
    $signature = [byte[]](137,80,78,71,13,10,26,10)
    for ($index = 0; $index -lt $signature.Length; $index++) {
        if ($png[$index] -ne $signature[$index]) { throw 'Invalid PNG signature.' }
    }
    $width = ([uint32]$png[16] -shl 24) -bor ([uint32]$png[17] -shl 16) -bor ([uint32]$png[18] -shl 8) -bor [uint32]$png[19]
    $height = ([uint32]$png[20] -shl 24) -bor ([uint32]$png[21] -shl 16) -bor ([uint32]$png[22] -shl 8) -bor [uint32]$png[23]
    if ($width -ne 1672 -or $height -ne 941) { throw 'PNG intrinsic dimensions drifted.' }
    if ($png[25] -ne 6) { throw 'PNG must use RGBA color type 6.' }

    $ascii = [Text.Encoding]::ASCII.GetString($png)
    foreach ($forbidden in @('C:\Users\','AppData','Photoshop','XML:com.adobe','xmpmeta','Exif')) {
        if ($ascii.Contains($forbidden, [StringComparison]::OrdinalIgnoreCase)) { throw "Metadata/path marker leaked into static logo: $forbidden" }
    }

    foreach ($required in @(
        'src="docs/assets/brand/ifc-clashtrace-github-logo.png"',
        'width="520"',
        'alt="IFC ClashTrace product logo: a teal pipe crosses two wall panels at a coral collision ring beside an inspection alert."',
        'PG-B is `TECH_PASS_EXTERNAL_SYNC_PENDING`, not `PASS`',
        'docs/pg-b-github-logo.md'
    )) { Assert-Contains $readme $required "README PG-B contract missing: $required" }
    foreach ($forbidden in @('.gif','<picture>','<source','prefers-reduced-motion','ifc-clashtrace-lockup-light')) {
        if ($readme.Contains($forbidden, [StringComparison]::OrdinalIgnoreCase)) { throw "README retains cancelled animation markup: $forbidden" }
    }

    foreach ($required in @(
        'Status: `TECH_PASS_EXTERNAL_SYNC_PENDING`',
        'Latest closed checkpoint: `PG-C · PASS`',
        '1672 × 941',
        'RGBA',
        '468,496 bytes',
        'GIF usage is cancelled',
        'action-time authorization',
        'No Sites, permission, key, public-access, PG-E, VG, G7, or video action'
    )) { Assert-Contains $brandAudit $required "PG-B audit contract missing: $required" }

    foreach ($obsolete in @(
        'docs/assets/brand/ifc-clashtrace-lockup-light.gif',
        'docs/assets/brand/ifc-clashtrace-lockup-light.png',
        'docs/assets/brand/source/ifc-clashtrace-logo-light-input.png',
        'docs/assets/brand/source/layers-v2',
        'scripts/build-pg-b-assets.py',
        'docs/pg-b-brand-motion.md'
    )) {
        if (Test-Path -LiteralPath $obsolete) { throw "Cancelled PG-B artifact remains: $obsolete" }
    }

    $activePgB = [regex]::Match($development, '(?s)<li[^>]*data-claim-stage="PG-B"[^>]*data-claim-state="in_progress"[^>]*>(.*?)</li>')
    if (-not $activePgB.Success -or $activePgB.Value -notmatch '>LOCAL CANDIDATE<') { throw 'Development page does not show the bounded PG-B local candidate.' }
    foreach ($required in @('静态产品标','static product mark','不再使用 GIF','no longer uses GIF')) {
        Assert-Contains $activePgB.Value $required "Development PG-B static-logo wording missing: $required"
    }
    if ($activePgB.Value -match '>PASS<') { throw 'Development page overstates PG-B as PASS.' }

    if (-not $SkipRegression) {
        & pwsh -NoLogo -NoProfile -File 'scripts/test-pg-c.ps1' -SkipRegression
        if ($LASTEXITCODE -ne 0) { throw 'PG-C claim regression failed during PG-B.' }
    }

    $gitStateAfter = (git status --short) -join "`n"
    if ($gitStateAfter -cne $gitStateBefore) { throw 'Git worktree state changed during the PG-B suite.' }

    'PGB_STATIC_GITHUB_LOGO=PASS'
    'PGB_CANVAS=1672x941'
    'PGB_COLOR_TYPE=RGBA'
    'PGB_GIF_USAGE=ABSENT'
    'PGB_BINARY_IDENTITY=PASS'
    'PGB_METADATA_SCAN=PASS'
    'PGB_README_ALT_AND_SCALE=PASS'
    'PGB_PUBLIC_ASSET_MAX_LT_1MIB=PASS'
    'PGB_STATUS=TECH_PASS_EXTERNAL_SYNC_PENDING'
}
finally {
    Pop-Location
}
