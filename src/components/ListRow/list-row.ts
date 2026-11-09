/**
 * The classes of a list row that reacts to a press: a link or a button. It holds `ListRowContent` or
 * `TransactionItemContent`.
 * The hover and pressed fill extends past the content on each side, and the content stays in its place. The parent
 * must have this space. See `list-row.usage.ts`.
 * A press makes the row a little smaller. The press goes in with `container` time and the `standard` curve, and the row comes
 * back with `sheet` time and curve, like the press of SSegmentControl. The fill keeps the short hover time. Under
 * reduced motion the row does not scale. The look comes from the prototype `2026-11-05-home-motion`.
 * The caller adds the offset of the focus ring, because the ring must fit in the scroll area of the screen.
 */
export const LIST_ROW_CLASS = [
  "-mx-2 flex items-center gap-3 rounded-2xl px-2 py-2 touch-manipulation",
  "[transition:background-color_var(--motion-duration-hover-in)_var(--motion-easing-standard),scale_var(--motion-duration-sheet)_var(--motion-easing-sheet)]",
  "active:[transition:background-color_var(--motion-duration-hover-in)_var(--motion-easing-standard),scale_var(--motion-duration-container)_var(--motion-easing-standard)]",
  "hover:bg-comp-row-bg-hover active:bg-comp-row-bg-pressed active:scale-98",
  "motion-reduce:active:scale-100 [:root[data-reduce-motion]_&]:active:scale-100",
  "focus-visible:outline-2 focus-visible:outline-base-border-brand-solid",
].join(" ");

/**
 * The text levels of every list row in the app. A row that does not use `ListRowContent`, for example a person row or
 * a notification row, takes its text classes from here. The levels come from the prototype
 * `2026-11-08-list-row-type` (SPZ-107). See `list-row.usage.ts`.
 */
export const LIST_ROW_TEXT = {
  /** The direction label next to an `AmountChip`, for example You owe. It has the size and the weight of the chip. */
  direction: "text-sm font-medium text-base-text-quaternary",
  /** The lines under the name: the payer, a hint, the body or the time of a notification. */
  subtitle: "text-sm text-base-text-quaternary",
  /** The name of the row. */
  title: "text-base font-semibold text-base-text-primary",
  /** The name of a row that is less important, for example a notification that the user read. */
  titleQuiet: "text-base font-medium text-base-text-secondary",
} as const;
