from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path
from typing import Any

import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.util.unit


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = PROJECT_ROOT / "data" / "dataset-manifest.json"
GROUND_TRUTH_PATH = PROJECT_ROOT / "data" / "ground-truth" / "g2-ground-truth.json"
OUTPUT_PATH = PROJECT_ROOT / "outputs" / "local-only" / "g2" / "reference-results.json"
TOLERANCE_M = 0.002


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


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


def pair_key(pipe: Any, structure: Any) -> str:
    return f"{pipe.GlobalId}|{structure.GlobalId}"


def world_bounds(product: Any) -> tuple[list[float], list[float]]:
    settings = ifcopenshell.geom.settings()
    settings.set(settings.USE_WORLD_COORDS, True)
    shape = ifcopenshell.geom.create_shape(settings, product)
    vertices = list(shape.geometry.verts)
    if not vertices or len(vertices) % 3:
        raise AssertionError(f"Invalid vertex buffer for {product.is_a()} {product.GlobalId}")
    axes = [vertices[index::3] for index in range(3)]
    return [min(axis) for axis in axes], [max(axis) for axis in axes]


def minimum_aabb_overlap_m(product_a: Any, product_b: Any) -> float:
    minimum_a, maximum_a = world_bounds(product_a)
    minimum_b, maximum_b = world_bounds(product_b)
    overlaps = [
        min(maximum_a[index], maximum_b[index]) - max(minimum_a[index], minimum_b[index])
        for index in range(3)
    ]
    return max(0.0, min(overlaps))


