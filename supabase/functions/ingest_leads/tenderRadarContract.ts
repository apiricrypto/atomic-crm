import { LeadValidationError } from "./validationError.ts";
import { findSensitiveUrlPart } from "./sensitiveData.ts";

export const TENDER_RADAR_CONTRACT_VERSION =
  "satno.tender-radar.lead.v1" as const;

const OPPORTUNITY_TYPES = ["inquiry", "tender"] as const;
const DOMAINS = ["renewable_energy", "security_systems"] as const;
const GRADES = ["A", "B", "C"] as const;

const ALLOWED_FIELDS = new Set([
  "contract_version",
  "scoring_version",
  "opportunity_type",
  "domain",
  "radar_grade",
  "radar_score",
  "official_need_no_candidate",
  "official_tender_no_candidate",
  "official_source_url_candidate",
  "publish_date_candidate",
  "document_deadline_candidate",
  "submission_deadline_candidate",
  "organizer_candidate",
  "fallback_fingerprint",
  "source_snapshot",
]);

type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];
type Domain = (typeof DOMAINS)[number];
type Grade = (typeof GRADES)[number];

export type TenderRadarPayload = {
  contract_version: typeof TENDER_RADAR_CONTRACT_VERSION;
  scoring_version: string;
  opportunity_type: OpportunityType;
  domain: Domain;
  radar_grade: Grade;
  radar_score: number;
  official_need_no_candidate: string | null;
  official_tender_no_candidate: string | null;
  official_source_url_candidate: string | null;
  publish_date_candidate: string | null;
  document_deadline_candidate: string | null;
  submission_deadline_candidate: string | null;
  organizer_candidate: string | null;
  fallback_fingerprint: string;
  source_snapshot: Record<string, unknown>;
};

const asObject = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new LeadValidationError(
      "Tender Radar raw_payload must be a JSON object",
    );
  }
  return value as Record<string, unknown>;
};

const requiredText = (value: unknown, field: string, maxLength: number) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new LeadValidationError(`Tender Radar ${field} is required`);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new LeadValidationError(`Tender Radar ${field} is too long`);
  }
  return normalized;
};

const optionalText = (value: unknown, field: string, maxLength: number) => {
  if (value == null || value === "") return null;
  if (typeof value !== "string") {
    throw new LeadValidationError(`Tender Radar ${field} must be text`);
  }
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.length > maxLength) {
    throw new LeadValidationError(`Tender Radar ${field} is too long`);
  }
  return normalized;
};

const optionalDate = (value: unknown, field: string) => {
  const normalized = optionalText(value, field, 10);
  if (!normalized) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new LeadValidationError(`Tender Radar ${field} must use YYYY-MM-DD`);
  }
  const date = new Date(`${normalized}T00:00:00.000Z`);
  if (
    Number.isNaN(date.valueOf()) ||
    date.toISOString().slice(0, 10) !== normalized
  ) {
    throw new LeadValidationError(`Tender Radar ${field} is invalid`);
  }
  return normalized;
};

const oneOf = <T extends readonly string[]>(
  value: unknown,
  allowed: T,
  field: string,
): T[number] => {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new LeadValidationError(`Tender Radar ${field} is invalid`);
  }
  return value as T[number];
};

const officialUrl = (value: unknown, opportunityType: OpportunityType) => {
  const normalized = optionalText(
    value,
    "official_source_url_candidate",
    2_048,
  );
  if (!normalized) return null;
  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    throw new LeadValidationError(
      "Tender Radar official_source_url_candidate is invalid",
    );
  }
  const expectedHost =
    opportunityType === "inquiry" ? "eproc.setadiran.ir" : "etend.setadiran.ir";
  const expectedPath =
    opportunityType === "inquiry" ? "/eproc/entry.do" : "/etend/index.action";
  if (
    url.protocol !== "https:" ||
    url.hostname !== expectedHost ||
    url.pathname !== expectedPath
  ) {
    throw new LeadValidationError(
      "Tender Radar official URL does not match opportunity type",
    );
  }
  const sensitivePart = findSensitiveUrlPart(url);
  if (sensitivePart) {
    throw new LeadValidationError(
      `Tender Radar official URL cannot contain sensitive material: ${sensitivePart}`,
    );
  }
  return url.toString();
};

