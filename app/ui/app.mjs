import { IfcAPI } from "web-ifc";

import { evaluateIfcPair } from "/app/core/ifc-clash-engine.mjs";
import { AI_MAX_RECORDS, fetchAiStatus, prepareAiRequest, requestAiInterpretation } from "/app/ai/client.mjs";
import { getPreferences, initializePreferences } from "/app/ui/preferences.mjs";
import { ClashViewer } from "/app/ui/viewer.mjs";

const CASES = {
  "review-pack": ["C01", "C03", "C05", "C08"],
  C01: ["C01"], C02: ["C02"], C03: ["C03"], C04: ["C04"],
  C05: ["C05"], C06: ["C06"], C07: ["C07"], C08: ["C08"],
};

const copy = {
  "zh-CN": {
    waiting: "等待输入",
    exampleReady: "受控示例已就绪",
    customReady: "自选 IFC 已就绪",
    notSelected: "未选择",
    invalidType: "只接受扩展名为 .ifc 的文件",
    tooLarge: "文件超过 25 MiB 候选上限",
    missingSchema: "未在文件头识别到 IFC4",
    missingMetre: "未在文件头识别到 metre 长度单位",
    fileReady: "边界预检通过 · {size}",
    customIncomplete: "请分别选择 MEP IFC 与结构 IFC",
    coordinatesRequired: "必须先确认共享项目坐标；应用不会自动配准",
    runningPhase: "阶段 {current}/{total} · {phase}",
    phaseValidate: "验证输入边界",
    phaseParse: "解析 IFC 与提取几何",
    phaseHard: "执行 2 mm 硬碰撞规则",
    phaseClearance: "执行 50 mm 净距规则",
    phaseFinalize: "冻结结果记录",
    complete: "运行完成：{count} 条确定性记录。可靠性不足的构件对已失败关闭。",
    failed: "运行未能可靠完成：{message}",
    records: "{count} 条记录",
    statusClash: "硬碰撞",
    statusWarning: "净距预警",
    statusClear: "已求值清晰",
    statusNe: "无法求值",
    caseLabel: "案例 {caseId}",
    evidence: "查看完整证据",
    selectedRule: "规则",
    selectedPair: "构件对",
    selectedDistance: "实测净距",
    selectedTolerance: "容差",
    aiOff: "开启后先预览发送字段，再确认生成；检测结论不变。",
    aiOn: "先预览字段，再确认生成；检测结论不变。",
    aiButtonOff: "AI 未开启",
    aiButtonOn: "AI 解读",
    aiPreviewTitle: "发送前预览（尚未发送）",
    aiPreviewBody: "仅发送语言、固定规则边界、状态汇总，以及每条记录的本地别名、状态、双方 IFC 类型和已存在的测量字段。GUID、名称、IFC 字节、网格、文件名、路径、哈希、诊断和浏览器元数据均排除。",
    aiProviderBoundary: "AI 解读由 GroqCloud · openai/gpt-oss-20b 提供。仅在你确认后发送上方展示的最小字段；IFC 文件、构件标识和本地文件信息不会发送。服务可用性与数据处理规则以供应商当前公开说明为准。",
    aiConsent: "我已检查上述字段并同意将其发送给 GroqCloud 以生成一次可选解读。",
    aiSend: "发送最小字段",
    aiSending: "正在请求 AI 解读…确定性结果保持可用。",
    aiCancel: "取消请求",
    aiRetry: "重试",
    aiTooManyRecords: "单次 AI 解读最多支持 {count} 条记录。确定性结果仍可正常审阅；请缩小本次检查范围后再试。",
    aiCopy: "复制解读",
    aiClose: "关闭",
    aiGenerated: "AI 协调分析 · 不改变检测结论",
    aiFallback: "本地协调分析 · 未改变检测结论",
    aiServiceReady: "AI 服务可用",
    aiServiceLocal: "当前将使用本地解读",
    aiUnavailable: "AI 服务暂时不可用，已切换为本地解读。检测结果不受影响。",
    aiBusy: "AI 服务当前繁忙，已切换为本地解读。检测结果不受影响。",
    aiConnectionFailed: "AI 服务连接未完成，已切换为本地解读。检测结果不受影响。",
    aiNotGenerated: "AI 解读暂未生成，已切换为本地解读。检测结果不受影响。",
    aiCopied: "已复制",
    aiAttentionReviewFirst: "优先复核",
    aiAttentionReviewNext: "随后复核",
    aiAttentionInformational: "信息参考",
    aiOverviewTitle: "综合分析",
    aiRecordAnalysis: "证据解读",
    aiReviewFocus: "协调重点",
    isolate: "隔离构件对",
    restore: "恢复场景",
    loading3d: "从真实 IFC 几何准备 3D 证据…",
    loaded3d: "3D 已聚焦双方构件。可使用鼠标旋转、平移与缩放。",
    viewerFailed: "3D 证据未能可靠加载；文本确定性记录仍保持权威。",
    setupExample: "当前：受控 {selection}；将在断网条件下从本地资源执行真实计算。",
    setupCustom: "当前：两份自选 IFC；文件仅保留在本页内存，刷新页面即释放。",
    syntheticFailure: "运行级失败关闭",
  },
  en: {
    waiting: "Waiting for input",
    exampleReady: "Controlled example ready",
    customReady: "Custom IFC pair ready",
    notSelected: "Not selected",
    invalidType: "Only files with the .ifc extension are accepted",
    tooLarge: "File exceeds the 25 MiB candidate limit",
    missingSchema: "IFC4 was not identified in the file header",
    missingMetre: "A metre length unit was not identified in the file header",
    fileReady: "Boundary preflight passed · {size}",
    customIncomplete: "Choose one MEP IFC and one structural IFC",
    coordinatesRequired: "Confirm shared project coordinates first; the app does not register models",
    runningPhase: "Phase {current}/{total} · {phase}",
    phaseValidate: "Validate input boundaries",
    phaseParse: "Parse IFC and extract geometry",
    phaseHard: "Run the 2 mm hard-clash rule",
    phaseClearance: "Run the 50 mm clearance rule",
    phaseFinalize: "Freeze result records",
    complete: "Run complete: {count} deterministic records. Unreliable pairs failed closed.",
    failed: "The run could not complete reliably: {message}",
    records: "{count} records",
    statusClash: "Hard clash",
    statusWarning: "Clearance warning",
    statusClear: "Evaluated clear",
    statusNe: "Not evaluated",
    caseLabel: "Case {caseId}",
    evidence: "View full evidence",
    selectedRule: "Rule",
    selectedPair: "Component pair",
    selectedDistance: "Measured clearance",
    selectedTolerance: "Tolerance",
    aiOff: "Enable it to preview the fields, then confirm; detection conclusions stay unchanged.",
    aiOn: "Preview the fields, then confirm; detection conclusions stay unchanged.",
    aiButtonOff: "AI is off",
    aiButtonOn: "Interpret",
    aiPreviewTitle: "Pre-send preview (nothing sent yet)",
    aiPreviewBody: "Only locale, frozen rule boundaries, status counts, and each record's local alias, status, two IFC types, and existing measurement fields are sent. GUIDs, names, IFC bytes, meshes, filenames, paths, hashes, diagnostics, and browser metadata are excluded.",
    aiProviderBoundary: "AI interpretation is provided by GroqCloud · openai/gpt-oss-20b. Only the minimal fields shown above are sent after you confirm; IFC files, component identifiers, and local file information are not sent. Service availability and data handling follow the provider's current public terms.",
    aiConsent: "I reviewed the fields above and agree to send them to GroqCloud for one optional interpretation.",
    aiSend: "Send minimal fields",
    aiSending: "Requesting AI interpretation… deterministic results remain available.",
    aiCancel: "Cancel request",
    aiRetry: "Retry",
    aiTooManyRecords: "One AI interpretation supports up to {count} records. Deterministic results remain available; narrow the run before trying again.",
    aiCopy: "Copy interpretation",
    aiClose: "Close",
    aiGenerated: "AI coordination analysis · detection conclusions unchanged",
    aiFallback: "Local coordination analysis · detection conclusions unchanged",
    aiServiceReady: "AI service available",
    aiServiceLocal: "Local interpretation will be used for now",
    aiUnavailable: "The AI service is temporarily unavailable, so a local interpretation is shown. Detection results are unaffected.",
    aiBusy: "The AI service is currently busy, so a local interpretation is shown. Detection results are unaffected.",
    aiConnectionFailed: "The AI service connection did not complete, so a local interpretation is shown. Detection results are unaffected.",
    aiNotGenerated: "An AI interpretation was not generated, so a local interpretation is shown. Detection results are unaffected.",
    aiCopied: "Copied",
    aiAttentionReviewFirst: "Review first",
    aiAttentionReviewNext: "Review next",
    aiAttentionInformational: "Informational",
    aiOverviewTitle: "Synthesis",
    aiRecordAnalysis: "Evidence reading",
    aiReviewFocus: "Coordination focus",
    isolate: "Isolate pair",
    restore: "Restore scene",
    loading3d: "Preparing 3D evidence from the real IFC geometry…",
    loaded3d: "3D is focused on both components. Use the mouse to orbit, pan, and zoom.",
    viewerFailed: "3D evidence could not load reliably; the deterministic text record remains authoritative.",
    setupExample: "Current: controlled {selection}; real computations will run from local assets while offline.",
    setupCustom: "Current: two custom IFC files; bytes stay in this page's memory and are released on refresh.",
    syntheticFailure: "Run-level failure closing",
  },
};

