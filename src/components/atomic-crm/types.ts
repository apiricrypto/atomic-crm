import type { Identifier, RaRecord } from "ra-core";
import type { ComponentType } from "react";

import type {
  COMPANY_CREATED,
  CONTACT_CREATED,
  CONTACT_NOTE_CREATED,
  DEAL_CREATED,
  DEAL_NOTE_CREATED,
} from "./consts";
import type { StaffRole } from "./providers/commons/staffRoles";

export type SignUpData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export type SalesFormData = {
  avatar?: string;
  email: string;
  phone?: string;
  secondary_emails?: string[];
  password?: string;
  first_name: string;
  last_name: string;
  role: StaffRole;
  administrator?: boolean;
  disabled: boolean;
};

export type Sale = {
  first_name: string;
  last_name: string;
  administrator: boolean;
  role?: StaffRole;
  avatar?: RAFile;
  disabled?: boolean;
  user_id: string;

  /**
   * This is a copy of the user's email, to make it easier to handle by react admin
   * DO NOT UPDATE this field directly, it should be updated by the backend
   */
  email: string;

  /** E.164 phone copied from the corresponding Supabase Auth user. */
  phone?: string | null;

  secondary_emails?: string[];

  /**
   * This is used by the fake rest provider to store the password
   * DO NOT USE this field in your code besides the fake rest provider
   * @deprecated
   */
  password?: string;
} & Pick<RaRecord, "id">;

export type Company = {
  name: string;
  logo: RAFile;
  sector: string;
  size: 1 | 10 | 50 | 250 | 500;
  linkedin_url: string;
  website: string;
  phone_number: string;
  address: string;
  zipcode: string;
  city: string;
  state_abbr: string;
  sales_id?: Identifier;
  created_at: string;
  description: string;
  revenue: string;
  tax_identifier: string;
  country: string;
  context_links?: string[];
  nb_contacts?: number;
  nb_deals?: number;
} & Pick<RaRecord, "id">;

export type EmailAndType = {
  email: string;
  type: "Work" | "Home" | "Other";
};

export type PhoneNumberAndType = {
  number: string;
  type: "Work" | "Home" | "Other";
};

export type Contact = {
  first_name: string;
  last_name: string;
  title: string;
  company_id?: Identifier | null;
  email_jsonb: EmailAndType[];
  avatar?: Partial<RAFile>;
  linkedin_url?: string | null;
  first_seen: string;
  last_seen: string;
  has_newsletter: boolean;
  tags: number[];
  gender: string;
  sales_id?: Identifier;
  status: string;
  background: string;
  phone_jsonb: PhoneNumberAndType[];
  nb_tasks?: number;
  company_name?: string;
} & Pick<RaRecord, "id">;

export type ContactNote = {
  contact_id: Identifier;
  text: string;
  date: string;
  sales_id: Identifier;
  status: string;
  attachments?: AttachmentNote[];
} & Pick<RaRecord, "id">;

export type Deal = {
  name: string;
  company_id: Identifier;
  contact_ids: Identifier[];
  category: string;
  stage: string;
  description: string;
  amount: number;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  expected_closing_date: string;
  sales_id: Identifier;
  index: number;
} & Pick<RaRecord, "id">;

export type DealNote = {
  deal_id: Identifier;
  text: string;
  date: string;
  sales_id: Identifier;
  attachments?: AttachmentNote[];

  // This is defined for compatibility with `ContactNote`
  status?: undefined;
} & Pick<RaRecord, "id">;

export type LeadSource =
  | "tender_radar"
  | "bale_market"
  | "website"
  | "manual"
  | "import";

export type LeadStatus =
  | "new"
  | "reviewing"
  | "qualified"
  | "rejected"
  | "converted";

export type LeadPriority = "low" | "normal" | "high" | "urgent";

/**
 * A quarantined inbound record. Its normalized fields and raw payload are not
 * Contact, Company or Deal data until an explicit conversion succeeds.
 */
