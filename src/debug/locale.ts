import type { FluentBundle } from "@fluent/bundle";

/** Returns the main locale of a bundle, for example "en" or "zh-cn". */
export function bundleLocale(bundle: FluentBundle): string {
  return bundle.locales[0] ?? "";
}

/**
 * Returns the bundles with the bundle for `locale` first. fluent-vue uses the first bundle and falls back to the
 * next ones, so this switches the app language. The other bundles keep their order. When no bundle matches, the
 * order does not change.
 */
export function bundlesWithFirst(bundles: Iterable<FluentBundle>, locale: string): FluentBundle[] {
  const list = [...bundles];
  const index = list.findIndex((bundle) => bundleLocale(bundle) === locale);
  if (index <= 0) return list;
  return [list[index], ...list.slice(0, index), ...list.slice(index + 1)];
}

/** Formats `key` with one bundle only, with no fallback. Returns null when the bundle has no such message. */
export function formatInBundle(bundle: FluentBundle, key: string): string | null {
  const message = bundle.getMessage(key);
  if (!message?.value) return null;
  return bundle.formatPattern(message.value);
}
