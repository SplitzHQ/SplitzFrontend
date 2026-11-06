import { MOTION_EASING } from "@/libs/motion";

import { WORDMARK_TITTLE_SHAPE } from "./brand-wordmark";

/**
 * The motion of the logo on HomePage: the full-screen opening, and the small motion when a person taps the word mark.
 * The values are the picks in the `2026-11-04-logo-opening` prototype. The principles are in `brand.usage.ts`, and the
 * component rules are in `brand-wordmark.usage.ts`.
 *
 * In the small motion, one circle becomes two small circles. One goes to the place of the dot. The other goes to the
 * place of the diamond and changes into the diamond. The bar grows between them.
 *
 * A distance in a step is in the units of `brand-glyph.ts`.
 */

/** One Web Animation on all elements with one `data-part`. */
export interface MotionStep {
  part: string;
  keyframes: Keyframe[];
  /** The start, in milliseconds at normal speed. */
  at: number;
  ms: number;
  easing?: string;
  /** Moves the corner radius of a `<rect>` from the first value to the second. See `playSteps`. */
  rx?: [number, number];
}

const { enter: ENTER, exit: EXIT, pop: POP, sheet: SHEET, standard: STANDARD } = MOTION_EASING;

/**
 * The place of the mark on the word after a tap, in the units of the word. Its size is 20px at the header size, the same
 * as the word. Its bottom is below the baseline, so that its center is on the center of the capitals.
 */
export const TAP_MARK = { belowBaseline: 14, size: 100 } as const;

/** The size of the mark in the opening, in pixels. */
export const OPENING_MARK_PX = 48;
/** The time factor of the small motion in the opening. */
const OPENING_FACTOR = 0.65;
/** How long the mark stays after its motion in the opening, before the layer fades. */
const OPENING_REST_MS = 450;
/** The time of the fade of the opening. */
export const OPENING_FADE_MS = 300;

/** The time factor of the small motion after a tap. */
const TAP_FACTOR = 0.6;
/** The times of a tap, in milliseconds. */
const TAP = {
  letterIn: 180,
  letterOut: 80,
  /** How long the finished mark stays before it leaves. */
  markHold: 280,
  markOut: 120,
  /** The time between two letters. */
  stagger: 18,
  /** The time from the start of the exit of the mark to the return of the word. The mark is gone first. */
  wordBackGap: 120,
} as const;

/** The radius of the one circle at the start. */
const WHOLE_RADIUS = 90;
/** The center of the glyph, where the one circle stands. */
const CENTER = 300;
/** The center and the radius of the dot in `brand-glyph.ts`. */
const DOT_CENTER = 200;
const DOT_RADIUS = 50;
/** The center of the diamond in `brand-glyph.ts`. */
export const DIAMOND_CENTER = 393.1;
/** Half of a side of the square that is the diamond when it turns 45 degrees. */
export const DIAMOND_HALF_SIDE = 40.24;

/** The times of the small motion at normal speed. */
const CIRCLE_MS = 900;
const OFFSETS = { arrive: 0.2, part: 0.26, small: 0.46, smallEnd: 0.54 } as const;
const BAR_AT = 500;
const BAR_MS = 300;
const CORNERS_AT = 480;
const CORNERS_MS = 420;
/** The time until the small motion is complete at normal speed. */
const MARK_MS = Math.max(CIRCLE_MS, BAR_AT + BAR_MS, CORNERS_AT + CORNERS_MS);

/** Scales the bar on its own axis, which turns -45 degrees from the x axis. */
const barLength = (scale: number) => `rotate(-45deg) scaleX(${scale}) rotate(45deg)`;

/** Returns the keyframes of one circle: it arrives, gets small, and moves to its place. */
function circleKeyframes(place: (scale: number, moved?: boolean) => string, whole: number, small: number): Keyframe[] {
  return [
    { easing: POP, offset: 0, opacity: 0, transform: place(whole * 0.6) },
    { offset: OFFSETS.arrive, opacity: 1, transform: place(whole) },
    { offset: OFFSETS.part, opacity: 1, transform: place(whole) },
    { offset: OFFSETS.small, opacity: 1, transform: place(small) },
    { offset: OFFSETS.smallEnd, opacity: 1, transform: place(small) },
    { offset: 1, opacity: 1, transform: place(1, true) },
  ];
}

