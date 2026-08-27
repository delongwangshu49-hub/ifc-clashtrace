import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BoxGeometry,
  CylinderGeometry,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshBVH } from 'three-mesh-bvh';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const identity = new Matrix4();
const meshThresholdEpsilonM = 1e-7;

function parseArguments() {
  const values = {
    baseline: path.join(projectRoot, 'data/ground-truth/g3c-clearance-baseline.json'),
    artifactRoot: projectRoot,
    output: path.join(projectRoot, 'outputs/local-only/g3c/mesh-reference-results.json'),
  };
  for (let index = 2; index < process.argv.length; index += 2) {
    const flag = process.argv[index];
    const value = process.argv[index + 1];
    if (!value) throw new Error(`Missing value for ${flag}`);
    if (flag === '--baseline') values.baseline = path.resolve(value);
    else if (flag === '--artifact-root') values.artifactRoot = path.resolve(value);
    else if (flag === '--output') values.output = path.resolve(value);
    else throw new Error(`Unknown argument: ${flag}`);
  }
  return values;
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function structureMatrix(structure) {
  const [x, y, z] = structure.rotation_deg_xyz.map(value => value * Math.PI / 180);
  const [cx, sx] = [Math.cos(x), Math.sin(x)];
  const [cy, sy] = [Math.cos(y), Math.sin(y)];
  const [cz, sz] = [Math.cos(z), Math.sin(z)];
  const rotationX = [[1, 0, 0], [0, cx, -sx], [0, sx, cx]];
  const rotationY = [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]];
  const rotationZ = [[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]];
  const multiply = (a, b) => a.map((row, rowIndex) => row.map((unused, columnIndex) => (
    a[rowIndex].reduce((sum, value, index) => sum + value * b[index][columnIndex], 0)
  )));
  const rotation = multiply(rotationZ, multiply(rotationY, rotationX));
  const [tx, ty, tz] = structure.center_world_m;
  return new Matrix4().set(
    rotation[0][0], rotation[0][1], rotation[0][2], tx,
    rotation[1][0], rotation[1][1], rotation[1][2], ty,
    rotation[2][0], rotation[2][1], rotation[2][2], tz,
    0, 0, 0, 1,
  );
}

function transformedBox(size, position, matrix) {
  const geometry = new BoxGeometry(...size);
  geometry.translate(...position);
  geometry.applyMatrix4(matrix);
  return geometry;
}

function buildStructureGeometry(structure) {
  const [hx, hy, hz] = structure.half_extents_m;
  const matrix = structureMatrix(structure);
  if (structure.kind === 'box') {
    return transformedBox([2 * hx, 2 * hy, 2 * hz], [0, 0, 0], matrix);
  }
  if (structure.kind !== 'opening_frame') {
    throw new Error(`Unsupported mesh-reference structure kind: ${structure.kind}`);
  }
  const [openingX, openingZ] = structure.opening_half_extents_xz_m;
  const sideWidth = hx - openingX;
  const capHeight = hz - openingZ;
  if (sideWidth <= 0 || capHeight <= 0) throw new Error('Opening frame dimensions are invalid');
  const localParts = [
    transformedBox([sideWidth, 2 * hy, 2 * hz], [-(openingX + sideWidth / 2), 0, 0], identity),
    transformedBox([sideWidth, 2 * hy, 2 * hz], [openingX + sideWidth / 2, 0, 0], identity),
    transformedBox([2 * openingX, 2 * hy, capHeight], [0, 0, openingZ + capHeight / 2], identity),
    transformedBox([2 * openingX, 2 * hy, capHeight], [0, 0, -(openingZ + capHeight / 2)], identity),
  ];
  const geometry = mergeGeometries(localParts, false);
  for (const part of localParts) part.dispose();
  if (!geometry) throw new Error('Unable to construct opening-frame reference geometry');
  geometry.applyMatrix4(matrix);
  return geometry;
}

function buildPipeGeometry(pipe) {
  if (!pipe.geometry_present) return null;
  const start = new Vector3(...pipe.axis_start_world_m);
  const end = new Vector3(...pipe.axis_end_world_m);
  const direction = end.clone().sub(start);
  const length = direction.length();
  if (!(length > 0) || !(pipe.radius_m > 0)) throw new Error('Pipe dimensions are invalid');
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize());
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const matrix = new Matrix4().compose(midpoint, quaternion, new Vector3(1, 1, 1));
  const geometry = new CylinderGeometry(pipe.radius_m, pipe.radius_m, length, 2048, 1, false);
  geometry.applyMatrix4(matrix);
  return geometry;
}

