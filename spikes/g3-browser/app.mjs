import { IfcAPI } from "web-ifc";

import { evaluateIfcPair } from "/app/core/ifc-clash-engine.mjs";


const expected = new Map([
  ["C01", "CLASH"],
  ["C02", "CLASH"],
  ["C03", "CLEAR"],
  ["C04", "CLEAR"],
  ["C05", "CLEAR"],
  ["C06", "CLEAR"],
  ["C07", "CLASH"],
  ["C08", "NOT_EVALUATED"],
]);


async function fetchBytes(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}


async function main() {
  const ifcApi = new IfcAPI();
  ifcApi.SetWasmPath("/node_modules/web-ifc/", true);
  await ifcApi.Init();
  const cases = [];
  for (const [caseId, expectedStatus] of expected) {
    const stem = caseId.toLowerCase();
    const result = await evaluateIfcPair({
      ifcApi,
      mepBytes: await fetchBytes(`/data/generated/g2/${stem}-mep.ifc`),
      structureBytes: await fetchBytes(`/data/generated/g2/${stem}-structure.ifc`),
    });
    const observedStatus = result.clash_records[0]?.status ?? result.run_status;
    cases.push({
      case_id: caseId,
      expected_status: expectedStatus,
      observed_status: observedStatus,
      match: observedStatus === expectedStatus,
      clearance_status: result.clearance_records[0]?.status ?? "SUPPRESSED",
    });
  }
  const passed = cases.every(item => item.match);
  const output = {
    status: passed ? "PASS" : "FAIL",
    runtime: "current desktop Chrome",
    harness: "unstyled G3 browser core acceptance",
    case_count: cases.length,
    exact_status_match: `${cases.filter(item => item.match).length}/${cases.length}`,
    cases,
  };
  document.querySelector("#status").textContent = output.status;
  document.querySelector("#result").textContent = JSON.stringify(output, null, 2);
  document.documentElement.dataset.g3Status = output.status;
  window.__G3_RESULT__ = output;
  if (!passed) throw new Error(`G3 browser mismatch: ${JSON.stringify(output)}`);
}


main().catch(error => {
  document.querySelector("#status").textContent = "FAIL";
  document.querySelector("#result").textContent = String(error?.stack || error);
  document.documentElement.dataset.g3Status = "FAIL";
  window.__G3_RESULT__ = { status: "FAIL", error: String(error?.message || error) };
  console.error(error);
});
