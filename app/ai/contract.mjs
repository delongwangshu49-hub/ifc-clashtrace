export const AI_CONTRACT_VERSION = "G4AI_COORDINATION_ANALYSIS_V2";
export const AI_PROVIDER_ID = "groq";
export const AI_PROVIDER_MODEL = "openai/gpt-oss-20b";

export const RULE_BOUNDARIES = Object.freeze({
  hard_clash: Object.freeze({
    rule_id: "MEP_STRUCTURE_HARD_CLASH_V1",
    tolerance_m: 0.002,
    authority: "deterministic_geometry",
  }),
  clearance: Object.freeze({
    rule_id: "MEP_STRUCTURE_CLEARANCE_WARNING_V1",
    threshold_m: 0.05,
    authority: "deterministic_surface_distance",
  }),
});

const STATUS_VALUES = new Set(["CLASH", "WARNING", "CLEAR", "NOT_EVALUATED"]);
const ENTITY_A_VALUES = new Set(["IfcPipeSegment"]);
const ENTITY_B_VALUES = new Set(["IfcWall", "IfcBeam"]);
const ATTENTION_VALUES = new Set(["review_first", "review_next", "informational"]);
const FORBIDDEN_AI_TEXT = /\b(?:CLASH|WARNING|CLEAR|NOT_EVALUATED)\b|\b\d+(?:\.\d+)?\s*(?:mm|m)\b|https?:\/\//iu;

function finiteOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function normalizedEntity(value, allowed) {
  return allowed.has(value) ? value : "UNAVAILABLE";
}

function normalizedStatus(record) {
  return STATUS_VALUES.has(record?.status) ? record.status : "NOT_EVALUATED";
}

function normalizedRuleId(record, status) {
  if (record?.rule_id === RULE_BOUNDARIES.hard_clash.rule_id || record?.rule_id === RULE_BOUNDARIES.clearance.rule_id) return record.rule_id;
  return status === "WARNING" || record?.clearanceRecord ? RULE_BOUNDARIES.clearance.rule_id : RULE_BOUNDARIES.hard_clash.rule_id;
}

function recordMeasurement(record, status) {
  if (status === "WARNING" || status === "CLEAR") {
    return {
      kind: "surface_clearance",
      value_m: finiteOrNull(record?.clearanceRecord?.clearance_distance_m ?? record?.clearance_distance_m),
      threshold_m: RULE_BOUNDARIES.clearance.threshold_m,
    };
  }
  if (status === "CLASH") {
    return {
      kind: "hard_clash_tolerance",
      value_m: null,
      threshold_m: RULE_BOUNDARIES.hard_clash.tolerance_m,
    };
  }
  return { kind: "not_evaluated", value_m: null, threshold_m: null };
}

export function buildMinimalAiRequest(records, locale = "en") {
  if (!Array.isArray(records) || records.length === 0) throw new Error("At least one deterministic record is required");
  if (records.length > 40) throw new Error("AI interpretation is limited to 40 deterministic records per request");
  const safeLocale = locale === "zh-CN" ? "zh-CN" : "en";
  const minimalRecords = records.map((record, index) => {
    const status = normalizedStatus(record);
    return {
      record_ref: `R${String(index + 1).padStart(2, "0")}`,
      status,
      rule_id: normalizedRuleId(record, status),
      element_a_type: normalizedEntity(record?.element_a?.entity_type, ENTITY_A_VALUES),
      element_b_type: normalizedEntity(record?.element_b?.entity_type, ENTITY_B_VALUES),
      measurement: recordMeasurement(record, status),
    };
  });
  const summary = Object.fromEntries([...STATUS_VALUES].map(status => [status, minimalRecords.filter(record => record.status === status).length]));
  return {
    contract_version: AI_CONTRACT_VERSION,
    locale: safeLocale,
    deterministic_results_are_authoritative: true,
    rule_boundaries: RULE_BOUNDARIES,
    summary,
    records: minimalRecords,
  };
}

function assertExactKeys(value, expected, label) {
  const keys = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (keys.length !== wanted.length || keys.some((key, index) => key !== wanted[index])) {
    throw new Error(`${label} contains unexpected or missing fields`);
  }
}

