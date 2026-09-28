import { useState } from "react";
import {
  CanAccess,
  useDataProvider,
  useGetList,
  useNotify,
  useRefresh,
} from "ra-core";
import { Pencil, Plus, Trash2 } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { CrmDataProvider } from "../providers/types";
import type {
  TenderDomain,
  TenderSavedSearch,
  TenderSavedSearchInput,
  TenderVerificationStatus,
} from "../types";

const emptySearch = (): TenderSavedSearchInput => ({
  active: true,
  category: null,
  cities: [],
  deadline_from: null,
  deadline_to: null,
  domain: "renewable_energy",
  keywords: [],
  name: "",
  opportunity_type: null,
  organizer: null,
  provinces: [],
  publish_from: null,
  publish_to: null,
  statuses: ["pending_setad_verification"],
  trade: null,
});

const STARTERS: readonly TenderSavedSearchInput[] = [
  {
    ...emptySearch(),
    keywords: ["خورشیدی"],
    name: "خورشیدی خوزستان",
    provinces: ["خوزستان"],
  },
  {
    ...emptySearch(),
    domain: "security_systems",
    keywords: ["UPS"],
    name: "UPS چهار استان هدف",
    provinces: ["خوزستان", "چهارمحال و بختیاری", "ایلام", "لرستان"],
  },
  {
    ...emptySearch(),
    domain: "security_systems",
    keywords: ["CCTV", "دوربین مداربسته"],
    name: "CCTV خوزستان و ایلام",
    provinces: ["خوزستان", "ایلام"],
  },
];

export const TenderSavedSearches = () => {
  const { data = [], isPending } = useGetList<TenderSavedSearch>(
    "tender_saved_searches",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "updated_at", order: "DESC" },
    },
  );
  const [draft, setDraft] = useState<TenderSavedSearchInput | null>(null);
  const [searchId, setSearchId] = useState<TenderSavedSearch["id"] | null>(
    null,
  );
  const openCreate = (starter = emptySearch()) => {
    setSearchId(null);
    setDraft({ ...starter });
  };
  const openEdit = (record: TenderSavedSearch) => {
    setSearchId(record.id);
    setDraft(toInput(record));
  };

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>جست‌وجوهای ذخیره‌شده</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            پروفایل‌های شخصی فیلتر؛ بدون ذخیرهٔ ورود، CAPTCHA یا نشست ستاد.
          </p>
        </div>
        <CanAccess resource="tender_saved_searches" action="create">
          <Button onClick={() => openCreate()}>
            <Plus className="size-4" /> جست‌وجوی جدید
          </Button>
        </CanAccess>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {STARTERS.map((starter) => (
            <button
              className="rounded-lg border p-4 text-start hover:bg-muted/50"
              key={starter.name}
              onClick={() => openCreate(starter)}
              type="button"
            >
              <strong>{starter.name}</strong>
              <span className="mt-2 block text-xs text-muted-foreground">
                {starter.provinces.join("، ")} • {starter.keywords.join("، ")}
              </span>
            </button>
          ))}
        </div>
        {isPending ? null : data.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.map((record) => (
              <SavedSearchCard
                key={String(record.id)}
                onEdit={openEdit}
                record={record}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            هنوز پروفایل ذخیره‌شده‌ای وجود ندارد.
          </p>
        )}
      </CardContent>
      {draft ? (
        <SavedSearchDialog
          initial={draft}
          onClose={() => setDraft(null)}
          searchId={searchId}
        />
      ) : null}
    </Card>
  );
};

const SavedSearchCard = ({
  onEdit,
  record,
}: {
  onEdit: (record: TenderSavedSearch) => void;
  record: TenderSavedSearch;
}) => {
  const provider = useDataProvider<CrmDataProvider>();
  const notify = useNotify();
  const refresh = useRefresh();
  const remove = async () => {
    if (!window.confirm(`پروفایل «${record.name}» حذف شود؟`)) return;
    try {
      await provider.deleteTenderSearch(record.id);
      notify("پروفایل حذف و رویداد ممیزی ثبت شد.");
      refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : String(error), {
        type: "error",
      });
    }
  };
  return (
    <article className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{record.name}</h3>
        <Badge variant={record.active ? "secondary" : "outline"}>
          {record.active ? "فعال" : "غیرفعال"}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {record.domain === "renewable_energy"
          ? "انرژی‌های نو"
          : "سیستم‌های امنیتی"}
        {record.opportunity_type === "inquiry"
          ? " • استعلام"
          : record.opportunity_type === "tender"
            ? " • مناقصه"
            : " • همه فرصت‌ها"}
      </p>
      <p className="mt-2 text-sm">
        {[...record.provinces, ...record.cities, ...record.keywords].join(
          "، ",
        ) || "بدون محدودیت مکانی/کلیدواژه"}
      </p>
      <div className="mt-4 flex gap-2 border-t pt-3">
        <Button onClick={() => onEdit(record)} size="sm" variant="outline">
          <Pencil className="size-3.5" /> ویرایش
        </Button>
        <Button onClick={remove} size="sm" variant="outline">
          <Trash2 className="size-3.5" /> حذف
        </Button>
      </div>
    </article>
  );
};

