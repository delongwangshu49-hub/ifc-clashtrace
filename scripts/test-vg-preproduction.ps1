param(
    [ValidateSet('Local', 'Public')]
    [string]$Scope = 'Local'
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repoRoot

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw "VG audit failed: $Message" }
}

function Assert-Near {
    param([double]$Actual, [double]$Expected, [double]$Tolerance, [string]$Message)
    Assert-True ([math]::Abs($Actual - $Expected) -le $Tolerance) "$Message (actual=$Actual expected=$Expected)"
}

function Read-Utf8 {
    param([string]$Path)
    return Get-Content -LiteralPath $Path -Raw -Encoding utf8
}

$englishPath = 'docs/vg-video-preproduction.md'
$chinesePath = 'docs/vg-video-preproduction.zh-CN.md'
$publicationPath = 'docs/vg-publication-manifest.md'
$shotcraftPath = 'docs/vg-shotcraft-manifest.json'

$english = Read-Utf8 $englishPath
$chinese = Read-Utf8 $chinesePath
$publication = Read-Utf8 $publicationPath

Assert-True ($english.Contains('VG PASS — PUBLIC CHECKPOINT VERIFIED; G7A READY / NOT STARTED')) 'English status marker is missing'
Assert-True ($chinese.Contains('VG 通过——公开检查点已复验；G7A 已就绪 / 未启动')) 'Chinese status marker is missing'
Assert-True ($english.Contains('The English script is `272 words`')) 'English script total declaration is stale'
Assert-True ($chinese.Contains('英语共 `272 词`')) 'Chinese script total declaration is stale'
Assert-True ($english.Contains('trim-relative first beat is `00:00.000`')) 'English trim-relative beat contract is missing'
Assert-True ($chinese.Contains('裁切后首拍为 `00:00.000`')) 'Chinese trim-relative beat contract is missing'
Assert-True ($english.Contains('run the four-record deterministic pack as one controlled batch')) 'S11 controlled-batch action is missing'
Assert-True ($chinese.Contains('把四记录确定性包作为一个受控批次运行')) 'Chinese S11 controlled-batch action is missing'
Assert-True ($english.Contains('`docs/vg-shotcraft-manifest.json`')) 'English motion-source manifest link is missing'
Assert-True ($chinese.Contains('`docs/vg-shotcraft-manifest.json`')) 'Chinese motion-source manifest link is missing'

$scriptPattern = '(?m)^\| (S\d{2}) \| ([^|]+) \| ([^|]+) \| (F[^|]+) \|$'
$englishScriptRows = [regex]::Matches($english, $scriptPattern)
$chineseScriptRows = [regex]::Matches($chinese, $scriptPattern)
Assert-True ($englishScriptRows.Count -eq 13) "English script row count is $($englishScriptRows.Count), expected 13"
Assert-True ($chineseScriptRows.Count -eq 13) "Chinese script row count is $($chineseScriptRows.Count), expected 13"

$shotPattern = '(?m)^\| (S\d{2}) \| `[^`]+` / `(\d+)–(\d+)` \|'
$englishShotRows = [regex]::Matches($english, $shotPattern)
$chineseShotRows = [regex]::Matches($chinese, $shotPattern)
Assert-True ($englishShotRows.Count -eq 13) "English shot row count is $($englishShotRows.Count), expected 13"
Assert-True ($chineseShotRows.Count -eq 13) "Chinese shot row count is $($chineseShotRows.Count), expected 13"

$beatInterval = 0.599999585
$wordsPerSecond = 114.0 / 60.0
$scriptWords = 0
$minimumMargin = [double]::PositiveInfinity
for ($index = 0; $index -lt 13; $index++) {
    $scriptShot = $englishScriptRows[$index].Groups[1].Value
    $timedShot = $englishShotRows[$index].Groups[1].Value
    Assert-True ($scriptShot -eq $timedShot) "Script/shot ordering differs at index $index"
    $wordCount = [regex]::Matches(
        $englishScriptRows[$index].Groups[2].Value,
        "[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*"
    ).Count
    $scriptWords += $wordCount
    $startBeat = [int]$englishShotRows[$index].Groups[2].Value
    $endBeat = [int]$englishShotRows[$index].Groups[3].Value
    $shotSeconds = ($endBeat - $startBeat) * $beatInterval
    $requiredSeconds = ($wordCount / $wordsPerSecond) + 0.420
    $margin = $shotSeconds - $requiredSeconds
    if ($margin -lt $minimumMargin) { $minimumMargin = $margin }
    Assert-True ($margin -ge 0) "$scriptShot needs $([math]::Round($requiredSeconds, 3)) s but has $([math]::Round($shotSeconds, 3)) s"
}
Assert-True ($scriptWords -eq 272) "English script contains $scriptWords words, expected 272"

