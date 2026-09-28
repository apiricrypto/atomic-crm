import { describe, expect, it } from "vitest";

import tablesSql from "../../../../supabase/schemas/01_tables.sql?raw";
import policiesSql from "../../../../supabase/schemas/05_policies.sql?raw";
import grantsSql from "../../../../supabase/schemas/06_grants.sql?raw";

describe("Tender & Inquiry Intelligence SQL contract", () => {
  it("keeps official identifiers, aggregator identity and dates separate", () => {
    const start = tablesSql.indexOf("create table public.tender_opportunities");
    const table = tablesSql.slice(
      start,
      tablesSql.indexOf("create table public.tender_pipeline_entries", start),
    );

    expect(start).toBeGreaterThan(-1);
    expect(table).toMatch(/aggregator_record_id text/);
    expect(table).toMatch(/official_need_no text/);
    expect(table).toMatch(/official_tender_no text/);
    expect(table).toMatch(/publish_date date/);
    expect(table).toMatch(/document_deadline date/);
    expect(table).toMatch(/submission_deadline date/);
    expect(table).not.toMatch(/publish_date\s+as|deadline\s+as/i);
  });

  it("models official-first dedup with a fingerprint-only fallback", () => {
    expect(tablesSql).toMatch(
      /unique index tender_opportunities_need_no_key[\s\S]+official_need_no is not null/i,
    );
    expect(tablesSql).toMatch(
      /unique index tender_opportunities_tender_no_key[\s\S]+official_tender_no is not null/i,
    );
    expect(tablesSql).toMatch(
      /tender_opportunities_fallback_fingerprint_key[\s\S]+official_need_no is null and official_tender_no is null and aggregator_record_id is null/i,
    );
  });

  it("enables RLS and keeps all writes server-side in this skeleton", () => {
    for (const table of [
      "tender_opportunities",
      "tender_pipeline_entries",
      "tender_saved_searches",
      "tender_audit_log",
    ]) {
      expect(policiesSql).toContain(
        `alter table public.${table} enable row level security`,
      );
      expect(grantsSql).toMatch(
        new RegExp(
          `revoke all on table public\\.${table} from public, anon, authenticated`,
          "i",
        ),
      );
      expect(grantsSql).not.toMatch(
        new RegExp(
          `grant\\s+(?:all|insert|update|delete)\\s+on\\s+table\\s+public\\.${table}\\s+to\\s+authenticated`,
          "i",
        ),
      );
    }
  });

  it("keeps audit metadata structured without credential columns", () => {
    const start = tablesSql.indexOf("create table public.tender_audit_log");
    const table = tablesSql.slice(start, tablesSql.indexOf(");", start) + 2);
    const columns = table.slice(0, table.indexOf("constraint"));

    expect(table).toMatch(/metadata jsonb/);
    expect(columns).not.toMatch(
      /password|credential|cookie|captcha|otp|token|raw_payload/i,
    );
    expect(table).toMatch(/tender_audit_log_sensitive_keys_check/);
    for (const key of [
      "password",
      "credential",
      "cookie",
      "captcha",
      "otp",
      "token",
      "raw_payload",
    ]) {
      expect(table).toContain(`metadata ? '${key}'`);
    }
  });
});
