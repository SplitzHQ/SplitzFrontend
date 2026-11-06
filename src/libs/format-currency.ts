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

export function formatCurrency(amount: number | string, currency: string, absolute = true): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  const value = absolute ? Math.abs(num) : num;
  const options = currencyFormatOptions(currency);
  return options ? new Intl.NumberFormat(undefined, options).format(value) : `${value.toFixed(2)} ${currency}`;
}
