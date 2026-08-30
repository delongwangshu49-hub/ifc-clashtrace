from __future__ import annotations

import argparse
import hashlib
import json
import math
import uuid
from pathlib import Path
from typing import Any

import ifcopenshell
import ifcopenshell.api.aggregate
import ifcopenshell.api.context
import ifcopenshell.api.geometry
import ifcopenshell.api.profile
import ifcopenshell.api.project
import ifcopenshell.api.root
import ifcopenshell.api.unit
import numpy as np


PROJECT_ROOT = Path(__file__).resolve().parents[1]
LEDGER_PATH = PROJECT_ROOT / "data" / "pg-e-operation-ledger.json"
DEFAULT_OUTPUT_ROOT = PROJECT_ROOT / "outputs" / "local-only" / "pg-e-generation"
GUID_NAMESPACE = uuid.UUID("e7552537-18e1-46cf-9e93-61ded82d35ad")
HEADER_TIMESTAMP = "2026-08-30T21:00:00+08:00"


def stable_guid(seed: str) -> str:
    return ifcopenshell.guid.compress(uuid.uuid5(GUID_NAMESPACE, seed).hex)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def identity_with_transform(values: list[float], rotation_z_deg: float = 0.0) -> np.ndarray:
    matrix = np.eye(4, dtype=float)
    radians = math.radians(rotation_z_deg)
    cosine = math.cos(radians)
    sine = math.sin(radians)
    matrix[0, 0] = cosine
    matrix[0, 1] = -sine
    matrix[1, 0] = sine
    matrix[1, 1] = cosine
    matrix[:3, 3] = values
    return matrix


def add_model_foundation(ledger: dict[str, Any], role: str, file_name: str) -> tuple[ifcopenshell.file, Any, Any]:
    context = ledger["engineering_context"]
    model = ifcopenshell.api.project.create_file(version="IFC4")
    model.header.file_name.name = file_name
    model.header.file_name.time_stamp = HEADER_TIMESTAMP
    model.header.file_name.author = ("IFC ClashTrace contributors",)
    model.header.file_name.organization = ("Open synthetic engineering-context data",)
    model.header.file_name.preprocessor_version = "IfcOpenShell 0.8.5"
    model.header.file_name.originating_system = "IFC ClashTrace PG-E realistic building generator"
    model.header.file_name.authorization = "CC0-1.0"

    project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject", name=context["project_name"])
    project.GlobalId = stable_guid(f"PGE-{role}-project")
    project.Phase = "PG-E synthetic engineering-context UAT"
    site = ifcopenshell.api.root.create_entity(model, ifc_class="IfcSite", name=context["site_name"])
    site.GlobalId = stable_guid(f"PGE-{role}-site")
    building = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuilding", name=context["building_name"])
    building.GlobalId = stable_guid(f"PGE-{role}-building")
    storey = ifcopenshell.api.root.create_entity(model, ifc_class="IfcBuildingStorey", name=context["storey_name"])
    storey.GlobalId = stable_guid(f"PGE-{role}-storey")
    storey.Elevation = float(context["storey_elevation_m"])
    project_site = ifcopenshell.api.aggregate.assign_object(model, products=[site], relating_object=project)
    project_site.GlobalId = stable_guid(f"PGE-{role}-project-site-relation")
    site_building = ifcopenshell.api.aggregate.assign_object(model, products=[building], relating_object=site)
    site_building.GlobalId = stable_guid(f"PGE-{role}-site-building-relation")
    building_storey = ifcopenshell.api.aggregate.assign_object(model, products=[storey], relating_object=building)
    building_storey.GlobalId = stable_guid(f"PGE-{role}-building-storey-relation")

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
    return model, body_context, storey


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
        matrix=identity_with_transform(spec["origin_m"], float(spec.get("rotation_z_deg", 0.0))),
        is_si=True,
    )


def create_grid(model: ifcopenshell.file, ledger: dict[str, Any]) -> Any:
    def axis(spec: dict[str, Any]) -> Any:
        points = [model.create_entity("IfcCartesianPoint", Coordinates=tuple(point)) for point in (spec["start_m"], spec["end_m"])]
        curve = model.create_entity("IfcPolyline", Points=points)
        return model.create_entity("IfcGridAxis", AxisTag=spec["tag"], AxisCurve=curve, SameSense=True)

    grid = ifcopenshell.api.root.create_entity(model, ifc_class="IfcGrid", name="Structural grid A-C / 1-4")
    grid.GlobalId = stable_guid("PGE-V2-structural-grid")
    grid.UAxes = [axis(spec) for spec in ledger["grid"]["u_axes"]]
    grid.VAxes = [axis(spec) for spec in ledger["grid"]["v_axes"]]
    return grid


