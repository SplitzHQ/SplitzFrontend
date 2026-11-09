/**
 * The local Oxlint plugin of Splitz. `.oxlintrc.json` loads it from `jsPlugins`, and its rules have the prefix `splitz/`.
 * Oxlint loads this file with Node, which removes the TypeScript types. So the imports in this folder use the `.ts` extension.
 */
import { type Rule, tailwindCanonicalClasses } from "./tailwind-canonical-classes.ts";

/** The shape of an Oxlint plugin. The package does not export it by name. */
interface Plugin {
  meta: { name: string };
  rules: Record<string, Rule>;
}

const plugin: Plugin = {
  meta: { name: "splitz" },
  rules: {
    "tailwind-canonical-classes": tailwindCanonicalClasses,
  },
};

export default plugin;
