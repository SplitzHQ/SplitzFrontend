import { defineAsyncComponent } from "vue";

/**
 * True when this build includes the debug panel:
 *
 * - Dev server (`vite`): always.
 * - Production build: only when `VITE_SPLITZ_DEBUG_TOOLS=true` is set when you build.
 *
 * Keep this a plain expression. Vite replaces both `import.meta.env` values at build time, and the bundler then
 * folds the expression to `false` and leaves the panel chunk out of `dist`. A function call here stops that fold,
 * and the chunk ships (and the service worker precaches it) even though nothing loads it.
 */
export const debugTools: boolean = import.meta.env.DEV || import.meta.env.VITE_SPLITZ_DEBUG_TOOLS === "true";

/** The panel component, loaded on first render. Null when `debugTools` is false. */
// oxlint-disable-next-line typescript/no-unsafe-assignment -- the type-aware linter sees .vue imports as `any`
export const DebugPanel = debugTools ? defineAsyncComponent(() => import("./DebugPanel.vue")) : null;
