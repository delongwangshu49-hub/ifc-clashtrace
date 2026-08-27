from __future__ import annotations

import argparse
import hashlib
import json
import math
from decimal import Decimal
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BASELINE = PROJECT_ROOT / "data" / "ground-truth" / "g3c-clearance-baseline.json"
DEFAULT_OUTPUT = PROJECT_ROOT / "outputs" / "local-only" / "g3c" / "clearance-results.json"
TRANSFORM_EPSILON_M = 1e-10


Vector = tuple[float, float, float]
Matrix = tuple[Vector, Vector, Vector]


def decimal(value: float | str | Decimal) -> Decimal:
    return value if isinstance(value, Decimal) else Decimal(str(value))


def vector(values: list[float | Decimal]) -> Vector:
    if len(values) != 3 or not all(math.isfinite(float(value)) for value in values):
        raise ValueError("Expected three finite coordinates")
    return tuple(float(value) for value in values)  # type: ignore[return-value]


def matrix_multiply(a: Matrix, b: Matrix) -> Matrix:
    return tuple(
        tuple(sum(a[row][index] * b[index][column] for index in range(3)) for column in range(3))
        for row in range(3)
    )  # type: ignore[return-value]


def rotation_matrix_xyz(degrees: list[float]) -> Matrix:
    x, y, z = (math.radians(value) for value in vector(degrees))
    cx, sx = math.cos(x), math.sin(x)
    cy, sy = math.cos(y), math.sin(y)
    cz, sz = math.cos(z), math.sin(z)
    rotation_x: Matrix = ((1.0, 0.0, 0.0), (0.0, cx, -sx), (0.0, sx, cx))
    rotation_y: Matrix = ((cy, 0.0, sy), (0.0, 1.0, 0.0), (-sy, 0.0, cy))
    rotation_z: Matrix = ((cz, -sz, 0.0), (sz, cz, 0.0), (0.0, 0.0, 1.0))
    return matrix_multiply(rotation_z, matrix_multiply(rotation_y, rotation_x))


def transpose(matrix: Matrix) -> Matrix:
    return tuple(tuple(matrix[column][row] for column in range(3)) for row in range(3))  # type: ignore[return-value]


def world_to_local(world: Vector, center: Vector, rotation: Matrix) -> Vector:
    offset = tuple(world[index] - center[index] for index in range(3))
    inverse = transpose(rotation)
    return tuple(sum(inverse[row][column] * offset[column] for column in range(3)) for row in range(3))  # type: ignore[return-value]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def fail_closed(case: dict[str, Any], reason: str, source: str) -> dict[str, Any]:
    return {
        "case_id": case["case_id"],
        "record_emitted": True,
        "observed_status": "NOT_EVALUATED",
        "clearance_distance_m": None,
        "clearance_distance_exact_m": None,
        "certificate": "failure_closed",
        "diagnostic": reason,
        "reliability_signal_source": source,
        "record": build_record(case, "NOT_EVALUATED", None, "failure_closed", reason),
    }


def build_record(
    case: dict[str, Any],
    status: str,
    clearance: Decimal | None,
    certificate: str,
    diagnostic: str | None,
) -> dict[str, Any]:
    return {
        "clearance_id": f"{case['case_id']}-CLEARANCE",
        "rule_id": "MEP_STRUCTURE_CLEARANCE_WARNING_V1",
        "status": status,
        "element_a": {
            "model_role": "mep",
            "entity_type": case["pipe"]["entity_type"],
            "global_id": case["pipe"]["global_id"],
            "name": case["pipe"]["name"],
        },
        "element_b": {
            "model_role": "structure",
            "entity_type": case["structure"]["entity_type"],
            "global_id": case["structure"]["global_id"],
            "name": case["structure"]["name"],
        },
        "clearance_distance_m": None if clearance is None else float(clearance),
        "clearance_distance_exact_m": None if clearance is None else format(clearance, "f"),
        "threshold_m": 0.05,
        "length_unit": "metre",
        "evidence": {
            "detector": "G3C_CONTROLLED_ANALYTIC_SURFACE_DISTANCE_V1",
            "certificate": certificate,
            "artifact_path": case["_artifact_path"],
            "artifact_sha256": case["_artifact_sha256"],
            "algorithm_boundary": (
                "finite circular cylinder against a certified closed OBB face or rectangular opening frame; "
                "world-axis AABB separation is not used"
            ),
        },
        "diagnostic": diagnostic,
    }


