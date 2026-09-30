export const STAFF_ROLES = [
  "admin",
  "manager",
  "sales",
  "project",
  "finance",
  "inventory",
  "viewer",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export const isStaffRole = (value: unknown): value is StaffRole =>
  typeof value === "string" && STAFF_ROLES.includes(value as StaffRole);

export const requireStaffRole = (value: unknown): StaffRole => {
  if (!isStaffRole(value)) {
    throw Object.assign(new Error("Invalid staff role"), {
      status: 400,
      code: "invalid_staff_role",
    });
  }
  return value;
};

export const isAdministrator = (sale: {
  role?: unknown;
  administrator?: boolean;
}) =>
  sale.role === "admin" || (sale.role == null && sale.administrator === true);

export const wouldLockOutSelfAdministrator = ({
  currentSale,
  targetSale,
  nextRole,
  disabled,
}: {
  currentSale: { id: number; role?: unknown; administrator?: boolean };
  targetSale: { id: number };
  nextRole?: unknown;
  disabled?: boolean;
}) =>
  currentSale.id === targetSale.id &&
  isAdministrator(currentSale) &&
  (disabled === true || (nextRole !== undefined && nextRole !== "admin"));
