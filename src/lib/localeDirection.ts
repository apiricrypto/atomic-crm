export type TextDirection = "ltr" | "rtl";

const RTL_LANGUAGE_CODES = new Set(["ar", "fa", "he", "ur"]);

export const normalizeLocale = (locale?: string | null): string =>
  (locale ?? "").trim().replaceAll("_", "-").toLowerCase();

export const getLanguageCode = (locale?: string | null): string => {
  const normalized = normalizeLocale(locale);
  return normalized.split("-")[0] ?? "";
};

export const isRtlLocale = (locale?: string | null): boolean =>
  RTL_LANGUAGE_CODES.has(getLanguageCode(locale));

export const getTextDirection = (
  locale?: string | null,
): TextDirection => (isRtlLocale(locale) ? "rtl" : "ltr");
