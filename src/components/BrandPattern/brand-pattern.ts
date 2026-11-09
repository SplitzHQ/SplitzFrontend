/**
 * The generator of the brand patterns. One field from 0 to 1 runs over the box, and the settings decide what the field
 * changes: the shape (from a dot to a diamond), the color, the size and the fill. The rules for the patterns are in
 * `src/components/BrandWordmark/brand.usage.ts`, and the rules for the component are in `brand-pattern.usage.ts`.
 *
 * - `morph`: rows of shapes, each second row moved by half a step. Along the field, each dot turns into a diamond.
 * - `checker`: dots and diamonds in a checker. The kinds stay fixed.
 *
 * The Patterns tool of the dev tools draws with this file too, so the app and the tool show the same pattern.
 */

export const PATTERN_KINDS = ["morph", "checker"] as const;
export type PatternKind = (typeof PATTERN_KINDS)[number];

export const FIELD_DIRECTIONS = ["ltr", "ttb", "diagonal", "radial", "wave", "noise"] as const;
/** Where the field runs from 0 to 1. */
export type FieldDirection = (typeof FIELD_DIRECTIONS)[number];

export const EASES = ["linear", "in", "out", "inOut", "steps"] as const;
/** The curve from the field to the change. */
export type EaseId = (typeof EASES)[number];

export const FILL_MODES = ["solid", "outline", "split", "grow"] as const;
/** How a shape is filled. `split` outlines the dots and fills the diamonds. `grow` goes from an outline to solid. */
export type FillMode = (typeof FILL_MODES)[number];

export const GROUNDS = ["white", "tint", "brand", "deep"] as const;
/** The ground of the pattern. Each ground brings its own part colors, so the parts stay readable on it. */
export type GroundId = (typeof GROUNDS)[number];

/** All settings of one pattern. Lengths are in the units of the box, which are CSS pixels in the app. */
export interface PatternSettings {
  /** The size of one repeat. */
  cell: number;
  /** The size of the parts against the cell. 1 is the default. */
  scale: number;
  /** The seed of the noise direction. */
  seed: number;
  /** The number of shapes against the default grid, in each direction. 1 is the default. */
  density: number;
  direction: FieldDirection;
  /** Turns the field around, so the other side starts. */
  reverse: boolean;
  ease: EaseId;
  /** The color follows the field, from the dot color to the diamond color. */
  color: boolean;
  /** The size follows the field, from `sizeFrom` to the full size. */
  sizeRamp: boolean;
  /** The smallest size, as a share of the full size. */
  sizeFrom: number;
  /** The shape follows the field, from a dot to a diamond. Only `morph` reads it. */
  shape: boolean;
  fill: FillMode;
  /** The width of an outline. In the `grow` mode, it is the width at the start. */
  stroke: number;
  ground: GroundId;
  /** The opacity of all shapes together, from 0 to 1. The ground stays opaque. */
  opacity: number;
  /**
   * Moves the field after `reverse`. A negative value moves each point back toward the start, so -1 shows only the start
   * shapes. Motion tests change it over time. No value is 0.
   */
  shift?: number;
}

/**
 * One shape of a pattern: a rounded square on its tip. Full round corners make a dot, and no round corners make a
 * diamond.
 */
export interface PatternShape {
  kind: "rect";
  /** The part of the glyph that the shape comes from. */
  role: "dot" | "diamond";
  cx: number;
  cy: number;
  /** The outer size of the square before the turn. */
  size: number;
  rx: number;
  rotate: number;
  /** A blend from the dot color (0) to the diamond color (1). */
  mix: number;
  /** Draws only the outline, with this stroke width. The shape is then not filled. */
  outline?: number;
}

/**
 * The colors of the shapes of a pattern that has no ground of its own. The `util-color-brand` tokens change value in
 * the dark theme, so the pattern follows the theme of the page.
 */
export const PATTERN_COLORS = {
  diamond: "var(--util-color-brand-700)",
  dot: "var(--util-color-brand-300)",
} as const;

/**
 * The share of the dot radius that the diamond reaches from its center to a tip. The numbers are the diamond and the
 * dot of `brand-glyph.ts`, on its 600 grid.
 */
