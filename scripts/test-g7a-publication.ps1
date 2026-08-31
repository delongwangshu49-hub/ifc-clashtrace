[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if ($PSVersionTable.PSVersion.Major -lt 7) { throw 'G7A publication checks require PowerShell 7 or newer.' }

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$publicCandidates = @(
    '.gitignore',
    'BIMCLASH_AGENT_MASTER_PLAN.public.md',
    'PROGRESS_SYNC.md',
    'PROMPTS.md',
    'README.md',
    'development/index.html',
    'docs/content-claim-ledger.md',
    'docs/g7a-production.md',
    'docs/g7a-publication-manifest.md',
    'scripts/test-pg-c.ps1',
    'scripts/test-g7a-publication.ps1',
    'video/g7a/production/r02-superres-qa.md'
)
$masterRelative = 'video/g7a/out/r02-superres/ifc-clashtrace-r02-1440p-master.mp4'
$masterHash = '404c4576e3b315ac99b0fd67ccc0e608d132faa30aef9fa94aff10929889c2b0'

Push-Location $projectRoot
try {
    if (@($publicCandidates | Sort-Object -Unique).Count -ne 12) { throw 'G7A public allowlist must contain exactly 12 unique paths.' }
    foreach ($path in $publicCandidates) {
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing G7A public candidate: $path" }
        if ((Get-Item -LiteralPath $path).Length -gt 1MB) { throw "G7A public candidate exceeds 1 MiB: $path" }
    }

    $master = Get-Item -LiteralPath $masterRelative
    if ($master.Length -ne 23930481) { throw 'Accepted G7A master size changed.' }
    if ((Get-FileHash -Algorithm SHA256 -LiteralPath $masterRelative).Hash.ToLowerInvariant() -cne $masterHash) { throw 'Accepted G7A master hash changed.' }

    $combined = ($publicCandidates | ForEach-Object { Get-Content -LiteralPath $_ -Raw }) -join "`n"
    foreach ($required in @(
        'G7A · PASS',
        'R02_FINAL_USER_ACCEPTED',
        $masterHash,
        '4,990',
        '166.333',
        '4 + 1 + 11 + 72 = 88',
        'strictly greater than 2 mm',
        'less than 50 mm',
        'NOT_EVALUATED',
        'not engineering certification'
    )) {
        if (-not $combined.Contains($required, [StringComparison]::Ordinal)) { throw "G7A public evidence is missing: $required" }
    }

    $development = Get-Content -LiteralPath 'development/index.html' -Raw
    if ($development -notmatch '(?s)data-claim-stage="G7A"[^>]*data-claim-state="closed".*?>PASS<') { throw 'Development page does not close G7A as PASS.' }
    if ($development -notmatch '(?s)data-claim-stage="G7B"[^>]*data-claim-state="closed".*?>PASS<') { throw 'Development page does not close G7B as PASS.' }
    if ($development -notmatch '(?s)data-claim-stage="G7"[^>]*data-claim-state="in-progress".*?>IN PROGRESS<') { throw 'Development page does not expose G7 as in progress.' }

    $localPlan = Get-Content -LiteralPath 'BIMCLASH_AGENT_MASTER_PLAN.md' -Raw
    $publicPlan = Get-Content -LiteralPath 'BIMCLASH_AGENT_MASTER_PLAN.public.md' -Raw
    $legacyReferenceRoot = [IO.Path]::Combine('D:\', 'CODEX-RA')
    $sanitized = $localPlan.Replace($projectRoot, '<PROJECT_ROOT>').Replace($legacyReferenceRoot, '<LEGACY_REFERENCE_ROOT>').TrimEnd()
    if ($sanitized -cne $publicPlan.TrimEnd()) { throw 'Sanitized public master is not equivalent to the local master.' }

    $textCandidates = @($publicCandidates | Where-Object { $_ -ne 'scripts/test-g7a-publication.ps1' -and ([IO.Path]::GetExtension($_) -in @('.md','.html','.ps1') -or $_ -eq '.gitignore') })
    $absolutePathPattern = '(?i)(?:[A-Z]:\\(?:Users|CODEX-RA)|/(?:Users|home)/[^/\s]+)'
    $emailPattern = '(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b'
    $credentialPattern = '(?i)(?:api[_-]?key|access[_-]?token|password|secret)\s*[:=]\s*[A-Za-z0-9_./+\-=]{8,}'
    foreach ($path in $textCandidates) {
        $text = Get-Content -LiteralPath $path -Raw
        if ([regex]::IsMatch($text, $absolutePathPattern) -or [regex]::IsMatch($text, $emailPattern) -or [regex]::IsMatch($text, $credentialPattern)) { throw "Sensitive marker in G7A public candidate: $path" }
    }

    foreach ($path in @('video/g7a/out/example.mp4','video/g7a/public/local/example.wav','video/g7a/production/input/example.mp4','video/g7a/production/qa/example.png','video/g7a/review/media/example.mp4','outputs/local-only/g7a/example.mp4')) {
        git check-ignore -q -- $path
        if ($LASTEXITCODE -ne 0) { throw "G7A binary path is not ignored: $path" }
    }

    'G7A_PUBLIC_CANDIDATES=12/12'
    'G7A_MASTER_HASH=PASS'
    'G7A_STATUS_PARITY=PASS'
    'G7A_LOGIC_EVIDENCE=PASS'
    'G7A_PRIVACY_SCAN=PASS'
    'G7A_BINARY_EXCLUSIONS=PASS'
}
finally {
    Pop-Location
}
