import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

/**
 * The PNG options of all icons. The default `quality` of 60 writes a palette PNG, and this makes noise in the plate
 * gradient and in the alpha channel.
 */
export const PNG_OPTIONS = { compressionLevel: 9, quality: 100 } as const;

/**
 * Makes the clear icons in `public/` from `public/favicon.svg`: the `pwa-*` PNGs and the ICO. They keep the rounded
 * plate on a clear ground. `pwa-assets-masked.config.ts` makes the masked icons from a second source.
 * Run `bun run generate-pwa-assets` after a logo change. It runs the two configs. The icon rules are in
 * `src/components/BrandWordmark/brand.usage.ts`.
 */
export default defineConfig({
  images: ["public/favicon.svg"],
  preset: {
    ...minimal2023Preset,
    apple: { sizes: [] },
    maskable: { sizes: [] },
    png: PNG_OPTIONS,
  },
});
