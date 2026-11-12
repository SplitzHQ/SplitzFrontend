/** Horizontal position and width of a segment inside the scrollable content, in pixels. */
export interface SegmentBox {
  left: number;
  width: number;
}

/** Minimum padding to keep between the revealed segments and the viewport edge, in pixels. */
const FOLLOW_INSET = 8;

/**
 * Calculates the horizontal scroll offset (`scrollLeft`) needed to keep the selected segment
 * and its immediate neighbors in view.
 *
 * Scrolls only when those segments are partially hidden. If all three are wider than the viewport,
 * centers the selected segment instead. The returned offset is clamped to the valid scroll range.
 */
export function calculateRevealScrollLeft(
  boxes: readonly SegmentBox[],
  index: number,
  scrollLeft: number,
  viewport: number,
  contentWidth: number
): number {
  const selectedBox = boxes[index];
  if (!selectedBox) return scrollLeft;

  const prevBox = boxes[index - 1];
  const nextBox = boxes[index + 1];
  const revealStart = (prevBox ? prevBox.left : 0) - FOLLOW_INSET;
  const revealEnd = (nextBox ? nextBox.left + nextBox.width : contentWidth) + FOLLOW_INSET;

  let targetScrollLeft = scrollLeft;
  if (revealEnd - revealStart > viewport) {
    targetScrollLeft = selectedBox.left + selectedBox.width / 2 - viewport / 2;
  } else if (revealEnd - scrollLeft > viewport) {
    targetScrollLeft = revealEnd - viewport;
  } else if (revealStart < scrollLeft) {
    targetScrollLeft = revealStart;
  }

  const maxScrollLeft = Math.max(contentWidth - viewport, 0);
  return Math.min(Math.max(targetScrollLeft, 0), maxScrollLeft);
}
