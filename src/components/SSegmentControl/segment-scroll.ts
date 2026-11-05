/** The place of one segment inside the scrolling content, in pixels. */
export interface SegmentBox {
  left: number;
  width: number;
}

/** The space between the revealed items and the edge of the track, in pixels. */
const FOLLOW_INSET = 8;

/**
 * Returns the scroll position that shows the selected segment and the segment on each side of it.
 *
 * The position changes as little as possible, and it does not change when these segments are already visible. When the
 * three segments do not fit, the selected segment goes to the middle. The result stays inside the scroll range.
 */
export function followLeft(
  boxes: readonly SegmentBox[],
  index: number,
  scrollLeft: number,
  viewport: number,
  contentWidth: number
): number {
  const box = boxes[index];
  if (!box) return scrollLeft;

  const before = boxes[index - 1];
  const after = boxes[index + 1];
  const start = (before ? before.left : 0) - FOLLOW_INSET;
  const end = (after ? after.left + after.width : contentWidth) + FOLLOW_INSET;

  let target = scrollLeft;
  if (end - start > viewport) target = box.left + box.width / 2 - viewport / 2;
  else if (end - scrollLeft > viewport) target = end - viewport;
  else if (start < scrollLeft) target = start;

  return Math.min(Math.max(target, 0), Math.max(contentWidth - viewport, 0));
}
