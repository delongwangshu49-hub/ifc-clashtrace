from __future__ import annotations

import hashlib
import json
import math
import uuid
from pathlib import Path
from typing import Any

import ifcopenshell
import ifcopenshell.api.context
import ifcopenshell.api.feature
import ifcopenshell.api.geometry
import ifcopenshell.api.profile
import ifcopenshell.api.project
import ifcopenshell.api.root
import ifcopenshell.api.unit
import numpy as np


PROJECT_ROOT = Path(__file__).resolve().parents[1]
LEDGER_PATH = PROJECT_ROOT / "data" / "g2-operation-ledger.json"
OUTPUT_DIRECTORY = PROJECT_ROOT / "data" / "generated" / "g2"
GROUND_TRUTH_PATH = PROJECT_ROOT / "data" / "ground-truth" / "g2-ground-truth.json"
MANIFEST_PATH = PROJECT_ROOT / "data" / "dataset-manifest.json"
GUID_NAMESPACE = uuid.UUID("5b593a5e-6730-40b5-8548-181e14cb7d6c")
HEADER_TIMESTAMP = "2026-08-26T00:00:00+08:00"


def stable_guid(seed: str) -> str:
    return ifcopenshell.guid.compress(uuid.uuid5(GUID_NAMESPACE, seed).hex)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def identity_with_translation(values: list[float]) -> np.ndarray:
    matrix = np.eye(4, dtype=float)
    matrix[:3, 3] = values
    return matrix


def add_model_foundation(case_id: str, role: str, file_name: str) -> tuple[ifcopenshell.file, Any]:
    model = ifcopenshell.api.project.create_file(version="IFC4")
    model.header.file_name.name = file_name
    model.header.file_name.time_stamp = HEADER_TIMESTAMP
    model.header.file_name.author = ("IFC ClashTrace contributors",)
    model.header.file_name.organization = ("Open synthetic test data",)
    model.header.file_name.preprocessor_version = "IfcOpenShell 0.8.5"
    model.header.file_name.originating_system = "IFC ClashTrace G2 generator"
    model.header.file_name.authorization = "CC0-1.0"
    project = ifcopenshell.api.root.create_entity(
        model,
        ifc_class="IfcProject",
        name=f"{case_id} {role}",
    )
    project.GlobalId = stable_guid(f"{case_id}-{role}-project")
    project.Phase = "G2 deterministic controlled dataset"
    metre = ifcopenshell.api.unit.add_si_unit(model, unit_type="LENGTHUNIT")
    ifcopenshell.api.unit.assign_unit(model, units=[metre])
    model_context = ifcopenshell.api.context.add_context(model, context_type="Model")
    body_context = ifcopenshell.api.context.add_context(
        model,
        context_type="Model",
        context_identifier="Body",
        target_view="MODEL_VIEW",
        parent=model_context,
    )
    return model, body_context


def add_box_representation(model: ifcopenshell.file, body_context: Any, product: Any, spec: dict[str, Any]) -> None:
    representation = ifcopenshell.api.geometry.add_wall_representation(
        model,
        context=body_context,
        length=float(spec["length_m"]),
        height=float(spec["height_m"]),
        thickness=float(spec["thickness_m"]),
    )
    ifcopenshell.api.geometry.assign_representation(model, product=product, representation=representation)
    ifcopenshell.api.geometry.edit_object_placement(
        model,
        product=product,
        matrix=identity_with_translation(spec["origin_m"]),
        is_si=True,
    )


def create_structure_model(case: dict[str, Any]) -> tuple[ifcopenshell.file, str]:
    case_id = case["case_id"]
    file_name = f"{case_id.lower()}-structure.ifc"
    model, body_context = add_model_foundation(case_id, "Structure", file_name)
    spec = case["structure"]
    product = ifcopenshell.api.root.create_entity(
        model,
        ifc_class=spec["entity_type"],
        name=spec["name"],
    )
    product.GlobalId = stable_guid(spec["guid_seed"])
    add_box_representation(model, body_context, product, spec)

    if spec["kind"] == "wall_with_opening":
        opening_spec = spec["opening"]
        opening = ifcopenshell.api.root.create_entity(
            model,
            ifc_class="IfcOpeningElement",
            name=f"{case_id} Modeled Opening",
        )
        opening.GlobalId = stable_guid(opening_spec["guid_seed"])
        add_box_representation(model, body_context, opening, opening_spec)
        void_relation = ifcopenshell.api.feature.add_feature(model, feature=opening, element=product)
        void_relation.GlobalId = stable_guid(f"{case_id}-opening-relation")

    return model, product.GlobalId


