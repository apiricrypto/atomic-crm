import { describe, expect, it } from "vitest";

import functionsSql from "../../../../supabase/schemas/02_functions.sql?raw";
import policiesSql from "../../../../supabase/schemas/05_policies.sql?raw";
import grantsSql from "../../../../supabase/schemas/06_grants.sql?raw";

describe("lead inbox SQL contract", () => {
  it("keeps authenticated ingestion and direct conversion writes closed", () => {
    expect(grantsSql).toMatch(
      /revoke all on table public\.lead_inbox from public, anon, authenticated/i,
    );
    expect(grantsSql).toMatch(
      /revoke all on table public\.lead_conversions from public, anon, authenticated/i,
    );
    expect(grantsSql).not.toMatch(
      /grant\s+insert\s+on\s+table\s+public\.lead_inbox\s+to\s+authenticated/i,
    );
    expect(grantsSql).not.toMatch(
      /grant\s+(?:all|insert|update|delete)\s+on\s+table\s+public\.lead_conversions\s+to\s+authenticated/i,
    );
    expect(grantsSql).toMatch(
      /grant execute on function public\.convert_lead_to_deal[\s\S]+to authenticated/i,
    );
    expect(grantsSql).toMatch(
      /revoke all on function public\.convert_lead_to_deal[\s\S]+from public, anon, authenticated/i,
    );
  });

  it("enables role- and assignment-aware RLS for both lead tables", () => {
    expect(policiesSql).toContain(
      "alter table public.lead_inbox enable row level security",
    );
    expect(policiesSql).toContain(
      "alter table public.lead_conversions enable row level security",
    );
    expect(policiesSql).toMatch(
      /current_staff_role\(\) = 'sales'[\s\S]+assigned_sales_id = public\.current_sales_id\(\)/,
    );
    expect(policiesSql).toMatch(/status <> 'converted'/);
  });

  it("uses a locked security-definer transaction without raw payload copying", () => {
    const functionStart = functionsSql.indexOf(
      'CREATE OR REPLACE FUNCTION "public"."convert_lead_to_deal"',
    );
    const functionSql = functionsSql.slice(functionStart);
    const functionBody = functionSql.match(/AS \$\$([\s\S]+?)\$\$;/)?.[1];

    expect(functionStart).toBeGreaterThan(-1);
    expect(functionBody).toBeTruthy();
    expect(functionBody).toMatch(/FOR UPDATE/);
    expect(functionBody).toMatch(/v_lead\.status <> 'qualified'/);
    expect(functionBody).toMatch(/INSERT INTO public\.lead_conversions/);
    expect(functionBody).toMatch(
      /public\.tender_opportunities[\s\S]+Tender leads must progress through Tender Pipeline/,
    );
    expect(functionBody).toMatch(/'opportunity'/);
    expect(functionBody).not.toMatch(/raw_payload/);
    expect(functionBody).not.toMatch(/estimated_amount/);
    expect(functionBody).not.toMatch(/public\.projects|financial_|inventory_/);
  });
});
