import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { buildLeadInboxRecord, StoryWrapper } from "@/test/StoryWrapper";
import { i18nProvider } from "../providers/commons/i18nProvider";

describe("LeadInboxList", () => {
  beforeAll(() => {
    page.viewport(390, 844);
  });

  it("renders quarantined Persian leads without exposing raw payload", async () => {
    const screen = await render(
      <StoryWrapper
        data={{
          lead_inbox: [
            buildLeadInboxRecord({
              raw_payload: { private_raw_marker: "RAW-MUST-STAY-HIDDEN" },
            }),
          ],
        }}
        i18nProvider={i18nProvider}
        initialEntries={["/lead_inbox"]}
      >
        <div />
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByRole("heading", { name: "صندوق سرنخ‌ها" }))
      .toBeVisible();
    await expect
      .element(screen.getByText("تأمین تجهیزات خورشیدی"))
      .toBeVisible();
    await expect
      .element(screen.getByText(/سرنخ خام.*شرکت، مخاطب یا معامله نیست/))
      .toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: "تبدیل به فرصت" }))
      .toBeVisible();
    expect(document.body.textContent).not.toContain("RAW-MUST-STAY-HIDDEN");
    await expect
      .poll(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      )
      .toBe(true);
  });
});
