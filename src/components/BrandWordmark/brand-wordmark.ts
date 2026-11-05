/**
 * The numbers and the outlines of the logo. They come from the choices in the prototype
 * `2026-11-04-wordmark-split-glyph`: Manrope 600, letter spacing -2.7, and the diamond of the glyph on the i.
 *
 * The word is outlines, so it needs no font and it never shows a fallback font. To change the word, change the choices
 * in the prototype and generate the paths again. Do not edit a path by hand.
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
 * The box of the word in SVG user units. One em is 100 units, and the baseline is at y = 0.
 * The tip of the diamond goes 3.5 units above the box, so the SVG must keep `overflow-visible`.
 */
export const WORDMARK_LAYOUT = {
  box: { height: 97.667, width: 257.08, y: -73.667 },
  emUnits: 100,
} as const;

/**
 * The outline of each letter of the word, in the units of `WORDMARK_LAYOUT`. The fourth letter is the i with no dot.
 * Each path holds its final position, because a CSS transform on the element replaces a `transform` attribute.
 */
export const WORDMARK_LETTERS = [
  "M33.1 1.5Q25.35 1.5 19.13 -1.17Q12.9 -3.85 8.88 -8.83Q4.85 -13.8 3.65 -20.65L14.55 -22.3Q16.2 -15.7 21.45 -12.02Q26.7 -8.35 33.7 -8.35Q38.05 -8.35 41.7 -9.73Q45.35 -11.1 47.58 -13.67Q49.8 -16.25 49.8 -19.85Q49.8 -21.8 49.13 -23.3Q48.45 -24.8 47.28 -25.92Q46.1 -27.05 44.43 -27.87Q42.75 -28.7 40.75 -29.3L22.3 -34.75Q19.6 -35.55 16.8 -36.83Q14 -38.1 11.68 -40.18Q9.35 -42.25 7.9 -45.32Q6.45 -48.4 6.45 -52.8Q6.45 -59.45 9.88 -64.07Q13.3 -68.7 19.15 -71.07Q25 -73.45 32.25 -73.45Q39.55 -73.35 45.33 -70.85Q51.1 -68.35 54.93 -63.67Q58.75 -59 60.2 -52.35L49 -50.45Q48.25 -54.5 45.8 -57.42Q43.35 -60.35 39.8 -61.92Q36.25 -63.5 32.1 -63.55Q28.1 -63.65 24.78 -62.35Q21.45 -61.05 19.48 -58.7Q17.5 -56.35 17.5 -53.3Q17.5 -50.3 19.25 -48.45Q21 -46.6 23.58 -45.53Q26.15 -44.45 28.7 -43.75L42 -40Q44.5 -39.3 47.68 -38.12Q50.85 -36.95 53.83 -34.85Q56.8 -32.75 58.75 -29.27Q60.7 -25.8 60.7 -20.55Q60.7 -15.1 58.5 -10.98Q56.3 -6.85 52.48 -4.07Q48.65 -1.3 43.65 0.1Q38.65 1.5 33.1 1.5Z",
  "M94.02 1.5Q86.27 1.5 81.02 -2.27Q75.77 -6.05 73.07 -12.5Q70.37 -18.95 70.37 -27.05Q70.37 -35.15 73.05 -41.6Q75.72 -48.05 80.95 -51.78Q86.17 -55.5 93.82 -55.5Q101.42 -55.5 106.95 -51.78Q112.47 -48.05 115.47 -41.62Q118.47 -35.2 118.47 -27.05Q118.47 -18.95 115.5 -12.48Q112.52 -6 107.05 -2.25Q101.57 1.5 94.02 1.5ZM68.62 24L68.62 -54L77.92 -54L77.92 -15.15L79.12 -15.15L79.12 24ZM92.57 -7.95Q97.57 -7.95 100.85 -10.5Q104.12 -13.05 105.75 -17.37Q107.37 -21.7 107.37 -27.05Q107.37 -32.35 105.75 -36.65Q104.12 -40.95 100.77 -43.5Q97.42 -46.05 92.22 -46.05Q87.32 -46.05 84.15 -43.65Q80.97 -41.25 79.45 -36.95Q77.92 -32.65 77.92 -27.05Q77.92 -21.45 79.42 -17.15Q80.92 -12.85 84.17 -10.4Q87.42 -7.95 92.57 -7.95Z",
  "M127.77 0L127.77 -73.5L138.22 -73.5L138.22 0Z",
  "M151.53 0L151.53 -54L161.98 -54L161.98 0Z",
  "M205.2 0Q200.1 1 195.2 0.85Q190.3 0.7 186.45 -1.05Q182.6 -2.8 180.65 -6.55Q178.9 -9.9 178.78 -13.37Q178.65 -16.85 178.65 -21.25L178.65 -69L189.15 -69L189.15 -21.75Q189.15 -18.5 189.23 -16.1Q189.3 -13.7 190.25 -12.05Q192.05 -8.95 195.98 -8.52Q199.9 -8.1 205.2 -8.85ZM168.3 -45.6L168.3 -54L205.2 -54L205.2 -45.6Z",
  "M208.83 0L208.83 -1.65L239.48 -44.65L211.63 -44.65L211.63 -54L256.08 -54L256.08 -52.3L225.48 -9.35L254.58 -9.35L254.58 0Z",
] as const;

/** The diamond on the i, in the units of `WORDMARK_LAYOUT`. It has the same angle as the diamond of the glyph. */
export const WORDMARK_TITTLE = "M156.76 -77.2L165.12 -68.84L156.76 -60.48L148.4 -68.84Z";

/** The center of the diamond on the i, and half of its width. These are the numbers of `WORDMARK_TITTLE`. */
export const WORDMARK_TITTLE_SHAPE = { half: 8.36, x: 156.76, y: -68.84 } as const;
