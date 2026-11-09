/**
 * The usage rules of ListRowContent, AmountChip, `LIST_ROW_CLASS` and `LIST_ROW_TEXT`. This file is the one place for
 * these rules. Agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule } from "../usage-rules";
import type { LIST_ROW_TEXT } from "./list-row";

/** The parts of the folder. */
export type ListRowPart = "ListRowContent" | "AmountChip" | "LIST_ROW_CLASS" | "LIST_ROW_TEXT";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: the text levels, the amount chip and the accessibility notes.",
    "When a rule does not decide a devtools case, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** Which part to use. */
export const COMPONENT_RULES: Record<ListRowPart, UsageRule> = {
  AmountChip: {
    rule: "Every amount that a list row or the balance card shows for one direction: money that the user gets or owes. Do not use it for a total with no direction, for example the full amount of a transaction.",
    title: "An amount with a direction",
  },
  LIST_ROW_CLASS: {
    rule: "The link or the button of a list row that reacts to a press. It gives the hover and pressed fill, the press motion and the focus ring.",
    title: "A row that the user presses",
  },
  LIST_ROW_TEXT: {
    rule: "The text classes of a row that does not use ListRowContent: a person row, a split row, a notification row, a balance card line. Do not write the size, the weight or the color of row text by hand.",
    title: "Text in other rows",
  },
  ListRowContent: {
    rule: "A row that opens a page or selects an item, with a tile or an avatar, a name and lines under the name. TransactionItemContent and the group rows and the Create group row of HomePage use it.",
    title: "A row that opens a page",
  },
};

/**
 * The text levels. A Record makes the type check fail when `LIST_ROW_TEXT` gets a level with no rule.
 * The user picked the levels in the prototype `2026-11-08-list-row-type` (SPZ-107): two sizes, with one larger size for
 * the name.
 */
export const TEXT_LEVELS: Record<keyof typeof LIST_ROW_TEXT, UsageRule> = {
  direction: {
    rule: "The direction next to an AmountChip, for example You owe or Alice owes you. It has the size and the weight of the chip, because text side by side uses one size (SPZ-106).",
    title: "Direction",
  },
  subtitle: {
    rule: "Each line under the name: the payer, the members of a group, a hint such as Invited, the body and the time of a notification, a settled state.",
    title: "Lines under the name",
  },
  title: {
    rule: "The name of the row. All list rows use this level, also person rows and notification rows.",
    title: "Name",
  },
  titleQuiet: {
    rule: "The name of a row that is less important than the rows around it. NotificationItem uses it for a notification that the user read.",
    title: "Quiet name",
  },
};

/** The size of the tile or the avatar at the start of a row. */
export const LEADING_RULES: UsageRule[] = [
  {
    rule: "A row that opens a page has a large start: the transaction tile, the invoice tile, the group avatar (`sm`) and the Create group tile.",
    title: "Rows that open a page",
  },
  {
    rule: "A person row, a split row and a notification row have a small start: the `xs` avatar or a tile of the same size. The people picker, the invite sheet, the Paid by sheet, the split rows of TransactionDetailPage and NotificationItem do this.",
    title: "Person and notification rows",
  },
];

/** Where the direction and the amount go. */
export const AMOUNT_RULES: UsageRule[] = [
  {
    rule: "A group row puts the direction and the chips in a line under the name. The chips of one direction wrap after the label.",
    title: "Under the name",
  },
  {
    rule: "A member line of BalanceCard has the `xxs` avatar, the direction and the chip, in one line. The name in the direction has `base-text-primary`, and the chip is at the end of the line, so the amounts of all members line up. A long direction is cut before the chip. The prototype `2026-11-05-group-detail-layout` (SPZ-81) decided this line.",
    title: "Balance card line",
  },
  {
    rule: "A transaction row and a split row put the direction above the chip, at the end of the row.",
    title: "At the end of the row",
  },
  {
    rule: "The chip shows the absolute value. The direction label gives the direction, so the amount has no sign.",
    title: "No sign",
  },
  {
    rule: "Give the chip the amount and the currency. On HomePage, give it HomeAmount in the default slot, so the digits roll.",
    title: "Content",
  },
];

/** How to put a row together. */
export const LAYOUT_RULES: UsageRule[] = [
  {
    rule: "ListRowContent and TransactionItemContent have several root elements and no flex row of their own. Put them in a link or a button with `LIST_ROW_CLASS`.",
    title: "The parent is the row",
  },
  {
    rule: "`LIST_ROW_CLASS` has the focus ring but not its offset. Add `focus-visible:outline-offset-2` when the screen has side padding around the row. Add `focus-visible:-outline-offset-2` when the row touches the edge of a scroll area, because that area cuts an outer ring.",
    title: "Focus ring",
  },
  {
    rule: "`LIST_ROW_CLASS` has `-mx-2 px-2`. The hover and pressed fill (`comp-row-bg-hover` and `comp-row-bg-pressed`) extends past the content on each side, and the content stays in its place. A press also makes the row a little smaller with the timing of the SSegmentControl press, except under reduced motion. The user picked this look in the prototype `2026-11-05-home-motion`. The parent must have free space on each side. Do not add `w-full`, because the row then does not extend on the right. Put the row in a flex column or a block element, which stretches it. A scroll area cuts the fill, so give the scroll area `-mx-2 px-2`.",
    title: "Hover and pressed fill",
  },
  {
    rule: "Put a date label or a section title above a group of rows, with `flex flex-col gap-1`. TransactionList and InvoiceDetailPage do this.",
    title: "Groups",
  },
];

/** Accessibility rules that the parts follow, written for the people who use them. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The color and the fill of a chip are not the only signal. The direction label next to it says who owes the money, so a person who does not see the color gets the same information.",
    title: "Direction",
  },
  {
    text: "The text of the row is the name of the link, in reading order. Do not add an `aria-label`, because a screen reader then loses this order and the voice-control name no longer matches the screen.",
    title: "Name",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS: string[] = [];
