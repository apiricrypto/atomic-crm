import { describe, expect, it } from "vitest";

import {
  assertOfficialReference,
  getSetadPortalUrl,
  getTenderDedupKey,
  isRadarImportCandidate,
} from "./contract";

describe("Tender & Inquiry Intelligence contract", () => {
  it("keeps Need No and Tender No type-specific", () => {
    expect(
      assertOfficialReference({
        opportunityType: "inquiry",
        officialNeedNo: " 1105000000000001 ",
      }),
    ).toEqual({
      officialNeedNo: "1105000000000001",
      officialTenderNo: null,
    });

    expect(() =>
      assertOfficialReference({
        opportunityType: "inquiry",
        officialTenderNo: "T-1",
      }),
    ).toThrow(/Need No|Tender No/);
    expect(() =>
      assertOfficialReference({
        opportunityType: "tender",
        officialNeedNo: "N-1",
      }),
    ).toThrow(/Need No|Tender No/);
  });

  it("prefers official SETAD identity over aggregator and fingerprint keys", () => {
    expect(
      getTenderDedupKey({
        aggregatorRecordId: "RADAR-42",
        fallbackFingerprint: "sha256:example",
        officialNeedNo: "NEED-42",
        opportunityType: "inquiry",
        source: "tender_radar",
      }),
    ).toBe("setad:need:NEED-42");
  });

  it("falls back to the source record and then the reviewed fingerprint", () => {
    expect(
      getTenderDedupKey({
        aggregatorRecordId: "RADAR-42",
        fallbackFingerprint: "sha256:example",
        opportunityType: "tender",
        source: "tender_radar",
      }),
    ).toBe("tender_radar:record:RADAR-42");
    expect(
      getTenderDedupKey({
        fallbackFingerprint: "sha256:example",
        opportunityType: "tender",
        source: "manual",
      }),
    ).toBe("fingerprint:sha256:example");
  });

  it("routes users to the correct official portal without encoding credentials", () => {
    expect(getSetadPortalUrl("inquiry")).toBe(
      "https://eproc.setadiran.ir/eproc/entry.do",
    );
    expect(getSetadPortalUrl("tender")).toBe(
      "https://etend.setadiran.ir/etend/index.action",
    );
    expect(getSetadPortalUrl("inquiry")).not.toMatch(
      /password|cookie|captcha|otp/i,
    );
  });

  it("admits only A/B Radar items to the reviewed import queue", () => {
    expect(isRadarImportCandidate("A")).toBe(true);
    expect(isRadarImportCandidate("B")).toBe(true);
    expect(isRadarImportCandidate("C")).toBe(false);
  });
});
