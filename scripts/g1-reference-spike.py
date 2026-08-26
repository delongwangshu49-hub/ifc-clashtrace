from __future__ import annotations

import json
from pathlib import Path

import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.util.unit


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIRECTORY = PROJECT_ROOT / "data" / "generated" / "g1"
OUTPUT_DIRECTORY = PROJECT_ROOT / "outputs" / "local-only" / "g1"
TOLERANCE_M = 0.002


def add_model_geometry(tree: ifcopenshell.geom.tree, model: ifcopenshell.file) -> int:
    settings = ifcopenshell.geom.settings()
    iterator = ifcopenshell.geom.iterator(settings, model, 1)
    count = 0
    if iterator.initialize():
        while True:
            tree.add_element(iterator.get())
            count += 1
            if not iterator.next():
                break
    return count


def main() -> None:
    manifest = json.loads((DATA_DIRECTORY / "manifest.json").read_text(encoding="utf-8"))
    mep_model = ifcopenshell.open(DATA_DIRECTORY / "g1-mep.ifc")
    structure_model = ifcopenshell.open(DATA_DIRECTORY / "g1-structure.ifc")

    mep_scale = ifcopenshell.util.unit.calculate_unit_scale(mep_model)
    structure_scale = ifcopenshell.util.unit.calculate_unit_scale(structure_model)
    if (mep_scale, structure_scale) != (1.0, 1.0):
        raise AssertionError(f"Expected metre-based models, got scales {(mep_scale, structure_scale)}")

    pipes = mep_model.by_type("IfcPipeSegment")
    walls = structure_model.by_type("IfcWall")
    if len(pipes) != 1 or len(walls) != 1:
        raise AssertionError(f"Expected one pipe and one wall, got {len(pipes)} and {len(walls)}")

    tree = ifcopenshell.geom.tree()
    mep_geometry_count = add_model_geometry(tree, mep_model)
    structure_geometry_count = add_model_geometry(tree, structure_model)
    clashes = tree.clash_intersection_many(pipes, walls, tolerance=TOLERANCE_M, check_all=True)

    pairs = [
        {
            "element_a": {"entity_type": clash.a.is_a(), "global_id": clash.a.get_argument(0)},
            "element_b": {"entity_type": clash.b.is_a(), "global_id": clash.b.get_argument(0)},
            "clash_type": ifcopenshell.geom.CLASH_TYPE_ITEMS[int(clash.clash_type)],
            "distance_m": float(clash.distance),
            "point_a_m": [float(value) for value in clash.p1],
            "point_b_m": [float(value) for value in clash.p2],
        }
        for clash in clashes
    ]

    expected_pair = manifest["expected_pair"]
    observed_pairs = {(pair["element_a"]["global_id"], pair["element_b"]["global_id"]) for pair in pairs}
    expected_pairs = {(expected_pair["pipe_global_id"], expected_pair["wall_global_id"])}
    if observed_pairs != expected_pairs:
        raise AssertionError(f"Reference mismatch: expected {expected_pairs}, observed {observed_pairs}")

    result = {
        "detector": "IfcOpenShell 0.8.5 geometry tree clash_intersection_many",
        "status": "PASS",
        "schema": [mep_model.schema, structure_model.schema],
        "unit_scale_to_metre": [mep_scale, structure_scale],
        "coordinate_system": manifest["coordinate_system"],
        "tolerance_m": TOLERANCE_M,
        "geometry_count": {"mep": mep_geometry_count, "structure": structure_geometry_count},
        "clash_count": len(pairs),
        "pairs": pairs,
    }
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIRECTORY / "reference-result.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
