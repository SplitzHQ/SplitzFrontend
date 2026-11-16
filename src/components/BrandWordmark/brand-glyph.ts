/**
 * Vector geometry and brand colors for the standalone Splitz glyph in the 600×600 coordinate space of
 * `public/favicon.svg` (one circle dot, one diagonal bar, and one diamond).
 *
 * Within the 600×600 icon canvas, the glyph occupies the centered 300×300 box from `(150, 150)` to `(450, 450)`.
 * The diamond sits at the same perpendicular gap from the diagonal bar as the top-left dot, with its outer tips
 * flush against the `450` right and bottom edges. See `brand-wordmark.usage.ts` for usage rules.
 */
export const BRAND_GLYPH = {
  bar: "M400 150L450 200L200 450L150 400Z",
  diamond: "M393.1 336.2L450 393.1L393.1 450L336.2 393.1Z",
  dot: { cx: 200, cy: 200, r: 50 },
} as const;

/**
 * Tight bounding box of `BRAND_GLYPH` inside the 600×600 icon canvas (`150..450` on both axes, centered at `300`).
 * Components that render the glyph without the icon padding crop to `viewBox`.
 */
export const BRAND_GLYPH_BOX = {
  center: 300,
  min: 150,
  size: 300,
  viewBox: "150 150 300 300",
} as const;

/**
 * Unrotated square geometry matching `BRAND_GLYPH.diamond` once rotated 45° around `(center, center)`.
 * Used to render the diamond as a `<rect>` whose corner radius (`rx`) animates from `halfSide` (a circle) to `0`.
 */
export const BRAND_GLYPH_DIAMOND_SQUARE = {
  center: 393.1,
  halfSide: 40.24,
} as const;

/**
 * Hex value for `--core-color-brand-600` (the brand plate background).
 * Exported for static SVGs, canvases, and inline styles that cannot read CSS custom properties.
 */
export const BRAND_COLOR = "#647C72";

/** Hex value for `--core-color-brand-50` (the light foreground drawn on top of `BRAND_COLOR`). */
export const LIGHT_COLOR = "#F2F5F3";
