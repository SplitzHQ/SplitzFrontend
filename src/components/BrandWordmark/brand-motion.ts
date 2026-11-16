import { MOTION_EASING } from "@/libs/motion";

import { BRAND_GLYPH, BRAND_GLYPH_BOX, BRAND_GLYPH_DIAMOND_SQUARE } from "./brand-glyph";
import { WORDMARK_LETTERS, WORDMARK_TITTLE_GEOMETRY } from "./brand-wordmark";

/**
 * Shared Web Animations timelines and playback helpers for the Splitz brand animations:
 * 1. `OPENING_GLYPH_STEPS`: Full-screen cold-start opening overlay (`BrandOpeningOverlay`).
 * 2. `WORDMARK_TAP_STEPS`: HomePage header wordmark tap animation (`BrandTapWordmark`).
 * 3. `GLYPH_TAP_STEPS`: AuthShell standalone glyph tap animation (`BrandTapGlyph`).
 *
 * All three animations share the same glyph assembly sequence (`buildGlyphAssemblySteps`): a single merged circle
 * pops in at the center of the glyph, shrinks, splits into two circles that slide to the dot and diamond positions,
 * sharpens the bottom-right circle's corners into a diamond, and grows the diagonal bar between them.
 *
 * Translation distances in glyph steps use `brand-glyph.ts` SVG coordinates; wordmark steps use `brand-wordmark.ts`
 * coordinates. See `brand-wordmark.usage.ts` for behavioral rules.
 */

/** Single Web Animation track targeting every descendant element with `data-part="<part>"`. */
export interface MotionStep {
  /** Value of the target element's `data-part` attribute. */
  part: string;
  /** Web Animations keyframes. Leave empty when `cornerRadius` drives an SVG `<rect>` `rx` attribute instead. */
  keyframes: Keyframe[];
  /** Start offset on the sequence timeline in milliseconds (at `1x` speed). */
  startMs: number;
  /** Duration of this step in milliseconds (at `1x` speed). */
  durationMs: number;
  /** Default CSS easing curve applied between keyframes that do not specify their own `easing`. */
  easing?: string;
  /** Interpolates an SVG `<rect>`'s `rx` attribute from `from` to `to` over the step. See `animateRectCornerRadius`. */
  cornerRadius?: [from: number, to: number];
}

const { enter: ENTER, exit: EXIT, pop: POP, sheet: SHEET, standard: STANDARD } = MOTION_EASING;

/**
 * Placement of the animated glyph inside `WORDMARK_LAYOUT` (`100` units = `1em`, baseline at `y = 0`, capital letters
 * centered near `y = -36`). Extending a `100×100` glyph `14` units below the baseline (`y = -86..14`) aligns its
 * vertical center (`y = -36`) with the capital letters.
 */
export const WORDMARK_GLYPH_ALIGNMENT = {
  belowBaselineUnits: 14,
  sizeUnits: 100,
} as const;

/** Rendered width and height (in CSS pixels) of the glyph on `BrandOpeningOverlay`. */
export const OPENING_GLYPH_SIZE_PX = 48;
/** Multiplier applied to base glyph assembly durations during `BrandOpeningOverlay`. */
const OPENING_DURATION_SCALE = 0.65;
/** Milliseconds the assembled glyph holds on screen before `BrandOpeningOverlay` begins fading out. */
const OPENING_HOLD_MS = 450;
/** Fade-out duration (in milliseconds at `1x` speed) of `BrandOpeningOverlay`. */
export const OPENING_FADE_MS = 300;

/** Multiplier applied to base glyph assembly durations during tap animations. */
const TAP_DURATION_SCALE = 0.6;

/** Shared letter and glyph transition durations (in milliseconds at `1x` speed) for tap animations. */
const TAP_TIMING_MS = {
  /** Duration for a resting or assembled glyph to shrink and fade out. */
  glyphExit: 120,
  /** Hold time after the glyph finishes assembling in `BrandTapWordmark` before it shrinks away. */
  glyphHold: 280,
  /** Duration for each letter to rise into view. */
  letterEnter: 180,
  /** Duration for each letter to fade out. */
  letterExit: 80,
  /** Start-time stagger between adjacent letters. */
  letterStagger: 18,
  /** Hold time in `BrandTapGlyph` while the full wordmark stays visible beside the glyph so the user can read it. */
  wordReadHold: 800,
} as const;

