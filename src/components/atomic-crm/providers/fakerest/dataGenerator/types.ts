import type {
  Company,
  Contact,
  ContactNote,
  Deal,
  DealNote,
  DailyWorkReport,
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
  Tag,
  Task,
  TenderAuditEvent,
  TenderOpportunity,
  TenderPipelineEntry,
  TenderSavedSearch,
  TenderSetadVerification,
} from "../../../types";
import type { ConfigurationContextValue } from "../../../root/ConfigurationContext";

export interface Db {
  companies: Company[];
  contacts: Contact[];
  contact_notes: ContactNote[];
  deals: Deal[];
  deal_notes: DealNote[];
  daily_work_reports: DailyWorkReport[];
  financial_payables: FinancialPayable[];
  financial_receivables: FinancialReceivable[];
  financial_transactions: FinancialTransaction[];
  inventory_items: InventoryItem[];
  inventory_locations: InventoryLocation[];
  inventory_movements: InventoryMovement[];
  lead_conversions: LeadConversion[];
  lead_inbox: LeadInboxRecord[];
  projects: Project[];
  project_cost_items: ProjectCostItem[];
  procurement_commitments: ProcurementCommitment[];
  sales: Sale[];
  tags: Tag[];
  tasks: Task[];
  tender_audit_log: TenderAuditEvent[];
  tender_opportunities: TenderOpportunity[];
  tender_pipeline_entries: TenderPipelineEntry[];
  tender_saved_searches: TenderSavedSearch[];
  tender_setad_verifications: TenderSetadVerification[];
  configuration: Array<{ id: number; config: ConfigurationContextValue }>;
}
