const units: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { ms: 1000 * 60 * 60 * 24 * 365, unit: "year" },
  { ms: 1000 * 60 * 60 * 24 * 30, unit: "month" },
  { ms: 1000 * 60 * 60 * 24 * 7, unit: "week" },
  { ms: 1000 * 60 * 60 * 24, unit: "day" },
  { ms: 1000 * 60 * 60, unit: "hour" },
  { ms: 1000 * 60, unit: "minute" },
];

/**
 * Format a past date as "3 minutes ago" / "yesterday" in the user's locale.
 * Anything under a minute reads as "now".
 */
export function formatRelativeTime(date: Date, now: Date = new Date(), locale?: string): string {
  const diff = date.getTime() - now.getTime();
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const { unit, ms } of units) {
    if (Math.abs(diff) >= ms) {
      return formatter.format(Math.round(diff / ms), unit);
    }
  }
  return formatter.format(0, "second");
}
