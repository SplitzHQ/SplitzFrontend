/**
 * The usage rules of AuthShell, AuthStatusIcon and PasswordChecklist. This file is the one place for these rules.
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
  { use: "BrandTapMark", when: "The page must show the logo. AuthShell already shows it." },
  { use: "StatusBadge", when: "A signed-in page shows one result, for example JoinGroupPage." },
];

/** How to fill the parts. */
export const PART_RULES: UsageRule[] = [
  {
    rule: "Give `title` on each page. AuthShell renders it as the only h1. Do not add an h1 in a slot.",
    title: "Title",
  },
  { rule: "Give `subtitle` as one sentence. Do not put a form hint or an error in it.", title: "Subtitle" },
  {
    rule: "Set `highlight` to the email address that the subtitle names. The subtitle must hold the same text.",
    title: "Highlight",
  },
  {
    rule: "Set `status` on a page that shows a result and has no form. It hides the logo, because the icon takes its place.",
    title: "Status",
  },
  {
    rule: "Put one `AuthStatusIcon` in this slot. Only a status page uses this slot. Use the default (regular) weight of the Phosphor icon. While the page waits for a result, use the `pending` tone with a spinning `PhCircleNotch`: the page shows no circle until the result is known.",
    title: "Icon",
  },
  {
    rule: "Put the fields and their messages in the default slot, in this order: fields, rate limit, Notice. The text of a rate limit uses `px-3.25`.",
    title: "Default slot",
  },
  {
    rule: "Put the main button first, then the row of links that belong to the action. Each page with an action has one main button here. A status page also has one, unless it is waiting for a result.",
    title: "Actions",
  },
  {
    rule: "Handle `submit` on a page with a form. AuthShell then makes the default slot and the actions one form, so the Return key submits it. The main button has `type` submit.",
    title: "Submit",
  },
  {
    rule: "Put only links to other account pages in this slot. One or two links fit one row on a 375px phone. A lead text goes inside the link, so the whole row is the tap area.",
    title: "Footer",
  },
];

/** How the parts make groups and lines. The user picked these rules in the prototype `2026-11-04-sign-in-flow`. */
export const LAYOUT_RULES: UsageRule[] = [
  {
    rule: "All text and icons line up with the text in a field, inside the outer edge of the column. Only the fields, the Notice and the buttons have their outer edge on the column. A block of text outside AuthShell's own parts uses `px-3.25`.",
    title: "One content line",
  },
  {
    rule: "Distance makes the groups. The gap in a group is small. The gap between the title and the content is the largest, and the gap between the content and the actions is between the two. AuthShell sets these gaps. Do not add a gap that makes two groups look like one.",
    title: "Groups",
  },
  {
    rule: "The actions and the footer stay at the bottom of the screen, also on a status page, so the main button is always in one place. The button stays above the on-screen keyboard.",
    title: "Actions at the bottom",
  },
  {
    rule: "Fields have no icon. A placeholder is a sample of the value, and a password field has none.",
    title: "Fields",
  },
  {
    rule: "A new password has one field and a `PasswordChecklist` under it, in the same group. Link them with `described-by`. The show button lets a person check the value, so the page has no confirm field.",
    title: "New password",
  },
  {
    rule: "From the sm width the column has a fixed minimum height, in the center of the screen. The page has no card.",
    title: "Wide screen",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  { text: "The root is the `main` landmark of the page, and the title is the only h1.", title: "Landmark and heading" },
  {
    text: 'On a status page, the block of the icon, the title and the subtitle has `aria-live="polite"`. A screen reader reads the new text when the state changes without a new page, for example on ConfirmEmailPage.',
    title: "Status changes",
  },
  {
    text: "An invisible box around each link in the footer makes the tap area 44px high. The link text keeps its height, so the look does not change. The logo also has an invisible box of 44px.",
    title: "Tap area",
  },
  {
    text: "The three parts rise one after the other. The motion tokens set the times, so the parts show at once under reduced motion. A tap on the logo does nothing under reduced motion.",
    title: "Reduced motion",
  },
  {
    text: "Each rule of `PasswordChecklist` has hidden text that says if the password passes it, so the state does not depend on the icon or the color.",
    title: "Password rules",
  },
  {
    text: "`AuthStatusIcon` is decorative and has `aria-hidden`. The title must give the result.",
    title: "Status icon",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "Does the button stay above the keyboard on a real iPhone? `useKeyboardFreeHeight` reads the visual viewport, and nobody has tested it on a device.",
];
