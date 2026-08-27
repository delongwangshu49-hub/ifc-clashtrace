import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Matrix4,
  Ray,
  Vector3,
} from "three";
import { MeshBVH } from "three-mesh-bvh";
import { IFCBEAM, IFCPIPESEGMENT, IFCUNITASSIGNMENT, IFCWALL } from "web-ifc";


export const HARD_CLASH_RULE_ID = "MEP_STRUCTURE_HARD_CLASH_V1";
export const CLEARANCE_RULE_ID = "MEP_STRUCTURE_CLEARANCE_WARNING_V1";
export const HARD_CLASH_TOLERANCE_M = 0.002;
export const CLEARANCE_THRESHOLD_M = 0.05;

const IDENTITY = new Matrix4();
const SURFACE_EPSILON_M = 1e-7;
const RAY_DIRECTION = new Vector3(1, 0.3713906763541037, 0.5291197437120903).normalize();
const SUPPORTED_STRUCTURE_TYPES = new Map([
  [IFCWALL, "IfcWall"],
  [IFCBEAM, "IfcBeam"],
]);


function vectorItems(vector) {
  const items = [];
  for (let index = 0; index < vector.size(); index += 1) items.push(vector.get(index));
  return items;
}


function textValue(value) {
  if (typeof value === "string") return value;
  if (value && typeof value.value === "string") return value.value;
  return null;
}


function canonicalElement(typeCode, line, role) {
  const typeName = typeCode === IFCPIPESEGMENT ? "IfcPipeSegment" : SUPPORTED_STRUCTURE_TYPES.get(typeCode);
  return {
    model_role: role,
    entity_type: typeName,
    global_id: textValue(line?.GlobalId),
    name: textValue(line?.Name),
  };
}


function threePointToIfc(point) {
  if (!point) return null;
  return [point[0], -point[2], point[1]];
}


function validateGeometry(geometry) {
  const positions = geometry.getAttribute("position");
  if (!positions || positions.count < 3 || !geometry.index || geometry.index.count < 3) {
    throw new Error("mesh representation has no indexed triangles");
  }
  if (geometry.index.count % 3 !== 0) {
    throw new Error("mesh representation index count is not divisible by three");
  }
  for (let index = 0; index < positions.array.length; index += 1) {
    if (!Number.isFinite(positions.array[index])) throw new Error("mesh representation contains non-finite vertices");
  }
  for (let index = 0; index < geometry.index.count; index += 1) {
    const vertexIndex = geometry.index.getX(index);
    if (!Number.isInteger(vertexIndex) || vertexIndex < 0 || vertexIndex >= positions.count) {
      throw new Error("mesh representation contains an invalid vertex index");
    }
  }
  const vertexKey = index => [positions.getX(index), positions.getY(index), positions.getZ(index)]
    .map(value => Math.round(value / SURFACE_EPSILON_M)).join(",");
  const edgeCounts = new Map();
  let nonDegenerateTriangleCount = 0;
  for (let index = 0; index < geometry.index.count; index += 3) {
    const vertexIndices = [
      geometry.index.getX(index),
      geometry.index.getX(index + 1),
      geometry.index.getX(index + 2),
    ];
    const triangle = vertexIndices.map(vertexKey);
    const pointA = new Vector3().fromBufferAttribute(positions, vertexIndices[0]);
    const pointB = new Vector3().fromBufferAttribute(positions, vertexIndices[1]);
    const pointC = new Vector3().fromBufferAttribute(positions, vertexIndices[2]);
    const areaVectorSquared = pointB.sub(pointA).cross(pointC.sub(pointA)).lengthSq();
    if (new Set(triangle).size !== 3 || areaVectorSquared <= SURFACE_EPSILON_M ** 4) {
      continue;
    }
    nonDegenerateTriangleCount += 1;
    for (const [start, end] of [[triangle[0], triangle[1]], [triangle[1], triangle[2]], [triangle[2], triangle[0]]]) {
      const edge = start < end ? `${start}|${end}` : `${end}|${start}`;
      edgeCounts.set(edge, (edgeCounts.get(edge) || 0) + 1);
    }
  }
  if (nonDegenerateTriangleCount === 0 || edgeCounts.size === 0) {
    throw new Error("mesh representation has no non-degenerate triangles");
  }
  if ([...edgeCounts.values()].some(count => count !== 2)) {
    throw new Error("mesh representation is not a closed two-manifold triangle surface");
  }
}


