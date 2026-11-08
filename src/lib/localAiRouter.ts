export type AIProviderId = "lmstudio" | "ollama" | "openai" | "deterministic";

export type DetectedModel = {
  id: string;
  name: string;
  provider: AIProviderId;
  size?: string;
};

export type ProviderStatus = {
  id: AIProviderId;
  name: string;
  endpoint: string;
  isOnline: boolean;
  models: DetectedModel[];
  latencyMs?: number;
  error?: string;
};

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || "http://127.0.0.1:1234/v1";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OPENAI_URL = "https://api.openai.com/v1";

/**
 * Pings LM Studio on 127.0.0.1:1234/v1/models
 */
export async function detectLMStudio(): Promise<ProviderStatus> {
  const t0 = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${LM_STUDIO_URL}/models`, {
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const latencyMs = Date.now() - t0;

    const models: DetectedModel[] = (data?.data || []).map((m: any) => ({
      id: m.id,
      name: m.id,
      provider: "lmstudio" as const,
    }));

    return {
      id: "lmstudio",
      name: "LM Studio (Local 1234)",
      endpoint: LM_STUDIO_URL,
      isOnline: true,
      models,
      latencyMs,
    };
  } catch (err: any) {
    return {
      id: "lmstudio",
      name: "LM Studio (Local 1234)",
      endpoint: LM_STUDIO_URL,
      isOnline: false,
      models: [],
      error: err.message,
    };
  }
}

/**
 * Pings Ollama on 127.0.0.1:11434/api/tags
 */
export async function detectOllama(): Promise<ProviderStatus> {
  const t0 = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const latencyMs = Date.now() - t0;

    const models: DetectedModel[] = (data?.models || []).map((m: any) => ({
      id: m.name,
      name: m.name,
      provider: "ollama" as const,
      size: m.size ? `${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : undefined,
    }));

    return {
      id: "ollama",
      name: "Ollama (Local 11434)",
      endpoint: OLLAMA_URL,
      isOnline: true,
      models,
      latencyMs,
    };
  } catch (err: any) {
    return {
      id: "ollama",
      name: "Ollama (Local 11434)",
      endpoint: OLLAMA_URL,
      isOnline: false,
      models: [],
      error: err.message,
    };
  }
}

/**
 * Checks OpenAI Cloud API key
 */
export function detectOpenAI(): ProviderStatus {
  const hasKey = !!process.env.OPENAI_API_KEY;
  return {
    id: "openai",
    name: "OpenAI Cloud (GPT-4o)",
    endpoint: OPENAI_URL,
    isOnline: hasKey,
    models: hasKey
      ? [
          { id: "gpt-4o-mini", name: "gpt-4o-mini", provider: "openai" },
          { id: "gpt-4o", name: "gpt-4o", provider: "openai" },
        ]
      : [],
    error: hasKey ? undefined : "OPENAI_API_KEY not configured",
  };
}

/**
 * Aggregates all provider discovery in parallel
 */
export async function scanAllAIProviders(): Promise<{
  providers: ProviderStatus[];
  recommended: { provider: AIProviderId; model: string };
}> {
  const [lmStudio, ollama] = await Promise.all([detectLMStudio(), detectOllama()]);
  const openai = detectOpenAI();

  const deterministic: ProviderStatus = {
    id: "deterministic",
    name: "Vendora Rule Engine (Zero-Latency Offline)",
    endpoint: "in-memory",
    isOnline: true,
    models: [{ id: "rule-engine", name: "Built-in Catalog Matcher", provider: "deterministic" }],
    latencyMs: 1,
  };

  const providers = [lmStudio, ollama, openai, deterministic];

  // Pick best available recommendation
  let recProvider: AIProviderId = "deterministic";
  let recModel = "rule-engine";

  if (lmStudio.isOnline && lmStudio.models.length > 0) {
    recProvider = "lmstudio";
    // Prefer qwen or first loaded model
    const preferred = lmStudio.models.find((m) => m.id.includes("qwen")) || lmStudio.models[0];
    recModel = preferred.id;
  } else if (ollama.isOnline && ollama.models.length > 0) {
    recProvider = "ollama";
    const preferred = ollama.models.find((m) => m.id.includes("qwen") || m.id.includes("deepseek")) || ollama.models[0];
    recModel = preferred.id;
  } else if (openai.isOnline) {
    recProvider = "openai";
    recModel = "gpt-4o-mini";
  }

  return {
    providers,
    recommended: { provider: recProvider, model: recModel },
  };
}