export type LeadInboxRecord = {
  source: LeadSource;
  source_record_id: string;
  source_url?: string | null;
  title: string;
  organization_name?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  province?: string | null;
  city?: string | null;
  description?: string | null;
  estimated_amount?: number | null;
  estimated_currency?: string | null;
  deadline?: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  raw_payload: Record<string, unknown>;
  captured_at: string;
  created_at: string;
  updated_at: string;
  assigned_sales_id?: Identifier | null;
} & Pick<RaRecord, "id">;

export type LeadConversion = {
  lead_id: Identifier;
  company_id: Identifier;
  contact_id?: Identifier | null;
  deal_id: Identifier;
  converted_by_sales_id: Identifier;
  converted_at: string;
} & Pick<RaRecord, "id">;

export type LeadConversionInput = {
  lead_id: Identifier;
  company_name: string;
  deal_name: string;
  deal_description?: string | null;
  deal_amount?: number | null;
  expected_closing_date?: string | null;
  contact_first_name?: string | null;
  contact_last_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
};

export type TenderDomain = "renewable_energy" | "security_systems";
export type TenderOpportunityType = "inquiry" | "tender";
export type TenderVerificationStatus =
  | "setad_verified"
  | "pending_setad_verification"
  | "data_conflict";
export type TenderRadarGrade = "A" | "B" | "C";
export type TenderPipelineStage =
  | "documents"
  | "technical_review"
  | "pricing"
  | "participation_decision"
  | "result";

/**
 * A reviewed tender record imported from the quarantined Lead Inbox.
 * Official SETAD identifiers remain separate from aggregator identity.
 */
export type TenderOpportunity = {
  lead_id: Identifier;
  source: "tender_radar" | "setad" | "manual";
  aggregator_record_id?: string | null;
  opportunity_type: TenderOpportunityType;
  official_need_no?: string | null;
  official_tender_no?: string | null;
  title: string;
  description?: string | null;
  organizer?: string | null;
  province?: string | null;
  city?: string | null;
  publish_date?: string | null;
  document_deadline?: string | null;
  submission_deadline?: string | null;
  official_source_url?: string | null;
  aggregator_source_url?: string | null;
  domain: TenderDomain;
  trade?: string | null;
  category?: string | null;
  verification_status: TenderVerificationStatus;
  radar_score?: number | null;
  radar_grade?: TenderRadarGrade | null;
  fallback_fingerprint: string;
  assigned_sales_id?: Identifier | null;
  created_at: string;
  updated_at: string;
} & Pick<RaRecord, "id">;

export type TenderPipelineEntry = {
  opportunity_id: Identifier;
  stage: TenderPipelineStage;
  documents_status: "not_started" | "requested" | "received" | "complete";
  technical_review_status:
    | "not_started"
    | "in_review"
    | "approved"
    | "rejected";
  pricing_status: "not_started" | "in_progress" | "approved";
  participation_decision: "undecided" | "bid" | "no_bid";
  result_status: "pending" | "won" | "lost" | "cancelled";
  assigned_sales_id?: Identifier | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
} & Pick<RaRecord, "id">;

export type TenderPipelineTransition = Partial<
  Pick<
    TenderPipelineEntry,
    | "assigned_sales_id"
    | "documents_status"
    | "notes"
    | "participation_decision"
    | "pricing_status"
    | "result_status"
    | "stage"
    | "technical_review_status"
  >
>;

export type TenderAuditEvent = {
  opportunity_id: Identifier;
  event_type: string;
  actor_sales_id: Identifier;
  metadata: Record<string, unknown>;
  created_at: string;
} & Pick<RaRecord, "id">;

export type TenderSavedSearch = {
  name: string;
  domain: TenderDomain;
  opportunity_type?: TenderOpportunityType | null;
  provinces: string[];
  cities: string[];
  keywords: string[];
  trade?: string | null;
  category?: string | null;
  organizer?: string | null;
  publish_from?: string | null;
  publish_to?: string | null;
  deadline_from?: string | null;
  deadline_to?: string | null;
  statuses: TenderVerificationStatus[];
  active: boolean;
  owner_sales_id: Identifier;
  created_at: string;
  updated_at: string;
} & Pick<RaRecord, "id">;

