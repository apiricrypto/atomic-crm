import { useState } from "react";
import { CanAccess, useGetList, useTranslate } from "ra-core";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { LeadInboxRecord } from "../types";
import { getSetadPortalUrl, type TenderOpportunityType } from "./contract";
import { buildTenderRadarReviewCandidate } from "./reviewAdapter";
import { TenderRadarReviewDialog } from "./TenderRadarReviewDialog";
import { TenderPipelineBoard } from "./TenderPipelineBoard";
import { TenderSavedSearches } from "./TenderSavedSearches";

export const TenderIntelligencePage = () => {
  const translate = useTranslate();

  return (
    <section className="w-full px-4 pb-20 md:px-0 md:pb-0">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">
          {translate("resources.tender_intelligence.name")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {translate("resources.tender_intelligence.subtitle")}
        </p>
      </div>

      <Tabs defaultValue="radar" dir="rtl">
        <div className="overflow-x-auto pb-1">
          <TabsList className="grid h-auto min-w-[42rem] grid-cols-4 md:min-w-0 md:w-full">
            <TabsTrigger value="radar">
              {translate("resources.tender_intelligence.tabs.radar")}
            </TabsTrigger>
            <TabsTrigger value="setad">
              {translate("resources.tender_intelligence.tabs.setad")}
            </TabsTrigger>
            <TabsTrigger value="pipeline">
              {translate("resources.tender_intelligence.tabs.pipeline")}
            </TabsTrigger>
            <TabsTrigger value="saved_searches">
              {translate("resources.tender_intelligence.tabs.saved_searches")}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="radar">
          <RadarInboxSkeleton />
        </TabsContent>
        <TabsContent value="setad">
          <SetadSearchSkeleton />
        </TabsContent>
        <TabsContent value="pipeline">
          <TenderPipelineBoard />
        </TabsContent>
        <TabsContent value="saved_searches">
          <TenderSavedSearches />
        </TabsContent>
      </Tabs>
    </section>
  );
};

const RadarInboxSkeleton = () => {
  const translate = useTranslate();
  const { data = [], isPending } = useGetList<LeadInboxRecord>("lead_inbox", {
    filter: { source: "tender_radar" },
    pagination: { page: 1, perPage: 25 },
    sort: { field: "captured_at", order: "DESC" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {translate("resources.tender_intelligence.radar.title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {translate("resources.tender_intelligence.radar.contract_notice")}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending ? null : data.length ? (
          data.map((lead) => (
            <TenderRadarCard
              key={`${lead.source}:${lead.source_record_id}`}
              lead={lead}
            />
          ))
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
            {translate("resources.tender_intelligence.radar.empty")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const TenderRadarCard = ({ lead }: { lead: LeadInboxRecord }) => {
  const translate = useTranslate();
  const candidate = buildTenderRadarReviewCandidate(lead);
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold">{lead.title}</h2>
          <p className="text-sm text-muted-foreground">
            {lead.organization_name || "—"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {candidate ? (
            <Badge variant="secondary">
              {translate("resources.tender_intelligence.radar.grade_score", {
                grade: candidate.grade,
                score: candidate.score.toLocaleString("fa-IR"),
              })}
            </Badge>
          ) : null}
          <Badge variant="outline">
            {translate(
              "resources.tender_intelligence.verification.pending_setad_verification",
            )}
          </Badge>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {translate("resources.tender_intelligence.radar.quarantine")}
      </p>
      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t pt-3">
        {candidate && lead.status === "qualified" ? (
          <CanAccess resource="tender_opportunities" action="create">
            <Button size="sm" onClick={() => setReviewOpen(true)}>
              {translate("resources.tender_intelligence.radar.review_import")}
            </Button>
          </CanAccess>
        ) : candidate ? (
          <Button asChild size="sm" variant="outline">
            <Link to="/lead_inbox">
              {translate("resources.tender_intelligence.radar.qualify_first")}
            </Link>
          </Button>
        ) : (
          <Badge variant="outline">
            {translate("resources.tender_intelligence.radar.not_importable")}
          </Badge>
        )}
      </div>
      {candidate ? (
        <TenderRadarReviewDialog
          candidate={candidate}
          lead={lead}
          onOpenChange={setReviewOpen}
          open={reviewOpen}
        />
      ) : null}
    </div>
  );
};

const SetadSearchSkeleton = () => {
  const translate = useTranslate();
  const [opportunityType, setOpportunityType] =
    useState<TenderOpportunityType>("inquiry");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {translate("resources.tender_intelligence.setad.title")}
        </CardTitle>
        <div className="rounded-lg border border-amber-300/70 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          <ShieldAlert className="me-2 inline size-4" />
          {translate("resources.tender_intelligence.setad.human_notice")}
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SearchSelect
            label={translate("resources.tender_intelligence.fields.domain")}
            name="domain"
            options={[
              ["renewable_energy", "انرژی‌های نو"],
              ["security_systems", "سیستم‌های امنیتی"],
            ]}
          />
          <div className="space-y-2">
            <Label htmlFor="tender-opportunity-type">
              {translate("resources.tender_intelligence.fields.type")}
            </Label>
            <Select
              value={opportunityType}
              onValueChange={(value: TenderOpportunityType) =>
                setOpportunityType(value)
              }
            >
              <SelectTrigger id="tender-opportunity-type">
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
    <Label htmlFor={`tender-${name}`}>{label}</Label>
    <Input id={`tender-${name}`} name={name} type={type} />
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
    <Label htmlFor={`tender-${name}`}>{label}</Label>
    <Select defaultValue={options[0][0]} name={name}>
      <SelectTrigger id={`tender-${name}`}>
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
