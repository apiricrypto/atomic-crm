import {
  getConnectorToken,
  readBearerToken,
  readConnectorSource,
  secretsEqual,
} from "./authentication.ts";
import {
  LeadValidationError,
  normalizeLead,
  type LeadInsert,
} from "./contract.ts";

const MAX_REQUEST_BYTES = 128 * 1024;

export type StoredLead = {
  id: number;
  source: string;
  source_record_id: string;
  status: string;
  created_at: string;
};

export type LeadStore = {
  insert(lead: LeadInsert): Promise<{ duplicate: boolean; record: StoredLead }>;
};

type HandlerDependencies = {
  getEnv: (name: string) => string | undefined;
  store: LeadStore;
  now?: () => Date;
  randomUUID?: () => string;
  logError?: (event: string, context: Record<string, unknown>) => void;
};

const responseHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  Vary: "authorization, x-satno-connector",
};

const jsonResponse = (
  status: number,
  body: Record<string, unknown>,
  extraHeaders: Record<string, string> = {},
) =>
  new Response(JSON.stringify(body), {
    headers: { ...responseHeaders, ...extraHeaders },
    status,
  });

export function createLeadIngestionHandler({
  getEnv,
  store,
  now = () => new Date(),
  randomUUID = () => crypto.randomUUID(),
  logError = (event, context) => console.error(event, context),
}: HandlerDependencies) {
  return async (req: Request): Promise<Response> => {
    const requestId = randomUUID();
    if (req.method !== "POST") {
      return jsonResponse(
        405,
        { error: "Method Not Allowed", request_id: requestId },
        { Allow: "POST" },
      );
    }

    const source = readConnectorSource(req);
    const actualToken = readBearerToken(req);
    if (!source || !actualToken) {
      return jsonResponse(401, {
        error: "Unauthorized",
        request_id: requestId,
      });
    }

    const expectedToken = getConnectorToken(source, getEnv);
    if (!expectedToken || expectedToken.length < 32) {
      logError("lead_ingestion_not_configured", {
        request_id: requestId,
        source,
      });
      return jsonResponse(503, {
        error: "Connector unavailable",
        request_id: requestId,
      });
    }
    if (!(await secretsEqual(actualToken, expectedToken))) {
      return jsonResponse(401, {
        error: "Unauthorized",
        request_id: requestId,
      });
    }

    const contentType = req.headers
      .get("content-type")
      ?.split(";", 1)[0]
      .trim()
      .toLowerCase();
    if (contentType !== "application/json") {
      return jsonResponse(415, {
        error: "Content-Type must be application/json",
        request_id: requestId,
      });
    }

    const declaredLength = Number(req.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
      return jsonResponse(413, {
        error: "Request body is too large",
        request_id: requestId,
      });
    }

    try {
      const rawBody = await req.text();
      if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
        return jsonResponse(413, {
          error: "Request body is too large",
          request_id: requestId,
        });
      }

      let body: unknown;
      try {
        body = JSON.parse(rawBody);
      } catch {
        throw new LeadValidationError("Body is not valid JSON");
      }

      const lead = normalizeLead(body, source, now());
      const result = await store.insert(lead);
      return jsonResponse(result.duplicate ? 200 : 201, {
        data: result.record,
        duplicate: result.duplicate,
        request_id: requestId,
      });
    } catch (error) {
      if (error instanceof LeadValidationError) {
        return jsonResponse(400, {
          error: error.message,
          request_id: requestId,
        });
      }
      logError("lead_ingestion_failed", { request_id: requestId, source });
      return jsonResponse(500, {
        error: "Lead ingestion failed",
        request_id: requestId,
      });
    }
  };
}
