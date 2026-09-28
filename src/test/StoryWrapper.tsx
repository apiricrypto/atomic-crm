/* eslint-disable react-refresh/only-export-components */
import { memoryStore, type AuthProvider, type CoreAdminProps } from "ra-core";
import { useEffect, useMemo, type ReactNode } from "react";
import { MemoryRouter } from "react-router";
import cloneDeep from "lodash/cloneDeep";
import { Notification } from "@/components/admin/notification";
import { createDataProvider } from "@/components/atomic-crm/providers/fakerest";
import { DEFAULT_USER } from "@/components/atomic-crm/providers/fakerest/authProvider";
import type { Db } from "@/components/atomic-crm/providers/fakerest/dataGenerator/types";
import type {
  Company,
  Contact,
  DailyWorkReport,
  Deal,
  FinancialPayable,
  FinancialReceivable,
  FinancialTransaction,
  InventoryItem,
  InventoryLocation,
  InventoryMovement,
  LeadConversion,
  LeadInboxRecord,
  Project,
  ProjectCostItem,
  ProcurementCommitment,
  Sale,
  TenderAuditEvent,
  TenderOpportunity,
  TenderPipelineEntry,
  TenderSavedSearch,
} from "@/components/atomic-crm/types";
import { DataImportProvider } from "@/components/atomic-crm/dataImport/DataImportProvider";
import { CRM } from "@/components/atomic-crm/root/CRM";
import { testI18nProvider } from "@/components/atomic-crm/providers/commons/i18nProvider";

export const createTestAuthProvider = (): AuthProvider => ({
  canAccess: async () => true,
  checkAuth: async () => undefined,
  checkError: async () => undefined,
  getIdentity: async () => ({
    avatar: DEFAULT_USER.avatar.src,
    fullName: `${DEFAULT_USER.first_name} ${DEFAULT_USER.last_name}`,
    id: DEFAULT_USER.id,
  }),
  login: async () => undefined,
  logout: async () => undefined,
});

const baseSale: Sale = {
  administrator: true,
  role: "admin",
  avatar: DEFAULT_USER.avatar as Sale["avatar"],
  disabled: false,
  email: DEFAULT_USER.email,
  first_name: DEFAULT_USER.first_name,
  id: DEFAULT_USER.id,
  last_name: DEFAULT_USER.last_name,
  password: DEFAULT_USER.password,
  user_id: DEFAULT_USER.id.toString(),
};

// Provide a minimal FakeRest database shape so tests can override only the records
// that matter for each scenario.
export const createCrmDb = (overrides: Partial<Db> = {}): Db =>
  ({
    companies: [],
    configuration: [{ config: {}, id: 1 }],
    contact_notes: [],
    contacts: [],
    daily_work_reports: [],
    deal_notes: [],
    deals: [],
    financial_payables: [],
    financial_receivables: [],
    financial_transactions: [],
    inventory_items: [],
    inventory_locations: [],
    inventory_movements: [],
    lead_conversions: [],
    lead_inbox: [],
    projects: [],
    project_cost_items: [],
    procurement_commitments: [],
    sales: [baseSale],
    tags: [],
    tasks: [],
    tender_audit_log: [],
    tender_opportunities: [],
    tender_pipeline_entries: [],
    tender_saved_searches: [],
    ...overrides,
  }) as Db;

export const buildSale = (overrides: Partial<Sale> = {}): Sale => ({
  ...baseSale,
  ...overrides,
});

export const buildDailyWorkReport = (
  overrides: Partial<DailyWorkReport> = {},
): DailyWorkReport => ({
  achievements: "پیگیری پروژه و هماهنگی با تیم انجام شد.",
  blockers: "",
  created_at: "2026-09-27T13:30:00.000Z",
  id: 1,
  minutes_worked: 420,
  next_steps: "تکمیل اقدامات برنامه‌ریزی‌شده.",
  sales_id: 0,
  work_date: "2026-09-27",
  ...overrides,
});

