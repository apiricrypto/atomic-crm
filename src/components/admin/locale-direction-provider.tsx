import { useI18nProvider, useLocaleState } from "ra-core";
import { Direction } from "radix-ui";
import { useEffect, useLayoutEffect, type ReactNode } from "react";
import { getTextDirection, syncDocumentLocale } from "@/lib/localeDirection";

const useDocumentEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect;

/** Synchronizes the loaded locale across document CSS and Radix interactions. */
export function LocaleDirectionProvider({ children }: { children: ReactNode }) {
  // Read the loaded locale, not the requested store value: asynchronous or
  // rejected language changes must not flip a still-untranslated interface.
  const provider = useI18nProvider();
  const locale = provider.getLocale();
  const [storedLocale, setLocale] = useLocaleState();
  const locales = provider.getLocales?.();
  const onlyLocale = locales?.length === 1 ? locales[0].locale : undefined;

  // A removed language may still exist in local storage. Keep locale consumers
  // (dates/numbers as well as translations) aligned in a single-language app.
  useEffect(() => {
    if (onlyLocale === locale && storedLocale !== locale) {
      setLocale(locale);
    }
  }, [onlyLocale, locale, storedLocale, setLocale]);

  useDocumentEffect(() => {
    const root = document.documentElement;
    const previousLang = root.getAttribute("lang");
    const previousDir = root.getAttribute("dir");
    syncDocumentLocale(locale, root);

    return () => {
      if (previousLang === null) root.removeAttribute("lang");
      else root.setAttribute("lang", previousLang);
      if (previousDir === null) root.removeAttribute("dir");
      else root.setAttribute("dir", previousDir);
    };
  }, [locale]);

  return (
    <Direction.Provider dir={getTextDirection(locale)}>
      {children}
    </Direction.Provider>
  );
}
