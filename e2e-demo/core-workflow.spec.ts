import { expect, test } from "@playwright/test";

test("Persian core CRM: company, contact, solar deal, follow-up and demo reset", async ({
  page,
}, testInfo) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  const company = "شرکت آزمایشی خورشید اهواز";
  const contact = "علی آزمایشی";
  const deal = "سیستم خورشیدی ۱۰ کیلووات — آزمایشی";
  const task = "پیگیری پیشنهاد سیستم خورشیدی — آزمایشی";
  // Hash navigation preserves FakeRest's in-memory database throughout the flow.
  const navigate = async (path: string) => {
    await page.evaluate((path) => {
      window.location.hash = path;
    }, path);
  };
  await page.goto("/#/companies/create");
  await expect(
    page.getByRole("complementary", { name: "وضعیت نسخه آزمایشی" }),
  ).toContainText("داده‌ها نمونه و موقت‌اند");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.locator('input[name="name"]').fill(company);
  await page.locator('input[name="city"]').fill("اهواز");
  await page.getByRole("button", { name: "ایجاد شرکت", exact: true }).click();
  await expect(page).toHaveURL(/companies\/\d+\/show/);
  await expect(page.getByText(company, { exact: true }).first()).toBeVisible();
  await navigate("/contacts/create");
  await page.locator('input[name="first_name"]').fill("علی");
  await page.locator('input[name="last_name"]').fill("آزمایشی");
  await page.getByRole("combobox").first().click();
  await page.getByPlaceholder("Search...").fill(company);
  await page.getByRole("option", { name: company, exact: true }).click();
  await page.getByRole("button", { name: "ذخیره", exact: true }).click();
  await expect(page).toHaveURL(/contacts\/\d+\/show/);
  await expect(page.getByText(company, { exact: true }).first()).toBeVisible();
  const contactUrl = new URL(page.url()).hash;
  await page.getByRole("button", { name: "افزودن وظیفه", exact: true }).click();
  await page.locator('textarea[name="text"]').fill(task);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}T10:00`;
  await page.locator('input[name="due_date"]').fill(dueDate);
  await page.getByRole("button", { name: "ذخیره", exact: true }).click();
  await expect(page.getByText(task, { exact: true })).toBeVisible();
  await navigate("/deals/create");
  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="name"]').fill(deal);
  await dialog.getByRole("combobox").first().click();
  await page.getByPlaceholder("Search...").fill(company);
  await page.getByRole("option", { name: company, exact: true }).click();
  await dialog.getByRole("combobox").nth(1).click();
  await page.getByRole("option").filter({ hasText: contact }).click();
  await page.keyboard.press("Escape");
  await dialog.locator('input[name="amount"]').fill("10000");
  await dialog.getByRole("button", { name: "ذخیره", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByText(`${company} - ${deal}`, { exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(company);
  await expect(page.getByRole("dialog")).toContainText(contact);
  await page.screenshot({ path: testInfo.outputPath("core-deal.png") });
  await page.keyboard.press("Escape");
  await navigate(contactUrl);
  await expect(page.getByText(task, { exact: true })).toBeVisible();
  await navigate("/tasks");
  await expect(page.getByText(task, { exact: true })).toBeVisible();
  await navigate("/");
  await expect(page.getByText(task, { exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  expect(runtimeErrors).toEqual([]);
  // Confirm reload resets FakeRest; this deliberately does not claim DB persistence.
  await page.reload();
  await expect(
    page.getByRole("complementary", { name: "وضعیت نسخه آزمایشی" }),
  ).toBeVisible();
  const matchesAfterReload = await page.evaluate(async (company) => {
    const path =
      "/src/components/atomic-crm/providers/fakerest/dataProvider.ts";
    const { dataProvider } = await import(/* @vite-ignore */ path);
    const { data } = await dataProvider.getList("companies", {
      filter: { q: company },
      pagination: { page: 1, perPage: 10 },
      sort: { field: "id", order: "ASC" },
    });
    return data.length;
  }, company);
  expect(matchesAfterReload).toBe(0);
});

for (const route of ["/", "/companies", "/contacts", "/deals", "/tasks"]) {
  test(`mobile Persian preview ${route}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#${route}`);
    await expect(
      page.getByRole("complementary", { name: "وضعیت نسخه آزمایشی" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    // Content, not only the shell, must have finished loading.
    const content = page.locator("main");
    if (route === "/companies" || route === "/contacts") {
      await expect(
        content.locator(`a[href^="#${route}/"][href$="/show"]`).first(),
      ).toBeVisible();
    } else if (route === "/deals") {
      await expect(
        content.locator("[data-rfd-draggable-id]").first(),
      ).toBeVisible();
    } else if (route === "/") {
      await expect(
        content.locator('a[href^="#/contacts/"][href$="/show"]').first(),
      ).toBeVisible();
    } else {
      await expect(content.getByRole("checkbox").first()).toBeVisible();
    }
    await expect(page.getByText("Not Found", { exact: true })).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      )
      .toBe(true);
    await page.screenshot({ path: testInfo.outputPath("mobile-preview.png") });
  });
}
