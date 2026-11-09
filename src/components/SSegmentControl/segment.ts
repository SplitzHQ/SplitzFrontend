/** The sizes of SSegmentControl. The usage file has a rule for each size, and the design-system page reads this list. */
export const SEGMENT_SIZES = ["sm", "md"] as const;

/** One size of SSegmentControl. */
export type SegmentSize = (typeof SEGMENT_SIZES)[number];
