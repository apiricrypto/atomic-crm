import type { ProcurementCommitment } from "../../../types";
import type { Db } from "./types";

const statuses: ProcurementCommitment["status"][] = [
  "draft",
  "approved",
  "ordered",
  "received",
  "cancelled",
];

export const generateProcurementCommitments = (
  db: Db,
): ProcurementCommitment[] =>
  db.project_cost_items.slice(0, 10).map((costItem, index) => {
    const project = db.projects.find(
      (candidate) => candidate.id === costItem.project_id,
    )!;
    const status = statuses[index % statuses.length];

    return {
      id: index + 1,
      project_id: project.id,
      project_cost_item_id: costItem.id,
      supplier_company_id:
        db.companies[(index + 1) % db.companies.length]?.id ?? null,
      reference: `SATNO-PO-${String(index + 1).padStart(4, "0")}`,
      status,
      amount: Math.round(costItem.planned_amount * 0.9),
      currency: project.currency,
      expected_on: project.target_end_date,
      received_on: status === "received" ? project.target_end_date : null,
      notes: null,
      created_at: project.created_at,
      updated_at: project.updated_at,
      sales_id: project.sales_id,
    };
  });