const elements = Object.fromEntries([
  "desktop-required", "setup-state", "example-select", "use-example", "mep-file", "structure-file", "mep-status", "structure-status",
  "shared-coordinates", "run-description", "run-checks", "run-live", "setup-panel", "review-panel", "new-run", "count-clash", "count-warning",
  "count-ne", "count-clear", "count-pairs", "run-time", "viewer", "viewer-loading", "viewport-case", "focus-selected", "fit-models",
  "toggle-isolate", "result-count-label", "result-list", "selected-summary", "evidence-drawer", "evidence-content", "close-evidence", "viewer-equivalent",
  "ai-description", "preview-ai-fields", "ai-preview",
].map(id => [id.replaceAll("-", "_"), document.getElementById(id)]));

const state = {
  mode: "example",
  selection: "review-pack",
  custom: { mep: null, structure: null },
  records: [],
  sources: new Map(),
  selected: null,
  filter: "all",
  running: false,
  viewerSource: null,
  aiRequest: null,
  aiResult: null,
  aiController: null,
  aiOperation: 0,
  aiStatus: null,
};

let engineIfcApi;
let viewer;

function language() { return getPreferences().language; }
function msg(key, params = {}) {
  let value = copy[language()][key] || copy.en[key] || key;
  for (const [name, replacement] of Object.entries(params)) value = value.replaceAll(`{${name}}`, String(replacement));
  return value;
}
function safe(value) {
  return String(value ?? "—").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}
