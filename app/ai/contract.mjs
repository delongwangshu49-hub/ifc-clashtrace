export const AI_CONTRACT_VERSION = "G4AI_MINIMAL_RECORDS_V1";
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

export function actionableRecordRefs(request) {
  return request.records.filter(record => record.status !== "CLEAR").map(record => record.record_ref);
}

export function validateAiInterpretation(value, request) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("AI response must be an object");
  assertExactKeys(value, ["overview", "ordered_records", "global_limits"], "AI response");
  validateText(value.overview, "Overview", 600);
  if (!Array.isArray(value.ordered_records)) throw new Error("Ordered records must be an array");
  const expectedRefs = new Set(actionableRecordRefs(request));
  const receivedRefs = new Set();
  for (const item of value.ordered_records) {
    assertExactKeys(item, ["record_ref", "attention", "rationale", "next_step"], "AI record");
    if (!expectedRefs.has(item.record_ref) || receivedRefs.has(item.record_ref)) throw new Error("AI response contains an unknown or duplicate record reference");
    if (!ATTENTION_VALUES.has(item.attention)) throw new Error("AI attention label is invalid");
    validateText(item.rationale, "Rationale", 400);
    validateText(item.next_step, "Next step", 400);
    receivedRefs.add(item.record_ref);
  }
  if (receivedRefs.size !== expectedRefs.size || [...expectedRefs].some(ref => !receivedRefs.has(ref))) throw new Error("AI response must cover every non-clear deterministic record exactly once");
  if (!Array.isArray(value.global_limits) || value.global_limits.length !== 2) throw new Error("AI response must contain exactly two limitations");
  value.global_limits.forEach((item, index) => validateText(item, `Limitation ${index + 1}`, 300));
  return value;
}

export function deterministicFallback(request, locale = request?.locale) {
  const refs = actionableRecordRefs(request);
  if (locale === "zh-CN") {
    return {
      overview: "AI 解读当前不可用。确定性结果仍完整可用；请按原始记录与证据抽屉进行人工复核。",
      ordered_records: refs.map((record_ref, index) => ({ record_ref, attention: index === 0 ? "review_first" : "review_next", rationale: "该条记录需要依据确定性证据人工复核。", next_step: "检查双方构件身份、规则边界与原始几何证据。" })),
      global_limits: ["此文本由本地确定性模板生成，并非模型输出。", "模板不会新增、删除或改变任何检测记录。"],
    };
  }
  return {
    overview: "AI interpretation is unavailable. The deterministic results remain complete; review the original records and evidence drawer.",
    ordered_records: refs.map((record_ref, index) => ({ record_ref, attention: index === 0 ? "review_first" : "review_next", rationale: "This record requires human review against its deterministic evidence.", next_step: "Check both component identities, the rule boundary, and the original geometry evidence." })),
    global_limits: ["This text is a local deterministic template, not model output.", "The template cannot add, remove, or change any detection record."],
  };
}

export const GROQ_RESPONSE_SCHEMA = Object.freeze({
  type: "object",
  properties: {
    overview: { type: "string" },
    ordered_records: {
      type: "array",
      items: {
        type: "object",
        properties: {
          record_ref: { type: "string" },
          attention: { type: "string", enum: ["review_first", "review_next", "informational"] },
          rationale: { type: "string" },
          next_step: { type: "string" },
        },
        required: ["record_ref", "attention", "rationale", "next_step"],
        additionalProperties: false,
      },
    },
    global_limits: { type: "array", minItems: 2, maxItems: 2, items: { type: "string" } },
  },
  required: ["overview", "ordered_records", "global_limits"],
  additionalProperties: false,
});
