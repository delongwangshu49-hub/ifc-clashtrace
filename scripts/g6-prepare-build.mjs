import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "outputs", "local-only", "g6", "public");
const distributionRoot = path.join(projectRoot, "dist");

function copy(relativeSource, relativeTarget = relativeSource) {
  const source = path.join(projectRoot, relativeSource);
  const target = path.join(publicRoot, relativeTarget);
  if (!fs.existsSync(source)) throw new Error(`Required G6 build input is missing: ${relativeSource}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

// Both directories are ignored, reproducible build outputs. Clearing the full
// distribution root prevents a prior dist/ layout from leaking stale files
// alongside the Sites-required dist/client and dist/server surfaces.
fs.rmSync(distributionRoot, { recursive: true, force: true });
fs.rmSync(publicRoot, { recursive: true, force: true });
copy(path.join("node_modules", "web-ifc", "web-ifc.wasm"));
for (let caseNumber = 1; caseNumber <= 8; caseNumber += 1) {
  const stem = `c${String(caseNumber).padStart(2, "0")}`;
  copy(path.join("data", "generated", "g2", `${stem}-mep.ifc`));
  copy(path.join("data", "generated", "g2", `${stem}-structure.ifc`));
}
copy(path.join("data", "generated", "pg-e", "pg-e-engineering-mep.ifc"));
copy(path.join("data", "generated", "pg-e", "pg-e-engineering-structure.ifc"));
copy("LICENSE");
copy(path.join("data", "generated", "LICENSE.md"));
copy(path.join("docs", "data-and-licenses.md"));

console.log(`Prepared G6 static inputs under ${path.relative(projectRoot, publicRoot)}.`);