function formatBytes(bytes) { return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KiB` : `${(bytes / 1024 / 1024).toFixed(2)} MiB`; }
function formatDistance(metres) { return Number.isFinite(metres) ? `${(metres * 1000).toFixed(metres === 0 ? 0 : 1)} mm` : "—"; }
function statusLabel(status) {
  return msg({ CLASH: "statusClash", WARNING: "statusWarning", CLEAR: "statusClear", NOT_EVALUATED: "statusNe" }[status] || "statusNe");
}

function translateStatic() {
  const aiEnabled = getPreferences().aiEnabled;
  if (!aiEnabled && (state.aiRequest || state.aiController || state.aiResult)) {
    invalidateAiFlow();
  } else if (state.aiRequest && state.aiRequest.locale !== language()) {
    invalidateAiFlow();
  }
  const useEnglish = language() === "en";
  document.querySelectorAll("[data-zh][data-en]").forEach(element => { element.textContent = useEnglish ? element.dataset.en : element.dataset.zh; });
  document.querySelectorAll("[data-zh-content][data-en-content]").forEach(element => { element.setAttribute("content", useEnglish ? element.dataset.enContent : element.dataset.zhContent); });
  document.querySelectorAll("[data-zh-aria][data-en-aria]").forEach(element => { element.setAttribute("aria-label", useEnglish ? element.dataset.enAria : element.dataset.zhAria); });
  document.title = useEnglish ? "IFC ClashTrace — Functional workspace" : "IFC ClashTrace — 功能工作台";
  refreshAiState();
  refreshRunDescription();
  renderRecords();
}

function invalidateAiFlow({ hide = true } = {}) {
  state.aiOperation += 1;
  const controller = state.aiController;
  state.aiController = null;
  state.aiRequest = null;
  state.aiResult = null;
  controller?.abort();
  if (hide) elements.ai_preview.hidden = true;
}

function updateDesktopBoundary() {
  const unsupported = globalThis.innerWidth < 1024;
  elements.desktop_required.hidden = !unsupported;
  elements.run_checks.disabled = unsupported || state.running;
}

async function validateFile(file) {
  if (!file?.name?.toLowerCase().endsWith(".ifc")) throw new Error(msg("invalidType"));
  if (file.size > 25 * 1024 * 1024) throw new Error(msg("tooLarge"));
  const headerText = new TextDecoder("utf-8", { fatal: false }).decode((await file.arrayBuffer()).slice(0, Math.min(file.size, 128 * 1024))).toUpperCase();
  if (!headerText.includes("FILE_SCHEMA(('IFC4'))")) throw new Error(msg("missingSchema"));
  if (!headerText.includes(".LENGTHUNIT.") || !headerText.includes(".METRE.")) throw new Error(msg("missingMetre"));
  return new Uint8Array(await file.arrayBuffer());
}

function invalidateReviewState({ resetCoordinateConsent = false } = {}) {
  invalidateAiFlow();
  state.records = [];
  state.sources.clear();
  state.selected = null;
  state.filter = "all";
  state.viewerSource = null;
  elements.review_panel.hidden = true;
  elements.evidence_drawer.hidden = true;
  elements.ai_preview.hidden = true;
  if (resetCoordinateConsent) elements.shared_coordinates.checked = false;
  refreshAiState();
}

async function handleFile(role, file) {
  const status = role === "mep" ? elements.mep_status : elements.structure_status;
  const input = role === "mep" ? elements.mep_file : elements.structure_file;
  invalidateReviewState({ resetCoordinateConsent: true });
  try {
    const bytes = await validateFile(file);
    state.custom[role] = { bytes, name: file.name, size: file.size };
    status.textContent = msg("fileReady", { size: formatBytes(file.size) });
    status.dataset.valid = "true";
    state.mode = "custom";
    elements.setup_state.querySelector("span:last-child").textContent = state.custom.mep && state.custom.structure ? msg("customReady") : msg("waiting");
  } catch (error) {
    state.custom[role] = null;
    input.value = "";
    status.textContent = error.message;
    status.dataset.valid = "false";
  }
  refreshRunDescription();
}

function refreshRunDescription() {
  if (!elements.run_description) return;
  elements.run_description.textContent = state.mode === "example"
    ? msg("setupExample", { selection: state.selection === "review-pack" ? "review pack · C01 / C03 / C05 / C08" : state.selection })
    : msg("setupCustom");
}

function chooseExample({ focusRun = true } = {}) {
  invalidateReviewState({ resetCoordinateConsent: true });
  state.mode = "example";
  state.selection = elements.example_select.value;
  elements.mep_file.value = "";
  elements.structure_file.value = "";
  state.custom = { mep: null, structure: null };
  elements.mep_status.textContent = msg("notSelected");
  elements.structure_status.textContent = msg("notSelected");
  delete elements.mep_status.dataset.valid;
  delete elements.structure_status.dataset.valid;
  elements.setup_state.querySelector("span:last-child").textContent = msg("exampleReady");
  refreshRunDescription();
  if (focusRun) elements.run_checks.focus();
}

async function fetchBytes(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load local controlled fixture (${response.status})`);
  return new Uint8Array(await response.arrayBuffer());
}

