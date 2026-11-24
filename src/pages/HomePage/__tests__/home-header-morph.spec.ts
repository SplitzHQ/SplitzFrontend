import { describe, expect, it } from "vitest";

import {
  COLLAPSED_BUTTON_SIZE_PX,
  computeHeaderMorphFrame,
  stepSpring,
  type HeaderMorphGeometry,
  type SpringState,
} from "../home-header-morph";

/** Sample geometry: 39.3px search field beneath a 130px top bar, collapsing into a button at `(258, 78)`. */
const SAMPLE_GEOMETRY: HeaderMorphGeometry = {
  fieldHeight: 39.3,
  fieldLeft: 16,
  fieldTop: 130,
  fieldWidth: 370,
  filterOffsetFromRight: 36,
  filterOffsetTop: 4,
  magnifierOffsetLeft: 10,
  magnifierOffsetTop: 10,
  placeholderOffsetLeft: 38,
  placeholderOffsetTop: 10,
  searchRowBottomOffset: 55.3,
  targetButtonLeft: 258,
  targetButtonTop: 78,
  topBarHeight: 130,
};

describe("computeHeaderMorphFrame", () => {
  it("matches the resting search field bounds at progress 0 so the overlay swaps in seamlessly", () => {
    const frame = computeHeaderMorphFrame(SAMPLE_GEOMETRY, 0, 0);

    expect(frame).toMatchObject({ contentOpacity: 1, height: 39.3, left: 16, right: 386, top: 130 });
    expect(frame.outlineOpacity).toBe(1);
  });

  it("lands on the collapsed search icon button at progress 1 with outline hidden and brand tint visible", () => {
    const frame = computeHeaderMorphFrame(SAMPLE_GEOMETRY, 1, 56);

    expect(frame).toMatchObject({
      brandIconOpacity: 1,
      contentOpacity: 0,
      height: COLLAPSED_BUTTON_SIZE_PX,
      left: 258,
      right: 298,
      top: 78,
    });
    expect(frame.outlineOpacity).toBe(0);
    expect(frame.barExtensionPx).toBe(0);
  });

  it("interpolates left, right, and top edges linearly across progress", () => {
    const start = computeHeaderMorphFrame(SAMPLE_GEOMETRY, 0, 0);
    const midpoint = computeHeaderMorphFrame(SAMPLE_GEOMETRY, 0.5, 28);
    const end = computeHeaderMorphFrame(SAMPLE_GEOMETRY, 1, 56);

    expect(midpoint.left).toBeCloseTo((start.left + end.left) / 2);
    expect(midpoint.right).toBeCloseTo((start.right + end.right) / 2);
    expect(midpoint.top).toBeCloseTo((start.top + end.top) / 2);
  });

  it("extends the backdrop down to the bottom of the resting search row as collapse begins", () => {
    expect(computeHeaderMorphFrame(SAMPLE_GEOMETRY, 0.001, 0).barExtensionPx).toBeCloseTo(55.3, 0);
  });

  it("clamps backdrop extension so a trailing spring never covers scrolled list content", () => {
    // Spring trails at 10% while the page has already scrolled 40px upward.
    const frame = computeHeaderMorphFrame(SAMPLE_GEOMETRY, 0.1, 40);

    expect(SAMPLE_GEOMETRY.topBarHeight + frame.barExtensionPx).toBeCloseTo(
      SAMPLE_GEOMETRY.fieldTop + SAMPLE_GEOMETRY.searchRowBottomOffset - 40
    );
  });
});

describe("stepSpring", () => {
  it("settles onto the target near settleSeconds without overshooting", () => {
    const state: SpringState = { value: 0, velocity: 0 };
    let peakValue = 0;
    let simulatedSeconds = 0;
    while (!stepSpring(state, 1, 1 / 60, 0.28) && simulatedSeconds < 2) {
      simulatedSeconds += 1 / 60;
      peakValue = Math.max(peakValue, state.value);
    }

    expect(state.value).toBe(1);
    expect(peakValue).toBeLessThanOrEqual(1);
    expect(simulatedSeconds).toBeGreaterThan(0.2);
    expect(simulatedSeconds).toBeLessThan(0.8);
  });

  it("snaps immediately to the target when settleSeconds is zero", () => {
    const state: SpringState = { value: 0, velocity: 0 };

    expect(stepSpring(state, 0.6, 0, 0)).toBe(true);
    expect(state.value).toBe(0.6);
  });
});
