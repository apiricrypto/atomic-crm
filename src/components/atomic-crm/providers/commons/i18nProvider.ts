import { mergeTranslations } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { raSupabaseEnglishMessages } from "ra-supabase-language-english";
import { englishCrmMessages } from "./englishCrmMessages";
import { farsiCrmMessages } from "./farsiCrmMessages";
import { raSupabaseFarsiMessages } from "./raSupabaseFarsiMessages";

const raSupabaseEnglishMessagesOverride = {
  "ra-supabase": {
    auth: {
      password_reset: "Check your emails for a Reset Password message.",
    },
  },
};

const englishCatalog = mergeTranslations(
  englishMessages,
  raSupabaseEnglishMessages,
  raSupabaseEnglishMessagesOverride,
  englishCrmMessages,
);

const farsiCatalog = mergeTranslations(
  englishCatalog,
  farsiCrmMessages,
  raSupabaseFarsiMessages,
);

// SATNO is Persian-first regardless of the browser or an old stored locale.
export const getInitialLocale = (): "fa" => "fa";

const persianProvider = polyglotI18nProvider(
  () => farsiCatalog,
  getInitialLocale(),
  [{ locale: "fa", name: "فارسی" }],
  { allowMissing: true },
);

export const i18nProvider = {
  ...persianProvider,
  // Legacy en/fr preferences must not restore a removed product language.
  // English remains the catalog fallback and the isolated test/reference provider.
  changeLocale: (_locale: string) => persianProvider.changeLocale("fa"),
};

export const testI18nProvider = polyglotI18nProvider(
  () => englishCatalog,
  "en",
  [{ locale: "en", name: "English" }],
  { allowMissing: true },
);