export const DIAMOND_PER_DOT = 56.9 / 50;

/** The values that the shape functions read. */
interface PatternInput {
  width: number;
  height: number;
  /** The size of one repeat, in the units of the box. */
  cell: number;
  /** The size of the parts against the cell. 1 is the default. */
  scale: number;
  /** The seed of the random choices. The same seed always draws the same pattern. */
  seed: number;
}

/** A random number generator with a seed (mulberry32). */
export function seeded(seed: number): () => number {
  let state = Math.trunc(seed * 2654435761) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Calls `draw` for each cell that touches the box, with one extra cell on each side. */
export function eachCell(
  input: { width: number; height: number },
  step: number,
  draw: (x: number, y: number, col: number, row: number) => void
) {
  const cols = Math.ceil(input.width / step) + 1;
  const rows = Math.ceil(input.height / step) + 1;
  for (let row = -1; row <= rows; row++) {
    for (let col = -1; col <= cols; col++) draw(col * step, row * step, col, row);
  }
}

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** One value from 0 to 1 for each point of the grid, from the seed. */
function latticeValue(seed: number, ix: number, iy: number): number {
  return seeded(seed * 7919 + ix * 374_761 + iy * 668_265)();
}

/** Smooth noise from 0 to 1: the values of the grid, blended between the grid points. */
export function valueNoise(seed: number, x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smoothstep(x - ix);
  const fy = smoothstep(y - iy);
  const top = latticeValue(seed, ix, iy) * (1 - fx) + latticeValue(seed, ix + 1, iy) * fx;
  const bottom = latticeValue(seed, ix, iy + 1) * (1 - fx) + latticeValue(seed, ix + 1, iy + 1) * fx;
  return top * (1 - fy) + bottom * fy;
}

const EASE: Record<EaseId, (t: number) => number> = {
  in: (t) => t * t * t,
  inOut: smoothstep,
  linear: (t) => t,
  out: (t) => 1 - (1 - t) ** 3,
  // Four even steps: 0, 1/3, 2/3 and 1.
  steps: (t) => Math.min(3, Math.floor(t * 4)) / 3,
};

/** The value of the field at a point of the box, before the easing. */
function fieldAt(input: PatternInput, direction: FieldDirection, x: number, y: number): number {
  const { height, width } = input;
  switch (direction) {
    case "ltr":
      return x / width;
    case "ttb":
      return y / height;
    case "diagonal":
      return (x + y) / (width + height);
    case "radial":
      return Math.hypot(x - width / 2, y - height / 2) / (Math.hypot(width, height) / 2);
    case "wave":
      return (x + Math.sin((y / height) * Math.PI * 2.4) * width * 0.16) / width;
    case "noise": {
      const scale = input.cell * 1.1;
      return (valueNoise(input.seed, x / scale, y / scale) - 0.3) / 0.4;
    }
  }
}

/** The eased field at a point: 0 is the start and 1 is the end. */
function stageAt(input: PatternInput, settings: PatternSettings, x: number, y: number): number {
  const raw = clamp01(fieldAt(input, settings.direction, x, y));
  const turned = settings.reverse ? 1 - raw : raw;
  return EASE[settings.ease](clamp01(turned + (settings.shift ?? 0)));
}

/**
 * The stroke width for the fill mode, or no stroke for a solid shape. `half` is the distance from the middle of the
 * shape to its edge, so a stroke is never wider than the shape. In the grow mode, the stroke gets wider until it fills
 * the shape at the end of the field.
 */
function strokeFor(fill: FillMode, isDot: boolean, stage: number, half: number, width: number): number | undefined {
  const thin = Math.min(width, half);
  if (fill === "outline" || (fill === "split" && isDot)) return thin;
  if (fill === "grow") return stage >= 0.98 ? undefined : thin + (half - thin) * stage;
  return undefined;
}

/**
 * A rounded square, turned by 45°, with its outer edge at `size`. Full round corners make a circle, and no round
 * corners make a diamond. A stroke is drawn inside the edge, so an outline has the same outer size as a solid shape.
 */
function morphShape(
  cx: number,
  cy: number,
  size: number,
  stage: number,
  stroke: number | undefined
): Omit<PatternShape, "mix"> {
  const inner = Math.max(0.5, size - (stroke ?? 0));
  return {
    cx,
    cy,
    kind: "rect",
    outline: stroke,
    role: stage > 0.5 ? "diamond" : "dot",
    rotate: 45,
    rx: Math.max(0, (inner / 2) * (1 - stage)),
    size: inner,
  };
}

/** The size factor of a shape at a stage. */
function sizeAt(settings: PatternSettings, stage: number): number {
  return settings.sizeRamp ? settings.sizeFrom + (1 - settings.sizeFrom) * stage : 1;
}

function morphShapes(input: PatternInput, settings: PatternSettings): PatternShape[] {
  const step = input.cell / 2 / settings.density;
  const base = step * 0.46 * input.scale;
  const shapes: PatternShape[] = [];
  eachCell(input, step, (x, y, _col, row) => {
    const cx = x + step / 2 + (row % 2 === 0 ? 0 : step / 2);
    const cy = y + step / 2;
    const stage = stageAt(input, settings, cx, cy);
    const shapeStage = settings.shape ? stage : 0;
    const size = base * sizeAt(settings, stage);
    const stroke = strokeFor(settings.fill, shapeStage < 0.5, stage, size / 2, settings.stroke);
    shapes.push({
      ...morphShape(cx, cy, size, shapeStage, stroke),
      mix: settings.color ? stage : shapeStage > 0.5 ? 1 : 0,
    });
  });
  return shapes;
}

function checkerShapes(input: PatternInput, settings: PatternSettings): PatternShape[] {
  const step = input.cell / 2 / settings.density;
  const shapes: PatternShape[] = [];
  eachCell(input, step, (x, y, col, row) => {
    const cx = x + step / 2;
    const cy = y + step / 2;
    const isDot = (col + row) % 2 === 0;
    const stage = stageAt(input, settings, cx, cy);
    // A circle is as wide as its square. The tip of a diamond is 1.14 times as far as the edge of a dot, and the side
    // of a square on its tip is the tip distance times √2.
    const r = step * 0.2 * input.scale;
    const full = isDot ? 2 * r : r * DIAMOND_PER_DOT * Math.SQRT2;
    const size = full * sizeAt(settings, stage);
    const stroke = strokeFor(settings.fill, isDot, stage, size / 2, settings.stroke);
    shapes.push({
      ...morphShape(cx, cy, size, isDot ? 0 : 1, stroke),
      mix: settings.color ? stage : isDot ? 0 : 1,
    });
  });
  return shapes;
}

/** The shapes of one pattern in a box of this size. */
export function patternShapes(
  kind: PatternKind,
  settings: PatternSettings,
  width: number,
  height: number
): PatternShape[] {
  const input: PatternInput = { cell: settings.cell, height, scale: settings.scale, seed: settings.seed, width };
  return kind === "morph" ? morphShapes(input, settings) : checkerShapes(input, settings);
}

/**
 * Where the shapes of a pattern in the app stay. The shapes fade away from that place, so the pattern blends into the
 * surface. `corner` keeps the top right corner.
 */
export type AppPatternFade = "none" | "corner";

/** A pattern that the app draws: the kind, the settings and the fade. */
export interface AppPattern {
  kind: PatternKind;
  settings: PatternSettings;
  fade: AppPatternFade;
}

/**
 * The pattern in the top right corner of the account pages. The user picked it in the prototype
 * `2026-11-06-sign-in-pattern` (SPZ-100): the checker, a radial field and no motion. `brand.usage.ts` reads it as the
 * preset of the `signIn` use.
 */
export const SIGN_IN_PATTERN: AppPattern = {
  fade: "corner",
  kind: "checker",
  settings: {
    cell: 64,
    color: true,
    density: 1.3,
    direction: "radial",
    ease: "inOut",
    fill: "solid",
    ground: "white",
    opacity: 0.05,
    reverse: false,
    scale: 1,
    seed: 7,
    shape: false,
    sizeFrom: 0.6,
    sizeRamp: true,
    stroke: 0.8,
  },
};
