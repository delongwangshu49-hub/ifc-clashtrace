$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $projectRoot
if ($PSVersionTable.PSVersion.Major -lt 7) { throw "PowerShell 7 or newer is required." }

$beforeStatus = @(git status --porcelain=v1 --untracked-files=no)
$node = Join-Path $projectRoot ".tools/node-v24.19.0-win-x64/node.exe"
if (-not (Test-Path -LiteralPath $node -PathType Leaf)) { throw "Project-local Node.js runtime is missing. Run scripts/setup-g1.ps1 first." }

$syntaxFiles = @(
    "app/ai/contract.mjs",
    "app/ai/provider-neutral.mjs",
    "app/ai/adapters/groq.mjs",
    "app/ai/client.mjs",
    "scripts/g4ai-local-server.mjs",
    "scripts/g4ai-tests.mjs",
    "app/ui/app.mjs"
)
foreach ($file in $syntaxFiles) {
    & $node --check $file
    if ($LASTEXITCODE -ne 0) { throw "JavaScript syntax check failed: $file" }
}

& $node "scripts/g4ai-tests.mjs"
if ($LASTEXITCODE -ne 0) { throw "G4AI unit/integration tests failed." }

$appHtml = Get-Content -LiteralPath "app/index.html" -Raw
$appScript = Get-Content -LiteralPath "app/ui/app.mjs" -Raw
$contract = Get-Content -LiteralPath "app/ai/contract.mjs" -Raw
$server = Get-Content -LiteralPath "scripts/g4ai-local-server.mjs" -Raw
$envExample = Get-Content -LiteralPath ".env.example" -Raw

foreach ($required in @(
    "G4AI · OPTIONAL INTERPRETATION",
    "preview and a second confirmation are required before sending",
    "Minimal structured fields",
    "never changes status, rules, or evidence"
)) { if (-not $appHtml.Contains($required)) { throw "G4AI page contract missing: $required" } }

foreach ($required in @(
    "Pre-send preview (nothing sent yet)",
    "ai-send-consent",
    'data-ai-action="send"',
    'data-ai-action="cancel"',
    'data-ai-action="retry"',
    'data-ai-action="copy"',
    'data-ai-action="close"',
    'state.aiRequest.locale !== language()',
    'state.aiRequest = null',
    'state.aiResult = null',
    "GUIDs, names, IFC bytes, meshes, filenames, paths, hashes, diagnostics, and browser metadata are excluded"
)) { if (-not $appScript.Contains($required)) { throw "G4AI runtime contract missing: $required" } }

if ($appScript -match '(?i)api\.groq\.com|authorization\s*:|GROQ_API_KEY') { throw "Browser runtime contains provider endpoint or credential handling." }
if ($contract -notmatch 'deterministic_results_are_authoritative:\s*true') { throw "Minimal request does not lock deterministic authority." }
if ($contract -match '(?i)global_id|model_a_sha256|model_b_sha256|diagnostic|file(?:name)?|absolute.path|browser.metadata') { throw "AI contract references prohibited model or browser fields." }
if ($server -notmatch 'process\.env\.GROQ_API_KEY') { throw "Server does not source the provider key from the environment." }
if ($server -match 'console\.log\([^\r\n]*GROQ_API_KEY') { throw "Server risks logging the provider key." }
if ($envExample -match '(?i)gsk_[A-Za-z0-9_-]{8,}|GROQ_API_KEY[^\r\n=]*=[ \t]*\S+') { throw ".env.example contains a non-empty key." }

& "scripts/test-g4.ps1"
if ($LASTEXITCODE -ne 0) { throw "G4 regression failed." }

$afterStatus = @(git status --porcelain=v1 --untracked-files=no)
if (($beforeStatus -join "`n") -ne ($afterStatus -join "`n")) { throw "G4AI test changed the tracked worktree." }

Write-Output "G4AI_JS_SYNTAX=PASS"
Write-Output "G4AI_EXPLICIT_PREVIEW_CONSENT=PASS"
Write-Output "G4AI_COPY_RETRY_CANCEL_CLOSE=PASS"
Write-Output "G4AI_LANGUAGE_MATCH_AND_STALE_RESULT_INVALIDATION=PASS"
Write-Output "G4AI_BROWSER_HAS_NO_KEY_OR_PROVIDER_ENDPOINT=PASS"
Write-Output "G4AI_G4_REGRESSION=PASS"
Write-Output "G4AI_GIT_WORKTREE_UNCHANGED=PASS"
Write-Output "G4AI_LOCAL_TEST=PASS"
