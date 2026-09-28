import { describe, expect, it } from "vitest";

import { buildLeadInboxRecord, createCrmDb } from "@/test/StoryWrapper";
import { convertLeadInMemory } from "./conversion";

const input = {
  company_name: "شرکت تبدیل‌شده",
  contact_first_name: "احمد",
  contact_last_name: "پیری",
  deal_amount: 2_000_000,
  deal_name: "فرصت خورشیدی",
  lead_id: 1,
};

describe("lead conversion", () => {
  it("atomically creates core records only after explicit qualification", () => {
    const db = createCrmDb({ lead_inbox: [buildLeadInboxRecord()] });

    const result = convertLeadInMemory({
      actorRole: "sales",
      actorSalesId: 0,
      db,
      input,
      now: "2026-09-28T06:00:00.000Z",
    });

    expect(result).toMatchObject({
      company_id: 1,
      contact_id: 1,
      deal_id: 1,
      lead_id: 1,
    });
    expect(db.companies).toHaveLength(1);
    expect(db.contacts).toHaveLength(1);
    expect(db.deals).toHaveLength(1);
    expect(db.lead_conversions).toHaveLength(1);
    expect(db.lead_inbox[0].status).toBe("converted");
    expect(db.deals[0].stage).toBe("opportunity");
  });

  it("does not mutate core data for unqualified or duplicate attempts", () => {
    const db = createCrmDb({
      lead_inbox: [buildLeadInboxRecord({ status: "new" })],
    });
    const before = structuredClone(db);

    expect(() =>
      convertLeadInMemory({
        actorRole: "sales",
        actorSalesId: 0,
        db,
        input,
      }),
    ).toThrow(/qualified/);
    expect(db).toEqual(before);

    db.lead_inbox[0].status = "qualified";
    convertLeadInMemory({ actorRole: "sales", actorSalesId: 0, db, input });
    expect(() =>
      convertLeadInMemory({
        actorRole: "sales",
        actorSalesId: 0,
        db,
        input,
      }),
    ).toThrow(/qualified|already/);
    expect(db.companies).toHaveLength(1);
    expect(db.deals).toHaveLength(1);
  });

  it("does not copy raw payload or estimated value implicitly", () => {
    const db = createCrmDb({
      lead_inbox: [
        buildLeadInboxRecord({
          estimated_amount: 9_999_999,
          raw_payload: { secret_untrusted_field: "do-not-copy" },
        }),
      ],
    });

    convertLeadInMemory({
      actorRole: "manager",
      actorSalesId: 0,
      db,
      input: { ...input, deal_amount: null },
    });

    expect(db.deals[0].amount).toBe(0);
    expect(JSON.stringify(db.companies[0])).not.toContain("do-not-copy");
    expect(JSON.stringify(db.deals[0])).not.toContain("do-not-copy");
  });

  it("rejects an unauthorized role and another salesperson's assignment", () => {
    const assignedLead = buildLeadInboxRecord({ assigned_sales_id: 7 });
    const db = createCrmDb({ lead_inbox: [assignedLead] });
    const before = structuredClone(db);

    expect(() =>
      convertLeadInMemory({
        actorRole: "viewer",
        actorSalesId: 7,
        db,
        input,
      }),
    ).toThrow(/role/);
    expect(() =>
      convertLeadInMemory({
        actorRole: "sales",
        actorSalesId: 8,
        db,
        input,
      }),
    ).toThrow(/another salesperson/);
    expect(db).toEqual(before);
  });

  it("does not create an empty contact", () => {
    const db = createCrmDb({ lead_inbox: [buildLeadInboxRecord()] });

    const result = convertLeadInMemory({
      actorRole: "manager",
      actorSalesId: 0,
      db,
      input: {
        company_name: input.company_name,
        deal_name: input.deal_name,
        lead_id: input.lead_id,
      },
    });

    expect(result.contact_id).toBeNull();
    expect(db.contacts).toHaveLength(0);
    expect(db.deals[0].contact_ids).toEqual([]);
  });
});