/** Radius of the initial merged circle at the glyph center before it shrinks and splits into dot + diamond. */
const MERGED_CIRCLE_RADIUS = 90;

/** Base timing (in milliseconds at `1x` speed) of the glyph assembly sequence before `durationScale` is applied. */
const GLYPH_ASSEMBLY_TIMING_MS = {
  barDelay: 500,
  barDuration: 300,
  circleDuration: 900,
  diamondCornersDelay: 480,
  diamondCornersDuration: 420,
} as const;

/** Normalized keyframe offsets (`0..1`) within `GLYPH_ASSEMBLY_TIMING_MS.circleDuration`. */
const SPLIT_CIRCLE_OFFSETS = {
  mergedHoldEnd: 0.26,
  popInEnd: 0.2,
  shrinkEnd: 0.46,
  shrunkHoldEnd: 0.54,
} as const;

/** Total duration of the glyph assembly sequence at `1x` speed. */
const GLYPH_ASSEMBLY_DURATION_MS = Math.max(
  GLYPH_ASSEMBLY_TIMING_MS.circleDuration,
  GLYPH_ASSEMBLY_TIMING_MS.barDelay + GLYPH_ASSEMBLY_TIMING_MS.barDuration,
  GLYPH_ASSEMBLY_TIMING_MS.diamondCornersDelay + GLYPH_ASSEMBLY_TIMING_MS.diamondCornersDuration
);

/**
 * Scales the `-45°` diagonal bar along its length without changing its thickness:
 * rotates `+45°` onto the horizontal axis, applies `scaleX`, then rotates `-45°` back to its diagonal angle.
 */
const scaleBarAlongAxis = (lengthScale: number) => `rotate(-45deg) scaleX(${lengthScale}) rotate(45deg)`;

/**
 * Builds keyframes for one half of the splitting circle (`dot` or `diamond`):
 * pops in as part of the merged center circle, holds, shrinks to dot size at the center, holds briefly, then slides
 * to its final glyph coordinates at `scale(1)`.
 */
function buildSplitCircleKeyframes(
  formatTransform: (scale: number, atFinalPosition?: boolean) => string,
  mergedScale: number,
  shrunkScale: number
): Keyframe[] {
  return [
    { easing: POP, offset: 0, opacity: 0, transform: formatTransform(mergedScale * 0.6) },
    { offset: SPLIT_CIRCLE_OFFSETS.popInEnd, opacity: 1, transform: formatTransform(mergedScale) },
    { offset: SPLIT_CIRCLE_OFFSETS.mergedHoldEnd, opacity: 1, transform: formatTransform(mergedScale) },
    { offset: SPLIT_CIRCLE_OFFSETS.shrinkEnd, opacity: 1, transform: formatTransform(shrunkScale) },
    { offset: SPLIT_CIRCLE_OFFSETS.shrunkHoldEnd, opacity: 1, transform: formatTransform(shrunkScale) },
    { offset: 1, opacity: 1, transform: formatTransform(1, true) },
  ];
}

/**
 * Builds the four `MotionStep` tracks that assemble `BrandAnimatedGlyphParts` starting at `startMs`, with internal
 * durations scaled by `durationScale` (`startMs` itself is preserved as passed).
 */
