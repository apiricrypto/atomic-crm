import { describe, expect, it } from "vitest";

import type { InventoryItem, InventoryMovement } from "../types";
import { calculateInventoryBalances } from "./balances";

describe("calculateInventoryBalances", () => {
  it("derives stock from explicit receipts, issues, and adjustments", () => {
    expect(
      calculateInventoryBalances(
        [item({ reorder_level: 75 })],
        [
          movement({ quantity: 100, type: "receipt" }),
          movement({ id: 2, quantity: 30, type: "issue" }),
          movement({ id: 3, quantity: 5, type: "adjustment_in" }),
        ],
      )[0],
    ).toMatchObject({
      belowReorderLevel: true,
      negative: false,
      onHand: 75,
    });
  });

  it("does not infer stock from an item without movements", () => {
    expect(calculateInventoryBalances([item()], [])[0].onHand).toBe(0);
  });

  it("surfaces negative stock instead of hiding it", () => {
    expect(
      calculateInventoryBalances(
        [item({ reorder_level: 0 })],
        [movement({ quantity: 2, type: "issue" })],
      )[0],
    ).toMatchObject({ belowReorderLevel: true, negative: true, onHand: -2 });
  });
});

const item = (overrides: Partial<InventoryItem> = {}): InventoryItem => ({
  active: true,
  created_at: "2025-01-01T00:00:00Z",
  id: 1,
  name: "پنل خورشیدی",
  reorder_level: 10,
  sku: "PV-001",
  unit: "piece",
  updated_at: "2025-01-01T00:00:00Z",
  ...overrides,
});

const movement = (
  overrides: Partial<InventoryMovement> = {},
): InventoryMovement => ({
  created_at: "2025-01-01T00:00:00Z",
  id: 1,
  item_id: 1,
  location_id: 1,
  notes: null,
  occurred_at: "2025-01-01T00:00:00Z",
  procurement_commitment_id: null,
  project_id: null,
  quantity: 1,
  reference: "INV-1",
  sales_id: 1,
  type: "receipt",
  ...overrides,
});
