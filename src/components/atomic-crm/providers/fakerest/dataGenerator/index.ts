import { generateCompanies } from "./companies";
import { generateContactNotes } from "./contactNotes";
import { generateContacts } from "./contacts";
import { generateDealNotes } from "./dealNotes";
import { generateDeals } from "./deals";
import { generateDailyWorkReports } from "./dailyWorkReports";
import {
  generateFinancialPayables,
  generateFinancialReceivables,
  generateFinancialTransactions,
} from "./finance";
import {
  generateInventoryItems,
  generateInventoryLocations,
  generateInventoryMovements,
} from "./inventory";
import { generateLeadInbox } from "./leadInbox";
import { generateProjectCostItems, generateProjects } from "./projects";
import { generateProcurementCommitments } from "./procurementCommitments";
import { finalize } from "./finalize";
import { generateSales } from "./sales";
import { generateTags } from "./tags";
import { generateTasks } from "./tasks";
import type { Db } from "./types";

export default (): Db => {
  const db = {} as Db;
  db.sales = generateSales(db);
  db.tags = generateTags(db);
  db.companies = generateCompanies(db);
  db.contacts = generateContacts(db);
  db.contact_notes = generateContactNotes(db);
  db.deals = generateDeals(db);
  db.deal_notes = generateDealNotes(db);
  db.daily_work_reports = generateDailyWorkReports(db);
  db.projects = generateProjects(db);
  db.project_cost_items = generateProjectCostItems(db);
  db.procurement_commitments = generateProcurementCommitments(db);
  db.inventory_locations = generateInventoryLocations();
  db.inventory_items = generateInventoryItems();
  db.inventory_movements = generateInventoryMovements(db);
  db.lead_inbox = generateLeadInbox();
  db.lead_conversions = [];
  db.financial_receivables = generateFinancialReceivables(db);
  db.financial_payables = generateFinancialPayables(db);
  db.financial_transactions = generateFinancialTransactions(db);
  db.tasks = generateTasks(db);
  db.configuration = [
    {
      id: 1,
      config: {} as Db["configuration"][number]["config"],
    },
  ];
  finalize(db);

  return db;
};
