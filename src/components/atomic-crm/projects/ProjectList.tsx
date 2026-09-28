import {
  RecordContextProvider,
  useGetList,
  useListContext,
  useLocaleState,
  useTranslate,
} from "ra-core";

import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { ReferenceField } from "@/components/admin/reference-field";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/formatMoney";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router";

import { getMoneyLocale } from "../root/useFormatMoney";
import type { Project, ProjectCostItem } from "../types";
import { calculateProjectCosting } from "./costing";

export const ProjectList = () => (
  <List
    title={false}
    perPage={25}
    sort={{ field: "updated_at", order: "DESC" }}
    pagination={<ListPagination rowsPerPageOptions={[10, 25, 50]} />}
  >
    <ProjectGrid />
  </List>
);

const ProjectGrid = () => {
  const { data, isPending } = useListContext<Project>();
  const translate = useTranslate();

  if (isPending) return null;

  return (
    <section className="w-full px-4 pb-20 md:px-0 md:pb-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {translate("resources.projects.name", { smart_count: 2 })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {translate("resources.projects.costing_subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {translate("resources.projects.count", {
              smart_count: data?.length ?? 0,
            })}
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link to="/procurement_commitments">
              <ShoppingCart className="size-4" />
              {translate("resources.procurement_commitments.name", {
                smart_count: 2,
              })}
            </Link>
          </Button>
        </div>
      </div>

      {!data?.length ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          {translate("resources.projects.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {data.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
};

const ProjectCard = ({ project }: { project: Project }) => {
  const translate = useTranslate();
  const [locale] = useLocaleState();
  const { data: costItems = [], isPending } = useGetList<ProjectCostItem>(
    "project_cost_items",
    {
      filter: { "project_id@eq": project.id },
      pagination: { page: 1, perPage: 250 },
      sort: { field: "id", order: "ASC" },
    },
  );
  const costing = calculateProjectCosting(project, costItems);
  const displayMoney = (amount: number) =>
    formatMoney(amount, project.currency, {
      currencyDisplay: "narrowSymbol",
      locale: getMoneyLocale(locale),
      notation: "compact",
      minimumSignificantDigits: 3,
    });

  return (
    <RecordContextProvider value={project}>
      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-lg">{project.name}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                {project.code}
              </p>
            </div>
            <Badge>
              {translate(`resources.projects.status.${project.status}`)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            <ReferenceField
              source="company_id"
              reference="companies"
              link="show"
            />
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 px-5 text-sm">
          <CostMetric
            label={translate("resources.projects.fields.contract_amount")}
            value={displayMoney(costing.contractAmount)}
          />
          <CostMetric
            label={translate("resources.projects.fields.planned_cost")}
            value={isPending ? "…" : displayMoney(costing.plannedCost)}
          />
          <CostMetric
            label={translate("resources.projects.fields.actual_cost")}
            value={isPending ? "…" : displayMoney(costing.actualCost)}
          />
          <CostMetric
            label={translate("resources.projects.fields.forecast_margin")}
            value={isPending ? "…" : displayMoney(costing.forecastMargin)}
            tone={costing.forecastMargin < 0 ? "negative" : "positive"}
          />
        </CardContent>
      </Card>
    </RecordContextProvider>
  );
};

const CostMetric = ({
  label,
  tone,
  value,
}: {
  label: string;
  tone?: "negative" | "positive";
  value: string;
}) => (
  <div className="rounded-lg bg-muted/60 p-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div
      className={`mt-1 font-semibold ${
        tone === "negative"
          ? "text-destructive"
          : tone === "positive"
            ? "text-emerald-700 dark:text-emerald-400"
            : ""
      }`}
    >
      {value}
    </div>
  </div>
);
