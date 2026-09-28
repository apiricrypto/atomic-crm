import type {
  Company,
  Contact,
  ContactNote,
  Deal,
  DealNote,
  FinancialPayable,
  FinancialReceivable,
  FinancialTransaction,
  Project,
  ProjectCostItem,
  ProcurementCommitment,
  Sale,
  Tag,
  Task,
} from "../../../types";
import type { ConfigurationContextValue } from "../../../root/ConfigurationContext";

export interface Db {
  companies: Company[];
  contacts: Contact[];
  contact_notes: ContactNote[];
  deals: Deal[];
  deal_notes: DealNote[];
  financial_payables: FinancialPayable[];
  financial_receivables: FinancialReceivable[];
  financial_transactions: FinancialTransaction[];
  projects: Project[];
  project_cost_items: ProjectCostItem[];
  procurement_commitments: ProcurementCommitment[];
  sales: Sale[];
  tags: Tag[];
  tasks: Task[];
  configuration: Array<{ id: number; config: ConfigurationContextValue }>;
}
