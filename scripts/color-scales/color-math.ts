/**
 * Color conversions for the scale generator. It compares colors in OKLCH because equal steps of OKLCH lightness look
 * like equal steps to a person. All functions use opaque `#rrggbb` colors.
 */

/** A color in OKLCH: lightness from 0 to 1, chroma from 0 and hue in degrees. */
export interface Oklch {
  l: number;
  c: number;
  h: number;
}

type Oklab = [l: number, a: number, b: number];
type Rgb = [r: number, g: number, b: number];

/** Reads the three channels of `#rrggbb`, from 0 to 255. */
function hexToRgb(hex: string): Rgb {
  const text = hex.replace("#", "");
  const channel = (start: number) => Number.parseInt(text.slice(start, start + 2), 16);
  return [channel(0), channel(2), channel(4)];
}

/** Writes three channels from 0 to 255 as `#rrggbb`. */
function rgbToHex(channels: Rgb): string {
  const part = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, "0");
  return `#${channels.map(part).join("")}`;
}

function toLinear(value: number): number {
  const s = value / 255;
  return s <= 0.040_45 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function fromLinear(value: number): number {
  const s = value <= 0.003_130_8 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
  return s * 255;
}

function hexToOklab(hex: string): Oklab {
  const [red, green, blue] = hexToRgb(hex).map(toLinear) as Rgb;
  const l = Math.cbrt(0.412_221_47 * red + 0.536_332_54 * green + 0.051_445_99 * blue);
  const m = Math.cbrt(0.211_903_5 * red + 0.680_699_55 * green + 0.107_396_96 * blue);
  const s = Math.cbrt(0.088_302_46 * red + 0.281_718_84 * green + 0.629_978_7 * blue);
  return [
    0.210_454_26 * l + 0.793_617_79 * m - 0.004_072_05 * s,
    1.977_998_5 * l - 2.428_592_21 * m + 0.450_593_71 * s,
    0.025_904_04 * l + 0.782_771_77 * m - 0.808_675_77 * s,
  ];
}

/** Returns linear sRGB channels. A channel outside 0 to 1 means that the color is outside the sRGB gamut. */
function oklabToLinear([L, a, b]: Oklab): Rgb {
  const l = (L + 0.396_337_78 * a + 0.215_803_76 * b) ** 3;
  const m = (L - 0.105_561_35 * a - 0.063_854_17 * b) ** 3;
  const s = (L - 0.089_484_18 * a - 1.291_485_55 * b) ** 3;
  return [
    4.076_741_66 * l - 3.307_711_59 * m + 0.230_969_93 * s,
    -1.268_438 * l + 2.609_757_4 * m - 0.341_319_4 * s,
    -0.004_196_09 * l - 0.703_418_61 * m + 1.707_614_7 * s,
  ];
}

function oklabToHex(lab: Oklab): string {
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  return rgbToHex(oklabToLinear(lab).map((channel) => fromLinear(clamp(channel))) as Rgb);
}

/** Converts a color to OKLCH. */
export function hexToOklch(hex: string): Oklch {
  const [l, a, b] = hexToOklab(hex);
  return { c: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360, l };
}

/** Converts OKLCH to a color. A color outside the sRGB gamut loses chroma until it fits. It keeps its lightness and hue. */
export function oklchToHex({ c, h, l }: Oklch): string {
  const radians = (h * Math.PI) / 180;
  const lab = (chroma: number): Oklab => [l, chroma * Math.cos(radians), chroma * Math.sin(radians)];
  const fits = (chroma: number) =>
    oklabToLinear(lab(chroma)).every((channel) => channel >= -0.000_1 && channel <= 1.000_1);
  if (fits(c)) return oklabToHex(lab(c));
  let low = 0;
  let high = c;
  for (let round = 0; round < 16; round++) {
    const middle = (low + high) / 2;
    if (fits(middle)) low = middle;
    else high = middle;
  }
  return oklabToHex(lab(low));
}

/** Returns the relative luminance of a color, as WCAG defines it. */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Returns the WCAG contrast of two colors. */
export function contrast(foreground: string, background: string): number {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/** The number of samples on each part of a curve. */
const SAMPLES_PER_PART = 48;

/**
 * Finds the color with a target contrast on a curve of colors. The curve starts at the page color and moves away from
 * it. The result is the first color that reaches the target. A color on the wrong side of the page color does not count,
 * so a step 25 that is lighter than the page does not answer a low target. When no color reaches the target, the result
 * is the end of the curve.
 */
export function colorAtContrast(curve: readonly string[], page: string, target: number): string {
  const pageLightness = hexToOklab(page)[0];
  const moveDown = pageLightness > 0.5;
  for (let part = 0; part < curve.length - 1; part++) {
    const from = hexToOklab(curve[part] as string);
    const to = hexToOklab(curve[part + 1] as string);
    for (let sample = 1; sample <= SAMPLES_PER_PART; sample++) {
      const mix = sample / SAMPLES_PER_PART;
      const lab: Oklab = [
        from[0] + (to[0] - from[0]) * mix,
        from[1] + (to[1] - from[1]) * mix,
        from[2] + (to[2] - from[2]) * mix,
      ];
      const onSide = moveDown ? lab[0] < pageLightness : lab[0] > pageLightness;
      const hex = oklabToHex(lab);
      if (onSide && contrast(hex, page) >= target) return hex;
    }
  }
  return curve.at(-1) as string;
}
