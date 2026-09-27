import { useCallback } from "react";
import { useLocaleState } from "ra-core";

import {
  formatMoney,
  type FormatMoneyOptions,
  type MoneyAmount,
} from "@/lib/formatMoney";

import { useConfigurationContext } from "./ConfigurationContext";

type MoneyDisplayOptions = Omit<FormatMoneyOptions, "locale">;

const DEFAULT_MONEY_LOCALE = "en-US";

export const getMoneyLocale = (locale?: string | null): string => {
  const primaryLocale = locale?.trim().toLowerCase().split(/[-_]/)[0];

  if (primaryLocale === "fa") return "fa-IR";
  if (primaryLocale === "en") return "en-US";

  return locale?.trim() || DEFAULT_MONEY_LOCALE;
};

/**
 * Formats display values with the configured deal currency and the loaded UI
 * locale. It never converts or mutates the stored amount.
 */
export const useFormatMoney = () => {
  const [locale] = useLocaleState();
  const { currency } = useConfigurationContext();
  const moneyLocale = getMoneyLocale(locale);

  return useCallback(
    (amount: MoneyAmount | null | undefined, options?: MoneyDisplayOptions) =>
      formatMoney(amount, currency, { ...options, locale: moneyLocale }),
    [currency, moneyLocale],
  );
};
