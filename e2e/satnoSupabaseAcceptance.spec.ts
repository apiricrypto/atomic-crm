import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { expect, test } from "./fixtures";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.VITE_SB_PUBLISHABLE_KEY;

if (!supabaseUrl || !publishableKey) {
  throw new Error(
    "SATNO Supabase acceptance requires VITE_SUPABASE_URL and VITE_SB_PUBLISHABLE_KEY",
  );
}

const createPublicClient = () =>
  createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

const signIn = async (
  client: SupabaseClient,
  email: string,
  password: string,
) => {
  const { error } = await client.auth.signInWithPassword({ email, password });
  expect(error).toBeNull();
};

test.describe("SATNO real Supabase persistence and RLS contract", () => {
  test.beforeEach(async ({ isMobile }) => {
    test.skip(
      Boolean(isMobile),
      "The database contract is viewport-independent and runs once in Chromium.",
    );
  });

  test("anonymous access cannot read or create CRM rows", async ({
    createSales,
    createCompany,
  }) => {
    const sales = await createSales({
      first_name: "SATNO",
      last_name: "Admin",
      email: "satno-admin@example.com",
      password: "satno-test-password",
      administrator: true,
    });
    const company = await createCompany({
      name: "SATNO RLS Sentinel",
      salesId: sales.id,
    });

    const anonymous = createPublicClient();
    const readResult = await anonymous
      .from("companies")
      .select("id")
      .eq("id", company.id);
    expect(readResult.error).toBeNull();
    expect(readResult.data).toEqual([]);

    const insertResult = await anonymous
      .from("companies")
      .insert({ name: "Anonymous write must fail" });
    expect(insertResult.error).not.toBeNull();
  });

  test("contact, company, deal and task relationships survive a new session", async ({
    createUser,
  }) => {
    const email = "satno-persistence@example.com";
    const password = "satno-test-password";
    const user = await createUser({ email, password });

    const firstSession = createPublicClient();
    await signIn(firstSession, email, password);

    const salesResult = await firstSession
      .from("sales")
      .select("id")
      .eq("user_id", user.id)
      .single();
    expect(salesResult.error).toBeNull();

    const companyResult = await firstSession
      .from("companies")
      .insert({ name: "SATNO Persistence Company" })
      .select("id, sales_id")
      .single();
    expect(companyResult.error).toBeNull();
    expect(companyResult.data?.sales_id).toBe(salesResult.data?.id);

    const contactResult = await firstSession
      .from("contacts")
      .insert({
        first_name: "Persistence",
        last_name: "Contact",
        company_id: companyResult.data?.id,
        email_jsonb: [],
        phone_jsonb: [],
      })
      .select("id, company_id, sales_id")
      .single();
    expect(contactResult.error).toBeNull();

    const dealResult = await firstSession
      .from("deals")
      .insert({
        name: "SATNO Persistence Deal",
        stage: "opportunity",
        company_id: companyResult.data?.id,
        contact_ids: [contactResult.data?.id],
      })
      .select("id, company_id, contact_ids, sales_id")
      .single();
    expect(dealResult.error).toBeNull();

    const taskResult = await firstSession
      .from("tasks")
      .insert({
        contact_id: contactResult.data?.id,
        type: "call",
        text: "SATNO persistence check",
      })
      .select("id, contact_id, sales_id")
      .single();
    expect(taskResult.error).toBeNull();

    await firstSession.auth.signOut();
    const secondSession = createPublicClient();
    await signIn(secondSession, email, password);

    const [company, contact, deal, task] = await Promise.all([
      secondSession
        .from("companies")
        .select("id, sales_id")
        .eq("id", companyResult.data?.id)
        .single(),
      secondSession
        .from("contacts")
        .select("id, company_id, sales_id")
        .eq("id", contactResult.data?.id)
        .single(),
      secondSession
        .from("deals")
        .select("id, company_id, contact_ids, sales_id")
        .eq("id", dealResult.data?.id)
        .single(),
      secondSession
        .from("tasks")
        .select("id, contact_id, sales_id")
        .eq("id", taskResult.data?.id)
        .single(),
    ]);

    expect(company.error).toBeNull();
    expect(contact.data).toMatchObject({
      company_id: companyResult.data?.id,
      sales_id: salesResult.data?.id,
    });
    expect(deal.data).toMatchObject({
      company_id: companyResult.data?.id,
      contact_ids: [contactResult.data?.id],
      sales_id: salesResult.data?.id,
    });
    expect(task.data).toMatchObject({
      contact_id: contactResult.data?.id,
      sales_id: salesResult.data?.id,
    });
  });

  test("configuration writes are restricted to administrators", async ({
    createSales,
  }) => {
    const password = "satno-test-password";
    await createSales({
      first_name: "Regular",
      last_name: "User",
      email: "satno-regular@example.com",
      password,
    });
    await createSales({
      first_name: "Admin",
      last_name: "User",
      email: "satno-config-admin@example.com",
      password,
      administrator: true,
    });

    const regular = createPublicClient();
    await signIn(regular, "satno-regular@example.com", password);
    const rejected = await regular
      .from("configuration")
      .upsert({ id: 1, config: { satno_acceptance: "rejected" } });
    expect(rejected.error).not.toBeNull();

    const admin = createPublicClient();
    await signIn(admin, "satno-config-admin@example.com", password);
    const accepted = await admin
      .from("configuration")
      .upsert({ id: 1, config: { satno_acceptance: "accepted" } })
      .select("config")
      .single();
    expect(accepted.error).toBeNull();
    expect(accepted.data?.config).toMatchObject({
      satno_acceptance: "accepted",
    });
  });
});