def create_mep_model(case: dict[str, Any]) -> tuple[ifcopenshell.file, str]:
    case_id = case["case_id"]
    file_name = f"{case_id.lower()}-mep.ifc"
    model, body_context = add_model_foundation(case_id, "MEP", file_name)
    spec = case["mep"]
    pipe = ifcopenshell.api.root.create_entity(
        model,
        ifc_class="IfcPipeSegment",
        predefined_type="RIGIDSEGMENT",
        name=spec["name"],
    )
    pipe.GlobalId = stable_guid(spec["guid_seed"])
    if spec["representation_present"]:
        direction = np.asarray(spec["axis_direction"], dtype=float)
        if not math.isclose(float(np.linalg.norm(direction)), 1.0, rel_tol=0.0, abs_tol=1e-12):
            raise ValueError(f"{case_id} pipe direction must be normalized")
        circle = ifcopenshell.api.profile.add_parameterized_profile(
            model,
            ifc_class="IfcCircleProfileDef",
        )
        circle.ProfileName = f"{case_id} circular pipe profile"
        circle.Radius = float(spec["radius_m"])
        representation = ifcopenshell.api.geometry.add_profile_representation(
            model,
            context=body_context,
            profile=circle,
            depth=float(spec["length_m"]),
            placement_zx_axes=(tuple(spec["axis_direction"]), tuple(spec["profile_x_axis"])),
        )
        ifcopenshell.api.geometry.assign_representation(model, product=pipe, representation=representation)
        ifcopenshell.api.geometry.edit_object_placement(
            model,
            product=pipe,
            matrix=identity_with_translation(spec["axis_start_m"]),
            is_si=True,
        )
    return model, pipe.GlobalId


def relative_posix(path: Path) -> str:
    return path.relative_to(PROJECT_ROOT).as_posix()


def build_record(
    case: dict[str, Any],
    mep_path: Path,
    structure_path: Path,
    pipe_guid: str,
    structure_guid: str,
    ledger: dict[str, Any],
) -> dict[str, Any]:
    return {
        "clash_id": f"{case['case_id']}:{pipe_guid}:{structure_guid}",
        "case_id": case["case_id"],
        "rule_id": ledger["rule_id"],
        "status": case["expected_status"],
        "element_a": {
            "model_role": "mep",
            "entity_type": "IfcPipeSegment",
            "global_id": pipe_guid,
            "name": case["mep"]["name"],
        },
        "element_b": {
            "model_role": "structure",
            "entity_type": case["structure"]["entity_type"],
            "global_id": structure_guid,
            "name": case["structure"]["name"],
        },
        "location": {
            "building_storey": None,
            "point_a_m": case["expected_location_m"],
            "point_b_m": case["expected_location_m"],
        },
        "clash_type": case["expected_clash_type"],
        "penetration_distance_m": None,
        "tolerance_m": ledger["tolerance_m"],
        "evidence": {
            "detector": "human_authored_constructive_geometry_ledger_v1",
            "model_a_sha256": sha256(mep_path),
            "model_b_sha256": sha256(structure_path),
            "selector": f"IfcPipeSegment x {case['structure']['entity_type']}",
            "ground_truth_basis": case["ground_truth_basis"],
        },
    }


def main() -> None:
    ledger = json.loads(LEDGER_PATH.read_text(encoding="utf-8"))
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    GROUND_TRUTH_PATH.parent.mkdir(parents=True, exist_ok=True)

    records: list[dict[str, Any]] = []
    manifest_cases: list[dict[str, Any]] = []
    for case in ledger["cases"]:
        case_id = case["case_id"]
        mep_path = OUTPUT_DIRECTORY / f"{case_id.lower()}-mep.ifc"
        structure_path = OUTPUT_DIRECTORY / f"{case_id.lower()}-structure.ifc"
        mep_model, pipe_guid = create_mep_model(case)
        structure_model, structure_guid = create_structure_model(case)
        mep_model.write(mep_path)
        structure_model.write(structure_path)

        record = build_record(case, mep_path, structure_path, pipe_guid, structure_guid, ledger)
        records.append(record)
        manifest_cases.append(
            {
                "case_id": case_id,
                "origin": "programmatically_generated",
                "source_url": None,
                "license_spdx_or_name": ledger["license_spdx_or_name"],
                "attribution": ledger["attribution"],
                "schema": ledger["schema"],
                "expected_status": case["expected_status"],
                "ground_truth_basis": case["ground_truth_basis"],
                "redistribution_permitted": True,
                "limitations": "Synthetic contract fixture; not evidence of general real-project accuracy.",
                "files": [
                    {
                        "role": "mep",
                        "path": relative_posix(mep_path),
                        "file_sha256": sha256(mep_path),
                    },
                    {
                        "role": "structure",
                        "path": relative_posix(structure_path),
                        "file_sha256": sha256(structure_path),
                    },
                ],
            }
        )

    ground_truth = {
        "dataset_id": ledger["dataset_id"],
        "version": ledger["version"],
        "rule_id": ledger["rule_id"],
        "source_of_truth": relative_posix(LEDGER_PATH),
        "license_spdx_or_name": ledger["license_spdx_or_name"],
        "evaluation_split": ledger["evaluation_split"],
        "records": records,
    }
    manifest = {
        "dataset_id": ledger["dataset_id"],
        "version": ledger["version"],
        "generated_by": "scripts/g2-generate-controlled.py",
        "license_spdx_or_name": ledger["license_spdx_or_name"],
        "license_file": "data/generated/LICENSE.md",
        "case_count": len(manifest_cases),
        "cases": manifest_cases,
    }
    GROUND_TRUTH_PATH.write_text(json.dumps(ground_truth, indent=2) + "\n", encoding="utf-8")
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"case_count": len(records), "status_counts": status_counts(records)}, indent=2))


def status_counts(records: list[dict[str, Any]]) -> dict[str, int]:
    counts = {"CLASH": 0, "CLEAR": 0, "NOT_EVALUATED": 0}
    for record in records:
        counts[record["status"]] += 1
    return counts


if __name__ == "__main__":
    main()