function buildGlyphAssemblySteps(startMs: number, durationScale: number): MotionStep[] {
  const dotRadius = BRAND_GLYPH.dot.r;
  const dotOffsetToCenter = BRAND_GLYPH_BOX.center - BRAND_GLYPH.dot.cx;
  const diamondOffsetToCenter = BRAND_GLYPH_BOX.center - BRAND_GLYPH_DIAMOND_SQUARE.center;
  const diamondHalfSide = BRAND_GLYPH_DIAMOND_SQUARE.halfSide;

  const formatDotTransform = (scale: number, atFinalPosition = false) => {
    const offset = atFinalPosition ? 0 : dotOffsetToCenter;
    return `translate(${offset}px, ${offset}px) scale(${scale})`;
  };
  const formatDiamondTransform = (scale: number, atFinalPosition = false) => {
    const offset = atFinalPosition ? 0 : diamondOffsetToCenter;
    return `translate(${offset}px, ${offset}px) rotate(45deg) scale(${scale})`;
  };

  const circleDurationMs = GLYPH_ASSEMBLY_TIMING_MS.circleDuration * durationScale;
  return [
    {
      durationMs: circleDurationMs,
      easing: STANDARD,
      keyframes: buildSplitCircleKeyframes(formatDotTransform, MERGED_CIRCLE_RADIUS / dotRadius, 1),
      part: "dot",
      startMs,
    },
    {
      durationMs: circleDurationMs,
      easing: STANDARD,
      // Match `dotRadius` while shrunk at the center so both circles look identical right as they separate.
      keyframes: buildSplitCircleKeyframes(
        formatDiamondTransform,
        MERGED_CIRCLE_RADIUS / diamondHalfSide,
        dotRadius / diamondHalfSide
      ),
      part: "diamond",
      startMs,
    },
    {
      cornerRadius: [diamondHalfSide, 0],
      durationMs: GLYPH_ASSEMBLY_TIMING_MS.diamondCornersDuration * durationScale,
      // `STANDARD` sharpens the corners smoothly across the full step (`ENTER` would finish most of it too early).
      easing: STANDARD,
      keyframes: [],
      part: "diamond",
      startMs: startMs + GLYPH_ASSEMBLY_TIMING_MS.diamondCornersDelay * durationScale,
    },
    {
      durationMs: GLYPH_ASSEMBLY_TIMING_MS.barDuration * durationScale,
      easing: ENTER,
      keyframes: [
        { offset: 0, opacity: 0, transform: scaleBarAlongAxis(0) },
        { offset: 0.2, opacity: 1 },
        { offset: 1, opacity: 1, transform: scaleBarAlongAxis(1) },
      ],
      part: "bar",
      startMs: startMs + GLYPH_ASSEMBLY_TIMING_MS.barDelay * durationScale,
    },
  ];
}

/** Glyph assembly steps played on `BrandOpeningOverlay`. */
export const OPENING_GLYPH_STEPS: MotionStep[] = buildGlyphAssemblySteps(0, OPENING_DURATION_SCALE);

/** Milliseconds `BrandOpeningOverlay` stays fully opaque (glyph assembly + hold) before fading out. */
export const OPENING_OPAQUE_MS = Math.round(GLYPH_ASSEMBLY_DURATION_MS * OPENING_DURATION_SCALE) + OPENING_HOLD_MS;

const LETTER_COUNT = WORDMARK_LETTERS.length;
/** Zero-based index of the dotless lowercase `i` in `"Splitz"`, paired with the diamond tittle. */
const LETTER_I_INDEX = 3;

/**
 * Builds one combined exit-and-return step per wordmark letter (`letter-0`..`letter-5`):
 * letters fade out right-to-left starting at `0ms`, stay hidden while the glyph plays, then rise back in left-to-right
 * starting at `returnStartMs`.
 */
export function buildLetterExitAndReturnSteps(returnStartMs: number): MotionStep[] {
  const lastLetterIndex = LETTER_COUNT - 1;
  return Array.from({ length: LETTER_COUNT }, (_, letterIndex): MotionStep => {
    const exitEndMs = (lastLetterIndex - letterIndex) * TAP_TIMING_MS.letterStagger + TAP_TIMING_MS.letterExit;
    const enterStartMs = returnStartMs + letterIndex * TAP_TIMING_MS.letterStagger;
    const durationMs = enterStartMs + TAP_TIMING_MS.letterEnter;
    return {
      durationMs,
      easing: EXIT,
      // Combine exit and return into a single keyframe list so each `<path>` runs one Web Animation per tap.
      keyframes: [
        { offset: 0, opacity: 1, transform: "translateY(0)" },
        { offset: (exitEndMs - TAP_TIMING_MS.letterExit) / durationMs, opacity: 1, transform: "translateY(0)" },
        { offset: exitEndMs / durationMs, opacity: 0, transform: "translateY(0)" },
        { easing: ENTER, offset: enterStartMs / durationMs, opacity: 0, transform: "translateY(12px)" },
        { offset: 1, opacity: 1, transform: "translateY(0)" },
      ],
      part: `letter-${letterIndex}`,
      startMs: 0,
    };
  });
}

