import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BRAND_GLYPH, BRAND_GLYPH_DIAMOND_SQUARE } from "../brand-glyph";
import {
  buildWordmarkTapSteps,
  OPENING_FADE_MS,
  OPENING_GLYPH_STEPS,
  OPENING_OPAQUE_MS,
  TITTLE_SQUARE_HALF_SIDE,
  TITTLE_TIMING,
  WORDMARK_TAP_STEPS,
} from "../brand-motion";
import { WORDMARK_TITTLE, WORDMARK_TITTLE_GEOMETRY } from "../brand-wordmark";
import BrandOpeningOverlay from "../BrandOpeningOverlay.vue";
import BrandTapWordmark from "../BrandTapWordmark.vue";

/** Returns the completion timestamp (in ms) of the latest step in `steps`. */
const getSequenceEndMs = (steps: { durationMs: number; startMs: number }[]) =>
  Math.max(...steps.map(({ durationMs, startMs }) => startMs + durationMs));

describe("brand motion timelines", () => {
  it("preserves total sequence durations for wordmark tap and cold-start opening", () => {
    expect(getSequenceEndMs(WORDMARK_TAP_STEPS)).toBe(1780);
    expect(OPENING_OPAQUE_MS + OPENING_FADE_MS).toBe(1335);
  });

  it("finishes glyph assembly on the opening overlay before fade-out begins", () => {
    expect(getSequenceEndMs(OPENING_GLYPH_STEPS)).toBeLessThanOrEqual(OPENING_OPAQUE_MS);
  });

  it("starts returning the wordmark letters only after the glyph finishes exiting", () => {
    const glyphStep = WORDMARK_TAP_STEPS.find(({ part }) => part === "glyph");
    const firstLetterStep = WORDMARK_TAP_STEPS.find(({ part }) => part === "letter-0");
    const returnOffset = firstLetterStep?.keyframes[3]?.offset ?? 0;

    expect(returnOffset * (firstLetterStep?.durationMs ?? 0)).toBeGreaterThanOrEqual(glyphStep?.durationMs ?? Infinity);
  });

  it("morphs `tittle-morph` as the last letter settles and restores the static `tittle` path on the final frame", () => {
    const wordReturnEndMs = getSequenceEndMs(WORDMARK_TAP_STEPS.filter(({ part }) => part.startsWith("letter-")));
    const tittlePathStep = WORDMARK_TAP_STEPS.find(({ part }) => part === "tittle");
    const tittleMorphStep = WORDMARK_TAP_STEPS.find(
      ({ cornerRadius, part }) => part === "tittle-morph" && !cornerRadius
    );

    expect(tittleMorphStep?.startMs).toBe(wordReturnEndMs - TITTLE_TIMING.leadMs);
    expect(tittleMorphStep?.keyframes[(tittleMorphStep?.keyframes.length ?? 0) - 1]).toMatchObject({
      opacity: 1,
      transform: "scale(1) rotate(45deg)",
    });
    const pathFrames = tittlePathStep?.keyframes ?? [];
    expect(tittlePathStep?.durationMs).toBe(getSequenceEndMs(WORDMARK_TAP_STEPS));
    expect(pathFrames[pathFrames.length - 1]?.opacity).toBe(1);
    expect(pathFrames[pathFrames.length - 2]?.opacity).toBe(0);
  });

  it("animates `tittle-morph` corner radius from a circle (`rx = halfSide`) to a sharp square (`rx = 0`)", () => {
    const cornerRadiusStep = WORDMARK_TAP_STEPS.find(
      ({ cornerRadius, part }) => part === "tittle-morph" && Boolean(cornerRadius)
    );

    expect(cornerRadiusStep?.cornerRadius).toEqual([TITTLE_SQUARE_HALF_SIDE, 0]);
    expect(cornerRadiusStep?.durationMs).toBe(TITTLE_TIMING.expandToSquareMs);
  });

  it("accepts custom `TittleTiming` overrides in `buildWordmarkTapSteps`", () => {
    const extendedSteps = buildWordmarkTapSteps({
      ...TITTLE_TIMING,
      rotateToDiamondMs: TITTLE_TIMING.rotateToDiamondMs + 100,
    });
    expect(getSequenceEndMs(extendedSteps)).toBe(getSequenceEndMs(WORDMARK_TAP_STEPS) + 100);
  });

  it("sharpens the opening glyph's diamond corner radius down to zero", () => {
    expect(OPENING_GLYPH_STEPS.find(({ cornerRadius }) => cornerRadius)?.cornerRadius?.[1]).toBe(0);
  });
});

