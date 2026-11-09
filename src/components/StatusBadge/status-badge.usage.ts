/**
 * The usage rules of StatusBadge. This file is the one place for these rules.
 * The design-system StatusBadge page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";
import type { StatusBadgeProps } from "./StatusBadge.vue";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: the tones and accessibility.",
    "When a rule does not decide a devtools badge, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use a badge. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "The full screen shows one result, and a heading gives the result in text. The caller is the card of JoinGroupPage. AuthShell uses the smaller `AuthStatusIcon`. A badge never shows a spinner: while a page waits, it shows no badge.",
    title: "A result screen",
  },
];

/** The cases with another component. */
export const NOT_A_BADGE: UseInsteadRule[] = [
  { use: "Notice", when: "The message is one part of a page with other content." },
  { use: "InvoiceStatusPill", when: "The status belongs to one invoice in a list or a detail page." },
  { use: "toast", when: "The result does not change the screen." },
];

/** What each tone means in the current uses. */
export interface ToneRule {
  meaning: string;
  /** The callers that use the tone today. */
  example: string;
}

/** A Record makes the type check fail when a new tone has no rule. */
export const TONE_GUIDE: Record<StatusBadgeProps["tone"], ToneRule> = {
  error: {
    example: "JoinGroupPage, a link that does not work",
    meaning: "The action failed, or the link does not work.",
  },
  success: { example: "No caller now", meaning: "The action is complete, or the app sent the email." },
  warning: { example: "No caller now", meaning: "The user must wait, and can try again later." },
};

/** How to place a badge. */
export const LAYOUT_RULES: UsageRule[] = [
  {
    rule: "The rings are inside the box, so the badge takes its full size in the layout and pushes the title down. The rings fade toward the bottom, so the space above the title stays quiet. Do not add space for the rings, and do not let the title go over them.",
    title: "Room for the rings",
  },
  {
    rule: "Center the badge above the title, in a column with `items-center`, as the card of JoinGroupPage does.",
    title: "Center",
  },
  { rule: "Do not add a size class. The badge has one size.", title: "One size" },
  {
    rule: "Put one Phosphor icon in the slot, without a size class and with the default (regular) weight. The badge sets the size and the color.",
    title: "Icon",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The icon and the rings have `aria-hidden`. A screen reader does not read the badge, so the heading of the screen must give the result.",
    title: "Decorative",
  },
  {
    text: "The rings are inside the box. At 375px the badge is narrower than the content, so the page has no sideways scroll.",
    title: "Phone width",
  },
  {
    text: "The icon uses the 600 step of its tone, so the color stays bright. The core is the 500 step at a low opacity, so the surface under the badge shows through it. Each icon has a contrast above 3:1 on its core in both themes. The design-system page measures each icon against the core blended over the page.",
    title: "Contrast",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS: string[] = [];
