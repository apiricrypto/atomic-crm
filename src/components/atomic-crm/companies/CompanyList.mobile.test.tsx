import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { buildCompany, StoryWrapper } from "@/test/StoryWrapper";

describe("CompanyListMobile", () => {
  beforeAll(() => {
    page.viewport(390, 844);
  });

  it("registers and renders the company list on the mobile route", async () => {
    const screen = await render(
      <StoryWrapper
        data={{
          companies: [
            buildCompany({
              name: "SATNO Solar",
              sector: "energy",
            }),
          ],
        }}
        initialEntries={["/companies"]}
      >
        <div />
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByRole("heading", { name: "Companies" }))
      .toBeVisible();
    await expect.element(screen.getByText("SATNO Solar")).toBeVisible();
    await expect
      .poll(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      )
      .toBe(true);
  });
});