export type TenderSavedSearchInput = Omit<
  TenderSavedSearch,
  "created_at" | "id" | "owner_sales_id" | "updated_at"
>;

export type TenderSetadVerificationInput = {
  verification_status: Extract<
    TenderVerificationStatus,
    "data_conflict" | "setad_verified"
  >;
  official_need_no?: string | null;
  official_tender_no?: string | null;
  title: string;
  description?: string | null;
  organizer?: string | null;
  province?: string | null;
  city?: string | null;
  publish_date?: string | null;
  document_deadline?: string | null;
  submission_deadline?: string | null;
  official_source_url: string;
};

export type TenderSetadVerification = TenderSetadVerificationInput & {
  opportunity_id: Identifier;
  opportunity_type: TenderOpportunityType;
  checked_by_sales_id: Identifier;
  checked_at: string;
} & Pick<RaRecord, "id">;

/**
 * Allow-listed values reviewed by a person before the guarded Tender import
 * RPC is called. Quarantined provider payloads are deliberately excluded.
 */
export type TenderOpportunityReview = {
  opportunity_type: TenderOpportunityType;
  domain: TenderDomain;
  title: string;
  description: string | null;
  organizer: string | null;
  province: string | null;
  city: string | null;
  publish_date: string | null;
  document_deadline: string | null;
  submission_deadline: string | null;
  official_need_no: string | null;
  official_tender_no: string | null;
  official_source_url: string | null;
  trade: string | null;
  category: string | null;
  verification_status: TenderVerificationStatus;
  radar_score: number;
  radar_grade: Exclude<TenderRadarGrade, "C">;
  fallback_fingerprint: string;
  assigned_sales_id?: Identifier | null;
};

export type TenderImportResult = {
  opportunity_id: Identifier;
  pipeline_entry_id: Identifier;
  lead_id: Identifier;
  duplicate: boolean;
  dedup_basis: string;
};

export type LeadConversionResult = {
  lead_id: Identifier;
  company_id: Identifier;
  contact_id: Identifier | null;
  deal_id: Identifier;
  conversion_id: Identifier;
};

export type ProjectStatus =
  | "planned"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled";

/**
 * A delivery project created from exactly one won deal.
 *
 * `contract_amount` is an immutable commercial snapshot used for costing. It
 * is not a finance transaction and must never be added to deal revenue totals.
 */
export type Project = {
  name: string;
  code: string;
  deal_id: Identifier;
  company_id: Identifier;
  status: ProjectStatus;
  contract_amount: number;
  currency: string;
  start_date?: string | null;
  target_end_date?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  sales_id?: Identifier;
} & Pick<RaRecord, "id">;

export type ProjectCostCategory =
  | "equipment"
  | "labor"
  | "subcontract"
  | "transport"
  | "permit"
  | "other";

/**
 * One cost line keeps planned and actual values side-by-side. This prevents
 * the same cost from being counted twice when it moves from plan to actual.
 */
export type ProjectCostItem = {
  project_id: Identifier;
  category: ProjectCostCategory;
  description: string;
  planned_amount: number;
  actual_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  sales_id?: Identifier;
} & Pick<RaRecord, "id">;

export type ProcurementCommitmentStatus =
  | "draft"
  | "approved"
  | "ordered"
  | "received"
  | "cancelled";

/**
 * A procurement commitment linked to one project cost line.
 *
 * This amount is neither an actual project cost nor a payment. Those values
 * must be recorded by their own workflows to prevent financial double counting.
 */
export type ProcurementCommitment = {
  project_id: Identifier;
  project_cost_item_id: Identifier;
  supplier_company_id?: Identifier | null;
  reference: string;
  status: ProcurementCommitmentStatus;
  amount: number;
  currency: string;
  expected_on?: string | null;
  received_on?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  sales_id?: Identifier;
} & Pick<RaRecord, "id">;

