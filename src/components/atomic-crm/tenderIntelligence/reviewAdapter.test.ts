import { buildLeadInboxRecord } from "@/test/StoryWrapper";
import tenderRadarFixtures from "../../../../supabase/functions/ingest_leads/fixtures/tender-radar-v1.json";

import { buildTenderRadarReviewCandidate } from "./reviewAdapter";

const buildFixtureLead = (fixtureIndex: number) => {
  const fixture = tenderRadarFixtures.cases[fixtureIndex].request;
  return buildLeadInboxRecord({
    city: fixture.city,
    deadline: fixture.deadline,
    description: fixture.description,
    organization_name: fixture.organization_name,
    province: fixture.province,
    raw_payload: fixture.raw_payload,
    source_record_id: fixture.source_record_id,
    source_url: fixture.source_url,
    title: fixture.title,
  });
};

describe("Tender Radar human review adapter", () => {
  it("maps only allow-listed A/B assertions and defaults verification to pending", () => {
    const candidate = buildTenderRadarReviewCandidate(buildFixtureLead(0));

    expect(candidate).toMatchObject({
      grade: "A",
      score: 91,
      review: {
        domain: "renewable_energy",
        official_need_no: "SYNTHETIC-NEED-1001",
        official_tender_no: null,
        opportunity_type: "inquiry",
        publish_date: "2026-09-27",
        document_deadline: "2026-10-10",
        submission_deadline: "2026-10-15",
        verification_status: "pending_setad_verification",
      },
    });
    expect(candidate?.review).not.toHaveProperty("source_snapshot");
    expect(candidate?.review).not.toHaveProperty("contract_version");
    expect(candidate?.review).not.toHaveProperty("scoring_version");
  });

  it("keeps publication and deadline candidates in separate fields", () => {
    const candidate = buildTenderRadarReviewCandidate(buildFixtureLead(1));

    expect(candidate?.review.publish_date).not.toBe(
      candidate?.review.submission_deadline,
    );
    expect(candidate?.review.document_deadline).not.toBe(
      candidate?.review.publish_date,
    );
  });

  it("never carries the quarantined source snapshot into RPC input", () => {
    const lead = buildFixtureLead(0);
    lead.raw_payload = {
      ...lead.raw_payload,
      source_snapshot: {
        arbitrary_provider_data: "quarantined",
        nested: { value: "must-not-cross-boundary" },
      },
    };

    const serialized = JSON.stringify(
      buildTenderRadarReviewCandidate(lead)?.review,
    );
    expect(serialized).not.toContain("quarantined");
    expect(serialized).not.toContain("must-not-cross-boundary");
  });

  it("keeps C-grade and malformed payloads out of human import", () => {
    expect(buildTenderRadarReviewCandidate(buildFixtureLead(2))).toBeNull();

    const malformed = buildFixtureLead(0);
    malformed.raw_payload = {
      ...malformed.raw_payload,
      official_tender_no_candidate: "WRONG-TYPE",
    };
    expect(buildTenderRadarReviewCandidate(malformed)).toBeNull();
  });
});
