import { deterministicFallback, validateAiInterpretation, validateMinimalAiRequest } from "./contract.mjs";

export class AiServiceError extends Error {
  constructor(code, message, { retryable = false, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "AiServiceError";
    this.code = code;
    this.retryable = retryable;
  }
}

export function classifyProviderError(status, providerCode = "") {
  if (status === 401 || status === 403) return new AiServiceError("provider_auth", "AI provider authentication failed", { retryable: false });
  if (status === 408) return new AiServiceError("timeout", "AI provider request timed out", { retryable: true });
  if (status === 429 && /quota|billing|credit/i.test(providerCode)) return new AiServiceError("quota_exhausted", "AI provider quota is exhausted", { retryable: false });
  if (status === 429) return new AiServiceError("rate_limited", "AI provider rate limit reached", { retryable: true });
  if (status >= 500) return new AiServiceError("provider_unavailable", "AI provider is unavailable", { retryable: true });
  return new AiServiceError("provider_rejected", "AI provider rejected the request", { retryable: false });
}

export async function interpretWithProvider({ provider, request, timeoutMs = 15_000, signal } = {}) {
  validateMinimalAiRequest(request);
  if (!provider || typeof provider.interpret !== "function") throw new AiServiceError("provider_unconfigured", "AI provider is not configured");
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(new DOMException("Timed out", "TimeoutError")), timeoutMs);
  const abortFromCaller = () => timeoutController.abort(signal.reason || new DOMException("Cancelled", "AbortError"));
  signal?.addEventListener("abort", abortFromCaller, { once: true });
  try {
    const value = await provider.interpret(request, { signal: timeoutController.signal });
    try {
      return validateAiInterpretation(value, request);
    } catch (error) {
      throw new AiServiceError("semantic_rejected", "AI provider prose failed the local safety contract", { retryable: true, cause: error });
    }
  } catch (error) {
    if (error instanceof AiServiceError) throw error;
    if (timeoutController.signal.aborted) {
      const cancelled = signal?.aborted;
      throw new AiServiceError(cancelled ? "cancelled" : "timeout", cancelled ? "AI request was cancelled" : "AI request timed out", { retryable: !cancelled, cause: error });
    }
    if (error instanceof SyntaxError || /AI response|AI record|Overview|Limitation|Ordered records|unknown|duplicate|cover every/i.test(error?.message || "")) {
      throw new AiServiceError("malformed_response", "AI provider returned an invalid response", { retryable: true, cause: error });
    }
    throw new AiServiceError("network_error", "AI provider could not be reached", { retryable: true, cause: error });
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

export async function interpretOrFallback(options) {
  try {
    const interpretation = await interpretWithProvider(options);
    return { mode: "provider", interpretation, error: null };
  } catch (error) {
    const serviceError = error instanceof AiServiceError ? error : new AiServiceError("unknown", "AI interpretation failed", { cause: error });
    return {
      mode: "deterministic_fallback",
      interpretation: deterministicFallback(options.request),
      error: { code: serviceError.code, retryable: serviceError.retryable },
    };
  }
}
