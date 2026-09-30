import { describe, expect, it } from "vitest";

import { canAccess } from "./canAccess";
import { resolveStaffRole } from "./staffRoles";

describe("staff access matrix", () => {
  it("keeps legacy administrator records compatible", () => {
    expect(resolveStaffRole({ administrator: true })).toBe("admin");
    expect(resolveStaffRole({ administrator: false })).toBe("sales");
    expect(resolveStaffRole({ role: "finance", administrator: true })).toBe(
      "finance",
    );
  });

  it("gives administrators full access", () => {
    expect(canAccess("admin", { action: "delete", resource: "sales" })).toBe(
      true,
    );
    expect(
      canAccess("admin", { action: "edit", resource: "configuration" }),
    ).toBe(true);
  });

  it("lets managers read staff but not administer accounts", () => {
    expect(canAccess("manager", { action: "list", resource: "sales" })).toBe(
      true,
    );
    expect(canAccess("manager", { action: "edit", resource: "sales" })).toBe(
      false,
    );
  });

  it("keeps operational roles inside their write domains", () => {
    expect(canAccess("sales", { action: "edit", resource: "deals" })).toBe(
      true,
    );
    expect(canAccess("sales", { action: "edit", resource: "projects" })).toBe(
      false,
    );
    expect(canAccess("project", { action: "edit", resource: "projects" })).toBe(
      true,
    );
    expect(
      canAccess("finance", {
        action: "edit",
        resource: "financial_payables",
      }),
    ).toBe(true);
    expect(
      canAccess("inventory", {
        action: "create",
        resource: "inventory_movements",
      }),
    ).toBe(true);
  });

  it("makes viewer access read-only and denies unknown resources", () => {
    expect(canAccess("viewer", { action: "show", resource: "projects" })).toBe(
      true,
    );
    expect(
      canAccess("viewer", { action: "delete", resource: "projects" }),
    ).toBe(false);
    expect(
      canAccess("viewer", { action: "list", resource: "configuration" }),
    ).toBe(false);
    expect(
      canAccess("manager", { action: "list", resource: "future_resource" }),
    ).toBe(false);
  });
});
