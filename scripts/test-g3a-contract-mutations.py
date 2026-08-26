from __future__ import annotations

import argparse
import copy
import importlib.util
import json
import tempfile
from pathlib import Path
from typing import Any, Callable


PROJECT_ROOT = Path(__file__).resolve().parents[1]
CHECKER_PATH = PROJECT_ROOT / "scripts" / "g3a-contract-check.py"


def load_checker() -> Any:
    spec = importlib.util.spec_from_file_location("g3a_contract_check", CHECKER_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load G3A contract checker")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")


def mutate_rule_id(documents: dict[str, dict[str, Any]]) -> None:
    documents["ledger"]["rule_id"] = "MUTATED_RULE"


def mutate_schema(documents: dict[str, dict[str, Any]]) -> None:
    documents["manifest"]["cases"][0]["schema"] = "IFC4X3"


def mutate_length_unit(documents: dict[str, dict[str, Any]]) -> None:
    documents["ledger"]["length_unit"] = "millimetre"


def mutate_coordinate_system(documents: dict[str, dict[str, Any]]) -> None:
    documents["ledger"]["coordinate_system"] = "local_model_coordinates"


def mutate_tolerance(documents: dict[str, dict[str, Any]]) -> None:
    documents["ledger"]["tolerance_m"] = 0.003


def mutate_status(documents: dict[str, dict[str, Any]]) -> None:
    documents["ground_truth"]["records"][0]["status"] = "CLEAR"


def mutate_path(documents: dict[str, dict[str, Any]]) -> None:
    documents["manifest"]["cases"][0]["files"][0]["path"] = "data/generated/g2/renamed.ifc"


def mutate_hash(documents: dict[str, dict[str, Any]]) -> None:
    documents["manifest"]["cases"][0]["files"][0]["file_sha256"] = "0" * 64


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prove approved G2 contract mutations fail closed.")
    parser.add_argument(
        "--temp-root",
        type=Path,
        default=PROJECT_ROOT / "outputs" / "local-only" / "g3a-mutations",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    args.temp_root.mkdir(parents=True, exist_ok=True)
    checker = load_checker()
    source_documents = {
        "ledger": load_json(PROJECT_ROOT / "data" / "g2-operation-ledger.json"),
        "manifest": load_json(PROJECT_ROOT / "data" / "dataset-manifest.json"),
        "ground_truth": load_json(PROJECT_ROOT / "data" / "ground-truth" / "g2-ground-truth.json"),
    }
    mutations: list[tuple[str, Callable[[dict[str, dict[str, Any]]], None], str]] = [
        ("rule_id", mutate_rule_id, "ledger rule_id drift"),
        ("schema", mutate_schema, "manifest C01 schema drift"),
        ("length_unit", mutate_length_unit, "ledger length_unit drift"),
        ("coordinate_system", mutate_coordinate_system, "ledger coordinate_system drift"),
        ("tolerance_m", mutate_tolerance, "ledger tolerance_m drift"),
        ("status", mutate_status, "ground-truth C01 status drift"),
        ("case_path", mutate_path, "manifest C01 mep path drift"),
        ("file_sha256", mutate_hash, "manifest C01 mep SHA-256 drift"),
    ]

    passed = 0
    with tempfile.TemporaryDirectory(prefix="contract-", dir=args.temp_root) as directory:
        temp_root = Path(directory)
        for name, mutate, expected_message in mutations:
            documents = copy.deepcopy(source_documents)
            mutate(documents)
            ledger_path = temp_root / f"{name}-ledger.json"
            manifest_path = temp_root / f"{name}-manifest.json"
            truth_path = temp_root / f"{name}-ground-truth.json"
            write_json(ledger_path, documents["ledger"])
            write_json(manifest_path, documents["manifest"])
            write_json(truth_path, documents["ground_truth"])
            try:
                checker.validate_contract(
                    PROJECT_ROOT / "data" / "ground-truth" / "g2-frozen-baseline.json",
                    ledger_path,
                    manifest_path,
                    truth_path,
                    PROJECT_ROOT,
                )
            except checker.ContractViolation as error:
                if expected_message not in str(error):
                    raise AssertionError(
                        f"{name} failed for the wrong reason: expected {expected_message!r}, got {error!r}"
                    ) from error
                passed += 1
                print(f"G3A_MUTATION_{name.upper()}=REJECTED")
            else:
                raise AssertionError(f"{name} mutation was incorrectly accepted")

    if passed != len(mutations):
        raise AssertionError(f"Expected {len(mutations)} rejected mutations, got {passed}")
    print(f"G3A_MUTATION_NEGATIVE_COUNT={passed}")
    print("G3A_CONTRACT_MUTATIONS=PASS")


if __name__ == "__main__":
    main()
