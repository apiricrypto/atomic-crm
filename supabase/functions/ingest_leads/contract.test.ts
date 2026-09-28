// @vitest-environment node
import { describe, expect, it } from "vitest";

import { LeadValidationError, normalizeLead } from "./contract";

const now = new Date("2026-09-28T08:00:00.000Z");

const validLead = {
  captured_at: "2026-09-28T07:30:00+00:00",
  contact_email: " Sales@Example.COM ",
  deadline: "2026-10-01",
  estimated_amount: 1_500_000,
  estimated_currency: "IRR",
  organization_name: " شرکت نمونه ",
  priority: "high",
  raw_payload: { provider_id: 42, untouched: true },
  source_record_id: " SETAD-42 ",
  source_url: "https://eproc.example.test/item/42",
  title: " استعلام پنل خورشیدی ",
};

describe("lead ingestion contract", () => {
  it("normalizes reviewed fields while deriving source and new status", () => {
    expect(normalizeLead(validLead, "tender_radar", now)).toMatchObject({
      captured_at: "2026-09-28T07:30:00.000Z",
      contact_email: "sales@example.com",
      estimated_amount: 1_500_000,
      estimated_currency: "IRR",
      organization_name: "شرکت نمونه",
      priority: "high",
      raw_payload: { provider_id: 42, untouched: true },
      source: "tender_radar",
      source_record_id: "SETAD-42",
      status: "new",
      title: "استعلام پنل خورشیدی",
    });
  });

  it("rejects fields that could bypass quarantine or conversion", () => {
    for (const field of [
      "status",
      "assigned_sales_id",
      "company_id",
      "deal_id",
    ]) {
      expect(() =>
        normalizeLead(
          { ...validLead, [field]: "qualified" },
          "tender_radar",
          now,
        ),
      ).toThrow(new RegExp(`Unknown field: ${field}`));
    }
  });

  it("requires a stable source record ID, title, capture time and raw object", () => {
    for (const field of ["source_record_id", "title", "captured_at"]) {
      const invalid = { ...validLead, [field]: "" };
      expect(() => normalizeLead(invalid, "bale_market", now)).toThrow(
        LeadValidationError,
      );
    }
    expect(() =>
      normalizeLead({ ...validLead, raw_payload: [] }, "bale_market", now),
    ).toThrow(/raw_payload must be a JSON object/);
  });

  it("requires paired non-negative safe-integer estimates and ISO currency", () => {
    expect(() =>
      normalizeLead(
        { ...validLead, estimated_currency: null },
        "tender_radar",
        now,
      ),
    ).toThrow(/estimated_currency/);
    expect(() =>
      normalizeLead(
        { ...validLead, estimated_amount: -1 },
        "tender_radar",
        now,
      ),
    ).toThrow(/non-negative/);
    expect(() =>
      normalizeLead(
        { ...validLead, estimated_currency: "irr" },
        "tender_radar",
        now,
      ),
    ).toThrow(/uppercase/);
  });

  it("rejects unsafe source URLs, invalid dates and future timestamps", () => {
    expect(() =>
      normalizeLead(
        { ...validLead, source_url: "javascript:alert(1)" },
        "tender_radar",
        now,
      ),
    ).toThrow(/HTTP or HTTPS/);
    expect(() =>
      normalizeLead(
        { ...validLead, deadline: "2026-02-31" },
        "tender_radar",
        now,
      ),
    ).toThrow(/deadline is invalid/);
    expect(() =>
      normalizeLead(
        { ...validLead, captured_at: "2026-09-28" },
        "tender_radar",
        now,
      ),
    ).toThrow(/ISO timestamp with timezone/);
    expect(() =>
      normalizeLead(
        { ...validLead, captured_at: "2026-09-28T08:06:00Z" },
        "tender_radar",
        now,
      ),
    ).toThrow(/future/);
  });

  it("limits the quarantined raw payload", () => {
    expect(() =>
      normalizeLead(
        { ...validLead, raw_payload: { text: "x".repeat(65 * 1024) } },
        "bale_market",
        now,
      ),
    ).toThrow(/raw_payload is too large/);
  });
});
