/**
 * The Splitz glyph in the 600×600 coordinate system of `public/favicon.svg`: one circle and two polygons.
 *
 * These numbers are preset M2 of `devtools/prototypes/2026-11-03-logo-optical`. The diamond has the same gap to the
 * bar as the dot, and its tips stay on the 450 edge. The rules for this file are in `brand-wordmark.usage.ts`.
 */
export const BRAND_GLYPH = {
  bar: "M400 150L450 200L200 450L150 400Z",
  diamond: "M393.1 336.2L450 393.1L393.1 450L336.2 393.1Z",
  dot: { cx: 200, cy: 200, r: 50 },
} as const;

/** The plate color. It has the same value as `--core-color-brand-600`. SVG files and canvases cannot read CSS tokens. */
export const BRAND_COLOR = "#647C72";
/** The light color. It has the same value as `--core-color-brand-50`. */
export const LIGHT_COLOR = "#F2F5F3";