/** Timing parameters and initial scale for the diamond tittle morph at the end of `BrandTapWordmark`. */
export interface TittleTiming {
  /** Milliseconds before the last letter finishes settling when the circle starts popping in above the `i`. */
  leadMs: number;
  /** Duration (ms) for the small circle to pop in from `scale(0)` to `initialCircleScale`. */
  popInMs: number;
  /** Duration (ms) for the circle to expand to full size while its corners sharpen into a square. */
  expandToSquareMs: number;
  /** Brief pause (ms) as an unrotated square so the intermediate square state reads clearly. */
  squareHoldMs: number;
  /** Duration (ms) for the square to rotate 45° into the final diamond. */
  rotateToDiamondMs: number;
  /** Initial circle scale (`0..1`) right after popping in, where `1` is the full square size. */
  initialCircleScale: number;
}

/** Default tittle morph timing used by `BrandTapWordmark`. */
export const TITTLE_TIMING: TittleTiming = {
  expandToSquareMs: 150,
  initialCircleScale: 0.45,
  leadMs: 110,
  popInMs: 80,
  rotateToDiamondMs: 260,
  squareHoldMs: 20,
};

/** Half the side length of the unrotated `<rect>` that matches `WORDMARK_TITTLE` once rotated 45°. */
export const TITTLE_SQUARE_HALF_SIDE = WORDMARK_TITTLE_GEOMETRY.halfDiagonal * Math.SQRT1_2;

/**
 * Builds the steps for the diamond tittle above the `i` during a wordmark tap:
 * 1. `tittle` (`<path>`): fades out alongside `letter-3` (`i`), stays hidden during the morph, and snaps back on the
 *    final frame when `tittle-morph` finishes in the exact same diamond pose.
 * 2. `tittle-morph` (`<rect>`): pops in as a small circle while the last letter settles, expands into a sharp-cornered
 *    square (`rx` animated to `0`), holds briefly, and rotates 45° into the diamond. Using `<rect>` works in every
 *    browser without relying on SVG `<path d>` morphing.
 */
function buildTittleMorphSteps(letterSteps: MotionStep[], timing: TittleTiming): MotionStep[] {
  const letterIStep = letterSteps[LETTER_I_INDEX];
  const wordReturnEndMs = Math.max(...letterSteps.map(({ durationMs, startMs }) => startMs + durationMs));
  const morphStartMs = wordReturnEndMs - timing.leadMs;
  const expandStartMs = morphStartMs + timing.popInMs;
  const rotateStartMs = expandStartMs + timing.expandToSquareMs + timing.squareHoldMs;
  const totalDurationMs = rotateStartMs + timing.rotateToDiamondMs;
  const morphDurationMs = totalDurationMs - morphStartMs;
  const morphOffsetAt = (timeMs: number) => (timeMs - morphStartMs) / morphDurationMs;

  return [
    {
      durationMs: totalDurationMs,
      easing: EXIT,
      keyframes: [
        // Re-map the first three keyframes of `letter-3` so `tittle` fades out at the exact same timestamps as `i`.
        ...letterIStep.keyframes
          .slice(0, 3)
          .map((frame) => ({ ...frame, offset: (Number(frame.offset) * letterIStep.durationMs) / totalDurationMs })),
        { offset: 0.9999, opacity: 0, transform: "none" },
        { offset: 1, opacity: 1, transform: "none" },
      ],
      part: "tittle",
      startMs: 0,
    },
    {
      durationMs: morphDurationMs,
      keyframes: [
        { easing: POP, offset: 0, opacity: 0, transform: "scale(0) rotate(0deg)" },
        {
          easing: STANDARD,
          offset: morphOffsetAt(expandStartMs),
          opacity: 1,
          transform: `scale(${timing.initialCircleScale}) rotate(0deg)`,
        },
        {
          easing: "linear",
          offset: morphOffsetAt(expandStartMs + timing.expandToSquareMs),
          opacity: 1,
          transform: "scale(1) rotate(0deg)",
        },
        { easing: SHEET, offset: morphOffsetAt(rotateStartMs), opacity: 1, transform: "scale(1) rotate(0deg)" },
        { offset: 1, opacity: 1, transform: "scale(1) rotate(45deg)" },
      ],
      part: "tittle-morph",
      startMs: morphStartMs,
    },
    {
      cornerRadius: [TITTLE_SQUARE_HALF_SIDE, 0],
      durationMs: timing.expandToSquareMs,
      easing: STANDARD,
      keyframes: [],
      part: "tittle-morph",
      startMs: expandStartMs,
    },
  ];
}

