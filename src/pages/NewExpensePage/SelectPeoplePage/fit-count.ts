/**
 * Returns how many tags the closed row on SelectPeoplePage can show. The row always keeps `inputWidth` for the search field.
 * When some tags stay out, the row also keeps the space of the `+N` button. All lengths are in px.
 */
export function fitCount({
  available,
  chipWidth,
  gap,
  inputWidth,
  tagWidths,
}: {
  /** The width of the row after the label. */
  available: number;
  chipWidth: number;
  /** The space after each item in the row. */
  gap: number;
  inputWidth: number;
  tagWidths: readonly number[];
}): number {
  const widthOf = (count: number): number => tagWidths.slice(0, count).reduce((total, width) => total + width + gap, 0);

  if (widthOf(tagWidths.length) + inputWidth <= available) return tagWidths.length;
  for (let count = tagWidths.length - 1; count > 0; count--) {
    if (widthOf(count) + chipWidth + gap + inputWidth <= available) return count;
  }
  return 0;
}
