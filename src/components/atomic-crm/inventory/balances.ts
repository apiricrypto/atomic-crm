import type { Identifier } from "ra-core";

import type { InventoryItem, InventoryMovement } from "../types";

export type InventoryBalance = {
  item: InventoryItem;
  onHand: number;
  belowReorderLevel: boolean;
  negative: boolean;
};

const signedQuantity = (movement: InventoryMovement): number => {
  const quantity =
    Number.isFinite(movement.quantity) && movement.quantity > 0
      ? movement.quantity
      : 0;
  return movement.type === "receipt" || movement.type === "adjustment_in"
    ? quantity
    : -quantity;
};

export const calculateInventoryBalances = (
  items: InventoryItem[],
  movements: InventoryMovement[],
): InventoryBalance[] => {
  const totals = new Map<Identifier, number>();

  for (const movement of movements) {
    totals.set(
      movement.item_id,
      (totals.get(movement.item_id) ?? 0) + signedQuantity(movement),
    );
  }

  return items.map((item) => {
    const onHand = totals.get(item.id) ?? 0;
    return {
      item,
      onHand,
      belowReorderLevel: item.active && onHand <= item.reorder_level,
      negative: onHand < 0,
    };
  });
};
