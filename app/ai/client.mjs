import { buildMinimalAiRequest, deterministicFallback, validateAiInterpretation } from "./contract.mjs";

export class AiClientError extends Error {
  constructor(code, { retryable = false } = {}) {
    super(code);
    this.name = "AiClientError";
    this.code = code;
    this.retryable = retryable;
  }
}

export function prepareAiRequest(records, locale) {
  return buildMinimalAiRequest(records, locale);
}

export async function fetchAiStatus({ fetchImpl = fetch, signal } = {}) {
  try {
    const response = await fetchImpl("/api/g4ai/status", { headers: { "Accept": "application/json" }, signal });
    if (!response.ok) return { configured: false, provider: "groq", model: "openai/gpt-oss-20b", verified_on: "2026-08-28" };
    const body = await response.json();
    return {
      configured: body?.configured === true,
      provider: body?.provider === "groq" ? "groq" : "groq",
      model: body?.model === "openai/gpt-oss-20b" ? body.model : "openai/gpt-oss-20b",
      verified_on: body?.verified_on === "2026-08-28" ? body.verified_on : "2026-08-28",
    };
  } catch {
    return { configured: false, provider: "groq", model: "openai/gpt-oss-20b", verified_on: "2026-08-28" };
  }
}

export async function requestAiInterpretation(aiRequest, { fetchImpl = fetch, signal } = {}) {
  let response;
  try {
    response = await fetchImpl("/api/g4ai/interpret", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(aiRequest),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw new AiClientError("cancelled", { retryable: false });
    throw new AiClientError("network_error", { retryable: true });
  }
  let body;
  try {
    body = await response.json();
  } catch {
    throw new AiClientError("malformed_response", { retryable: true });
  }
  if (body?.mode === "provider" && response.ok) {
    try {
      return { mode: "provider", interpretation: validateAiInterpretation(body.interpretation, aiRequest), error: null };
    } catch {
      throw new AiClientError("malformed_response", { retryable: true });
    }
  }
  const error = body?.error && typeof body.error.code === "string" ? body.error : { code: "provider_unavailable", retryable: true };
  return {
    mode: "deterministic_fallback",
    interpretation: deterministicFallback(aiRequest),
    error: { code: error.code, retryable: error.retryable === true },
  };
}
