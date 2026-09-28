export const TENDER_DOMAINS = ["renewable_energy", "security_systems"] as const;

export const TENDER_OPPORTUNITY_TYPES = ["inquiry", "tender"] as const;

export const TENDER_VERIFICATION_STATUSES = [
  "setad_verified",
  "pending_setad_verification",
  "data_conflict",
] as const;

export const RADAR_GRADES = ["A", "B", "C"] as const;

export type TenderDomain = (typeof TENDER_DOMAINS)[number];
export type TenderOpportunityType = (typeof TENDER_OPPORTUNITY_TYPES)[number];
export type TenderVerificationStatus =
  (typeof TENDER_VERIFICATION_STATUSES)[number];
export type RadarGrade = (typeof RADAR_GRADES)[number];

export type TenderOfficialReference = {
  opportunityType: TenderOpportunityType;
  officialNeedNo?: string | null;
  officialTenderNo?: string | null;
};

export type TenderDedupInput = TenderOfficialReference & {
  source: "tender_radar" | "setad" | "manual";
  aggregatorRecordId?: string | null;
  fallbackFingerprint: string;
};

const SETAD_PORTALS: Record<TenderOpportunityType, string> = {
  inquiry: "https://eproc.setadiran.ir/eproc/entry.do",
  tender: "https://etend.setadiran.ir/etend/index.action",
};

const normalizeIdentifier = (value?: string | null) => value?.trim() || null;

export function assertOfficialReference({
  opportunityType,
  officialNeedNo,
  officialTenderNo,
}: TenderOfficialReference) {
  const needNo = normalizeIdentifier(officialNeedNo);
  const tenderNo = normalizeIdentifier(officialTenderNo);

  if (opportunityType === "inquiry" && tenderNo) {
    throw new Error("An inquiry cannot carry a Tender No");
  }
  if (opportunityType === "tender" && needNo) {
    throw new Error("A tender cannot carry a Need No");
  }

  return {
    officialNeedNo: needNo,
    officialTenderNo: tenderNo,
  };
}

export function getTenderDedupKey(input: TenderDedupInput) {
  const { officialNeedNo, officialTenderNo } = assertOfficialReference(input);

  if (officialNeedNo) return `setad:need:${officialNeedNo}`;
  if (officialTenderNo) return `setad:tender:${officialTenderNo}`;

  const aggregatorRecordId = normalizeIdentifier(input.aggregatorRecordId);
  if (aggregatorRecordId) {
    return `${input.source}:record:${aggregatorRecordId}`;
  }

  const fallbackFingerprint = normalizeIdentifier(input.fallbackFingerprint);
  if (!fallbackFingerprint) {
    throw new Error("A fallback fingerprint is required");
  }
  return `fingerprint:${fallbackFingerprint}`;
}

export function getSetadPortalUrl(type: TenderOpportunityType) {
  return SETAD_PORTALS[type];
}

export function isRadarImportCandidate(grade: RadarGrade) {
  return grade === "A" || grade === "B";
}