async function getEngine() {
  if (engineIfcApi) return engineIfcApi;
  engineIfcApi = new IfcAPI();
  engineIfcApi.SetWasmPath("/node_modules/web-ifc/", true);
  await engineIfcApi.Init();
  return engineIfcApi;
}

function syntheticFailure(result, sourceId) {
  const diagnostic = result.diagnostics?.join("; ") || "unsupported or unreliable input";
  return {
    id: `${sourceId}:run-failure`, caseId: sourceId, kind: "not-evaluated", status: "NOT_EVALUATED",
    rule_id: "MEP_STRUCTURE_HARD_CLASH_V1", diagnostic,
    element_a: { model_role: "mep", entity_type: "IfcPipeSegment", global_id: "NOT_AVAILABLE", name: msg("syntheticFailure") },
    element_b: { model_role: "structure", entity_type: "IfcWall | IfcBeam", global_id: "NOT_AVAILABLE", name: msg("syntheticFailure") },
    location: { point_a_m: null, point_b_m: null }, evidence: { certificate: "failure_closed", algorithm_boundary: diagnostic },
    hardRecord: null, clearanceRecord: null, sourceId,
  };
}

function normalizeResult(result, sourceId) {
  if (result.run_status !== "PASS" || !result.clash_records.length) return [syntheticFailure(result, sourceId)];
  return result.clash_records.map(hard => {
    const clearance = result.clearance_records.find(item => item.clearance_id === hard.clash_id);
    const primary = hard.status === "CLASH" || hard.status === "NOT_EVALUATED" ? hard : (clearance || hard);
    return {
      ...primary,
      id: primary.clash_id || primary.clearance_id,
      caseId: sourceId,
      kind: hard.status === "CLASH" ? "clash" : hard.status === "NOT_EVALUATED" ? "not-evaluated" : clearance ? "clearance" : "clear",
      hardRecord: hard,
      clearanceRecord: clearance || null,
      sourceId,
    };
  });
}

async function phase(text, current, total) {
  elements.run_live.textContent = msg("runningPhase", { current, total, phase: text });
  await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 35)));
}

