import { describe, expect, it } from "vitest";

import { calculateRevealScrollLeft, type SegmentBox } from "../segment-scroll";

/** Six segments of 80px, with a gap of 4px and 4px of padding. The content is 504px wide. */
const BOXES: SegmentBox[] = [0, 1, 2, 3, 4, 5].map((index) => ({ left: 4 + index * 84, width: 80 }));
const CONTENT = 504;
const VIEWPORT = 300;

describe("calculateRevealScrollLeft", () => {
  it("does not scroll when the segment and its neighbors are visible", () => {
    expect(calculateRevealScrollLeft(BOXES, 1, 0, VIEWPORT, CONTENT)).toBe(0);
  });

  it("scrolls to show the next segment", () => {
    // Segment 3 ends at 336. With the 8px inset, the track must show up to 344.
    expect(calculateRevealScrollLeft(BOXES, 2, 0, VIEWPORT, CONTENT)).toBe(44);
  });

  it("scrolls to show the previous segment", () => {
    // Segment 2 starts at 172. With the 8px inset, the track must start at 164.
    expect(calculateRevealScrollLeft(BOXES, 3, 200, VIEWPORT, CONTENT)).toBe(164);
  });

  it("centers the segment when it and its neighbors do not fit", () => {
    expect(calculateRevealScrollLeft(BOXES, 2, 0, 200, CONTENT)).toBe(112);
  });

  it("stays inside the scroll range at both ends", () => {
    expect(calculateRevealScrollLeft(BOXES, 0, 100, VIEWPORT, CONTENT)).toBe(0);
    expect(calculateRevealScrollLeft(BOXES, 5, 0, VIEWPORT, CONTENT)).toBe(CONTENT - VIEWPORT);
  });

  it("returns the current position for an index outside the list", () => {
    expect(calculateRevealScrollLeft(BOXES, 9, 37, VIEWPORT, CONTENT)).toBe(37);
  });

  it("returns 0 when the content fits", () => {
    expect(calculateRevealScrollLeft(BOXES.slice(0, 2), 1, 0, VIEWPORT, 172)).toBe(0);
  });
});
