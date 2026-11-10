/**
 * The usage rules of SelectableRow. This file is the one place for these rules.
 * The design-system Selectable row page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: when to use the row, the accessibility notes.",
    "When a rule does not decide a devtools case, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use the row. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "The user selects more than one item from a list, and a later button uses the selection. SelectPeoplePage and InviteFriendsSheet use it.",
    title: "A list with several picks",
  },
];

/** The cases with another component. */
export const NOT_A_SELECTABLE_ROW: UseInsteadRule[] = [
  {
    use: "A button with `LIST_ROW_CLASS` from `list-row.ts`",
    when: "A tap on the row opens a page or the next step, for example a group row on SelectPeoplePage. Such a row has no selected state.",
  },
  { use: "SSegmentControl", when: "The user chooses one item from a short list." },
  { use: "SSwitch", when: "The row holds a setting that is on or off." },
];

/** How the row looks and how to place it. The user picked this look in the prototype `2026-11-05-selected-row`. */
export const LAYOUT_RULES: UsageRule[] = [
  {
    rule: "The row uses `LIST_ROW_CLASS`, so its hover fill, its press and its focus ring are the same as on the other list rows. The rules for the free space on each side are in `list-row.usage.ts`. A Sheet already has this space. The text of the content uses `LIST_ROW_TEXT`.",
    title: "The shared row",
  },
  {
    rule: "A selected row has the `base-bg-brand-subtle` fill, the same fill as a selected tag. Hover and press use `comp-row-selected-bg-hover` and `comp-row-selected-bg-pressed`. The row has no border, and the content does not move.",
    title: "Selected fill",
  },
  {
    rule: "Give the main text of the content `text-base-text-primary`. A selected row changes this color to `base-text-brand`, so the content does not need a prop. Other text keeps its own color, for example a second line or the green and red amounts of a transaction.",
    title: "Main text",
  },
  {
    rule: "The row draws the check mark at the end: a filled `PhCheckCircle` in `base-fg-brand` when the row is selected, and a `PhCircle` in `base-text-quaternary` when it is not. Do not add another mark, and do not use the green mark, because green shows money that the user gets.",
    title: "Check mark",
  },
  {
    rule: "Put the rows in a flex column with `gap-1`, so two selected rows next to each other do not join into one area. Do not put the rows in a card with a fill or with dividers.",
    title: "List",
  },
  {
    rule: "Set `disabled` when the item cannot be selected, and show the reason in the row, for example “Invited”. The row then fades and does not react to a tap.",
    title: "Disabled",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The row is a native button with `aria-pressed`, so a screen reader reads the state. The check mark has `aria-hidden`.",
    title: "Selected state",
  },
  {
    text: "The text of the row is the name of the button. Do not add an `aria-label`.",
    title: "Name",
  },
  {
    text: "A selected row does not show its state with color only: the check mark also changes. The brand text has about 5.4:1 on the selected fill in light mode and 6.7:1 in dark mode.",
    title: "Color",
  },
  {
    text: "The ring stays inside the row, because the row can touch the edge of a scroll area. A ring shows only when the user moves focus with an external keyboard.",
    title: "Focus ring",
  },
  {
    text: "The fill and the mark fade with the motion tokens, so they change at once when the system asks for reduced motion.",
    title: "Reduced motion",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS: string[] = [];
