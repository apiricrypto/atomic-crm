import { describe, expect, it } from "vitest";

import type {
  FinancialPayable,
  FinancialReceivable,
  FinancialTransaction,
} from "../types";
import { calculateFinanceSummary } from "./summary";

describe("calculateFinanceSummary", () => {
  it("settles receivables and payables without mixing their ledgers", () => {
    const receivables = [
      obligation<FinancialReceivable>({ amount: 1_000, id: 1 }),
    ];
    const payables = [obligation<FinancialPayable>({ amount: 800, id: 2 })];
    const transactions = [
      transaction({ amount: 400, direction: "inflow", receivable_id: 1 }),
      transaction({
        amount: 300,
        direction: "outflow",
        id: 2,
        payable_id: 2,
        receivable_id: null,
      }),
    ];

    expect(
      calculateFinanceSummary({
        payables,
        receivables,
        today: new Date("2026-01-01T00:00:00Z"),
        transactions,
      }),
    ).toEqual([
      {
        currency: "IRR",
        netCashFlow: 100,
        overduePayables: 1,
        overdueReceivables: 1,
        payableOutstanding: 500,
        receivableOutstanding: 600,
      },
    ]);
  });

  it("never makes an outstanding balance negative after overpayment", () => {
    expect(
      calculateFinanceSummary({
        payables: [],
        receivables: [obligation<FinancialReceivable>({ amount: 100, id: 1 })],
        transactions: [transaction({ amount: 150, receivable_id: 1 })],
      })[0].receivableOutstanding,
    ).toBe(0);
  });

  it("does not settle an obligation with a transaction in the wrong direction", () => {
    expect(
      calculateFinanceSummary({
        payables: [],
        receivables: [obligation<FinancialReceivable>({ amount: 100, id: 1 })],
        transactions: [
          transaction({
            amount: 100,
            direction: "outflow",
            receivable_id: 1,
          }),
        ],
      })[0].receivableOutstanding,
    ).toBe(100);
  });
});

const obligation = <T extends FinancialPayable | FinancialReceivable>(
  overrides: Partial<T>,
): T =>
  ({
    amount: 0,
    cancelled_at: null,
    company_id: 1,
    created_at: "2025-01-01T00:00:00Z",
    currency: "IRR",
    due_on: "2025-01-01",
    id: 1,
    issued_on: "2025-01-01",
    notes: null,
    project_id: 1,
    reference: "REF-1",
    sales_id: 1,
    updated_at: "2025-01-01T00:00:00Z",
    ...overrides,
  }) as T;

const transaction = (
  overrides: Partial<FinancialTransaction>,
): FinancialTransaction => ({
  amount: 0,
  created_at: "2025-01-01T00:00:00Z",
  currency: "IRR",
  direction: "inflow",
  id: 1,
  method: "bank",
  notes: null,
  occurred_at: "2025-01-01T00:00:00Z",
  payable_id: null,
  receivable_id: 1,
  reference: "TX-1",
  sales_id: 1,
  ...overrides,
});
