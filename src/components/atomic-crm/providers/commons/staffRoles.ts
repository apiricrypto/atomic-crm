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

export const resolveStaffRole = (sale: {
  role?: unknown;
  administrator?: boolean;
}): StaffRole => {
  if (isStaffRole(sale.role)) {
    return sale.role;
  }

  return sale.administrator ? "admin" : "sales";
};

export const isAdministratorRole = (role: StaffRole) => role === "admin";