$beatData = Read-Utf8 'artifacts/vg/analysis/beat_data.json' | ConvertFrom-Json
$gridDrift = Read-Utf8 'artifacts/vg/analysis/grid_drift.json' | ConvertFrom-Json
$voiceF0 = Read-Utf8 'artifacts/vg/analysis/voice_f0.json' | ConvertFrom-Json
Assert-Near ([double]$beatData.t0) 0.0 0.0000005 'beat_data.t0 must be trim-relative zero'
Assert-Near ([double]$beatData.timeline_contract.trim_relative_t0_seconds) 0.0 0.0000005 'timeline contract trim-relative t0 must be zero'
Assert-Near ([double]$beatData.beats[0]) ([double]$beatData.analysis_segment.start) 0.0000005 'first absolute beat must equal trim start'
Assert-Near ([double]$beatData.T) ([double]$beatData.timeline_contract.beat_interval_seconds) 0.0000005 'beat interval fields disagree'
Assert-True ($gridDrift.winner -eq 'base') 'base grid is not the frozen winner'
Assert-True ([bool]$gridDrift.winner_strict_pass) 'strict grid acceptance is not true'
$winner = $gridDrift.candidates | Where-Object { $_.candidate -eq $gridDrift.winner }
Assert-True ($null -ne $winner) 'winner candidate is absent'
Assert-True ([double]$winner.match_percent_33ms -ge [double]$gridDrift.strict_skill_thresholds.match_percent) 'transient coverage misses strict threshold'
Assert-True ([double]$winner.matched_mean_abs_ms -le [double]$gridDrift.strict_skill_thresholds.matched_mean_abs_ms) 'matched mean error misses strict threshold'
Assert-True ([double]$winner.estimated_segment_drift_ms -le [double]$gridDrift.strict_skill_thresholds.segment_drift_ms) 'segment drift misses strict threshold'
Assert-True ($voiceF0.decision -match '^H selected by the user on 2026-08-31') 'voice H decision/date is not frozen'

$shotcraft = Read-Utf8 $shotcraftPath | ConvertFrom-Json
Assert-True ($shotcraft.shots.Count -eq 9) "shotcraft manifest has $($shotcraft.shots.Count) entries, expected 9"
$shotcraftShots = @($shotcraft.shots | ForEach-Object { $_.shot })
Assert-True (($shotcraftShots | Sort-Object -Unique).Count -eq 9) 'shotcraft manifest contains duplicate shots'
foreach ($entry in $shotcraft.shots) {
    Assert-True ($entry.card_doc -match '^references/shots/.+\.md$') "$($entry.shot) card_doc is not precise"
    Assert-True ($entry.demo_tsx -match '^demos/.+\.tsx$') "$($entry.shot) demo_tsx is not precise"
    Assert-True ($entry.reference_media -match '^gallery/media/.+\.mp4$') "$($entry.shot) reference media is not precise"
    Assert-True ($entry.card_doc_sha256 -match '^[A-F0-9]{64}$') "$($entry.shot) card-doc SHA-256 is invalid"
    Assert-True ($entry.demo_tsx_sha256 -match '^[A-F0-9]{64}$') "$($entry.shot) demo SHA-256 is invalid"
}

$styleframes = @(Get-ChildItem -LiteralPath 'artifacts/vg/styleframes' -File -Filter 'SF*.png')
Assert-True ($styleframes.Count -eq 3) "styleframe count is $($styleframes.Count), expected 3"
Assert-True (Test-Path -LiteralPath 'artifacts/vg/keyframes/VG-keyframe-table-4k.png') '4K keyframe contact sheet is missing'

$localAudio = @(
    Get-ChildItem -LiteralPath 'artifacts/vg-auditions' -File | Where-Object { $_.Extension -in @('.mp3', '.wav') }
    Get-ChildItem -LiteralPath 'artifacts/vg-auditions/sfx' -File | Where-Object { $_.Extension -eq '.wav' }
)
if ($Scope -eq 'Local') {
    Assert-True ($localAudio.Count -ge 10) 'local audition evidence is unexpectedly incomplete'
    $keyframes = @(Get-ChildItem -LiteralPath 'artifacts/vg/keyframes' -File -Filter 'KF*.png')
    Assert-True ($keyframes.Count -eq 13) "keyframe count is $($keyframes.Count), expected 13"
}

