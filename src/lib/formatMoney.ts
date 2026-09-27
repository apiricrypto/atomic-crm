export type MoneyAmount = number | bigint;

export type FormatMoneyOptions = {
  locale?: string;
  notation?: Intl.NumberFormatOptions["notation"];
  currencyDisplay?: Intl.NumberFormatOptions["currencyDisplay"];
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumSignificantDigits?: number;
  maximumSignificantDigits?: number;
  useGrouping?: Intl.NumberFormatOptions["useGrouping"];
  signDisplay?: Intl.NumberFormatOptions["signDisplay"];
  fallback?: string;
};

const DEFAULT_LOCALE = "en-US";
const DEFAULT_FALLBACK = "—";
const ISO_CURRENCY_CODE = /^[A-Z]{3}$/;

export const formatMoney = (
  amount: MoneyAmount | null | undefined,
  currency: string | null | undefined,
  options: FormatMoneyOptions = {},
): string => {
  const {
    locale = DEFAULT_LOCALE,
    currencyDisplay = "narrowSymbol",
    fallback = DEFAULT_FALLBACK,
    ...numberOptions
  } = options;

  if (
    amount === null ||
    amount === undefined ||
    (typeof amount === "number" && !Number.isFinite(amount))
  ) {
    return fallback;
  }

  const normalizedCurrency = currency?.trim().toUpperCase();

  if (!normalizedCurrency) {
    return fallback;
  }

  if (!ISO_CURRENCY_CODE.test(normalizedCurrency)) {
    const formattedAmount = new Intl.NumberFormat(locale, numberOptions).format(
      amount,
    );

    return `${formattedAmount} ${normalizedCurrency}`;
  }

  return new Intl.NumberFormat(locale, {
    ...numberOptions,
    style: "currency",
    currency: normalizedCurrency,
    currencyDisplay,
  }).format(amount);
};
