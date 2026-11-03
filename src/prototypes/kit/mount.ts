// sort-imports-ignore
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import "./prototypes.css";
import "@/assets/color.css";
import { createPinia } from "pinia";
import { createApp, type Component } from "vue";

import { createAppFluent } from "@/libs/fluent";

import StatusBadge from "./StatusBadge.vue";

/** Options for `mountPrototype`. */
export interface MountPrototypeOptions {
  /** Adds the status badge and the "Export my choices" button. Default: true. */
  badge?: boolean;
}

/**
 * Mounts the root component of a prototype page on `#app`.
 * Installs the same Pinia and fluent setup as the app, so real Splitz components work on the page.
 * The router is not installed: a prototype page shows components, not routes.
 */
export function mountPrototype(root: Component, { badge = true }: MountPrototypeOptions = {}): void {
  const app = createApp(root);
  app.use(createPinia());
  app.use(createAppFluent());
  app.mount("#app");

  if (badge) {
    const host = document.createElement("div");
    document.body.append(host);
    createApp(StatusBadge).mount(host);
  }
}