const assertDeadlineOrder = (
  publishDate: string | null,
  deadline: string | null,
  field: string,
) => {
  if (publishDate && deadline && deadline < publishDate) {
    throw new LeadValidationError(
      `Tender Radar ${field} cannot precede publish_date_candidate`,
    );
  }
};

export function validateTenderRadarPayload(
  value: unknown,
  sourceRecordId?: string,
): TenderRadarPayload {
  const payload = asObject(value);
  const unknownField = Object.keys(payload).find(
    (field) => !ALLOWED_FIELDS.has(field),
  );
  if (unknownField) {
    throw new LeadValidationError(
      `Unknown Tender Radar field: ${unknownField}`,
    );
  }
  if (payload.contract_version !== TENDER_RADAR_CONTRACT_VERSION) {
    throw new LeadValidationError("Unsupported Tender Radar contract_version");
  }

  const opportunityType = oneOf(
    payload.opportunity_type,
    OPPORTUNITY_TYPES,
    "opportunity_type",
  );
  const domain = oneOf(payload.domain, DOMAINS, "domain");
  const radarGrade = oneOf(payload.radar_grade, GRADES, "radar_grade");
  if (
    !Number.isInteger(payload.radar_score) ||
    (payload.radar_score as number) < 0 ||
    (payload.radar_score as number) > 100
  ) {
    throw new LeadValidationError(
      "Tender Radar radar_score must be an integer from 0 to 100",
    );
  }

  const officialNeedNo = optionalText(
    payload.official_need_no_candidate,
    "official_need_no_candidate",
    200,
  );
  const officialTenderNo = optionalText(
    payload.official_tender_no_candidate,
    "official_tender_no_candidate",
    200,
  );
  if (opportunityType === "inquiry" && officialTenderNo) {
    throw new LeadValidationError(
      "Tender Radar inquiry cannot carry a Tender No candidate",
    );
  }
  if (opportunityType === "tender" && officialNeedNo) {
    throw new LeadValidationError(
      "Tender Radar tender cannot carry a Need No candidate",
    );
  }
  if (
    sourceRecordId &&
    (sourceRecordId === officialNeedNo || sourceRecordId === officialTenderNo)
  ) {
    throw new LeadValidationError(
      "Tender Radar source_record_id must remain separate from official identifiers",
    );
  }

  const publishDate = optionalDate(
    payload.publish_date_candidate,
    "publish_date_candidate",
  );
  const documentDeadline = optionalDate(
    payload.document_deadline_candidate,
    "document_deadline_candidate",
  );
  const submissionDeadline = optionalDate(
    payload.submission_deadline_candidate,
    "submission_deadline_candidate",
  );
  assertDeadlineOrder(
    publishDate,
    documentDeadline,
    "document_deadline_candidate",
  );
  assertDeadlineOrder(
    publishDate,
    submissionDeadline,
    "submission_deadline_candidate",
  );

  const fallbackFingerprint = requiredText(
    payload.fallback_fingerprint,
    "fallback_fingerprint",
    80,
  );
  if (!/^sha256:[a-f0-9]{64}$/.test(fallbackFingerprint)) {
    throw new LeadValidationError(
      "Tender Radar fallback_fingerprint must be a lowercase SHA-256 value",
    );
  }

  return {
    contract_version: TENDER_RADAR_CONTRACT_VERSION,
    scoring_version: requiredText(
      payload.scoring_version,
      "scoring_version",
      100,
    ),
    opportunity_type: opportunityType,
    domain,
    radar_grade: radarGrade,
    radar_score: payload.radar_score as number,
    official_need_no_candidate: officialNeedNo,
    official_tender_no_candidate: officialTenderNo,
    official_source_url_candidate: officialUrl(
      payload.official_source_url_candidate,
      opportunityType,
    ),
    publish_date_candidate: publishDate,
    document_deadline_candidate: documentDeadline,
    submission_deadline_candidate: submissionDeadline,
    organizer_candidate: optionalText(
      payload.organizer_candidate,
      "organizer_candidate",
      500,
    ),
    fallback_fingerprint: fallbackFingerprint,
    source_snapshot: asObject(payload.source_snapshot),
  };
}

export const isTenderRadarReviewCandidate = (payload: TenderRadarPayload) =>
  payload.radar_grade === "A" || payload.radar_grade === "B";
