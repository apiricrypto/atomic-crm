import type { LeadInboxRecord, TenderOpportunityReview } from "../types";

const CONTRACT_VERSION = "satno.tender-radar.lead.v1";
const SHA256_FINGERPRINT = /^sha256:[a-f0-9]{64}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const requiredString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const optionalString = (value: unknown) =>
  value == null ? null : requiredString(value);

const optionalDate = (value: unknown) => {
  const normalized = optionalString(value);
  return normalized && ISO_DATE.test(normalized) ? normalized : null;
};

export type TenderRadarReviewCandidate = {
  grade: "A" | "B";
  score: number;
  review: TenderOpportunityReview;
};

/**
 * Converts only the allow-listed Tender Radar assertions into an editable
 * review draft. The nested source snapshot is never returned or rendered.
 */
export function buildTenderRadarReviewCandidate(
  lead: LeadInboxRecord,
): TenderRadarReviewCandidate | null {
  if (lead.source !== "tender_radar" || !isRecord(lead.raw_payload)) {
    return null;
  }

  const payload = lead.raw_payload;
  if (payload.contract_version !== CONTRACT_VERSION) return null;

  const grade = payload.radar_grade;
  if (grade !== "A" && grade !== "B") return null;

  const score = payload.radar_score;
  if (!Number.isInteger(score) || Number(score) < 0 || Number(score) > 100) {
    return null;
  }

  const opportunityType = payload.opportunity_type;
  if (opportunityType !== "inquiry" && opportunityType !== "tender") {
    return null;
  }

  const domain = payload.domain;
  if (domain !== "renewable_energy" && domain !== "security_systems") {
    return null;
  }

  const fingerprint = requiredString(payload.fallback_fingerprint);
  if (!fingerprint || !SHA256_FINGERPRINT.test(fingerprint)) return null;

  const officialNeedNo = optionalString(payload.official_need_no_candidate);
  const officialTenderNo = optionalString(payload.official_tender_no_candidate);
  if (
    (opportunityType === "inquiry" && officialTenderNo) ||
    (opportunityType === "tender" && officialNeedNo)
  ) {
    return null;
  }

  return {
    grade,
    score: Number(score),
    review: {
      category: null,
      city: lead.city?.trim() || null,
      description: lead.description?.trim() || null,
      document_deadline: optionalDate(payload.document_deadline_candidate),
      domain,
      fallback_fingerprint: fingerprint,
      official_need_no: opportunityType === "inquiry" ? officialNeedNo : null,
      official_source_url: optionalString(
        payload.official_source_url_candidate,
      ),
      official_tender_no:
        opportunityType === "tender" ? officialTenderNo : null,
      opportunity_type: opportunityType,
      organizer:
        optionalString(payload.organizer_candidate) ??
        lead.organization_name?.trim() ??
        null,
      province: lead.province?.trim() || null,
      publish_date: optionalDate(payload.publish_date_candidate),
      radar_grade: grade,
      radar_score: Number(score),
      submission_deadline: optionalDate(payload.submission_deadline_candidate),
      title: lead.title.trim(),
      trade: null,
      verification_status: "pending_setad_verification",
    },
  };
}
