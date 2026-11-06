/**
 * The math of the HomePage header when the page scrolls. The search field turns into the search icon, and the
 * bar holds the field while it does. The user picked this motion in the prototype `2026-11-05-home-motion`. The
 * component `HomeHeader.vue` measures the elements and writes the values of `morphFrame()` on each frame.
 */

/** The size of the search icon button and of the circle that the field becomes. */
export const MORPH_CIRCLE_PX = 40;
/** The size of the magnifier icon. In the circle it sits in the center. */
export const MORPH_ICON_PX = 20;
/** How far the outline parts of the copy overlap, so no seam shows between them. */
export const MORPH_SEAM_PX = 0.5;
/** The part of the progress in which the text and the filter button fade. */
const TEXT_END = 0.3;
/** The part of the progress after which the outline and the fill fade, and the icon takes the brand color. */
const FRAME_START = 0.6;
/** For a critically damped spring, the time to reach 95% of a step is this number divided by the angular frequency. */
const SPRING_SETTLE_FACTOR = 4.74;
/** The longest step of the spring, in seconds. A longer frame, for example after a hidden tab, takes more steps. */
const SPRING_MAX_STEP_S = 1 / 120;

/**
 * The sizes and places that the copy of the field needs. They come from the real elements, because a browser can draw
 * the field at another height: Safari on iOS can draw the search input taller than 20px. A copy with fixed sizes then
 * jumps in height when it takes the place of the field.
 *
 * The places are relative to the top row, which stays at the top, so the field at scroll position `s` is at
 * `fieldTop - s`. The places inside the field are relative to its top left corner.
 */
export interface MorphGeometry {
  /** The height of the top row: the bottom of the bar when it does not hold the field. */
  barBase: number;
  fieldHeight: number;
  fieldLeft: number;
  fieldTop: number;
  fieldWidth: number;
  /** The distance from the right edge of the field to the left edge of the filter button. */
  filterRight: number;
  filterTop: number;
  iconLeft: number;
  iconTop: number;
  magnifierLeft: number;
  magnifierTop: number;
  /** The distance from the top of the field to the bottom of the search row. */
  rowBottom: number;
  /** The place of the 20px text line in the field. */
  textLeft: number;
  textTop: number;
}

/** The values of one frame. Each place is relative to the top row, in pixels. */
export interface MorphFrame {
  /** How far the bar reaches below the top row. */
  barExtend: number;
  /** The opacity of the outline and the fill of the copy. */
  frame: number;
  /** The height of the outline. */
  height: number;
  iconLeft: number;
  iconTop: number;
  left: number;
  right: number;
  /** The opacity of the text and of the filter button. */
  text: number;
  /** The opacity of the brand color of the icon. */
  tint: number;
  top: number;
}

/** Returns a number between 0 and 1. */
export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Returns the value between `from` and `to` at `t`. */
function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Returns the part of `t` between `from` and `to`, with a curve that starts and ends softly. */
function smoothRange(t: number, from: number, to: number): number {
  const x = clamp01((t - from) / (to - from));
  return x * x * (3 - 2 * x);
}

/**
 * Returns the frame at progress `t`, from 0 (the field) to 1 (the icon).
 *
 * Both ends of the field move on straight lines to the two sides of the icon, with the same progress, so they start
 * and arrive together. The field shrinks and rises at the same time, and its height goes from the height of the real
 * field to the size of the icon. The bar grows down to hold the field and folds back as the field rises. The bottom of
 * the bar never goes below the place where the search row is now (`scrollTop`), so it never covers content that has
 * already moved up when the spring trails a fast scroll.
 */
export function morphFrame(g: MorphGeometry, t: number, scrollTop: number): MorphFrame {
  const fade = smoothRange(t, FRAME_START, 1);
  const iconInset = (MORPH_CIRCLE_PX - MORPH_ICON_PX) / 2;
  const left = lerp(g.fieldLeft, g.iconLeft, t);
  const barBottom = Math.min(lerp(g.fieldTop + g.rowBottom, g.barBase, t), g.fieldTop + g.rowBottom - scrollTop);
  return {
    barExtend: t > 0 ? Math.max(0, barBottom - g.barBase) : 0,
    frame: 1 - fade,
    height: lerp(g.fieldHeight, MORPH_CIRCLE_PX, t),
    iconLeft: lerp(g.magnifierLeft, iconInset, t),
    iconTop: lerp(g.magnifierTop, iconInset, t),
    left,
    right: lerp(g.fieldLeft + g.fieldWidth, g.iconLeft + MORPH_CIRCLE_PX, t),
    text: 1 - smoothRange(t, 0, TEXT_END),
    tint: fade,
    top: lerp(g.fieldTop, g.iconTop, t),
  };
}

/** The state of a spring that follows a target. */
export interface SpringState {
  speed: number;
  value: number;
}

/**
 * Moves a critically damped spring toward `target` for `seconds`. It starts with no speed and does not overshoot, so a
 * wheel step or a fast flick plays as a soft motion. `settleSeconds` is the time to reach 95% of a step. Returns true
 * when the spring has reached the target.
 */
export function stepSpring(state: SpringState, target: number, seconds: number, settleSeconds: number): boolean {
  if (settleSeconds <= 0) {
    state.value = target;
    state.speed = 0;
    return true;
  }
  const omega = SPRING_SETTLE_FACTOR / settleSeconds;
  let left = Math.min(seconds, 0.1);
  while (left > 0) {
    const dt = Math.min(left, SPRING_MAX_STEP_S);
    state.speed += (omega * omega * (target - state.value) - 2 * omega * state.speed) * dt;
    state.value += state.speed * dt;
    left -= dt;
  }
  if (Math.abs(target - state.value) < 0.001 && Math.abs(state.speed) < 0.01) {
    state.value = target;
    state.speed = 0;
    return true;
  }
  return false;
}
