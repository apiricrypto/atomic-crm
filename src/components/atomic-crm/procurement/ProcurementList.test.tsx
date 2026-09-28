import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import {
  buildCompany,
  buildProcurementCommitment,
  buildProject,
  StoryWrapper,
} from "@/test/StoryWrapper";
import { i18nProvider } from "../providers/commons/i18nProvider";

describe("ProcurementList", () => {
  beforeAll(() => {
    page.viewport(390, 844);
  });

  it("renders commitments separately from received value and payments", async () => {
    const screen = await render(
      <StoryWrapper
        data={{
          companies: [
            buildCompany({ id: 1, name: "کارفرمای ساتنو" }),
            buildCompany({ id: 2, name: "تأمین‌کننده پنل" }),
          ],
          procurement_commitments: [
            buildProcurementCommitment({
              amount: 420_000,
              reference: "SATNO-PO-0001",
              status: "approved",
            }),
            buildProcurementCommitment({
              amount: 500_000,
              id: 2,
              reference: "SATNO-PO-0002",
              status: "received",
            }),
          ],
          projects: [buildProject()],
        }}
        i18nProvider={i18nProvider}
        initialEntries={["/procurement_commitments"]}
      >
        <div />
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByRole("heading", { name: "تدارکات پروژه" }))
      .toBeVisible();
    await expect.element(screen.getByText(/۴۲۰.*هزار/).first()).toBeVisible();
    await expect.element(screen.getByText(/۵۰۰.*هزار/).first()).toBeVisible();
    await expect
      .element(screen.getByText(/این مبالغ پرداخت یا هزینه واقعی نیستند/))
      .toBeVisible();
    await expect
      .element(screen.getByText("تأمین‌کننده پنل").first())
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
