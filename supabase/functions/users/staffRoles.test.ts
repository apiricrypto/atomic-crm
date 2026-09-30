import { describe, expect, it } from "vitest";

import {
  isAdministrator,
  requireStaffRole,
  wouldLockOutSelfAdministrator,
} from "./staffRoles.ts";

describe("staff role validation", () => {
  it.each([
    "admin",
    "manager",
    "sales",
    "project",
    "finance",
    "inventory",
    "viewer",
  ])("accepts %s", (role) => {
    expect(requireStaffRole(role)).toBe(role);
  });

  it("rejects missing and unknown roles", () => {
    expect(() => requireStaffRole(undefined)).toThrow("Invalid staff role");
    expect(() => requireStaffRole("owner")).toThrow("Invalid staff role");
  });

  it("uses the legacy administrator flag only when role is absent", () => {
    expect(isAdministrator({ role: "admin", administrator: false })).toBe(true);
    expect(isAdministrator({ role: "finance", administrator: true })).toBe(
      false,
    );
    expect(isAdministrator({ administrator: true })).toBe(true);
  });

  it("detects administrator self-lockout", () => {
    const currentSale = { id: 7, role: "admin" };
    expect(
      wouldLockOutSelfAdministrator({
        currentSale,
        targetSale: { id: 7 },
        nextRole: "finance",
      }),
    ).toBe(true);
    expect(
      wouldLockOutSelfAdministrator({
        currentSale,
        targetSale: { id: 8 },
        nextRole: "finance",
      }),
    ).toBe(false);
  });
});
