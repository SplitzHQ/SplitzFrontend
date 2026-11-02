/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vue" />

interface ImportMetaEnv {
  readonly VITE_SPLITZ_API_BASE_URL?: string;
  readonly VITE_SPLITZ_ASSETS_BASE_URL?: string;
  /** Set to "true" to keep the debug panel in a production build (see src/debug/gate.ts). */
  readonly VITE_SPLITZ_DEBUG_TOOLS?: string;
}