function classifyDistance(distance, threshold) {
  return distance < threshold ? 'WARNING' : 'CLEAR';
}

function expectedMatches(result, expected) {
  const emitted = result.record_emitted === expected.emitted;
  const status = result.observed_status === expected.status;
  const clearance = expected.clearance_distance_m === null
    ? result.clearance_distance_m === null
    : result.clearance_distance_m !== null
      && Math.abs(result.clearance_distance_m - expected.clearance_distance_m) <= meshThresholdEpsilonM;
  return emitted && status && clearance;
}

function evaluateCase(caseData, expected, threshold) {
  if (!caseData.geometry_reliable || !caseData.pipe.geometry_present) {
    return {
      case_id: caseData.case_id,
      record_emitted: true,
      observed_status: 'NOT_EVALUATED',
      clearance_distance_m: null,
      certificate: 'mesh_reference_failure_closed',
      diagnostic: caseData.failure_reason || 'geometry reliability was not established',
    };
  }
  if (!caseData.coordinate_system_consistent) {
    return {
      case_id: caseData.case_id,
      record_emitted: true,
      observed_status: 'NOT_EVALUATED',
      clearance_distance_m: null,
      certificate: 'mesh_reference_failure_closed',
      diagnostic: caseData.failure_reason || 'shared coordinates were not established',
    };
  }

  const structureGeometry = buildStructureGeometry(caseData.structure);
  const pipeGeometry = buildPipeGeometry(caseData.pipe);
  try {
    const bvh = new MeshBVH(structureGeometry);
    const intersects = bvh.intersectsGeometry(pipeGeometry, identity);
    if (caseData.hard_clash_status === 'CLASH') {
      if (!intersects) throw new Error('Hard-clash suppression fixture does not intersect in the mesh reference');
      return {
        case_id: caseData.case_id,
        record_emitted: false,
        observed_status: null,
        clearance_distance_m: null,
        certificate: 'independent_mesh_hard_clash_precedence',
        diagnostic: 'independent mesh intersection confirms clearance suppression',
      };
    }
    const target1 = {};
    const target2 = {};
    const hit = bvh.closestPointToGeometry(pipeGeometry, identity, target1, target2);
    if (!hit || !Number.isFinite(hit.distance)) throw new Error('Mesh distance query did not return a finite result');
    const distance = Math.max(0, hit.distance);
    return {
      case_id: caseData.case_id,
      record_emitted: true,
      observed_status: classifyDistance(distance, threshold),
      clearance_distance_m: distance,
      certificate: 'three_mesh_bvh_triangle_surface_distance',
      diagnostic: null,
      mesh_intersection: intersects,
      closest_point_structure_m: target1.point?.toArray() ?? null,
      closest_point_pipe_m: target2.point?.toArray() ?? null,
    };
  } finally {
    structureGeometry.dispose();
    pipeGeometry.dispose();
  }
}

async function main() {
  const args = parseArguments();
  const baseline = JSON.parse(await readFile(args.baseline, 'utf8'));
  const results = [];
  for (const entry of baseline.cases) {
    const artifactPath = path.join(args.artifactRoot, entry.artifact.path);
    const bytes = await readFile(artifactPath);
    if (sha256(bytes) !== entry.artifact.file_sha256) {
      throw new Error(`${entry.case_id} artifact hash mismatch`);
    }
    const caseData = JSON.parse(bytes.toString('utf8'));
    const result = evaluateCase(caseData, entry.expected_record, baseline.threshold_m);
    result.expected_match = expectedMatches(result, entry.expected_record);
    results.push(result);
  }
  const allPass = results.every(result => result.expected_match);
  const output = {
    detector: 'three-mesh-bvh 0.9.14 triangle surface distance',
    status: allPass ? 'PASS' : 'FAIL',
    rule_id: baseline.rule_id,
    threshold_m: baseline.threshold_m,
    mesh_threshold_epsilon_m: meshThresholdEpsilonM,
    aabb_classification_permitted: false,
    case_count: results.length,
    all_expected_records_match: allPass,
    results,
  };
  await mkdir(path.dirname(args.output), { recursive: true });
  await writeFile(args.output, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (!allPass) process.exitCode = 3;
}

await main();
