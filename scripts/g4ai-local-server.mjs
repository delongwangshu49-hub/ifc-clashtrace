import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGroqAdapter, groqAdapterMetadata } from "../app/ai/adapters/groq.mjs";
import { validateMinimalAiRequest } from "../app/ai/contract.mjs";
import { AiServiceError, interpretOrFallback } from "../app/ai/provider-neutral.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultProjectRoot = path.resolve(scriptDirectory, "..");
const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"], [".ifc", "application/octet-stream"],
  [".png", "image/png"], [".svg", "image/svg+xml"], [".wasm", "application/wasm"],
]);

function json(response, status, value) {
  const content = Buffer.from(JSON.stringify(value));
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": content.length,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(content);
}

function publicError(error) {
  const value = error instanceof AiServiceError ? error : new AiServiceError("invalid_request", "Invalid AI request");
  return { code: value.code, retryable: value.retryable === true };
}

async function readJsonBody(request, maximumBytes = 32 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maximumBytes) throw new AiServiceError("request_too_large", "AI request exceeds the size limit");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    throw new AiServiceError("invalid_request", "AI request is not valid JSON", { cause: error });
  }
}

function sameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.host;
  } catch {
    return false;
  }
}

function serveStatic(projectRoot, requestUrl, response) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestUrl.pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }
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
    response.writeHead(200, {
      "Content-Type": mimeTypes.get(path.extname(filePath)) || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(content);
  });
}

export function createG4AiServer({
  projectRoot = defaultProjectRoot,
  provider = createGroqAdapter({ credential: process.env.GROQ_API_KEY }),
  timeoutMs = Number.parseInt(process.env.IFC_CLASHTRACE_AI_TIMEOUT_MS || "15000", 10),
} = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 30000) throw new Error("AI timeout must be an integer from 1000 through 30000 milliseconds");
  return http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host || "127.0.0.1"}`);
    if (requestUrl.pathname === "/api/g4ai/status") {
      if (request.method !== "GET") return json(response, 405, { error: { code: "method_not_allowed", retryable: false } });
      return json(response, 200, {
        configured: Boolean(provider),
        provider: groqAdapterMetadata.id,
        model: groqAdapterMetadata.model,
        verified_on: groqAdapterMetadata.verified_on,
        request_retention_boundary: "default_no_retention_except_reliability_or_abuse_logs_up_to_30_days_zdr_eligible",
      });
    }
    if (requestUrl.pathname === "/api/g4ai/interpret") {
      if (request.method !== "POST") return json(response, 405, { error: { code: "method_not_allowed", retryable: false } });
      if (!sameOrigin(request)) return json(response, 403, { error: { code: "origin_rejected", retryable: false } });
      if (!String(request.headers["content-type"] || "").toLowerCase().startsWith("application/json")) return json(response, 415, { error: { code: "content_type_required", retryable: false } });
      try {
        const aiRequest = validateMinimalAiRequest(await readJsonBody(request));
        const result = await interpretOrFallback({ provider, request: aiRequest, timeoutMs });
        return json(response, result.mode === "provider" ? 200 : 503, result);
      } catch (error) {
        return json(response, 400, { mode: "deterministic_fallback", interpretation: null, error: publicError(error) });
      }
    }
    if (request.method !== "GET" && request.method !== "HEAD") return response.writeHead(405).end("Method not allowed");
    serveStatic(projectRoot, requestUrl, response);
  });
}

function runFromCli() {
  const port = Number.parseInt(process.env.IFC_CLASHTRACE_PORT || "4173", 10);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("IFC_CLASHTRACE_PORT must be an integer from 1024 through 65535");
  const providerConfigured = Boolean(process.env.GROQ_API_KEY);
  const server = createG4AiServer();
  server.listen(port, "127.0.0.1", () => {
    console.log(`G4AI local server listening at http://127.0.0.1:${port}/app/`);
    console.log(`G4AI provider configured: ${providerConfigured}`);
  });
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) runFromCli();
