import { describe, expect, it } from "vitest";

import { buildLeadInboxRecord } from "@/test/StoryWrapper";
import { calculateLeadTriageScore, getSafeLeadSourceUrl } from "./triage";

describe("lead inbox triage", () => {
  it("derives an attention score without mutating the raw lead", () => {
    const lead = buildLeadInboxRecord();
    const before = structuredClone(lead);

    expect(calculateLeadTriageScore(lead)).toBe(90);
    expect(lead).toEqual(before);
  });

  it("does not treat a score as automatic qualification", () => {
    const lead = buildLeadInboxRecord({ status: "new" });

    expect(calculateLeadTriageScore(lead)).toBeGreaterThan(0);
    expect(lead.status).toBe("new");
  });

  it("allows only HTTP source links", () => {
    expect(getSafeLeadSourceUrl("https://example.test/a")).toBe(
      "https://example.test/a",
    );
    expect(getSafeLeadSourceUrl("javascript:alert(1)")).toBeNull();
    expect(getSafeLeadSourceUrl("not a url")).toBeNull();
  });
});
