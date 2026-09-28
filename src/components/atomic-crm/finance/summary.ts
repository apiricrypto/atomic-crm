import type {
  FinancialPayable,
  FinancialReceivable,
  FinancialTransaction,
} from "../types";

export type CurrencyFinanceSummary = {
  currency: string;
  receivableOutstanding: number;
  payableOutstanding: number;
  netCashFlow: number;
  overdueReceivables: number;
  overduePayables: number;
};

const safeAmount = (amount: number): number =>
  Number.isFinite(amount) && amount > 0 ? amount : 0;

export const calculateFinanceSummary = ({
  payables,
  receivables,
  transactions,
  today = new Date(),
}: {
  payables: FinancialPayable[];
  receivables: FinancialReceivable[];
  transactions: FinancialTransaction[];
  today?: Date;
}): CurrencyFinanceSummary[] => {
  const currencies = new Set([
    ...receivables.map(({ currency }) => currency),
    ...payables.map(({ currency }) => currency),
    ...transactions.map(({ currency }) => currency),
  ]);

  return [...currencies].sort().map((currency) => {
    const currencyTransactions = transactions.filter(
      (transaction) => transaction.currency === currency,
    );
    const settledByReceivable = sumTransactions(
      currencyTransactions,
      "receivable_id",
    );
    const settledByPayable = sumTransactions(
      currencyTransactions,
      "payable_id",
    );
    const activeReceivables = receivables.filter(
      (item) => item.currency === currency && !item.cancelled_at,
    );
    const activePayables = payables.filter(
      (item) => item.currency === currency && !item.cancelled_at,
    );
    const receivableOutstanding = activeReceivables.reduce(
      (total, item) =>
        total +
        Math.max(
          0,
          safeAmount(item.amount) - (settledByReceivable.get(item.id) ?? 0),
        ),
      0,
    );
    const payableOutstanding = activePayables.reduce(
      (total, item) =>
        total +
        Math.max(
          0,
          safeAmount(item.amount) - (settledByPayable.get(item.id) ?? 0),
        ),
      0,
    );

    return {
      currency,
      receivableOutstanding,
      payableOutstanding,
      netCashFlow: currencyTransactions.reduce(
        (total, transaction) =>
          total +
          (transaction.direction === "inflow" ? 1 : -1) *
            safeAmount(transaction.amount),
        0,
      ),
      overdueReceivables: activeReceivables.filter(
        (item) =>
          isPastDue(item.due_on, today) &&
          safeAmount(item.amount) > (settledByReceivable.get(item.id) ?? 0),
      ).length,
      overduePayables: activePayables.filter(
        (item) =>
          isPastDue(item.due_on, today) &&
          safeAmount(item.amount) > (settledByPayable.get(item.id) ?? 0),
      ).length,
    };
  });
};

const sumTransactions = (
  transactions: FinancialTransaction[],
  source: "receivable_id" | "payable_id",
) => {
  const totals = new Map<FinancialTransaction[typeof source], number>();
  const expectedDirection = source === "receivable_id" ? "inflow" : "outflow";

  for (const transaction of transactions) {
    if (transaction.direction !== expectedDirection) continue;
    const sourceId = transaction[source];
    if (sourceId == null) continue;
    totals.set(
      sourceId,
      (totals.get(sourceId) ?? 0) + safeAmount(transaction.amount),
    );
  }

  return totals;
};

const isPastDue = (dueOn: string, today: Date): boolean => {
  const dueDate = new Date(`${dueOn}T23:59:59`);
  return Number.isFinite(dueDate.getTime()) && dueDate < today;
};
