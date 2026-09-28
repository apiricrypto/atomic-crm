// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import type { LeadInsert } from "./contract";
import { createIdempotentLeadStore } from "./store";

const lead = {
  captured_at: "2026-09-28T07:30:00.000Z",
  city: null,
  contact_email: null,
  contact_name: null,
  contact_phone: null,
  deadline: null,
  description: null,
  estimated_amount: null,
  estimated_currency: null,
  organization_name: null,
  priority: "normal",
  province: null,
  raw_payload: { untouched: true },
  source: "tender_radar",
  source_record_id: "SETAD-100",
  source_url: null,
  status: "new",
  title: "فرصت خورشیدی",
} satisfies LeadInsert;

const record = {
  created_at: "2026-09-28T07:31:00.000Z",
  id: 100,
  source: "tender_radar",
  source_record_id: "SETAD-100",
  status: "new",
};

describe("idempotent lead store", () => {
  it("returns a newly inserted record without a lookup", async () => {
    const insert = vi.fn(async () => ({ data: record, error: null }));
    const findBySourceKey = vi.fn();
    const store = createIdempotentLeadStore({ findBySourceKey, insert });

    await expect(store.insert(lead)).resolves.toEqual({
      duplicate: false,
      record,
    });
    expect(findBySourceKey).not.toHaveBeenCalled();
  });

  it("returns the existing record after a unique-key collision", async () => {
    const insert = vi.fn(async () => ({
      data: null,
      error: { code: "23505" },
    }));
    const findBySourceKey = vi.fn(async () => ({ data: record, error: null }));
    const store = createIdempotentLeadStore({ findBySourceKey, insert });

    await expect(store.insert(lead)).resolves.toEqual({
      duplicate: true,
      record,
    });
    expect(insert).toHaveBeenCalledTimes(1);
    expect(findBySourceKey).toHaveBeenCalledWith("tender_radar", "SETAD-100");
  });

  it("does not hide non-idempotency database errors", async () => {
    const databaseError = { code: "42501" };
    const store = createIdempotentLeadStore({
      findBySourceKey: vi.fn(),
      insert: vi.fn(async () => ({ data: null, error: databaseError })),
    });

    await expect(store.insert(lead)).rejects.toBe(databaseError);
  });

  it("fails if a duplicate cannot be read back", async () => {
    const lookupError = { code: "PGRST116" };
    const store = createIdempotentLeadStore({
      findBySourceKey: vi.fn(async () => ({
        data: null,
        error: lookupError,
      })),
      insert: vi.fn(async () => ({ data: null, error: { code: "23505" } })),
    });

    await expect(store.insert(lead)).rejects.toBe(lookupError);
  });
});
