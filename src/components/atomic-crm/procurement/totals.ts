import type { ProcurementCommitment } from "../types";

export type ProcurementTotals = {
  draft: number;
  activeCommitment: number;
  received: number;
  cancelled: number;
};

const safeAmount = (amount: number): number =>
  Number.isFinite(amount) && amount > 0 ? amount : 0;

/**
 * Keeps procurement states mutually exclusive. In particular, a received
 * commitment is not also counted as active, and none of these values is a
 * payment or an actual project cost.
 */
export const calculateProcurementTotals = (
  commitments: Array<Pick<ProcurementCommitment, "amount" | "status">>,
): ProcurementTotals =>
  commitments.reduce<ProcurementTotals>(
    (totals, commitment) => {
      const amount = safeAmount(commitment.amount);

      switch (commitment.status) {
        case "draft":
          totals.draft += amount;
          break;
        case "approved":
        case "ordered":
          totals.activeCommitment += amount;
          break;
        case "received":
          totals.received += amount;
          break;
        case "cancelled":
          totals.cancelled += amount;
          break;
      }

      return totals;
    },
    { activeCommitment: 0, cancelled: 0, draft: 0, received: 0 },
  );
