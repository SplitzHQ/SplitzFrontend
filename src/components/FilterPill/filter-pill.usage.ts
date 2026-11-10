/**
 * The usage rules of FilterPill. This file is the one place for these rules.
 * The design-system FilterPill page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";

/** The `size` values of FilterPill. */
type FilterPillSize = "sm" | "md";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "A demo on a design-system page or a prototype can use the pill with sample data.",
    "When a rule does not decide a devtools pill, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use the pill. Each rule describes the current pills of the app. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "A row of pills above a list shows the conditions that are on. Each pill names one kind of condition, shows its value, ends with a caret and opens a sheet for that kind only. HomePage shows the row only while a filter is on. The prototype `2026-11-05-home-filter` (SPZ-84) decided this.",
    title: "Conditions above a list",
  },
  {
    rule: "In a filter sheet, the sorts are a radio group of `md` pills with no caret. A choice changes the list at once.",
    title: "Choices in a sheet",
  },
  {
    rule: "A pill has no ×. Clear is a button in the title row of the sheet, or in the empty state of the list.",
    title: "No remove icon",
  },
];

/** The cases with another component. */
export const NOT_A_PILL: UseInsteadRule[] = [
  { use: "SSegmentControl", when: "Two to four views of the same content, with one always selected and no sheet." },
  { use: "SButton", when: "The control runs an action and does not show a value." },
];

/** When to use each size. */
export const SIZE_GUIDE: Record<FilterPillSize, UsageRule> = {
  md: {
    rule: "A choice in a sheet. The pills wrap to the next row with a gap.",
    title: "md",
  },
  sm: {
    rule: "A pill in a row on a page. Set `caret`, because a tap opens a sheet.",
    title: "sm",
  },
};

/** How the two states look. */
export const STATE_RULES: UsageRule[] = [
  {
    rule: "Not selected: a thin `base-border-secondary` line, no fill and `base-text-secondary` text.",
    title: "Not selected",
  },
  {
    rule: "Selected: the `core-alpha-brand-20` fill of a secondary button and `base-text-primary` text. The search filter button on HomePage takes the same fill while a filter is on. See `ICON_RULES` in `button.usage.ts`.",
    title: "Selected",
  },
  {
    rule: "On a page, `selected` means that the value is not the default. A sort is a preference of the device, so the sort pill on HomePage is never selected.",
    title: "Selected on a page",
  },
  {
    rule: "A control that is not a pill but must show the same state uses `FILTER_PILL_STATE_CLASS` from `filter-pill.ts`. The status tiles of the HomePage filter sheet are that case. Do not copy the classes.",
    title: "Same look on a tile",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "Each size has a tap area 44px high. The `sm` pill is shorter, so an invisible area above and below it takes the tap.",
    title: "Tap area",
  },
  {
    text: 'A pill that opens a sheet sets `aria-haspopup="dialog"`. Its text is the current value, so a screen reader reads the value.',
    title: "Pill on a page",
  },
  {
    text: 'In a sheet, put the pills in an element with `role="radiogroup"` and a label, and give each pill `role="radio"` and `aria-checked`. The fill shows the choice, and a screen reader reads the checked state.',
    title: "Pill in a sheet",
  },
  {
    text: "The press scale and the color change use the motion tokens, so they happen at once when the system asks for reduced motion.",
    title: "Reduced motion",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS: string[] = [
  "Must a pill in a sheet support the arrow keys of a radio group? The pills are buttons now, so Tab moves through each one.",
];
