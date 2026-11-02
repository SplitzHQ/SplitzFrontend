/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { FluentBundle, type FluentResource } from "@fluent/bundle";
import { createFluentVue } from "fluent-vue";

/** Loads every `.ftl` file of a locale into one bundle. */
function createBundle(locale: string, files: Record<string, unknown>): FluentBundle {
  const bundle = new FluentBundle(locale);
  for (const ftl of Object.values(files)) {
    bundle.addResource(ftl as FluentResource);
  }
  return bundle;
}

/**
 * Creates the fluent-vue plugin with the English and Simplified Chinese bundles.
 * The app and the design-system page both install it.
 */
export function createAppFluent() {
  const enBundle = createBundle("en", import.meta.glob("../locales/en/*.ftl", { eager: true, import: "default" }));
  const zhcnBundle = createBundle(
    "zh-cn",
    import.meta.glob("../locales/zh-cn/*.ftl", { eager: true, import: "default" })
  );
  return createFluentVue({ bundles: [enBundle, zhcnBundle] });
}
