import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";


const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const port = Number.parseInt(process.env.IFC_CLASHTRACE_PORT || "4173", 10);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("IFC_CLASHTRACE_PORT must be an integer from 1024 through 65535");
const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".ifc", "application/octet-stream"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".wasm", "application/wasm"],
]);


const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const relativePath = decodedPath.endsWith("/") ? `${decodedPath}index.html` : decodedPath;
  const filePath = path.resolve(projectRoot, `.${relativePath}`);

  if (filePath !== projectRoot && !filePath.startsWith(`${projectRoot}${path.sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500).end(error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }
    response.writeHead(200, { "Content-Type": mimeTypes.get(path.extname(filePath)) || "application/octet-stream" });
    response.end(content);
  });
});


server.listen(port, "127.0.0.1", () => {
  console.log(`G1 static server listening at http://127.0.0.1:${port}/spikes/g1-browser/`);
});
