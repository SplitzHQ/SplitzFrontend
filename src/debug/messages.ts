import type { FluentBundle, FluentResource } from "@fluent/bundle";

import { bundleLocale } from "./locale";

/*
 * The panel strings live in src/locales/<locale>/debug/. libs/fluent.ts loads only the top level of each locale folder, so
 * these files reach the app through this module only, and a build without the panel leaves them out.
 */
const resources = import.meta.glob<FluentResource>("@/locales/*/debug/*.ftl", { eager: true, import: "default" });

/** Returns the locale folder of a debug .ftl path, for example "zh-cn" for "/src/locales/zh-cn/debug/x.ftl". */
export function localeOfPath(path: string): string | null {
  return /\/locales\/([^/]+)\/debug\/[^/]+\.ftl$/.exec(path)?.[1] ?? null;
}

const loaded = new WeakSet<FluentBundle>();

/**
 * Adds the panel strings to the bundle of each matching locale. A bundle gets them one time only, so a second panel
 * mount (for example, after hot reload) does not add them again.
 */
export function addDebugMessages(
  bundles: Iterable<FluentBundle>,
  files: Record<string, FluentResource> = resources
): void {
  for (const bundle of bundles) {
    if (loaded.has(bundle)) continue;
    loaded.add(bundle);
    for (const [path, resource] of Object.entries(files)) {
      if (localeOfPath(path) === bundleLocale(bundle)) bundle.addResource(resource);
    }
  }
}
