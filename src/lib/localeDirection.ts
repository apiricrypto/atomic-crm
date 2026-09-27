export type TextDirection = "ltr" | "rtl";

export type LocaleDocumentElement = Pick<HTMLElement, "dir" | "lang">;

const RTL_LANGUAGE_CODES = new Set(["ar", "fa", "he", "ur"]);

export const normalizeLocale = (locale?: string | null): string =>
  (locale ?? "").trim().replaceAll("_", "-").toLowerCase();

export const getLanguageCode = (locale?: string | null): string => {
  const normalized = normalizeLocale(locale);
  return normalized.split("-")[0] ?? "";
};

export const isRtlLocale = (locale?: string | null): boolean =>
  RTL_LANGUAGE_CODES.has(getLanguageCode(locale));

export const getTextDirection = (locale?: string | null): TextDirection =>
  isRtlLocale(locale) ? "rtl" : "ltr";

export const syncDocumentLocale = (
  locale?: string | null,
  root: LocaleDocumentElement | null = typeof document === "undefined"
    ? null
    : document.documentElement,
): TextDirection => {
  const normalizedLocale = normalizeLocale(locale) || "en";
  const direction = getTextDirection(normalizedLocale);

  if (root) {
    root.lang = normalizedLocale;
    root.dir = direction;
  }

  return direction;
};
