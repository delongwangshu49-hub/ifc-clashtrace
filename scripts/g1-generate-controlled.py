from __future__ import annotations

import hashlib
import json
import uuid
from pathlib import Path

import ifcopenshell
import ifcopenshell.api.context
import ifcopenshell.api.geometry
import ifcopenshell.api.profile
import ifcopenshell.api.project
import ifcopenshell.api.root
import ifcopenshell.api.unit
import numpy as np


PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIRECTORY = PROJECT_ROOT / "data" / "generated" / "g1"
MANIFEST_PATH = OUTPUT_DIRECTORY / "manifest.json"

PIPE_GUID = ifcopenshell.guid.compress(uuid.UUID("11111111-1111-4111-8111-111111111111").hex)
WALL_GUID = ifcopenshell.guid.compress(uuid.UUID("22222222-2222-4222-8222-222222222222").hex)
MEP_PROJECT_GUID = ifcopenshell.guid.compress(uuid.UUID("33333333-3333-4333-8333-333333333333").hex)
STRUCTURE_PROJECT_GUID = ifcopenshell.guid.compress(uuid.UUID("44444444-4444-4444-8444-444444444444").hex)


def add_model_foundation(
    model_name: str,
    project_guid: str,
    file_name: str,
) -> tuple[ifcopenshell.file, ifcopenshell.entity_instance]:
    model = ifcopenshell.api.project.create_file(version="IFC4")
    model.header.file_name.name = file_name
    model.header.file_name.time_stamp = "2026-08-26T00:00:00+08:00"
    model.header.file_name.author = ("IFC ClashTrace",)
    model.header.file_name.organization = ("Open test data",)
    model.header.file_name.preprocessor_version = "IfcOpenShell 0.8.5"
    model.header.file_name.originating_system = "IFC ClashTrace G1 generator"
    model.header.file_name.authorization = "License not assigned"
    project = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProject", name=model_name)
    project.GlobalId = project_guid
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
    project.Phase = "G1 deterministic feasibility spike"
    return model, body_context


def identity_with_translation(x: float, y: float, z: float) -> np.ndarray:
    matrix = np.eye(4, dtype=float)
    matrix[:3, 3] = (x, y, z)
    return matrix


def create_structure_model() -> ifcopenshell.file:
    model, body_context = add_model_foundation("G1 Structure", STRUCTURE_PROJECT_GUID, "g1-structure.ifc")
    wall = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall", name="G1 Known Clash Wall")
    wall.GlobalId = WALL_GUID
    representation = ifcopenshell.api.geometry.add_wall_representation(
        model,
        context=body_context,
        length=4.0,
        height=3.0,
        thickness=0.2,
    )
    ifcopenshell.api.geometry.assign_representation(model, product=wall, representation=representation)
    ifcopenshell.api.geometry.edit_object_placement(
        model,
        product=wall,
        matrix=identity_with_translation(0.0, 0.0, 0.0),
        is_si=True,
    )
    return model


def create_mep_model() -> ifcopenshell.file:
    model, body_context = add_model_foundation("G1 MEP", MEP_PROJECT_GUID, "g1-mep.ifc")
    pipe = ifcopenshell.api.root.create_entity(
        model,
        ifc_class="IfcPipeSegment",
        predefined_type="RIGIDSEGMENT",
        name="G1 Known Clash Pipe",
    )
    pipe.GlobalId = PIPE_GUID
    circle = ifcopenshell.api.profile.add_parameterized_profile(
        model,
        ifc_class="IfcCircleProfileDef",
    )
    circle.ProfileName = "200 mm circular pipe"
    circle.Radius = 0.1
    representation = ifcopenshell.api.geometry.add_profile_representation(
        model,
        context=body_context,
        profile=circle,
        depth=2.0,
        placement_zx_axes=((0.0, 1.0, 0.0), (1.0, 0.0, 0.0)),
    )
    ifcopenshell.api.geometry.assign_representation(model, product=pipe, representation=representation)
    ifcopenshell.api.geometry.edit_object_placement(
        model,
        product=pipe,
        matrix=identity_with_translation(2.0, -1.0, 1.5),
        is_si=True,
    )
    return model


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main() -> None:
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    mep_path = OUTPUT_DIRECTORY / "g1-mep.ifc"
    structure_path = OUTPUT_DIRECTORY / "g1-structure.ifc"

    create_mep_model().write(mep_path)
    create_structure_model().write(structure_path)

    manifest = {
        "case_id": "G1_KNOWN_PIPE_WALL_CLASH",
        "origin": "programmatically_generated",
        "license": "NOT_ASSIGNED",
        "redistribution_permitted": False,
        "schema": "IFC4",
        "length_unit": "metre",
        "coordinate_system": "shared_project_coordinates",
        "tolerance_m": 0.002,
        "expected_status": "CLASH",
        "expected_pair": {
            "pipe_global_id": PIPE_GUID,
            "wall_global_id": WALL_GUID,
        },
        "geometry": {
            "wall": {"origin_m": [0.0, 0.0, 0.0], "length_m": 4.0, "thickness_m": 0.2, "height_m": 3.0},
            "pipe": {"axis_start_m": [2.0, -1.0, 1.5], "axis_direction": [0.0, 1.0, 0.0], "length_m": 2.0, "radius_m": 0.1},
        },
        "files": [
            {"role": "mep", "path": "data/generated/g1/g1-mep.ifc", "sha256": sha256(mep_path)},
            {"role": "structure", "path": "data/generated/g1/g1-structure.ifc", "sha256": sha256(structure_path)},
        ],
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
