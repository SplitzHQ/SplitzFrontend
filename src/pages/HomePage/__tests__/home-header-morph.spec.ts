import { describe, expect, it } from "vitest";

import { MORPH_CIRCLE_PX, morphFrame, stepSpring, type MorphGeometry, type SpringState } from "../home-header-morph";

/** A field of 39.3px under a 130px top row, and an icon at 258, 78. The values come from the prototype. */
const GEOMETRY: MorphGeometry = {
  barBase: 130,
  fieldHeight: 39.3,
  fieldLeft: 16,
  fieldTop: 130,
  fieldWidth: 370,
  filterRight: 36,
  filterTop: 4,
  iconLeft: 258,
  iconTop: 78,
  magnifierLeft: 10,
  magnifierTop: 10,
  rowBottom: 55.3,
  textLeft: 38,
  textTop: 10,
};

describe("morphFrame", () => {
  it("starts at the real field, so the copy does not jump when it takes its place", () => {
    const frame = morphFrame(GEOMETRY, 0, 0);

    expect(frame).toMatchObject({ height: 39.3, left: 16, right: 386, text: 1, top: 130 });
    expect(frame.frame).toBe(1);
  });

  it("ends at the search icon, with no outline and the brand color", () => {
    const frame = morphFrame(GEOMETRY, 1, 56);

    expect(frame).toMatchObject({ height: MORPH_CIRCLE_PX, left: 258, right: 298, text: 0, tint: 1, top: 78 });
    expect(frame.frame).toBe(0);
    expect(frame.barExtend).toBe(0);
  });

  it("moves both ends on straight lines with the same progress", () => {
    const start = morphFrame(GEOMETRY, 0, 0);
    const middle = morphFrame(GEOMETRY, 0.5, 28);
    const end = morphFrame(GEOMETRY, 1, 56);

    expect(middle.left).toBeCloseTo((start.left + end.left) / 2);
    expect(middle.right).toBeCloseTo((start.right + end.right) / 2);
    expect(middle.top).toBeCloseTo((start.top + end.top) / 2);
  });

  it("starts the bar at the bottom of the real search row", () => {
    expect(morphFrame(GEOMETRY, 0.001, 0).barExtend).toBeCloseTo(55.3, 0);
  });

  it("does not let the bar cover content that a fast scroll has already moved up", () => {
    // The spring trails at 10%, but the page has scrolled 40px: the row bottom is now 40px higher.
    const frame = morphFrame(GEOMETRY, 0.1, 40);

    expect(GEOMETRY.barBase + frame.barExtend).toBeCloseTo(GEOMETRY.fieldTop + GEOMETRY.rowBottom - 40);
  });
});

describe("stepSpring", () => {
  it("reaches the target in about the settle time and does not overshoot", () => {
    const state: SpringState = { speed: 0, value: 0 };
    let highest = 0;
    let time = 0;
    while (!stepSpring(state, 1, 1 / 60, 0.28) && time < 2) {
      time += 1 / 60;
      highest = Math.max(highest, state.value);
    }

    expect(state.value).toBe(1);
    expect(highest).toBeLessThanOrEqual(1);
    expect(time).toBeGreaterThan(0.2);
    expect(time).toBeLessThan(0.8);
  });

  it("jumps to the target with no settle time", () => {
    const state: SpringState = { speed: 0, value: 0 };

    expect(stepSpring(state, 0.6, 0, 0)).toBe(true);
    expect(state.value).toBe(0.6);
  });
});
