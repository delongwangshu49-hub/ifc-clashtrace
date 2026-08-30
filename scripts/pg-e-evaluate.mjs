import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { IfcAPI } from "web-ifc";

import { evaluateIfcPair } from "../app/core/ifc-clash-engine.mjs";


const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const rootArgumentIndex = process.argv.indexOf("--root");
const evaluationRoot = rootArgumentIndex >= 0
  ? path.resolve(projectRoot, process.argv[rootArgumentIndex + 1])
  : projectRoot;
const repeatCount = 3;
const distanceToleranceM = 0.00002;


async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(evaluationRoot, relativePath), "utf8"));
}


function recordKey(record) {
  return `${record.element_a.global_id}|${record.element_b.global_id}`;
}


function countStatuses(records) {
  const counts = {};
  for (const record of records) counts[record.status] = (counts[record.status] || 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}


function normalizedResult(result) {
  return {
    run_status: result.run_status,
    schema: result.schema,
    length_unit: result.length_unit,
    coordinate_system: result.coordinate_system,
    element_counts: result.element_counts,
    pair_count: result.pair_count,
    clash_records: result.clash_records.map(record => ({
      key: recordKey(record),
      status: record.status,
      certificate: record.evidence.certificate,
    })),
    clearance_records: result.clearance_records.map(record => ({
      key: recordKey(record),
      status: record.status,
      clearance_distance_m: record.clearance_distance_m,
      certificate: record.evidence.certificate,
    })),
    diagnostics: result.diagnostics,
  };
}


function evaluateSentinel(sentinel, result) {
  const key = `${sentinel.pipe_guid}|${sentinel.structure_guid}`;
  const hard = result.clash_records.find(record => recordKey(record) === key) || null;
  const clearance = result.clearance_records.find(record => recordKey(record) === key) || null;
  const hardMatch = hard?.status === sentinel.expected_hard_status;
  const emissionMatch = Boolean(clearance) === sentinel.expected_clearance_emission;
  const clearanceStatusMatch = sentinel.expected_clearance_emission
    ? clearance?.status === sentinel.expected_clearance_status
    : clearance === null;
  const distanceMatch = sentinel.expected_clearance_m === null
    ? clearance?.clearance_distance_m == null
    : Number.isFinite(clearance?.clearance_distance_m)
      && Math.abs(clearance.clearance_distance_m - sentinel.expected_clearance_m) <= distanceToleranceM;
  return {
    sentinel_id: sentinel.sentinel_id,
    pair_key: key,
    expected_hard_status: sentinel.expected_hard_status,
    observed_hard_status: hard?.status ?? null,
    expected_clearance_emission: sentinel.expected_clearance_emission,
    observed_clearance_emission: Boolean(clearance),
    expected_clearance_status: sentinel.expected_clearance_status,
    observed_clearance_status: clearance?.status ?? null,
    expected_clearance_m: sentinel.expected_clearance_m,
    observed_clearance_m: clearance?.clearance_distance_m ?? null,
    hard_match: hardMatch,
    emission_match: emissionMatch,
    clearance_status_match: clearanceStatusMatch,
    clearance_distance_match: distanceMatch,
    match: hardMatch && emissionMatch && clearanceStatusMatch && distanceMatch,
  };
}


async function main() {
  const manifest = await readJson("data/pg-e-manifest.json");
  const baseline = await readJson("data/ground-truth/pg-e-sentinel-baseline.json");
  const files = Object.fromEntries(manifest.files.map(file => [file.role, file.path]));
  const mepBytes = new Uint8Array(await fs.readFile(path.join(evaluationRoot, files.mep)));
  const structureBytes = new Uint8Array(await fs.readFile(path.join(evaluationRoot, files.structure)));
  const ifcApi = new IfcAPI();
  ifcApi.SetWasmPath(path.join(projectRoot, "node_modules", "web-ifc") + path.sep, true);
  await ifcApi.Init();

  const results = [];
  for (let repeat = 0; repeat < repeatCount; repeat += 1) {
    results.push(await evaluateIfcPair({ ifcApi, mepBytes, structureBytes }));
  }
  const first = results[0];
  const normalized = results.map(normalizedResult);
  const stable = normalized.slice(1).every(item => JSON.stringify(item) === JSON.stringify(normalized[0]));
  const sentinels = baseline.sentinels.map(sentinel => evaluateSentinel(sentinel, first));
  const exactMatches = sentinels.filter(item => item.match).length;
  const status = first.run_status === "PASS"
    && first.element_counts.pipes === manifest.counts.pipe_segments
    && first.element_counts.structures === manifest.counts.structures
    && first.pair_count === manifest.counts.candidate_pairs
    && exactMatches === baseline.sentinel_count
    && stable ? "PASS" : "FAIL";
  const output = {
    status,
    evaluated_on: "2026-08-30",
    dataset_id: manifest.dataset_id,
    repeat_count: repeatCount,
    deterministic_across_repeats: stable,
    element_counts: first.element_counts,
    pair_count: first.pair_count,
    record_status_counts: {
      hard_clash: countStatuses(first.clash_records),
      clearance: countStatuses(first.clearance_records),
    },
    sentinel_exact_matches: exactMatches,
    sentinel_count: baseline.sentinel_count,
    distance_agreement_tolerance_m: distanceToleranceM,
    duration_ms: {
      minimum: Math.min(...results.map(result => result.duration_ms)),
      maximum: Math.max(...results.map(result => result.duration_ms)),
      observations: results.map(result => result.duration_ms),
      scope: `Warm project-local Node.js process; parse, geometry, all ${first.pair_count} pair classifications, and evidence assembly.`,
    },
    sentinels,
    limitations: manifest.limitations,
  };
  const outputPath = path.join(evaluationRoot, "outputs", "local-only", "pg-e", "technical-evaluation.json");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (output.status !== "PASS") process.exitCode = 3;
}


await main();
