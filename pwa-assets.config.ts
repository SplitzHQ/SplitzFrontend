import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

/** The plate color of `public/favicon.svg`. It has the same value as `--core-color-brand-600`. */
const BRAND_COLOR = "#647C72";

/**
 * The options for an icon that the OS masks: the iOS home screen icon and the Android maskable icon.
 *
 * The OS cuts the shape, so the file must be an opaque square with no margin. The source SVG has rounded corners. The
 * brand color fills these corners, so the plate shows no second corner radius. The glyph needs no padding: its farthest
 * point is at 71% of the radius, and the maskable safe zone ends at 80%.
 */
const MASKED_ICON = {
  padding: 0,
  resizeOptions: { background: BRAND_COLOR, fit: "contain" },
} as const;

/**
 * Makes the PWA icons in `public/` from `public/favicon.svg`. Run `bun run generate-pwa-assets` after a logo change.
 *
 * The default `quality` of 60 writes a palette PNG, and this makes noise in the plate and in the alpha channel.
 */
export default defineConfig({
  images: ["public/favicon.svg"],
  preset: {
    ...minimal2023Preset,
    apple: { ...minimal2023Preset.apple, ...MASKED_ICON },
    maskable: { ...minimal2023Preset.maskable, ...MASKED_ICON },
    png: { compressionLevel: 9, quality: 100 },
  },
});