export type FinancialReceivable = {
  project_id: Identifier;
  company_id: Identifier;
  reference: string;
  amount: number;
  currency: string;
  issued_on: string;
  due_on: string;
  cancelled_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  sales_id?: Identifier;
} & Pick<RaRecord, "id">;

export type FinancialPayable = {
  project_id: Identifier;
  procurement_commitment_id?: Identifier | null;
  company_id: Identifier;
  reference: string;
  amount: number;
  currency: string;
  issued_on: string;
  due_on: string;
  cancelled_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  sales_id?: Identifier;
} & Pick<RaRecord, "id">;

export type FinancialTransaction = {
  receivable_id?: Identifier | null;
  payable_id?: Identifier | null;
  reference: string;
  direction: "inflow" | "outflow";
  amount: number;
  currency: string;
  occurred_at: string;
  method: "bank" | "cash" | "card" | "cheque" | "other";
  notes?: string | null;
  created_at: string;
  sales_id?: Identifier;
} & Pick<RaRecord, "id">;

export type InventoryLocation = {
  code: string;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
} & Pick<RaRecord, "id">;

export type InventoryItemUnit =
  | "piece"
  | "meter"
  | "kilogram"
  | "liter"
  | "set"
  | "other";

export type InventoryItem = {
  sku: string;
  name: string;
  unit: InventoryItemUnit;
  reorder_level: number;
  active: boolean;
  created_at: string;
  updated_at: string;
} & Pick<RaRecord, "id">;

export type InventoryMovementType =
  | "receipt"
  | "issue"
  | "adjustment_in"
  | "adjustment_out";

export type InventoryMovement = {
  item_id: Identifier;
  location_id: Identifier;
  procurement_commitment_id?: Identifier | null;
  project_id?: Identifier | null;
  reference: string;
  type: InventoryMovementType;
  quantity: number;
  occurred_at: string;
  notes?: string | null;
  created_at: string;
  sales_id?: Identifier;
} & Pick<RaRecord, "id">;

export type DailyWorkReport = {
  sales_id: Identifier;
  work_date: string;
  achievements: string;
  blockers: string;
  next_steps: string;
  minutes_worked: number;
  created_at: string;
} & Pick<RaRecord, "id">;

export type Tag = {
  id: number;
  name: string;
  color: string;
};

export type Task = {
  contact_id: Identifier;
  type: string;
  text: string;
  due_date: string;
  done_date?: string | null;
  sales_id?: Identifier;
} & Pick<RaRecord, "id">;

export type ActivityCompanyCreated = {
  type: typeof COMPANY_CREATED;
  company_id: Identifier;
  company: Company;
  sales_id: Identifier;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityContactCreated = {
  type: typeof CONTACT_CREATED;
  company_id: Identifier;
  sales_id?: Identifier;
  contact: Contact;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityContactNoteCreated = {
  type: typeof CONTACT_NOTE_CREATED;
  sales_id?: Identifier;
  contactNote: ContactNote;
  date: string;
} & Pick<RaRecord, "id">;

export type ActivityDealCreated = {
  type: typeof DEAL_CREATED;
  company_id: Identifier;
  sales_id?: Identifier;
  deal: Deal;
  date: string;
};

export type ActivityDealNoteCreated = {
  type: typeof DEAL_NOTE_CREATED;
  sales_id?: Identifier;
  dealNote: DealNote;
  date: string;
};

export type Activity = RaRecord &
  (
    | ActivityCompanyCreated
    | ActivityContactCreated
    | ActivityContactNoteCreated
    | ActivityDealCreated
    | ActivityDealNoteCreated
  );

export interface RAFile {
  src: string;
  title: string;
  path?: string;
  rawFile: File;
  type?: string;
}

export type AttachmentNote = RAFile;

export interface LabeledValue {
  value: string;
  label: string;
}

export type DealStage = LabeledValue;

export interface NoteStatus extends LabeledValue {
  color: string;
}

export interface ContactGender {
  value: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}