/** Returns the steps of the small motion from `at`. `factor` scales its times, and `at` stays as it is. */
function markSteps(at: number, factor: number): MotionStep[] {
  const dotFrom = CENTER - DOT_CENTER;
  const diamondFrom = CENTER - DIAMOND_CENTER;
  const dotAt = (scale: number, moved = false) => {
    const distance = moved ? 0 : dotFrom;
    return `translate(${distance}px, ${distance}px) scale(${scale})`;
  };
  const diamondAt = (scale: number, moved = false) => {
    const distance = moved ? 0 : diamondFrom;
    return `translate(${distance}px, ${distance}px) rotate(45deg) scale(${scale})`;
  };
  const ms = CIRCLE_MS * factor;
  return [
    {
      at,
      easing: STANDARD,
      keyframes: circleKeyframes(dotAt, WHOLE_RADIUS / DOT_RADIUS, 1),
      ms,
      part: "dot",
    },
    {
      at,
      easing: STANDARD,
      // At the small size, the second circle has the radius of the dot, so the two small circles are equal.
      keyframes: circleKeyframes(diamondAt, WHOLE_RADIUS / DIAMOND_HALF_SIDE, DOT_RADIUS / DIAMOND_HALF_SIDE),
      ms,
      part: "diamond",
    },
    {
      at: at + CORNERS_AT * factor,
      // This curve changes the corners evenly. The enter curve ends most of the change in its first third.
      easing: STANDARD,
      keyframes: [],
      ms: CORNERS_MS * factor,
      part: "diamond",
      rx: [DIAMOND_HALF_SIDE, 0],
    },
    {
      at: at + BAR_AT * factor,
      easing: ENTER,
      keyframes: [
        { offset: 0, opacity: 0, transform: barLength(0) },
        { offset: 0.2, opacity: 1 },
        { offset: 1, opacity: 1, transform: barLength(1) },
      ],
      ms: BAR_MS * factor,
      part: "bar",
    },
  ];
}

/** The steps of the mark in the opening. */
export const OPENING_STEPS: MotionStep[] = markSteps(0, OPENING_FACTOR);
/** The time from the start of the opening to the start of its fade. */
export const OPENING_STAY_MS = Math.round(MARK_MS * OPENING_FACTOR) + OPENING_REST_MS;

const LETTER_COUNT = 6;
/** The index of the i. The diamond on the word moves with it. */
const LETTER_I = 3;

/** Returns the steps of each letter: it leaves from right to left and comes back from left to right. */
export function letterSteps(backAt: number): MotionStep[] {
  const last = LETTER_COUNT - 1;
  const steps = Array.from({ length: LETTER_COUNT }, (_, letter): MotionStep => {
    const outEnd = (last - letter) * TAP.stagger + TAP.letterOut;
    const inAt = backAt + letter * TAP.stagger;
    const ms = inAt + TAP.letterIn;
    return {
      at: 0,
      easing: EXIT,
      // One element runs one animation here, so the exit and the return are in one list.
      keyframes: [
        { offset: 0, opacity: 1, transform: "translateY(0)" },
        { offset: (outEnd - TAP.letterOut) / ms, opacity: 1, transform: "translateY(0)" },
        { offset: outEnd / ms, opacity: 0, transform: "translateY(0)" },
        { easing: ENTER, offset: inAt / ms, opacity: 0, transform: "translateY(12px)" },
        { offset: 1, opacity: 1, transform: "translateY(0)" },
      ],
      ms,
      part: `letter-${letter}`,
    };
  });
  return [...steps, { ...steps[LETTER_I], part: "tittle" }];
}

/** The times of the diamond when the word comes back, in milliseconds, and the size of the small circle. */
export interface TittleTiming {
  /** The circle starts this long before the last letter ends. That letter has almost stopped by then. */
  lead: number;
  /** The small circle comes from nothing. */
  appear: number;
  /** The circle grows and its corners become square. */
  grow: number;
  /** The square stays, so a person can see it. */
  hold: number;
  /** The square turns into the diamond. */
  turn: number;
  /** The size of the small circle. 1 is the full size. */
  small: number;
}

/** The times that the user picked in the prototype `2026-11-04-wordmark-split-glyph`. */
export const TITTLE_TIMING: TittleTiming = { appear: 80, grow: 150, hold: 20, lead: 110, small: 0.45, turn: 260 };