function geometryFromPlacedGeometry(ifcApi, modelId, placedGeometry) {
  const source = ifcApi.GetGeometry(modelId, placedGeometry.geometryExpressID);
  let geometry = null;
  try {
    const sourceVertices = ifcApi.GetVertexArray(source.GetVertexData(), source.GetVertexDataSize());
    const sourceIndices = ifcApi.GetIndexArray(source.GetIndexData(), source.GetIndexDataSize());
    if (sourceVertices.length % 6 !== 0) {
      throw new Error("mesh representation has an invalid interleaved vertex buffer");
    }
    const sourceVertexCount = sourceVertices.length / 6;
    for (const vertexIndex of sourceIndices) {
      if (!Number.isInteger(vertexIndex) || vertexIndex < 0 || vertexIndex >= sourceVertexCount) {
        throw new Error("mesh representation contains an invalid source vertex index");
      }
    }
    const positions = new Float32Array((sourceVertices.length / 6) * 3);
    for (let sourceIndex = 0, targetIndex = 0; sourceIndex < sourceVertices.length; sourceIndex += 6, targetIndex += 3) {
      positions[targetIndex] = sourceVertices[sourceIndex];
      positions[targetIndex + 1] = sourceVertices[sourceIndex + 1];
      positions[targetIndex + 2] = sourceVertices[sourceIndex + 2];
    }
    geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setIndex(Array.from(sourceIndices));
    geometry.applyMatrix4(new Matrix4().fromArray(placedGeometry.flatTransformation));
    geometry.computeBoundingBox();
    validateGeometry(geometry);
    geometry.boundsTree = new MeshBVH(geometry);
    return geometry;
  } catch (error) {
    geometry?.dispose();
    throw error;
  } finally {
    source.delete();
  }
}


function collectElements(ifcApi, modelId, typeCodes, role) {
  const elements = new Map();
  for (const typeCode of typeCodes) {
    const ids = vectorItems(ifcApi.GetLineIDsWithType(modelId, typeCode));
    for (const expressId of ids) {
      const line = ifcApi.GetLine(modelId, expressId);
      elements.set(expressId, {
        expressId,
        typeCode,
        descriptor: canonicalElement(typeCode, line, role),
        geometries: [],
        geometryDiagnostics: [],
      });
    }
  }

  ifcApi.StreamAllMeshesWithTypes(modelId, typeCodes, (flatMesh) => {
    const element = elements.get(flatMesh.expressID);
    if (!element) return;
    for (const placedGeometry of vectorItems(flatMesh.geometries)) {
      try {
        element.geometries.push(geometryFromPlacedGeometry(ifcApi, modelId, placedGeometry));
      } catch (error) {
        element.geometryDiagnostics.push(String(error?.message || error));
      }
    }
  });
  return [...elements.values()];
}


function validateMetreLengthUnit(ifcApi, modelId) {
  const assignmentIds = vectorItems(ifcApi.GetLineIDsWithType(modelId, IFCUNITASSIGNMENT));
  if (assignmentIds.length !== 1) throw new Error("model must contain exactly one IfcUnitAssignment");
  const assignment = ifcApi.GetLine(modelId, assignmentIds[0], true);
  const lengthUnits = (assignment?.Units || []).filter(unit => textValue(unit?.UnitType) === "LENGTHUNIT");
  if (lengthUnits.length !== 1) throw new Error("model must declare exactly one length unit");
  const lengthUnit = lengthUnits[0];
  if (textValue(lengthUnit?.Name) !== "METRE" || lengthUnit?.Prefix !== null) {
    throw new Error("only unprefixed metre IFC length units are supported");
  }
}


function coordinationMatrix(ifcApi, modelId) {
  const matrix = Array.from(ifcApi.GetCoordinationMatrix(modelId));
  if (matrix.length !== 16 || matrix.some(value => !Number.isFinite(value))) {
    throw new Error("web-ifc coordination matrix is invalid");
  }
  return matrix;
}


function allPoints(geometries) {
  const points = [];
  for (const geometry of geometries) {
    const positions = geometry.getAttribute("position");
    for (let index = 0; index < positions.count; index += 1) {
      points.push(new Vector3(positions.getX(index), positions.getY(index), positions.getZ(index)));
    }
  }
  return points;
}


