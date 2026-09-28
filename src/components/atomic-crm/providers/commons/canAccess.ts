import type { StaffRole } from "./staffRoles";

// FIXME: This should be exported from the ra-core package
type CanAccessParams<
  RecordType extends Record<string, any> = Record<string, any>,
> = {
  action: string;
  resource: string;
  record?: RecordType;
};

const READ_ACTIONS = new Set(["list", "show", "getList", "getOne", "export"]);

const CORE_RESOURCES = new Set([
  "contacts",
  "companies",
  "deals",
  "contact_notes",
  "deal_notes",
  "tasks",
  "tags",
]);

const PROJECT_RESOURCES = new Set([
  "projects",
  "project_cost_items",
  "procurement_commitments",
]);

const FINANCE_RESOURCES = new Set([
  "financial_receivables",
  "financial_payables",
  "financial_transactions",
]);

const INVENTORY_RESOURCES = new Set([
  "inventory_locations",
  "inventory_items",
  "inventory_movements",
]);

const LEAD_RESOURCES = new Set(["lead_inbox", "lead_conversions"]);

const TENDER_RESOURCES = new Set([
  "tender_opportunities",
  "tender_pipeline_entries",
  "tender_saved_searches",
  "tender_audit_log",
]);

const BUSINESS_RESOURCES = new Set([
  ...CORE_RESOURCES,
  ...PROJECT_RESOURCES,
  ...FINANCE_RESOURCES,
  ...INVENTORY_RESOURCES,
]);

const isRead = (action: string) => READ_ACTIONS.has(action);

export const canAccess = <
  RecordType extends Record<string, any> = Record<string, any>,
>(
  role: StaffRole,
  params: CanAccessParams<RecordType>,
) => {
  if (role === "admin") {
    return true;
  }

  const { action, resource } = params;

  if (resource === "daily_work_reports") {
    return (
      READ_ACTIONS.has(action) ||
      action === "create" ||
      action === "edit" ||
      action === "delete"
    );
  }

  if (resource === "configuration") {
    return false;
  }

  if (resource === "sales") {
    return role === "manager" && isRead(action);
  }

  if (LEAD_RESOURCES.has(resource)) {
    if (role !== "manager" && role !== "sales") return false;
    if (resource === "lead_conversions") return isRead(action);
    return isRead(action) || action === "edit";
  }

  if (TENDER_RESOURCES.has(resource)) {
    if (role !== "manager" && role !== "sales") return false;
    if (resource === "tender_opportunities" && action === "create") {
      return true;
    }
    if (resource === "tender_pipeline_entries" && action === "edit") {
      return true;
    }
    return isRead(action);
  }

  if (!BUSINESS_RESOURCES.has(resource)) {
    return false;
  }

  if (role === "manager") return true;
  if (role === "viewer") return isRead(action);

  if (role === "sales") {
    return (
      CORE_RESOURCES.has(resource) ||
      (PROJECT_RESOURCES.has(resource) && isRead(action))
    );
  }

  if (role === "project") {
    if (PROJECT_RESOURCES.has(resource)) return true;
    return (
      (CORE_RESOURCES.has(resource) || INVENTORY_RESOURCES.has(resource)) &&
      isRead(action)
    );
  }

  if (role === "finance") {
    if (FINANCE_RESOURCES.has(resource)) return true;
    return (
      (CORE_RESOURCES.has(resource) || PROJECT_RESOURCES.has(resource)) &&
      isRead(action)
    );
  }

  if (role === "inventory") {
    if (
      INVENTORY_RESOURCES.has(resource) ||
      resource === "procurement_commitments"
    ) {
      return true;
    }
    return (
      (CORE_RESOURCES.has(resource) || PROJECT_RESOURCES.has(resource)) &&
      isRead(action)
    );
  }

  return false;
};
