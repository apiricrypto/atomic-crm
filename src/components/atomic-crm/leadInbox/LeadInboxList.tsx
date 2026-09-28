import { useId, useState, type HTMLInputTypeAttribute } from "react";
import {
  CanAccess,
  useDataProvider,
  useListContext,
  useLocaleState,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import { ExternalLink, Radar, ShieldCheck } from "lucide-react";
import { Link } from "react-router";

import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
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
import { formatMoney } from "@/lib/formatMoney";

import type { CrmDataProvider } from "../providers/types";
import { getMoneyLocale } from "../root/useFormatMoney";
import type {
  LeadConversionInput,
  LeadInboxRecord,
  LeadStatus,
} from "../types";
import { calculateLeadTriageScore, getSafeLeadSourceUrl } from "./triage";

const REVIEW_STATUSES: Exclude<LeadStatus, "converted">[] = [
  "new",
  "reviewing",
  "qualified",
  "rejected",
];

export const LeadInboxList = () => (
  <List
    title={false}
    perPage={25}
    sort={{ field: "captured_at", order: "DESC" }}
    pagination={<ListPagination rowsPerPageOptions={[10, 25, 50]} />}
  >
    <LeadInboxGrid />
  </List>
);

const LeadInboxGrid = () => {
  const { data, isPending } = useListContext<LeadInboxRecord>();
  const translate = useTranslate();

  if (isPending) return null;

  const records = data ?? [];
  const activeCount = records.filter((lead) =>
    ["new", "reviewing", "qualified"].includes(lead.status),
  ).length;
  const qualifiedCount = records.filter(
    (lead) => lead.status === "qualified",
  ).length;
  const convertedCount = records.filter(
    (lead) => lead.status === "converted",
  ).length;

  return (
    <section className="w-full px-4 pb-20 md:px-0 md:pb-0">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {translate("resources.lead_inbox.name", { smart_count: 2 })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {translate("resources.lead_inbox.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SummaryBadge
            label={translate("resources.lead_inbox.summary.active")}
            value={activeCount}
          />
          <SummaryBadge
            label={translate("resources.lead_inbox.summary.qualified")}
            value={qualifiedCount}
          />
          <SummaryBadge
            label={translate("resources.lead_inbox.summary.converted")}
            value={convertedCount}
          />
          <CanAccess resource="tender_opportunities" action="list">
            <Button asChild size="sm" variant="outline">
              <Link to="/tenders">
                <Radar className="size-4" />
                {translate("resources.tender_intelligence.short_name")}
              </Link>
            </Button>
          </CanAccess>
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-amber-300/70 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
        <ShieldCheck className="me-2 inline size-4" />
        {translate("resources.lead_inbox.quarantine_notice")}
      </div>

      {!records.length ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          {translate("resources.lead_inbox.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {records.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </section>
  );
};

const SummaryBadge = ({ label, value }: { label: string; value: number }) => (
  <Badge variant="outline">
    {label}: {value.toLocaleString("fa-IR")}
  </Badge>
);

const LeadCard = ({ lead }: { lead: LeadInboxRecord }) => {
  const translate = useTranslate();
  const [locale] = useLocaleState();
  const [conversionOpen, setConversionOpen] = useState(false);
  const safeSourceUrl = getSafeLeadSourceUrl(lead.source_url);
  const score = calculateLeadTriageScore(lead);

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-lg leading-7">{lead.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {lead.organization_name ||
                translate("resources.lead_inbox.unknown_organization")}
            </p>
          </div>
          <Badge
            variant={lead.priority === "urgent" ? "destructive" : "outline"}
          >
            {translate(`resources.lead_inbox.priority.${lead.priority}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-5 text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge>
            {translate(`resources.lead_inbox.source.${lead.source}`)}
          </Badge>
          <Badge variant="secondary">
            {translate("resources.lead_inbox.triage_score", { score })}
          </Badge>
          <Badge variant="outline">
            {translate(`resources.lead_inbox.status.${lead.status}`)}
          </Badge>
        </div>

        {lead.description ? (
          <p className="line-clamp-3">{lead.description}</p>
        ) : null}

        <dl className="grid grid-cols-2 gap-2 text-xs">
          <LeadDetail
            label={translate("resources.lead_inbox.fields.location")}
            value={[lead.province, lead.city].filter(Boolean).join("، ") || "—"}
          />
          <LeadDetail
            label={translate("resources.lead_inbox.fields.deadline")}
            value={lead.deadline || "—"}
          />
          <LeadDetail
            label={translate("resources.lead_inbox.fields.contact")}
            value={
              lead.contact_name ||
              lead.contact_phone ||
              lead.contact_email ||
              "—"
            }
          />
          <LeadDetail
            label={translate("resources.lead_inbox.fields.estimated_amount")}
            value={
              lead.estimated_amount != null && lead.estimated_currency
                ? formatMoney(lead.estimated_amount, lead.estimated_currency, {
                    currencyDisplay: "narrowSymbol",
                    locale: getMoneyLocale(locale),
                    notation: "compact",
                  })
                : "—"
            }
          />
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <CanAccess resource="lead_inbox" action="edit">
            <LeadStatusSelect lead={lead} />
          </CanAccess>
          <div className="flex items-center gap-2">
            {safeSourceUrl ? (
              <Button asChild size="sm" variant="ghost">
                <a href={safeSourceUrl} rel="noreferrer" target="_blank">
                  <ExternalLink className="size-4" />
                  {translate("resources.lead_inbox.open_source")}
                </a>
              </Button>
            ) : null}
            {lead.status === "qualified" && lead.source === "tender_radar" ? (
              <CanAccess resource="tender_opportunities" action="create">
                <Button asChild size="sm">
                  <Link to="/tenders">
                    {translate("resources.lead_inbox.action.review_tender")}
                  </Link>
                </Button>
              </CanAccess>
            ) : lead.status === "qualified" ? (
              <CanAccess resource="lead_inbox" action="edit">
                <Button size="sm" onClick={() => setConversionOpen(true)}>
                  {translate("resources.lead_inbox.action.convert")}
                </Button>
              </CanAccess>
            ) : null}
          </div>
        </div>
      </CardContent>
      <LeadConversionDialog
        lead={lead}
        onOpenChange={setConversionOpen}
        open={conversionOpen}
      />
    </Card>
  );
};

const LeadDetail = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0 rounded-md bg-muted/60 p-2">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="mt-1 break-words font-medium">{value}</dd>
  </div>
);

const LeadStatusSelect = ({ lead }: { lead: LeadInboxRecord }) => {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider<CrmDataProvider>();
  const [saving, setSaving] = useState(false);

  return (
    <Select
      disabled={saving || lead.status === "converted"}
      value={lead.status}
      onValueChange={async (status: LeadStatus) => {
        if (status === lead.status || status === "converted") return;
        setSaving(true);
        try {
          await dataProvider.update("lead_inbox", {
            id: lead.id,
            data: { status },
            previousData: lead,
          });
          notify("resources.lead_inbox.status_updated");
          refresh();
        } catch (error) {
          notify(error instanceof Error ? error.message : String(error), {
            type: "error",
          });
        } finally {
          setSaving(false);
        }
      }}
    >
      <SelectTrigger
        aria-label={translate("resources.lead_inbox.fields.status")}
        className="h-8 w-36"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {REVIEW_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {translate(`resources.lead_inbox.status.${status}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const splitContactName = (name?: string | null) => {
  const [firstName = "", ...rest] = name?.trim().split(/\s+/) ?? [];
  return { firstName, lastName: rest.join(" ") };
};

const LeadConversionDialog = ({
  lead,
  onOpenChange,
  open,
}: {
  lead: LeadInboxRecord;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider<CrmDataProvider>();
  const initialContact = splitContactName(lead.contact_name);
  const [companyName, setCompanyName] = useState(lead.organization_name ?? "");
  const [dealName, setDealName] = useState(lead.title);
  const [description, setDescription] = useState(lead.description ?? "");
  const [amount, setAmount] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [firstName, setFirstName] = useState(initialContact.firstName);
  const [lastName, setLastName] = useState(initialContact.lastName);
  const [email, setEmail] = useState(lead.contact_email ?? "");
  const [phone, setPhone] = useState(lead.contact_phone ?? "");
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!confirmed || !companyName.trim() || !dealName.trim()) return;
    const input: LeadConversionInput = {
      company_name: companyName,
      contact_email: email || null,
      contact_first_name: firstName || null,
      contact_last_name: lastName || null,
      contact_phone: phone || null,
      deal_amount: amount ? Number(amount) : null,
      deal_description: description || null,
      deal_name: dealName,
      expected_closing_date: closingDate || null,
      lead_id: lead.id,
    };

    setSaving(true);
    try {
      await dataProvider.convertLead(input);
      notify("resources.lead_inbox.converted");
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {translate("resources.lead_inbox.conversion.title")}
          </DialogTitle>
          <DialogDescription>
            {translate("resources.lead_inbox.conversion.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <ConversionField
            label={translate("resources.lead_inbox.conversion.company_name")}
            onChange={setCompanyName}
            required
            value={companyName}
          />
          <ConversionField
            label={translate("resources.lead_inbox.conversion.deal_name")}
            onChange={setDealName}
            required
            value={dealName}
          />
          <ConversionField
            label={translate("resources.lead_inbox.conversion.first_name")}
            onChange={setFirstName}
            value={firstName}
          />
          <ConversionField
            label={translate("resources.lead_inbox.conversion.last_name")}
            onChange={setLastName}
            value={lastName}
          />
          <ConversionField
            label={translate("resources.lead_inbox.conversion.email")}
            onChange={setEmail}
            type="email"
            value={email}
          />
          <ConversionField
            label={translate("resources.lead_inbox.conversion.phone")}
            onChange={setPhone}
            value={phone}
          />
          <ConversionField
            label={translate("resources.lead_inbox.conversion.amount")}
            min="0"
            onChange={setAmount}
            type="number"
            value={amount}
          />
          <ConversionField
            label={translate("resources.lead_inbox.conversion.closing_date")}
            onChange={setClosingDate}
            type="date"
            value={closingDate}
          />
          <div className="sm:col-span-2">
            <Label htmlFor={`lead-description-${lead.id}`}>
              {translate("resources.lead_inbox.conversion.deal_description")}
            </Label>
            <Textarea
              id={`lead-description-${lead.id}`}
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-md border p-3">
          <Checkbox
            checked={confirmed}
            id={`lead-confirm-${lead.id}`}
            onCheckedChange={(value) => setConfirmed(value === true)}
          />
          <Label className="leading-5" htmlFor={`lead-confirm-${lead.id}`}>
            {translate("resources.lead_inbox.conversion.confirm")}
          </Label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {translate("ra.action.cancel")}
          </Button>
          <Button
            disabled={
              saving || !confirmed || !companyName.trim() || !dealName.trim()
            }
            onClick={submit}
          >
            {translate("resources.lead_inbox.action.convert")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ConversionField = ({
  label,
  min,
  onChange,
  required,
  type = "text",
  value,
}: {
  label: string;
  min?: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: HTMLInputTypeAttribute;
  value: string;
}) => {
  const generatedId = useId();
  const id = `lead-conversion-${generatedId}`;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </div>
  );
};
