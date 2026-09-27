import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import englishMessages from "ra-language-english";
import polyglotI18nProvider from "ra-i18n-polyglot";
import { createPortal } from "react-dom";
import { memoryStore, useLocaleState, useTranslate } from "ra-core";
import { Direction } from "radix-ui";
import { Admin } from "./admin";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { i18nProvider } from "@/components/atomic-crm/providers/commons/i18nProvider";

// Generic Admin supports arbitrary providers; SATNO itself only offers Persian.
const directionTestProvider = polyglotI18nProvider(
  (locale) => ({
    ...englishMessages,
    crm: { language: locale === "fa" ? "زبان" : "Language" },
  }),
  "en",
  [
    { locale: "en", name: "English" },
    { locale: "fa", name: "فارسی" },
  ],
);

function LocaleControls() {
  const [locale, setLocale] = useLocaleState();
  const translate = useTranslate();
  const direction = Direction.useDirection();
  return (
    <>
      {(["en", "fa"] as const).map((locale) => (
        <button key={locale} onClick={() => setLocale(locale)}>
          {locale}
        </button>
      ))}
      <p data-testid="stored-locale">{locale}</p>
      <p data-testid="translation">{translate("crm.language")}</p>
      <Tabs defaultValue="one" data-testid="direction-tabs">
        <TabsList aria-label="Direction test">
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
          <TabsTrigger value="three">Three</TabsTrigger>
        </TabsList>
      </Tabs>
      {createPortal(
        <span data-testid="portal-direction" dir={direction}>
          Portal
        </span>,
        document.body,
      )}
    </>
  );
}

const renderAdmin = (locale?: string, provider = directionTestProvider) =>
  render(
    <Admin
      i18nProvider={provider}
      store={memoryStore(locale ? { locale } : {})}
      ready={LocaleControls}
      disableTelemetry
    />,
  );

beforeEach(async () => {
  await directionTestProvider.changeLocale("en");
  document.documentElement.setAttribute("lang", "en");
  document.documentElement.setAttribute("dir", "ltr");
});

afterEach(() => vi.restoreAllMocks());

describe("Admin locale direction integration", () => {
  it("uses the provider default on the unauthenticated ready screen", async () => {
    await directionTestProvider.changeLocale("fa");
    const screen = await renderAdmin();
    await expect
      .element(screen.getByTestId("translation"))
      .toHaveTextContent("زبان");
    expect(document.documentElement.lang).toBe("fa");
    expect(document.documentElement.dir).toBe("rtl");
  });

  it("honors a stored Persian preference instead of the provider default", async () => {
    const screen = await renderAdmin("fa");
    await expect
      .element(screen.getByTestId("translation"))
      .toHaveTextContent("زبان");
    expect(document.documentElement.lang).toBe("fa");
    expect(document.documentElement.dir).toBe("rtl");
    await expect
      .element(screen.getByTestId("direction-tabs"))
      .toHaveAttribute("dir", "rtl");
    expect(
      document
        .querySelector('[data-testid="portal-direction"]')
        ?.getAttribute("dir"),
    ).toBe("rtl");
  });

  it("switches Persian and English with matching document direction", async () => {
    const screen = await renderAdmin();
    for (const [locale, label, dir] of [
      ["fa", "زبان", "rtl"],
      ["en", "Language", "ltr"],
    ]) {
      await screen.getByRole("button", { name: locale, exact: true }).click();
      await expect
        .element(screen.getByTestId("translation"))
        .toHaveTextContent(label);
      expect(document.documentElement.lang).toBe(locale);
      expect(document.documentElement.dir).toBe(dir);
      await expect
        .element(screen.getByTestId("direction-tabs"))
        .toHaveAttribute("dir", dir);
    }
  });

  it("reverses Radix keyboard navigation in RTL and restores it in LTR", async () => {
    const screen = await renderAdmin("fa");
    await screen.getByRole("tab", { name: "One", exact: true }).click();
    await userEvent.keyboard("{ArrowLeft}");
    await expect
      .element(screen.getByRole("tab", { name: "Two", exact: true }))
      .toHaveFocus();
    await screen.getByRole("button", { name: "en", exact: true }).click();
    await expect
      .element(screen.getByTestId("translation"))
      .toHaveTextContent("Language");
    await screen.getByRole("tab", { name: "One", exact: true }).click();
    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(screen.getByRole("tab", { name: "Two", exact: true }))
      .toHaveFocus();
  });

  it("retains the loaded direction if a requested locale fails to load", async () => {
    const screen = await renderAdmin();
    await expect
      .element(screen.getByTestId("translation"))
      .toHaveTextContent("Language");
    const failure = new Error("Locale loading failed");
    vi.spyOn(directionTestProvider, "changeLocale").mockRejectedValueOnce(
      failure,
    );
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    await screen.getByRole("button", { name: "fa", exact: true }).click();
    await vi.waitFor(() => expect(log).toHaveBeenCalledWith(failure));
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("restores the host document attributes when Admin unmounts", async () => {
    document.documentElement.setAttribute("lang", "de");
    document.documentElement.removeAttribute("dir");
    const screen = await renderAdmin("fa");
    await expect
      .element(screen.getByTestId("translation"))
      .toHaveTextContent("زبان");
    await screen.unmount();
    expect(document.documentElement.getAttribute("lang")).toBe("de");
    expect(document.documentElement.hasAttribute("dir")).toBe(false);
  });
});

describe("SATNO production language integration", () => {
  it.each([undefined, "fr", "en", "es"])(
    "renders Persian/RTL with stored locale %s",
    async (locale) => {
      const screen = await renderAdmin(locale, i18nProvider);
      await expect
        .element(screen.getByTestId("translation"))
        .toHaveTextContent("زبان");
      await expect
        .element(screen.getByTestId("stored-locale"))
        .toHaveTextContent("fa");
      expect(document.documentElement.lang).toBe("fa");
      expect(document.documentElement.dir).toBe("rtl");
      await expect
        .element(screen.getByTestId("direction-tabs"))
        .toHaveAttribute("dir", "rtl");
    },
  );
});
