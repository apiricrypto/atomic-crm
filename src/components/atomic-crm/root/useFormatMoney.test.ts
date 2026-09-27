import { getMoneyLocale } from "./useFormatMoney";

describe("getMoneyLocale", () => {
  it.each(["fa", "fa-IR", "fa_IR"])(
    "normalizes %s to the Iranian Persian locale",
    (locale) => {
      expect(getMoneyLocale(locale)).toBe("fa-IR");
    },
  );

  it.each(["en", "en-GB", "en_US"])(
    "keeps English reference output stable for %s",
    (locale) => {
      expect(getMoneyLocale(locale)).toBe("en-US");
    },
  );

  it("preserves another explicit locale and falls back safely", () => {
    expect(getMoneyLocale("ar-IQ")).toBe("ar-IQ");
    expect(getMoneyLocale()).toBe("en-US");
  });
});