$manifestMatches = [regex]::Matches($publication, '(?m)^\d+\. `([^`]+)`$')
$publicPaths = @($manifestMatches | ForEach-Object { $_.Groups[1].Value })
Assert-True ($publicPaths.Count -eq 25) "public candidate count is $($publicPaths.Count), expected 25"
Assert-True (($publicPaths | Sort-Object -Unique).Count -eq 25) 'public candidate contains duplicate paths'
foreach ($path in $publicPaths) {
    Assert-True (Test-Path -LiteralPath $path) "public candidate path is absent: $path"
}
Assert-True ('BIMCLASH_AGENT_MASTER_PLAN.md' -notin $publicPaths) 'private master plan entered the public candidate'
Assert-True (-not ($publicPaths | Where-Object { $_ -match '\.(mp3|wav)$' })) 'audio binary entered the public candidate'
Assert-True (-not ($publicPaths | Where-Object { $_ -match 'artifacts/vg/keyframes/KF.+\.png$' })) 'individual keyframe proxy entered the public candidate'

$trackedPaths = @(git ls-files)
Assert-True ($LASTEXITCODE -eq 0) 'git ls-files failed'
$trackedForbidden = @($trackedPaths | Where-Object {
    $_ -match '^artifacts/vg-auditions/.+\.(mp3|wav)$' -or
    $_ -match '^artifacts/vg/keyframes/KF.+\.png$'
})
Assert-True ($trackedForbidden.Count -eq 0) "local-only media is tracked: $($trackedForbidden -join ', ')"

$ignoreProbes = @($localAudio | ForEach-Object { $_.FullName.Substring($repoRoot.Length + 1).Replace('\', '/') })
$ignoreProbes += 'artifacts/vg/keyframes/KF01-开场-可追溯.png'
foreach ($probe in $ignoreProbes) {
    git check-ignore -q -- $probe
    Assert-True ($LASTEXITCODE -eq 0) "local-only path is not ignored: $probe"
}

$privateMaster = Read-Utf8 'BIMCLASH_AGENT_MASTER_PLAN.md'
$publicMaster = Read-Utf8 'BIMCLASH_AGENT_MASTER_PLAN.public.md'
$gateMarker = 'VG — PASS / PUBLIC_CHECKPOINT_VERIFIED'
Assert-True ($privateMaster.Contains($gateMarker)) 'private master plan gate is stale'
Assert-True ($publicMaster.Contains($gateMarker)) 'public master plan gate is stale'
Assert-True ($publicMaster.Contains('<PROJECT_ROOT>')) 'public master plan lacks sanitized project-root placeholder'
Assert-True (-not $publicMaster.Contains($repoRoot)) 'public master plan exposes the current absolute project path'
Assert-True (-not ($publicMaster -match '(?i)[A-Z]:\\Users\\[^\\\s]+')) 'public master plan exposes a Windows user-profile path'

$finalVideos = @(
    Get-ChildItem -LiteralPath 'artifacts/vg' -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Extension -in @('.mp4', '.mov', '.mkv', '.webm') }
)
Assert-True ($finalVideos.Count -eq 0) 'a video file exists inside the VG artifact scope although G7A is not started'

Write-Output "VG_SCOPE=$Scope"
Write-Output 'VG_STAGE_BOUNDARY=PASS'
Write-Output 'VG_SCRIPT_ROWS=13'
Write-Output 'VG_SHOT_ROWS=13'
Write-Output "VG_SCRIPT_WORDS=$scriptWords"
Write-Output "VG_MINIMUM_NARRATION_MARGIN_SECONDS=$([math]::Round($minimumMargin, 3))"
Write-Output 'VG_STYLEFRAMES=3'
if ($Scope -eq 'Local') { Write-Output 'VG_KEYFRAMES=13' }
Write-Output 'VG_CARD_RECIPES=9'
Write-Output 'VG_BEAT_GRID_STRICT_PASS=TRUE'
Write-Output 'VG_SFX=P1'
Write-Output 'VG_VOICE=H'
Write-Output 'VG_PUBLIC_CANDIDATE_PATHS=25'
Write-Output 'VG_FINAL_VIDEOS=0'
Write-Output 'VG_G7A=READY_NOT_STARTED'
Write-Output 'VG_STATUS=PASS_PUBLIC_CHECKPOINT_VERIFIED'
