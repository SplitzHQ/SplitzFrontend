/**
 * The numbers of the horizontal logo. They come from the choices in the wordmark prototype.
 *
 * The positions are for Manrope 600. If you change the font, the weight or the letter spacing, measure them again in
 * the prototype. They are not correct for another font.
 */

/** The word that the logo shows. Do not translate it. */
export const WORDMARK_WORD = "Splitz";

/** The logo sizes, by the surface that uses them. */
export const WORDMARK_SIZES = ["header", "auth", "hero"] as const;
export type WordmarkSize = (typeof WORDMARK_SIZES)[number];

/** The font size of each logo size, in CSS pixels. */
export const WORDMARK_FONT_SIZE: Record<WordmarkSize, number> = {
  auth: 24,
  header: 20,
  hero: 40,
};

/**
 * The positions in SVG user units. One em is 100 units, and the baseline is at y = 0.
 * The glyph is one cap height tall and stands on the baseline. The gap to "S" is 0.42 glyph widths.
 */
export const WORDMARK_LAYOUT = {
  box: { height: 97.667, width: 354.74, y: -73.667 },
  emUnits: 100,
  font: { family: "Manrope, sans-serif", letterSpacing: -2.7, weight: 600 },
  glyph: { size: 72, y: -72 },
  textX: 98.573,
} as const;
