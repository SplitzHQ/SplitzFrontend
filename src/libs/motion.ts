/**
 * Script mirror of the motion tokens in `src/assets/motion.css`.
 *
 * Use it where CSS cannot reach: motion-v transitions, timers that wait for a transition, and scroll calls.
 * These are the base values. The design-system tests check that they match the CSS.
 */
export const MOTION_DURATION_MS = {
  container: 250,
  exit: 150,
  feedback: 150,
  hoverIn: 100,
  sheet: 300,
  state: 200,
} as const;

/** The motion curves, written exactly as in the CSS. */
export const MOTION_EASING = {
  enter: "cubic-bezier(0.22, 1, 0.36, 1)",
  exit: "cubic-bezier(0.32, 0, 0.67, 0)",
  pop: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  sheet: "cubic-bezier(0.32, 0.72, 0, 1)",
  standard: "cubic-bezier(0.25, 0.1, 0.25, 1)",
} as const;

export type MotionDuration = keyof typeof MOTION_DURATION_MS;
export type MotionEasing = keyof typeof MOTION_EASING;

/**
 * Returns true when the system asks for reduced motion, or when `<html data-reduce-motion>` is set.
 * Read it at call time, because both can change while the app runs.
 */
export function prefersReducedMotion(): boolean {
  if (typeof document === "undefined") return false;
  if (document.documentElement.hasAttribute("data-reduce-motion")) return true;
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Reads the `--motion-slow` factor from the root element. Returns 1 when it is not set. */
function motionSlow(): number {
  if (typeof document === "undefined") return 1;
  const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--motion-slow"));
  return Number.isFinite(value) && value > 0 ? value : 1;
}

/** Returns a duration token in milliseconds: 0 under reduced motion, stretched by `--motion-slow`. */
export function motionMs(duration: MotionDuration): number {
  return prefersReducedMotion() ? 0 : MOTION_DURATION_MS[duration] * motionSlow();
}

/** Returns a duration token in seconds, the unit that motion-v expects. */
export function motionSeconds(duration: MotionDuration): number {
  return motionMs(duration) / 1000;
}

/** Returns the four control points of a curve, the form that motion-v accepts as `ease`. */
export function easingPoints(easing: MotionEasing): [number, number, number, number] {
  const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = (MOTION_EASING[easing].match(/-?[\d.]+/g) ?? []).map(Number);
  return [x1, y1, x2, y2];
}

/** Returns the scroll behavior for `scrollTo` and `scrollIntoView`: smooth unless motion is reduced. */
export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}