/**
 * Builds the full `BrandTapWordmark` sequence:
 * letters fade out right-to-left → glyph assembles, holds, and shrinks out → letters rise back in left-to-right →
 * diamond tittle morphs from a circle into a 45° rotated square above the `i`.
 */
export function buildWordmarkTapSteps(timing: TittleTiming = TITTLE_TIMING): MotionStep[] {
  // Start glyph assembly only after the leftmost letter (`S`) has finished fading out so wordmark and glyph never overlap.
  const glyphStartMs = (LETTER_COUNT - 1) * TAP_TIMING_MS.letterStagger + TAP_TIMING_MS.letterExit;
  const glyphExitStartMs =
    glyphStartMs + Math.round(GLYPH_ASSEMBLY_DURATION_MS * TAP_DURATION_SCALE) + TAP_TIMING_MS.glyphHold;
  const glyphExitEndMs = glyphExitStartMs + TAP_TIMING_MS.glyphExit;
  const letterSteps = buildLetterExitAndReturnSteps(glyphExitEndMs);

  return [
    ...letterSteps,
    ...buildTittleMorphSteps(letterSteps, timing),
    ...buildGlyphAssemblySteps(glyphStartMs, TAP_DURATION_SCALE),
    {
      durationMs: glyphExitEndMs,
      easing: EXIT,
      keyframes: [
        { offset: 0, opacity: 0, transform: "scale(1)" },
        { offset: (glyphStartMs - 1) / glyphExitEndMs, opacity: 0, transform: "scale(1)" },
        { offset: glyphStartMs / glyphExitEndMs, opacity: 1, transform: "scale(1)" },
        { offset: glyphExitStartMs / glyphExitEndMs, opacity: 1, transform: "scale(1)" },
        { offset: 1, opacity: 0, transform: "scale(0.8)" },
      ],
      part: "glyph",
      startMs: 0,
    },
  ];
}

/** Pre-built steps for `BrandTapWordmark` using `TITTLE_TIMING`. */
export const WORDMARK_TAP_STEPS: MotionStep[] = buildWordmarkTapSteps();

/**
 * Builds temporary reveal-and-exit steps for the wordmark letters and tittle in `BrandTapGlyph`:
 * letters rise in left-to-right starting at `enterStartMs`, stay readable for `TAP_TIMING_MS.wordReadHold`, and fade
 * out right-to-left.
 */
export function buildWordmarkRevealAndExitSteps(enterStartMs: number): MotionStep[] {
  const lastLetterIndex = LETTER_COUNT - 1;
  const exitWaveStartMs =
    enterStartMs +
    lastLetterIndex * TAP_TIMING_MS.letterStagger +
    TAP_TIMING_MS.letterEnter +
    TAP_TIMING_MS.wordReadHold;
  const letterSteps = Array.from({ length: LETTER_COUNT }, (_, letterIndex): MotionStep => {
    const startMs = enterStartMs + letterIndex * TAP_TIMING_MS.letterStagger;
    const letterExitStartMs = exitWaveStartMs + (lastLetterIndex - letterIndex) * TAP_TIMING_MS.letterStagger;
    const durationMs = letterExitStartMs + TAP_TIMING_MS.letterExit - startMs;
    return {
      durationMs,
      easing: ENTER,
      // Combine entrance, hold, and exit into one keyframe list per letter.
      keyframes: [
        { offset: 0, opacity: 0, transform: "translateY(12px)" },
        { offset: TAP_TIMING_MS.letterEnter / durationMs, opacity: 1, transform: "translateY(0)" },
        { easing: EXIT, offset: (letterExitStartMs - startMs) / durationMs, opacity: 1, transform: "translateY(0)" },
        { offset: 1, opacity: 0, transform: "translateY(0)" },
      ],
      part: `letter-${letterIndex}`,
      startMs,
    };
  });
  return [...letterSteps, { ...letterSteps[LETTER_I_INDEX], part: "tittle" }];
}

