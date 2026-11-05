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
    rule: "The full screen shows one result or one state, and a heading gives the result in text. The caller is the card of JoinGroupPage. AuthShell uses the smaller `AuthStatusIcon`.",
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
  brand: { example: "No caller now", meaning: "The result is not known yet." },
  error: {
    example: "JoinGroupPage, a link that does not work",
    meaning: "The action failed, or the link does not work.",
  },
  success: {
    example: "ConfirmEmailPage, RegisterPage and ForgotPasswordPage",
    meaning: "The action is complete, or the app sent the email.",
  },
  warning: { example: "ConfirmEmailPage, rate limit", meaning: "The user must wait, and can try again later." },
};

/** How to place a badge. */
export const LAYOUT_RULES: UsageRule[] = [
  {
    rule: "The box is 96px. The rings draw 24px outside the box and take no layout space. So the badge needs 144px of width and 24px of free space on each side.",
    title: "Room for the rings",
  },
  {
    rule: "Center the badge. In AuthShell, put it in `flex justify-center` in the `hero` slot, and set `centered` on the shell.",
    title: "Center",
  },
  { rule: "Do not add a size class. The badge has one size.", title: "One size" },
  {
    rule: "Put one Phosphor icon in the slot, without a size class. The badge sets 40px.",
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
    text: "The rings are `absolute` inside the box. At 375px the badge is narrower than the content, so the page has no sideways scroll.",
    title: "Phone width",
  },
  {
    text: "The icon has a contrast above 3:1 on its fill in both themes. The design-system page measures it from the rendered badge.",
    title: "Contrast",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "Which weight does the icon use? The check of ConfirmEmailPage uses `bold`. The other result icons use `duotone`. The loading icon uses the default.",
  "Which token does the inner ring use? The error tone uses the 100 token, and the success and warning tones use the 200 token.",
  "How much space goes under the badge? AuthShell has a 24px gap, so the outer ring touches the top of the title. The card of JoinGroupPage has a 20px gap, so the ring goes 4px into the title box. The title has `relative`, so it stays above the ring.",
];