function dominantAxisCertificate(geometries) {
  const points = allPoints(geometries);
  if (points.length < 8) throw new Error("pipe mesh has too few vertices for an axial certificate");
  const center = points.reduce((sum, point) => sum.add(point), new Vector3()).multiplyScalar(1 / points.length);
  const covariance = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (const point of points) {
    const delta = point.clone().sub(center);
    covariance[0] += delta.x * delta.x;
    covariance[1] += delta.x * delta.y;
    covariance[2] += delta.x * delta.z;
    covariance[3] += delta.y * delta.x;
    covariance[4] += delta.y * delta.y;
    covariance[5] += delta.y * delta.z;
    covariance[6] += delta.z * delta.x;
    covariance[7] += delta.z * delta.y;
    covariance[8] += delta.z * delta.z;
  }
  let axis = covariance[0] >= covariance[4] && covariance[0] >= covariance[8]
    ? new Vector3(1, 0, 0)
    : covariance[4] >= covariance[8] ? new Vector3(0, 1, 0) : new Vector3(0, 0, 1);
  for (let iteration = 0; iteration < 32; iteration += 1) {
    const next = new Vector3(
      covariance[0] * axis.x + covariance[1] * axis.y + covariance[2] * axis.z,
      covariance[3] * axis.x + covariance[4] * axis.y + covariance[5] * axis.z,
      covariance[6] * axis.x + covariance[7] * axis.y + covariance[8] * axis.z,
    );
    if (!(next.lengthSq() > 0)) throw new Error("pipe axial covariance is degenerate");
    axis = next.normalize();
  }
  const projections = points.map(point => point.clone().sub(center).dot(axis));
  const minimum = Math.min(...projections);
  const maximum = Math.max(...projections);
  const axialSpan = maximum - minimum;
  const maximumRadius = Math.max(...points.map((point, index) => {
    const axialPoint = center.clone().addScaledVector(axis, projections[index]);
    return point.distanceTo(axialPoint);
  }));
  if (!(axialSpan > 0) || !(maximumRadius > 0) || axialSpan <= 2 * maximumRadius) {
    throw new Error("pipe mesh is outside the supported straight finite-cylinder certificate family");
  }
  return {
    start: center.clone().addScaledVector(axis, minimum),
    end: center.clone().addScaledVector(axis, maximum),
    axis,
    axialSpan,
    maximumRadius,
  };
}


function closestPointDistance(geometry, point) {
  const target = {};
  const result = geometry.boundsTree.closestPointToPoint(point, target);
  return result && Number.isFinite(result.distance) ? result.distance : Number.POSITIVE_INFINITY;
}


function insideClosedGeometry(geometry, point) {
  const surfaceDistance = closestPointDistance(geometry, point);
  if (surfaceDistance <= SURFACE_EPSILON_M) return { inside: false, boundary: true, surfaceDistance };
  const hits = geometry.boundsTree.raycast(new Ray(point, RAY_DIRECTION), DoubleSide, SURFACE_EPSILON_M);
  const distances = hits.map(hit => hit.distance).filter(Number.isFinite).sort((a, b) => a - b);
  const unique = [];
  for (const distance of distances) {
    if (unique.length === 0 || Math.abs(distance - unique[unique.length - 1]) > SURFACE_EPSILON_M) unique.push(distance);
  }
  return { inside: unique.length % 2 === 1, boundary: false, surfaceDistance };
}


function structurePointCertificate(geometries, point) {
  let minimumDistance = Number.POSITIVE_INFINITY;
  let boundary = false;
  for (const geometry of geometries) {
    const result = insideClosedGeometry(geometry, point);
    minimumDistance = Math.min(minimumDistance, result.surfaceDistance);
    boundary ||= result.boundary;
    if (result.inside) return { inside: true, boundary: false, surfaceDistance: result.surfaceDistance };
  }
  return { inside: false, boundary, surfaceDistance: minimumDistance };
}


function surfacesIntersect(geometriesA, geometriesB) {
  for (const geometryA of geometriesA) {
    for (const geometryB of geometriesB) {
      if (geometryA.boundsTree.intersectsGeometry(geometryB, IDENTITY)) return true;
    }
  }
  return false;
}


