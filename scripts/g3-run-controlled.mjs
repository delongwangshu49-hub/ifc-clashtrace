import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { IfcAPI } from "web-ifc";

import { evaluateIfcPair } from "../app/core/ifc-clash-engine.mjs";


const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");


async function main() {
  const caseId = (process.argv[2] || "").toUpperCase();
  if (!/^C\d{2}$/.test(caseId)) throw new Error("Usage: node scripts/g3-run-controlled.mjs C01");
  const stem = caseId.toLowerCase();
  const ifcApi = new IfcAPI();
  ifcApi.SetWasmPath(path.join(projectRoot, "node_modules", "web-ifc") + path.sep, true);
  await ifcApi.Init();
  const result = await evaluateIfcPair({
    ifcApi,
    mepBytes: new Uint8Array(await fs.readFile(path.join(projectRoot, `data/generated/g2/${stem}-mep.ifc`))),
    structureBytes: new Uint8Array(await fs.readFile(path.join(projectRoot, `data/generated/g2/${stem}-structure.ifc`))),
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.run_status !== "PASS") process.exitCode = 3;
}


await main();
