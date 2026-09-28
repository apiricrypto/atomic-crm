import { useEffect, useState } from "react";
import {
  CanAccess,
  useDataProvider,
  useGetList,
  useNotify,
  useRefresh,
} from "ra-core";
import { History, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { CrmDataProvider } from "../providers/types";
import type {
  TenderAuditEvent,
  TenderOpportunity,
  TenderPipelineEntry,
  TenderPipelineStage,
  TenderPipelineTransition,
} from "../types";

const STAGES: readonly TenderPipelineStage[] = [
  "documents",
  "technical_review",
  "pricing",
  "participation_decision",
  "result",
];

const STAGE_LABELS: Record<TenderPipelineStage, string> = {
  documents: "دریافت اسناد",
  participation_decision: "تصمیم شرکت",
  pricing: "قیمت‌گذاری",
  result: "نتیجه",
  technical_review: "بررسی فنی",
};

const STATUS_LABELS: Record<string, string> = {
  approved: "تأییدشده",
  bid: "شرکت می‌کنیم",
  cancelled: "لغوشده / عدم شرکت",
  complete: "کامل",
  in_progress: "در حال انجام",
  in_review: "در حال بررسی",
  lost: "ناموفق",
  no_bid: "عدم شرکت",
  not_started: "شروع‌نشده",
  pending: "در انتظار",
  received: "دریافت‌شده",
  rejected: "ردشده",
  requested: "درخواست‌شده",
  undecided: "تصمیم‌گیری‌نشده",
  won: "برنده",
};

const AUDIT_LABELS: Record<string, string> = {
  pipeline_transitioned: "وضعیت خط لوله تغییر کرد",
  radar_lead_imported: "سرنخ رادار وارد خط لوله شد",
};

export const TenderPipelineBoard = () => {
  const { data: opportunities = [], isPending: opportunitiesPending } =
    useGetList<TenderOpportunity>("tender_opportunities", {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "updated_at", order: "DESC" },
    });
  const { data: entries = [], isPending: entriesPending } =
    useGetList<TenderPipelineEntry>("tender_pipeline_entries", {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "updated_at", order: "DESC" },
    });
  const { data: auditEvents = [] } = useGetList<TenderAuditEvent>(
    "tender_audit_log",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "created_at", order: "DESC" },
    },
  );

  const opportunityById = new Map(
    opportunities.map((opportunity) => [String(opportunity.id), opportunity]),
  );
  const auditByOpportunity = new Map<string, TenderAuditEvent>();
  for (const event of auditEvents) {
    const key = String(event.opportunity_id);
    if (!auditByOpportunity.has(key)) auditByOpportunity.set(key, event);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>خط لوله مناقصه و استعلام</CardTitle>
        <p className="text-sm text-muted-foreground">
          گذارها رو به جلو، کنترل‌شده و همراه با رویداد ممیزی ثبت می‌شوند.
        </p>
      </CardHeader>
      <CardContent>
        {opportunitiesPending || entriesPending ? null : entries.length ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-5">
            {STAGES.map((stage) => {
              const stageEntries = entries.filter(
                (entry) => entry.stage === stage,
              );
              return (
                <section
                  className="rounded-lg border bg-muted/20 p-3"
                  key={stage}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h2 className="font-medium">{STAGE_LABELS[stage]}</h2>
                    <Badge variant="secondary">
                      {stageEntries.length.toLocaleString("fa-IR")}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {stageEntries.map((entry) => {
                      const opportunity = opportunityById.get(
                        String(entry.opportunity_id),
                      );
                      if (!opportunity) return null;
                      return (
                        <PipelineCard
                          auditEvent={auditByOpportunity.get(
                            String(opportunity.id),
                          )}
                          entry={entry}
                          key={String(entry.id)}
                          opportunity={opportunity}
                        />
                      );
                    })}
                    {!stageEntries.length ? (
                      <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                        بدون مورد
                      </p>
                    ) : null}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {STAGES.map((stage) => (
              <section className="rounded-lg border p-4" key={stage}>
                <h2 className="font-medium">{STAGE_LABELS[stage]}</h2>
                <p className="mt-2 text-sm text-muted-foreground">۰ مورد</p>
              </section>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PipelineCard = ({
  auditEvent,
  entry,
  opportunity,
}: {
  auditEvent?: TenderAuditEvent;
  entry: TenderPipelineEntry;
  opportunity: TenderOpportunity;
}) => {
  const [open, setOpen] = useState(false);
  const status = pipelineStatus(entry);

  return (
    <article className="rounded-md border bg-background p-3 shadow-sm">
      <h3 className="text-sm font-semibold leading-6">{opportunity.title}</h3>
      <p className="text-xs text-muted-foreground">
        {opportunity.organizer || "برگزارکننده نامشخص"}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        <Badge variant="outline">{STATUS_LABELS[status] || status}</Badge>
        <Badge variant="secondary">
          {opportunity.verification_status === "setad_verified"
            ? "تأییدشده در ستاد"
            : opportunity.verification_status === "data_conflict"
              ? "تعارض داده"
              : "در انتظار تطبیق ستاد"}
        </Badge>
      </div>
      {auditEvent ? (
        <p className="mt-3 flex items-start gap-1 text-xs text-muted-foreground">
          <History className="mt-0.5 size-3 shrink-0" />
          <span>
            {AUDIT_LABELS[auditEvent.event_type] || auditEvent.event_type} —{" "}
            {new Date(auditEvent.created_at).toLocaleString("fa-IR")}
          </span>
        </p>
      ) : null}
      <CanAccess resource="tender_pipeline_entries" action="edit">
        <Button
          className="mt-3 w-full"
          onClick={() => setOpen(true)}
          size="sm"
          variant="outline"
        >
          <Pencil className="size-3.5" />
          ثبت گذار
        </Button>
      </CanAccess>
      <PipelineTransitionDialog
        entry={entry}
        onOpenChange={setOpen}
        open={open}
        opportunity={opportunity}
      />
    </article>
  );
};

const pipelineStatus = (entry: TenderPipelineEntry) => {
  switch (entry.stage) {
    case "documents":
      return entry.documents_status;
    case "technical_review":
      return entry.technical_review_status;
    case "pricing":
      return entry.pricing_status;
    case "participation_decision":
      return entry.participation_decision;
    case "result":
      return entry.result_status;
  }
};

const PipelineTransitionDialog = ({
  entry,
  onOpenChange,
  open,
  opportunity,
}: {
  entry: TenderPipelineEntry;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  opportunity: TenderOpportunity;
}) => {
  const dataProvider = useDataProvider<CrmDataProvider>();
  const notify = useNotify();
  const refresh = useRefresh();
  const [transition, setTransition] = useState<TenderPipelineTransition>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTransition({
      documents_status: entry.documents_status,
      notes: entry.notes ?? null,
      participation_decision: entry.participation_decision,
      pricing_status: entry.pricing_status,
      result_status: entry.result_status,
      stage: entry.stage,
      technical_review_status: entry.technical_review_status,
    });
  }, [entry, open]);

  const submit = async () => {
    if (!transition.stage || saving) return;
    setSaving(true);
    try {
      await dataProvider.updateTenderPipeline(opportunity.id, transition);
      notify("گذار خط لوله و رویداد ممیزی ثبت شد.");
      onOpenChange(false);
      refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : String(error), {
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>ثبت گذار خط لوله</DialogTitle>
          <DialogDescription>{opportunity.title}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatusSelect
            label="مرحله"
            onChange={(stage) =>
              setTransition((current) => ({
                ...current,
                stage: stage as TenderPipelineStage,
              }))
            }
            options={STAGES.map((stage) => [stage, STAGE_LABELS[stage]])}
            value={transition.stage || entry.stage}
          />
          <StatusSelect
            label="وضعیت اسناد"
            onChange={(documents_status) =>
              setTransition((current) => ({
                ...current,
                documents_status:
                  documents_status as TenderPipelineEntry["documents_status"],
              }))
            }
            options={statusOptions([
              "not_started",
              "requested",
              "received",
              "complete",
            ])}
            value={transition.documents_status || entry.documents_status}
          />
          <StatusSelect
            label="بررسی فنی"
            onChange={(technical_review_status) =>
              setTransition((current) => ({
                ...current,
                technical_review_status:
                  technical_review_status as TenderPipelineEntry["technical_review_status"],
              }))
            }
            options={statusOptions([
              "not_started",
              "in_review",
              "approved",
              "rejected",
            ])}
            value={
              transition.technical_review_status ||
              entry.technical_review_status
            }
          />
          <StatusSelect
            label="قیمت‌گذاری"
            onChange={(pricing_status) =>
              setTransition((current) => ({
                ...current,
                pricing_status:
                  pricing_status as TenderPipelineEntry["pricing_status"],
              }))
            }
            options={statusOptions(["not_started", "in_progress", "approved"])}
            value={transition.pricing_status || entry.pricing_status}
          />
          <StatusSelect
            label="تصمیم شرکت"
            onChange={(participation_decision) =>
              setTransition((current) => ({
                ...current,
                participation_decision:
                  participation_decision as TenderPipelineEntry["participation_decision"],
              }))
            }
            options={statusOptions(["undecided", "bid", "no_bid"])}
            value={
              transition.participation_decision || entry.participation_decision
            }
          />
          <StatusSelect
            label="نتیجه"
            onChange={(result_status) =>
              setTransition((current) => ({
                ...current,
                result_status:
                  result_status as TenderPipelineEntry["result_status"],
              }))
            }
            options={statusOptions(["pending", "won", "lost", "cancelled"])}
            value={transition.result_status || entry.result_status}
          />
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`tender-pipeline-notes-${entry.id}`}>
              یادداشت داخلی
            </Label>
            <Textarea
              id={`tender-pipeline-notes-${entry.id}`}
              maxLength={10000}
              onChange={(event) =>
                setTransition((current) => ({
                  ...current,
                  notes: event.target.value || null,
                }))
              }
              value={transition.notes ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              متن یادداشت در metadata ممیزی کپی نمی‌شود؛ فقط تغییر آن ثبت
              می‌شود.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={saving} onClick={submit}>
            {saving ? "در حال ثبت…" : "ثبت گذار و ممیزی"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const statusOptions = (values: readonly string[]) =>
  values.map((value) => [value, STATUS_LABELS[value] || value] as const);

const StatusSelect = ({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
  value: string;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([optionValue, optionLabel]) => (
          <SelectItem key={optionValue} value={optionValue}>
            {optionLabel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
