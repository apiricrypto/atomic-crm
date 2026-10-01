import { describe, expect, it, vi } from "vitest";
import { createAiGatewayClient, selectAiRoute } from "./aiGateway";

describe("selectAiRoute", () => {
  it("keeps P2 data on the local/private route", () => {
    expect(
      selectAiRoute({ privacyClass: "P2", task: "reasoning" }),
    ).toEqual({
      primary: "ollama-local",
      fallback: [],
      reason:
        "Sensitive CRM/customer/finance/staff data must remain on an approved private or local route",
    });
  });

  it("routes public extraction to the low-latency path", () => {
    const route = selectAiRoute({
      privacyClass: "P0",
      task: "extraction",
    });

    expect(route.primary).toBe("groq");
    expect(route.fallback).toEqual(["openrouter", "nvidia-nim"]);
  });

  it("routes multimodal work separately", () => {
    expect(
      selectAiRoute({ privacyClass: "P0", task: "multimodal" }).primary,
    ).toBe("gemini");
  });
});

describe("createAiGatewayClient", () => {
  it("calls the trusted proxy instead of exposing provider credentials", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          text: "ok",
          provider: "groq",
          requestId: "req-1",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const client = createAiGatewayClient({
      endpoint: "/api/ai",
      fetchImpl: fetchImpl as typeof fetch,
    });

    const result = await client.generate({
      prompt: "classify",
      privacyClass: "P0",
      task: "classification",
    });

    expect(result.provider).toBe("groq");
    expect(fetchImpl).toHaveBeenCalledOnce();

    const [, init] = fetchImpl.mock.calls[0];
    const body = JSON.parse(String(init?.body));
    expect(body.route.primary).toBe("groq");
  });
});