def verify_transform(case: dict[str, Any]) -> tuple[list[Decimal], list[Decimal], float]:
    structure = case["structure"]
    pipe = case["pipe"]
    authored_start = pipe["axis_start_structure_local_m"]
    authored_end = pipe["axis_end_structure_local_m"]
    if authored_start is None or authored_end is None:
        raise ValueError("pipe axis coordinates are unavailable")
    center = vector(structure["center_world_m"])
    rotation = rotation_matrix_xyz(structure["rotation_deg_xyz"])
    recovered_start = world_to_local(vector(pipe["axis_start_world_m"]), center, rotation)
    recovered_end = world_to_local(vector(pipe["axis_end_world_m"]), center, rotation)
    round_trip_error = max(
        *(abs(recovered_start[index] - float(authored_start[index])) for index in range(3)),
        *(abs(recovered_end[index] - float(authored_end[index])) for index in range(3)),
    )
    if round_trip_error > TRANSFORM_EPSILON_M:
        raise ValueError("world/local transform round-trip exceeds the analytic certificate tolerance")
    return [decimal(value) for value in authored_start], [decimal(value) for value in authored_end], round_trip_error


def box_face_clearance(case: dict[str, Any]) -> tuple[Decimal, str, float]:
    structure = case["structure"]
    pipe = case["pipe"]
    start, end, round_trip_error = verify_transform(case)
    half_extents = [decimal(value) for value in structure["half_extents_m"]]
    radius = decimal(pipe["radius_m"])
    if radius <= 0 or any(value <= 0 for value in half_extents):
        raise ValueError("solid dimensions must be positive")
    if start[1] != end[1]:
        raise ValueError("unsupported box certificate: pipe axis is not parallel to the certified face")
    if not all(-half_extents[axis] <= endpoint[axis] <= half_extents[axis] for axis in (0, 2) for endpoint in (start, end)):
        raise ValueError("unsupported box certificate: pipe axis projection leaves the certified face footprint")
    clearance = abs(start[1]) - half_extents[1] - radius
    if clearance < 0:
        raise ValueError("non-clash clearance evaluation received intersecting certified solids")
    return clearance, "obb_face_parallel_finite_cylinder", round_trip_error


def opening_frame_clearance(case: dict[str, Any]) -> tuple[Decimal, str, float]:
    structure = case["structure"]
    pipe = case["pipe"]
    start, end, round_trip_error = verify_transform(case)
    half_extents = [decimal(value) for value in structure["half_extents_m"]]
    opening_x, opening_z = (decimal(value) for value in structure["opening_half_extents_xz_m"])
    radius = decimal(pipe["radius_m"])
    if start[0] != end[0] or start[2] != end[2]:
        raise ValueError("unsupported opening certificate: pipe axis is not wall-normal")
    lower_y, upper_y = sorted((start[1], end[1]))
    if lower_y > -half_extents[1] or upper_y < half_extents[1]:
        raise ValueError("unsupported opening certificate: pipe does not span the opening depth")
    clearance_x = opening_x - abs(start[0]) - radius
    clearance_z = opening_z - abs(start[2]) - radius
    clearance = min(clearance_x, clearance_z)
    if clearance < 0:
        raise ValueError("pipe does not fit inside the modeled opening")
    return clearance, "rectangular_opening_edge_to_finite_cylinder", round_trip_error


