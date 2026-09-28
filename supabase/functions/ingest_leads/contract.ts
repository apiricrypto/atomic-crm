export const CONNECTOR_SOURCES = ["tender_radar", "bale_market"] as const;

export type ConnectorSource = (typeof CONNECTOR_SOURCES)[number];
export type LeadPriority = "low" | "normal" | "high" | "urgent";

export type LeadInsert = {
  source: ConnectorSource;
  source_record_id: string;
  source_url: string | null;
  title: string;
  organization_name: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  province: string | null;
  city: string | null;
  description: string | null;
  estimated_amount: number | null;
  estimated_currency: string | null;
  deadline: string | null;
  status: "new";
  priority: LeadPriority;
  raw_payload: Record<string, unknown>;
  captured_at: string;
};

const ALLOWED_FIELDS = new Set([
  "source_record_id",
  "source_url",
  "title",
  "organization_name",
  "contact_name",
  "contact_phone",
  "contact_email",
  "province",
  "city",
  "description",
  "estimated_amount",
  "estimated_currency",
  "deadline",
  "priority",
  "raw_payload",
  "captured_at",
]);

const MAX_RAW_PAYLOAD_BYTES = 64 * 1024;
const textEncoder = new TextEncoder();

export class LeadValidationError extends Error {}

export function isConnectorSource(value: unknown): value is ConnectorSource {
  return (
    typeof value === "string" &&
    (CONNECTOR_SOURCES as readonly string[]).includes(value)
  );
}

function asObject(value: unknown, field = "body"): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new LeadValidationError(`${field} must be a JSON object`);
  }
  return value as Record<string, unknown>;
}

function requiredText(
  value: unknown,
  field: string,
  maxLength: number,
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new LeadValidationError(`${field} is required`);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new LeadValidationError(`${field} is too long`);
  }
  return normalized;
}

function optionalText(
  value: unknown,
  field: string,
  maxLength: number,
): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") {
    throw new LeadValidationError(`${field} must be text`);
  }
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.length > maxLength) {
    throw new LeadValidationError(`${field} is too long`);
  }
  return normalized;
}

function optionalUrl(value: unknown): string | null {
  const normalized = optionalText(value, "source_url", 2_048);
  if (!normalized) return null;
  try {
    const url = new URL(normalized);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw null;
    return url.toString();
  } catch {
    throw new LeadValidationError("source_url must use HTTP or HTTPS");
  }
}

function optionalEmail(value: unknown): string | null {
  const normalized = optionalText(value, "contact_email", 320);
  if (!normalized) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new LeadValidationError("contact_email is invalid");
  }
  return normalized.toLowerCase();
}

function optionalDate(value: unknown): string | null {
  const normalized = optionalText(value, "deadline", 10);
  if (!normalized) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new LeadValidationError("deadline must use YYYY-MM-DD");
  }
  const date = new Date(`${normalized}T00:00:00.000Z`);
  if (
    Number.isNaN(date.valueOf()) ||
    date.toISOString().slice(0, 10) !== normalized
  ) {
    throw new LeadValidationError("deadline is invalid");
  }
  return normalized;
}

function capturedAt(value: unknown, now: Date): string {
  const normalized = requiredText(value, "captured_at", 64);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      normalized,
    )
  ) {
    throw new LeadValidationError(
      "captured_at must be an ISO timestamp with timezone",
    );
  }
  const date = new Date(normalized);
  if (Number.isNaN(date.valueOf())) {
    throw new LeadValidationError("captured_at is invalid");
  }
  if (date.valueOf() > now.valueOf() + 5 * 60 * 1_000) {
    throw new LeadValidationError("captured_at cannot be in the future");
  }
  return date.toISOString();
}

function rawPayload(value: unknown): Record<string, unknown> {
  const payload = asObject(value, "raw_payload");
  const size = textEncoder.encode(JSON.stringify(payload)).byteLength;
  if (size > MAX_RAW_PAYLOAD_BYTES) {
    throw new LeadValidationError("raw_payload is too large");
  }
  return payload;
}

function priority(value: unknown): LeadPriority {
  if (value == null || value === "") return "normal";
  if (
    value !== "low" &&
    value !== "normal" &&
    value !== "high" &&
    value !== "urgent"
  ) {
    throw new LeadValidationError("priority is invalid");
  }
  return value;
}

function estimate(body: Record<string, unknown>) {
  const amount = body.estimated_amount;
  const currency = optionalText(
    body.estimated_currency,
    "estimated_currency",
    3,
  );
  if (amount == null && currency == null) {
    return { amount: null, currency: null };
  }
  if (!Number.isSafeInteger(amount) || (amount as number) < 0) {
    throw new LeadValidationError(
      "estimated_amount must be a non-negative safe integer",
    );
  }
  if (!currency || !/^[A-Z]{3}$/.test(currency)) {
    throw new LeadValidationError(
      "estimated_currency must be a three-letter uppercase code",
    );
  }
  return { amount: amount as number, currency };
}

export function normalizeLead(
  value: unknown,
  source: ConnectorSource,
  now = new Date(),
): LeadInsert {
  const body = asObject(value);
  const unknownField = Object.keys(body).find(
    (key) => !ALLOWED_FIELDS.has(key),
  );
  if (unknownField) {
    throw new LeadValidationError(`Unknown field: ${unknownField}`);
  }
  const { amount, currency } = estimate(body);

  return {
    captured_at: capturedAt(body.captured_at, now),
    city: optionalText(body.city, "city", 200),
    contact_email: optionalEmail(body.contact_email),
    contact_name: optionalText(body.contact_name, "contact_name", 300),
    contact_phone: optionalText(body.contact_phone, "contact_phone", 64),
    deadline: optionalDate(body.deadline),
    description: optionalText(body.description, "description", 10_000),
    estimated_amount: amount,
    estimated_currency: currency,
    organization_name: optionalText(
      body.organization_name,
      "organization_name",
      500,
    ),
    priority: priority(body.priority),
    province: optionalText(body.province, "province", 200),
    raw_payload: rawPayload(body.raw_payload),
    source,
    source_record_id: requiredText(
      body.source_record_id,
      "source_record_id",
      200,
    ),
    source_url: optionalUrl(body.source_url),
    status: "new",
    title: requiredText(body.title, "title", 500),
  };
}