function minimumSurfaceDistance(geometriesA, geometriesB) {
  let minimum = Number.POSITIVE_INFINITY;
  let pointA = null;
  let pointB = null;
  for (const geometryA of geometriesA) {
    for (const geometryB of geometriesB) {
      const targetA = {};
      const targetB = {};
      const hit = geometryA.boundsTree.closestPointToGeometry(geometryB, IDENTITY, targetA, targetB);
      if (hit && Number.isFinite(hit.distance) && hit.distance < minimum) {
        minimum = hit.distance;
        pointA = targetA.point?.toArray() ?? null;
        pointB = targetB.point?.toArray() ?? null;
      }
    }
  }
  if (!Number.isFinite(minimum)) throw new Error("triangle surface distance did not return a finite result");
  return { distance: Math.max(0, minimum), pointA, pointB };
}


function evaluateHardPair(pipe, structure, toleranceM) {
  if (!pipe.descriptor.global_id || !structure.descriptor.global_id) {
    return { status: "NOT_EVALUATED", diagnostic: "a selected element has no stable GlobalId", certificate: "failure_closed" };
  }
  const geometryDiagnostics = [...pipe.geometryDiagnostics, ...structure.geometryDiagnostics];
  if (geometryDiagnostics.length > 0) {
    return {
      status: "NOT_EVALUATED",
      diagnostic: `a selected element has an incomplete geometric representation: ${geometryDiagnostics.join("; ")}`,
      certificate: "failure_closed",
    };
  }
  if (pipe.geometries.length === 0 || structure.geometries.length === 0) {
    return {
      status: "NOT_EVALUATED",
      diagnostic: "a selected element has no reliable geometric representation",
      certificate: "failure_closed",
    };
  }

  try {
    const axial = dominantAxisCertificate(pipe.geometries);
    const intersection = surfacesIntersect(pipe.geometries, structure.geometries);
    const stepM = Math.min(toleranceM / 4, axial.axialSpan / 2048);
    const sampleCount = Math.max(2, Math.ceil(axial.axialSpan / stepM));
    let maximumInteriorDepthM = 0;
    let deepestPoint = null;
    let minimumAxisSurfaceDistanceM = Number.POSITIVE_INFINITY;
    let hasInteriorAxisPoint = false;
    for (let index = 0; index <= sampleCount; index += 1) {
      const point = axial.start.clone().lerp(axial.end, index / sampleCount);
      const certificate = structurePointCertificate(structure.geometries, point);
      minimumAxisSurfaceDistanceM = Math.min(minimumAxisSurfaceDistanceM, certificate.surfaceDistance);
      if (certificate.inside) {
        hasInteriorAxisPoint = true;
        if (certificate.surfaceDistance > maximumInteriorDepthM) {
          maximumInteriorDepthM = certificate.surfaceDistance;
          deepestPoint = point.toArray();
        }
      }
    }

    if (maximumInteriorDepthM > toleranceM) {
      return {
        status: "CLASH",
        clashType: "pierce",
        location: deepestPoint,
        maximumInteriorDepthM,
        certificate: "straight_pipe_axis_structure_interior_depth_v1",
        surfaceIntersection: intersection,
      };
    }
    if (hasInteriorAxisPoint || minimumAxisSurfaceDistanceM <= SURFACE_EPSILON_M) {
      return {
        status: "CLEAR",
        clashType: null,
        location: null,
        maximumInteriorDepthM,
        certificate: "straight_pipe_axis_structure_interior_depth_v1",
        surfaceIntersection: intersection,
      };
    }
    if (intersection) {
      return {
        status: "NOT_EVALUATED",
        diagnostic: "triangle surfaces intersect outside the certified straight-pipe axis; general side intrusion is unsupported",
        certificate: "failure_closed_unsupported_side_intrusion",
        surfaceIntersection: true,
      };
    }
    return {
      status: "CLEAR",
      clashType: null,
      location: null,
      maximumInteriorDepthM: 0,
      certificate: "disjoint_triangle_surfaces_and_axis_outside_structure",
      surfaceIntersection: false,
    };
  } catch (error) {
    return { status: "NOT_EVALUATED", diagnostic: String(error?.message || error), certificate: "failure_closed" };
  }
}


