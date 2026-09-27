import type { Project, ProjectCostItem } from "../../../types";
import type { Db } from "./types";

export const generateProjects = (db: Db): Project[] =>
  db.deals.slice(0, 6).map((deal, index) => ({
    id: index + 1,
    name: deal.name,
    code: `SATNO-${String(index + 1).padStart(4, "0")}`,
    deal_id: deal.id,
    company_id: deal.company_id,
    status: index === 0 ? "planned" : index < 5 ? "active" : "completed",
    contract_amount: deal.amount,
    currency: "USD",
    start_date: deal.expected_closing_date,
    target_end_date: deal.expected_closing_date,
    completed_at: index === 5 ? deal.updated_at : null,
    created_at: deal.created_at,
    updated_at: deal.updated_at,
    sales_id: deal.sales_id,
  }));

export const generateProjectCostItems = (db: Db): ProjectCostItem[] =>
  db.projects.flatMap((project, projectIndex) => {
    const plannedEquipment = Math.round(project.contract_amount * 0.55);
    const plannedLabor = Math.round(project.contract_amount * 0.15);

    return [
      {
        id: projectIndex * 2 + 1,
        project_id: project.id,
        category: "equipment",
        description: "تجهیزات اصلی پروژه",
        planned_amount: plannedEquipment,
        actual_amount: Math.round(plannedEquipment * 0.95),
        currency: project.currency,
        created_at: project.created_at,
        updated_at: project.updated_at,
        sales_id: project.sales_id,
      },
      {
        id: projectIndex * 2 + 2,
        project_id: project.id,
        category: "labor",
        description: "اجرا و راه‌اندازی",
        planned_amount: plannedLabor,
        actual_amount: projectIndex === 0 ? 0 : plannedLabor,
        currency: project.currency,
        created_at: project.created_at,
        updated_at: project.updated_at,
        sales_id: project.sales_id,
      },
    ];
  });
