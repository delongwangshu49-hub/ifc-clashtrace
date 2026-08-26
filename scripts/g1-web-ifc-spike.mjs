import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { BufferGeometry, Float32BufferAttribute, Matrix4 } from "three";
import { MeshBVH } from "three-mesh-bvh";
import { IFCPIPESEGMENT, IFCWALL, IfcAPI } from "web-ifc";


const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const dataDirectory = path.join(projectRoot, "data", "generated", "g1");
const outputDirectory = path.join(projectRoot, "outputs", "local-only", "g1");
const toleranceM = 0.002;


function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}


function vectorItems(vector) {
  const items = [];
  for (let index = 0; index < vector.size(); index += 1) {
    items.push(vector.get(index));
  }
  return items;
}


function geometryFromPlacedGeometry(ifcApi, modelId, placedGeometry) {
  const sourceGeometry = ifcApi.GetGeometry(modelId, placedGeometry.geometryExpressID);
  const vertexData = ifcApi.GetVertexArray(sourceGeometry.GetVertexData(), sourceGeometry.GetVertexDataSize());
  const indexData = ifcApi.GetIndexArray(sourceGeometry.GetIndexData(), sourceGeometry.GetIndexDataSize());
  const positions = new Float32Array((vertexData.length / 6) * 3);

  for (let sourceIndex = 0, targetIndex = 0; sourceIndex < vertexData.length; sourceIndex += 6, targetIndex += 3) {
    positions[targetIndex] = vertexData[sourceIndex];
    positions[targetIndex + 1] = vertexData[sourceIndex + 1];
    positions[targetIndex + 2] = vertexData[sourceIndex + 2];
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(Array.from(indexData));
  geometry.applyMatrix4(new Matrix4().fromArray(placedGeometry.flatTransformation));
  geometry.computeBoundingBox();
  sourceGeometry.delete();
  return geometry;
}


function collectElements(ifcApi, modelId, typeCode) {
  const elements = [];
  ifcApi.StreamAllMeshesWithTypes(modelId, [typeCode], (flatMesh) => {
    const line = ifcApi.GetLine(modelId, flatMesh.expressID);
    const geometries = vectorItems(flatMesh.geometries).map((placedGeometry) =>
      geometryFromPlacedGeometry(ifcApi, modelId, placedGeometry),
    );
    elements.push({
      expressId: flatMesh.expressID,
      entityType: ifcApi.GetNameFromTypeCode(line.type),
      globalId: line.GlobalId.value,
      geometries,
    });
  });
  return elements;
}


function intersectsExactly(elementA, elementB) {
  const identity = new Matrix4();
  for (const geometryA of elementA.geometries) {
    const bvh = new MeshBVH(geometryA);
    for (const geometryB of elementB.geometries) {
      if (bvh.intersectsGeometry(geometryB, identity)) {
        return true;
      }
    }
  }
  return false;
}


async function openModel(ifcApi, relativePath) {
  const bytes = new Uint8Array(fs.readFileSync(path.join(projectRoot, relativePath)));
  const modelId = ifcApi.OpenModel(bytes);
  if (modelId < 0) {
    throw new Error(`web-ifc could not open ${relativePath}`);
  }
  return modelId;
}


async function main() {
  const manifest = readJson(path.join(dataDirectory, "manifest.json"));
  const ifcApi = new IfcAPI();
  ifcApi.SetWasmPath(path.join(projectRoot, "node_modules", "web-ifc") + path.sep, true);
  await ifcApi.Init();

  const mepModelId = await openModel(ifcApi, "data/generated/g1/g1-mep.ifc");
  const structureModelId = await openModel(ifcApi, "data/generated/g1/g1-structure.ifc");
  const pipes = collectElements(ifcApi, mepModelId, IFCPIPESEGMENT);
  const walls = collectElements(ifcApi, structureModelId, IFCWALL);

  const pairs = [];
  for (const pipe of pipes) {
    for (const wall of walls) {
      if (intersectsExactly(pipe, wall)) {
        pairs.push({
          element_a: { entity_type: pipe.entityType, global_id: pipe.globalId, express_id: pipe.expressId },
          element_b: { entity_type: wall.entityType, global_id: wall.globalId, express_id: wall.expressId },
          detector_evidence: "triangle_surface_intersection",
        });
      }
    }
  }

  const expectedPair = manifest.expected_pair;
  const expectedKey = `${expectedPair.pipe_global_id}|${expectedPair.wall_global_id}`;
  const observedKeys = new Set(pairs.map((pair) => `${pair.element_a.global_id}|${pair.element_b.global_id}`));
  if (pairs.length !== 1 || !observedKeys.has(expectedKey)) {
    throw new Error(`web-ifc/BVH mismatch: expected ${expectedKey}, observed ${Array.from(observedKeys).join(",")}`);
  }

  const result = {
    detector: "web-ifc 0.0.77 + three-mesh-bvh 0.9.14",
    runtime: process.version,
    status: "PASS",
    schema: [ifcApi.GetModelSchema(mepModelId), ifcApi.GetModelSchema(structureModelId)],
    coordination_matrix: [ifcApi.GetCoordinationMatrix(mepModelId), ifcApi.GetCoordinationMatrix(structureModelId)],
    length_unit: manifest.length_unit,
    coordinate_system: manifest.coordinate_system,
    tolerance_m: toleranceM,
    tolerance_application: "recorded_for_G1; exact surface intersection used for this known >2 mm clash",
    guid_mapping_complete: pairs.every((pair) => pair.element_a.global_id && pair.element_b.global_id),
    element_count: { pipes: pipes.length, walls: walls.length },
    clash_count: pairs.length,
    pairs,
  };

  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(path.join(outputDirectory, "web-ifc-result.json"), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));

  ifcApi.CloseModel(mepModelId);
  ifcApi.CloseModel(structureModelId);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