function hardRecord(pairId, pipe, structure, result, evidence) {
  const location = threePointToIfc(result.location);
  return {
    clash_id: pairId,
    rule_id: HARD_CLASH_RULE_ID,
    status: result.status,
    element_a: pipe.descriptor,
    element_b: structure.descriptor,
    location: {
      building_storey: null,
      point_a_m: location,
      point_b_m: location,
    },
    clash_type: result.clashType ?? null,
    penetration_distance_m: null,
    tolerance_m: evidence.tolerance_m,
    diagnostic: result.diagnostic ?? null,
    evidence: {
      detector: "web-ifc 0.0.77 + three-mesh-bvh 0.9.14",
      model_a_sha256: evidence.model_a_sha256,
      model_b_sha256: evidence.model_b_sha256,
      selector: "IfcPipeSegment x (IfcWall | IfcBeam)",
      certificate: result.certificate,
      certified_maximum_interior_depth_m: result.maximumInteriorDepthM ?? null,
      aabb_classification_permitted: false,
      algorithm_boundary: "Straight finite pipe-axis certificate only; unsupported intersecting configurations fail closed.",
    },
  };
}


function clearanceRecord(pairId, pipe, structure, hardResult, evidence) {
  if (hardResult.status === "CLASH") return null;
  if (hardResult.status !== "CLEAR") {
    return {
      clearance_id: pairId,
      rule_id: CLEARANCE_RULE_ID,
      status: "NOT_EVALUATED",
      element_a: pipe.descriptor,
      element_b: structure.descriptor,
      clearance_distance_m: null,
      threshold_m: evidence.clearance_threshold_m,
      length_unit: "metre",
      diagnostic: "upstream hard-clash status is not safely clear",
      evidence: {
        detector: "three-mesh-bvh 0.9.14 triangle surface distance",
        certificate: "failure_closed_upstream_hard_clash",
        aabb_classification_permitted: false,
        algorithm_boundary: "AABB separation is not used; unknown upstream hard-clash status fails closed.",
      },
    };
  }
  try {
    const closest = minimumSurfaceDistance(pipe.geometries, structure.geometries);
    return {
      clearance_id: pairId,
      rule_id: CLEARANCE_RULE_ID,
      status: closest.distance < evidence.clearance_threshold_m ? "WARNING" : "CLEAR",
      element_a: pipe.descriptor,
      element_b: structure.descriptor,
      clearance_distance_m: closest.distance,
      threshold_m: evidence.clearance_threshold_m,
      length_unit: "metre",
      diagnostic: null,
      location: { point_a_m: threePointToIfc(closest.pointA), point_b_m: threePointToIfc(closest.pointB) },
      evidence: {
        detector: "three-mesh-bvh 0.9.14 triangle surface distance",
        certificate: "triangle_surface_minimum_distance_v1",
        aabb_classification_permitted: false,
        algorithm_boundary: "AABB separation is not used; Float32 triangle discretization limits numerical precision.",
      },
    };
  } catch (error) {
    return {
      clearance_id: pairId,
      rule_id: CLEARANCE_RULE_ID,
      status: "NOT_EVALUATED",
      element_a: pipe.descriptor,
      element_b: structure.descriptor,
      clearance_distance_m: null,
      threshold_m: evidence.clearance_threshold_m,
      length_unit: "metre",
      diagnostic: String(error?.message || error),
      evidence: {
        detector: "three-mesh-bvh 0.9.14 triangle surface distance",
        certificate: "failure_closed",
        aabb_classification_permitted: false,
        algorithm_boundary: "AABB separation is not used; unreliable distance queries fail closed.",
      },
    };
  }
}


async function sha256(bytes) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", view);
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, "0")).join("");
}


function disposeElements(elements) {
  for (const element of elements) for (const geometry of element.geometries) geometry.dispose();
}


function validateRuleThresholds(hardClashToleranceM, clearanceThresholdM) {
  if (!Number.isFinite(hardClashToleranceM) || !Number.isFinite(clearanceThresholdM) ||
      hardClashToleranceM !== HARD_CLASH_TOLERANCE_M || clearanceThresholdM !== CLEARANCE_THRESHOLD_M) {
    throw new Error("rule thresholds must be finite and match the frozen v1 rule constants");
  }
}


