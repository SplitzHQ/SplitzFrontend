import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MARK_TAP_STEPS, type MotionStep } from "../brand-motion";
import { WORDMARK_LETTERS } from "../brand-wordmark";
import BrandTapMark from "../BrandTapMark.vue";

/** Returns the time when one step ends. */
const stepEnd = ({ at, ms }: MotionStep) => at + ms;

/** Returns the steps of the letters, in the order of the word. */
const letters = () => MARK_TAP_STEPS.filter(({ part }) => part.startsWith("letter-"));

/** Stubs the Web Animations API, which jsdom does not have. */
function stubAnimate() {
  const animate = vi.fn(() => ({ cancel: vi.fn(), finished: new Promise(() => {}) }));
  Object.defineProperty(Element.prototype, "animate", { configurable: true, value: animate, writable: true });
  return animate;
}

/** Sets the answer of the reduced motion query. */
function stubReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", () => ({ addEventListener: vi.fn(), matches, removeEventListener: vi.fn() }));
}

describe("MARK_TAP_STEPS", () => {
  it("brings the word in after the mark is complete", () => {
    const markEnd = Math.max(
      ...MARK_TAP_STEPS.filter(({ part }) => ["bar", "diamond", "dot"].includes(part)).map(stepEnd)
    );
    expect(Math.min(...letters().map(({ at }) => at))).toBeGreaterThanOrEqual(markEnd);
  });

  it("has a step for each letter, and the diamond on the i moves with the i", () => {
    expect(letters()).toHaveLength(WORDMARK_LETTERS.length);
    const tittle = MARK_TAP_STEPS.find(({ part }) => part === "tittle");
    const letterI = MARK_TAP_STEPS.find(({ part }) => part === "letter-3");
    expect(tittle?.at).toBe(letterI?.at);
    expect(tittle?.ms).toBe(letterI?.ms);
  });

  it("brings the letters in from left to right, and takes them away from right to left", () => {
    const steps = letters();
    expect(steps.map(({ at }) => at)).toEqual(steps.map(({ at }) => at).sort((a, b) => a - b));
    expect(steps.map(stepEnd)).toEqual(steps.map(stepEnd).sort((a, b) => b - a));
  });

  it("leaves each letter hidden at the end, so only the glyph stays", () => {
    for (const step of letters()) {
      expect(step.keyframes[0]?.opacity).toBe(0);
      expect(step.keyframes[step.keyframes.length - 1]?.opacity).toBe(0);
    }
  });
});

describe("BrandTapMark", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows the glyph at rest and hides the word from a screen reader", () => {
    const wrapper = mount(BrandTapMark);

    expect(wrapper.get("button").attributes("aria-label")).toBe("Splitz");
    expect(wrapper.find('[data-part="rest"]').exists()).toBe(true);
    expect(wrapper.get('[data-part="letter-0"]').attributes("opacity")).toBe("0");
    expect(wrapper.get('[data-part="tittle"]').attributes("opacity")).toBe("0");
  });

  it("plays the word with the mark on a tap, and a second tap does nothing during the motion", async () => {
    stubReducedMotion(false);
    const animate = stubAnimate();
    const wrapper = mount(BrandTapMark);

    await wrapper.get("button").trigger("click");
    const calls = animate.mock.calls.length;
    expect(calls).toBeGreaterThan(WORDMARK_LETTERS.length);

    await wrapper.get("button").trigger("click");
    expect(animate.mock.calls.length).toBe(calls);
  });

  it("does nothing under reduced motion", async () => {
    stubReducedMotion(true);
    const animate = stubAnimate();
    const wrapper = mount(BrandTapMark);

    await wrapper.get("button").trigger("click");

    expect(animate).not.toHaveBeenCalled();
  });
});
