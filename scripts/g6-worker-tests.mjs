import assert from "node:assert/strict";
import worker from "../worker/index.mjs";

const origin = "https://private-preview.invalid";
const requestBody = {
  contract_version: "G4AI_COORDINATION_ANALYSIS_V2",
  locale: "en",
  deterministic_results_are_authoritative: true,
  rule_boundaries: {
    hard_clash: { rule_id: "MEP_STRUCTURE_HARD_CLASH_V1", tolerance_m: 0.002, authority: "deterministic_geometry" },
    clearance: { rule_id: "MEP_STRUCTURE_CLEARANCE_WARNING_V1", threshold_m: 0.05, authority: "deterministic_surface_distance" },
  },
  summary: { CLASH: 1, WARNING: 0, CLEAR: 0, NOT_EVALUATED: 0 },
  records: [{
    record_ref: "R01",
    status: "CLASH",
    rule_id: "MEP_STRUCTURE_HARD_CLASH_V1",
    element_a_type: "IfcPipeSegment",
    element_b_type: "IfcWall",
    measurement: { kind: "hard_clash_tolerance", value_m: null, threshold_m: 0.002 },
  }],
};

const statusResponse = await worker.fetch(new Request(`${origin}/api/g4ai/status`), {});
assert.equal(statusResponse.status, 200);
const status = await statusResponse.json();
assert.equal(status.configured, false);
assert.equal(status.provider, "groq");
assert.equal(status.verified_on, "2026-08-29");

const fallbackResponse = await worker.fetch(new Request(`${origin}/api/g4ai/interpret`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "Origin": origin },
  body: JSON.stringify(requestBody),
}), {});
assert.equal(fallbackResponse.status, 503);
const fallback = await fallbackResponse.json();
assert.equal(fallback.mode, "deterministic_fallback");
assert.equal(fallback.error.code, "provider_unconfigured");
assert.equal(fallback.interpretation.ordered_records[0].record_ref, "R01");

const rejectedOrigin = await worker.fetch(new Request(`${origin}/api/g4ai/interpret`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "Origin": "https://other.invalid" },
  body: JSON.stringify(requestBody),
}), {});
assert.equal(rejectedOrigin.status, 403);

let assetRequest = null;
const assetResponse = await worker.fetch(new Request(`${origin}/app/`), {
  ASSETS: { fetch(request) { assetRequest = request; return new Response("asset", { status: 200 }); } },
});
assert.equal(assetResponse.status, 200);
assert.equal(await assetResponse.text(), "asset");
assert.equal(new URL(assetRequest.url).pathname, "/app/");

console.log("G6_WORKER_TEST PASS");
