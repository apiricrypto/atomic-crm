import type { StaffRole } from "../providers/commons/staffRoles";
import type { Db } from "../providers/fakerest/dataGenerator/types";
import type {
  Company,
  Contact,
  Deal,
  LeadConversion,
  LeadConversionInput,
  LeadConversionResult,
} from "../types";

const nextNumericId = (records: Array<{ id: unknown }>) =>
  records.reduce(
    (largest, record) =>
      typeof record.id === "number" ? Math.max(largest, record.id) : largest,
    0,
  ) + 1;

const requiredText = (value: string, field: string) => {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} is required`);
  return normalized;
};

const optionalText = (value?: string | null) => value?.trim() || null;

/**
 * FakeRest-only transaction simulator. All records are validated and built
 * before the shared fixture DB is changed, mirroring the atomic SQL RPC.
 */
export const convertLeadInMemory = ({
  actorRole,
  actorSalesId,
  db,
  input,
  now = new Date().toISOString(),
}: {
  actorRole: StaffRole;
  actorSalesId: number;
  db: Db;
  input: LeadConversionInput;
  now?: string;
}): LeadConversionResult => {
  if (!(["admin", "manager", "sales"] as StaffRole[]).includes(actorRole)) {
    throw new Error("Lead conversion is not allowed for this role");
  }

  const lead = db.lead_inbox.find((record) => record.id === input.lead_id);
  if (!lead) throw new Error("Lead not found");
  if (lead.status !== "qualified") {
    throw new Error("Only qualified leads can be converted");
  }
  if (
    actorRole === "sales" &&
    lead.assigned_sales_id != null &&
    lead.assigned_sales_id !== actorSalesId
  ) {
    throw new Error("Lead is assigned to another salesperson");
  }
  if (db.lead_conversions.some((record) => record.lead_id === lead.id)) {
    throw new Error("Lead has already been converted");
  }
  if (input.deal_amount != null && input.deal_amount < 0) {
    throw new Error("Deal amount cannot be negative");
  }

  const companyName = requiredText(input.company_name, "company_name");
  const dealName = requiredText(input.deal_name, "deal_name");
  const firstName = optionalText(input.contact_first_name);
  const lastName = optionalText(input.contact_last_name);
  const email = optionalText(input.contact_email);
  const phone = optionalText(input.contact_phone);
  const shouldCreateContact = Boolean(firstName || lastName || email || phone);

  const companyId = nextNumericId(db.companies);
  const contactId = shouldCreateContact ? nextNumericId(db.contacts) : null;
  const dealId = nextNumericId(db.deals);
  const conversionId = nextNumericId(db.lead_conversions);

  const company: Company = {
    address: "",
    city: "",
    country: "",
    created_at: now,
    description: "",
    id: companyId,
    linkedin_url: "",
    logo: { src: "", title: companyName } as Company["logo"],
    name: companyName,
    phone_number: "",
    revenue: "",
    sales_id: actorSalesId,
    sector: "",
    size: 1,
    state_abbr: "",
    tax_identifier: "",
    website: "",
    zipcode: "",
  };

  const contact: Contact | null = shouldCreateContact
    ? {
        background: "",
        company_id: companyId,
        company_name: companyName,
        email_jsonb: email ? [{ email, type: "Work" }] : [],
        first_name: firstName ?? "",
        first_seen: now,
        gender: "",
        has_newsletter: false,
        id: contactId!,
        last_name: lastName ?? "",
        last_seen: now,
        linkedin_url: null,
        nb_tasks: 0,
        phone_jsonb: phone ? [{ number: phone, type: "Work" }] : [],
        sales_id: actorSalesId,
        status: "warm",
        tags: [],
        title: "",
      }
    : null;

  const deal: Deal = {
    amount: input.deal_amount ?? 0,
    archived_at: undefined,
    category: "other",
    company_id: companyId,
    contact_ids: contact ? [contact.id] : [],
    created_at: now,
    description: optionalText(input.deal_description) ?? "",
    expected_closing_date: input.expected_closing_date ?? "",
    id: dealId,
    index: 0,
    name: dealName,
    sales_id: actorSalesId,
    stage: "opportunity",
    updated_at: now,
  };

  const conversion: LeadConversion = {
    company_id: company.id,
    contact_id: contact?.id ?? null,
    converted_at: now,
    converted_by_sales_id: actorSalesId,
    deal_id: deal.id,
    id: conversionId,
    lead_id: lead.id,
  };

  db.companies.push(company);
  if (contact) db.contacts.push(contact);
  db.deals.push(deal);
  db.lead_conversions.push(conversion);
  Object.assign(lead, {
    assigned_sales_id: lead.assigned_sales_id ?? actorSalesId,
    status: "converted",
    updated_at: now,
  });

  return {
    company_id: company.id,
    contact_id: contact?.id ?? null,
    conversion_id: conversion.id,
    deal_id: deal.id,
    lead_id: lead.id,
  };
};
