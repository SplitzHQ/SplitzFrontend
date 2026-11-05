/**
 * The usage rules of TransactionItem and TransactionItemContent. This file is the one place for these rules.
 * The design-system Transaction item page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule } from "../usage-rules";

/** The two components of the folder. */
export type TransactionItemComponent = "TransactionItem" | "TransactionItemContent";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: which component to use, the accessibility notes.",
    "When a rule does not decide a devtools case, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** Which component to use. */
export const COMPONENT_RULES: Record<TransactionItemComponent, UsageRule> = {
  TransactionItem: {
    rule: "The row opens the detail page of the transaction. GroupDetailPage and InvoiceDetailPage use it.",
    title: "A row that opens the transaction",
  },
  TransactionItemContent: {
    rule: "The row does something else when the user presses it. SelectableTransactionItem on SettleUpPage puts it in a button that selects the transaction.",
    title: "A row with another action",
  },
};

/** How to use the content in your own row. */
export const LAYOUT_RULES: UsageRule[] = [
  {
    rule: "`TransactionItemContent` has several root elements and no flex row of its own. Put it in an element with `TRANSACTION_ROW_CLASS` from `transaction-row.ts`.",
    title: "The parent is the row",
  },
  {
    rule: "The default slot goes at the end of the row, after the balance. SelectableTransactionItem puts a 24px check mark there.",
    title: "Slot",
  },
  {
    rule: "`TRANSACTION_ROW_CLASS` has the focus ring but not its offset. Add `focus-visible:outline-offset-2` when the screen has side padding around the row. Add `focus-visible:-outline-offset-2` when the row touches the edge of a scroll area, because that area cuts an outer ring.",
    title: "Focus ring",
  },
  {
    rule: "`TRANSACTION_ROW_CLASS` has `-mx-2 px-2`. The pressed fill (`base-bg-secondary_hover`) extends 8px past the content on each side, and the content stays in its place. The parent must have 8px of free space on each side. Do not add `w-full`, because the row then does not extend on the right. Put the row in a flex column, which stretches it. A scroll area cuts the fill, so give the scroll area `-mx-2 px-2`.",
    title: "Pressed fill",
  },
  {
    rule: "Put a date label or a section title above a group of rows, with `flex flex-col gap-1`. TransactionList and InvoiceDetailPage do this.",
    title: "Groups",
  },
];

/** What the row shows. These rules describe the code. */
export const CONTENT_RULES: UsageRule[] = [
  {
    rule: "The name of the transaction. Without a name, the amount takes its place.",
    title: "First line",
  },
  {
    rule: "The payer and the full amount. `findTransactionPayer` reads the payer from the balances, because the backend does not send a payer. The line is empty when the balances do not show the payer.",
    title: "Second line",
  },
  {
    rule: "The label and the amount of the current user. The label gives the direction, so the amount has no sign. The block does not show when the user is not in the split or the balance is zero.",
    title: "Balance",
  },
  {
    rule: "An amount that the user gets uses `base-text-success`, and an amount that the user owes uses `base-text-error`. All text that shows money that the user gets uses `base-text-success`, for example on BalanceCard and HomePage. An icon keeps `util-color-success-600`.",
    title: "Amount color",
  },
  {
    rule: "The tile is 48px with a 12px radius (`rounded-xl`). A 48px Avatar has the same radius.",
    title: "Tile",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The text of the row is the name of the link, in reading order: “Dinner You paid $50.00 You are owed $25.00”. Do not add an `aria-label`, because a screen reader then loses this order and the voice-control name no longer matches the screen.",
    title: "Name",
  },
  {
    text: "The row is 64px high: a 48px tile and 8px of padding above and below. This is more than the 44px minimum.",
    title: "Tap area",
  },
  {
    text: "A ring shows when the user moves focus with an external keyboard. A tap does not show it.",
    title: "Focus ring",
  },
  {
    text: "The row has no hover color, so a tap on a phone cannot leave a stuck color. The press color uses the motion tokens and changes at once when the system asks for reduced motion.",
    title: "Press and reduced motion",
  },
  {
    text: "A row in a button must give its state to a screen reader. SelectableTransactionItem uses `aria-pressed`, and its check marks have `aria-hidden`.",
    title: "Selected state",
  },
  {
    text: "The category icon is hidden from a screen reader, so a screen reader does not read the category of the row. See the open questions.",
    title: "Category",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "The second line uses `base-text-quaternary`, which has 3.30:1 on the dark page. The decision on this token is open. Keep the row as it is until the user decides it.",
  "Must a screen reader read the category of the row? The row has no text for the category. Now only the icon shows it, and the icon is hidden.",
  "How does a row show a transaction with no known payer? Now the second line is empty. A transaction saved by the new-expense flow when the payer is not in the split has no balance for the payer.",
  "How does a row show two payers? The app cannot create such a transaction, but the backend accepts one. The row names the user with the larger balance and the full amount.",
  "Should the tile be one shared component? TransactionItemContent, TransactionDetailPage, AddExpenseDetailsSheet and SelectCategorySheet each build the tile with their own size and radius.",
];
