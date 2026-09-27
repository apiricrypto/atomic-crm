import { describe, expect, it } from "vitest";

import { calculateProjectCosting } from "./costing";

describe("calculateProjectCosting", () => {
  it("does not double count planned and actual values", () => {
    const result = calculateProjectCosting({ contract_amount: 1_000_000 }, [
      { planned_amount: 300_000, actual_amount: 320_000 },
      { planned_amount: 200_000, actual_amount: 0 },
    ]);

    expect(result).toEqual({
      actualCost: 320_000,
      contractAmount: 1_000_000,
      forecastCost: 520_000,
      forecastMargin: 480_000,
      plannedCost: 500_000,
      plannedMargin: 500_000,
    });
  });

  it("normalizes invalid and negative inputs instead of corrupting totals", () => {
    const result = calculateProjectCosting({ contract_amount: Number.NaN }, [
      { planned_amount: -10, actual_amount: Number.POSITIVE_INFINITY },
    ]);

    expect(result).toEqual({
      actualCost: 0,
      contractAmount: 0,
      forecastCost: 0,
      forecastMargin: 0,
      plannedCost: 0,
      plannedMargin: 0,
    });
  });
});
