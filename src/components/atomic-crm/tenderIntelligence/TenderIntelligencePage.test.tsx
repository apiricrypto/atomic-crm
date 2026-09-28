import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { buildLeadInboxRecord, StoryWrapper } from "@/test/StoryWrapper";
import { i18nProvider } from "../providers/commons/i18nProvider";

describe("TenderIntelligencePage", () => {
  it.each([
    { height: 1000, label: "desktop", width: 1440 },
    { height: 844, label: "mobile", width: 390 },
  ])(
    "renders the four Persian module areas on $label",
    async ({ height, width }) => {
      page.viewport(width, height);

      const screen = await render(
        <StoryWrapper
          data={{
            lead_inbox: [
              buildLeadInboxRecord({
                source: "tender_radar",
                source_record_id: "RADAR-SYNTHETIC-1",
                title: "استعلام ساختگی تجهیزات خورشیدی",
              }),
            ],
          }}
          i18nProvider={i18nProvider}
          initialEntries={["/tenders"]}
        >
          <div />
        </StoryWrapper>,
      );

      await expect
        .element(
          screen.getByRole("heading", { name: "هوشمندی مناقصه و استعلام" }),
        )
        .toBeVisible();
      await expect
        .element(screen.getByRole("tab", { name: "صندوق رادار" }))
        .toBeVisible();
      await expect
        .element(screen.getByText("استعلام ساختگی تجهیزات خورشیدی"))
        .toBeVisible();

      await screen.getByRole("tab", { name: "جست‌وجوی تعاملی ستاد" }).click();
      await expect
        .element(screen.getByText(/CAPTCHA فقط توسط کاربر/))
        .toBeVisible();
      await expect.element(screen.getByLabelText("استان")).toBeVisible();
      await expect
        .element(screen.getByLabelText("شماره نیاز (Need No)"))
        .toBeVisible();
      await expect.element(screen.getByLabelText("مهلت تا")).toBeVisible();
      await expect
        .element(
          screen.getByRole("link", { name: "بازکردن جست‌وجوی رسمی استعلام" }),
        )
        .toHaveAttribute("href", "https://eproc.setadiran.ir/eproc/entry.do");

      await screen.getByRole("tab", { name: "خط لوله مناقصه" }).click();
      await expect
        .element(screen.getByRole("heading", { name: "بررسی فنی" }))
        .toBeVisible();

      await screen.getByRole("tab", { name: "جست‌وجوهای ذخیره‌شده" }).click();
      await expect.element(screen.getByText("خورشیدی خوزستان")).toBeVisible();
      await expect
        .element(screen.getByText("UPS چهار استان هدف"))
        .toBeVisible();
      await expect
        .element(screen.getByText("CCTV خوزستان و ایلام"))
        .toBeVisible();

      expect(document.documentElement.dir).toBe("rtl");
      await expect
        .poll(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        )
        .toBe(true);
    },
  );
});
