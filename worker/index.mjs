import { createGroqAdapter, groqAdapterMetadata } from "../app/ai/adapters/groq.mjs";
import { validateMinimalAiRequest } from "../app/ai/contract.mjs";
import { AiServiceError, interpretOrFallback } from "../app/ai/provider-neutral.mjs";

const MAXIMUM_REQUEST_BYTES = 32 * 1024;
const DEFAULT_TIMEOUT_MS = 15_000;

function json(status, value) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

function publicError(error) {
  const value = error instanceof AiServiceError
    ? error
    : new AiServiceError("invalid_request", "Invalid AI request");
  return { code: value.code, retryable: value.retryable === true };
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function readJsonBody(request) {
  const declaredLength = Number.parseInt(request.headers.get("Content-Length") || "0", 10);
  if (Number.isFinite(declaredLength) && declaredLength > MAXIMUM_REQUEST_BYTES) {
    throw new AiServiceError("request_too_large", "AI request exceeds the size limit");
  }
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > MAXIMUM_REQUEST_BYTES) {
    throw new AiServiceError("request_too_large", "AI request exceeds the size limit");
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (error) {
    throw new AiServiceError("invalid_request", "AI request is not valid JSON", { cause: error });
  }
}

function timeoutFromEnvironment(environment) {
  const value = Number.parseInt(environment?.IFC_CLASHTRACE_AI_TIMEOUT_MS || "", 10);
  return Number.isInteger(value) && value >= 1_000 && value <= 30_000 ? value : DEFAULT_TIMEOUT_MS;
}

async function handleApi(request, environment) {
  const url = new URL(request.url);
  const provider = createGroqAdapter({ credential: environment?.GROQ_API_KEY });

  if (url.pathname === "/api/g4ai/status") {
    if (request.method !== "GET") return json(405, { error: { code: "method_not_allowed", retryable: false } });
    return json(200, {
      configured: Boolean(provider),
      provider: groqAdapterMetadata.id,
      model: groqAdapterMetadata.model,
      verified_on: groqAdapterMetadata.verified_on,
      request_retention_boundary: "default_no_inference_retention_except_reliability_or_abuse_logs_up_to_30_days_zdr_eligible",
    });
  }

  if (url.pathname === "/api/g4ai/interpret") {
    if (request.method !== "POST") return json(405, { error: { code: "method_not_allowed", retryable: false } });
    if (!sameOrigin(request)) return json(403, { error: { code: "origin_rejected", retryable: false } });
    if (!String(request.headers.get("Content-Type") || "").toLowerCase().startsWith("application/json")) {
      return json(415, { error: { code: "content_type_required", retryable: false } });
    }
    try {
      const aiRequest = validateMinimalAiRequest(await readJsonBody(request));
      const result = await interpretOrFallback({
        provider,
        request: aiRequest,
        timeoutMs: timeoutFromEnvironment(environment),
      });
      return json(result.mode === "provider" ? 200 : 503, result);
    } catch (error) {
      return json(400, {
        mode: "deterministic_fallback",
        interpretation: null,
        error: publicError(error),
      });
    }
  }

  return null;
}

export default {
  async fetch(request, environment) {
    const apiResponse = await handleApi(request, environment);
    if (apiResponse) return apiResponse;
    if (environment?.ASSETS && typeof environment.ASSETS.fetch === "function") {
      return environment.ASSETS.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  },
};
