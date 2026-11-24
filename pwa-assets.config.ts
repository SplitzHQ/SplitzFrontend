import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

/** Plate background color of `public/favicon.svg`, matching `--core-color-brand-700`. */
const BRAND_COLOR = "#4F635A";

/**
 * Resize settings for OS-masked icons (iOS home-screen icon and Android maskable icon).
 *
 * Because the OS applies its own mask, the exported PNG must be an opaque square with no outer margin. Filling the
 * source SVG's rounded corners with `BRAND_COLOR` avoids double-rounded corners, and the glyph needs no extra padding
 * because its outermost point sits at 71% of the icon radius (well inside the 80% maskable safe zone).
 */
const MASKED_ICON_OPTIONS = {
  padding: 0,
  resizeOptions: { background: BRAND_COLOR, fit: "contain" },
} as const;

/**
 * Generates the PWA icons in `public/` from `public/favicon.svg` (`bun run generate-pwa-assets`).
 * See `src/components/BrandWordmark/brand.usage.ts` for icon rules.
 *
 * Uses `quality: 100` because the default (`60`) quantizes into a palette PNG that introduces banding in the plate
 * fill and alpha edges.
 */
export default defineConfig({
  images: ["public/favicon.svg"],
  preset: {
    ...minimal2023Preset,
    apple: { ...minimal2023Preset.apple, ...MASKED_ICON_OPTIONS },
    maskable: { ...minimal2023Preset.maskable, ...MASKED_ICON_OPTIONS },
    png: { compressionLevel: 9, quality: 100 },
  },
});