const SavedSearchDialog = ({
  initial,
  onClose,
  searchId,
}: {
  initial: TenderSavedSearchInput;
  onClose: () => void;
  searchId: TenderSavedSearch["id"] | null;
}) => {
  const [search, setSearch] = useState(initial);
  const [saving, setSaving] = useState(false);
  const provider = useDataProvider<CrmDataProvider>();
  const notify = useNotify();
  const refresh = useRefresh();
  const save = async () => {
    if (!search.name.trim() || saving) return;
    setSaving(true);
    try {
      await provider.saveTenderSearch(searchId, search);
      notify("پروفایل و رویداد ممیزی ثبت شد.");
      onClose();
      refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : String(error), {
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };
  const set = <K extends keyof TenderSavedSearchInput>(
    key: K,
    value: TenderSavedSearchInput[K],
  ) => setSearch((current) => ({ ...current, [key]: value }));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {searchId == null
              ? "جست‌وجوی ذخیره‌شدهٔ جدید"
              : "ویرایش جست‌وجوی ذخیره‌شده"}
          </DialogTitle>
          <DialogDescription>
            فقط فیلترها ذخیره می‌شوند؛ credential، cookie، OTP، CAPTCHA و
            session پذیرفته نمی‌شوند.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="نام پروفایل"
            value={search.name}
            onChange={(v) => set("name", v)}
          />
          <Choice
            label="حوزه"
            value={search.domain}
            onChange={(v) => set("domain", v as TenderDomain)}
            options={[
              ["renewable_energy", "انرژی‌های نو"],
              ["security_systems", "سیستم‌های امنیتی"],
            ]}
          />
          <Choice
            label="نوع فرصت"
            value={search.opportunity_type ?? "all"}
            onChange={(v) =>
              set(
                "opportunity_type",
                v === "all" ? null : (v as "inquiry" | "tender"),
              )
            }
            options={[
              ["all", "همه"],
              ["inquiry", "استعلام"],
              ["tender", "مناقصه"],
            ]}
          />
          <Choice
            label="وضعیت تطبیق"
            value={search.statuses[0] ?? "all"}
            onChange={(v) =>
              set(
                "statuses",
                v === "all" ? [] : [v as TenderVerificationStatus],
              )
            }
            options={[
              ["all", "همه"],
              ["pending_setad_verification", "در انتظار تطبیق ستاد"],
              ["setad_verified", "تأییدشده در ستاد"],
              ["data_conflict", "تعارض داده"],
            ]}
          />
          <ListField
            label="استان‌ها"
            values={search.provinces}
            onChange={(v) => set("provinces", v)}
          />
          <ListField
            label="شهرها"
            values={search.cities}
            onChange={(v) => set("cities", v)}
          />
          <ListField
            label="کلمات کلیدی"
            values={search.keywords}
            onChange={(v) => set("keywords", v)}
          />
          <Field
            label="رسته"
            value={search.trade ?? ""}
            onChange={(v) => set("trade", v || null)}
          />
          <Field
            label="دسته"
            value={search.category ?? ""}
            onChange={(v) => set("category", v || null)}
          />
          <Field
            label="دستگاه برگزارکننده"
            value={search.organizer ?? ""}
            onChange={(v) => set("organizer", v || null)}
          />
          <DateField
            label="انتشار از"
            value={search.publish_from}
            onChange={(v) => set("publish_from", v)}
          />
          <DateField
            label="انتشار تا"
            value={search.publish_to}
            onChange={(v) => set("publish_to", v)}
          />
          <DateField
            label="مهلت از"
            value={search.deadline_from}
            onChange={(v) => set("deadline_from", v)}
          />
          <DateField
            label="مهلت تا"
            value={search.deadline_to}
            onChange={(v) => set("deadline_to", v)}
          />
          <Choice
            label="فعال بودن"
            value={search.active ? "yes" : "no"}
            onChange={(v) => set("active", v === "yes")}
            options={[
              ["yes", "فعال"],
              ["no", "غیرفعال"],
            ]}
          />
        </div>
        <DialogFooter>
          <Button disabled={!search.name.trim() || saving} onClick={save}>
            {saving ? "در حال ذخیره…" : "ذخیره پروفایل"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({
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
    <Input
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);
const ListField = ({
  label,
  onChange,
  values,
}: {
  label: string;
  onChange: (values: string[]) => void;
  values: string[];
}) => (
  <Field
    label={label}
    value={values.join("، ")}
    onChange={(value) =>
      onChange(
        value
          .split(/[،,]/)
          .map((item) => item.trim())
          .filter(Boolean),
      )
    }
  />
);
const DateField = ({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string | null) => void;
  value?: string | null;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input
      aria-label={label}
      type="date"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value || null)}
    />
  </div>
);
const Choice = ({
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
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([key, text]) => (
          <SelectItem key={key} value={key}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const toInput = (record: TenderSavedSearch): TenderSavedSearchInput => ({
  active: record.active,
  category: record.category ?? null,
  cities: record.cities,
  deadline_from: record.deadline_from ?? null,
  deadline_to: record.deadline_to ?? null,
  domain: record.domain,
  keywords: record.keywords,
  name: record.name,
  opportunity_type: record.opportunity_type ?? null,
  organizer: record.organizer ?? null,
  provinces: record.provinces,
  publish_from: record.publish_from ?? null,
  publish_to: record.publish_to ?? null,
  statuses: record.statuses,
  trade: record.trade ?? null,
});
