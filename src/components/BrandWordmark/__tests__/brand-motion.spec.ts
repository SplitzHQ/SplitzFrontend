import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BRAND_GLYPH } from "../brand-glyph";
import {
  DIAMOND_CENTER,
  DIAMOND_HALF_SIDE,
  OPENING_FADE_MS,
  OPENING_STAY_MS,
  OPENING_STEPS,
  TAP_STEPS,
  tapSteps,
  TITTLE_HALF_SIDE,
  TITTLE_TIMING,
} from "../brand-motion";
import { WORDMARK_TITTLE, WORDMARK_TITTLE_SHAPE } from "../brand-wordmark";
import BrandOpening from "../BrandOpening.vue";
import BrandTapLogo from "../BrandTapLogo.vue";

/** Returns the time when the last step ends. */
const end = (steps: { at: number; ms: number }[]) => Math.max(...steps.map(({ at, ms }) => at + ms));

describe("the steps", () => {
  it("keeps the times that the user picked", () => {
    expect(end(TAP_STEPS)).toBe(1780);
    expect(OPENING_STAY_MS + OPENING_FADE_MS).toBe(1335);
  });

  it("ends the motion of the opening before its fade", () => {
    expect(end(OPENING_STEPS)).toBeLessThanOrEqual(OPENING_STAY_MS);
  });

  it("brings the word back after the mark has left", () => {
    const mark = TAP_STEPS.find(({ part }) => part === "mark");
    const firstLetter = TAP_STEPS.find(({ part }) => part === "letter-0");
    const backOffset = firstLetter?.keyframes[3]?.offset ?? 0;

    expect(backOffset * (firstLetter?.ms ?? 0)).toBeGreaterThanOrEqual(mark?.ms ?? Infinity);
  });

  it("forms the diamond as the last letter settles, and shows the path again at the end", () => {
    const wordEnd = end(TAP_STEPS.filter(({ part }) => part.startsWith("letter-")));
    const path = TAP_STEPS.find(({ part }) => part === "tittle");
    const shape = TAP_STEPS.find(({ part, rx }) => part === "tittle-shape" && !rx);

    expect(shape?.at).toBe(wordEnd - TITTLE_TIMING.lead);
    expect(shape?.keyframes[(shape?.keyframes.length ?? 0) - 1]).toMatchObject({
      opacity: 1,
      transform: "scale(1) rotate(45deg)",
    });
    const pathFrames = path?.keyframes ?? [];
    expect(path?.ms).toBe(end(TAP_STEPS));
    expect(pathFrames[pathFrames.length - 1]?.opacity).toBe(1);
    expect(pathFrames[pathFrames.length - 2]?.opacity).toBe(0);
  });

  it("makes the corners of the shape square while it grows", () => {
    const corners = TAP_STEPS.find(({ part, rx }) => part === "tittle-shape" && rx);

    expect(corners?.rx).toEqual([TITTLE_HALF_SIDE, 0]);
    expect(corners?.ms).toBe(TITTLE_TIMING.grow);
  });

  it("follows other times for the diamond", () => {
    expect(end(tapSteps({ ...TITTLE_TIMING, turn: TITTLE_TIMING.turn + 100 }))).toBe(end(TAP_STEPS) + 100);
  });

  it("ends the corners of the diamond at zero", () => {
    expect(OPENING_STEPS.find(({ rx }) => rx)?.rx?.[1]).toBe(0);
  });
});

describe("the diamond on the word", () => {
  it("has the same place and width in the path and in the shape of the motion", () => {
    const { half, x, y } = WORDMARK_TITTLE_SHAPE;
    const [topX, topY, rightX, rightY] = (WORDMARK_TITTLE.match(/-?[\d.]+/g) ?? []).map(Number);

    expect(topX).toBeCloseTo(x);
    expect(topY).toBeCloseTo(y - half);
    expect(rightX).toBeCloseTo(x + half);
    expect(rightY).toBeCloseTo(y);
    expect(TITTLE_HALF_SIDE * Math.SQRT2).toBeCloseTo(half);
  });
});

describe("the diamond", () => {
  it("is the same shape as the diamond of the glyph when it turns 45 degrees", () => {
    const [, x, y] = /^M([\d.]+) ([\d.]+)L/.exec(BRAND_GLYPH.diamond) ?? [];

    // The top corner of the path: straight above the center, by half of the diagonal of the square.
    expect(Number(x)).toBeCloseTo(DIAMOND_CENTER);
    expect(DIAMOND_CENTER - Number(y)).toBeCloseTo(DIAMOND_HALF_SIDE * Math.SQRT2, 1);
  });
});

describe("claimOpening", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("returns true one time for each run of the app", async () => {
    vi.resetModules();
    const { claimOpening } = await import("../brand-motion");

    expect(claimOpening()).toBe(true);
    expect(claimOpening()).toBe(false);
  });
});

describe("BrandOpening", () => {
  afterEach(() => {
    vi.resetModules();
    document.body.innerHTML = "";
  });

  it("shows the page at once when the browser has no Web Animations", async () => {
    mount(BrandOpening);
    await vi.waitFor(() => {
      expect(document.querySelector('[data-test="brand-opening"]')).toBeNull();
    });
  });
});

describe("BrandTapLogo", () => {
  it("gives the logo one accessible name", () => {
    const svg = mount(BrandTapLogo).get("svg");

    expect(svg.attributes("role")).toBe("img");
    expect(svg.attributes("aria-label")).toBe("Splitz");
  });

  it("hides the mark at rest", () => {
    expect(mount(BrandTapLogo).get('[data-part="mark"]').attributes("opacity")).toBe("0");
  });

  it("hides the shape of the diamond at rest, and shows the diamond of the word", () => {
    const wrapper = mount(BrandTapLogo);

    expect(wrapper.get('[data-part="tittle-shape"]').attributes("opacity")).toBe("0");
    expect(wrapper.get('[data-part="tittle"]').attributes("opacity")).toBeUndefined();
  });

  it("does not play under reduced motion", async () => {
    document.documentElement.setAttribute("data-reduce-motion", "");
    const animate = vi.fn();
    const wrapper = mount(BrandTapLogo);
    (wrapper.element as HTMLElement).animate = animate;
    await wrapper.trigger("click");

    expect(animate).not.toHaveBeenCalled();
    document.documentElement.removeAttribute("data-reduce-motion");
  });
});
