import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lock = JSON.parse(fs.readFileSync(path.join(projectRoot, "package-lock.json"), "utf8"));
const rootPackage = lock.packages?.[""] || {};
const directRuntime = new Set(Object.keys(rootPackage.dependencies || {}));
const directBuild = new Set(Object.keys(rootPackage.devDependencies || {}));

function packageName(packagePath) {
  return packagePath.split("node_modules/").at(-1).replaceAll("\\", "/");
}

const packages = Object.entries(lock.packages || {})
  .filter(([packagePath]) => packagePath.startsWith("node_modules/"))
  .map(([packagePath, metadata]) => {
    const name = packageName(packagePath);
    if (!metadata.version || !metadata.license) throw new Error(`Dependency license metadata is incomplete: ${name}`);
    return {
      name,
      version: metadata.version,
      license: metadata.license,
      direct: directRuntime.has(name) ? "runtime" : directBuild.has(name) ? "build" : "transitive",
      optional: metadata.optional === true,
    };
  })
  .sort((left, right) => left.name.localeCompare(right.name) || left.version.localeCompare(right.version));

const inventory = {
  schema_version: 1,
  verified_on: "2026-08-29",
  source: "package-lock.json",
  package_count: packages.length,
  packages,
};

fs.writeFileSync(
  path.join(projectRoot, "docs", "dependency-licenses.json"),
  `${JSON.stringify(inventory, null, 2)}\n`,
  "utf8",
);
console.log(`Recorded ${packages.length} dependency package entries.`);
