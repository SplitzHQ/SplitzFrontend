import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

import { PNG_OPTIONS } from "./pwa-assets.config";

/**
 * Makes the icons that the OS masks from `public/app-icon-masked.svg`: the iOS home screen icon and the Android
 * maskable icon.
 *
 * The OS cuts the shape, so the source is an opaque square with no margin. A second source is necessary, because the
 * plate gradient, the rim and the sheen of `public/favicon.svg` follow its rounded corners. The glyph needs no
 * padding: its farthest point is at 71% of the radius, and the maskable safe zone ends at 80%.
 * `bun run generate-pwa-assets` runs this config after `pwa-assets.config.ts`.
 */
export default defineConfig({
  images: ["public/app-icon-masked.svg"],
  preset: {
    apple: { ...minimal2023Preset.apple, padding: 0 },
    maskable: { ...minimal2023Preset.maskable, padding: 0 },
    png: PNG_OPTIONS,
    transparent: { sizes: [] },
  },
});
