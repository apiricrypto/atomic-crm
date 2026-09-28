import {
  RecordContextProvider,
  useGetIdentity,
  useListContext,
  useLocaleState,
  useTranslate,
} from "ra-core";

import { CreateButton } from "@/components/admin/create-button";
import { EditButton } from "@/components/admin/edit-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { ReferenceField } from "@/components/admin/reference-field";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { TopToolbar } from "../layout/TopToolbar";
import type { DailyWorkReport } from "../types";

const DailyWorkReportActions = () => (
  <TopToolbar>
    <CreateButton label="resources.daily_work_reports.action.create" />
  </TopToolbar>
);

export const DailyWorkReportList = () => (
  <List
    actions={<DailyWorkReportActions />}
    pagination={<ListPagination rowsPerPageOptions={[7, 14, 31]} />}
    perPage={14}
    sort={{ field: "work_date", order: "DESC" }}
    title={false}
  >
    <DailyWorkReportGrid />
  </List>
);

const DailyWorkReportGrid = () => {
  const { data, isPending } = useListContext<DailyWorkReport>();
  const translate = useTranslate();

  if (isPending) return null;

  return (
    <section className="w-full px-4 pb-20 md:px-0 md:pb-0">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">
          {translate("resources.daily_work_reports.name", { smart_count: 2 })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {translate("resources.daily_work_reports.subtitle")}
        </p>
      </div>

      {!data?.length ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          {translate("resources.daily_work_reports.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {data.map((report) => (
            <DailyWorkReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </section>
  );
};

const DailyWorkReportCard = ({ report }: { report: DailyWorkReport }) => {
  const { identity } = useGetIdentity();
  const [locale] = useLocaleState();
  const translate = useTranslate();
  const isOwner = String(identity?.id) === String(report.sales_id);

  return (
    <RecordContextProvider value={report}>
      <Card className="gap-4 py-5">
        <CardHeader className="px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-base">
                {formatWorkDate(report.work_date, locale)}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                <ReferenceField
                  source="sales_id"
                  reference="sales"
                  link={false}
                />
              </p>
            </div>
            <Badge variant="secondary">
              {formatMinutes(report.minutes_worked, translate)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 text-sm">
          <ReportSection
            label={translate(
              "resources.daily_work_reports.fields.achievements",
            )}
            value={report.achievements}
          />
          {report.blockers ? (
            <ReportSection
              label={translate("resources.daily_work_reports.fields.blockers")}
              value={report.blockers}
              warning
            />
          ) : null}
          {report.next_steps ? (
            <ReportSection
              label={translate(
                "resources.daily_work_reports.fields.next_steps",
              )}
              value={report.next_steps}
            />
          ) : null}
          {isOwner ? (
            <div className="flex justify-end">
              <EditButton label="resources.daily_work_reports.action.edit" />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </RecordContextProvider>
  );
};

const ReportSection = ({
  label,
  value,
  warning,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) => (
  <div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <p
      className={`mt-1 whitespace-pre-wrap break-words ${
        warning ? "text-amber-800 dark:text-amber-300" : ""
      }`}
    >
      {value}
    </p>
  </div>
);

const formatWorkDate = (value: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(
    new Date(`${value}T12:00:00`),
  );

const formatMinutes = (
  minutes: number,
  translate: (key: string, options?: Record<string, unknown>) => string,
) =>
  translate("resources.daily_work_reports.duration", {
    hours: Math.floor(minutes / 60),
    minutes: minutes % 60,
  });
