import { FluentBundle, type FluentResource } from "@fluent/bundle";
import { createFluentVue } from "fluent-vue";

/** Builds one bundle that holds every `.ftl` file of a locale. */
function createBundle(locale: string, resources: Record<string, FluentResource>): FluentBundle {
  const bundle = new FluentBundle(locale);
  for (const ftl of Object.values(resources)) {
    bundle.addResource(ftl);
  }
  return bundle;
}

/**
 * Creates the fluent-vue plugin with the English and Simplified Chinese bundles.
 * The app, the design-system page and the dev-only prototype pages all install it, so they show the same strings.
 */
export function createAppFluent() {
  const enBundle = createBundle(
    "en",
    import.meta.glob<FluentResource>("../locales/en/*.ftl", { eager: true, import: "default" })
  );
  const zhcnBundle = createBundle(
    "zh-cn",
    import.meta.glob<FluentResource>("../locales/zh-cn/*.ftl", { eager: true, import: "default" })
  );
  return createFluentVue({ bundles: [enBundle, zhcnBundle] });
}
