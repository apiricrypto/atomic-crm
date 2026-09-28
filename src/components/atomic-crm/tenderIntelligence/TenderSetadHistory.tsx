import { ExternalLink, History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { TenderOpportunity, TenderSetadVerification } from "../types";

export const TenderSetadHistory = ({
  isPending,
  opportunities,
  verifications,
}: {
  isPending: boolean;
  opportunities: TenderOpportunity[];
  verifications: TenderSetadVerification[];
}) => {
  const opportunitiesById = new Map(
    opportunities.map((opportunity) => [opportunity.id, opportunity]),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-5" /> ۳. تاریخچه مشاهدات رسمی
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          این سابقه فقط‌خواندنی و append-only است؛ هر بررسی رسمی به‌عنوان یک
          مشاهده مستقل باقی می‌ماند.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending ? null : verifications.length ? (
          verifications.map((verification) => (
            <OfficialObservationCard
              key={verification.id}
              opportunity={opportunitiesById.get(verification.opportunity_id)}
              verification={verification}
            />
          ))
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
            هنوز مشاهده رسمی ثبت نشده است.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const OfficialObservationCard = ({
  opportunity,
  verification,
}: {
  opportunity?: TenderOpportunity;
  verification: TenderSetadVerification;
}) => {
  const identifier =
    verification.opportunity_type === "inquiry"
      ? verification.official_need_no
      : verification.official_tender_no;

  return (
    <article className="rounded-lg border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{verification.title}</h3>
            <Badge
              variant={
                verification.verification_status === "data_conflict"
                  ? "destructive"
                  : "secondary"
              }
            >
              {verification.verification_status === "data_conflict"
                ? "تعارض داده"
                : "تأییدشده در ستاد"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {opportunity?.title || "فرصت مناقصه"} • بررسی در{" "}
            {new Date(verification.checked_at).toLocaleString("fa-IR")}
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <a
            href={verification.official_source_url}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="size-4" /> منبع رسمی
          </a>
        </Button>
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <HistoryValue
          label={
            verification.opportunity_type === "inquiry"
              ? "Need No رسمی"
              : "Tender No رسمی"
          }
          value={identifier}
        />
        <HistoryValue
          label="دستگاه برگزارکننده"
          value={verification.organizer}
        />
        <HistoryValue
          label="موقعیت"
          value={[verification.province, verification.city]
            .filter(Boolean)
            .join("، ")}
        />
        <HistoryValue
          label="تاریخ انتشار رسمی"
          value={formatOfficialDate(verification.publish_date)}
        />
        <HistoryValue
          label="مهلت دریافت اسناد"
          value={formatOfficialDate(verification.document_deadline)}
        />
        <HistoryValue
          label="مهلت ارسال پیشنهاد"
          value={formatOfficialDate(verification.submission_deadline)}
        />
      </dl>
    </article>
  );
};

export const TenderSetadConflictComparison = ({
  observation,
  opportunity,
}: {
  observation: TenderSetadVerification;
  opportunity: TenderOpportunity;
}) => {
  const officialIdentifier =
    observation.opportunity_type === "inquiry"
      ? observation.official_need_no
      : observation.official_tender_no;
  const rows: Array<
    [string, string | null | undefined, string | null | undefined]
  > = [
    ["شناسه", opportunity.aggregator_record_id, officialIdentifier],
    ["عنوان", opportunity.title, observation.title],
    ["دستگاه", opportunity.organizer, observation.organizer],
    [
      "موقعیت",
      [opportunity.province, opportunity.city].filter(Boolean).join("، "),
      [observation.province, observation.city].filter(Boolean).join("، "),
    ],
    [
      "تاریخ انتشار",
      formatOfficialDate(opportunity.publish_date),
      formatOfficialDate(observation.publish_date),
    ],
    [
      "مهلت اسناد",
      formatOfficialDate(opportunity.document_deadline),
      formatOfficialDate(observation.document_deadline),
    ],
    [
      "مهلت پیشنهاد",
      formatOfficialDate(opportunity.submission_deadline),
      formatOfficialDate(observation.submission_deadline),
    ],
  ];

  return (
    <div className="mt-4 overflow-hidden rounded-lg border">
      <div className="grid grid-cols-[minmax(5rem,0.65fr)_minmax(0,1fr)_minmax(0,1fr)] bg-muted/60 text-xs font-medium">
        <span className="p-2">فیلد</span>
        <span className="border-s p-2">Tender Radar</span>
        <span className="border-s p-2">SETAD رسمی</span>
      </div>
      {rows.map(([label, radar, official]) => (
        <div
          className="grid grid-cols-[minmax(5rem,0.65fr)_minmax(0,1fr)_minmax(0,1fr)] border-t text-xs"
          key={label}
        >
          <span className="p-2 font-medium">{label}</span>
          <span className="min-w-0 break-words border-s p-2">
            {radar || "—"}
          </span>
          <span className="min-w-0 break-words border-s p-2">
            {official || "—"}
          </span>
        </div>
      ))}
    </div>
  );
};

const HistoryValue = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="rounded-md bg-muted/50 p-2">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-1 break-words font-medium">{value || "—"}</dd>
  </div>
);

const formatOfficialDate = (value?: string | null) =>
  value ? new Date(value + "T00:00:00Z").toLocaleDateString("fa-IR") : "—";
