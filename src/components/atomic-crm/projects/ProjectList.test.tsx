import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import {
  buildCompany,
  buildProject,
  buildProjectCostItem,
  StoryWrapper,
} from "@/test/StoryWrapper";
import { i18nProvider } from "../providers/commons/i18nProvider";

describe("ProjectList", () => {
  beforeAll(() => {
    page.viewport(390, 844);
  });

  it("renders Persian costing without double counting planned and actual", async () => {
    const screen = await render(
      <StoryWrapper
        data={{
          companies: [buildCompany({ id: 1, name: "گروه ساتنو" })],
          project_cost_items: [
            buildProjectCostItem({
              actual_amount: 320_000,
              planned_amount: 300_000,
            }),
            buildProjectCostItem({
              actual_amount: 0,
              id: 2,
              planned_amount: 200_000,
            }),
          ],
          projects: [buildProject({ contract_amount: 1_000_000 })],
        }}
        i18nProvider={i18nProvider}
        initialEntries={["/projects"]}
      >
        <div />
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByRole("heading", { name: "پروژه‌ها" }))
      .toBeVisible();
    await expect.element(screen.getByText("پروژه هیبریدی")).toBeVisible();
    await expect.element(screen.getByText("گروه ساتنو")).toBeVisible();
    await expect.element(screen.getByText(/۵۰۰.*هزار/)).toBeVisible();
    await expect.element(screen.getByText(/۴۸۰.*هزار/)).toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: "تدارکات پروژه" }))
      .toBeVisible();
    await expect
      .poll(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      )
      .toBe(true);
  });
});
