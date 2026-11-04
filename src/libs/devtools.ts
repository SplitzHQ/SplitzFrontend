import type { Component } from "vue";

/**
 * The private dev tools are in `devtools/`, which is a separate repository that this repository ignores. A glob finds
 * no file when that folder does not exist, so a clone without the tools builds and runs normally.
 */
const gates = import.meta.glob<{ DebugPanel: Component | null }>("/devtools/debug/gate.ts", { eager: true });

/** The debug panel component. Null when this build does not include the panel. */
export const DebugPanel: Component | null = Object.values(gates)[0]?.DebugPanel ?? null;