async function runChecks() {
  if (state.running) return;
  if (globalThis.innerWidth < 1024) return updateDesktopBoundary();
  if (state.mode === "custom" && (!state.custom.mep || !state.custom.structure)) {
    elements.run_live.textContent = msg("customIncomplete");
    elements.run_live.dataset.state = "error";
    return;
  }
  if (state.mode === "custom" && !elements.shared_coordinates.checked) {
    elements.run_live.textContent = msg("coordinatesRequired");
    elements.run_live.dataset.state = "error";
    return;
  }

  state.running = true;
  invalidateReviewState();
  elements.run_checks.disabled = true;
  elements.run_live.dataset.state = "running";
  const started = performance.now();
  try {
    const cases = state.mode === "example" ? CASES[state.selection] : ["CUSTOM"];
    await phase(msg("phaseValidate"), 1, 5);
    const ifcApi = await getEngine();
    await phase(msg("phaseParse"), 2, 5);
    for (const caseId of cases) {
      let mepBytes;
      let structureBytes;
      if (caseId === "CUSTOM") {
        mepBytes = state.custom.mep.bytes;
        structureBytes = state.custom.structure.bytes;
      } else {
        const stem = caseId.toLowerCase();
        [mepBytes, structureBytes] = await Promise.all([
          fetchBytes(`/data/generated/g2/${stem}-mep.ifc`),
          fetchBytes(`/data/generated/g2/${stem}-structure.ifc`),
        ]);
      }
      state.sources.set(caseId, { mepBytes, structureBytes });
      await phase(`${msg("phaseHard")} · ${caseId}`, 3, 5);
      const result = await evaluateIfcPair({ ifcApi, mepBytes, structureBytes, coordinateSystem: "shared_project_coordinates" });
      await phase(`${msg("phaseClearance")} · ${caseId}`, 4, 5);
      state.records.push(...normalizeResult(result, caseId));
    }
    await phase(msg("phaseFinalize"), 5, 5);
    const elapsed = performance.now() - started;
    renderReview(elapsed);
    elements.run_live.textContent = msg("complete", { count: state.records.length });
    elements.run_live.dataset.state = "complete";
  } catch (error) {
    elements.run_live.textContent = msg("failed", { message: error.message });
    elements.run_live.dataset.state = "error";
  } finally {
    state.running = false;
    updateDesktopBoundary();
  }
}

function filterMatches(record) {
  if (state.filter === "all") return true;
  if (state.filter === "clash") return record.status === "CLASH";
  if (state.filter === "clearance") return record.kind === "clearance";
  return record.status === "NOT_EVALUATED";
}

function renderRecords() {
  if (!elements.result_list || !state.records.length) return;
  const records = state.records.filter(filterMatches);
  elements.result_count_label.textContent = msg("records", { count: records.length });
  elements.result_list.innerHTML = records.map(record => `
    <button type="button" role="option" aria-selected="${state.selected?.id === record.id}" class="result-row ${state.selected?.id === record.id ? "selected" : ""}" data-record-id="${safe(record.id)}" data-status="${record.status}">
      <span class="status-symbol" aria-hidden="true">${record.status === "CLASH" ? "!" : record.status === "WARNING" ? "△" : record.status === "CLEAR" ? "✓" : "?"}</span>
      <span class="result-row-copy"><strong>${safe(statusLabel(record.status))} · ${record.status}</strong><small>${safe(msg("caseLabel", { caseId: record.caseId }))} · ${safe(record.element_a.entity_type)} ↔ ${safe(record.element_b.entity_type)}</small></span>
      <span class="row-metric">${record.kind === "clearance" ? safe(formatDistance(record.clearance_distance_m)) : safe(record.status === "CLASH" ? "2 mm+" : "—")}</span>
    </button>
  `).join("") || `<p class="empty-filter">${safe(msg("records", { count: 0 }))}</p>`;
  elements.result_list.querySelectorAll("[data-record-id]").forEach(button => button.addEventListener("click", () => selectRecord(state.records.find(record => record.id === button.dataset.recordId))));
}

