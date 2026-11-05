/**
 * The usage rules of AuthShell. This file is the one place for these rules.
 * The design-system Auth shell page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "When a rule does not decide a devtools page, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use AuthShell. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "Use it as the root of a page for a signed-out user: sign in, register, forgot password, reset password and confirm email.",
    title: "Account pages",
  },
];

/** The cases with another component. */
export const NOT_AN_AUTH_SHELL: UseInsteadRule[] = [
  { use: "Layout", when: "The page is for a signed-in user, for example two-factor setup." },
  { use: "BrandWordmark", when: "The page must show the logo. AuthShell already shows it." },
];

/** How to fill the parts. */
export const PART_RULES: UsageRule[] = [
  {
    rule: "Give `title` on each page. AuthShell renders it as the only h1. Do not add an h1 in a slot.",
    title: "Title",
  },
  { rule: "Give `subtitle` as one sentence. Do not put a form hint or an error in it.", title: "Subtitle" },
  {
    rule: "Set `centered` on a status page: a page that shows a result and has no form. All 4 pages that set it also fill the `hero` slot. A page with a form does not set it.",
    title: "Centered",
  },
  {
    rule: "Put one `StatusBadge` in a `flex justify-center` block. Only a centered page uses this slot.",
    title: "Hero",
  },
  { rule: "Put the form or the main action in the default slot.", title: "Default slot" },
  {
    rule: "Put only links to other account pages in this slot. One or two links fit one row on a 375px phone.",
    title: "Footer",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  { text: "The root is the `main` landmark of the page, and the title is the only h1.", title: "Landmark and heading" },
  {
    text: 'On a centered page, the block of the title and the subtitle has `aria-live="polite"`. A screen reader reads the new text when the state changes without a new page, for example on ConfirmEmailPage.',
    title: "Status changes",
  },
  {
    text: "An invisible box around each link in the footer makes the tap area 44px high. The link text stays 20px high, so the look does not change.",
    title: "Tap area",
  },
  {
    text: "The three parts rise one after the other. The motion tokens set the times, so the parts show at once under reduced motion.",
    title: "Reduced motion",
  },
  {
    text: "The backdrop is decorative and has `aria-hidden`. The root clips it, so it adds no sideways scroll at 375px.",
    title: "Backdrop",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "Does the card need a clearer edge in the dark theme at desktop width? The fill is `#0d0e12` at 60% on the `#111312` page, and the border is white at 5%. The text passes, and the app has no control that turns on the dark theme now.",
];
