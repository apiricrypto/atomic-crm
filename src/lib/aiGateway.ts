export type AiPrivacyClass = "P0" | "P1" | "P2";
export type AiTaskType =
  | "extraction"
  | "classification"
  | "reasoning"
  | "multimodal"
  | "coding"
  | "voice"
  | "general";

export type AiProviderId =
  | "groq"
  | "openrouter"
  | "nvidia-nim"
  | "cloudflare-workers-ai"
  | "mistral"
  | "gemini"
  | "ollama-local";

export interface AiRouteRequest {
  privacyClass: AiPrivacyClass;
  task: AiTaskType;
  multimodal?: boolean;
  preferLowLatency?: boolean;
}

export interface AiRouteDecision {
  primary: AiProviderId;
  fallback: AiProviderId[];
  reason: string;
}

const publicFastRoute: AiRouteDecision = {
  primary: "groq",
  fallback: ["openrouter", "nvidia-nim"],
  reason: "Public/non-sensitive fast text workload",
};

export function selectAiRoute(request: AiRouteRequest): AiRouteDecision {
  if (request.privacyClass === "P2") {
    return {
      primary: "ollama-local",
      fallback: [],
      reason:
        "Sensitive CRM/customer/finance/staff data must remain on an approved private or local route",
    };
  }

  if (request.multimodal || request.task === "multimodal") {
    return {
      primary: "gemini",
      fallback: ["openrouter", "nvidia-nim"],
      reason: "Multimodal workload",
    };
  }

  if (request.task === "reasoning") {
    return {
      primary: "nvidia-nim",
      fallback: ["openrouter"],
      reason: "Complex reasoning workload",
    };
  }

  if (request.task === "coding") {
    return {
      primary: "mistral",
      fallback: ["openrouter", "nvidia-nim"],
      reason: "Code-oriented workload",
    };
  }

  if (
    request.task === "extraction" ||
    request.task === "classification" ||
    request.preferLowLatency
  ) {
    return publicFastRoute;
  }

  return {
    primary: "openrouter",
    fallback: ["nvidia-nim", "groq"],
    reason: "General non-sensitive workload with provider flexibility",
  };
}

export interface AiGatewayRequest {
  prompt: string;
  privacyClass: AiPrivacyClass;
  task: AiTaskType;
  metadata?: Record<string, string | number | boolean>;
}

export interface AiGatewayResponse {
  text: string;
  provider: AiProviderId;
  model?: string;
  requestId?: string;
}

export interface AiGatewayClientOptions {
  endpoint?: string;
  fetchImpl?: typeof fetch;
}

/**
 * Browser-safe client for SATNO AI Gateway.
 *
 * IMPORTANT:
 * - Do not put provider API keys in VITE_* variables.
 * - The configured endpoint must be a trusted backend/serverless proxy.
 * - Provider routing and credentials are enforced server-side.
 */
export function createAiGatewayClient(options: AiGatewayClientOptions = {}) {
  const endpoint = options.endpoint ?? "/api/ai";
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async generate(request: AiGatewayRequest): Promise<AiGatewayResponse> {
      const route = selectAiRoute(request);
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...request,
          route,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI gateway request failed with status ${response.status}`);
      }

      return (await response.json()) as AiGatewayResponse;
    },
  };
}
