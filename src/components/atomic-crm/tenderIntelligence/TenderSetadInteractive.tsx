import { useState, type HTMLInputTypeAttribute } from "react";
import {
  CanAccess,
  useDataProvider,
  useGetList,
  useNotify,
  useRefresh,
} from "ra-core";
import { ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  TenderOpportunity,
  TenderOpportunityType,
  TenderSetadVerificationInput,
} from "../types";
import { getSetadPortalUrl } from "./contract";

export const TenderSetadInteractive = () => {
  const [opportunityType, setOpportunityType] =
    useState<TenderOpportunityType>("inquiry");
  const { data = [], isPending } = useGetList<TenderOpportunity>(
    "tender_opportunities",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "updated_at", order: "DESC" },
    },
  );
  const reviewQueue = data.filter(
    (record) => record.verification_status !== "setad_verified",
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>۱. جست‌وجوی رسمی با حضور کاربر</CardTitle>
          <div className="rounded-lg border border-amber-300/70 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
            <ShieldAlert className="me-2 inline size-4" />
            ورود، OTP و CAPTCHA فقط توسط کاربر در مرورگر انجام می‌شود. CRM هیچ
            credential، cookie، CAPTCHA یا session را نمی‌خواند یا ذخیره
            نمی‌کند.
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            فیلترهای زیر راهنمای ورود دستی در سامانه رسمی‌اند و به صفحه ستاد
            تزریق یا ارسال نمی‌شوند.
          </p>
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SearchSelect
              label="حوزه"
              name="domain"
              options={[
                ["renewable_energy", "انرژی‌های نو"],
                ["security_systems", "سیستم‌های امنیتی"],
              ]}
            />
            <div className="space-y-2">
              <Label htmlFor="setad-opportunity-type">نوع فرصت</Label>
              <Select
                value={opportunityType}
                onValueChange={(value: TenderOpportunityType) =>
                  setOpportunityType(value)
                }
              >
                <SelectTrigger id="setad-opportunity-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inquiry">استعلام</SelectItem>
                  <SelectItem value="tender">مناقصه</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SearchInput label="استان" name="province" />
            <SearchInput label="شهر" name="city" />
            <SearchInput label="کلمه کلیدی" name="keyword" />
            <SearchInput
              label={
                opportunityType === "inquiry"
                  ? "شماره نیاز (Need No)"
                  : "شماره مناقصه (Tender No)"
              }
              name={
                opportunityType === "inquiry"
                  ? "official_need_no"
                  : "official_tender_no"
              }
            />
            <SearchInput label="رسته" name="trade" />
            <SearchInput label="دسته" name="category" />
            <SearchInput label="دستگاه برگزارکننده" name="organizer" />
            <SearchInput label="انتشار از" name="publish_from" type="date" />
            <SearchInput label="انتشار تا" name="publish_to" type="date" />
            <SearchInput label="مهلت از" name="deadline_from" type="date" />
            <SearchInput label="مهلت تا" name="deadline_to" type="date" />
            <SearchInput label="وضعیت" name="status" />
            <div className="flex items-end md:col-span-2 xl:col-span-2">
              <Button asChild className="w-full md:w-auto">
                <a
                  href={getSetadPortalUrl(opportunityType)}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="size-4" />
                  {opportunityType === "inquiry"
                    ? "بازکردن جست‌وجوی رسمی استعلام"
                    : "بازکردن جست‌وجوی رسمی مناقصه"}
                </a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>۲. ثبت مشاهده رسمی پس از بررسی دستی</CardTitle>
          <p className="text-sm text-muted-foreground">
            داده رسمی در رکورد append-only جدا ثبت می‌شود. در حالت تعارض، داده
            Radar و مشاهده ستاد هر دو بدون بازنویسی حفظ می‌شوند.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {isPending ? null : reviewQueue.length ? (
            reviewQueue.map((opportunity) => (
              <SetadQueueCard key={opportunity.id} opportunity={opportunity} />
            ))
          ) : (
            <p className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
              موردی در صف راستی‌آزمایی نیست.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const SetadQueueCard = ({
  opportunity,
}: {
  opportunity: TenderOpportunity;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <strong>{opportunity.title}</strong>
          <Badge variant="outline">
            {opportunity.verification_status === "data_conflict"
              ? "تعارض داده"
              : "در انتظار راستی‌آزمایی"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {opportunity.organizer || "بدون دستگاه برگزارکننده"} •{" "}
          {opportunity.province || "بدون استان"}
        </p>
      </div>
      <CanAccess resource="tender_setad_verifications" action="create">
        <Button variant="outline" onClick={() => setOpen(true)}>
          ثبت نتیجه بررسی رسمی
        </Button>
      </CanAccess>
      <SetadVerificationDialog
        onOpenChange={setOpen}
        open={open}
        opportunity={opportunity}
      />
    </div>
  );
};

const toDraft = (
  opportunity: TenderOpportunity,
): TenderSetadVerificationInput => ({
  city: opportunity.city ?? null,
  description: opportunity.description ?? null,
  document_deadline: opportunity.document_deadline ?? null,
  official_need_no:
    opportunity.opportunity_type === "inquiry"
      ? (opportunity.official_need_no ?? null)
      : null,
  official_source_url: getSetadPortalUrl(opportunity.opportunity_type),
  official_tender_no:
    opportunity.opportunity_type === "tender"
      ? (opportunity.official_tender_no ?? null)
      : null,
  organizer: opportunity.organizer ?? null,
  province: opportunity.province ?? null,
  publish_date: opportunity.publish_date ?? null,
  submission_deadline: opportunity.submission_deadline ?? null,
  title: opportunity.title,
  verification_status: "setad_verified",
});

const SetadVerificationDialog = ({
  onOpenChange,
  open,
  opportunity,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  opportunity: TenderOpportunity;
}) => {
  const dataProvider = useDataProvider<CrmDataProvider>();
  const notify = useNotify();
  const refresh = useRefresh();
  const [draft, setDraft] = useState<TenderSetadVerificationInput>(() =>
    toDraft(opportunity),
  );
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const identifier =
    opportunity.opportunity_type === "inquiry"
      ? draft.official_need_no
      : draft.official_tender_no;
  const canSubmit =
    confirmed &&
    Boolean(draft.title.trim()) &&
    Boolean(identifier?.trim()) &&
    !saving;

  const setText = (
    key: Exclude<keyof TenderSetadVerificationInput, "verification_status">,
    value: string,
  ) =>
    setDraft((current) => ({
      ...current,
      [key]: value.trim() ? value : null,
    }));

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await dataProvider.recordSetadVerification(opportunity.id, draft);
      notify("مشاهده رسمی ستاد با ممیزی ثبت شد");
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
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>ثبت مشاهده رسمی ستاد</DialogTitle>
          <DialogDescription>
            فقط اطلاعاتی را وارد کنید که شخصاً در صفحه رسمی و نشست مجاز مشاهده
            کرده‌اید. هیچ اطلاعات ورود یا CAPTCHA وارد نکنید.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-emerald-300/70 bg-emerald-50 p-3 text-sm text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100">
          <ShieldCheck className="me-2 inline size-4" />
          تاریخ انتشار، مهلت دریافت اسناد و مهلت ارسال پیشنهاد سه فیلد
          مستقل‌اند.
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <VerificationSelect
            label="نتیجه راستی‌آزمایی"
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                verification_status: value as
                  | "data_conflict"
                  | "setad_verified",
              }))
            }
            value={draft.verification_status}
          />
          <VerificationField
            label={
              opportunity.opportunity_type === "inquiry"
                ? "شماره نیاز رسمی (Need No)"
                : "شماره مناقصه رسمی (Tender No)"
            }
            onChange={(value) =>
              setText(
                opportunity.opportunity_type === "inquiry"
                  ? "official_need_no"
                  : "official_tender_no",
                value,
              )
            }
            required
            value={identifier ?? ""}
          />
          <VerificationField
            label="عنوان رسمی"
            onChange={(value) => setText("title", value)}
            required
            value={draft.title}
          />
          <VerificationField
            label="دستگاه برگزارکننده"
            onChange={(value) => setText("organizer", value)}
            value={draft.organizer ?? ""}
          />
          <VerificationField
            label="استان"
            onChange={(value) => setText("province", value)}
            value={draft.province ?? ""}
          />
          <VerificationField
            label="شهر"
            onChange={(value) => setText("city", value)}
            value={draft.city ?? ""}
          />
          <VerificationField
            label="تاریخ انتشار رسمی"
            onChange={(value) => setText("publish_date", value)}
            type="date"
            value={draft.publish_date ?? ""}
          />
          <VerificationField
            label="مهلت دریافت اسناد"
            onChange={(value) => setText("document_deadline", value)}
            type="date"
            value={draft.document_deadline ?? ""}
          />
          <VerificationField
            label="مهلت ارسال پیشنهاد"
            onChange={(value) => setText("submission_deadline", value)}
            type="date"
            value={draft.submission_deadline ?? ""}
          />
          <div className="flex items-end">
            <Button asChild className="w-full" variant="outline">
              <a
                href={getSetadPortalUrl(opportunity.opportunity_type)}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="size-4" /> بازکردن دوباره صفحه رسمی
              </a>
            </Button>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor={`setad-description-${opportunity.id}`}>
              شرح رسمی
            </Label>
            <Textarea
              id={`setad-description-${opportunity.id}`}
              onChange={(event) => setText("description", event.target.value)}
              value={draft.description ?? ""}
            />
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-md border p-3">
          <Checkbox
            checked={confirmed}
            id={`setad-confirm-${opportunity.id}`}
            onCheckedChange={(value) => setConfirmed(value === true)}
          />
          <Label
            className="leading-5"
            htmlFor={`setad-confirm-${opportunity.id}`}
          >
            این اطلاعات را در صفحه رسمی ستاد و با نشست مجاز شخصاً بررسی کردم؛
            هیچ credential، OTP، cookie، CAPTCHA یا session در این فرم نیست.
          </Label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button disabled={!canSubmit} onClick={submit}>
            ثبت مشاهده و ممیزی
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SearchInput = ({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: "date" | "text";
}) => (
  <div className="space-y-2">
    <Label htmlFor={`setad-${name}`}>{label}</Label>
    <Input id={`setad-${name}`} name={name} type={type} />
  </div>
);

const SearchSelect = ({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: readonly (readonly [string, string])[];
}) => (
  <div className="space-y-2">
    <Label htmlFor={`setad-${name}`}>{label}</Label>
    <Select defaultValue={options[0][0]} name={name}>
      <SelectTrigger id={`setad-${name}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([value, text]) => (
          <SelectItem key={value} value={value}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const VerificationField = ({
  label,
  onChange,
  required = false,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: HTMLInputTypeAttribute;
  value: string;
}) => (
  <div className="space-y-2">
    <Label>
      {label}
      {required ? " *" : ""}
      <Input
        className="mt-2"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </Label>
  </div>
);

const VerificationSelect = ({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="setad_verified">تأییدشده در ستاد</SelectItem>
        <SelectItem value="data_conflict">تعارض داده</SelectItem>
      </SelectContent>
    </Select>
  </div>
);
