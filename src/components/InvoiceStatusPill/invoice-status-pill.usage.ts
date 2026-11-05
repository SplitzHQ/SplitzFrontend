/**
 * The usage rules of InvoiceStatusPill. This file is the one place for these rules.
 * The design-system Invoice status pill page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { InvoiceStatus } from "@/backend";

import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "A demo on a design-system page or a prototype can use the pill with sample data.",
    "When a rule does not decide a devtools pill, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use the pill. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "Show the status of one invoice. InvoiceItem shows it in the list of a group, and InvoiceDetailPage shows it in the header.",
    title: "The status of an invoice",
  },
  { rule: "Pass the status. The pill sets the color and the text. It has no other props.", title: "Only the status" },
];

/** The cases with another component. */
export const NOT_A_PILL: UseInsteadRule[] = [
  { use: "StatusBadge", when: "The status is the result of the full screen." },
  { use: "Notice", when: "The message is a sentence or has an action." },
];

/** What each status means. */
export interface StatusRule {
  /** The tokens of the pill. */
  tokens: string;
  meaning: string;
}

/** A Record makes the type check fail when a new status has no rule. */
export const STATUS_GUIDE: Record<InvoiceStatus, StatusRule> = {
  Open: {
    meaning: "Some members still owe money. The text is Open.",
    tokens: "util-color-yellow-50 fill, util-color-yellow-700 text",
  },
  Settled: {
    meaning: "All members paid. The text is Settled.",
    tokens: "util-color-success-50 fill, util-color-success-700 text",
  },
};

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The text gives the status, so the color does not carry the status alone. A screen reader reads the text as a part of the row link in InvoiceItem.",
    title: "Text and color",
  },
  {
    text: "The text has a contrast above 4.5:1 on its fill in both themes. The design-system page measures it from the rendered pill.",
    title: "Contrast",
  },
  {
    text: "The color change uses the motion tokens, so it happens at once when the system asks for reduced motion.",
    title: "Reduced motion",
  },
  {
    text: "The pill is not interactive, so it has no tap area. The row link around it has the tap area.",
    title: "Tap area",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "Does the app need one shared status pill? InvoiceDetailPage builds a Paid pill by hand with a check icon, `px-2.5` and `py-1`. A backlog card asks this question.",
  "Which color family does Open use? The pill uses `yellow`. Notice and StatusBadge use `warning` for a state that waits.",
  "Must the locale keys move? The pill is shared, and the keys are `group-detail-invoice-settled` and `group-detail-invoice-open`. They stay for now, because a rename gives no change to a user.",
];
