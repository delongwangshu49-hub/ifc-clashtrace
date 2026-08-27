import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { IFCPIPESEGMENT, IFCUNITASSIGNMENT, IFCWALL, IfcAPI } from "web-ifc";

import {
  CLEARANCE_RULE_ID,
  HARD_CLASH_RULE_ID,
  evaluateIfcPair,
} from "../app/core/ifc-clash-engine.mjs";


const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const expectedStatuses = new Map([
  ["C01", "CLASH"],
  ["C02", "CLASH"],
  ["C03", "CLEAR"],
  ["C04", "CLEAR"],
  ["C05", "CLEAR"],
  ["C06", "CLEAR"],
  ["C07", "CLASH"],
  ["C08", "NOT_EVALUATED"],
]);


async function modelBytes(caseId, role) {
  return new Uint8Array(await fs.readFile(path.join(
    projectRoot,
    "data",
    "generated",
    "g2",
    `${caseId.toLowerCase()}-${role}.ifc`,
  )));
}


async function newIfcApi() {
  const ifcApi = new IfcAPI();
  ifcApi.SetWasmPath(path.join(projectRoot, "node_modules", "web-ifc") + path.sep, true);
  await ifcApi.Init();
  return ifcApi;
}


function withoutDuration(result) {
  const copy = structuredClone(result);
  delete copy.duration_ms;
  return copy;
}


function vectorOf(items) {
  return { size: () => items.length, get: index => items[index] };
}


function interleavedVertices(points) {
  return points.flatMap(([x, y, z]) => [x, y, z, 0, 0, 0]);
}


const identityTransform = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const validTetrahedron = {
  vertices: interleavedVertices([[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]]),
  indices: [0, 2, 1, 0, 1, 3, 1, 2, 3, 2, 0, 3],
};


function fakeIfcApi(pipeParts, structureParts) {
  let nextModelId = 0;
  const partsById = new Map();
  const partsForModel = modelId => modelId === 0 ? pipeParts : structureParts;
  return {
    OpenModel: () => nextModelId++,
    CloseModel: () => {},
    GetModelSchema: () => "IFC4",
    GetCoordinationMatrix: () => identityTransform,
    GetLineIDsWithType(modelId, typeCode) {
      if (typeCode === IFCUNITASSIGNMENT) return vectorOf([1000 + modelId]);
      if (modelId === 0 && typeCode === IFCPIPESEGMENT) return vectorOf([1]);
      if (modelId === 1 && typeCode === IFCWALL) return vectorOf([2]);
      return vectorOf([]);
    },
    GetLine(modelId, expressId) {
      if (expressId >= 1000) {
        return { Units: [{ UnitType: { value: "LENGTHUNIT" }, Name: { value: "METRE" }, Prefix: null }] };
      }
      return {
        GlobalId: { value: modelId === 0 ? "fake-pipe-guid" : "fake-wall-guid" },
        Name: { value: modelId === 0 ? "Fake Pipe" : "Fake Wall" },
      };
    },
    StreamAllMeshesWithTypes(modelId, _typeCodes, callback) {
      const placed = partsForModel(modelId).map((part, index) => {
        const geometryExpressID = `${modelId}-${index}`;
        partsById.set(geometryExpressID, part);
        return { geometryExpressID, flatTransformation: identityTransform };
      });
      callback({ expressID: modelId === 0 ? 1 : 2, geometries: vectorOf(placed) });
    },
    GetGeometry(_modelId, geometryExpressID) {
      const part = partsById.get(geometryExpressID);
      return {
        GetVertexData: () => part.vertices,
        GetVertexDataSize: () => part.vertices.length,
        GetIndexData: () => part.indices,
        GetIndexDataSize: () => part.indices.length,
        delete: () => {},
      };
    },
    GetVertexArray: data => data,
    GetIndexArray: data => data,
  };
}


async function evaluateFakeGeometry(pipeParts, structureParts) {
  return evaluateIfcPair({
    ifcApi: fakeIfcApi(pipeParts, structureParts),
    mepBytes: new Uint8Array([1]),
    structureBytes: new Uint8Array([2]),
  });
}


