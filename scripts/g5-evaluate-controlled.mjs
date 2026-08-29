import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { IfcAPI } from "web-ifc";

import { evaluateIfcPair } from "../app/core/ifc-clash-engine.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const outputPath = path.join(projectRoot, "outputs/local-only/g5/controlled-evaluation.json");
const repeatCount = 5;

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(projectRoot, relativePath), "utf8"));
}

function percentile(values, quantile) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * quantile) - 1)];
}

function hardStatus(result) {
  if (result.run_status !== "PASS") return "NOT_EVALUATED";
  const statuses = new Set(result.clash_records.map(record => record.status));
  if (statuses.has("CLASH")) return "CLASH";
  if (statuses.has("NOT_EVALUATED")) return "NOT_EVALUATED";
  return "CLEAR";
}

function hardPairKeys(result) {
  return result.clash_records
    .filter(record => record.status === "CLASH")
    .map(record => `${record.element_a.global_id}|${record.element_b.global_id}`)
    .sort();
}

function classificationMetrics(expected, observed) {
  let truePositive = 0;
  let falsePositive = 0;
  let falseNegative = 0;
  let trueNegative = 0;
  let abstained = 0;
  expected.forEach((status, index) => {
    const actual = observed[index];
    if (actual === "NOT_EVALUATED") {
      abstained += 1;
    } else if (status === "CLASH" && actual === "CLASH") {
      truePositive += 1;
    } else if (status !== "CLASH" && actual === "CLASH") {
      falsePositive += 1;
    } else if (status === "CLASH") {
      falseNegative += 1;
    } else {
      trueNegative += 1;
    }
  });
  const precision = truePositive / Math.max(1, truePositive + falsePositive);
  const recall = truePositive / Math.max(1, truePositive + falseNegative);
  return { true_positive: truePositive, false_positive: falsePositive, false_negative: falseNegative, true_negative: trueNegative, abstained, precision, recall };
}

async function main() {
  const manifest = await readJson("data/dataset-manifest.json");
  const groundTruth = await readJson("data/ground-truth/g2-ground-truth.json");
  const reference = await readJson("outputs/local-only/g2/reference-results.json");
  const clearanceAnalytic = await readJson("outputs/local-only/g3c/clearance-results.json");
  const clearanceMesh = await readJson("outputs/local-only/g3c/mesh-reference-results.json");
  const truthByCase = new Map(groundTruth.records.map(record => [record.case_id, record]));
  const referenceByCase = new Map(reference.results.map(record => [record.case_id, record]));

  const ifcApi = new IfcAPI();
  ifcApi.SetWasmPath(path.join(projectRoot, "node_modules/web-ifc") + path.sep, true);
  await ifcApi.Init();

  const cases = [];
  for (const item of manifest.cases) {
    const truth = truthByCase.get(item.case_id);
    const files = Object.fromEntries(item.files.map(file => [file.role, file.path]));
    const mepBytes = new Uint8Array(await fs.readFile(path.join(projectRoot, files.mep)));
    const structureBytes = new Uint8Array(await fs.readFile(path.join(projectRoot, files.structure)));
    const results = [];
    for (let repeat = 0; repeat < repeatCount; repeat += 1) {
      results.push(await evaluateIfcPair({ ifcApi, mepBytes, structureBytes }));
    }
    const first = results[0];
    const statuses = results.map(hardStatus);
    const durations = results.map(result => result.duration_ms);
    const expectedPair = truth.status === "CLASH" ? [`${truth.element_a.global_id}|${truth.element_b.global_id}`] : [];
    cases.push({
      case_id: item.case_id,
      expected_status: truth.status,
      product_status: statuses[0],
      ifcopenshell_status: referenceByCase.get(item.case_id).observed_status,
      status_stable_across_repeats: statuses.every(status => status === statuses[0]),
      expected_clash_pairs: expectedPair,
      product_clash_pairs: hardPairKeys(first),
      pair_match: JSON.stringify(hardPairKeys(first)) === JSON.stringify(expectedPair),
      duration_ms: {
        minimum: Math.min(...durations),
        median: percentile(durations, 0.5),
        p95: percentile(durations, 0.95),
        maximum: Math.max(...durations),
      },
    });
  }

  const expectedStatuses = cases.map(item => item.expected_status);
  const productStatuses = cases.map(item => item.product_status);
  const threeWayMatches = cases.filter(item => item.expected_status === item.product_status && item.expected_status === item.ifcopenshell_status).length;
  const analyticMatches = clearanceAnalytic.results.filter(item => item.emission_match && item.status_match && item.clearance_match).length;
  const meshMatches = clearanceMesh.results.filter(item => item.expected_match).length;
  const allDurations = cases.flatMap(item => [item.duration_ms.minimum, item.duration_ms.median, item.duration_ms.p95, item.duration_ms.maximum]);
  const output = {
    status: threeWayMatches === 8 && cases.every(item => item.pair_match && item.status_stable_across_repeats) && analyticMatches === 9 && meshMatches === 9 ? "PASS" : "FAIL",
    evaluated_on: "2026-08-29",
    controlled_suite: {
      case_count: cases.length,
      repeat_count: repeatCount,
      classification: classificationMetrics(expectedStatuses, productStatuses),
      exact_status_matches: cases.filter(item => item.expected_status === item.product_status).length,
      exact_pair_matches: cases.filter(item => item.pair_match).length,
      failure_closed_cases: cases.filter(item => item.product_status === "NOT_EVALUATED").length,
    },
    clearance_supplement: {
      case_count: clearanceAnalytic.case_count,
      analytic_exact_matches: analyticMatches,
      independent_mesh_exact_matches: meshMatches,
      status_counts: clearanceAnalytic.status_counts,
      threshold_m: clearanceAnalytic.threshold_m,
    },
    three_way_consistency: {
      sources: ["constructive_operation_ledger", "ifcopenshell_reference", "web_ifc_product_core"],
      exact_status_matches: threeWayMatches,
      case_count: cases.length,
    },
    performance: {
      scope: "warm project-local Node.js process; parse, geometry, classification, and evidence assembly per controlled pair",
      sample_count: repeatCount * cases.length,
      observed_case_duration_ms: {
        minimum: Math.min(...allDurations),
        median: percentile(cases.map(item => item.duration_ms.median), 0.5),
        p95: percentile(cases.map(item => item.duration_ms.p95), 0.95),
        maximum: Math.max(...allDurations),
      },
    },
    cases,
  };
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (output.status !== "PASS") process.exitCode = 3;
}

await main();
