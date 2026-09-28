import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import {
  buildFinancialPayable,
  buildFinancialReceivable,
  buildFinancialTransaction,
  StoryWrapper,
} from "@/test/StoryWrapper";
import { i18nProvider } from "../providers/commons/i18nProvider";

describe("FinanceDashboard", () => {
  beforeAll(() => {
    page.viewport(390, 844);
  });

  it("keeps explicit receivable and payable settlements separate on mobile", async () => {
    const screen = await render(
      <StoryWrapper
        data={{
          financial_payables: [buildFinancialPayable()],
          financial_receivables: [buildFinancialReceivable()],
          financial_transactions: [
            buildFinancialTransaction(),
            buildFinancialTransaction({
              amount: 300_000,
              direction: "outflow",
              id: 2,
              payable_id: 1,
              receivable_id: null,
              reference: "SATNO-PMT-0001",
            }),
          ],
        }}
        i18nProvider={i18nProvider}
        initialEntries={["/finance"]}
      >
        <div />
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByRole("heading", { name: "مدیریت مالی" }))
      .toBeVisible();
    await expect.element(screen.getByText(/۶۰۰.*هزار/)).toBeVisible();
    await expect.element(screen.getByText(/۵۰۰.*هزار/)).toBeVisible();
    await expect.element(screen.getByText(/۱۰۰.*هزار/)).toBeVisible();
    await expect
      .element(screen.getByText(/هرگز خودکار به دریافتنی/))
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
