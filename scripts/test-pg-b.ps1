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

    function Assert-Sequence([object[]]$Actual, [object[]]$Expected, [string]$Message) {
        if ($Actual.Count -ne $Expected.Count) { throw $Message }
        for ($index = 0; $index -lt $Expected.Count; $index++) {
            if ([int]$Actual[$index] -ne [int]$Expected[$index]) { throw $Message }
        }
    }

    $gitStateBefore = (git status --short) -join "`n"
    $assetPath = 'docs/assets/brand/ifc-clashtrace-github-logo.png'
    $manifest = Get-Content -LiteralPath 'docs/assets/brand/asset-manifest.json' -Raw | ConvertFrom-Json
    $readme = Get-Content -LiteralPath 'README.md' -Raw
    $brandAudit = Get-Content -LiteralPath 'docs/pg-b-github-logo.md' -Raw
    $development = Get-Content -LiteralPath 'development/index.html' -Raw

    if ($manifest.gate -cne 'PG-B-R1' -or $manifest.status -cne 'PASS') { throw 'PG-B-R1 manifest status drifted.' }
    if ($manifest.asset_type -cne 'static GitHub README logo') { throw 'PG-B asset type drifted.' }
    if ($manifest.canvas.width -ne 1024 -or $manifest.canvas.height -ne 1024) { throw 'PG-B canvas dimensions drifted.' }
    if ($manifest.canvas.color_type -cne 'RGBA' -or -not $manifest.canvas.transparency) { throw 'PG-B transparency contract drifted.' }
    Assert-Sequence @($manifest.canvas.alpha_bounds) @(84,220,938,802) 'PG-B alpha bounds drifted.'
    if ($manifest.readme.display_width_px -ne 420) { throw 'PG-B README display width drifted.' }
    if ($manifest.motion.gif_usage -ne $false -or @($manifest.motion.animated_assets).Count -ne 0) { throw 'PG-B must not use animated assets.' }

    Assert-Sequence @($manifest.local_render.desktop.rendered_image) @(420,420) 'PG-B local desktop render evidence drifted.'
    Assert-Sequence @($manifest.local_render.narrow.rendered_image) @(328,328) 'PG-B local narrow render evidence drifted.'
    Assert-Sequence @($manifest.local_render.natural_image) @(1024,1024) 'PG-B local natural-size evidence drifted.'
    Assert-Sequence @($manifest.previous_public_evidence.natural_image) @(1672,941) 'PG-B historical v1 natural size drifted.'
    if ($manifest.previous_public_evidence.verified_technical_chain_tip -cne 'b4ce6d56282111c585f757042fa7cfefc057da0e' -or
        $manifest.previous_public_evidence.verified_status_tail_parent_tip -cne '6f58bf246fc53cdc5d06a0dd61175cd24d1e3993' -or
        $manifest.previous_public_evidence.mapped_public_paths -ne 12) { throw 'PG-B historical public evidence drifted.' }
    if ($manifest.remote_render.github_technical_chain_tip -cne 'b3b03046982011567f1108967dd84672cfad69bd' -or
        $manifest.remote_render.mapped_public_paths -ne 29) { throw 'PG-B-R1 remote mapping evidence drifted.' }
    Assert-Sequence @($manifest.remote_render.desktop.rendered_image) @(420,420) 'PG-B remote desktop rendering drifted.'
    Assert-Sequence @($manifest.remote_render.desktop.natural_image) @(1024,1024) 'PG-B remote desktop natural size drifted.'
    if ([math]::Abs([double]$manifest.remote_render.narrow.rendered_image[0] - 279.3333) -gt 0.001 -or
        [math]::Abs([double]$manifest.remote_render.narrow.rendered_image[1] - 279.3333) -gt 0.001 -or
        $manifest.remote_render.narrow.document_scroll_width -ne 345) { throw 'PG-B remote narrow rendering drifted.' }
    if ($manifest.external_update.v2_upload_authorized -ne $true -or
        $manifest.external_update.github_mapping_verified -ne $true -or
        $manifest.external_update.sites_update_authorized -ne $true -or
        $manifest.external_update.sites_version -ne 9 -or
        $manifest.external_update.sites_deployment_id -cne 'appgdep_6a9410376c248191952546a2416970fc' -or
        $manifest.external_update.sites_access -cne 'owner-only private') { throw 'PG-B-R1 external closure evidence drifted.' }

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
    if ($width -ne 1024 -or $height -ne 1024) { throw 'PNG intrinsic dimensions drifted.' }
    if ($png[25] -ne 6) { throw 'PNG must use RGBA color type 6.' }

    $ascii = [Text.Encoding]::ASCII.GetString($png)
    $absoluteUserRootMarker = 'C:' + '\Users\'
    foreach ($forbidden in @($absoluteUserRootMarker,'AppData','Photoshop','XML:com.adobe','xmpmeta','Exif')) {
        if ($ascii.Contains($forbidden, [StringComparison]::OrdinalIgnoreCase)) { throw "Metadata/path marker leaked into static logo: $forbidden" }
    }

    foreach ($required in @(
        'src="docs/assets/brand/ifc-clashtrace-github-logo.png"',
        'width="420"',
        'alt="IFC ClashTrace product logo: a metallic pipe crosses layered wall panels beside an outlined clash marker and inspection alert."',
        'PG-B remains the latest closed presentation-readiness checkpoint',
        'Logo v2 replacement independently closed as `PG-B-R1 PASS`',
        'docs/pg-b-github-logo.md'
    )) { Assert-Contains $readme $required "README PG-B contract missing: $required" }
    foreach ($forbidden in @('.gif','<picture>','<source','prefers-reduced-motion','ifc-clashtrace-lockup-light')) {
        if ($readme.Contains($forbidden, [StringComparison]::OrdinalIgnoreCase)) { throw "README retains cancelled animation markup: $forbidden" }
    }

    foreach ($required in @(
        'Status: `PG-B PASS / PG-B-R1 PASS`',
        'Latest closed checkpoint: `PG-B · PASS`',
        '1024 × 1024',
        'RGBA',
        '45,662 bytes',
        'GIF usage is cancelled',
        'All 29 authorized publication paths match',
        'Google Chrome renders the logo at 420 × 420',
        'owner-only Sites version 9'
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

    $closedPgB = [regex]::Match($development, '(?s)<li[^>]*data-claim-stage="PG-B"[^>]*data-claim-state="closed"[^>]*>(.*?)</li>')
    if (-not $closedPgB.Success -or $closedPgB.Value -notmatch '>PASS<') { throw 'Development page does not show PG-B as closed.' }
    foreach ($required in @('透明 Logo v2','transparent Logo v2','仍无 GIF','still with no GIF')) {
        Assert-Contains $closedPgB.Value $required "Development PG-B static-logo wording missing: $required"
    }

    if (-not $SkipRegression) {
        & pwsh -NoLogo -NoProfile -File 'scripts/test-pg-c.ps1' -SkipRegression
        if ($LASTEXITCODE -ne 0) { throw 'PG-C claim regression failed during PG-B.' }
    }

    $gitStateAfter = (git status --short) -join "`n"
    if ($gitStateAfter -cne $gitStateBefore) { throw 'Git worktree state changed during the PG-B suite.' }

    'PGB_STATIC_GITHUB_LOGO=PASS'
    'PGB_CANVAS=1024x1024'
    'PGB_COLOR_TYPE=RGBA'
    'PGB_GIF_USAGE=ABSENT'
    'PGB_BINARY_IDENTITY=PASS'
    'PGB_METADATA_SCAN=PASS'
    'PGB_README_ALT_AND_SCALE=PASS'
    'PGB_PUBLIC_ASSET_MAX_LT_1MIB=PASS'
    'PGB_MANIFEST_EVIDENCE_FIELDS=PASS'
    'PGB_PREVIOUS_REMOTE_EVIDENCE_DECLARED=12/12'
    'PGB_V2_REMOTE_LIVE_CHECK=PASS'
    'PGB_PUBLIC_MAPPING=29/29'
    'PGB_STATUS=PASS'
}
finally {
    Pop-Location
}
