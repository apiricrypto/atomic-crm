import type {
  InventoryItem,
  InventoryLocation,
  InventoryMovement,
} from "../../../types";
import type { Db } from "./types";

const createdAt = "2026-01-01T08:00:00.000Z";

export const generateInventoryLocations = (): InventoryLocation[] => [
  {
    active: true,
    code: "AHV-MAIN",
    created_at: createdAt,
    id: 1,
    name: "انبار مرکزی اهواز",
    updated_at: createdAt,
  },
  {
    active: true,
    code: "PROJECT-STAGE",
    created_at: createdAt,
    id: 2,
    name: "محوطه تجهیز پروژه",
    updated_at: createdAt,
  },
];

export const generateInventoryItems = (): InventoryItem[] => [
  item(1, "PV-TRINA-715", "پنل خورشیدی ترینا ۷۱۵ وات", "piece", 20),
  item(2, "INV-HYBRID-12K", "اینورتر هیبریدی ۱۲ کیلووات", "piece", 2),
  item(3, "CABLE-PV-6", "کابل خورشیدی نمره ۶", "meter", 500),
  item(4, "MC4-PAIR", "جفت کانکتور MC4", "set", 50),
  item(5, "BAT-LFP-16K", "باتری لیتیومی ۱۶ کیلووات‌ساعت", "piece", 2),
];

export const generateInventoryMovements = (db: Db): InventoryMovement[] => {
  const receivedCommitment = db.procurement_commitments.find(
    ({ status }) => status === "received",
  );
  const firstProject = db.projects[0];

  return [
    movement({
      id: 1,
      item_id: 1,
      procurement_commitment_id: receivedCommitment?.id ?? null,
      quantity: 100,
      reference: "SATNO-GR-0001",
      sales_id: receivedCommitment?.sales_id,
      type: "receipt",
    }),
    movement({
      id: 2,
      item_id: 1,
      project_id: firstProject?.id ?? null,
      quantity: 32,
      reference: "SATNO-GI-0001",
      sales_id: firstProject?.sales_id,
      type: "issue",
    }),
    movement({
      id: 3,
      item_id: 2,
      quantity: 4,
      reference: "SATNO-GR-0002",
      type: "receipt",
    }),
    movement({
      id: 4,
      item_id: 3,
      quantity: 900,
      reference: "SATNO-GR-0003",
      type: "receipt",
    }),
    movement({
      id: 5,
      item_id: 3,
      project_id: firstProject?.id ?? null,
      quantity: 450,
      reference: "SATNO-GI-0002",
      sales_id: firstProject?.sales_id,
      type: "issue",
    }),
  ];
};

const item = (
  id: number,
  sku: string,
  name: string,
  unit: InventoryItem["unit"],
  reorderLevel: number,
): InventoryItem => ({
  active: true,
  created_at: createdAt,
  id,
  name,
  reorder_level: reorderLevel,
  sku,
  unit,
  updated_at: createdAt,
});

const movement = (
  overrides: Partial<InventoryMovement>,
): InventoryMovement => ({
  created_at: createdAt,
  id: 1,
  item_id: 1,
  location_id: 1,
  notes: null,
  occurred_at: createdAt,
  procurement_commitment_id: null,
  project_id: null,
  quantity: 1,
  reference: "SATNO-INV-0001",
  sales_id: 1,
  type: "receipt",
  ...overrides,
});
