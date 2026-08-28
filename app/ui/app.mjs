import { IfcAPI } from "web-ifc";

import { evaluateIfcPair } from "/app/core/ifc-clash-engine.mjs";
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
    aiOff: "AI 解读当前关闭。开启偏好也不会发送任何数据；G4 仅提供字段预览占位，不连接提供商。",
    aiOn: "AI 解读偏好已开启。G4 只预览拟发送字段并给出确定性模板；提供商/API 集成属于后续 G4AI。",
    aiButtonOff: "先开启 AI 解读",
    aiButtonOn: "预览拟发送字段",
    aiPreviewTitle: "G4 字段预览（未发送）",
    aiPreviewBody: "只会建议发送以下结构化字段：状态、规则 ID、双方类型/GUID、阈值或净距、证书与公开算法边界。IFC 字节、网格、文件名、路径与浏览器元数据均排除。",
    aiNoProvider: "本阶段没有提供商或 API 请求。确定性模板：请复核记录状态、双方构件身份、阈值证据和失败诊断；任何后续 AI 文本都不能更改本记录。",
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
    aiOff: "AI interpretation is off. Enabling it sends nothing; G4 provides only a field-preview placeholder and connects to no provider.",
    aiOn: "AI interpretation is enabled. G4 only previews proposed fields and shows a deterministic template; provider/API integration belongs to G4AI.",
    aiButtonOff: "Enable AI interpretation first",
    aiButtonOn: "Preview proposed fields",
    aiPreviewTitle: "G4 field preview (not sent)",
    aiPreviewBody: "Only these structured fields would be proposed: status, rule ID, both types/GUIDs, threshold or clearance, certificate, and the public algorithm boundary. IFC bytes, meshes, filenames, paths, and browser metadata are excluded.",
    aiNoProvider: "No provider or API request exists in this Gate. Deterministic template: review the record status, both component identities, threshold evidence, and failure diagnostic. Any later AI text cannot change this record.",
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
  const useEnglish = language() === "en";
  document.querySelectorAll("[data-zh][data-en]").forEach(element => { element.textContent = useEnglish ? element.dataset.en : element.dataset.zh; });
  document.title = useEnglish ? "IFC ClashTrace — Functional workspace" : "IFC ClashTrace — 功能工作台";
  refreshAiState();
  refreshRunDescription();
  renderRecords();
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

async function handleFile(role, file) {
  const status = role === "mep" ? elements.mep_status : elements.structure_status;
  const input = role === "mep" ? elements.mep_file : elements.structure_file;
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

function chooseExample() {
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
  elements.run_checks.focus();
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
  state.records = [];
  state.sources.clear();
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
  elements.preview_ai_fields.disabled = !enabled || !state.selected;
  elements.preview_ai_fields.textContent = msg(enabled ? "aiButtonOn" : "aiButtonOff");
  if (!enabled) elements.ai_preview.hidden = true;
}

function showAiPreview() {
  elements.ai_preview.innerHTML = `<h5>${safe(msg("aiPreviewTitle"))}</h5><p>${safe(msg("aiPreviewBody"))}</p><div class="field-chips"><span>status</span><span>rule_id</span><span>element_a</span><span>element_b</span><span>threshold</span><span>certificate</span></div><p class="deterministic-template">${safe(msg("aiNoProvider"))}</p>`;
  elements.ai_preview.hidden = false;
}

function bindEvents() {
  elements.use_example.addEventListener("click", chooseExample);
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
chooseExample();
updateDesktopBoundary();
translateStatic();
elements.viewer_loading.hidden = true;
document.documentElement.dataset.g4Ready = "true";