export function validateMinimalAiRequest(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Request must be an object");
  assertExactKeys(value, ["contract_version", "locale", "deterministic_results_are_authoritative", "rule_boundaries", "summary", "records"], "Request");
  if (value.contract_version !== AI_CONTRACT_VERSION) throw new Error("Unsupported AI contract version");
  if (!new Set(["zh-CN", "en"]).has(value.locale)) throw new Error("Unsupported locale");
  if (value.deterministic_results_are_authoritative !== true) throw new Error("Deterministic authority acknowledgement is required");
  if (JSON.stringify(value.rule_boundaries) !== JSON.stringify(RULE_BOUNDARIES)) throw new Error("Rule boundaries do not match the frozen contract");
  assertExactKeys(value.summary, [...STATUS_VALUES], "Summary");
  if (!Array.isArray(value.records) || value.records.length === 0 || value.records.length > 40) throw new Error("Record count is outside the supported boundary");
  const refs = new Set();
  const computedSummary = Object.fromEntries([...STATUS_VALUES].map(status => [status, 0]));
  value.records.forEach((record, index) => {
    assertExactKeys(record, ["record_ref", "status", "rule_id", "element_a_type", "element_b_type", "measurement"], `Record ${index + 1}`);
    if (!/^R\d{2}$/.test(record.record_ref) || refs.has(record.record_ref)) throw new Error("Record references must be unique local aliases");
    refs.add(record.record_ref);
    if (!STATUS_VALUES.has(record.status)) throw new Error("Record status is outside the deterministic contract");
    if (!new Set([RULE_BOUNDARIES.hard_clash.rule_id, RULE_BOUNDARIES.clearance.rule_id]).has(record.rule_id)) throw new Error("Record rule is outside the deterministic contract");
    if (!new Set([...ENTITY_A_VALUES, "UNAVAILABLE"]).has(record.element_a_type)) throw new Error("MEP type is outside the supported contract");
    if (!new Set([...ENTITY_B_VALUES, "UNAVAILABLE"]).has(record.element_b_type)) throw new Error("Structure type is outside the supported contract");
    assertExactKeys(record.measurement, ["kind", "value_m", "threshold_m"], `Measurement ${index + 1}`);
    if (!new Set(["surface_clearance", "hard_clash_tolerance", "not_evaluated"]).has(record.measurement.kind)) throw new Error("Measurement kind is invalid");
    for (const key of ["value_m", "threshold_m"]) if (record.measurement[key] !== null && !Number.isFinite(record.measurement[key])) throw new Error("Measurements must be finite or null");
    computedSummary[record.status] += 1;
  });
  for (const status of STATUS_VALUES) if (value.summary[status] !== computedSummary[status]) throw new Error("Summary does not match deterministic records");
  return value;
}

function validateText(value, label, maxLength) {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > maxLength) throw new Error(`${label} is missing or too long`);
  if (FORBIDDEN_AI_TEXT.test(value)) throw new Error(`${label} attempts to restate a deterministic status, measurement, or URL`);
}

function validateLocaleText(value, locale, label) {
  const containsHan = /[\u3400-\u9fff]/u.test(value);
  if (locale === "zh-CN" && !containsHan) throw new Error(`${label} does not match the requested Chinese locale`);
  if (locale === "en" && containsHan) throw new Error(`${label} does not match the requested English locale`);
}

export function actionableRecordRefs(request) {
  return request.records.filter(record => record.status !== "CLEAR").map(record => record.record_ref);
}

export function validateAiInterpretation(value, request) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("AI response must be an object");
  assertExactKeys(value, ["overview", "ordered_records", "global_limits"], "AI response");
  validateText(value.overview, "Overview", 900);
  validateLocaleText(value.overview, request.locale, "Overview");
  if (!Array.isArray(value.ordered_records)) throw new Error("Ordered records must be an array");
  const expectedRefs = new Set(actionableRecordRefs(request));
  const receivedRefs = new Set();
  for (const item of value.ordered_records) {
    assertExactKeys(item, ["record_ref", "attention", "rationale", "next_step"], "AI record");
    if (!expectedRefs.has(item.record_ref) || receivedRefs.has(item.record_ref)) throw new Error("AI response contains an unknown or duplicate record reference");
    if (!ATTENTION_VALUES.has(item.attention)) throw new Error("AI attention label is invalid");
    validateText(item.rationale, "Rationale", 700);
    validateText(item.next_step, "Next step", 360);
    validateLocaleText(item.rationale, request.locale, "Rationale");
    validateLocaleText(item.next_step, request.locale, "Next step");
    receivedRefs.add(item.record_ref);
  }
  if (receivedRefs.size !== expectedRefs.size || [...expectedRefs].some(ref => !receivedRefs.has(ref))) throw new Error("AI response must cover every non-clear deterministic record exactly once");
  if (!Array.isArray(value.global_limits) || value.global_limits.length !== 2) throw new Error("AI response must contain exactly two limitations");
  value.global_limits.forEach((item, index) => validateText(item, `Limitation ${index + 1}`, 300));
  return value;
}

