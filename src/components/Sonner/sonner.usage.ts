/**
 * The usage rules of the toast: the `toast` function of vue-sonner and the Sonner host. This file is the one place for
 * these rules. The design-system Toast page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, CopyRule, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: the tones, the copy and accessibility.",
    "The design-system app mounts its own Sonner. A tool does not need the safe area offsets of `src/App.vue`.",
    "When a rule does not decide a devtools toast, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use a toast. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "An action is complete and the screen does not say so. For example: a saved setting or a sent request.",
    title: "A result",
  },
  {
    rule: "Each copy action uses a toast, because a copy has no other visible result.",
    title: "A copy",
  },
  {
    rule: "One tap fails and the screen has no input to correct. The user taps again. For example: a switch or an Accept button.",
    title: "A failed tap",
  },
  {
    rule: "A file from the system picker is not valid. The page has no field for this message.",
    title: "A file that is not valid",
  },
];

/** How to show a toast. */
export const HOST_RULES: UsageRule[] = [
  {
    rule: "`src/App.vue` mounts one Sonner. Do not add another. To show a toast, call `toast.success` or `toast.error` from `vue-sonner`.",
    title: "One host",
  },
  {
    rule: "Keep the offsets of `src/App.vue`. They keep the toast out of the safe area of a phone, at the top and at the bottom.",
    title: "Safe area",
  },
  {
    rule: "A toast is at the top center. Do not pass `position`. Only the new-version prompt of ReloadPrompt is at the bottom center. The open questions keep the position of the other toasts.",
    title: "Position",
  },
  {
    rule: "At phone width a toast fills the row between the offsets. On a desktop a toast is as wide as its content, and a long text wraps at the width of the toaster. Do not set a fixed width.",
    title: "Width",
  },
  { rule: "Pass a `$t` message. Do not pass English text.", title: "Translated text" },
  {
    rule: "A normal toast has no close button. It closes by itself, and the user can swipe it up, down, left or right. A toast with `duration: Infinity` must have an action and `closeButton: true`.",
    title: "Close",
  },
];

/** The cases with another component. */
export const NOT_A_TOAST: UseInsteadRule[] = [
  {
    use: "TextInput `error`",
    when: "The value of one field is wrong. This includes a code that the server rejects.",
  },
  {
    use: "Notice",
    when: "A submit fails and the form or the sheet stays open. Put the notice next to the submit button.",
  },
  {
    use: "Notice with a retry button",
    when: "The page cannot load its content.",
  },
  {
    use: "Notice",
    when: "The user must read the message to continue, or the message has more than one action.",
  },
  {
    use: "No message",
    when: "The next page is the normal destination and it shows the result. For example: the home page after sign-in, or the list after a new expense.",
  },
  { use: "RateLimitCountdown", when: "The server answers 429. Callers do not show a toast for this case." },
  {
    use: "StatusBadge with the AuthShell title",
    when: "The result replaces the full screen. Do not also show a toast.",
  },
];

/** The tones of a toast. */
export type ToastTone = "success" | "error" | "info" | "warning";

/** What a tone means in the current calls. */
export interface ToastToneRule {
  use: string;
  /** How many calls in `src/` use this tone. */
  calls: number;
  example: string;
}

/** A Record makes the type check fail when a new tone has no rule. */
export const TONE_GUIDE: Record<ToastTone, ToastToneRule> = {
  error: {
    calls: 18,
    example: "Couldn't save changes. Try again.",
    use: "A request failed, or the input is not correct.",
  },
  info: {
    calls: 1,
    example: "A new version is available",
    use: "News that the user did not ask for. Only ReloadPrompt uses it.",
  },
  success: { calls: 23, example: "Nickname updated", use: "An action of the user is complete." },
  warning: { calls: 0, example: "No call", use: "No call uses it. Check the open questions before you use it." },
};

/** How to write the text of a toast. */
export const COPY_RULES: CopyRule[] = [
  {
    do: ["Group created", "Nickname updated", "Link copied"],
    dont: ["Group created.", "Your group was created successfully"],
    rule: "Name the thing, then the result, in the past tense. A short phrase has no period. The locale README requires this.",
    title: "Success",
  },
  {
    do: ["Receipt details filled in"],
    dont: ["Details filled in from your receipt. Double-check before saving."],
    rule: "Keep the text on one line at phone width. Text that the user must keep in mind goes in the page.",
    title: "Length",
  },
  {
    do: ["Couldn't create group. Try again."],
    dont: ["Group creation failed", "Error 500"],
    rule: "Start with `Couldn't` and the action. Say what the user can do next when you can. A full sentence has a period.",
    title: "Failure",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The toast region of vue-sonner is a polite live region. A screen reader reads each new toast after its current sentence. The region and the close button have translated names.",
    title: "Screen reader",
  },
  {
    text: "The close button is 20px high and the action button is 28px high. An invisible box makes each tap area 44px high.",
    title: "Tap area",
  },
  {
    text: "A toast closes after 4 seconds. Hover pauses the timer on a desktop. Do not put a message there that the user must read to continue. A swipe is not available to a keyboard or a screen reader, so a toast that stays must have a close button.",
    title: "Time limit",
  },
  {
    text: "vue-sonner removes its movement when the system asks for reduced motion. It does not read the `data-reduce-motion` attribute of the developer tools.",
    title: "Reduced motion",
  },
  {
    text: "The host reads the `dark` class of the root element. The surface is the reverse of the page: dark on a light page and light on a dark page.",
    title: "Theme",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "Where does a toast appear on a phone? Now it appears at the top and covers the page header and the back button for 4 seconds. The new-version prompt is already at the bottom (SPZ-99). The research in the prototype `devtools/prototypes/2026-11-04-toast-look` shows that a toast with Undo is usually at the bottom.",
  "Which end does a failure message have? The text uses `Try again.`, `Please try again.` or no end. `Couldn't copy link.` has a period, and `Couldn't copy to clipboard` has none. `Image must be under 10 MB` has none, and `Image must be under { $maxMb } MB.` has a period.",
  "Which text does a validation error use? `Passwords do not match` has no contraction, and the locale README asks for contractions.",
  "Does the app need the warning tone? No call uses it.",
];