export async function evaluateIfcPair({
  ifcApi,
  mepBytes,
  structureBytes,
  coordinateSystem = "shared_project_coordinates",
  hardClashToleranceM = HARD_CLASH_TOLERANCE_M,
  clearanceThresholdM = CLEARANCE_THRESHOLD_M,
}) {
  const startedAt = globalThis.performance?.now?.() ?? Date.now();
  const mepData = mepBytes instanceof Uint8Array ? mepBytes : new Uint8Array(mepBytes);
  const structureData = structureBytes instanceof Uint8Array ? structureBytes : new Uint8Array(structureBytes);
  const evidence = {
    model_a_sha256: await sha256(mepData),
    model_b_sha256: await sha256(structureData),
    tolerance_m: hardClashToleranceM,
    clearance_threshold_m: clearanceThresholdM,
  };
  let mepModelId = null;
  let structureModelId = null;
  let pipes = [];
  let structures = [];
  try {
    if (coordinateSystem !== "shared_project_coordinates") {
      throw new Error("shared project coordinates were not explicitly established");
    }
    validateRuleThresholds(hardClashToleranceM, clearanceThresholdM);
    mepModelId = ifcApi.OpenModel(mepData);
    structureModelId = ifcApi.OpenModel(structureData);
    if (mepModelId < 0 || structureModelId < 0) throw new Error("web-ifc could not open both input models");
    const schemas = [ifcApi.GetModelSchema(mepModelId), ifcApi.GetModelSchema(structureModelId)];
    if (schemas.some(schema => schema !== "IFC4")) throw new Error(`unsupported IFC schema: ${schemas.join(",")}`);
    validateMetreLengthUnit(ifcApi, mepModelId);
    validateMetreLengthUnit(ifcApi, structureModelId);
    const coordinationMatrices = [
      coordinationMatrix(ifcApi, mepModelId),
      coordinationMatrix(ifcApi, structureModelId),
    ];
    if (JSON.stringify(coordinationMatrices[0]) !== JSON.stringify(coordinationMatrices[1])) {
      throw new Error("input models do not share the same web-ifc coordination transform");
    }
    pipes = collectElements(ifcApi, mepModelId, [IFCPIPESEGMENT], "mep");
    structures = collectElements(ifcApi, structureModelId, [...SUPPORTED_STRUCTURE_TYPES.keys()], "structure");
    if (pipes.length === 0) throw new Error("MEP model contains no IfcPipeSegment");
    if (structures.length === 0) throw new Error("structure model contains no IfcWall or IfcBeam");

    const clashRecords = [];
    const clearanceRecords = [];
    for (const pipe of pipes) {
      for (const structure of structures) {
        const pairId = `${pipe.descriptor.global_id || `express-${pipe.expressId}`}:${structure.descriptor.global_id || `express-${structure.expressId}`}`;
        const hardResult = evaluateHardPair(pipe, structure, hardClashToleranceM);
        clashRecords.push(hardRecord(pairId, pipe, structure, hardResult, evidence));
        const clearance = clearanceRecord(pairId, pipe, structure, hardResult, evidence);
        if (clearance) clearanceRecords.push(clearance);
      }
    }
    const endedAt = globalThis.performance?.now?.() ?? Date.now();
    return {
      run_status: "PASS",
      schema: "IFC4",
      length_unit: "metre",
      coordinate_system: coordinateSystem,
      coordination_matrices: coordinationMatrices,
      rules: {
        hard_clash: { rule_id: HARD_CLASH_RULE_ID, tolerance_m: hardClashToleranceM },
        clearance: { rule_id: CLEARANCE_RULE_ID, threshold_m: clearanceThresholdM },
      },
      element_counts: { pipes: pipes.length, structures: structures.length },
      pair_count: clashRecords.length,
      clash_records: clashRecords,
      clearance_records: clearanceRecords,
      duration_ms: endedAt - startedAt,
      diagnostics: [],
    };
  } catch (error) {
    return {
      run_status: "NOT_EVALUATED",
      schema: null,
      length_unit: "metre",
      coordinate_system: coordinateSystem,
      coordination_matrices: null,
      rules: {
        hard_clash: { rule_id: HARD_CLASH_RULE_ID, tolerance_m: hardClashToleranceM },
        clearance: { rule_id: CLEARANCE_RULE_ID, threshold_m: clearanceThresholdM },
      },
      element_counts: { pipes: 0, structures: 0 },
      pair_count: 0,
      clash_records: [],
      clearance_records: [],
      diagnostics: [String(error?.message || error)],
    };
  } finally {
    disposeElements(pipes);
    disposeElements(structures);
    if (mepModelId !== null && mepModelId >= 0) ifcApi.CloseModel(mepModelId);
    if (structureModelId !== null && structureModelId >= 0) ifcApi.CloseModel(structureModelId);
  }
}
