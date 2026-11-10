/** Returns the Intl options for a currency, or null when Intl rejects the currency code. */
export function currencyFormatOptions(currency: string): { currency: string; style: "currency" } | null {
  const options = { currency, style: "currency" } as const;
  try {
    // The constructor throws for a code that is not valid.
    new Intl.NumberFormat(undefined, options).resolvedOptions();
    return options;
  } catch {
    return null;
  }
}

/** The decimal places for a currency code that Intl does not know. Most currencies use two places. */
const DEFAULT_FRACTION_DIGITS = 2;

/**
 * Returns the number of decimal places of a currency, for example 0 for JPY, 2 for USD and 3 for KWD.
 * The value comes from Intl, which follows the ISO 4217 list. An unknown code gives 2.
 */
export function currencyFractionDigits(currency: string): number {
  const options = currencyFormatOptions(currency);
  if (!options) return DEFAULT_FRACTION_DIGITS;
  // The "en" locale makes the result the same on every device. The decimal places belong to the currency, not to the
  // locale, so the locale does not change the answer for the currencies that the app uses.
  return new Intl.NumberFormat("en", options).resolvedOptions().maximumFractionDigits ?? DEFAULT_FRACTION_DIGITS;
}

export function formatCurrency(amount: number | string, currency: string, absolute = true): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  const value = absolute ? Math.abs(num) : num;
  const options = currencyFormatOptions(currency);
  return options ? new Intl.NumberFormat(undefined, options).format(value) : `${value.toFixed(2)} ${currency}`;
}