export const buildCompany = (overrides: Partial<Company> = {}): Company => ({
  address: "1 Infinite Loop",
  city: "Cupertino",
  country: "USA",
  created_at: "2025-01-01T09:00:00.000Z",
  description: "",
  id: 1,
  linkedin_url: "",
  logo: { src: "", title: "logo" } as Company["logo"],
  name: "Acme",
  phone_number: "",
  revenue: "",
  sales_id: 0,
  sector: "Tech",
  size: 10,
  state_abbr: "CA",
  tax_identifier: "",
  website: "",
  zipcode: "95014",
  ...overrides,
});

// Build a valid contact record with sensible defaults to keep tests and stories terse.
export const buildContact = (overrides: Partial<Contact> = {}): Contact => ({
  background: "",
  company_id: null,
  company_name: undefined,
  email_jsonb: [{ email: "ada@example.com", type: "Work" }],
  first_name: "Ada",
  first_seen: "2025-01-01T09:00:00.000Z",
  gender: "female",
  has_newsletter: false,
  id: 1,
  last_name: "Lovelace",
  last_seen: "2025-01-02T10:00:00.000Z",
  linkedin_url: null,
  nb_tasks: 0,
  phone_jsonb: [],
  sales_id: 0,
  status: "warm",
  tags: [],
  title: "CTO",
  ...overrides,
});

export const buildDeal = (overrides: Partial<Deal> = {}): Deal => ({
  amount: 1000,
  archived_at: undefined,
  category: "Other",
  company_id: 1,
  contact_ids: [],
  created_at: "2025-01-01T09:00:00.000Z",
  description: "",
  expected_closing_date: "2025-02-01T09:00:00.000Z",
  id: 1,
  index: 0,
  name: "Acme deal",
  sales_id: 0,
  stage: "opportunity",
  updated_at: "2025-01-01T09:00:00.000Z",
  ...overrides,
});

export const buildProject = (overrides: Partial<Project> = {}): Project => ({
  code: "SATNO-0001",
  company_id: 1,
  completed_at: null,
  contract_amount: 1_000_000,
  created_at: "2025-01-01T09:00:00.000Z",
  currency: "IRR",
  deal_id: 1,
  id: 1,
  name: "پروژه هیبریدی",
  sales_id: 0,
  start_date: "2025-02-01",
  status: "active",
  target_end_date: "2025-05-01",
  updated_at: "2025-01-01T09:00:00.000Z",
  ...overrides,
});

export const buildProjectCostItem = (
  overrides: Partial<ProjectCostItem> = {},
): ProjectCostItem => ({
  actual_amount: 300_000,
  category: "equipment",
  created_at: "2025-01-01T09:00:00.000Z",
  currency: "IRR",
  description: "تجهیزات اصلی",
  id: 1,
  planned_amount: 350_000,
  project_id: 1,
  sales_id: 0,
  updated_at: "2025-01-01T09:00:00.000Z",
  ...overrides,
});

export const buildProcurementCommitment = (
  overrides: Partial<ProcurementCommitment> = {},
): ProcurementCommitment => ({
  amount: 420_000,
  created_at: "2025-01-01T09:00:00.000Z",
  currency: "IRR",
  expected_on: "2025-03-01",
  id: 1,
  notes: null,
  project_cost_item_id: 1,
  project_id: 1,
  received_on: null,
  reference: "SATNO-PO-0001",
  sales_id: 0,
  status: "approved",
  supplier_company_id: 2,
  updated_at: "2025-01-01T09:00:00.000Z",
  ...overrides,
});

export const buildFinancialReceivable = (
  overrides: Partial<FinancialReceivable> = {},
): FinancialReceivable => ({
  amount: 1_000_000,
  cancelled_at: null,
  company_id: 1,
  created_at: "2025-01-01T09:00:00.000Z",
  currency: "IRR",
  due_on: "2025-03-01",
  id: 1,
  issued_on: "2025-01-01",
  notes: null,
  project_id: 1,
  reference: "SATNO-AR-0001",
  sales_id: 0,
  updated_at: "2025-01-01T09:00:00.000Z",
  ...overrides,
});

