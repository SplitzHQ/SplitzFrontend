export function formatCurrency(amount: number | string, currency: string, absolute = true): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  const value = absolute ? Math.abs(num) : num;
  try {
    return new Intl.NumberFormat(undefined, { currency, style: "currency" }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}
