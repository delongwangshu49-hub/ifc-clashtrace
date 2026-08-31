[CmdletBinding()]
param([switch]$RequireLocalMaster)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
}

function Read-Utf8 {
    param([string]$Path)
    return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

$masterPath = Join-Path $root 'video/g7a/out/r02-superres/ifc-clashtrace-r02-1440p-master.mp4'
$thumbnailPath = Join-Path $root 'video/g7b/ifc-clashtrace-youtube-thumbnail.png'
$enPath = Join-Path $root 'video/g7b/ifc-clashtrace-r02.en.srt'
$zhPath = Join-Path $root 'video/g7b/ifc-clashtrace-r02.zh-CN.srt'
$recordPath = Join-Path $root 'docs/g7b-youtube-publication.md'
$submissionPath = Join-Path $root 'docs/g7b-submission-materials.md'

foreach ($path in @($thumbnailPath, $enPath, $zhPath, $recordPath, $submissionPath)) {
    Assert-True (Test-Path -LiteralPath $path -PathType Leaf) "Missing required G7B file: $path"
}

if ($RequireLocalMaster) {
    Assert-True (Test-Path -LiteralPath $masterPath -PathType Leaf) "Missing required local G7A master: $masterPath"
}
if (Test-Path -LiteralPath $masterPath -PathType Leaf) {
    $masterHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $masterPath).Hash.ToLowerInvariant()
    Assert-True ($masterHash -eq '404c4576e3b315ac99b0fd67ccc0e608d132faa30aef9fa94aff10929889c2b0') 'Accepted master hash mismatch.'
    Assert-True ((Get-Item -LiteralPath $masterPath).Length -eq 23930481) 'Accepted master byte size mismatch.'
    Write-Output 'G7B_LOCAL_MASTER=VERIFIED'
} else {
    Write-Output 'G7B_LOCAL_MASTER=ABSENT_FROM_PUBLIC_REPOSITORY_AS_EXPECTED'
}
$thumbnailHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $thumbnailPath).Hash.ToLowerInvariant()
$enHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $enPath).Hash.ToLowerInvariant()
$zhHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $zhPath).Hash.ToLowerInvariant()
Assert-True ($thumbnailHash -eq '21c4c940b33baba58aedc99c3cc5f4a255e188eaa32dee614555add44b4ef437') 'G7B thumbnail hash mismatch.'
Assert-True ($enHash -eq '666dc6c8b55010ba8b48a82548b505be4dbad06a9bac684df03e428393c62c88') 'English SRT hash mismatch.'
Assert-True ($zhHash -eq 'b0fc9b4428b3e91496e3f3355b44b0a6bda9f40a4ef2f55ffab95f7af96aa0ef') 'Chinese SRT hash mismatch.'
Assert-True ((Get-Item -LiteralPath $thumbnailPath).Length -eq 1314943) 'G7B thumbnail byte size mismatch.'

$en = Read-Utf8 $enPath
$zh = Read-Utf8 $zhPath
$record = Read-Utf8 $recordPath
$submission = Read-Utf8 $submissionPath
$readme = Read-Utf8 (Join-Path $root 'README.md')
$production = Read-Utf8 (Join-Path $root 'docs/g7a-production.md')
$ledger = Read-Utf8 (Join-Path $root 'docs/content-claim-ledger.md')
$development = Read-Utf8 (Join-Path $root 'development/index.html')
$publicPlan = Read-Utf8 (Join-Path $root 'BIMCLASH_AGENT_MASTER_PLAN.public.md')

Assert-True (([regex]::Matches($en, '(?m)^\d+$')).Count -eq 16) 'English SRT must contain exactly 16 numbered cues.'
Assert-True (([regex]::Matches($zh, '(?m)^\d+$')).Count -eq 16) 'Chinese SRT must contain exactly 16 numbered cues.'
foreach ($needle in @('IFC4', 'MEP IFC', 'two millimetres', 'Forty-nine millimetres', 'Fifty millimetres', 'not evaluated', 'engineering certification')) {
    Assert-True ($en.Contains($needle)) "English SRT is missing: $needle"
}
foreach ($needle in @('IFC4', '机电 IFC', '2 毫米', '49 毫米', '50 毫米', '未评估', '工程认证')) {
    Assert-True ($zh.Contains($needle)) "Chinese SRT is missing: $needle"
}

$url = 'https://www.youtube.com/watch?v=jK3OSltoTEQ'
foreach ($surface in @($record, $submission, $readme, $production)) {
    Assert-True ($surface.Contains($url)) 'A required G7B surface is missing the canonical watch URL.'
}
Assert-True ($record.Contains('PASS / USER_FINAL_MEDIA_ACCEPTANCE_SUPERSEDES_YOUTUBE_OPERATIONS')) 'G7B record does not contain the user-authorized closure state.'
Assert-True ($record.Contains('2026-09-01 00:00 +08:00')) 'Scheduled Premiere time is not registered.'
Assert-True ($record.Contains('Completed no later than the read-only verification at `2026-08-31 23:10 +08:00`')) 'The truthful upload-time bound is missing.'
Assert-True ($record.Contains('The agent did not upload the video')) 'External-write attribution boundary is missing.'
Assert-True ($publicPlan.Contains('| D-094 | 2026-08-31 |')) 'The public plan is missing the user-authorized D-094 closure decision.'
Assert-True ($record.Contains('manual review of the final source film perfectly matches their personal requirements')) 'The user final-media acceptance provenance is missing.'
Assert-True ($record.Contains('supersedes those planned YouTube-side tasks for Gate closure')) 'The YouTube-operation supersession boundary is missing.'
Assert-True ($record.Contains('does **not** claim independent verification')) 'The non-claim boundary for unperformed platform checks is missing.'
Assert-True ($submission.Contains('READY / G7B_PASS_BY_USER_FINAL_MEDIA_ACCEPTANCE')) 'Submission materials do not expose the authorized closure state.'
Assert-True ($submission.Contains('rejects further YouTube operations')) 'Submission materials are missing the no-YouTube-operation decision.'
Assert-True ($ledger.Contains('Status: `G7B · PASS / G7 · PLANNED`')) 'The claim ledger does not expose G7B as the latest closed Gate.'
Assert-True ($development.Contains('data-claim-stage="G7B" data-claim-state="closed"')) 'The development page does not expose G7B as closed.'
Assert-True ($development.Contains('>PASS</span>')) 'The development page G7B PASS token is missing.'
Assert-True (-not $development.Contains('Unlisted upload')) 'The superseded English Unlisted route remains on the development page.'
Assert-True (-not $development.Contains('Unlisted 上传')) 'The superseded Chinese Unlisted route remains on the development page.'

$homepage = Read-Utf8 (Join-Path $root 'index.html')
Assert-True (-not $homepage.Contains('jK3OSltoTEQ')) 'The final video must not be embedded or linked in the project homepage.'
Assert-True (-not $development.Contains('jK3OSltoTEQ')) 'The final video link must not be added to the development page.'

Write-Output 'PASS: G7B media identity, user-acceptance closure, state parity and no-YouTube-operation/non-claim boundaries agree.'