export const buildFinancialPayable = (
  overrides: Partial<FinancialPayable> = {},
): FinancialPayable => ({
  amount: 800_000,
  cancelled_at: null,
  company_id: 2,
  created_at: "2025-01-01T09:00:00.000Z",
  currency: "IRR",
  due_on: "2025-03-01",
  id: 1,
  issued_on: "2025-01-01",
  notes: null,
  procurement_commitment_id: 1,
  project_id: 1,
  reference: "SATNO-AP-0001",
  sales_id: 0,
  updated_at: "2025-01-01T09:00:00.000Z",
  ...overrides,
});

export const buildFinancialTransaction = (
  overrides: Partial<FinancialTransaction> = {},
): FinancialTransaction => ({
  amount: 400_000,
  created_at: "2025-01-15T09:00:00.000Z",
  currency: "IRR",
  direction: "inflow",
  id: 1,
  method: "bank",
  notes: null,
  occurred_at: "2025-01-15T09:00:00.000Z",
  payable_id: null,
  receivable_id: 1,
  reference: "SATNO-RCPT-0001",
  sales_id: 0,
  ...overrides,
});

export const buildInventoryLocation = (
  overrides: Partial<InventoryLocation> = {},
): InventoryLocation => ({
  active: true,
  code: "AHV-MAIN",
  created_at: "2025-01-01T09:00:00.000Z",
  id: 1,
  name: "انبار مرکزی اهواز",
  updated_at: "2025-01-01T09:00:00.000Z",
  ...overrides,
});

export const buildInventoryItem = (
  overrides: Partial<InventoryItem> = {},
): InventoryItem => ({
  active: true,
  created_at: "2025-01-01T09:00:00.000Z",
  id: 1,
  name: "پنل خورشیدی ترینا ۷۱۵ وات",
  reorder_level: 50,
  sku: "PV-TRINA-715",
  unit: "piece",
  updated_at: "2025-01-01T09:00:00.000Z",
  ...overrides,
});

export const buildInventoryMovement = (
  overrides: Partial<InventoryMovement> = {},
): InventoryMovement => ({
  created_at: "2025-01-15T09:00:00.000Z",
  id: 1,
  item_id: 1,
  location_id: 1,
  notes: null,
  occurred_at: "2025-01-15T09:00:00.000Z",
  procurement_commitment_id: null,
  project_id: null,
  quantity: 100,
  reference: "SATNO-GR-0001",
  sales_id: 0,
  type: "receipt",
  ...overrides,
});

export const buildLeadInboxRecord = (
  overrides: Partial<LeadInboxRecord> = {},
): LeadInboxRecord => ({
  assigned_sales_id: 0,
  captured_at: "2026-09-28T05:00:00.000Z",
  city: "اهواز",
  contact_email: null,
  contact_name: "واحد تدارکات",
  contact_phone: "09120000000",
  created_at: "2026-09-28T05:00:00.000Z",
  deadline: "2026-10-05",
  description: "استعلام تأمین تجهیزات سامانه خورشیدی",
  estimated_amount: 4_500_000_000,
  estimated_currency: "IRR",
  id: 1,
  organization_name: "سازمان نمونه خوزستان",
  priority: "high",
  province: "خوزستان",
  raw_payload: { fixture: true },
  source: "tender_radar",
  source_record_id: "SETAD-TEST-0001",
  source_url: "https://example.test/leads/SETAD-TEST-0001",
  status: "qualified",
  title: "تأمین تجهیزات خورشیدی",
  updated_at: "2026-09-28T05:00:00.000Z",
  ...overrides,
});

export const buildLeadConversion = (
  overrides: Partial<LeadConversion> = {},
): LeadConversion => ({
  company_id: 1,
  contact_id: 1,
  converted_at: "2026-09-28T06:00:00.000Z",
  converted_by_sales_id: 0,
  deal_id: 1,
  id: 1,
  lead_id: 1,
  ...overrides,
});