async function main() {
  const truth = JSON.parse(await fs.readFile(path.join(projectRoot, "data/ground-truth/g2-ground-truth.json"), "utf8"));
  const truthByCase = new Map(truth.records.map(record => [record.case_id, record]));
  const ifcApi = await newIfcApi();
  const results = new Map();
  for (const [caseId, expectedStatus] of expectedStatuses) {
    const result = await evaluateIfcPair({
      ifcApi,
      mepBytes: await modelBytes(caseId, "mep"),
      structureBytes: await modelBytes(caseId, "structure"),
    });
    assert.equal(result.run_status, "PASS", `${caseId} run failed`);
    assert.equal(result.schema, "IFC4");
    assert.equal(result.coordinate_system, "shared_project_coordinates");
    assert.equal(result.pair_count, 1, `${caseId} pair count`);
    assert.equal(result.clash_records.length, 1, `${caseId} hard record count`);
    const hard = result.clash_records[0];
    const expected = truthByCase.get(caseId);
    assert.equal(hard.status, expectedStatus, `${caseId} hard status`);
    assert.equal(hard.rule_id, HARD_CLASH_RULE_ID);
    assert.equal(hard.tolerance_m, 0.002);
    assert.equal(hard.element_a.entity_type, "IfcPipeSegment");
    assert.ok(["IfcWall", "IfcBeam"].includes(hard.element_b.entity_type));
    assert.equal(hard.element_a.global_id, expected.element_a.global_id);
    assert.equal(hard.element_b.global_id, expected.element_b.global_id);
    assert.equal(hard.penetration_distance_m, null);
    assert.equal(hard.evidence.aabb_classification_permitted, false);
    assert.match(hard.evidence.algorithm_boundary, /fail closed/i);
    if (expectedStatus === "CLASH") {
      assert.equal(hard.clash_type, "pierce");
      assert.ok(hard.evidence.certified_maximum_interior_depth_m > 0.002);
      assert.equal(result.clearance_records.length, 0, `${caseId} clash must suppress clearance`);
      const expectedPoint = expected.location.point_a_m;
      assert.ok(Math.abs(hard.location.point_a_m[0] - expectedPoint[0]) < 0.005);
      assert.ok(Math.abs(hard.location.point_a_m[1] - expectedPoint[1]) < 0.005);
      assert.ok(Math.abs(hard.location.point_a_m[2] - expectedPoint[2]) < 0.005);
    } else {
      assert.equal(result.clearance_records.length, 1, `${caseId} non-clash clearance count`);
      const clearance = result.clearance_records[0];
      assert.equal(clearance.rule_id, CLEARANCE_RULE_ID);
      assert.equal(clearance.threshold_m, 0.05);
      assert.equal(clearance.evidence.aabb_classification_permitted, false);
      assert.match(clearance.evidence.algorithm_boundary, /AABB separation is not used/);
      if (expectedStatus === "NOT_EVALUATED") {
        assert.equal(clearance.status, "NOT_EVALUATED");
        assert.equal(clearance.clearance_distance_m, null);
        assert.ok(clearance.diagnostic);
      }
    }
    results.set(caseId, result);
  }

  assert.equal(results.get("C03").clearance_records[0].status, "WARNING");
  assert.ok(results.get("C03").clearance_records[0].clearance_distance_m <= 1e-7);
  assert.equal(results.get("C04").clearance_records[0].status, "WARNING");
  assert.ok(results.get("C04").clash_records[0].evidence.certified_maximum_interior_depth_m < 0.002);
  assert.equal(results.get("C05").clearance_records[0].status, "CLEAR");
  assert.ok(Math.abs(results.get("C05").clearance_records[0].clearance_distance_m - 0.2) < 1e-6);
  assert.equal(results.get("C06").clearance_records[0].status, "CLEAR");
  assert.ok(Math.abs(results.get("C06").clearance_records[0].clearance_distance_m - 0.15) < 1e-6);

  const c01Mep = await modelBytes("C01", "mep");
  const c01Structure = await modelBytes("C01", "structure");
  const deterministicRepeat = await evaluateIfcPair({ ifcApi, mepBytes: c01Mep, structureBytes: c01Structure });
  assert.deepEqual(withoutDuration(deterministicRepeat), withoutDuration(results.get("C01")));

  const unverifiedCoordinates = await evaluateIfcPair({
    ifcApi,
    mepBytes: c01Mep,
    structureBytes: c01Structure,
    coordinateSystem: "unverified",
  });
  assert.equal(unverifiedCoordinates.run_status, "NOT_EVALUATED");
  assert.equal(unverifiedCoordinates.pair_count, 0);
  assert.match(unverifiedCoordinates.diagnostics[0], /shared project coordinates/);

  const zeroThreshold = await evaluateIfcPair({
    ifcApi,
    mepBytes: c01Mep,
    structureBytes: c01Structure,
    hardClashToleranceM: 0,
  });
  assert.equal(zeroThreshold.run_status, "NOT_EVALUATED");
  assert.match(zeroThreshold.diagnostics[0], /frozen v1 rule constants/);

  const nonFiniteThreshold = await evaluateIfcPair({
    ifcApi,
    mepBytes: c01Mep,
    structureBytes: c01Structure,
    clearanceThresholdM: Number.POSITIVE_INFINITY,
  });
  assert.equal(nonFiniteThreshold.run_status, "NOT_EVALUATED");
  assert.match(nonFiniteThreshold.diagnostics[0], /finite/);

  const customHardThreshold = await evaluateIfcPair({
    ifcApi,
    mepBytes: c01Mep,
    structureBytes: c01Structure,
    hardClashToleranceM: 0.003,
  });
  assert.equal(customHardThreshold.run_status, "NOT_EVALUATED");
  assert.match(customHardThreshold.diagnostics[0], /frozen v1 rule constants/);

  const customClearanceThreshold = await evaluateIfcPair({
    ifcApi,
    mepBytes: c01Mep,
    structureBytes: c01Structure,
    clearanceThresholdM: 0.06,
  });
  assert.equal(customClearanceThreshold.run_status, "NOT_EVALUATED");
  assert.match(customClearanceThreshold.diagnostics[0], /frozen v1 rule constants/);

  const malformed = await evaluateIfcPair({
    ifcApi,
    mepBytes: new Uint8Array([1, 2, 3, 4]),
    structureBytes: c01Structure,
  });
  assert.equal(malformed.run_status, "NOT_EVALUATED");
  assert.equal(malformed.pair_count, 0);
  assert.ok(malformed.diagnostics.length > 0);

  const roleMismatch = await evaluateIfcPair({
    ifcApi,
    mepBytes: c01Mep,
    structureBytes: c01Mep,
  });
  assert.equal(roleMismatch.run_status, "NOT_EVALUATED");
  assert.match(roleMismatch.diagnostics[0], /no IfcWall or IfcBeam/);

  const allDegenerate = await evaluateFakeGeometry([{
    vertices: interleavedVertices([[0, 0, 0], [1, 0, 0], [2, 0, 0]]),
    indices: [0, 1, 2],
  }], [validTetrahedron]);
  assert.equal(allDegenerate.run_status, "PASS");
  assert.equal(allDegenerate.clash_records[0].status, "NOT_EVALUATED");
  assert.match(allDegenerate.clash_records[0].diagnostic, /no non-degenerate triangles/);

  const nonTriangularIndex = await evaluateFakeGeometry([{
    vertices: validTetrahedron.vertices,
    indices: [0, 1, 2, 0],
  }], [validTetrahedron]);
  assert.equal(nonTriangularIndex.clash_records[0].status, "NOT_EVALUATED");
  assert.match(nonTriangularIndex.clash_records[0].diagnostic, /divisible by three/);

  const outOfRangeIndex = await evaluateFakeGeometry([{
    vertices: validTetrahedron.vertices,
    indices: [0, 1, 4],
  }], [validTetrahedron]);
  assert.equal(outOfRangeIndex.clash_records[0].status, "NOT_EVALUATED");
  assert.match(outOfRangeIndex.clash_records[0].diagnostic, /invalid source vertex index/);

  const nonIntegerIndex = await evaluateFakeGeometry([{
    vertices: validTetrahedron.vertices,
    indices: [0, 1, 1.5],
  }], [validTetrahedron]);
  assert.equal(nonIntegerIndex.clash_records[0].status, "NOT_EVALUATED");
  assert.match(nonIntegerIndex.clash_records[0].diagnostic, /invalid source vertex index/);

  const partialGeometryFailure = await evaluateFakeGeometry([
    validTetrahedron,
    {
      vertices: interleavedVertices([[0, 0, 0], [1, 0, 0], [2, 0, 0]]),
      indices: [0, 1, 2],
    },
  ], [validTetrahedron]);
  assert.equal(partialGeometryFailure.run_status, "PASS");
  assert.equal(partialGeometryFailure.clash_records[0].status, "NOT_EVALUATED");
  assert.match(partialGeometryFailure.clash_records[0].diagnostic, /incomplete geometric representation/);

  process.stdout.write(JSON.stringify({
    status: "PASS",
    hard_rule_id: HARD_CLASH_RULE_ID,
    clearance_rule_id: CLEARANCE_RULE_ID,
    controlled_statuses: Object.fromEntries([...results].map(([caseId, result]) => [caseId, result.clash_records[0].status])),
    hard_precision_recall: "8/8 exact records; CLASH precision=1 recall=1",
    clearance_checks: {
      touching: "WARNING@0m",
      sub_tolerance_overlap: "WARNING@0m",
      clear_gap: "CLEAR@0.2m",
      opening_gap: "CLEAR@0.15m",
      hard_clash_suppressed: 3,
      upstream_unknown_failed_closed: 1,
    },
    adversarial_guards: {
      unverified_coordinates: "NOT_EVALUATED",
      zero_threshold: "NOT_EVALUATED",
      non_finite_threshold: "NOT_EVALUATED",
      custom_hard_threshold: "NOT_EVALUATED",
      custom_clearance_threshold: "NOT_EVALUATED",
      malformed_ifc: "NOT_EVALUATED",
      role_mismatch: "NOT_EVALUATED",
      all_degenerate_mesh: "REJECTED",
      non_triangular_index: "REJECTED",
      out_of_range_index: "REJECTED",
      non_integer_index: "REJECTED",
      partial_geometry_failure: "NOT_EVALUATED",
      deterministic_repeat: "PASS",
    },
  }, null, 2) + "\n");
}


await main();
