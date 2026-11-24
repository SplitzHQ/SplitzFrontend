import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GLYPH_TAP_STEPS, type MotionStep } from "../brand-motion";
import { WORDMARK_LETTERS } from "../brand-wordmark";
import BrandTapGlyph from "../BrandTapGlyph.vue";

/** Returns the end timestamp (in ms) of a single `MotionStep`. */
const getStepEndMs = ({ durationMs, startMs }: MotionStep) => startMs + durationMs;

/** Returns the letter steps (`letter-0`..`letter-5`) in reading order. */
const getLetterSteps = () => GLYPH_TAP_STEPS.filter(({ part }) => part.startsWith("letter-"));

/** Stubs `Element.prototype.animate` with a never-finishing Web Animation (jsdom does not implement WAAPI). */
function stubPendingAnimate() {
  const animate = vi.fn(() => ({ cancel: vi.fn(), finished: new Promise(() => {}) }));
  Object.defineProperty(Element.prototype, "animate", { configurable: true, value: animate, writable: true });
  return animate;
}

/** Stubs `window.matchMedia` to report the given `prefers-reduced-motion` result. */
function stubReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", () => ({ addEventListener: vi.fn(), matches, removeEventListener: vi.fn() }));
}

describe("GLYPH_TAP_STEPS", () => {
  it("reveals the wordmark only after the glyph finishes assembling", () => {
    const glyphAssemblyEndMs = Math.max(
      ...GLYPH_TAP_STEPS.filter(({ part }) => ["bar", "diamond", "dot"].includes(part)).map(getStepEndMs)
    );
    expect(Math.min(...getLetterSteps().map(({ startMs }) => startMs))).toBeGreaterThanOrEqual(glyphAssemblyEndMs);
  });

  it("animates every letter and synchronizes the diamond tittle with `letter-3` (`i`)", () => {
    expect(getLetterSteps()).toHaveLength(WORDMARK_LETTERS.length);
    const tittleStep = GLYPH_TAP_STEPS.find(({ part }) => part === "tittle");
    const letterIStep = GLYPH_TAP_STEPS.find(({ part }) => part === "letter-3");
    expect(tittleStep?.startMs).toBe(letterIStep?.startMs);
    expect(tittleStep?.durationMs).toBe(letterIStep?.durationMs);
  });

  it("staggers letters in left-to-right and out right-to-left", () => {
    const steps = getLetterSteps();
    expect(steps.map(({ startMs }) => startMs)).toEqual(steps.map(({ startMs }) => startMs).sort((a, b) => a - b));
    expect(steps.map(getStepEndMs)).toEqual(steps.map(getStepEndMs).sort((a, b) => b - a));
  });

  it("starts and ends every letter at opacity 0 so only the glyph stays visible at rest", () => {
    for (const step of getLetterSteps()) {
      expect(step.keyframes[0]?.opacity).toBe(0);
      expect(step.keyframes[step.keyframes.length - 1]?.opacity).toBe(0);
    }
  });
});

describe("BrandTapGlyph", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows the resting glyph, hides the wordmark SVGs from screen readers, and labels the button", () => {
    const wrapper = mount(BrandTapGlyph);

    expect(wrapper.get("button").attributes("aria-label")).toBe("Splitz");
    expect(wrapper.find('[data-part="resting-glyph"]').exists()).toBe(true);
    expect(wrapper.get('[data-part="letter-0"]').attributes("opacity")).toBe("0");
    expect(wrapper.get('[data-part="tittle"]').attributes("opacity")).toBe("0");
  });

  it("starts the animation on tap and ignores repeat taps until it finishes", async () => {
    stubReducedMotion(false);
    const animate = stubPendingAnimate();
    const wrapper = mount(BrandTapGlyph);

    await wrapper.get("button").trigger("click");
    const initialCallCount = animate.mock.calls.length;
    expect(initialCallCount).toBeGreaterThan(WORDMARK_LETTERS.length);

    await wrapper.get("button").trigger("click");
    expect(animate.mock.calls.length).toBe(initialCallCount);
  });

  it("does not animate when reduced motion is enabled", async () => {
    stubReducedMotion(true);
    const animate = stubPendingAnimate();
    const wrapper = mount(BrandTapGlyph);

    await wrapper.get("button").trigger("click");

    expect(animate).not.toHaveBeenCalled();
  });
});
