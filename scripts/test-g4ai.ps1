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
    "DETERMINISTIC REVIEW · OPTIONAL AI",
    "Optional AI interpretation is available.",
    "GroqCloud · openai/gpt-oss-20b",
    "service availability and data handling follow the provider's current public terms",
    "Minimal structured fields",
    "Optional AI interpretation"
)) { if (-not $appHtml.Contains($required)) { throw "G4AI page contract missing: $required" } }
if (($appHtml.Split('data-control-mode="ai"').Count - 1) -ne 1) { throw "G4AI must expose one post-result AI control." }
foreach ($obsolete in @("workspace-ai-option", "Turn the results into a coordination analysis", "Generate AI coordination analysis", "Preview fields", "Confirm and analyze")) {
    if ($appHtml.Contains($obsolete) -or $appScript.Contains($obsolete)) { throw "Obsolete verbose AI entry remains: $obsolete" }
}

foreach ($required in @(
    "Pre-send preview (nothing sent yet)",
    'aiButtonOn: "Interpret"',
    "Synthesis",
    "Evidence reading",
    "Coordination focus",
    "detection conclusions stay unchanged",
    "ai-send-consent",
    'data-ai-action="send"',
    'data-ai-action="cancel"',
    'data-ai-action="retry"',
    'data-ai-action="copy"',
    'data-ai-action="close"',
    'AI_MAX_RECORDS',
    'aiOperation',
    'state.aiController === controller',
    'operation !== state.aiOperation',
    'if (button.dataset.aiAction === "retry") await showAiPreview()',
    'state.aiRequest.locale !== language()',
    'state.aiRequest = null',
    'state.aiResult = null',
    "GUIDs, names, IFC bytes, meshes, filenames, paths, hashes, diagnostics, and browser metadata are excluded"
)) { if (-not $appScript.Contains($required)) { throw "G4AI runtime contract missing: $required" } }
if ($appScript.Contains('button.dataset.aiAction === "send" || button.dataset.aiAction === "retry"')) { throw "Retry bypasses the fresh-consent preview." }
if ($contract -notmatch 'AI_MAX_RECORDS\s*=\s*6') { throw "AI request boundary is not aligned to the supported capacity." }
if ($contract -notmatch 'AI_MAX_COMPLETION_TOKENS\s*=\s*1600') { throw "AI completion cap does not leave bounded room for six prose records." }

foreach ($publicCopy in @($appHtml, $appScript)) {
    foreach ($developerPhrase in @(
        "当前账户",
        "账户可启用 ZDR",
        "account-level ZDR",
        "account-specific",
        "API READY",
        "API NOT CONFIGURED"
    )) {
        if ($publicCopy.Contains($developerPhrase)) { throw "Developer-facing AI copy remains public: $developerPhrase" }
    }
}
foreach ($required in @(
    "当前将使用本地解读",
    "AI 服务暂时不可用，已切换为本地解读。检测结果不受影响。",
    "Local interpretation will be used for now",
    "The AI service is temporarily unavailable, so a local interpretation is shown. Detection results are unaffected.",
    "aiFailureMessage(result.error.code)"
)) { if (-not $appScript.Contains($required)) { throw "Public AI failure copy contract missing: $required" } }
if ($appScript.Contains('AI 请求未完成（{code}）') -or $appScript.Contains('did not complete ({code})')) { throw "Internal AI error codes remain exposed in public copy." }

if ($appScript -match '(?i)api\.groq\.com|authorization\s*:|GROQ_API_KEY') { throw "Browser runtime contains provider endpoint or credential handling." }
if ($contract -notmatch 'deterministic_results_are_authoritative:\s*true') { throw "Minimal request does not lock deterministic authority." }
if ($contract -notmatch 'G4AI_COORDINATION_ANALYSIS_V2') { throw "Coordination-analysis contract version is missing." }
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