/**
 * Full tap sequence for `BrandTapGlyph`:
 * resting glyph shrinks out → animated glyph parts assemble in its place → wordmark reveals beside the glyph, holds,
 * and fades away. Because the animated glyph parts finish on the exact geometry of `BRAND_GLYPH`, cancelling the
 * animations at the end restores `resting-glyph` without a visible jump.
 */
export const GLYPH_TAP_STEPS: MotionStep[] = [
  {
    durationMs: TAP_TIMING_MS.glyphExit,
    easing: EXIT,
    keyframes: [
      { offset: 0, opacity: 1, transform: "scale(1)" },
      { offset: 1, opacity: 0, transform: "scale(0.8)" },
    ],
    part: "resting-glyph",
    startMs: 0,
  },
  ...buildGlyphAssemblySteps(TAP_TIMING_MS.glyphExit, TAP_DURATION_SCALE),
  ...buildWordmarkRevealAndExitSteps(
    TAP_TIMING_MS.glyphExit + Math.round(GLYPH_ASSEMBLY_DURATION_MS * TAP_DURATION_SCALE)
  ),
];

/**
 * Drives an SVG `<rect>`'s `rx` attribute on each animation frame using the progress of an empty Web Animation.
 * Safari does not animate SVG `rx` via CSS or WAAPI keyframes, whereas reading `getComputedTiming().progress` works
 * across all browsers while keeping delay, easing, speed scaling, and cancellation unified with the other animations.
 */
function animateRectCornerRadius(
  element: Element,
  timingAnimation: Animation,
  [fromRadius, toRadius]: [number, number]
): void {
  const updateRadiusOnFrame = (): void => {
    if (timingAnimation.playState === "idle") return;
    const progress = timingAnimation.effect?.getComputedTiming().progress ?? 0;
    element.setAttribute("rx", String(fromRadius + (toRadius - fromRadius) * progress));
    if (timingAnimation.playState !== "finished") requestAnimationFrame(updateRadiusOnFrame);
  };
  updateRadiusOnFrame();
}

/**
 * Starts Web Animations for `steps` on matching `[data-part]` descendants inside `root`.
 *
 * Uses `fill: "both"` so each element holds its initial frame during `delay` and its final frame until
 * `cancelAnimationsWhenFinished` cancels all tracks together, returning elements to their resting SVG attributes.
 * @param durationScale - Multiplier applied to every `startMs` and `durationMs` (see `motionSlow`).
 */
export function playMotionSteps(root: Element, steps: MotionStep[], durationScale: number): Animation[] {
  return steps.flatMap(({ cornerRadius, durationMs, easing = "linear", keyframes, part, startMs }) =>
    [...root.querySelectorAll(`[data-part="${part}"]`)].map((element) => {
      const timing = {
        delay: startMs * durationScale,
        duration: durationMs * durationScale,
        fill: "both" as const,
      };
      if (cornerRadius) {
        const timingAnimation = element.animate([], { ...timing, easing });
        animateRectCornerRadius(element, timingAnimation, cornerRadius);
        return timingAnimation;
      }
      // Attach `easing` to each individual keyframe instead of `timing`: top-level WAAPI `easing` warps progress
      // across the entire animation and shifts intermediate hold offsets.
      return element.animate(
        keyframes.map((keyframe) => ({ easing, ...keyframe })),
        timing
      );
    })
  );
}

/** Waits until every animation finishes (or is cancelled early), then cancels all of them to release `fill: "both"`. */
export async function cancelAnimationsWhenFinished(animations: Animation[]): Promise<void> {
  await Promise.allSettled(animations.map(({ finished }) => finished));
  animations.forEach((animation) => {
    animation.cancel();
  });
}

/** Tracks whether the cold-start opening overlay has already played during the current JavaScript runtime. */
let hasPlayedOpening = false;

/**
 * Claims the single cold-start opening play for the current app session.
 * Returns `true` on the first call after page load and `false` on subsequent route navigations while the SPA stays
 * in memory.
 */
export function claimOpeningPlay(): boolean {
  if (hasPlayedOpening) return false;
  hasPlayedOpening = true;
  return true;
}
