from __future__ import annotations

import argparse
import json
import math
from decimal import Decimal
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_FIXTURE_PATH = PROJECT_ROOT / "data" / "ground-truth" / "g3b-tolerance-fixtures.json"
DEFAULT_OUTPUT_PATH = PROJECT_ROOT / "outputs" / "local-only" / "g3b" / "tolerance-results.json"
EPSILON_M = 1e-12
CERTIFICATE_EPSILON = 1e-10


Vector = tuple[float, float, float]
Matrix = tuple[Vector, Vector, Vector]
DecimalVector = tuple[Decimal, Decimal, Decimal]


def decimal(value: float | Decimal) -> Decimal:
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def decimal_vector(values: list[float | Decimal]) -> DecimalVector:
    converted = tuple(decimal(value) for value in values)
    if len(converted) != 3 or not all(value.is_finite() for value in converted):
        raise ValueError("Expected three finite decimal coordinates")
    return converted  # type: ignore[return-value]


def vector(values: list[float | Decimal]) -> Vector:
    if len(values) != 3 or not all(math.isfinite(float(value)) for value in values):
        raise ValueError("Expected three finite coordinates")
    return tuple(float(value) for value in values)  # type: ignore[return-value]


def dot(a: Vector, b: Vector) -> float:
    return sum(a[index] * b[index] for index in range(3))


def subtract(a: Vector, b: Vector) -> Vector:
    return tuple(a[index] - b[index] for index in range(3))  # type: ignore[return-value]


def add(a: Vector, b: Vector) -> Vector:
    return tuple(a[index] + b[index] for index in range(3))  # type: ignore[return-value]


def scale(value: Vector, factor: float) -> Vector:
    return tuple(component * factor for component in value)  # type: ignore[return-value]


def norm(value: Vector) -> float:
    return math.sqrt(dot(value, value))


def matrix_multiply(a: Matrix, b: Matrix) -> Matrix:
    return tuple(
        tuple(sum(a[row][index] * b[index][column] for index in range(3)) for column in range(3))
        for row in range(3)
    )  # type: ignore[return-value]


def matrix_vector(matrix: Matrix, value: Vector) -> Vector:
    return tuple(dot(row, value) for row in matrix)  # type: ignore[return-value]


def transpose(matrix: Matrix) -> Matrix:
    return tuple(tuple(matrix[column][row] for column in range(3)) for row in range(3))  # type: ignore[return-value]


def rotation_matrix_xyz(degrees: list[float]) -> Matrix:
    x, y, z = (math.radians(value) for value in vector(degrees))
    cx, sx = math.cos(x), math.sin(x)
    cy, sy = math.cos(y), math.sin(y)
    cz, sz = math.cos(z), math.sin(z)
    rotation_x: Matrix = ((1.0, 0.0, 0.0), (0.0, cx, -sx), (0.0, sx, cx))
    rotation_y: Matrix = ((cy, 0.0, sy), (0.0, 1.0, 0.0), (-sy, 0.0, cy))
    rotation_z: Matrix = ((cz, -sz, 0.0), (sz, cz, 0.0), (0.0, 0.0, 1.0))
    return matrix_multiply(rotation_z, matrix_multiply(rotation_y, rotation_x))


def local_to_world(local: Vector, center: Vector, rotation: Matrix) -> Vector:
    return add(center, matrix_vector(rotation, local))


def world_to_local(world: Vector, center: Vector, rotation: Matrix) -> Vector:
    return matrix_vector(transpose(rotation), subtract(world, center))


def closest_segment_point_to_origin(start: Vector, end: Vector) -> Vector:
    delta = subtract(end, start)
    denominator = dot(delta, delta)
    if denominator <= EPSILON_M**2:
        raise ValueError("Pipe axis segment has zero length")
    parameter = min(1.0, max(0.0, -dot(start, delta) / denominator))
    return add(start, scale(delta, parameter))


