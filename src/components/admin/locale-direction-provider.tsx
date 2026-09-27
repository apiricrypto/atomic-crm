import { useI18nProvider } from "ra-core";
import { Direction } from "radix-ui";
import { useEffect, useLayoutEffect, type ReactNode } from "react";
import { getTextDirection, syncDocumentLocale } from "@/lib/localeDirection";

const useDocumentEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect;

/** Synchronizes the loaded locale across document CSS and Radix interactions. */
export function LocaleDirectionProvider({ children }: { children: ReactNode }) {
  // Read the loaded locale, not the requested store value: asynchronous or
  // rejected language changes must not flip a still-untranslated interface.
  const locale = useI18nProvider().getLocale();

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