def evaluate_case(case: dict[str, Any], threshold: Decimal) -> dict[str, Any]:
    if case["hard_clash_status"] == "CLASH":
        return {
            "case_id": case["case_id"],
            "record_emitted": False,
            "observed_status": None,
            "clearance_distance_m": None,
            "clearance_distance_exact_m": None,
            "certificate": "hard_clash_precedence",
            "diagnostic": "pair already classified as CLASH; clearance record suppressed",
            "reliability_signal_source": "upstream_hard_clash_record",
            "record": None,
        }
    if case["hard_clash_status"] != "CLEAR":
        return fail_closed(case, "upstream hard-clash status is not safely clear", "upstream_hard_clash_record")
    if not case.get("geometry_reliable", False) or not case["pipe"].get("geometry_present", False):
        return fail_closed(case, case.get("failure_reason") or "geometry reliability was not established", "fixture_precondition")
    if not case.get("coordinate_system_consistent", False):
        return fail_closed(case, case.get("failure_reason") or "shared coordinates were not established", "fixture_precondition")
    if case["pipe"]["entity_type"] != "IfcPipeSegment" or case["structure"]["entity_type"] not in {"IfcWall", "IfcBeam"}:
        return fail_closed(case, "element type lies outside the approved clearance rule", "contract_guard")

    try:
        kind = case["structure"]["kind"]
        if kind == "box":
            clearance, certificate, round_trip_error = box_face_clearance(case)
        elif kind == "opening_frame":
            clearance, certificate, round_trip_error = opening_frame_clearance(case)
        else:
            raise ValueError(f"unsupported structure certificate family: {kind}")
        status = "WARNING" if clearance < threshold else "CLEAR"
        return {
            "case_id": case["case_id"],
            "record_emitted": True,
            "observed_status": status,
            "clearance_distance_m": float(clearance),
            "clearance_distance_exact_m": format(clearance, "f"),
            "certificate": certificate,
            "diagnostic": None,
            "reliability_signal_source": "analytic_certificate",
            "transform_round_trip_error_m": round_trip_error,
            "record": build_record(case, status, clearance, certificate, None),
        }
    except (KeyError, TypeError, ValueError) as error:
        return fail_closed(case, str(error), "analytic_certificate")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate bounded G3C clearance fixtures.")
    parser.add_argument("--baseline", type=Path, default=DEFAULT_BASELINE)
    parser.add_argument("--artifact-root", type=Path, default=PROJECT_ROOT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    baseline = json.loads(args.baseline.read_text(encoding="utf-8"), parse_float=Decimal)
    if (
        baseline.get("dataset_id") != "IFC_CLASHTRACE_G3C_CLEARANCE_V1"
        or baseline.get("version") != "1.0.0"
        or baseline.get("rule_id") != "MEP_STRUCTURE_CLEARANCE_WARNING_V1"
        or baseline.get("license_spdx_or_name") != "CC0-1.0"
        or baseline.get("length_unit") != "metre"
        or baseline.get("coordinate_system") != "shared_project_coordinates"
        or decimal(baseline.get("threshold_m")) != Decimal("0.05")
        or baseline.get("case_count") != 9
        or len(baseline.get("cases", [])) != 9
    ):
        raise AssertionError("G3C frozen top-level contract changed")
    threshold = decimal(baseline["threshold_m"])
    results: list[dict[str, Any]] = []
    for expected in baseline["cases"]:
        artifact_path = args.artifact_root / expected["artifact"]["path"]
        observed_hash = sha256(artifact_path)
        if observed_hash != expected["artifact"]["file_sha256"]:
            raise AssertionError(f"{expected['case_id']} artifact hash mismatch")
        case = json.loads(artifact_path.read_text(encoding="utf-8"), parse_float=Decimal)
        if (
            case.get("dataset_id") != baseline["dataset_id"]
            or case.get("dataset_version") != baseline["version"]
            or case.get("case_id") != expected["case_id"]
            or case.get("rule_id") != baseline["rule_id"]
            or case.get("length_unit") != baseline["length_unit"]
            or case.get("coordinate_system") != baseline["coordinate_system"]
        ):
            raise AssertionError(f"{expected['case_id']} artifact contract changed")
        case["_artifact_path"] = expected["artifact"]["path"]
        case["_artifact_sha256"] = observed_hash
        result = evaluate_case(case, threshold)
        expected_record = expected["expected_record"]
        result["emission_match"] = result["record_emitted"] == expected_record["emitted"]
        result["status_match"] = result["observed_status"] == expected_record["status"]
        expected_clearance = expected_record["clearance_distance_m"]
        result["clearance_match"] = (
            expected_clearance is None
            and result["clearance_distance_exact_m"] is None
            or expected_clearance is not None
            and result["clearance_distance_exact_m"] is not None
            and decimal(expected_clearance) == Decimal(result["clearance_distance_exact_m"])
        )
        results.append(result)

    all_pass = all(result["emission_match"] and result["status_match"] and result["clearance_match"] for result in results)
    status_counts = {"WARNING": 0, "CLEAR": 0, "NOT_EVALUATED": 0, "SUPPRESSED": 0}
    for result in results:
        key = "SUPPRESSED" if not result["record_emitted"] else result["observed_status"]
        status_counts[key] += 1
    records = [result["record"] for result in results if result["record_emitted"]]
    output = {
        "detector": "G3C_CONTROLLED_ANALYTIC_SURFACE_DISTANCE_V1",
        "status": "PASS" if all_pass else "FAIL",
        "rule_id": baseline["rule_id"],
        "threshold_m": float(threshold),
        "comparison": "WARNING when clearance_distance_m < threshold_m; equality is CLEAR",
        "aabb_classification_permitted": False,
        "case_count": len(results),
        "record_count": len(records),
        "status_counts": status_counts,
        "all_expected_records_match": all_pass,
        "records": records,
        "results": results,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output, indent=2))
    if not all_pass:
        raise SystemExit(3)


if __name__ == "__main__":
    main()