def certified_maximum_interior_depth(
    start_local: Vector,
    end_local: Vector,
    half_extents: Vector,
    start_local_exact: DecimalVector,
    end_local_exact: DecimalVector,
    half_extents_exact: DecimalVector,
) -> tuple[Decimal | None, str, str | None]:
    closest = closest_segment_point_to_origin(start_local, end_local)
    if norm(closest) <= CERTIFICATE_EPSILON:
        return min(half_extents_exact), "center_crossing_inradius", None

    delta = subtract(end_local, start_local)
    delta_length = norm(delta)
    direction = scale(delta, 1.0 / delta_length)
    aligned_axes = [
        axis
        for axis in range(3)
        if math.isclose(abs(direction[axis]), 1.0, rel_tol=0.0, abs_tol=CERTIFICATE_EPSILON)
        and all(abs(direction[other]) <= CERTIFICATE_EPSILON for other in range(3) if other != axis)
    ]
    if len(aligned_axes) != 1:
        return None, "unsupported", "pipe axis is neither centre-crossing nor structure-face-normal"

    axis = aligned_axes[0]
    orthogonal_axes = [index for index in range(3) if index != axis]
    if any(
        abs(start_local[index]) > CERTIFICATE_EPSILON or abs(end_local[index]) > CERTIFICATE_EPSILON
        for index in orthogonal_axes
    ):
        return None, "unsupported", "face-normal pipe axis is not centred on the structure face"

    lower, upper = sorted((start_local_exact[axis], end_local_exact[axis]))
    structure_half_extent = half_extents_exact[axis]
    structure_lower = -structure_half_extent
    structure_upper = structure_half_extent
    intersection_lower = max(lower, structure_lower)
    intersection_upper = min(upper, structure_upper)
    if intersection_lower > intersection_upper:
        return Decimal(0), "face_normal_axis_interval", None

    if intersection_lower <= 0 <= intersection_upper:
        closest_coordinate = Decimal(0)
    elif intersection_upper < 0:
        closest_coordinate = intersection_upper
    else:
        closest_coordinate = intersection_lower
    axial_depth = max(Decimal(0), structure_half_extent - abs(closest_coordinate))
    maximum_depth = min(axial_depth, *(half_extents_exact[index] for index in orthogonal_axes))
    return maximum_depth, "face_normal_axis_interval", None


def world_aabb_overlap(
    center: Vector,
    rotation: Matrix,
    half_extents: Vector,
    pipe_start_world: Vector,
    pipe_end_world: Vector,
    pipe_radius: float,
) -> float:
    box_extent = tuple(
        sum(abs(rotation[row][column]) * half_extents[column] for column in range(3))
        for row in range(3)
    )
    box_min = tuple(center[index] - box_extent[index] for index in range(3))
    box_max = tuple(center[index] + box_extent[index] for index in range(3))

    axis_delta = subtract(pipe_end_world, pipe_start_world)
    axis_length = norm(axis_delta)
    if axis_length <= EPSILON_M:
        raise ValueError("Pipe axis segment has zero length")
    axis = scale(axis_delta, 1.0 / axis_length)
    radial_extent = tuple(pipe_radius * math.sqrt(max(0.0, 1.0 - component * component)) for component in axis)
    pipe_min = tuple(
        min(pipe_start_world[index], pipe_end_world[index]) - radial_extent[index] for index in range(3)
    )
    pipe_max = tuple(
        max(pipe_start_world[index], pipe_end_world[index]) + radial_extent[index] for index in range(3)
    )
    overlaps = [
        min(box_max[index], pipe_max[index]) - max(box_min[index], pipe_min[index])
        for index in range(3)
    ]
    return max(0.0, min(overlaps))


