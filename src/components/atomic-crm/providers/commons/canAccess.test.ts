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
    expect(canAccess("sales", { action: "edit", resource: "lead_inbox" })).toBe(
      true,
    );
    expect(
      canAccess("sales", { action: "create", resource: "lead_inbox" }),
    ).toBe(false);
    expect(
      canAccess("manager", { action: "delete", resource: "lead_inbox" }),
    ).toBe(false);
    expect(
      canAccess("manager", { action: "edit", resource: "lead_conversions" }),
    ).toBe(false);
    expect(
      canAccess("finance", { action: "list", resource: "lead_inbox" }),
    ).toBe(false);
    expect(
      canAccess("sales", { action: "list", resource: "tender_opportunities" }),
    ).toBe(true);
    expect(
      canAccess("sales", {
        action: "create",
        resource: "tender_opportunities",
      }),
    ).toBe(true);
    expect(
      canAccess("manager", {
        action: "create",
        resource: "tender_opportunities",
      }),
    ).toBe(true);
    expect(
      canAccess("manager", {
        action: "edit",
        resource: "tender_pipeline_entries",
      }),
    ).toBe(true);
    expect(
      canAccess("sales", { action: "create", resource: "tender_audit_log" }),
    ).toBe(false);
    expect(
      canAccess("sales", {
        action: "edit",
        resource: "tender_pipeline_entries",
      }),
    ).toBe(true);
    expect(
      canAccess("finance", {
        action: "list",
        resource: "tender_opportunities",
      }),
    ).toBe(false);
  });

  it("makes viewer access read-only and denies unknown resources", () => {
    expect(canAccess("viewer", { action: "show", resource: "projects" })).toBe(
      true,
    );
    expect(
      canAccess("viewer", { action: "delete", resource: "projects" }),
    ).toBe(false);
    expect(
      canAccess("viewer", { action: "list", resource: "lead_inbox" }),
    ).toBe(false);
    expect(
      canAccess("viewer", { action: "list", resource: "configuration" }),
    ).toBe(false);
    expect(
      canAccess("manager", { action: "list", resource: "future_resource" }),
    ).toBe(false);
  });

  it("lets every enabled staff role manage its own daily reports", () => {
    expect(
      canAccess("viewer", {
        action: "create",
        resource: "daily_work_reports",
      }),
    ).toBe(true);
    expect(
      canAccess("manager", {
        action: "list",
        resource: "daily_work_reports",
      }),
    ).toBe(true);
    expect(
      canAccess("sales", {
        action: "approve",
        resource: "daily_work_reports",
      }),
    ).toBe(false);
  });
});
