import { useId, useState, type HTMLInputTypeAttribute } from "react";
import { useDataProvider, useNotify, useRefresh, useTranslate } from "ra-core";
import { ExternalLink, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  LeadInboxRecord,
  TenderDomain,
  TenderOpportunityReview,
  TenderOpportunityType,
  TenderVerificationStatus,
} from "../types";
import { getSetadPortalUrl } from "./contract";
import type { TenderRadarReviewCandidate } from "./reviewAdapter";

type ReviewTextField = Exclude<
  keyof TenderOpportunityReview,
  | "assigned_sales_id"
  | "domain"
  | "opportunity_type"
  | "radar_grade"
  | "radar_score"
  | "verification_status"
>;

export const TenderRadarReviewDialog = ({
  candidate,
  lead,
  onOpenChange,
  open,
}: {
  candidate: TenderRadarReviewCandidate;
  lead: LeadInboxRecord;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider<CrmDataProvider>();
  const [review, setReview] = useState<TenderOpportunityReview>(
    candidate.review,
  );
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const setText = (field: ReviewTextField, value: string) =>
    setReview((current) => ({
      ...current,
      [field]: value.trim() ? value : null,
    }));

  const setOpportunityType = (opportunityType: TenderOpportunityType) =>
    setReview((current) => ({
      ...current,
      official_need_no:
        opportunityType === "inquiry" ? current.official_need_no : null,
      official_source_url: getSetadPortalUrl(opportunityType),
      official_tender_no:
        opportunityType === "tender" ? current.official_tender_no : null,
      opportunity_type: opportunityType,
      verification_status: "pending_setad_verification",
    }));

  const verifiedIdentifierPresent =
    review.verification_status !== "setad_verified" ||
    (review.opportunity_type === "inquiry"
      ? Boolean(review.official_need_no?.trim())
      : Boolean(review.official_tender_no?.trim()));
  const canSubmit =
    confirmed &&
    review.title.trim() !== "" &&
    verifiedIdentifierPresent &&
    !saving;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const result = await dataProvider.importTenderOpportunity(
        lead.id,
        review,
      );
      notify(
        result.duplicate
          ? "resources.tender_intelligence.radar.already_imported"
          : "resources.tender_intelligence.radar.imported",
      );
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
          <DialogTitle>
            {translate("resources.tender_intelligence.review.title")}
          </DialogTitle>
          <DialogDescription>
            {translate("resources.tender_intelligence.review.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-amber-300/70 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          <ShieldCheck className="me-2 inline size-4" />
          {translate("resources.tender_intelligence.review.pending_notice")}
        </div>

        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          <ReviewReadOnly
            label={translate(
              "resources.tender_intelligence.review.radar_record_id",
            )}
            value={lead.source_record_id}
          />
          <ReviewReadOnly
            label={translate("resources.tender_intelligence.review.grade")}
            value={candidate.grade}
          />
          <ReviewReadOnly
            label={translate("resources.tender_intelligence.review.score")}
            value={candidate.score.toLocaleString("fa-IR")}
          />
        </dl>

        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewSelect
            label={translate("resources.tender_intelligence.fields.type")}
            onChange={(value) =>
              setOpportunityType(value as TenderOpportunityType)
            }
            options={[
              [
                "inquiry",
                translate("resources.tender_intelligence.type.inquiry"),
              ],
              [
                "tender",
                translate("resources.tender_intelligence.type.tender"),
              ],
            ]}
            value={review.opportunity_type}
          />
          <ReviewSelect
            label={translate("resources.tender_intelligence.fields.domain")}
            onChange={(value) =>
              setReview((current) => ({
                ...current,
                domain: value as TenderDomain,
              }))
            }
            options={[
              [
                "renewable_energy",
                translate(
                  "resources.tender_intelligence.domain.renewable_energy",
                ),
              ],
              [
                "security_systems",
                translate(
                  "resources.tender_intelligence.domain.security_systems",
                ),
              ],
            ]}
            value={review.domain}
          />
          <ReviewField
            label={translate(
              "resources.tender_intelligence.review.fields.title",
            )}
            onChange={(value) =>
              setReview((current) => ({ ...current, title: value }))
            }
            required
            value={review.title}
          />
          <ReviewField
            label={translate(
              review.opportunity_type === "inquiry"
                ? "resources.tender_intelligence.review.fields.need_no"
                : "resources.tender_intelligence.review.fields.tender_no",
            )}
            onChange={(value) =>
              setText(
                review.opportunity_type === "inquiry"
                  ? "official_need_no"
                  : "official_tender_no",
                value,
              )
            }
            value={
              (review.opportunity_type === "inquiry"
                ? review.official_need_no
                : review.official_tender_no) ?? ""
            }
          />
          <ReviewField
            label={translate(
              "resources.tender_intelligence.review.fields.organizer",
            )}
            onChange={(value) => setText("organizer", value)}
            value={review.organizer ?? ""}
          />
          <ReviewField
            label={translate(
              "resources.tender_intelligence.review.fields.province",
            )}
            onChange={(value) => setText("province", value)}
            value={review.province ?? ""}
          />
          <ReviewField
            label={translate(
              "resources.tender_intelligence.review.fields.city",
            )}
            onChange={(value) => setText("city", value)}
            value={review.city ?? ""}
          />
          <ReviewField
            label={translate(
              "resources.tender_intelligence.review.fields.trade",
            )}
            onChange={(value) => setText("trade", value)}
            value={review.trade ?? ""}
          />
          <ReviewField
            label={translate(
              "resources.tender_intelligence.review.fields.category",
            )}
            onChange={(value) => setText("category", value)}
            value={review.category ?? ""}
          />
          <ReviewField
            label={translate(
              "resources.tender_intelligence.review.fields.publish_date",
            )}
            onChange={(value) => setText("publish_date", value)}
            type="date"
            value={review.publish_date ?? ""}
          />
          <ReviewField
            label={translate(
              "resources.tender_intelligence.review.fields.document_deadline",
            )}
            onChange={(value) => setText("document_deadline", value)}
            type="date"
            value={review.document_deadline ?? ""}
          />
          <ReviewField
            label={translate(
              "resources.tender_intelligence.review.fields.submission_deadline",
            )}
            onChange={(value) => setText("submission_deadline", value)}
            type="date"
            value={review.submission_deadline ?? ""}
          />
          <ReviewSelect
            label={translate(
              "resources.tender_intelligence.review.fields.verification",
            )}
            onChange={(value) =>
              setReview((current) => ({
                ...current,
                verification_status: value as TenderVerificationStatus,
              }))
            }
            options={[
              [
                "pending_setad_verification",
                translate(
                  "resources.tender_intelligence.verification.pending_setad_verification",
                ),
              ],
              [
                "setad_verified",
                translate(
                  "resources.tender_intelligence.verification.setad_verified",
                ),
              ],
              [
                "data_conflict",
                translate(
                  "resources.tender_intelligence.verification.data_conflict",
                ),
              ],
            ]}
            value={review.verification_status}
          />
          <ReviewField
            label={translate(
              "resources.tender_intelligence.review.fields.official_url",
            )}
            onChange={(value) => setText("official_source_url", value)}
            type="url"
            value={review.official_source_url ?? ""}
          />
          <div className="flex items-end">
            <Button asChild className="w-full" variant="outline">
              <a
                href={getSetadPortalUrl(review.opportunity_type)}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="size-4" />
                {translate("resources.tender_intelligence.review.open_setad")}
              </a>
            </Button>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor={`tender-review-description-${lead.id}`}>
              {translate(
                "resources.tender_intelligence.review.fields.description",
              )}
            </Label>
            <Textarea
              id={`tender-review-description-${lead.id}`}
              onChange={(event) => setText("description", event.target.value)}
              value={review.description ?? ""}
            />
          </div>
        </div>

        {!verifiedIdentifierPresent ? (
          <p className="text-sm text-destructive">
            {translate(
              "resources.tender_intelligence.review.verified_identifier_required",
            )}
          </p>
        ) : null}

        <div className="flex items-start gap-2 rounded-md border p-3">
          <Checkbox
            checked={confirmed}
            id={`tender-review-confirm-${lead.id}`}
            onCheckedChange={(value) => setConfirmed(value === true)}
          />
          <Label
            className="leading-5"
            htmlFor={`tender-review-confirm-${lead.id}`}
          >
            {translate("resources.tender_intelligence.review.confirm")}
          </Label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {translate("ra.action.cancel")}
          </Button>
          <Button disabled={!canSubmit} onClick={submit}>
            {translate("resources.tender_intelligence.review.import")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ReviewReadOnly = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md bg-muted/60 p-2">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="mt-1 break-words font-medium">{value}</dd>
  </div>
);

const ReviewField = ({
  label,
  onChange,
  required,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: HTMLInputTypeAttribute;
  value: string;
}) => {
  const id = `tender-review-${useId()}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </div>
  );
};

const ReviewSelect = ({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: [string, string][];
  value: string;
}) => {
  const id = `tender-review-${useId()}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([optionValue, text]) => (
            <SelectItem key={optionValue} value={optionValue}>
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
