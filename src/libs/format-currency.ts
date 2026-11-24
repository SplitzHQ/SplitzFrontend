/** Validated `Intl.NumberFormat` currency options. */
export interface CurrencyFormatOptions {
  currency: string;
  style: "currency";
}

/** Returns `Intl.NumberFormat` options for `currency`, or `null` when `currency` is not a valid ISO 4217 code. */
export function currencyFormatOptions(currency: string): CurrencyFormatOptions | null {
  const options: CurrencyFormatOptions = { currency, style: "currency" };
  try {
    // `Intl.NumberFormat` throws `RangeError` when `currency` is malformed or unrecognized.
    new Intl.NumberFormat(undefined, options).resolvedOptions();
    return options;
  } catch {
    return null;
  }
}

/**
 * Formats `amount` in `currency` using the runtime locale, falling back to `<amount> <currency>` when `Intl` rejects
 * `currency`. Formats the absolute value by default (`absolute = true`) for UI labels that already state direction.
 */
export function formatCurrency(amount: number | string, currency: string, absolute = true): string {
  const numericAmount = typeof amount === "string" ? Number(amount) : amount;
  const normalizedAmount = absolute ? Math.abs(numericAmount) : numericAmount;
  const options = currencyFormatOptions(currency);
  return options
    ? new Intl.NumberFormat(undefined, options).format(normalizedAmount)
    : `${normalizedAmount.toFixed(2)} ${currency}`;
}
