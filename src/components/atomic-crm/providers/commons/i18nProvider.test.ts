import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getInitialLocale,
  i18nProvider,
  testI18nProvider,
} from "./i18nProvider";

afterEach(async () => {
  await i18nProvider.changeLocale("en");
  vi.unstubAllGlobals();
});

describe("i18nProvider", () => {
  it("registers en, fr and fa locales", () => {
    expect(i18nProvider.getLocales?.()).toEqual([
      { locale: "en", name: "English" },
      { locale: "fr", name: "Français" },
      { locale: "fa", name: "فارسی" },
    ]);
  });

  it("translates the language key in french", async () => {
    await i18nProvider.changeLocale("fr");

    expect(i18nProvider.translate("crm.language")).toBe("Langue");
  });

  it("translates the language key in Persian", async () => {
    await i18nProvider.changeLocale("fa");

    expect(i18nProvider.translate("crm.language")).toBe("زبان");
  });

  it("falls back to english for unknown locales", async () => {
    await i18nProvider.changeLocale("es");

    expect(i18nProvider.translate("crm.language")).toBe("Language");
  });

  it("uses customized password reset overrides for en and fr", async () => {
    await i18nProvider.changeLocale("en");
    expect(i18nProvider.translate("ra-supabase.auth.password_reset")).toBe(
      "Check your emails for a Reset Password message.",
    );

    await i18nProvider.changeLocale("fr");
    expect(i18nProvider.translate("ra-supabase.auth.password_reset")).toBe(
      "Consultez vos emails pour trouver le message de reinitialisation du mot de passe.",
    );
  });

  it("keeps the complete English catalog as the Persian fallback", async () => {
    await i18nProvider.changeLocale("fa");

    expect(i18nProvider.translate("ra.action.clear_array_input")).toBe(
      "Clear the list",
    );
  });

  it("uses Persian Supabase messages and interpolates provider names", async () => {
    await i18nProvider.changeLocale("fa");

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

  it("does not leak the Persian overlay after switching locales", async () => {
    await i18nProvider.changeLocale("fa");
    await i18nProvider.changeLocale("en");
    expect(i18nProvider.translate("ra-supabase.auth.email")).toBe("Email");
    await i18nProvider.changeLocale("fr");
    expect(i18nProvider.translate("ra-supabase.auth.password_reset")).toBe(
      "Consultez vos emails pour trouver le message de reinitialisation du mot de passe.",
    );
  });

  it("preserves the English-only test provider while Persian is active", async () => {
    await i18nProvider.changeLocale("fa");
    expect(testI18nProvider.getLocale()).toBe("en");
    expect(testI18nProvider.translate("ra-supabase.auth.password_reset")).toBe(
      "Check your emails for a Reset Password message.",
    );
  });

  it("translates recently added fr crm keys", async () => {
    await i18nProvider.changeLocale("fr");

    expect(i18nProvider.translate("resources.deals.empty.title")).toBe(
      "Aucune affaire trouvée",
    );
  });

  it("uses browser french locale when available", () => {
    vi.stubGlobal("navigator", {
      language: "fr-FR",
      languages: ["fr-FR", "en-US"],
    });

    expect(getInitialLocale()).toBe("fr");
  });

  it("uses browser Persian locale when available", () => {
    vi.stubGlobal("navigator", {
      language: "fa-IR",
      languages: ["fa-IR", "en-US"],
    });

    expect(getInitialLocale()).toBe("fa");
  });

  it("falls back to english when browser locale is unsupported", () => {
    vi.stubGlobal("navigator", {
      language: "es-ES",
      languages: ["es-ES", "pt-BR"],
    });

    expect(getInitialLocale()).toBe("en");
  });
});