describe("wordmark diamond tittle geometry", () => {
  it("matches `WORDMARK_TITTLE` path vertices to `WORDMARK_TITTLE_GEOMETRY` and `TITTLE_SQUARE_HALF_SIDE`", () => {
    const { centerX, centerY, halfDiagonal } = WORDMARK_TITTLE_GEOMETRY;
    const [topX, topY, rightX, rightY] = (WORDMARK_TITTLE.match(/-?[\d.]+/g) ?? []).map(Number);

    expect(topX).toBeCloseTo(centerX);
    expect(topY).toBeCloseTo(centerY - halfDiagonal);
    expect(rightX).toBeCloseTo(centerX + halfDiagonal);
    expect(rightY).toBeCloseTo(centerY);
    expect(TITTLE_SQUARE_HALF_SIDE * Math.SQRT2).toBeCloseTo(halfDiagonal);
  });
});

describe("glyph diamond square geometry", () => {
  it("matches `BRAND_GLYPH.diamond` vertices when `BRAND_GLYPH_DIAMOND_SQUARE` rotates 45 degrees", () => {
    const [, topVertexX, topVertexY] = /^M([\d.]+) ([\d.]+)L/.exec(BRAND_GLYPH.diamond) ?? [];
    const { center, halfSide } = BRAND_GLYPH_DIAMOND_SQUARE;

    // Rotating the square 45° places its top vertex directly above `(center, center)` by `halfSide * √2`.
    expect(Number(topVertexX)).toBeCloseTo(center);
    expect(center - Number(topVertexY)).toBeCloseTo(halfSide * Math.SQRT2, 1);
  });
});

describe("claimOpeningPlay", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("returns true only on the first call per JavaScript runtime", async () => {
    vi.resetModules();
    const { claimOpeningPlay } = await import("../brand-motion");

    expect(claimOpeningPlay()).toBe(true);
    expect(claimOpeningPlay()).toBe(false);
  });
});

describe("BrandOpeningOverlay", () => {
  afterEach(() => {
    vi.resetModules();
    document.body.innerHTML = "";
  });

  it("dismisses immediately when the environment lacks Web Animations API support", async () => {
    mount(BrandOpeningOverlay);
    await vi.waitFor(() => {
      expect(document.querySelector('[data-test="brand-opening"]')).toBeNull();
    });
  });
});

describe("BrandTapWordmark", () => {
  it("exposes a single accessible image name", () => {
    const svg = mount(BrandTapWordmark).get("svg");

    expect(svg.attributes("role")).toBe("img");
    expect(svg.attributes("aria-label")).toBe("Splitz");
  });

  it("keeps the glyph hidden at rest", () => {
    expect(mount(BrandTapWordmark).get('[data-part="glyph"]').attributes("opacity")).toBe("0");
  });

  it("hides `tittle-morph` at rest while showing the static `tittle` path", () => {
    const wrapper = mount(BrandTapWordmark);

    expect(wrapper.get('[data-part="tittle-morph"]').attributes("opacity")).toBe("0");
    expect(wrapper.get('[data-part="tittle"]').attributes("opacity")).toBeUndefined();
  });

  it("does not animate when reduced motion is enabled", async () => {
    document.documentElement.setAttribute("data-reduce-motion", "");
    const animate = vi.fn();
    const wrapper = mount(BrandTapWordmark);
    (wrapper.element as HTMLElement).animate = animate;
    await wrapper.trigger("click");

    expect(animate).not.toHaveBeenCalled();
    document.documentElement.removeAttribute("data-reduce-motion");
  });
});
