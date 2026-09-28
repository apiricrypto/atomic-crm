import {
  RecordContextProvider,
  useListContext,
  useLocaleState,
  useTranslate,
} from "ra-core";

import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { ReferenceField } from "@/components/admin/reference-field";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/formatMoney";

import { getMoneyLocale } from "../root/useFormatMoney";
import type { ProcurementCommitment } from "../types";
import { calculateProcurementTotals } from "./totals";

export const ProcurementList = () => (
  <List
    title={false}
    perPage={25}
    sort={{ field: "updated_at", order: "DESC" }}
    pagination={<ListPagination rowsPerPageOptions={[10, 25, 50]} />}
  >
    <ProcurementGrid />
  </List>
);

const ProcurementGrid = () => {
  const { data, isPending } = useListContext<ProcurementCommitment>();
  const translate = useTranslate();
  const [locale] = useLocaleState();
  const totals = calculateProcurementTotals(data ?? []);
  const currency = getSingleCurrency(data ?? []);
  const displayMoney = (amount: number) =>
    currency
      ? formatMoney(amount, currency, {
          currencyDisplay: "narrowSymbol",
          locale: getMoneyLocale(locale),
          notation: "compact",
          minimumSignificantDigits: 3,
        })
      : translate("resources.procurement_commitments.mixed_currency");

  if (isPending) return null;

  return (
    <section className="w-full px-4 pb-20 md:px-0 md:pb-0">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">
          {translate("resources.procurement_commitments.name", {
            smart_count: 2,
          })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {translate("resources.procurement_commitments.subtitle")}
        </p>
      </div>

      {!!data?.length && (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryMetric
            label={translate(
              "resources.procurement_commitments.summary.active",
            )}
            value={displayMoney(totals.activeCommitment)}
          />
          <SummaryMetric
            label={translate(
              "resources.procurement_commitments.summary.received",
            )}
            value={displayMoney(totals.received)}
          />
          <SummaryMetric
            label={translate("resources.procurement_commitments.summary.draft")}
            value={displayMoney(totals.draft)}
          />
        </div>
      )}

      <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        {translate("resources.procurement_commitments.accounting_notice")}
      </div>

      {!data?.length ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          {translate("resources.procurement_commitments.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {data.map((commitment) => (
            <CommitmentCard key={commitment.id} commitment={commitment} />
          ))}
        </div>
      )}
    </section>
  );
};

const CommitmentCard = ({
  commitment,
}: {
  commitment: ProcurementCommitment;
}) => {
  const translate = useTranslate();
  const [locale] = useLocaleState();
  const money = formatMoney(commitment.amount, commitment.currency, {
    currencyDisplay: "narrowSymbol",
    locale: getMoneyLocale(locale),
    notation: "compact",
    minimumSignificantDigits: 3,
  });

  return (
    <RecordContextProvider value={commitment}>
      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-base" dir="ltr">
                {commitment.reference}
              </CardTitle>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                <ReferenceField
                  source="project_id"
                  reference="projects"
                  link={false}
                />
              </p>
            </div>
            <Badge variant={statusVariant(commitment.status)}>
              {translate(
                `resources.procurement_commitments.status.${commitment.status}`,
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 px-5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">
              {translate("resources.procurement_commitments.fields.amount")}
            </span>
            <strong>{money}</strong>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">
              {translate("resources.procurement_commitments.fields.supplier")}
            </span>
            {commitment.supplier_company_id ? (
              <ReferenceField
                source="supplier_company_id"
                reference="companies"
                link="show"
              />
            ) : (
              <span>—</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">
              {translate(
                "resources.procurement_commitments.fields.expected_on",
              )}
            </span>
            <span>
              {formatDate(commitment.expected_on, getMoneyLocale(locale))}
            </span>
          </div>
        </CardContent>
      </Card>
    </RecordContextProvider>
  );
};

const SummaryMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border bg-card p-4">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="mt-1 font-semibold">{value}</div>
  </div>
);

const getSingleCurrency = (
  commitments: ProcurementCommitment[],
): string | null => {
  const currencies = new Set(commitments.map(({ currency }) => currency));
  return currencies.size === 1 ? [...currencies][0] : null;
};

const formatDate = (value: string | null | undefined, locale: string) =>
  value
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        new Date(`${value}T00:00:00`),
      )
    : "—";

const statusVariant = (
  status: ProcurementCommitment["status"],
): "default" | "destructive" | "outline" | "secondary" => {
  if (status === "cancelled") return "destructive";
  if (status === "received") return "secondary";
  if (status === "draft") return "outline";
  return "default";
};
