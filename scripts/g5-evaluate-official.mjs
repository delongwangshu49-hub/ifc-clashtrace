import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { IFCBEAM, IFCPIPESEGMENT, IFCWALL, IfcAPI } from "web-ifc";

import { evaluateIfcPair } from "../app/core/ifc-clash-engine.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const sampleRoot = path.join(projectRoot, "data/external/buildingsmart-pcert");
const outputPath = path.join(projectRoot, "outputs/local-only/g5/official-web-ifc.json");
const samples = [
  { role: "mep", name: "Building-Hvac.ifc", sha256: "11a8552bc555fa44dfdc49374d1ab2da0a16104c10f086af509f500ce03fa2b3" },
  { role: "structure", name: "Building-Structural.ifc", sha256: "68be722391e7aaa53bb9278645a02aa4b6382f13cc07548a1612e9b1dc3def67" },
];

function vectorSize(vector) {
  return typeof vector?.size === "function" ? vector.size() : 0;
}

async function main() {
  const ifcApi = new IfcAPI();
  ifcApi.SetWasmPath(path.join(projectRoot, "node_modules/web-ifc") + path.sep, true);
  await ifcApi.Init();
  const bytesByRole = {};
  const parsed = [];
  for (const sample of samples) {
    const bytes = new Uint8Array(await fs.readFile(path.join(sampleRoot, sample.name)));
    const observedHash = crypto.createHash("sha256").update(bytes).digest("hex");
    if (observedHash !== sample.sha256) throw new Error(`${sample.name} SHA-256 differs from the browser-verified official source`);
    bytesByRole[sample.role] = bytes;
    const modelId = ifcApi.OpenModel(bytes);
    if (modelId < 0) throw new Error(`web-ifc could not open ${sample.name}`);
    try {
      parsed.push({
        role: sample.role,
        file: sample.name,
        sha256: observedHash,
        byte_count: bytes.byteLength,
        schema: ifcApi.GetModelSchema(modelId),
        selected_entity_counts: {
          IfcPipeSegment: vectorSize(ifcApi.GetLineIDsWithType(modelId, IFCPIPESEGMENT)),
          IfcWall: vectorSize(ifcApi.GetLineIDsWithType(modelId, IFCWALL)),
          IfcBeam: vectorSize(ifcApi.GetLineIDsWithType(modelId, IFCBEAM)),
        },
        coordination_matrix: Array.from(ifcApi.GetCoordinationMatrix(modelId)),
      });
    } finally {
      ifcApi.CloseModel(modelId);
    }
  }
  const product = await evaluateIfcPair({ ifcApi, mepBytes: bytesByRole.mep, structureBytes: bytesByRole.structure });
  const diagnostic = product.diagnostics?.join("; ") || "";
  const output = {
    status: parsed.every(item => item.schema === "IFC4") && product.run_status === "NOT_EVALUATED" && /unprefixed metre IFC length units/i.test(diagnostic) ? "PASS" : "FAIL",
    evaluated_on: "2026-08-29",
    source: {
      owner: "buildingSMART International",
      repository: "buildingSMART/Certification-datasets",
      directory: "IFC 4.0.2.1 (IFC 4)/PCERT-Sample-Scene",
      source_commit: "e6f1c1d80ac216e1c1d6f88d4650f13d8c8277b7",
      license: "CC-BY-4.0",
      files_redistributed: false,
    },
    raw_web_ifc_parse: parsed,
    product_contract_run: {
      run_status: product.run_status,
      schema: product.schema,
      diagnostic,
      expected_boundary: "IFC4 with SI length unit metre and no prefix",
      interpretation: "Expected failure-closed compatibility result; the official files declare millimetres and are not accuracy ground truth.",
    },
  };
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (output.status !== "PASS") process.exitCode = 3;
}

await main();
