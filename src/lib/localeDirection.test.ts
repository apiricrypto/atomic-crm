import {
  getLanguageCode,
  getTextDirection,
  isRtlLocale,
  normalizeLocale,
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
});