/** Half of a side of the square that is the diamond on the word when it turns 45 degrees. */
export const TITTLE_HALF_SIDE = WORDMARK_TITTLE_SHAPE.half * Math.SQRT1_2;

/**
 * Returns the steps of the diamond on the word. It leaves with the i. When the word comes back, a small circle comes over
 * the i as the last letter settles. The circle grows, its corners become square, and the square turns 45 degrees.
 *
 * A path cannot change from a circle to a square in all browsers, so a `<rect>` with the part `tittle-shape` draws these
 * shapes. The rect ends on the place of the path, and the path comes back in the last frame.
 */
function tittleSteps(letters: MotionStep[], timing: TittleTiming): MotionStep[] {
  const letter = letters[LETTER_I];
  const wordEnd = Math.max(...letters.map(({ at, ms }) => at + ms));
  const startAt = wordEnd - timing.lead;
  const growAt = startAt + timing.appear;
  const turnAt = growAt + timing.grow + timing.hold;
  const total = turnAt + timing.turn;
  const shapeMs = total - startAt;
  const offset = (time: number) => (time - startAt) / shapeMs;

  return [
    {
      at: 0,
      easing: EXIT,
      keyframes: [
        // The exit is the exit of the i, at the same times.
        ...letter.keyframes
          .slice(0, 3)
          .map((frame) => ({ ...frame, offset: (Number(frame.offset) * letter.ms) / total })),
        { offset: 0.9999, opacity: 0, transform: "none" },
        { offset: 1, opacity: 1, transform: "none" },
      ],
      ms: total,
      part: "tittle",
    },
    {
      at: startAt,
      keyframes: [
        { easing: POP, offset: 0, opacity: 0, transform: "scale(0) rotate(0deg)" },
        { easing: STANDARD, offset: offset(growAt), opacity: 1, transform: `scale(${timing.small}) rotate(0deg)` },
        { easing: "linear", offset: offset(growAt + timing.grow), opacity: 1, transform: "scale(1) rotate(0deg)" },
        { easing: SHEET, offset: offset(turnAt), opacity: 1, transform: "scale(1) rotate(0deg)" },
        { offset: 1, opacity: 1, transform: "scale(1) rotate(45deg)" },
      ],
      ms: shapeMs,
      part: "tittle-shape",
    },
    {
      at: growAt,
      easing: STANDARD,
      keyframes: [],
      ms: timing.grow,
      part: "tittle-shape",
      rx: [TITTLE_HALF_SIDE, 0],
    },
  ];
}

/**
 * Returns the steps of a tap: the letters leave, the small motion plays, the mark leaves, the letters come back, and the
 * diamond forms on the i.
 */
export function tapSteps(timing: TittleTiming = TITTLE_TIMING): MotionStep[] {
  // The small motion starts when the last letter is gone, so the word and the mark never overlap.
  const start = (LETTER_COUNT - 1) * TAP.stagger + TAP.letterOut;
  const leaveAt = start + Math.round(MARK_MS * TAP_FACTOR) + TAP.markHold;
  const leaveEnd = leaveAt + TAP.markOut;
  const letters = letterSteps(leaveAt + TAP.wordBackGap).filter(({ part }) => part !== "tittle");
  return [
    ...letters,
    ...tittleSteps(letters, timing),
    ...markSteps(start, TAP_FACTOR),
    {
      at: 0,
      easing: EXIT,
      keyframes: [
        { offset: 0, opacity: 0, transform: "scale(1)" },
        { offset: (start - 1) / leaveEnd, opacity: 0, transform: "scale(1)" },
        { offset: start / leaveEnd, opacity: 1, transform: "scale(1)" },
        { offset: leaveAt / leaveEnd, opacity: 1, transform: "scale(1)" },
        { offset: 1, opacity: 0, transform: "scale(0.8)" },
      ],
      ms: leaveEnd,
      part: "mark",
    },
  ];
}

/** The steps of a tap on the word mark. */
export const TAP_STEPS: MotionStep[] = tapSteps();

/** The time that the glyph at rest takes to leave after a tap on the glyph alone. */
const REST_OUT_MS = 120;
/** How long the mark and the whole word stay together, so a person can read the word. */
const WORD_HOLD_MS = 800;

