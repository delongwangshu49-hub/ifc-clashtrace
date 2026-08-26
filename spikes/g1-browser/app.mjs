import { BufferGeometry, Float32BufferAttribute, Matrix4 } from "three";
import { MeshBVH } from "three-mesh-bvh";
import { IFCPIPESEGMENT, IFCWALL, IfcAPI } from "web-ifc";


const expected = {
  pipeGlobalId: "0H4H4H4H514O4H4H4H4H4H",
  wallGlobalId: "0Y8Y8Y8Y928e8Y8Y8Y8Y8Y",
};


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
  sourceGeometry.delete();
  return geometry;
}


function collectElements(ifcApi, modelId, typeCode) {
  const elements = [];
  ifcApi.StreamAllMeshesWithTypes(modelId, [typeCode], (flatMesh) => {
    const line = ifcApi.GetLine(modelId, flatMesh.expressID);
    elements.push({
      expressId: flatMesh.expressID,
      entityType: ifcApi.GetNameFromTypeCode(line.type),
      globalId: line.GlobalId.value,
      geometries: vectorItems(flatMesh.geometries).map((placedGeometry) =>
        geometryFromPlacedGeometry(ifcApi, modelId, placedGeometry),
      ),
    });
  });
  return elements;
}


function intersectsExactly(elementA, elementB) {
  const identity = new Matrix4();
  return elementA.geometries.some((geometryA) => {
    const bvh = new MeshBVH(geometryA);
    return elementB.geometries.some((geometryB) => bvh.intersectsGeometry(geometryB, identity));
  });
}


async function openModel(ifcApi, url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  const modelId = ifcApi.OpenModel(new Uint8Array(await response.arrayBuffer()));
  if (modelId < 0) {
    throw new Error(`web-ifc could not open ${url}`);
  }
  return modelId;
}


async function run() {
  const ifcApi = new IfcAPI();
  ifcApi.SetWasmPath("/node_modules/web-ifc/", true);
  await ifcApi.Init();
  const mepModelId = await openModel(ifcApi, "/data/generated/g1/g1-mep.ifc");
  const structureModelId = await openModel(ifcApi, "/data/generated/g1/g1-structure.ifc");
  const pipes = collectElements(ifcApi, mepModelId, IFCPIPESEGMENT);
  const walls = collectElements(ifcApi, structureModelId, IFCWALL);
  const pairs = [];

  for (const pipe of pipes) {
    for (const wall of walls) {
      if (intersectsExactly(pipe, wall)) {
        pairs.push({
          pipe: { entity_type: pipe.entityType, global_id: pipe.globalId, express_id: pipe.expressId },
          wall: { entity_type: wall.entityType, global_id: wall.globalId, express_id: wall.expressId },
        });
      }
    }
  }

  const passed =
    pairs.length === 1 &&
    pairs[0].pipe.global_id === expected.pipeGlobalId &&
    pairs[0].wall.global_id === expected.wallGlobalId;
  const result = {
    status: passed ? "PASS" : "FAIL",
    detector: "browser web-ifc 0.0.77 + three-mesh-bvh 0.9.14",
    schema: [ifcApi.GetModelSchema(mepModelId), ifcApi.GetModelSchema(structureModelId)],
    coordinate_system: "shared_project_coordinates",
    length_unit: "metre",
    tolerance_m: 0.002,
    tolerance_application: "recorded_for_G1; exact surface intersection used for this known >2 mm clash",
    guid_mapping_complete: pairs.every((pair) => pair.pipe.global_id && pair.wall.global_id),
    clash_count: pairs.length,
    pairs,
  };

  ifcApi.CloseModel(mepModelId);
  ifcApi.CloseModel(structureModelId);
  document.querySelector("#status").textContent = result.status;
  document.querySelector("#result").textContent = JSON.stringify(result, null, 2);
  document.documentElement.dataset.g1Status = result.status;
  window.__G1_RESULT__ = result;
  if (!passed) {
    throw new Error(`Browser G1 mismatch: ${JSON.stringify(result)}`);
  }
}


run().catch((error) => {
  document.querySelector("#status").textContent = "FAIL";
  document.querySelector("#result").textContent = String(error?.stack || error);
  document.documentElement.dataset.g1Status = "FAIL";
  window.__G1_RESULT__ = { status: "FAIL", error: String(error) };
  console.error(error);
});