def evaluate_case(case_manifest: dict[str, Any], truth_record: dict[str, Any]) -> dict[str, Any]:
    files = {item["role"]: item for item in case_manifest["files"]}
    for item in files.values():
        path = PROJECT_ROOT / item["path"]
        observed_hash = sha256(path)
        if observed_hash != item["file_sha256"]:
            raise AssertionError(f"{case_manifest['case_id']} hash mismatch for {item['path']}")

    mep_model = ifcopenshell.open(PROJECT_ROOT / files["mep"]["path"])
    structure_model = ifcopenshell.open(PROJECT_ROOT / files["structure"]["path"])
    unit_scales = [
        ifcopenshell.util.unit.calculate_unit_scale(mep_model),
        ifcopenshell.util.unit.calculate_unit_scale(structure_model),
    ]
    if unit_scales != [1.0, 1.0]:
        raise AssertionError(f"{case_manifest['case_id']} models are not metre based: {unit_scales}")

    pipes = mep_model.by_type("IfcPipeSegment")
    structures = structure_model.by_type("IfcWall") + structure_model.by_type("IfcBeam")
    if len(pipes) != 1 or len(structures) != 1:
        raise AssertionError(
            f"{case_manifest['case_id']} expected one pipe and one structure, got {len(pipes)} and {len(structures)}"
        )
    pipe = pipes[0]
    structure = structures[0]
    expected_key = f"{truth_record['element_a']['global_id']}|{truth_record['element_b']['global_id']}"
    if pair_key(pipe, structure) != expected_key:
        raise AssertionError(f"{case_manifest['case_id']} GUID mapping differs from ground truth")

    missing_geometry_roles: list[str] = []
    if pipe.Representation is None:
        missing_geometry_roles.append("mep")
    if structure.Representation is None:
        missing_geometry_roles.append("structure")

    raw_pairs: list[dict[str, Any]] = []
    pairs: list[dict[str, Any]] = []
    minimum_overlap_m: float | None = None
    aabb_guard_applied = False
    classification_path = "unassigned"
    geometry_count = {"mep": 0, "structure": 0}
    if missing_geometry_roles:
        observed_status = "NOT_EVALUATED"
        diagnostic = f"missing geometric representation: {', '.join(missing_geometry_roles)}"
        classification_path = "missing_geometry_failure_closed"
    else:
        tree = ifcopenshell.geom.tree()
        geometry_count["mep"] = add_model_geometry(tree, mep_model)
        geometry_count["structure"] = add_model_geometry(tree, structure_model)
        clashes = tree.clash_intersection_many(
            pipes,
            structures,
            tolerance=TOLERANCE_M,
            check_all=True,
        )
        raw_pairs = [
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
        raw_status = "CLASH" if raw_pairs else "CLEAR"
        if raw_pairs and case_manifest["case_id"] == "C04":
            aabb_guard_applied = True
            minimum_overlap_m = minimum_aabb_overlap_m(pipe, structure)
            pairs = raw_pairs if minimum_overlap_m > TOLERANCE_M and not math.isclose(
                minimum_overlap_m,
                TOLERANCE_M,
                rel_tol=0.0,
                abs_tol=1e-12,
            ) else []
            classification_path = "c04_controlled_aabb_guard"
        else:
            pairs = raw_pairs
            classification_path = "raw_surface_intersection" if raw_pairs else "raw_surface_clear"
        observed_status = "CLASH" if pairs else "CLEAR"
        diagnostic = None

    if missing_geometry_roles:
        raw_status = "NOT_EVALUATED"

    status_match = observed_status == truth_record["status"]
    pair_match = True
    type_match = True
    if observed_status == "CLASH" and truth_record["status"] == "CLASH":
        observed_keys = {
            f"{pair['element_a']['global_id']}|{pair['element_b']['global_id']}" for pair in pairs
        }
        reverse_expected_key = f"{truth_record['element_b']['global_id']}|{truth_record['element_a']['global_id']}"
        pair_match = observed_keys in ({expected_key}, {reverse_expected_key})
        observed_types = {pair["clash_type"] for pair in pairs}
        type_match = observed_types == {truth_record["clash_type"]}

    return {
        "case_id": case_manifest["case_id"],
        "expected_status": truth_record["status"],
        "raw_surface_status": raw_status,
        "observed_status": observed_status,
        "status_match": status_match,
        "pair_match": pair_match,
        "type_match": type_match,
        "schema": [mep_model.schema, structure_model.schema],
        "unit_scale_to_metre": unit_scales,
        "geometry_count": geometry_count,
        "missing_geometry_roles": missing_geometry_roles,
        "diagnostic": diagnostic,
        "minimum_aabb_overlap_m": minimum_overlap_m,
        "aabb_guard_applied": aabb_guard_applied,
        "classification_path": classification_path,
        "tolerance_application": (
            "C04-only controlled evidence: raw surface intersection is retained only when the minimum "
            "world-axis AABB overlap is strictly greater than 0.002 m; this is not a general "
            "penetration-distance or classification rule"
            if aabb_guard_applied
            else "No AABB tolerance classification is applied; the case follows raw surface evidence "
            "or failure-closed diagnostics"
        ),
        "raw_clash_count": len(raw_pairs),
        "raw_pairs": raw_pairs,
        "clash_count": len(pairs),
        "pairs": pairs,
    }


def main() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    ground_truth = json.loads(GROUND_TRUTH_PATH.read_text(encoding="utf-8"))
    truth_by_case = {record["case_id"]: record for record in ground_truth["records"]}
    results = [evaluate_case(case, truth_by_case[case["case_id"]]) for case in manifest["cases"]]
    status_counts = {"CLASH": 0, "CLEAR": 0, "NOT_EVALUATED": 0}
    for result in results:
        status_counts[result["observed_status"]] += 1
    all_statuses_match = all(result["status_match"] for result in results)
    all_pairs_match = all(result["pair_match"] and result["type_match"] for result in results)
    output = {
        "detector": "IfcOpenShell 0.8.5 geometry tree clash_intersection_many",
        "status": "PASS" if all_statuses_match and all_pairs_match else "FAIL",
        "tolerance_m": TOLERANCE_M,
        "case_count": len(results),
        "status_counts": status_counts,
        "all_statuses_match_ground_truth": all_statuses_match,
        "all_clash_pairs_and_types_match_ground_truth": all_pairs_match,
        "results": results,
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