export const buildTenderOpportunity = (
  overrides: Partial<TenderOpportunity> = {},
): TenderOpportunity => ({
  aggregator_record_id: "RADAR-SYNTHETIC-1",
  assigned_sales_id: 0,
  city: "اهواز",
  created_at: "2026-09-28T08:00:00.000Z",
  description: "رکورد ساختگی برای آزمون رابط خط لوله",
  domain: "renewable_energy",
  fallback_fingerprint: "synthetic-fingerprint-1",
  id: 51,
  lead_id: 41,
  opportunity_type: "inquiry",
  organizer: "سازمان نمونه خوزستان",
  province: "خوزستان",
  radar_grade: "A",
  radar_score: 91,
  source: "tender_radar",
  title: "استعلام ساختگی تجهیزات خورشیدی",
  updated_at: "2026-09-28T08:00:00.000Z",
  verification_status: "pending_setad_verification",
  ...overrides,
});

export const buildTenderPipelineEntry = (
  overrides: Partial<TenderPipelineEntry> = {},
): TenderPipelineEntry => ({
  assigned_sales_id: 0,
  created_at: "2026-09-28T08:00:00.000Z",
  documents_status: "not_started",
  id: 61,
  notes: null,
  opportunity_id: 51,
  participation_decision: "undecided",
  pricing_status: "not_started",
  result_status: "pending",
  stage: "documents",
  technical_review_status: "not_started",
  updated_at: "2026-09-28T08:00:00.000Z",
  ...overrides,
});

export const buildTenderAuditEvent = (
  overrides: Partial<TenderAuditEvent> = {},
): TenderAuditEvent => ({
  actor_sales_id: 0,
  created_at: "2026-09-28T08:30:00.000Z",
  event_type: "pipeline_transitioned",
  id: 71,
  metadata: {
    after: { documents_status: "requested", stage: "documents" },
    before: { documents_status: "not_started", stage: "documents" },
    notes_changed: false,
  },
  opportunity_id: 51,
  ...overrides,
});

export const buildTenderSavedSearch = (
  overrides: Partial<TenderSavedSearch> = {},
): TenderSavedSearch => ({
  active: true,
  category: null,
  cities: [],
  created_at: "2026-09-28T09:00:00.000Z",
  deadline_from: null,
  deadline_to: null,
  domain: "renewable_energy",
  id: 81,
  keywords: ["خورشیدی"],
  name: "خورشیدی خوزستان",
  opportunity_type: null,
  organizer: null,
  owner_sales_id: 0,
  provinces: ["خوزستان"],
  publish_from: null,
  publish_to: null,
  statuses: ["pending_setad_verification"],
  trade: null,
  updated_at: "2026-09-28T09:00:00.000Z",
  ...overrides,
});

export const StoryWrapper = ({
  authProvider: authProviderOverrides,
  children,
  data,
  dataProvider: dataProviderOverrides,
  i18nProvider = testI18nProvider,
  initialEntries,
  silent = import.meta.env.MODE === "test",
}: {
  authProvider?: Partial<AuthProvider>;
  children: ReactNode;
  data?: Partial<Db>;
  dataProvider?: Partial<ReturnType<typeof createDataProvider>>;
  i18nProvider?: CoreAdminProps["i18nProvider"];
  initialEntries?: string[];
  silent?: boolean;
}) => {
  const authProvider = useMemo(
    () => ({ ...createTestAuthProvider(), ...authProviderOverrides }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const dataProvider = useMemo(
    () => ({
      ...createDataProvider({ db: createCrmDb(cloneDeep(data)), silent }),
      ...dataProviderOverrides,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const store = useMemo(() => memoryStore(), []);

  useEffect(() => {
    // Clear localStorage on mount to prevent data pollution from previous story / test, since we persist react-query cache in localStorage.
    localStorage.clear();
  }, []);

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <CRM
        authProvider={authProvider}
        dataProvider={dataProvider}
        i18nProvider={i18nProvider}
        dashboard={() => <>{children}</>}
        store={store}
        disableTelemetry
        layout={({ children }) => (
          <DataImportProvider>
            {children}
            <Notification />
          </DataImportProvider>
        )}
      />
    </MemoryRouter>
  );
};
