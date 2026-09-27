import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { i18nProvider } from "../providers/commons/i18nProvider";
import {
  buildCompany,
  buildContact,
  buildDeal,
  StoryWrapper,
} from "@/test/StoryWrapper";

const task = {
  contact_id: 1,
  done_date: null,
  due_date: "2026-09-27T12:00:00.000Z",
  id: 1,
  sales_id: 0,
  text: "پیگیری پروژه هیبریدی ساتنو",
  type: "Follow-up",
};

const previewData = {
  companies: [buildCompany({ name: "گروه ساتنو", sector: "energy" })],
  contacts: [
    buildContact({
      company_id: 1,
      company_name: "گروه ساتنو",
      first_name: "احمد",
      last_name: "پیری",
    }),
  ],
  deals: [
    buildDeal({
      company_id: 1,
      contact_ids: [1],
      name: "پروژه هیبریدی",
    }),
  ],
  tasks: [task],
};

const protectedRoutes = [
  { marker: "احمد پیری", path: "/contacts" },
  { marker: "گروه ساتنو", path: "/companies" },
  { marker: "گروه ساتنو - پروژه هیبریدی", path: "/deals" },
  { marker: task.text, path: "/tasks" },
] as const;

const viewports = [
  { height: 1000, label: "desktop", width: 1440 },
  { height: 844, label: "mobile", width: 390 },
] as const;

describe("initial SATNO user-test route matrix", () => {
  it.each(viewports)(
    "renders the Persian login screen on $label",
    async ({ height, width }) => {
      page.viewport(width, height);

      const screen = await render(
        <StoryWrapper
          authProvider={{
            checkAuth: async () => Promise.reject(new Error("Signed out")),
          }}
          dataProvider={{ isInitialized: async () => true }}
          i18nProvider={i18nProvider}
          initialEntries={["/contacts"]}
        >
          <div />
        </StoryWrapper>,
      );

      await expect
        .element(screen.getByRole("heading", { name: "ورود" }))
        .toBeVisible();
      await expect.element(screen.getByLabelText("ایمیل")).toBeVisible();
      await expect.element(screen.getByLabelText("رمز عبور")).toBeVisible();
      expect(document.documentElement.lang).toBe("fa");
      expect(document.documentElement.dir).toBe("rtl");
    },
  );

  it.each(
    viewports.flatMap((viewport) =>
      protectedRoutes.map((route) => ({ ...route, ...viewport })),
    ),
  )(
    "renders $path in Persian without page overflow on $label",
    async ({ height, marker, path, width }) => {
      page.viewport(width, height);

      const screen = await render(
        <StoryWrapper
          data={previewData}
          i18nProvider={i18nProvider}
          initialEntries={[path]}
        >
          <div />
        </StoryWrapper>,
      );

      await expect.element(screen.getByText(marker).first()).toBeVisible();
      expect(document.documentElement.lang).toBe("fa");
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
