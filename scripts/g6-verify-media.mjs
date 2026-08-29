import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expected = [
  "app/ui/previews/development-zh-light.png",
  "app/ui/previews/home-dark-en-minimal.png",
  "app/ui/previews/home-light-zh.png",
  "app/ui/previews/workspace-en-dark.png",
];
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const prohibitedChunks = new Set(["eXIf", "iTXt", "tEXt", "zTXt"]);

for (const relativePath of expected) {
  const bytes = fs.readFileSync(path.join(projectRoot, relativePath));
  if (!bytes.subarray(0, 8).equals(pngSignature)) throw new Error(`${relativePath} is not a PNG byte stream`);
  const chunks = [];
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    chunks.push(type);
    if (prohibitedChunks.has(type)) throw new Error(`${relativePath} contains prohibited metadata chunk ${type}`);
    offset += length + 12;
    if (type === "IEND") break;
  }
  if (chunks[0] !== "IHDR" || chunks.at(-1) !== "IEND") throw new Error(`${relativePath} has an invalid PNG chunk sequence`);
  console.log(`MEDIA_PASS ${relativePath} ${bytes.length} bytes ${chunks.join(",")}`);
}