export function deterministicFallback(request, locale = request?.locale) {
  const records = request.records.filter(record => record.status !== "CLEAR");
  const zh = locale === "zh-CN";
  const content = {
    CLASH: zh ? {
      attention: "review_first",
      rationale: "现有几何证据表明管线与结构实体之间存在超过既定容差的直接冲突，因此这条关系最可能阻断当前协调方案。它应先于净距问题和证据补齐项处理，避免后续方案建立在尚未消除的冲突上。",
      next_step: "先在确定性证据视图中核对双方构件与冲突位置，再由项目团队评估是否需要改线、开洞或其他协调措施。",
    } : {
      attention: "review_first",
      rationale: "The geometry evidence shows a direct pipe-to-structure conflict beyond the established tolerance, so this relationship is the most likely to block the current coordination route. Review it before clearance and evidence-repair items so later decisions are not built around an unresolved conflict.",
      next_step: "Verify both components and the conflict location in the deterministic evidence view, then let the project team assess whether rerouting, an opening, or another coordination measure is needed.",
    },
    WARNING: zh ? {
      attention: "review_next",
      rationale: "这条关系没有进入直接冲突队列，但现有表面净距低于已冻结的协调阈值，说明可用协调余量不足。它适合在直接冲突之后复核，并与相邻调整一起考虑，避免方案修改后形成新的冲突。",
      next_step: "核对最近位置及双方构件，再由项目团队比较当前路径与可评估的协调替代方案。",
    } : {
      attention: "review_next",
      rationale: "This relationship is not in the direct-conflict queue, but its existing surface clearance is below the frozen coordination threshold, leaving limited coordination margin. Review it after the direct conflict and alongside nearby changes so a revised route does not introduce a new conflict.",
      next_step: "Verify the closest location and both components, then let the project team compare the current route with available coordination alternatives.",
    },
    NOT_EVALUATED: zh ? {
      attention: "informational",
      rationale: "自动化路径缺少形成可靠结论所需的几何证据，因此这条记录不能被理解为没有问题。它的处置可晚于已确认的冲突，但在关闭本轮协调问题之前必须补齐源几何或坐标证据。",
      next_step: "先修复或核验源模型的几何与坐标条件，重新运行确定性检查后再决定是否需要协调动作。",
    } : {
      attention: "informational",
      rationale: "The automated path lacks enough geometry evidence for a reliable conclusion, so this record must not be read as problem-free. It can follow confirmed conflicts in the queue, but its source geometry or coordinate evidence must be repaired before this review is closed.",
      next_step: "Repair or verify the source geometry and coordinate conditions, rerun the deterministic check, and only then decide whether coordination action is needed.",
    },
  };
  return {
    overview: zh
      ? "这组结果不应被当作同一种问题处理：先解决已有几何证据确认的直接冲突，再检查低于协调阈值的邻近关系；无法求值的记录需要补齐证据，不能被当作安全结论。已求值清晰的关系可暂不进入当前协调队列，但其机器记录仍完整保留。"
      : "These results should not be treated as one type of issue: resolve the evidence-backed direct conflict first, then review the below-threshold relationship, while repairing evidence for the unevaluated item rather than treating it as safe. Evaluated-clear relationships can stay outside the active coordination queue while their machine records remain intact.",
    ordered_records: records.map(record => ({ record_ref: record.record_ref, ...content[record.status] })),
    global_limits: zh
      ? ["这是依据既有结构化字段生成的本地降级分析，不是新的检测结论。", "任何改线、开洞、放行或其他项目行动仍须由合格审阅者依据完整证据决定。"]
      : ["This is a local fallback analysis derived only from existing structured fields, not a new detection conclusion.", "A qualified reviewer must decide any rerouting, opening, acceptance, or other project action from the full evidence."],
  };
}