function renderReview(elapsed) {
  const counts = Object.fromEntries(["CLASH", "WARNING", "NOT_EVALUATED", "CLEAR"].map(status => [status, state.records.filter(record => record.status === status).length]));
  elements.count_clash.textContent = counts.CLASH;
  elements.count_warning.textContent = counts.WARNING;
  elements.count_ne.textContent = counts.NOT_EVALUATED;
  elements.count_clear.textContent = counts.CLEAR;
  elements.count_pairs.textContent = state.records.length;
  elements.run_time.textContent = `${Math.round(elapsed)} ms`;
  elements.review_panel.hidden = false;
  state.filter = "all";
  document.querySelectorAll("[data-filter]").forEach(button => button.classList.toggle("active", button.dataset.filter === "all"));
  state.selected = state.records[0] || null;
  renderRecords();
  if (state.selected) selectRecord(state.selected);
  elements.review_panel.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

function recordEvidence(record) {
  const evidence = record.evidence || {};
  const hardEvidence = record.hardRecord?.evidence || {};
  const clearanceEvidence = record.clearanceRecord?.evidence || {};
  const distance = record.clearanceRecord ? formatDistance(record.clearanceRecord.clearance_distance_m) : "—";
  return `
    <div class="evidence-status" data-status="${record.status}"><span aria-hidden="true">${record.status === "CLASH" ? "!" : record.status === "WARNING" ? "△" : record.status === "CLEAR" ? "✓" : "?"}</span><div><small>${safe(statusLabel(record.status))}</small><strong>${safe(record.status)}</strong></div></div>
    <dl class="evidence-grid">
      <div><dt>RULE_ID</dt><dd>${safe(record.rule_id)}</dd></div>
      <div><dt>CASE / RECORD</dt><dd>${safe(record.caseId)} · ${safe(record.id)}</dd></div>
      <div><dt>A · MEP TYPE</dt><dd>${safe(record.element_a.entity_type)} · ${safe(record.element_a.name)}</dd></div>
      <div><dt>A · GLOBAL_ID</dt><dd>${safe(record.element_a.global_id)}</dd></div>
      <div><dt>B · STRUCTURE TYPE</dt><dd>${safe(record.element_b.entity_type)} · ${safe(record.element_b.name)}</dd></div>
      <div><dt>B · GLOBAL_ID</dt><dd>${safe(record.element_b.global_id)}</dd></div>
      <div><dt>HARD TOLERANCE</dt><dd>${safe(formatDistance(record.hardRecord?.tolerance_m))}</dd></div>
      <div><dt>CLEARANCE / THRESHOLD</dt><dd>${safe(distance)} / ${safe(formatDistance(record.clearanceRecord?.threshold_m))}</dd></div>
      <div><dt>CERTIFICATE</dt><dd>${safe(evidence.certificate || hardEvidence.certificate || clearanceEvidence.certificate)}</dd></div>
      <div><dt>DETECTOR</dt><dd>${safe(evidence.detector || hardEvidence.detector || clearanceEvidence.detector)}</dd></div>
      <div class="wide"><dt>DIAGNOSTIC</dt><dd>${safe(record.diagnostic || record.hardRecord?.diagnostic || record.clearanceRecord?.diagnostic || "None")}</dd></div>
      <div class="wide"><dt>ALGORITHM BOUNDARY</dt><dd>${safe(evidence.algorithm_boundary || hardEvidence.algorithm_boundary || clearanceEvidence.algorithm_boundary)}</dd></div>
      <div class="wide"><dt>MODEL_A_SHA256</dt><dd>${safe(hardEvidence.model_a_sha256)}</dd></div>
      <div class="wide"><dt>MODEL_B_SHA256</dt><dd>${safe(hardEvidence.model_b_sha256)}</dd></div>
    </dl>
    <p class="evidence-disclaimer">${language() === "en" ? "Deterministic evidence is authoritative. Unsupported or unreliable geometry must remain NOT_EVALUATED. This output is not certified engineering review." : "确定性证据始终权威。无法支持或不可靠的几何必须保持 NOT_EVALUATED。本输出不是正式工程认证。"}</p>
  `;
}

async function selectRecord(record) {
  if (!record) return;
  state.selected = record;
  renderRecords();
  elements.viewport_case.textContent = `${record.caseId} · ${statusLabel(record.status)} · ${record.status}`;
  elements.selected_summary.innerHTML = `
    <div><p class="panel-label">SELECTED RECORD</p><strong>${safe(statusLabel(record.status))} · ${safe(record.status)}</strong></div>
    <dl><div><dt>${safe(msg("selectedRule"))}</dt><dd>${safe(record.rule_id)}</dd></div><div><dt>${safe(msg("selectedPair"))}</dt><dd>${safe(record.element_a.global_id)} ↔ ${safe(record.element_b.global_id)}</dd></div></dl>
    <button type="button" id="open-evidence">${safe(msg("evidence"))} →</button>
  `;
  elements.selected_summary.querySelector("#open-evidence").addEventListener("click", openEvidence);
  elements.evidence_content.innerHTML = recordEvidence(record);
  refreshAiState();
  await updateViewer(record);
}

async function updateViewer(record) {
  const source = state.sources.get(record.sourceId);
  if (!source) return;
  elements.viewer_loading.hidden = false;
  elements.viewer_loading.querySelector("p").textContent = msg("loading3d");
  try {
    viewer ||= new ClashViewer(elements.viewer);
    if (state.viewerSource !== record.sourceId) {
      await viewer.loadPair(source.mepBytes, source.structureBytes);
      state.viewerSource = record.sourceId;
    }
    viewer.focusRecord(record);
    elements.viewer_loading.hidden = true;
    elements.viewer_equivalent.textContent = msg("loaded3d");
  } catch (error) {
    console.error(error);
    elements.viewer_loading.querySelector("p").textContent = msg("viewerFailed");
    elements.viewer_equivalent.textContent = msg("viewerFailed");
  }
}

function openEvidence() {
  elements.evidence_drawer.hidden = false;
  elements.close_evidence.focus();
}

function refreshAiState() {
  if (!elements.ai_description) return;
  const enabled = getPreferences().aiEnabled;
  elements.ai_description.textContent = msg(enabled ? "aiOn" : "aiOff");
  elements.preview_ai_fields.disabled = !enabled || state.records.length === 0;
  elements.preview_ai_fields.textContent = msg(enabled ? "aiButtonOn" : "aiButtonOff");
  if (!enabled) elements.ai_preview.hidden = true;
}

function requestPreviewHtml(request) {
  const summary = Object.entries(request.summary).map(([status, count]) => `<span>${safe(status)} · ${safe(count)}</span>`).join("");
  const records = request.records.map(record => `<li><strong>${safe(record.record_ref)}</strong><span>${safe(record.status)} · ${safe(record.element_a_type)} ↔ ${safe(record.element_b_type)} · ${safe(record.measurement.kind)}</span></li>`).join("");
  return `<div class="field-chips">${summary}</div><ul class="ai-field-list">${records}</ul>`;
}

async function showAiPreview() {
  state.aiOperation += 1;
  const operation = state.aiOperation;
  const priorController = state.aiController;
  state.aiController = null;
  priorController?.abort();
  let aiRequest;
  try {
    aiRequest = prepareAiRequest(state.records, language());
  } catch {
    state.aiRequest = null;
    state.aiResult = null;
    elements.ai_preview.innerHTML = `
      <div class="ai-preview-head"><h5>${safe(msg("aiPreviewTitle"))}</h5><button type="button" class="ai-close" data-ai-action="close" aria-label="${safe(msg("aiClose"))}">×</button></div>
      <p class="ai-error">${safe(msg("aiTooManyRecords", { count: AI_MAX_RECORDS }))}</p>
      <div class="ai-actions"><button type="button" class="text-button" data-ai-action="close">${safe(msg("aiClose"))}</button></div>`;
    elements.ai_preview.hidden = false;
    bindAiPanelActions();
    return;
  }
  state.aiRequest = aiRequest;
  state.aiResult = null;
  const aiStatus = await fetchAiStatus();
  if (operation !== state.aiOperation || state.aiRequest !== aiRequest) return;
  state.aiStatus = aiStatus;
  elements.ai_preview.innerHTML = `
    <div class="ai-preview-head"><h5>${safe(msg("aiPreviewTitle"))}</h5><button type="button" class="ai-close" data-ai-action="close" aria-label="${safe(msg("aiClose"))}">×</button></div>
    <p>${safe(msg("aiPreviewBody"))}</p>
    ${requestPreviewHtml(aiRequest)}
    <p class="ai-provider-boundary">${safe(msg("aiProviderBoundary"))}</p>
    <label class="ai-consent"><input type="checkbox" id="ai-send-consent"><span>${safe(msg("aiConsent"))}</span></label>
    <div class="ai-actions"><button type="button" class="button button-primary" data-ai-action="send" disabled>${safe(msg("aiSend"))}</button><button type="button" class="text-button" data-ai-action="close">${safe(msg("aiClose"))}</button></div>
    <p class="ai-availability">${safe(msg(state.aiStatus.configured ? "aiServiceReady" : "aiServiceLocal"))}</p>`;
  elements.ai_preview.hidden = false;
  bindAiPanelActions();
}

function attentionLabel(value) {
  const key = value === "review_first" ? "aiAttentionReviewFirst" : value === "review_next" ? "aiAttentionReviewNext" : "aiAttentionInformational";
  return msg(key);
}

function findRecordByRef(ref) {
  const index = Number.parseInt(ref.slice(1), 10) - 1;
  return state.records[index] || null;
}

function interpretationText(result) {
  return [result.interpretation.overview, ...result.interpretation.ordered_records.flatMap(item => [`${item.record_ref} · ${attentionLabel(item.attention)}`, item.rationale, item.next_step]), ...result.interpretation.global_limits].join("\n");
}

function aiFailureMessage(code) {
  if (code === "provider_unconfigured") return msg("aiUnavailable");
  if (code === "rate_limited" || code === "quota_exhausted") return msg("aiBusy");
  if (code === "timeout" || code === "network_error") return msg("aiConnectionFailed");
  return msg("aiNotGenerated");
}

function renderAiResult(result) {
  state.aiResult = result;
  const badge = result.mode === "provider" ? msg("aiGenerated") : msg("aiFallback");
  const cards = result.interpretation.ordered_records.map(item => {
    const record = findRecordByRef(item.record_ref);
    return `<article class="ai-record"><header><strong>${safe(item.record_ref)} · ${safe(attentionLabel(item.attention))}</strong><span>${safe(record?.status || "NOT_EVALUATED")}</span></header><div class="ai-record-body"><p><b>${safe(msg("aiRecordAnalysis"))}</b>${safe(item.rationale)}</p><p><b>${safe(msg("aiReviewFocus"))}</b>${safe(item.next_step)}</p></div></article>`;
  }).join("");
  const error = result.error ? `<p class="ai-error">${safe(aiFailureMessage(result.error.code))}</p>` : "";
  elements.ai_preview.innerHTML = `
    <div class="ai-preview-head"><h5>${safe(badge)}</h5><button type="button" class="ai-close" data-ai-action="close" aria-label="${safe(msg("aiClose"))}">×</button></div>
    ${error}<section class="ai-overview"><strong>${safe(msg("aiOverviewTitle"))}</strong><p>${safe(result.interpretation.overview)}</p></section><div class="ai-records">${cards}</div>
    <ul class="ai-limit-list">${result.interpretation.global_limits.map(item => `<li>${safe(item)}</li>`).join("")}</ul>
    <div class="ai-actions">${result.error?.retryable ? `<button type="button" class="button button-secondary" data-ai-action="retry">${safe(msg("aiRetry"))}</button>` : ""}<button type="button" class="button button-secondary" data-ai-action="copy">${safe(msg("aiCopy"))}</button><button type="button" class="text-button" data-ai-action="close">${safe(msg("aiClose"))}</button></div>`;
  bindAiPanelActions();
}

async function submitAiRequest() {
  if (!state.aiRequest || state.aiController) return;
  const aiRequest = state.aiRequest;
  const operation = ++state.aiOperation;
  const controller = new AbortController();
  state.aiController = controller;
  elements.ai_preview.innerHTML = `<div class="ai-preview-head"><h5>${safe(msg("aiSending"))}</h5></div><div class="ai-actions"><button type="button" class="button button-secondary" data-ai-action="cancel">${safe(msg("aiCancel"))}</button></div>`;
  bindAiPanelActions();
  try {
    const result = await requestAiInterpretation(aiRequest, { signal: controller.signal });
    if (operation !== state.aiOperation || state.aiController !== controller || state.aiRequest !== aiRequest) return;
    renderAiResult(result);
  } catch (error) {
    if (operation !== state.aiOperation || state.aiController !== controller || state.aiRequest !== aiRequest) return;
    if (error.code === "cancelled") {
      await showAiPreview();
      return;
    }
    renderAiResult({ mode: "deterministic_fallback", interpretation: await import("/app/ai/contract.mjs").then(module => module.deterministicFallback(aiRequest)), error: { code: error.code || "unknown", retryable: error.retryable === true } });
  } finally {
    if (state.aiController === controller) state.aiController = null;
  }
}

function closeAiPanel() {
  invalidateAiFlow();
  elements.preview_ai_fields.focus();
}

function bindAiPanelActions() {
  const consent = elements.ai_preview.querySelector("#ai-send-consent");
  const send = elements.ai_preview.querySelector('[data-ai-action="send"]');
  consent?.addEventListener("change", () => { send.disabled = !consent.checked; });
  elements.ai_preview.querySelectorAll("[data-ai-action]").forEach(button => button.addEventListener("click", async () => {
    if (button.dataset.aiAction === "send") await submitAiRequest();
    if (button.dataset.aiAction === "retry") await showAiPreview();
    if (button.dataset.aiAction === "cancel") state.aiController?.abort();
    if (button.dataset.aiAction === "close") closeAiPanel();
    if (button.dataset.aiAction === "copy" && state.aiResult) {
      try {
        await navigator.clipboard.writeText(interpretationText(state.aiResult));
        button.textContent = msg("aiCopied");
      } catch {
        button.textContent = msg("aiCopy");
      }
    }
  }));
}

function bindEvents() {
  elements.use_example.addEventListener("click", () => chooseExample());
  elements.example_select.addEventListener("change", () => { state.selection = elements.example_select.value; if (state.mode === "example") refreshRunDescription(); });
  elements.mep_file.addEventListener("change", event => handleFile("mep", event.currentTarget.files[0]));
  elements.structure_file.addEventListener("change", event => handleFile("structure", event.currentTarget.files[0]));
  elements.run_checks.addEventListener("click", runChecks);
  elements.new_run.addEventListener("click", () => { elements.review_panel.hidden = true; elements.setup_panel.scrollIntoView({ behavior: "smooth" }); });
  document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(item => item.classList.toggle("active", item === button));
    renderRecords();
  }));
  elements.close_evidence.addEventListener("click", () => { elements.evidence_drawer.hidden = true; elements.selected_summary.querySelector("button")?.focus(); });
  elements.preview_ai_fields.addEventListener("click", showAiPreview);
  elements.focus_selected.addEventListener("click", () => viewer?.resetFocus());
  elements.fit_models.addEventListener("click", () => viewer?.fitModels());
  elements.toggle_isolate.addEventListener("click", () => {
    const isolated = viewer?.toggleIsolate();
    elements.toggle_isolate.textContent = msg(isolated ? "restore" : "isolate");
  });
  globalThis.addEventListener("resize", updateDesktopBoundary);
  document.addEventListener("ifcclashtrace:preferences", translateStatic);
}

initializePreferences();
bindEvents();
chooseExample({ focusRun: false });
updateDesktopBoundary();
translateStatic();
elements.viewer_loading.hidden = true;
document.documentElement.dataset.g4Ready = "true";
