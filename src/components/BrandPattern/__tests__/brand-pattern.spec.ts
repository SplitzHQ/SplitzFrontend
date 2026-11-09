import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import { patternShapes, SIGN_IN_PATTERN } from "../brand-pattern";
import BrandPattern from "../BrandPattern.vue";

/** Returns the distance of a shape from the center of a 200 by 200 field. */
function distance(shape: { cx: number; cy: number }): number {
  return Math.hypot(shape.cx - 100, shape.cy - 100);
}

describe("patternShapes", () => {
  const { kind, settings } = SIGN_IN_PATTERN;

  it("puts dots and diamonds in a checker", () => {
    const shapes = patternShapes(kind, settings, 200, 200);
    const dots = shapes.filter((shape) => shape.role === "dot");
    const diamonds = shapes.filter((shape) => shape.role === "diamond");

    expect(shapes.length).toBeGreaterThan(0);
    expect(Math.abs(dots.length - diamonds.length)).toBeLessThanOrEqual(1);
    // A dot has full round corners, and a diamond has none.
    expect(dots.every((shape) => shape.rx > 0)).toBe(true);
    expect(diamonds.every((shape) => shape.rx === 0)).toBe(true);
  });

  it("grows the shapes and moves the color toward the diamond away from the center of a radial field", () => {
    const shapes = patternShapes(kind, settings, 200, 200).filter((shape) => shape.role === "dot");
    const near = shapes.reduce((best, shape) => (distance(shape) < distance(best) ? shape : best));
    const far = shapes
      .filter((shape) => distance(shape) < 140)
      .reduce((best, shape) => (distance(shape) > distance(best) ? shape : best));

    expect(far.size).toBeGreaterThan(near.size);
    expect(far.mix).toBeGreaterThan(near.mix);
  });

  it("draws the same shapes for the same settings", () => {
    expect(patternShapes(kind, settings, 120, 80)).toEqual(patternShapes(kind, settings, 120, 80));
  });
});

describe("BrandPattern", () => {
  it("is decoration that a screen reader skips and a tap goes through", () => {
    const root = mount(BrandPattern, { props: { pattern: SIGN_IN_PATTERN } }).get("div");

    expect(root.attributes("aria-hidden")).toBe("true");
    expect(root.classes()).toContain("pointer-events-none");
  });
});