def create_structure_model(
    ledger: dict[str, Any],
) -> tuple[ifcopenshell.file, dict[str, str], dict[str, str]]:
    file_name = "pg-e-engineering-structure.ifc"
    model, body_context, storey = add_model_foundation(ledger, "structure", file_name)
    rule_guids: dict[str, str] = {}
    context_guids: dict[str, str] = {}
    products = []
    for spec in ledger["structures"]:
        product = ifcopenshell.api.root.create_entity(
            model,
            ifc_class=spec["entity_type"],
            name=spec["name"],
        )
        product.GlobalId = stable_guid(spec["guid_seed"])
        add_box_representation(model, body_context, product, spec)
        rule_guids[spec["key"]] = product.GlobalId
        products.append(product)
    for spec in ledger["context_elements"]:
        creation_args = {
            "ifc_class": spec["entity_type"],
            "name": spec["name"],
        }
        if "predefined_type" in spec:
            creation_args["predefined_type"] = spec["predefined_type"]
        product = ifcopenshell.api.root.create_entity(model, **creation_args)
        product.GlobalId = stable_guid(spec["guid_seed"])
        add_box_representation(model, body_context, product, spec)
        context_guids[spec["key"]] = product.GlobalId
        products.append(product)
    products.append(create_grid(model, ledger))
    model.create_entity(
        "IfcRelContainedInSpatialStructure",
        GlobalId=stable_guid("PGE-structure-storey-containment"),
        RelatedElements=products,
        RelatingStructure=storey,
    )
    return model, rule_guids, context_guids


def create_mep_model(ledger: dict[str, Any]) -> tuple[ifcopenshell.file, dict[str, str]]:
    file_name = "pg-e-engineering-mep.ifc"
    model, body_context, storey = add_model_foundation(ledger, "mep", file_name)
    guids: dict[str, str] = {}
    products = []
    for spec in ledger["pipes"]:
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
                raise ValueError(f"{spec['key']} pipe direction must be normalized")
            circle = ifcopenshell.api.profile.add_parameterized_profile(model, ifc_class="IfcCircleProfileDef")
            circle.ProfileName = f"{spec['key']} circular pipe profile"
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
                matrix=identity_with_transform(spec["axis_start_m"]),
                is_si=True,
            )
        guids[spec["key"]] = pipe.GlobalId
        products.append(pipe)
    model.create_entity(
        "IfcRelContainedInSpatialStructure",
        GlobalId=stable_guid("PGE-mep-storey-containment"),
        RelatedElements=products,
        RelatingStructure=storey,
    )
    return model, guids


def relative_posix(path: Path, output_root: Path) -> str:
    return path.relative_to(output_root).as_posix()


