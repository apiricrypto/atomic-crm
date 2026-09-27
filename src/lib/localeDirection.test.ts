import {
  getLanguageCode,
  getTextDirection,
  isRtlLocale,
  normalizeLocale,
  syncDocumentLocale,
  type LocaleDocumentElement,
} from "./localeDirection";

describe("localeDirection", () => {
  it("normalizes locale tags", () => {
    expect(normalizeLocale(" FA_ir ")).toBe("fa-ir");
    expect(normalizeLocale(null)).toBe("");
  });

  it("extracts the primary language code", () => {
    expect(getLanguageCode("fa-IR")).toBe("fa");
    expect(getLanguageCode("en-US")).toBe("en");
  });

  it("detects Persian and other RTL locales", () => {
    expect(isRtlLocale("fa")).toBe(true);
    expect(isRtlLocale("fa-IR")).toBe(true);
    expect(isRtlLocale("ar-SA")).toBe(true);
    expect(isRtlLocale("he-IL")).toBe(true);
    expect(isRtlLocale("ur-PK")).toBe(true);
  });

  it("keeps supported LTR locales left-to-right", () => {
    expect(isRtlLocale("en")).toBe(false);
    expect(isRtlLocale("fr-FR")).toBe(false);
    expect(getTextDirection("en-US")).toBe("ltr");
  });

  it("returns rtl for Persian independently from translation loading", () => {
    expect(getTextDirection("fa-IR")).toBe("rtl");
  });

  it("synchronizes the document language and direction for Persian", () => {
    const root = { lang: "", dir: "" } as LocaleDocumentElement;

    expect(syncDocumentLocale(" FA_ir ", root)).toBe("rtl");
    expect(root).toEqual({ lang: "fa-ir", dir: "rtl" });
  });

  it("synchronizes the document language and direction for LTR locales", () => {
    const root = { lang: "", dir: "" } as LocaleDocumentElement;

    expect(syncDocumentLocale("en-US", root)).toBe("ltr");
    expect(root).toEqual({ lang: "en-us", dir: "ltr" });
  });

  it("is SSR-safe when no document element is available", () => {
    expect(syncDocumentLocale("fa-IR", null)).toBe("rtl");
  });

  it("uses English LTR for a missing locale", () => {
    const root = { lang: "", dir: "" } as LocaleDocumentElement;

    expect(syncDocumentLocale(undefined, root)).toBe("ltr");
    expect(root).toEqual({ lang: "en", dir: "ltr" });
  });
});
