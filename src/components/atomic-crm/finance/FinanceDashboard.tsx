import { useGetList, useLocaleState, useTranslate } from "ra-core";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatMoney";

import { getMoneyLocale } from "../root/useFormatMoney";
import type {
  FinancialPayable,
  FinancialReceivable,
  FinancialTransaction,
} from "../types";
import { calculateFinanceSummary } from "./summary";

const listParams = {
  pagination: { page: 1, perPage: 1_000 },
  sort: { field: "id", order: "ASC" as const },
};

export const FinanceDashboard = () => {
  const translate = useTranslate();
  const [locale] = useLocaleState();
  const { data: receivables = [], isPending: receivablesPending } =
    useGetList<FinancialReceivable>("financial_receivables", listParams);
  const { data: payables = [], isPending: payablesPending } =
    useGetList<FinancialPayable>("financial_payables", listParams);
  const { data: transactions = [], isPending: transactionsPending } =
    useGetList<FinancialTransaction>("financial_transactions", listParams);
  const summaries = calculateFinanceSummary({
    payables,
    receivables,
    transactions,
  });
  const moneyLocale = getMoneyLocale(locale);
  const displayMoney = (amount: number, currency: string) =>
    formatMoney(amount, currency, {
      currencyDisplay: "narrowSymbol",
      locale: moneyLocale,
      notation: "compact",
      minimumSignificantDigits: 3,
    });

  if (receivablesPending || payablesPending || transactionsPending) return null;

  return (
    <section className="w-full px-4 pb-20 md:px-0 md:pb-0">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">
          {translate("resources.finance.name")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {translate("resources.finance.subtitle")}
        </p>
      </div>

      <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        {translate("resources.finance.accounting_notice")}
      </div>

      {!summaries.length ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          {translate("resources.finance.empty")}
        </div>
      ) : (
        <div className="space-y-5">
          {summaries.map((summary) => (
            <div key={summary.currency}>
              <h2 className="mb-3 font-semibold" dir="ltr">
                {summary.currency}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryMetric
                  label={translate("resources.finance.summary.receivable")}
                  value={displayMoney(
                    summary.receivableOutstanding,
                    summary.currency,
                  )}
                  detail={translate("resources.finance.summary.overdue", {
                    smart_count: summary.overdueReceivables,
                  })}
                />
                <SummaryMetric
                  label={translate("resources.finance.summary.payable")}
                  value={displayMoney(
                    summary.payableOutstanding,
                    summary.currency,
                  )}
                  detail={translate("resources.finance.summary.overdue", {
                    smart_count: summary.overduePayables,
                  })}
                />
                <SummaryMetric
                  label={translate("resources.finance.summary.net_cash_flow")}
                  value={displayMoney(summary.netCashFlow, summary.currency)}
                />
                <SummaryMetric
                  label={translate("resources.finance.summary.transactions")}
                  value={String(
                    transactions.filter(
                      ({ currency }) => currency === summary.currency,
                    ).length,
                  )}
                />
              </div>
            </div>
          ))}

          <div>
            <h2 className="mb-3 text-lg font-semibold">
              {translate("resources.finance.recent_transactions")}
            </h2>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {[...transactions]
                .sort((left, right) =>
                  right.occurred_at.localeCompare(left.occurred_at),
                )
                .slice(0, 12)
                .map((transaction) => (
                  <Card key={transaction.id} className="gap-3 py-4">
                    <CardHeader className="px-4">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle
                          className="min-w-0 truncate text-sm"
                          dir="ltr"
                        >
                          {transaction.reference}
                        </CardTitle>
                        <Badge
                          variant={
                            transaction.direction === "inflow"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {translate(
                            `resources.finance.direction.${transaction.direction}`,
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-3 px-4 text-sm">
                      <strong>
                        {displayMoney(transaction.amount, transaction.currency)}
                      </strong>
                      <span className="text-muted-foreground">
                        {new Intl.DateTimeFormat(moneyLocale, {
                          dateStyle: "medium",
                        }).format(new Date(transaction.occurred_at))}
                      </span>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const SummaryMetric = ({
  detail,
  label,
  value,
}: {
  detail?: string;
  label: string;
  value: string;
}) => (
  <div className="min-w-0 rounded-lg border bg-card p-4">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="mt-1 truncate font-semibold">{value}</div>
    {detail ? (
      <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
    ) : null}
  </div>
);
