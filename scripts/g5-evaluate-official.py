from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.util.unit


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SAMPLE_ROOT = PROJECT_ROOT / "data" / "external" / "buildingsmart-pcert"
OUTPUT_PATH = PROJECT_ROOT / "outputs" / "local-only" / "g5" / "official-ifcopenshell.json"
SAMPLES = (
    ("mep", "Building-Hvac.ifc", "11a8552bc555fa44dfdc49374d1ab2da0a16104c10f086af509f500ce03fa2b3"),
    ("structure", "Building-Structural.ifc", "68be722391e7aaa53bb9278645a02aa4b6382f13cc07548a1612e9b1dc3def67"),
)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def geometry_count(model: ifcopenshell.file) -> tuple[int, int]:
    settings = ifcopenshell.geom.settings()
    iterator = ifcopenshell.geom.iterator(settings, model, 1)
    built = 0
    failed = 0
    if iterator.initialize():
        while True:
            try:
                iterator.get()
                built += 1
            except Exception:
                failed += 1
            if not iterator.next():
                break
    return built, failed


def inspect(role: str, name: str, expected_hash: str) -> dict[str, Any]:
    path = SAMPLE_ROOT / name
    observed_hash = digest(path)
    if observed_hash != expected_hash:
        raise AssertionError(f"{name} SHA-256 differs from the browser-verified official source")
    model = ifcopenshell.open(path)
    built, failed = geometry_count(model)
    products = model.by_type("IfcProduct")
    product_guids = [getattr(product, "GlobalId", None) for product in products]
    stable_guids = [value for value in product_guids if isinstance(value, str) and value]
    return {
        "role": role,
        "file": name,
        "sha256": observed_hash,
        "byte_count": path.stat().st_size,
        "schema": model.schema,
        "unit_scale_to_metre": ifcopenshell.util.unit.calculate_unit_scale(model),
        "selected_entity_counts": {
            "IfcPipeSegment": len(model.by_type("IfcPipeSegment")),
            "IfcWall": len(model.by_type("IfcWall")),
            "IfcBeam": len(model.by_type("IfcBeam")),
        },
        "product_count": len(products),
        "products_with_global_id": len(stable_guids),
        "unique_product_global_ids": len(set(stable_guids)),
        "geometry_built": built,
        "geometry_failed": failed,
    }


def main() -> None:
    results = [inspect(*sample) for sample in SAMPLES]
    output = {
        "status": "PASS" if all(
            item["schema"] == "IFC4"
            and item["unit_scale_to_metre"] == 0.001
            and item["geometry_built"] > 0
            and item["products_with_global_id"] == item["unique_product_global_ids"]
            for item in results
        ) else "FAIL",
        "evaluated_on": "2026-08-29",
        "detector": f"IfcOpenShell {ifcopenshell.version}",
        "samples": results,
        "accuracy_claim_permitted": False,
        "reason": "The official sample directory provides compatibility evidence but no audited clash-pair ground truth.",
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output, indent=2))
    if output["status"] != "PASS":
        raise SystemExit(3)


if __name__ == "__main__":
    main()
