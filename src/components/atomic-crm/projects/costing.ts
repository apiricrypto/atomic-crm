import type { Project, ProjectCostItem } from "../types";

export type ProjectCosting = {
  contractAmount: number;
  plannedCost: number;
  actualCost: number;
  forecastCost: number;
  plannedMargin: number;
  forecastMargin: number;
};

const safeAmount = (value: number): number =>
  Number.isFinite(value) && value > 0 ? value : 0;

/**
 * Computes mutually exclusive costing totals.
 *
 * Planned and actual values are never added together. Forecast uses the
 * larger value on each cost line, so an actual invoice replacing an estimate
 * cannot be counted twice.
 */
export const calculateProjectCosting = (
  project: Pick<Project, "contract_amount">,
  costItems: Array<Pick<ProjectCostItem, "planned_amount" | "actual_amount">>,
): ProjectCosting => {
  const contractAmount = safeAmount(project.contract_amount);
  const plannedCost = costItems.reduce(
    (total, item) => total + safeAmount(item.planned_amount),
    0,
  );
  const actualCost = costItems.reduce(
    (total, item) => total + safeAmount(item.actual_amount),
    0,
  );
  const forecastCost = costItems.reduce(
    (total, item) =>
      total +
      Math.max(safeAmount(item.planned_amount), safeAmount(item.actual_amount)),
    0,
  );

  return {
    contractAmount,
    plannedCost,
    actualCost,
    forecastCost,
    plannedMargin: contractAmount - plannedCost,
    forecastMargin: contractAmount - forecastCost,
  };
};
