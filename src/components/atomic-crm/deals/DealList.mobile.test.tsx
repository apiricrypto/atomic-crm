import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { buildCompany, buildDeal, StoryWrapper } from "@/test/StoryWrapper";
import { i18nProvider } from "../providers/commons/i18nProvider";

describe("DealListMobile", () => {
  beforeAll(() => {
    page.viewport(390, 844);
  });

  it("registers and renders the deal list without page-level overflow", async () => {
    const screen = await render(
      <StoryWrapper
        data={{
          companies: [buildCompany({ name: "SATNO Solar" })],
          deals: [buildDeal({ name: "Hybrid project" })],
        }}
        initialEntries={["/deals"]}
      >
        <div />
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByRole("heading", { name: "Deals" }))
      .toBeVisible();
    await expect
      .element(screen.getByText("SATNO Solar - Hybrid project"))
      .toBeVisible();
    await expect.element(screen.getByText("Opportunity")).toBeVisible();
    await expect
      .poll(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      )
      .toBe(true);
  });

  it("formats configured deal amounts with Persian numerals without conversion", async () => {
    const screen = await render(
      <StoryWrapper
        data={{
          companies: [buildCompany({ name: "ساتنو" })],
          deals: [buildDeal({ amount: 1_200_000, name: "پروژه هیبریدی" })],
        }}
        i18nProvider={i18nProvider}
        initialEntries={["/deals"]}
      >
        <div />
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByText(/۱٫۲۰.*میلیون/).first())
      .toBeVisible();
  });
});