def evaluate_case(case: dict[str, Any], tolerance_m: Decimal) -> dict[str, Any]:
    case_id = case["case_id"]
    if not case.get("geometry_reliable", False):
        return {
            "case_id": case_id,
            "expected_status": case["expected_status"],
            "observed_status": "NOT_EVALUATED",
            "maximum_interior_depth_m": None,
            "maximum_interior_depth_exact_m": None,
            "certificate": "failure_closed",
            "diagnostic": case.get("failure_reason", "geometry reliability was not established"),
            "reliability_signal_source": "fixture_precondition",
            "world_aabb_minimum_overlap_m": None,
            "aabb_used_for_classification": False,
        }
    if not case.get("coordinate_system_consistent", False):
        return {
            "case_id": case_id,
            "expected_status": case["expected_status"],
            "observed_status": "NOT_EVALUATED",
            "maximum_interior_depth_m": None,
            "maximum_interior_depth_exact_m": None,
            "certificate": "failure_closed",
            "diagnostic": case.get("failure_reason", "shared coordinates were not established"),
            "reliability_signal_source": "fixture_precondition",
            "world_aabb_minimum_overlap_m": None,
            "aabb_used_for_classification": False,
        }

    try:
        structure = case["structure"]
        pipe = case["pipe"]
        center = vector(structure["center_world_m"])
        half_extents = vector(structure["half_extents_m"])
        half_extents_exact = decimal_vector(structure["half_extents_m"])
        if any(value <= 0.0 for value in half_extents):
            raise ValueError("Structure half extents must be positive")
        rotation = rotation_matrix_xyz(structure["rotation_deg_xyz"])
        start_authored = vector(pipe["axis_start_structure_local_m"])
        end_authored = vector(pipe["axis_end_structure_local_m"])
        start_authored_exact = decimal_vector(pipe["axis_start_structure_local_m"])
        end_authored_exact = decimal_vector(pipe["axis_end_structure_local_m"])
        radius = float(pipe["radius_m"])
        if not math.isfinite(radius) or radius <= 0.0:
            raise ValueError("Pipe radius must be positive")

        start_world = local_to_world(start_authored, center, rotation)
        end_world = local_to_world(end_authored, center, rotation)
        start_local = world_to_local(start_world, center, rotation)
        end_local = world_to_local(end_world, center, rotation)
        round_trip_error = max(
            *(abs(start_local[index] - start_authored[index]) for index in range(3)),
            *(abs(end_local[index] - end_authored[index]) for index in range(3)),
        )
        if round_trip_error > CERTIFICATE_EPSILON:
            raise ValueError("world/local transform round-trip exceeds analytic certificate tolerance")
        maximum_depth_exact, certificate, diagnostic = certified_maximum_interior_depth(
            start_authored,
            end_authored,
            half_extents,
            start_authored_exact,
            end_authored_exact,
            half_extents_exact,
        )
        aabb_overlap = world_aabb_overlap(
            center,
            rotation,
            half_extents,
            start_world,
            end_world,
            radius,
        )
        if maximum_depth_exact is None:
            observed_status = "NOT_EVALUATED"
        elif (
            maximum_depth_exact > 0
            and min(half_extents_exact) <= tolerance_m
        ):
            observed_status = "NOT_EVALUATED"
            certificate = "degenerate_tolerance_core"
            diagnostic = (
                "volumetric intersection exists but the structure erosion core is empty or "
                "degenerate at the requested tolerance"
            )
        elif maximum_depth_exact > tolerance_m:
            observed_status = "CLASH"
        else:
            observed_status = "CLEAR"
        maximum_depth = None if maximum_depth_exact is None else float(maximum_depth_exact)
        maximum_depth_exact_text = None if maximum_depth_exact is None else format(maximum_depth_exact, "f")
        return {
            "case_id": case_id,
            "expected_status": case["expected_status"],
            "observed_status": observed_status,
            "maximum_interior_depth_m": maximum_depth,
            "maximum_interior_depth_exact_m": maximum_depth_exact_text,
            "certificate": certificate,
            "diagnostic": diagnostic,
            "reliability_signal_source": "analytic_certificate",
            "transform_round_trip_error_m": round_trip_error,
            "world_aabb_minimum_overlap_m": aabb_overlap,
            "aabb_used_for_classification": False,
        }
    except (KeyError, TypeError, ValueError) as error:
        return {
            "case_id": case_id,
            "expected_status": case["expected_status"],
            "observed_status": "NOT_EVALUATED",
            "maximum_interior_depth_m": None,
            "maximum_interior_depth_exact_m": None,
            "certificate": "failure_closed",
            "diagnostic": str(error),
            "reliability_signal_source": "analytic_certificate",
            "world_aabb_minimum_overlap_m": None,
            "aabb_used_for_classification": False,
        }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate the bounded G3B tolerance proof fixtures.")
    parser.add_argument("--fixture", type=Path, default=DEFAULT_FIXTURE_PATH)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_PATH)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    fixture = json.loads(args.fixture.read_text(encoding="utf-8"), parse_float=Decimal)
    tolerance_m = decimal(fixture["tolerance_m"])
    results = [evaluate_case(case, tolerance_m) for case in fixture["cases"]]
    by_case = {case["case_id"]: case for case in fixture["cases"]}
    for result in results:
        expected_depth = by_case[result["case_id"]]["expected_maximum_interior_depth_m"]
        observed_depth = result["maximum_interior_depth_m"]
        observed_depth_exact = result["maximum_interior_depth_exact_m"]
        result["status_match"] = result["observed_status"] == result["expected_status"]
        result["depth_match"] = (
            expected_depth is None
            and observed_depth is None
            and observed_depth_exact is None
            or expected_depth is not None
            and observed_depth is not None
            and observed_depth_exact is not None
            and decimal(expected_depth) == Decimal(observed_depth_exact)
        )
        requires_aabb_divergence = by_case[result["case_id"]].get(
            "require_world_aabb_overlap_gt_tolerance",
            False,
        )
        result["required_aabb_divergence_match"] = (
            not requires_aabb_divergence
            or result["world_aabb_minimum_overlap_m"] is not None
            and result["world_aabb_minimum_overlap_m"] > float(tolerance_m)
            and result["maximum_interior_depth_m"] is not None
            and result["maximum_interior_depth_m"] < float(tolerance_m)
        )

    all_pass = all(
        result["status_match"]
        and result["depth_match"]
        and result["required_aabb_divergence_match"]
        and not result["aabb_used_for_classification"]
        for result in results
    )
    status_counts = {"CLASH": 0, "CLEAR": 0, "NOT_EVALUATED": 0}
    for result in results:
        status_counts[result["observed_status"]] += 1
    output = {
        "semantic_id": "STRUCTURE_EROSION_INTERIOR_DEPTH_V1",
        "status": "PASS" if all_pass else "FAIL",
        "tolerance_m": float(tolerance_m),
        "comparison": (
            "maximum_interior_depth_m > tolerance_m; equality is CLEAR only when the "
            "structure erosion core remains non-degenerate"
        ),
        "aabb_classification_permitted": False,
        "supported_scope": fixture["scope"],
        "case_count": len(results),
        "status_counts": status_counts,
        "all_statuses_and_certificates_match": all_pass,
        "results": results,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output, indent=2))
    if not all_pass:
        raise SystemExit(3)


if __name__ == "__main__":
    main()
