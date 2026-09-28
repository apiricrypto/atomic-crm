import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import {
  buildInventoryItem,
  buildInventoryLocation,
  buildInventoryMovement,
  StoryWrapper,
} from "@/test/StoryWrapper";
import { i18nProvider } from "../providers/commons/i18nProvider";

describe("InventoryDashboard", () => {
  beforeAll(() => {
    page.viewport(390, 844);
  });

  it("derives Persian stock balances only from explicit movements", async () => {
    const screen = await render(
      <StoryWrapper
        data={{
          inventory_items: [buildInventoryItem()],
          inventory_locations: [buildInventoryLocation()],
          inventory_movements: [
            buildInventoryMovement(),
            buildInventoryMovement({
              id: 2,
              project_id: 1,
              quantity: 32,
              reference: "SATNO-GI-0001",
              type: "issue",
            }),
          ],
        }}
        i18nProvider={i18nProvider}
        initialEntries={["/inventory"]}
      >
        <div />
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByRole("heading", { name: "مدیریت انبار" }))
      .toBeVisible();
    await expect
      .element(screen.getByText("پنل خورشیدی ترینا ۷۱۵ وات").first())
      .toBeVisible();
    await expect.element(screen.getByText(/۶۸ عدد/)).toBeVisible();
    await expect
      .element(screen.getByText(/هرگز موجودی را خودکار تغییر نمی‌دهد/))
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
