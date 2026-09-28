// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { secretsEqual } from "./authentication";
import tenderRadarFixtures from "./fixtures/tender-radar-v1.json";
import { createLeadIngestionHandler, type LeadStore } from "./handler";

const tenderToken = "t".repeat(48);
const baleToken = "b".repeat(48);

const validBody = {
  captured_at: "2026-09-28T07:30:00Z",
  deadline: tenderRadarFixtures.cases[0].request.deadline,
  raw_payload: tenderRadarFixtures.cases[0].request.raw_payload,
  source_record_id: "SETAD-100",
  title: "فرصت نیروگاه خورشیدی",
};

const storedLead = {
  created_at: "2026-09-28T07:31:00Z",
  id: 101,
  source: "tender_radar",
  source_record_id: "SETAD-100",
  status: "new",
};

const request = ({
  body = validBody,
  connector = "tender_radar",
  contentType = "application/json",
  method = "POST",
  token = tenderToken,
}: {
  body?: unknown;
  connector?: string | null;
  contentType?: string;
  method?: string;
  token?: string | null;
} = {}) => {
  const headers = new Headers();
  if (connector) headers.set("x-satno-connector", connector);
  if (token) headers.set("authorization", `Bearer ${token}`);
  headers.set("content-type", contentType);
  return new Request("https://crm.example.test/functions/v1/ingest_leads", {
    body: method === "POST" ? JSON.stringify(body) : undefined,
    headers,
    method,
  });
};

const createStore = (duplicate = false): LeadStore => ({
  insert: vi.fn(async () => ({ duplicate, record: storedLead })),
});

const createHandler = (store: LeadStore, overrides = {}) =>
  createLeadIngestionHandler({
    getEnv: (name) =>
      name === "SATNO_TENDER_RADAR_INGEST_TOKEN"
        ? tenderToken
        : name === "SATNO_BALE_MARKET_INGEST_TOKEN"
          ? baleToken
          : undefined,
    now: () => new Date("2026-09-28T08:00:00Z"),
    randomUUID: () => "request-123",
    store,
    ...overrides,
  });

describe("lead ingestion authentication", () => {
  it("compares connector tokens by digest", async () => {
    await expect(secretsEqual(tenderToken, tenderToken)).resolves.toBe(true);
    await expect(secretsEqual(tenderToken, baleToken)).resolves.toBe(false);
  });

  it.each([
    { connector: null },
    { token: null },
    { token: "wrong" },
    { connector: "bale_market", token: tenderToken },
    { connector: "unknown" },
  ])(
    "rejects missing, invalid or cross-source credentials",
    async (options) => {
      const store = createStore();
      const response = await createHandler(store)(request(options));

      expect(response.status).toBe(401);
      expect(store.insert).not.toHaveBeenCalled();
      expect(await response.json()).toEqual({
        error: "Unauthorized",
        request_id: "request-123",
      });
    },
  );

  it("fails closed when a source token is not securely configured", async () => {
    const store = createStore();
    const logError = vi.fn();
    const handler = createHandler(store, {
      getEnv: () => "short",
      logError,
    });
    const response = await handler(request());

    expect(response.status).toBe(503);
    expect(store.insert).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith("lead_ingestion_not_configured", {
      request_id: "request-123",
      source: "tender_radar",
    });
  });
});

describe("lead ingestion handler", () => {
  it("creates a new quarantined lead without returning raw payload", async () => {
    const store = createStore();
    const response = await createHandler(store)(request());

    expect(response.status).toBe(201);
    expect(store.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        raw_payload: tenderRadarFixtures.cases[0].request.raw_payload,
        source: "tender_radar",
        source_record_id: "SETAD-100",
        status: "new",
      }),
    );
    const responseText = await response.text();
    expect(responseText).not.toContain("fixture-only");
    expect(responseText).not.toContain(tenderToken);
    expect(JSON.parse(responseText)).toEqual({
      data: storedLead,
      duplicate: false,
      request_id: "request-123",
    });
  });

  it("returns the existing record for an idempotent retry", async () => {
    const store = createStore(true);
    const response = await createHandler(store)(request());

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      data: storedLead,
      duplicate: true,
    });
  });

  it("never accepts connector-supplied qualification or core record IDs", async () => {
    const store = createStore();
    const response = await createHandler(store)(
      request({ body: { ...validBody, deal_id: 9, status: "qualified" } }),
    );

    expect(response.status).toBe(400);
    expect(store.insert).not.toHaveBeenCalled();
    expect(await response.json()).toMatchObject({
      error: expect.stringMatching(/Unknown field/),
    });
  });

  it("requires POST with JSON and advertises no browser CORS access", async () => {
    const store = createStore();
    const methodResponse = await createHandler(store)(
      request({ method: "GET" }),
    );
    const typeResponse = await createHandler(store)(
      request({ contentType: "text/plain" }),
    );

    expect(methodResponse.status).toBe(405);
    expect(methodResponse.headers.get("allow")).toBe("POST");
    expect(typeResponse.status).toBe(415);
    expect(
      methodResponse.headers.get("access-control-allow-origin"),
    ).toBeNull();
  });

  it("rejects an oversized request before parsing", async () => {
    const store = createStore();
    const response = await createHandler(store)(
      request({ body: { ...validBody, padding: "x".repeat(129 * 1024) } }),
    );

    expect(response.status).toBe(413);
    expect(store.insert).not.toHaveBeenCalled();
  });

  it("returns a generic error and logs no payload when persistence fails", async () => {
    const store: LeadStore = {
      insert: vi.fn(async () => {
        throw new Error("database detail containing private data");
      }),
    };
    const logError = vi.fn();
    const response = await createHandler(store, { logError })(request());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Lead ingestion failed",
      request_id: "request-123",
    });
    expect(logError).toHaveBeenCalledWith("lead_ingestion_failed", {
      request_id: "request-123",
      source: "tender_radar",
    });
  });
});
