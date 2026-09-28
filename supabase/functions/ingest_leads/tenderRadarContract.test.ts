// @vitest-environment node
import { describe, expect, it } from "vitest";

import { normalizeLead } from "./contract";
import tenderRadarFixtures from "./fixtures/tender-radar-v1.json";
import {
  isTenderRadarReviewCandidate,
  TENDER_RADAR_CONTRACT_VERSION,
  validateTenderRadarPayload,
} from "./tenderRadarContract";

const now = new Date("2026-09-28T10:00:00Z");

describe("Tender Radar sender conformance", () => {
  it("accepts the synthetic A/B/C envelopes without changing raw provenance", () => {
    for (const fixture of tenderRadarFixtures.cases) {
      const normalized = normalizeLead(fixture.request, "tender_radar", now);
      const payload = validateTenderRadarPayload(normalized.raw_payload);

      expect(normalized.source).toBe("tender_radar");
      expect(normalized.source_record_id).toBe(
        fixture.request.source_record_id,
      );
      expect(payload.contract_version).toBe(TENDER_RADAR_CONTRACT_VERSION);
      expect(payload.source_snapshot).toEqual(
        fixture.request.raw_payload.source_snapshot,
      );
      expect(isTenderRadarReviewCandidate(payload)).toBe(
        fixture.review_expectation.eligible,
      );
    }
  });

  it("keeps the Radar ID separate from candidate SETAD identifiers", () => {
    for (const fixture of tenderRadarFixtures.cases) {
      const payload = validateTenderRadarPayload(fixture.request.raw_payload);

      expect(fixture.request.source_record_id).not.toBe(
        payload.official_need_no_candidate,
      );
      expect(fixture.request.source_record_id).not.toBe(
        payload.official_tender_no_candidate,
      );
    }

    const inquiry = tenderRadarFixtures.cases[0];
    expect(() =>
      validateTenderRadarPayload(
        inquiry.request.raw_payload,
        inquiry.request.raw_payload.official_need_no_candidate,
      ),
    ).toThrow(/must remain separate/);
  });

  it("never treats publish date as a deadline", () => {
    for (const fixture of tenderRadarFixtures.cases) {
      const payload = validateTenderRadarPayload(fixture.request.raw_payload);

      expect(fixture.request.deadline).toBe(
        payload.submission_deadline_candidate,
      );
      expect(fixture.request.deadline).not.toBe(payload.publish_date_candidate);
    }

    const inquiry = tenderRadarFixtures.cases[0];
    expect(() =>
      normalizeLead(
        {
          ...inquiry.request,
          deadline: inquiry.request.raw_payload.publish_date_candidate,
        },
        "tender_radar",
        now,
      ),
    ).toThrow(/deadline must match submission_deadline_candidate/);
  });

  it("requires a versioned score and a deterministic lowercase fingerprint", () => {
    const source = tenderRadarFixtures.cases[0].request.raw_payload;

    expect(() =>
      validateTenderRadarPayload({ ...source, scoring_version: "" }),
    ).toThrow(/scoring_version is required/);
    expect(() =>
      validateTenderRadarPayload({ ...source, radar_score: 101 }),
    ).toThrow(/integer from 0 to 100/);
    expect(() =>
      validateTenderRadarPayload({
        ...source,
        fallback_fingerprint: "not-a-hash",
      }),
    ).toThrow(/lowercase SHA-256/);
  });

  it("rejects mixed official identifiers and the wrong SETAD portal", () => {
    const inquiry = tenderRadarFixtures.cases[0].request.raw_payload;

    expect(() =>
      validateTenderRadarPayload({
        ...inquiry,
        official_tender_no_candidate: "SYNTHETIC-TENDER-WRONG",
      }),
    ).toThrow(/inquiry cannot carry a Tender No/);
    expect(() =>
      validateTenderRadarPayload({
        ...inquiry,
        official_source_url_candidate:
          "https://etend.setadiran.ir/etend/index.action",
      }),
    ).toThrow(/official URL does not match/);
    expect(() =>
      validateTenderRadarPayload({
        ...inquiry,
        official_source_url_candidate:
          "https://eproc.setadiran.ir/eproc/entry.do?session_id=private",
      }),
    ).toThrow(/sensitive material: session_id/);
  });

  it("rejects deadline inversion and non-versioned top-level drift", () => {
    const source = tenderRadarFixtures.cases[1].request.raw_payload;

    expect(() =>
      validateTenderRadarPayload({
        ...source,
        submission_deadline_candidate: "2026-09-20",
      }),
    ).toThrow(/cannot precede publish_date_candidate/);
    expect(() =>
      validateTenderRadarPayload({ ...source, invented_field: true }),
    ).toThrow(/Unknown Tender Radar field/);
  });

  it("keeps grade C in quarantine and out of the review/import queue", () => {
    const gradeC = tenderRadarFixtures.cases[2];
    const normalized = normalizeLead(gradeC.request, "tender_radar", now);
    const payload = validateTenderRadarPayload(normalized.raw_payload);

    expect(normalized.status).toBe("new");
    expect(payload.radar_grade).toBe("C");
    expect(isTenderRadarReviewCandidate(payload)).toBe(false);
    expect(gradeC.review_expectation.eligible).toBe(false);
  });

  it("contains only synthetic fixtures and no credential-shaped keys", () => {
    const serialized = JSON.stringify(tenderRadarFixtures);

    expect(serialized).toContain("SYNTHETIC");
    expect(serialized).not.toMatch(
      /authorization|password|credential|cookie|captcha|otp|token/i,
    );
  });
});
