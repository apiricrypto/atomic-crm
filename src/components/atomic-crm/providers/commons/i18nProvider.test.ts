import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getInitialLocale,
  i18nProvider,
  testI18nProvider,
} from "./i18nProvider";

afterEach(() => vi.unstubAllGlobals());

describe("SATNO Persian product language", () => {
  it("starts in Persian and only advertises Persian", () => {
    expect(i18nProvider.getLocale()).toBe("fa");
    expect(i18nProvider.getLocales?.()).toEqual([
      { locale: "fa", name: "فارسی" },
    ]);
    expect(i18nProvider.translate("crm.language")).toBe("زبان");
  });

  it.each(["fr-FR", "en-US", "fa-IR", "es-ES"])(
    "defaults to Persian with browser locale %s",
    (language) => {
      vi.stubGlobal("navigator", { language, languages: [language] });
      expect(getInitialLocale()).toBe("fa");
    },
  );

  it("defaults to Persian without a browser", () => {
    vi.stubGlobal("navigator", undefined);
    expect(getInitialLocale()).toBe("fa");
  });

  it.each(["fr", "en", "es", "fa-IR"])(
    "normalizes legacy or unsupported locale %s to Persian",
    async (locale) => {
      await i18nProvider.changeLocale(locale);
      expect(i18nProvider.getLocale()).toBe("fa");
      expect(i18nProvider.translate("crm.language")).toBe("زبان");
    },
  );

  it("keeps English fallback for untranslated keys", () => {
    expect(i18nProvider.translate("ra.action.clear_array_input")).toBe(
      "Clear the list",
    );
  });

  it("keeps the recovered Persian Supabase overlay and interpolation", () => {
    expect(i18nProvider.translate("ra-supabase.auth.password_reset")).toBe(
      "ایمیل بازنشانی رمز عبور برای شما ارسال شد. ایمیل خود را بررسی کنید.",
    );
    expect(
      i18nProvider.translate("ra-supabase.auth.sign_in_with", {
        provider: "Google",
      }),
    ).toBe("ورود با Google");
    expect(
      i18nProvider.translate("ra-supabase.validation.password_mismatch"),
    ).toBe("رمزهای عبور یکسان نیستند");
  });

  it("preserves the isolated English test/reference provider", () => {
    expect(testI18nProvider.getLocale()).toBe("en");
    expect(testI18nProvider.translate("crm.language")).toBe("Language");
    expect(testI18nProvider.translate("ra-supabase.auth.password_reset")).toBe(
      "Check your emails for a Reset Password message.",
    );
  });
});
