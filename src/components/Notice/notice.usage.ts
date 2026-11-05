/**
 * The usage rules of Notice. This file is the one place for these rules.
 * The design-system Notice page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";
import type { NoticeProps } from "./Notice.vue";

/** The tones of a notice. */
export type NoticeTone = NonNullable<NoticeProps["tone"]>;

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: when not to use a notice, the tones and accessibility.",
    "When a rule does not decide a devtools notice, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use a notice. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "A submit fails and the form or the sheet stays open. Put the notice next to the submit button. Remove it when the user submits again. A problem with one field goes in the `error` of that TextInput.",
    title: "A failed submit",
  },
  {
    rule: "A request that loads the page fails and the page has no data to show. Put the notice in the place of the data, with a retry button. During the retry, the notice stays and the button shows `loading`, so the focus stays on the button. HomePage and GroupDetailPage do this. A failed refresh with old data keeps the old data and shows no notice.",
    title: "A failed load",
  },
  {
    rule: "The message is part of the page. It stays in the page flow until the state of the page changes.",
    title: "A message that stays",
  },
  {
    rule: "The user must read the message to continue, or must use an action in it.",
    title: "A message that needs an action",
  },
];

/** The cases with another component. */
export const NOT_A_NOTICE: UseInsteadRule[] = [
  { use: "toast", when: "The message goes away by itself. See `sonner.usage.ts`." },
  { use: "RateLimitCountdown", when: "The message gives the time that is left in a cooldown." },
  { use: "StatusBadge with the AuthShell title", when: "The message is the result of the full screen." },
];

/** What each tone means in the current uses. */
export interface ToneRule {
  meaning: string;
  /** The callers that use the tone today. */
  example: string;
}

/** A Record makes the type check fail when a new tone has no rule. */
export const TONE_GUIDE: Record<NoticeTone, ToneRule> = {
  error: {
    example:
      "LoginPage, MarkPaidSheet and other forms and sheets, after a submit fails. HomePage, GroupDetailPage and TwoFactorSetupPage, with a retry button, after a load fails",
    meaning:
      "A request failed, and the user can correct it. When the value of one field is wrong, use the `error` prop of TextInput.",
  },
  info: {
    example:
      "LoginPage, unconfirmed account. ResetPasswordPage, help on an invalid link. ReviewAndCompletePage, details from a receipt",
    meaning: "Information or help. Nothing failed that the user must correct in this form.",
  },
  success: {
    example: "No caller uses it today",
    meaning: "A result that stays on the page. The app has no caller, so check the open questions before you use it.",
  },
  warning: {
    example: "ForgotPasswordPage, password recovery is not available",
    meaning: "A function is not available, and the user cannot correct this.",
  },
};

/** When a screen reader must read the notice. WCAG 4.1.3 requires this for a status message. */
export const ANNOUNCE_RULES: UsageRule[] = [
  {
    rule: "Set `announce` when the notice appears after the first render of the page. For example, it appears after a submit, or after a request that the page starts by itself. All such notices in the app use it.",
    title: "A notice that appears later",
  },
  {
    rule: "Do not set `announce` on a notice that is part of the first render, for example the help on the invalid link screen of ResetPasswordPage. A screen reader reads it in the page order.",
    title: "A notice in the first render",
  },
  {
    rule: "The tone does not decide this. The info tone has both cases today.",
    title: "Not from the tone",
  },
];

/** How to fill a notice. */
export const CONTENT_RULES: UsageRule[] = [
  {
    rule: "Put the button in the `action` slot. The notice puts it below the message, on the right, as RequestCard does. Do not add a layout class to the button.",
    title: "Button in a notice",
  },
  {
    rule: "The notice has no prop for the variant. Set `variant` on the button. Use `outline`, because every tone has a tinted surface in the surface rule of `button.usage.ts`. Use `primary` only when the action is the one main action of the screen. Do not use `secondary`.",
    title: "Button variant",
  },
  {
    rule: "An `outline` action uses `sm`. LoginPage and TwoFactorSetupPage do this. A `primary` action uses `md`, because `SIZE_DECISION` in `button.usage.ts` says that the one main action of a screen is never smaller than `md`.",
    title: "Button size",
  },
  {
    rule: "The default slot has a gap of only 4px. When the message has a second block, for example a countdown, put the blocks in a `flex flex-col gap-2` block. LoginPage does this.",
    title: "More than one block of text",
  },
  {
    rule: "Each tone has a default icon: `PhInfo` for info, `PhCheckCircle` for success, `PhWarning` for warning and `PhWarningCircle` for error. Leave the `icon` slot empty, unless another icon tells more about this message. LoginPage uses `PhPaperPlaneTilt` for the confirmation email. A notice always has an icon.",
    title: "Icon",
  },
  {
    rule: "An icon in the slot takes no size. The notice sets 18px and centers the icon on the first line of text. The icon is decorative, so the text must give the full message.",
    title: "Icon size",
  },
  {
    rule: "Use `title` for a short line. Wrap the message in `<p>`, because the slot does not add a paragraph.",
    title: "Text",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: 'With `announce`, the notice has `role="alert"`. A screen reader reads the text when the notice appears. A browser reads `role="alert"` reliably on a new element, and a `role="status"` region must exist before its text changes. So a notice with `v-if` uses alert for each tone.',
    title: "Live role",
  },
  {
    text: "The icon box has `aria-hidden`. The tone has no text, so the color and the icon never carry the only copy of the message. The default icons of warning and error have different shapes, so the color is not the only difference between them.",
    title: "Icon and color",
  },
  {
    text: "A notice can hold a RateLimitCountdown. The countdown keeps its text out of the alert, so a screen reader does not read the alert again each second.",
    title: "Countdown in a notice",
  },
  {
    text: "The body text of each tone uses the 900 token of the color of the tone. It has a contrast above 4.5:1 in both themes. The Accessibility part of the design-system page measures it from the rendered notice.",
    title: "Contrast",
  },
  {
    text: "When a notice describes a field, give the notice an `id` and pass that `id` to the `described-by` prop of TextInput. ForgotPasswordPage does this.",
    title: "Link to a field",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "When does a failed form submit use a notice, and when a toast? LoginPage and RegisterPage use a toast. ResetPasswordPage uses a notice. ForgotPasswordPage uses both with the same text, so a screen reader reads the message two times.",
  "Does the app need the success tone? No caller uses it. Success results use a toast or a StatusBadge screen.",
  "Does a `primary` action on the error tone need a neutral fill? The fill of `primary` is the brand color, on a red surface. The user has not decided this. No caller uses `primary` in a notice today. Keep the actions on the error tone `outline` until then.",
];
