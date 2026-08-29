import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildMinimalAiRequest, deterministicFallback } from "../app/ai/contract.mjs";
import { interpretOrFallback } from "../app/ai/provider-neutral.mjs";
import { createG4AiServer } from "./g4ai-local-server.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const outputPath = path.join(projectRoot, "outputs/local-only/g5/ai-evaluation.json");

const deterministicRecords = [
  { status: "CLASH", rule_id: "MEP_STRUCTURE_HARD_CLASH_V1", element_a: { entity_type: "IfcPipeSegment" }, element_b: { entity_type: "IfcWall" } },
  { status: "WARNING", rule_id: "MEP_STRUCTURE_CLEARANCE_WARNING_V1", element_a: { entity_type: "IfcPipeSegment" }, element_b: { entity_type: "IfcBeam" }, clearance_distance_m: 0.049 },
  { status: "CLEAR", rule_id: "MEP_STRUCTURE_CLEARANCE_WARNING_V1", element_a: { entity_type: "IfcPipeSegment" }, element_b: { entity_type: "IfcWall" }, clearance_distance_m: 0.05 },
  { status: "NOT_EVALUATED", rule_id: "MEP_STRUCTURE_HARD_CLASH_V1", element_a: { entity_type: "IfcPipeSegment" }, element_b: { entity_type: "IfcWall" } },
];
const request = buildMinimalAiRequest(deterministicRecords, "en");

function validInterpretation(value = request) {
  const content = {
    R01: {
      attention: "review_first",
      rationale: "The geometry evidence identifies the direct conflict as the first coordination item. Its evidence should be reviewed before nearby margin or missing-evidence records.",
      next_step: "Verify both referenced components and the recorded location in the deterministic evidence view.",
    },
    R02: {
      attention: "review_next",
      rationale: "The recorded relationship has limited coordination margin without becoming a direct conflict. Review it after the direct conflict while keeping the deterministic record unchanged.",
      next_step: "Verify the closest recorded relationship in the deterministic evidence view.",
    },
    R04: {
      attention: "informational",
      rationale: "The automated path lacks enough evidence for a reliable conclusion. This item needs source evidence verification before the coordination review can close.",
      next_step: "Verify the source geometry and coordinate evidence, then rerun the deterministic check.",
    },
  };
  return {
    overview: "The evidence separates a direct conflict, a limited-margin relationship, and an item without enough evidence. Review them in that order while preserving the machine records as the sole authority.",
    ordered_records: value.records.filter(record => record.status !== "CLEAR").map(record => ({ record_ref: record.record_ref, ...content[record.record_ref] })),
    global_limits: ["This interpretation uses only the supplied structured evidence.", "Qualified reviewers decide any project action from the full evidence."],
  };
}

function sleep(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

async function scenario(name, provider, expectedMode, expectedCode = null) {
  const before = JSON.stringify(request);
  const result = await interpretOrFallback({ provider, request, timeoutMs: 1000 });
  const after = JSON.stringify(request);
  const fallbackMatches = result.mode !== "deterministic_fallback" || JSON.stringify(result.interpretation) === JSON.stringify(deterministicFallback(request));
  return {
    name,
    expected_mode: expectedMode,
    observed_mode: result.mode,
    expected_error_code: expectedCode,
    observed_error_code: result.error?.code ?? null,
    deterministic_request_unchanged: before === after,
    fallback_exactly_local: fallbackMatches,
    pass: result.mode === expectedMode && (expectedCode === null || result.error?.code === expectedCode) && before === after && fallbackMatches,
  };
}

async function endpointLatencies(provider) {
  const server = createG4AiServer({ provider, timeoutMs: 1000 });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}/api/g4ai/interpret`;
  const results = [];
  try {
    for (let index = 0; index < 5; index += 1) {
      const started = performance.now();
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(request),
      });
      const firstByte = performance.now();
      const body = await response.json();
      const completed = performance.now();
      if (!response.ok || body.mode !== "provider") throw new Error("Mock endpoint did not return provider mode");
      results.push({ first_byte_ms: firstByte - started, completion_ms: completed - started });
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
  return results;
}

function summary(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return { minimum: sorted[0], median: sorted[Math.floor(sorted.length / 2)], maximum: sorted.at(-1) };
}

async function main() {
  const validProvider = { interpret: async (value, { signal }) => { await sleep(25, signal); return validInterpretation(value); } };
  const scenarios = [
    await scenario("valid_bounded_prose", validProvider, "provider"),
    await scenario("provider_unconfigured", null, "deterministic_fallback", "provider_unconfigured"),
    await scenario("malformed_object", { interpret: async () => ({}) }, "deterministic_fallback", "semantic_rejected"),
    await scenario("machine_status_injection", { interpret: async () => ({ ...validInterpretation(), overview: "The machine result is CLASH." }) }, "deterministic_fallback", "semantic_rejected"),
    await scenario("measurement_injection", { interpret: async () => ({ ...validInterpretation(), overview: "The recorded distance is 49 mm." }) }, "deterministic_fallback", "semantic_rejected"),
    await scenario("unknown_reference", { interpret: async () => { const value = validInterpretation(); value.ordered_records[0].record_ref = "R99"; return value; } }, "deterministic_fallback", "semantic_rejected"),
  ];
  const latencies = await endpointLatencies(validProvider);
  const passed = scenarios.filter(item => item.pass).length;
  const output = {
    status: passed === scenarios.length ? "PASS" : "FAIL",
    evaluated_on: "2026-08-29",
    scope: "project-local mock provider and same-origin HTTP endpoint; no API key and no external request",
    factual_preservation: {
      checks_passed: passed,
      checks_total: scenarios.length,
      rate: passed / scenarios.length,
      definition: "The deterministic request remains byte-for-byte identical; invalid prose fails to the exact local template; provider prose has no machine-status or measurement fields.",
    },
    degradation: {
      tested: scenarios.filter(item => item.expected_mode === "deterministic_fallback").length,
      exact_local_fallbacks: scenarios.filter(item => item.expected_mode === "deterministic_fallback" && item.fallback_exactly_local).length,
    },
    latency_ms: {
      measurement_boundary: "POST start to response headers/first readable response, then parsed JSON completion; server returns a non-streaming JSON body after provider completion",
      sample_count: latencies.length,
      first_byte: summary(latencies.map(item => item.first_byte_ms)),
      completion: summary(latencies.map(item => item.completion_ms)),
      samples: latencies,
    },
    human_readability_check: {
      status: "PASS",
      evidence: "G4AI-R3 L-0054 human content audit accepted both English and Simplified Chinese bounded-prose provider results after unsupported-claim repair.",
      limitation: "G5 did not make a new live request or retain provider prose; this reuses the dated, authorized human review rather than claiming a fresh blind study.",
    },
    scenarios,
  };
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (output.status !== "PASS") process.exitCode = 3;
}

await main();
