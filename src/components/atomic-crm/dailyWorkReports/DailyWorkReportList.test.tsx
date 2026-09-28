import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import {
  buildDailyWorkReport,
  buildSale,
  StoryWrapper,
} from "@/test/StoryWrapper";
import { i18nProvider } from "../providers/commons/i18nProvider";

describe("DailyWorkReportList", () => {
  beforeAll(() => {
    page.viewport(390, 844);
  });

  it("renders Persian reports and only offers edit for the current owner", async () => {
    const screen = await render(
      <StoryWrapper
        data={{
          daily_work_reports: [
            buildDailyWorkReport(),
            buildDailyWorkReport({
              achievements: "گزارش همکار فروش برای مشاهده مدیر",
              id: 2,
              sales_id: 1,
            }),
          ],
          sales: [
            buildSale(),
            buildSale({
              administrator: false,
              email: "sales@satno.example",
              first_name: "علی",
              id: 1,
              last_name: "غنواتی",
              role: "sales",
              user_id: "1",
            }),
          ],
        }}
        i18nProvider={i18nProvider}
        initialEntries={["/daily_work_reports"]}
      >
        <div />
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByRole("heading", { name: "گزارش‌های کار روزانه" }))
      .toBeVisible();
    await expect
      .element(screen.getByText("گزارش همکار فروش برای مشاهده مدیر"))
      .toBeVisible();
    await expect
      .poll(
        () => screen.getByRole("link", { name: "ویرایش گزارش" }).all().length,
      )
      .toBe(1);
    expect(document.documentElement.lang).toBe("fa");
    expect(document.documentElement.dir).toBe("rtl");
    await expect
      .poll(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      )
      .toBe(true);
  });

  it("opens a Persian mobile form for a new report", async () => {
    const screen = await render(
      <StoryWrapper
        i18nProvider={i18nProvider}
        initialEntries={["/daily_work_reports/create"]}
      >
        <div />
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByText("ثبت گزارش کار روزانه"))
      .toBeVisible();
    await expect.element(screen.getByLabelText("تاریخ کار")).toBeVisible();
    await expect
      .element(screen.getByLabelText("کارهای انجام‌شده"))
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
