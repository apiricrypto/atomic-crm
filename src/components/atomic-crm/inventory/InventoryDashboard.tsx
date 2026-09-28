import { useGetList, useLocaleState, useTranslate } from "ra-core";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getMoneyLocale } from "../root/useFormatMoney";
import type {
  InventoryItem,
  InventoryLocation,
  InventoryMovement,
} from "../types";
import { calculateInventoryBalances } from "./balances";

const listParams = {
  pagination: { page: 1, perPage: 1_000 },
  sort: { field: "id", order: "ASC" as const },
};

export const InventoryDashboard = () => {
  const translate = useTranslate();
  const [locale] = useLocaleState();
  const { data: items = [], isPending: itemsPending } =
    useGetList<InventoryItem>("inventory_items", listParams);
  const { data: locations = [], isPending: locationsPending } =
    useGetList<InventoryLocation>("inventory_locations", listParams);
  const { data: movements = [], isPending: movementsPending } =
    useGetList<InventoryMovement>("inventory_movements", listParams);
  const balances = calculateInventoryBalances(items, movements);
  const numberLocale = getMoneyLocale(locale);
  const displayQuantity = (quantity: number) =>
    new Intl.NumberFormat(numberLocale, {
      maximumFractionDigits: 3,
    }).format(quantity);

  if (itemsPending || locationsPending || movementsPending) return null;

  const itemNames = new Map(items.map((item) => [item.id, item.name]));
  const locationNames = new Map(
    locations.map((location) => [location.id, location.name]),
  );

  return (
    <section className="w-full px-4 pb-20 md:px-0 md:pb-0">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">
          {translate("resources.inventory.name")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {translate("resources.inventory.subtitle")}
        </p>
      </div>

      <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        {translate("resources.inventory.accounting_notice")}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryMetric
          label={translate("resources.inventory.summary.active_items")}
          value={String(items.filter(({ active }) => active).length)}
        />
        <SummaryMetric
          label={translate("resources.inventory.summary.low_stock")}
          value={String(
            balances.filter(({ belowReorderLevel }) => belowReorderLevel)
              .length,
          )}
        />
        <SummaryMetric
          label={translate("resources.inventory.summary.negative_stock")}
          value={String(balances.filter(({ negative }) => negative).length)}
        />
      </div>

      {!balances.length ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          {translate("resources.inventory.empty")}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {balances.map(({ belowReorderLevel, item, negative, onHand }) => (
              <Card key={item.id} className="gap-4 py-5">
                <CardHeader className="px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">
                        {item.name}
                      </CardTitle>
                      <p
                        className="mt-1 text-xs text-muted-foreground"
                        dir="ltr"
                      >
                        {item.sku}
                      </p>
                    </div>
                    {negative ? (
                      <Badge variant="destructive">
                        {translate("resources.inventory.status.negative")}
                      </Badge>
                    ) : belowReorderLevel ? (
                      <Badge variant="outline">
                        {translate("resources.inventory.status.low")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {translate("resources.inventory.status.available")}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 px-5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      {translate("resources.inventory.fields.on_hand")}
                    </span>
                    <strong>
                      {displayQuantity(onHand)}{" "}
                      {translate(`resources.inventory.unit.${item.unit}`)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      {translate("resources.inventory.fields.reorder_level")}
                    </span>
                    <span>{displayQuantity(item.reorder_level)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">
              {translate("resources.inventory.recent_movements")}
            </h2>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {[...movements]
                .sort((left, right) =>
                  right.occurred_at.localeCompare(left.occurred_at),
                )
                .slice(0, 12)
                .map((movement) => (
                  <Card key={movement.id} className="gap-3 py-4">
                    <CardHeader className="px-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="truncate text-sm">
                            {itemNames.get(movement.item_id) ?? "—"}
                          </CardTitle>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {locationNames.get(movement.location_id) ?? "—"}
                          </p>
                        </div>
                        <Badge variant={movementVariant(movement.type)}>
                          {translate(
                            `resources.inventory.movement.${movement.type}`,
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-3 px-4 text-sm">
                      <strong>{displayQuantity(movement.quantity)}</strong>
                      <span className="text-muted-foreground" dir="ltr">
                        {movement.reference}
                      </span>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const SummaryMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border bg-card p-4">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="mt-1 font-semibold">{value}</div>
  </div>
);

const movementVariant = (
  type: InventoryMovement["type"],
): "default" | "destructive" | "outline" | "secondary" => {
  if (type === "issue" || type === "adjustment_out") return "outline";
  if (type === "adjustment_in") return "secondary";
  return "default";
};
