import { GoogleGenerativeAI } from "@google/generative-ai";

let apiKey: string | null = null;

// Models to try in order of preference
const MODEL_OPTIONS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
];

export function setApiKey(key: string) {
  apiKey = key;
  if (typeof window !== "undefined") {
    localStorage.setItem("gemini_api_key", key);
  }
}

export function getApiKey(): string | null {
  if (apiKey) return apiKey;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("gemini_api_key");
    if (stored) {
      apiKey = stored;
      return stored;
    }
  }
  return null;
}

export function getSelectedModel(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("gemini_model") || "gemini-2.0-flash";
  }
  return "gemini-2.0-flash";
}

export function setSelectedModel(model: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("gemini_model", model);
  }
}

export function getModelOptions(): string[] {
  return MODEL_OPTIONS;
}

/** Parse Gemini API errors into user-friendly messages */
function parseGeminiError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);

  // Rate limit / quota exceeded (429)
  if (raw.includes("429") || raw.toLowerCase().includes("quota") || raw.toLowerCase().includes("rate")) {
    const retryMatch = raw.match(/retry\s*(?:in|after|delay[":]*)\s*"?(\d+)/i);
    const retrySeconds = retryMatch ? retryMatch[1] : null;
    return `⚠️ API quota exceeded for this model. ${
      retrySeconds ? `Try again in ~${retrySeconds}s. ` : ""
    }You can:\n• Wait a minute and retry\n• Switch to a different model in Settings (e.g. gemini-1.5-flash)\n• Use a different API key`;
  }

  // Invalid API key (400/401/403)
  if (raw.includes("401") || raw.includes("403") || raw.toLowerCase().includes("api key") || raw.toLowerCase().includes("permission")) {
    return "🔑 Invalid or expired API key. Please check your Gemini API key in Settings.";
  }

  // Model not found
  if (raw.includes("404") || raw.toLowerCase().includes("not found") || raw.toLowerCase().includes("is not supported")) {
    return "❌ Model not available. Try switching to a different model in Settings.";
  }

  // Safety / content filter
  if (raw.toLowerCase().includes("safety") || raw.toLowerCase().includes("blocked")) {
    return "🛡️ Content was blocked by safety filters. Try rephrasing your input.";
  }

  // Network errors
  if (raw.toLowerCase().includes("network") || raw.toLowerCase().includes("fetch") || raw.toLowerCase().includes("econnrefused")) {
    return "🌐 Network error. Please check your internet connection and try again.";
  }

  // Generic — show a truncated version of the raw message
  if (raw.length > 200) {
    return `Error: ${raw.slice(0, 180)}…`;
  }
  return `Error: ${raw}`;
}

/** Main function: generate content with automatic retry + model fallback */
export async function generateWithRetry(
  prompt: string,
  options?: { maxRetries?: number; retryDelay?: number }
): Promise<string> {
  const key = getApiKey();
  if (!key) throw new Error("🔑 No API key configured. Go to Settings to add your Gemini API key.");

  const maxRetries = options?.maxRetries ?? 2;
  const baseDelay = options?.retryDelay ?? 3000;
  const selectedModel = getSelectedModel();

  // Try the selected model first, then fallbacks
  const modelsToTry = [selectedModel, ...MODEL_OPTIONS.filter((m) => m !== selectedModel)];

  const genAI = new GoogleGenerativeAI(key);
  let lastError: unknown = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err: unknown) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        const isRateLimit = msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate");
        const isServerError = msg.includes("500") || msg.includes("503");

        // If rate limited or server error, retry with backoff
        if ((isRateLimit || isServerError) && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        // If rate limited and out of retries, try next model
        if (isRateLimit) break;

        // For non-retryable errors, throw immediately
        throw new Error(parseGeminiError(err));
      }
    }
  }

  // All models and retries exhausted
  throw new Error(parseGeminiError(lastError));
}

// Keep backward compat
export function getGeminiModel() {
  const key = getApiKey();
  if (!key) throw new Error("🔑 No API key configured. Go to Settings to add your Gemini API key.");
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: getSelectedModel() });
}

export async function generateContent(prompt: string): Promise<string> {
  return generateWithRetry(prompt);
}
