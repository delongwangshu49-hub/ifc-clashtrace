from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path, PurePosixPath
from typing import Any

import ifcopenshell
import ifcopenshell.util.unit


PROJECT_ROOT = Path(__file__).resolve().parents[1]
EXPECTED_CONTRACT = {
    "dataset_id": "IFC_CLASHTRACE_CONTROLLED_G2_V1",
    "rule_id": "MEP_STRUCTURE_HARD_CLASH_V1",
    "schema": "IFC4",
    "length_unit": "metre",
    "coordinate_system": "shared_project_coordinates",
    "tolerance_m": 0.002,
}
EXPECTED_SOURCE_PATHS = {
    "operation_ledger": "data/g2-operation-ledger.json",
    "dataset_manifest": "data/dataset-manifest.json",
    "ground_truth": "data/ground-truth/g2-ground-truth.json",
}
EXPECTED_STATUSES = {
    "C01": "CLASH",
    "C02": "CLASH",
    "C03": "CLEAR",
    "C04": "CLEAR",
    "C05": "CLEAR",
    "C06": "CLEAR",
    "C07": "CLASH",
    "C08": "NOT_EVALUATED",
}
SHA256_PATTERN = re.compile(r"^[0-9a-f]{64}$")


class ContractViolation(AssertionError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ContractViolation(message)


def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ContractViolation(f"cannot read JSON contract file {path.name}: {error}") from error


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def require_relative_repository_path(value: str, label: str) -> None:
    path = PurePosixPath(value)
    require(not path.is_absolute(), f"{label} must be repository relative")
    require(".." not in path.parts, f"{label} must not escape the artifact root")
    require("\\" not in value, f"{label} must use POSIX separators")


def expected_file_path(case_id: str, role: str) -> str:
    return f"data/generated/g2/{case_id.lower()}-{role}.ifc"


def validate_contract(
    baseline_path: Path,
    ledger_path: Path,
    manifest_path: Path,
    ground_truth_path: Path,
    artifact_root: Path,
) -> dict[str, Any]:
    baseline = load_json(baseline_path)
    ledger = load_json(ledger_path)
    manifest = load_json(manifest_path)
    ground_truth = load_json(ground_truth_path)

    require(
        baseline.get("baseline_id") == "IFC_CLASHTRACE_G2_FROZEN_BASELINE_V1",
        "baseline_id drift",
    )
    require(baseline.get("version") == "1.0.0", "baseline version drift")
    require(baseline.get("contract") == EXPECTED_CONTRACT, "approved baseline contract drift")
    require(baseline.get("source_paths") == EXPECTED_SOURCE_PATHS, "approved source path drift")

    for field, expected in EXPECTED_CONTRACT.items():
        require(ledger.get(field) == expected, f"ledger {field} drift")

    baseline_cases = baseline.get("cases")
    require(isinstance(baseline_cases, list), "baseline cases must be an array")
    require(len(baseline_cases) == 8, "baseline must contain exactly eight cases")
    baseline_by_case = {case.get("case_id"): case for case in baseline_cases}
    require(set(baseline_by_case) == set(EXPECTED_STATUSES), "baseline case ID drift")
    require(len(baseline_by_case) == len(baseline_cases), "baseline case IDs must be unique")

    ledger_cases = ledger.get("cases")
    require(isinstance(ledger_cases, list), "ledger cases must be an array")
    ledger_by_case = {case.get("case_id"): case for case in ledger_cases}
    require(set(ledger_by_case) == set(EXPECTED_STATUSES), "ledger case ID drift")
    require(len(ledger_by_case) == len(ledger_cases), "ledger case IDs must be unique")

    manifest_cases = manifest.get("cases")
    require(isinstance(manifest_cases, list), "manifest cases must be an array")
    manifest_by_case = {case.get("case_id"): case for case in manifest_cases}
    require(manifest.get("dataset_id") == EXPECTED_CONTRACT["dataset_id"], "manifest dataset_id drift")
    require(manifest.get("case_count") == 8, "manifest case_count drift")
    require(set(manifest_by_case) == set(EXPECTED_STATUSES), "manifest case ID drift")
    require(len(manifest_by_case) == len(manifest_cases), "manifest case IDs must be unique")

    truth_records = ground_truth.get("records")
    require(isinstance(truth_records, list), "ground-truth records must be an array")
    truth_by_case = {record.get("case_id"): record for record in truth_records}
    require(
        ground_truth.get("dataset_id") == EXPECTED_CONTRACT["dataset_id"],
        "ground-truth dataset_id drift",
    )
    require(
        ground_truth.get("rule_id") == EXPECTED_CONTRACT["rule_id"],
        "ground-truth rule_id drift",
    )
    require(
        ground_truth.get("source_of_truth") == EXPECTED_SOURCE_PATHS["operation_ledger"],
        "ground-truth source path drift",
    )
    require(set(truth_by_case) == set(EXPECTED_STATUSES), "ground-truth case ID drift")
    require(len(truth_by_case) == len(truth_records), "ground-truth case IDs must be unique")

    path_hash_mapping: dict[str, str] = {}
    for case_id, expected_status in EXPECTED_STATUSES.items():
        baseline_case = baseline_by_case[case_id]
        ledger_case = ledger_by_case[case_id]
        manifest_case = manifest_by_case[case_id]
        truth_record = truth_by_case[case_id]

        require(baseline_case.get("status") == expected_status, f"baseline {case_id} status drift")
        require(ledger_case.get("expected_status") == expected_status, f"ledger {case_id} status drift")
        require(manifest_case.get("expected_status") == expected_status, f"manifest {case_id} status drift")
        require(truth_record.get("status") == expected_status, f"ground-truth {case_id} status drift")
        require(
            manifest_case.get("schema") == EXPECTED_CONTRACT["schema"],
            f"manifest {case_id} schema drift",
        )
        require(
            truth_record.get("rule_id") == EXPECTED_CONTRACT["rule_id"],
            f"ground-truth {case_id} rule_id drift",
        )
        require(
            truth_record.get("tolerance_m") == EXPECTED_CONTRACT["tolerance_m"],
            f"ground-truth {case_id} tolerance_m drift",
        )

        baseline_files = baseline_case.get("files")
        require(isinstance(baseline_files, dict), f"baseline {case_id} files must be an object")
        manifest_files = manifest_case.get("files")
        require(isinstance(manifest_files, list), f"manifest {case_id} files must be an array")
        manifest_by_role = {item.get("role"): item for item in manifest_files}
        require(set(baseline_files) == {"mep", "structure"}, f"baseline {case_id} role drift")
        require(set(manifest_by_role) == {"mep", "structure"}, f"manifest {case_id} role drift")
        require(len(manifest_by_role) == len(manifest_files), f"manifest {case_id} roles must be unique")

        for role in ("mep", "structure"):
            baseline_file = baseline_files[role]
            manifest_file = manifest_by_role[role]
            expected_path = expected_file_path(case_id, role)
            expected_hash = baseline_file.get("sha256")
            require(baseline_file.get("path") == expected_path, f"baseline {case_id} {role} path drift")
            require_relative_repository_path(expected_path, f"baseline {case_id} {role} path")
            require(
                isinstance(expected_hash, str) and SHA256_PATTERN.fullmatch(expected_hash) is not None,
                f"baseline {case_id} {role} SHA-256 is invalid",
            )
            require(manifest_file.get("path") == expected_path, f"manifest {case_id} {role} path drift")
            require(
                manifest_file.get("file_sha256") == expected_hash,
                f"manifest {case_id} {role} SHA-256 drift",
            )
            require(expected_path not in path_hash_mapping, f"duplicate frozen path {expected_path}")
            path_hash_mapping[expected_path] = expected_hash

            artifact_path = artifact_root / PurePosixPath(expected_path)
            require(artifact_path.is_file(), f"missing frozen artifact {expected_path}")
            require(sha256(artifact_path) == expected_hash, f"artifact SHA-256 drift for {expected_path}")
            model = ifcopenshell.open(artifact_path)
            require(model.schema == EXPECTED_CONTRACT["schema"], f"IFC schema drift for {expected_path}")
            unit_scale = ifcopenshell.util.unit.calculate_unit_scale(model)
            require(unit_scale == 1.0, f"IFC length unit drift for {expected_path}")

        evidence = truth_record.get("evidence")
        require(isinstance(evidence, dict), f"ground-truth {case_id} evidence must be an object")
        require(
            evidence.get("model_a_sha256") == baseline_files["mep"]["sha256"],
            f"ground-truth {case_id} MEP evidence hash drift",
        )
        require(
            evidence.get("model_b_sha256") == baseline_files["structure"]["sha256"],
            f"ground-truth {case_id} structure evidence hash drift",
        )

    require(len(path_hash_mapping) == 16, "frozen path-SHA mapping must contain exactly 16 IFC files")
    return {
        "status": "PASS",
        "case_count": len(EXPECTED_STATUSES),
        "ifc_count": len(path_hash_mapping),
        "contract": EXPECTED_CONTRACT,
        "path_sha256": dict(sorted(path_hash_mapping.items())),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate the immutable G2 contract and path-SHA baseline.")
    parser.add_argument(
        "--baseline",
        type=Path,
        default=PROJECT_ROOT / "data" / "ground-truth" / "g2-frozen-baseline.json",
    )
    parser.add_argument(
        "--ledger",
        type=Path,
        default=PROJECT_ROOT / "data" / "g2-operation-ledger.json",
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=PROJECT_ROOT / "data" / "dataset-manifest.json",
    )
    parser.add_argument(
        "--ground-truth",
        type=Path,
        default=PROJECT_ROOT / "data" / "ground-truth" / "g2-ground-truth.json",
    )
    parser.add_argument("--artifact-root", type=Path, default=PROJECT_ROOT)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    try:
        result = validate_contract(
            args.baseline.resolve(),
            args.ledger.resolve(),
            args.manifest.resolve(),
            args.ground_truth.resolve(),
            args.artifact_root.resolve(),
        )
    except ContractViolation as error:
        print(f"G3A_CONTRACT_CHECK=FAIL")
        print(f"G3A_CONTRACT_ERROR={error}")
        raise SystemExit(3) from error
    print(f"G3A_CONTRACT_CASE_COUNT={result['case_count']}")
    print(f"G3A_CONTRACT_IFC_COUNT={result['ifc_count']}")
    print("G3A_RULE_ID=MEP_STRUCTURE_HARD_CLASH_V1")
    print("G3A_SCHEMA=IFC4")
    print("G3A_LENGTH_UNIT=metre")
    print("G3A_COORDINATE_SYSTEM=shared_project_coordinates")
    print("G3A_TOLERANCE_M=0.002")
    print("G3A_PATH_SHA256_MAPPING=PASS")
    print("G3A_CONTRACT_CHECK=PASS")


if __name__ == "__main__":
    main()
