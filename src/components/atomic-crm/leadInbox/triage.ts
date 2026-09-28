import type { LeadInboxRecord, LeadPriority } from "../types";

const PRIORITY_POINTS: Record<LeadPriority, number> = {
  low: 0,
  normal: 10,
  high: 20,
  urgent: 30,
};

/**
 * A deterministic attention score for inbox ordering only. It is not a sales
 * forecast, qualification decision, Deal amount or financial value.
 */
export const calculateLeadTriageScore = (lead: LeadInboxRecord) => {
  let score = PRIORITY_POINTS[lead.priority];
  if (lead.organization_name?.trim()) score += 20;
  if (lead.contact_email?.trim() || lead.contact_phone?.trim()) score += 15;
  if (lead.province?.trim() || lead.city?.trim()) score += 10;
  if (
    lead.estimated_amount != null &&
    lead.estimated_amount >= 0 &&
    lead.estimated_currency
  ) {
    score += 15;
  }
  if (lead.deadline) score += 10;

  return Math.min(score, 100);
};

export const getSafeLeadSourceUrl = (value?: string | null) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};