/**
 * Returns the steps of each letter for a visit: the letters come in from left to right, stay, and leave from right to
 * left. The first letter starts at `inAt`.
 */
export function letterVisitSteps(inAt: number): MotionStep[] {
  const last = LETTER_COUNT - 1;
  const leaveAt = inAt + last * TAP.stagger + TAP.letterIn + WORD_HOLD_MS;
  const steps = Array.from({ length: LETTER_COUNT }, (_, letter): MotionStep => {
    const at = inAt + letter * TAP.stagger;
    const outAt = leaveAt + (last - letter) * TAP.stagger;
    const ms = outAt + TAP.letterOut - at;
    return {
      at,
      easing: ENTER,
      // One element runs one animation here, so the entry and the exit are in one list.
      keyframes: [
        { offset: 0, opacity: 0, transform: "translateY(12px)" },
        { offset: TAP.letterIn / ms, opacity: 1, transform: "translateY(0)" },
        { easing: EXIT, offset: (outAt - at) / ms, opacity: 1, transform: "translateY(0)" },
        { offset: 1, opacity: 0, transform: "translateY(0)" },
      ],
      ms,
      part: `letter-${letter}`,
    };
  });
  return [...steps, { ...steps[LETTER_I], part: "tittle" }];
}

/**
 * The steps of a tap on the glyph alone: the glyph at rest leaves, the small motion plays, the whole word comes in next
 * to the mark, and the word leaves again. The motion ends on the shapes of the glyph, so the swap back to the glyph at
 * rest does not show.
 */
export const MARK_TAP_STEPS: MotionStep[] = [
  {
    at: 0,
    easing: EXIT,
    keyframes: [
      { offset: 0, opacity: 1, transform: "scale(1)" },
      { offset: 1, opacity: 0, transform: "scale(0.8)" },
    ],
    ms: REST_OUT_MS,
    part: "rest",
  },
  ...markSteps(REST_OUT_MS, TAP_FACTOR),
  ...letterVisitSteps(REST_OUT_MS + Math.round(MARK_MS * TAP_FACTOR)),
];

/**
 * Moves the corner radius of a `<rect>` with the progress of an empty animation. Safari cannot animate `rx` or the `d`
 * of a path with CSS, and this works in all browsers. The empty animation keeps the delay, the speed and the cancel in
 * one place with the other steps.
 */
function driveRadius(element: Element, clock: Animation, [from, to]: [number, number]): void {
  const tick = (): void => {
    if (clock.playState === "idle") return;
    const progress = clock.effect?.getComputedTiming().progress ?? 0;
    element.setAttribute("rx", String(from + (to - from) * progress));
    if (clock.playState !== "finished") requestAnimationFrame(tick);
  };
  tick();
}

/**
 * Plays steps on the parts inside `root`. Each animation keeps its first frame before its delay and its last frame until
 * `cancelWhenDone` cancels it. The attributes of the elements then hold the rest state again.
 * @param slow - The factor on all times. See `motionSlow`.
 */
export function playSteps(root: Element, steps: MotionStep[], slow: number): Animation[] {
  return steps.flatMap(({ at, easing = "linear", keyframes, ms, part, rx }) =>
    [...root.querySelectorAll(`[data-part="${part}"]`)].map((element) => {
      const timing = { delay: at * slow, duration: ms * slow, fill: "both" as const };
      if (rx) {
        const clock = element.animate([], { ...timing, easing });
        driveRadius(element, clock, rx);
        return clock;
      }
      // The curve goes on each keyframe. On the options, it would stretch over the whole step and move its holds.
      return element.animate(
        keyframes.map((keyframe) => ({ easing, ...keyframe })),
        timing
      );
    })
  );
}

/** Cancels all animations when the last one has ended. A cancel before the end also ends the wait. */
export async function cancelWhenDone(animations: Animation[]): Promise<void> {
  await Promise.allSettled(animations.map(({ finished }) => finished));
  animations.forEach((animation) => {
    animation.cancel();
  });
}

/** True after this run of the app has claimed the opening. A new run of the JavaScript starts at false. */
let openingClaimed = false;

/**
 * Returns true one time for each run of the app. So the opening plays after a cold start, and it does not play when a
 * person comes back from another page or from another app. This flag is in memory, so it needs no storage.
 */
export function claimOpening(): boolean {
  if (openingClaimed) return false;
  openingClaimed = true;
  return true;
}
