import { page } from "vitest/browser";
import { vi } from "vitest";
import { render } from "vitest-browser-react";

import { buildLeadInboxRecord, StoryWrapper } from "@/test/StoryWrapper";
import { i18nProvider } from "../providers/commons/i18nProvider";
import tenderRadarFixtures from "../../../../supabase/functions/ingest_leads/fixtures/tender-radar-v1.json";

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

  it("submits only reviewed allow-listed A/B fields to the guarded adapter", async () => {
    const fixture = tenderRadarFixtures.cases[0].request;
    const importTenderOpportunity = vi.fn().mockResolvedValue({
      dedup_basis: "official_need_no",
      duplicate: false,
      lead_id: 41,
      opportunity_id: 51,
      pipeline_entry_id: 61,
    });
    const screen = await render(
      <StoryWrapper
        data={{
          lead_inbox: [
            buildLeadInboxRecord({
              city: fixture.city,
              deadline: fixture.deadline,
              description: fixture.description,
              id: 41,
              organization_name: fixture.organization_name,
              province: fixture.province,
              raw_payload: {
                ...fixture.raw_payload,
                source_snapshot: {
                  hidden_provider_value: "NEVER_RENDER_OR_SEND",
                },
              },
              source_record_id: fixture.source_record_id,
              source_url: fixture.source_url,
              status: "qualified",
              title: fixture.title,
            }),
          ],
        }}
        dataProvider={{ importTenderOpportunity }}
        i18nProvider={i18nProvider}
        initialEntries={["/tenders"]}
      >
        <div />
      </StoryWrapper>,
    );

    await expect.element(screen.getByText("رتبه A • امتیاز ۹۱")).toBeVisible();
    await screen
      .getByRole("button", { name: "بازبینی و ورود به خط لوله" })
      .click();
    await expect
      .element(
        screen.getByRole("dialog", { name: "بازبینی انسانی پیش از ورود" }),
      )
      .toBeVisible();
    await expect
      .element(screen.getByText("شناسه تجمیع‌کننده رادار"))
      .toBeVisible();
    expect(document.body.textContent).not.toContain("NEVER_RENDER_OR_SEND");

    await screen.getByRole("checkbox").click();
    await screen
      .getByRole("button", { name: "ورود به Tender Pipeline" })
      .click();

    await expect.poll(() => importTenderOpportunity.mock.calls.length).toBe(1);
    const [leadId, review] = importTenderOpportunity.mock.calls[0];
    expect(leadId).toBe(41);
    expect(review).toMatchObject({
      official_need_no: "SYNTHETIC-NEED-1001",
      official_tender_no: null,
      opportunity_type: "inquiry",
      radar_grade: "A",
      radar_score: 91,
      verification_status: "pending_setad_verification",
    });
    expect(review).not.toHaveProperty("source_snapshot");
    expect(JSON.stringify(review)).not.toContain("NEVER_RENDER_OR_SEND");
  });
});
