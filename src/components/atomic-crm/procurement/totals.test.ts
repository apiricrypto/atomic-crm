import { describe, expect, it } from "vitest";

import { calculateProcurementTotals } from "./totals";

describe("calculateProcurementTotals", () => {
  it("keeps active, received, draft, and cancelled amounts separate", () => {
    expect(
      calculateProcurementTotals([
        { amount: 100, status: "draft" },
        { amount: 200, status: "approved" },
        { amount: 300, status: "ordered" },
        { amount: 400, status: "received" },
        { amount: 500, status: "cancelled" },
      ]),
    ).toEqual({
      activeCommitment: 500,
      cancelled: 500,
      draft: 100,
      received: 400,
    });
  });

  it("normalizes invalid amounts", () => {
    expect(
      calculateProcurementTotals([
        { amount: -1, status: "approved" },
        { amount: Number.NaN, status: "received" },
      ]),
    ).toEqual({
      activeCommitment: 0,
      cancelled: 0,
      draft: 0,
      received: 0,
    });
  });
});