def build_manifest(
    ledger: dict[str, Any],
    output_root: Path,
    mep_path: Path,
    structure_path: Path,
    pipe_guids: dict[str, str],
    structure_guids: dict[str, str],
    context_guids: dict[str, str],
) -> dict[str, Any]:
    context_types = [item["entity_type"] for item in ledger["context_elements"]]
    return {
        "dataset_id": ledger["dataset_id"],
        "version": ledger["version"],
        "generated_by": "scripts/pg-e-generate-engineering.py",
        "origin": ledger["origin"],
        "license_spdx_or_name": ledger["license_spdx_or_name"],
        "license_file": "data/generated/LICENSE.md",
        "redistribution_permitted": ledger["redistribution_permitted"],
        "schema": ledger["schema"],
        "length_unit": ledger["length_unit"],
        "coordinate_system": ledger["coordinate_system"],
        "engineering_context": ledger["engineering_context"],
        "counts": {
            "pipe_segments": len(ledger["pipes"]),
            "walls": sum(1 for item in ledger["structures"] if item["entity_type"] == "IfcWall"),
            "beams": sum(1 for item in ledger["structures"] if item["entity_type"] == "IfcBeam"),
            "structures": len(ledger["structures"]),
            "rule_structures": len(ledger["structures"]),
            "columns": context_types.count("IfcColumn"),
            "slabs": context_types.count("IfcSlab"),
            "context_elements": len(ledger["context_elements"]),
            "grid_axes": len(ledger["grid"]["u_axes"]) + len(ledger["grid"]["v_axes"]),
            "display_elements": len(ledger["pipes"]) + len(ledger["structures"]) + len(ledger["context_elements"]),
            "candidate_pairs": len(ledger["pipes"]) * len(ledger["structures"]),
            "sentinels": len(ledger["sentinels"]),
        },
        "files": [
            {
                "role": "mep",
                "path": relative_posix(mep_path, output_root),
                "bytes": mep_path.stat().st_size,
                "sha256": sha256(mep_path),
            },
            {
                "role": "structure",
                "path": relative_posix(structure_path, output_root),
                "bytes": structure_path.stat().st_size,
                "sha256": sha256(structure_path),
            },
        ],
        "element_guids": {"pipes": pipe_guids, "structures": structure_guids, "context": context_guids},
        "limitations": [
            ledger["engineering_context"]["limitation"],
            "Sentinel expectations cover six named pairs only; other pair outputs are review context, not independently authored ground truth.",
            "The pack remains inside the frozen IFC4, metre, shared-coordinate, supported-type, and geometry-certificate boundary.",
        ],
    }


def build_sentinel_baseline(
    ledger: dict[str, Any],
    manifest: dict[str, Any],
    pipe_guids: dict[str, str],
    structure_guids: dict[str, str],
) -> dict[str, Any]:
    pipe_types = {item["key"]: "IfcPipeSegment" for item in ledger["pipes"]}
    structure_types = {item["key"]: item["entity_type"] for item in ledger["structures"]}
    records = []
    for item in ledger["sentinels"]:
        records.append(
            {
                **item,
                "pipe_guid": pipe_guids[item["pipe_key"]],
                "pipe_type": pipe_types[item["pipe_key"]],
                "structure_guid": structure_guids[item["structure_key"]],
                "structure_type": structure_types[item["structure_key"]],
            }
        )
    return {
        "dataset_id": ledger["dataset_id"],
        "version": ledger["version"],
        "source_of_truth": "data/pg-e-operation-ledger.json",
        "ground_truth_method": "Human-authored constructive sentinel operations; detector output cannot redefine expected statuses or distances.",
        "rules": ledger["rules"],
        "file_sha256": {item["role"]: item["sha256"] for item in manifest["files"]},
        "sentinel_count": len(records),
        "sentinels": records,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate the PG-E synthetic engineering-context IFC pair.")
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument(
        "--allow-baseline-write",
        action="store_true",
        help="Required when writing the committed repository baseline; never used by tests.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_root = args.output_root.resolve()
    if output_root == PROJECT_ROOT and not args.allow_baseline_write:
        raise SystemExit("Refusing to overwrite the committed PG-E baseline without --allow-baseline-write.")
    ledger = json.loads(LEDGER_PATH.read_text(encoding="utf-8"))
    output_directory = output_root / "data" / "generated" / "pg-e"
    manifest_path = output_root / "data" / "pg-e-manifest.json"
    baseline_path = output_root / "data" / "ground-truth" / "pg-e-sentinel-baseline.json"
    output_directory.mkdir(parents=True, exist_ok=True)
    baseline_path.parent.mkdir(parents=True, exist_ok=True)

    mep_path = output_directory / "pg-e-engineering-mep.ifc"
    structure_path = output_directory / "pg-e-engineering-structure.ifc"
    mep_model, pipe_guids = create_mep_model(ledger)
    structure_model, structure_guids, context_guids = create_structure_model(ledger)
    mep_model.write(mep_path)
    structure_model.write(structure_path)
    manifest = build_manifest(
        ledger,
        output_root,
        mep_path,
        structure_path,
        pipe_guids,
        structure_guids,
        context_guids,
    )
    baseline = build_sentinel_baseline(ledger, manifest, pipe_guids, structure_guids)
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    baseline_path.write_text(json.dumps(baseline, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"files": len(manifest["files"]), "counts": manifest["counts"]}, indent=2))


if __name__ == "__main__":
    main()
