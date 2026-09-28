import type {
  FinancialPayable,
  FinancialReceivable,
  FinancialTransaction,
} from "../../../types";
import type { Db } from "./types";

export const generateFinancialReceivables = (db: Db): FinancialReceivable[] =>
  db.projects.slice(0, 4).map((project, index) => ({
    id: index + 1,
    project_id: project.id,
    company_id: project.company_id,
    reference: `SATNO-AR-${String(index + 1).padStart(4, "0")}`,
    amount: Math.round(project.contract_amount * 0.4),
    currency: project.currency,
    issued_on: project.start_date ?? project.created_at.slice(0, 10),
    due_on: project.target_end_date ?? project.created_at.slice(0, 10),
    cancelled_at: null,
    notes: null,
    created_at: project.created_at,
    updated_at: project.updated_at,
    sales_id: project.sales_id,
  }));

export const generateFinancialPayables = (db: Db): FinancialPayable[] =>
  db.procurement_commitments.slice(0, 4).map((commitment, index) => ({
    id: index + 1,
    project_id: commitment.project_id,
    procurement_commitment_id: commitment.id,
    company_id:
      commitment.supplier_company_id ??
      db.projects.find(({ id }) => id === commitment.project_id)?.company_id ??
      db.companies[0]!.id,
    reference: `SATNO-AP-${String(index + 1).padStart(4, "0")}`,
    amount: commitment.amount,
    currency: commitment.currency,
    issued_on: commitment.created_at.slice(0, 10),
    due_on: commitment.expected_on ?? commitment.created_at.slice(0, 10),
    cancelled_at: null,
    notes: null,
    created_at: commitment.created_at,
    updated_at: commitment.updated_at,
    sales_id: commitment.sales_id,
  }));

export const generateFinancialTransactions = (
  db: Db,
): FinancialTransaction[] => {
  const transactions: FinancialTransaction[] = [];

  db.financial_receivables.slice(0, 2).forEach((receivable, index) => {
    transactions.push({
      id: transactions.length + 1,
      receivable_id: receivable.id,
      payable_id: null,
      reference: `SATNO-RCPT-${String(index + 1).padStart(4, "0")}`,
      direction: "inflow",
      amount: Math.round(receivable.amount * (index === 0 ? 0.4 : 1)),
      currency: receivable.currency,
      occurred_at: receivable.created_at,
      method: "bank",
      notes: null,
      created_at: receivable.created_at,
      sales_id: receivable.sales_id,
    });
  });

  db.financial_payables.slice(0, 2).forEach((payable, index) => {
    transactions.push({
      id: transactions.length + 1,
      receivable_id: null,
      payable_id: payable.id,
      reference: `SATNO-PMT-${String(index + 1).padStart(4, "0")}`,
      direction: "outflow",
      amount: Math.round(payable.amount * (index === 0 ? 0.35 : 1)),
      currency: payable.currency,
      occurred_at: payable.created_at,
      method: "bank",
      notes: null,
      created_at: payable.created_at,
      sales_id: payable.sales_id,
    });
  });

  return transactions;
};
