import { describe, expect, it } from "vitest";

import tablesSql from "../../../../supabase/schemas/01_tables.sql?raw";
import functionsSql from "../../../../supabase/schemas/02_functions.sql?raw";
import triggersSql from "../../../../supabase/schemas/04_triggers.sql?raw";
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

  it("imports a qualified A/B Radar lead through one guarded transaction", () => {
    const start = functionsSql.indexOf(
      'CREATE OR REPLACE FUNCTION "public"."import_tender_opportunity"',
    );
    const functionBody = functionsSql
      .slice(start)
      .match(/AS \$\$([\s\S]+?)\$\$;/)?.[1];

    expect(start).toBeGreaterThan(-1);
    expect(functionBody).toBeTruthy();
    expect(functionBody).toMatch(/SECURITY DEFINER|current_staff_role/);
    expect(functionBody).toMatch(/FOR UPDATE/);
    expect(functionBody).toMatch(/v_lead\.source <> 'tender_radar'/);
    expect(functionBody).toMatch(/v_lead\.status <> 'qualified'/);
    expect(functionBody).toMatch(
      /UPDATE public\.lead_inbox[\s\S]+assigned_sales_id = v_assigned_sales_id/,
    );
    expect(functionBody).toMatch(
      /v_radar_grade IS NULL[\s\S]+v_radar_grade NOT IN \('A', 'B'\)/,
    );
    expect(functionBody).toMatch(/pg_advisory_xact_lock/);
    expect(functionBody).toMatch(/official_need_no[\s\S]+official_tender_no/);
    expect(functionBody).toMatch(
      /eproc\.setadiran\.ir[\s\S]+etend\.setadiran\.ir/,
    );
    expect(functionBody).toMatch(/source_record_id[\s\S]+fallback_fingerprint/);
    expect(functionBody).toMatch(/INSERT INTO public\.tender_opportunities/);
    expect(functionBody).toMatch(/INSERT INTO public\.tender_pipeline_entries/);
    expect(functionBody).toMatch(/INSERT INTO public\.tender_audit_log/);
    expect(functionBody).not.toMatch(
      /v_lead\.raw_payload|public\.companies|public\.contacts|public\.deals|public\.projects|financial_|inventory_/,
    );
  });

  it("allow-lists reviewed fields and keeps direct table writes closed", () => {
    const start = functionsSql.indexOf(
      'CREATE OR REPLACE FUNCTION "public"."import_tender_opportunity"',
    );
    const functionBody = functionsSql
      .slice(start)
      .match(/AS \$\$([\s\S]+?)\$\$;/)?.[1];

    expect(functionBody).toMatch(/v_allowed_keys constant text\[\]/);
    expect(functionBody).toMatch(/unsupported field/);
    expect(functionBody).toMatch(/review fields must be scalar values/);
    expect(functionBody).not.toMatch(
      /'password'|'credential'|'cookie'|'captcha'|'otp'|'token'|'raw_payload'/,
    );
    expect(grantsSql).toMatch(
      /revoke all on function public\.import_tender_opportunity\(bigint, jsonb\) from public, anon, authenticated/i,
    );
    expect(grantsSql).toMatch(
      /grant execute on function public\.import_tender_opportunity\(bigint, jsonb\) to authenticated/i,
    );
    expect(grantsSql).not.toMatch(
      /grant\s+(?:all|insert|update|delete)\s+on\s+table\s+public\.tender_(?:opportunities|pipeline_entries|audit_log)\s+to\s+authenticated/i,
    );
  });

  it("makes Radar provenance immutable and audit events append-only", () => {
    expect(functionsSql).toMatch(
      /prevent_tender_provenance_mutation[\s\S]+OLD\.lead_id IS DISTINCT FROM NEW\.lead_id[\s\S]+OLD\.source IS DISTINCT FROM NEW\.source[\s\S]+OLD\.aggregator_record_id IS DISTINCT FROM NEW\.aggregator_record_id/,
    );
    expect(functionsSql).toMatch(
      /prevent_tender_audit_mutation[\s\S]+Tender audit events are append-only/,
    );
    expect(triggersSql).toMatch(
      /before update of lead_id, source, aggregator_record_id on public\.tender_opportunities/,
    );
    expect(triggersSql).toMatch(
      /before update or delete on public\.tender_audit_log/,
    );
  });
});
