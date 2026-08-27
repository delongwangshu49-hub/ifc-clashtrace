from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import uuid
from pathlib import Path
from typing import Any

import ifcopenshell.guid


PROJECT_ROOT = Path(__file__).resolve().parents[1]
LEDGER_PATH = PROJECT_ROOT / "data" / "g3c-operation-ledger.json"
DEFAULT_OUTPUT_ROOT = PROJECT_ROOT / "outputs" / "local-only" / "g3c-generation"
NAMESPACE = uuid.UUID("938a5e4c-4ed9-44be-a849-fecb2ab669c3")
CASE_ID_PATTERN = re.compile(r"G3C\d{2}")


Vector = tuple[float, float, float]
Matrix = tuple[Vector, Vector, Vector]


def vector(values: list[float]) -> Vector:
    if len(values) != 3 or not all(math.isfinite(value) for value in values):
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


def local_to_world(local: Vector, center: Vector, rotation: Matrix) -> list[float]:
    return [
        center[row] + sum(rotation[row][column] * local[column] for column in range(3))
        for row in range(3)
    ]


def stable_guid(label: str) -> str:
    return ifcopenshell.guid.compress(uuid.uuid5(NAMESPACE, label).hex)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def artifact_target(output_root: Path, case_id: Any) -> tuple[str, Path]:
    if not isinstance(case_id, str) or CASE_ID_PATTERN.fullmatch(case_id) is None:
        raise ValueError("G3C case_id must match G3C followed by exactly two digits")
    relative_path = Path("data") / "generated" / "g3c" / f"{case_id.lower()}-clearance-geometry.json"
    target = (output_root / relative_path).resolve()
    try:
        target.relative_to(output_root)
    except ValueError as error:
        raise ValueError("G3C artifact path escapes the selected output root") from error
    return relative_path.as_posix(), target


def build_artifact(ledger: dict[str, Any], case: dict[str, Any]) -> dict[str, Any]:
    structure = case["structure"]
    pipe = case["pipe"]
    center = vector(structure["center_world_m"])
    rotation = rotation_matrix_xyz(structure["rotation_deg_xyz"])
    start_local = pipe["axis_start_structure_local_m"]
    end_local = pipe["axis_end_structure_local_m"]
    start_world = None if start_local is None else local_to_world(vector(start_local), center, rotation)
    end_world = None if end_local is None else local_to_world(vector(end_local), center, rotation)
    structure_payload = {
        "entity_type": case["structure_entity_type"],
        "global_id": stable_guid(f"{case['case_id']}:structure"),
        "name": f"{case['case_id']} controlled structure",
        **structure,
    }
    pipe_payload = {
        "entity_type": "IfcPipeSegment",
        "global_id": stable_guid(f"{case['case_id']}:pipe"),
        "name": f"{case['case_id']} controlled pipe",
        "geometry_present": pipe["geometry_present"],
        "radius_m": pipe["radius_m"],
        "axis_start_structure_local_m": start_local,
        "axis_end_structure_local_m": end_local,
        "axis_start_world_m": start_world,
        "axis_end_world_m": end_world,
    }
    return {
        "dataset_id": ledger["dataset_id"],
        "dataset_version": ledger["version"],
        "case_id": case["case_id"],
        "title": case["title"],
        "rule_id": ledger["rule_id"],
        "length_unit": ledger["length_unit"],
        "coordinate_system": ledger["coordinate_system"],
        "hard_clash_status": case["hard_clash_status"],
        "geometry_reliable": case["geometry_reliable"],
        "coordinate_system_consistent": case["coordinate_system_consistent"],
        "failure_reason": case.get("failure_reason"),
        "generation_basis": "constructive finite-cylinder and closed-box/opening-frame operations",
        "structure": structure_payload,
        "pipe": pipe_payload,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate deterministic G3C clearance artifacts and baseline.")
    parser.add_argument("--ledger", type=Path, default=LEDGER_PATH)
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument("--allow-baseline-write", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_root = args.output_root.resolve()
    if output_root == PROJECT_ROOT.resolve() and not args.allow_baseline_write:
        raise SystemExit("Refusing to write the committed G3C baseline without --allow-baseline-write")

    ledger = json.loads(args.ledger.read_text(encoding="utf-8"))
    planned_artifacts: list[tuple[dict[str, Any], str, Path]] = []
    seen_case_ids: set[str] = set()
    for case in ledger["cases"]:
        case_id = case.get("case_id")
        relative_path, artifact_path = artifact_target(output_root, case_id)
        if case_id in seen_case_ids:
            raise ValueError(f"Duplicate G3C case_id: {case_id}")
        seen_case_ids.add(case_id)
        planned_artifacts.append((case, relative_path, artifact_path))

    baseline_cases: list[dict[str, Any]] = []
    for case, relative_path, artifact_path in planned_artifacts:
        write_json(artifact_path, build_artifact(ledger, case))
        baseline_cases.append(
            {
                "case_id": case["case_id"],
                "artifact": {"path": relative_path, "file_sha256": sha256(artifact_path)},
                "expected_record": case["expected_record"],
            }
        )

    baseline = {
        "dataset_id": ledger["dataset_id"],
        "version": ledger["version"],
        "rule_id": ledger["rule_id"],
        "license_spdx_or_name": ledger["license_spdx_or_name"],
        "length_unit": ledger["length_unit"],
        "coordinate_system": ledger["coordinate_system"],
        "threshold_m": ledger["threshold_m"],
        "comparison": ledger["comparison"],
        "scope": ledger["scope"],
        "source_of_truth": ledger["source_of_truth"],
        "case_count": len(baseline_cases),
        "cases": baseline_cases,
    }
    baseline_path = output_root / "data" / "ground-truth" / "g3c-clearance-baseline.json"
    write_json(baseline_path, baseline)
    print(json.dumps({"status": "PASS", "case_count": len(baseline_cases), "baseline": str(baseline_path)}, indent=2))


if __name__ == "__main__":
    main()
