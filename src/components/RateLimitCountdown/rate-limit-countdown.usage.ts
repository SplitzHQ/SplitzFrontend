/**
 * The usage rules of RateLimitCountdown. This file is the one place for these rules.
 * The design-system Rate limit countdown page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, CopyRule, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply if a tool shows a rate limit: the timer, the copy and accessibility.",
    "When a rule does not decide a devtools countdown, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use the countdown. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "The server answers 429, and the user must wait before the next try. The 9 uses in the app all do this.",
    title: "A rate limit",
  },
];

/** The cases with another component. */
export const NOT_A_COUNTDOWN: UseInsteadRule[] = [
  { use: "Notice", when: "The message has no time, or the user cannot try again." },
  { use: "Notice or toast", when: "The failure has another cause than a rate limit. See `sonner.usage.ts`." },
];

/** How to connect the countdown to a request. */
export const WIRING_RULES: UsageRule[] = [
  {
    rule: "Use `useRateLimitCooldown` from `@/libs/use-rate-limit-cooldown`. Do not write a timer. Call `startFromError(error)` in the catch block. It returns false for another error.",
    title: "One timer",
  },
  {
    rule: "Pass `remainingSeconds.value` to `seconds`. The text goes away at zero. Keep the component in the template with no `v-if`, so the live region exists before the cooldown starts.",
    title: "Seconds",
  },
  {
    rule: "Disable the button of the action while `isActive.value` is true.",
    title: "Block the action",
  },
  {
    rule: "Put the countdown next to the action that it blocks. All callers do this.",
    title: "Place",
  },
];

/** How to write the message. */
export const COPY_RULES: CopyRule[] = [
  {
    do: ["Too many scans. Try again in { $seconds } seconds."],
    dont: ["Rate limit exceeded", "Wait { $seconds }s"],
    rule: "Say what happened in one short sentence. Then say when the user can try again. The Fluent message gets the `seconds` argument.",
    title: "Two parts",
  },
  {
    do: ["[one] … { $seconds } second.", "*[other] … { $seconds } seconds."],
    dont: ["… { $seconds } seconds. (with no plural form)"],
    rule: "The last second shows 1, so an English message needs the `one` form. The locale README requires this. Chinese has one form.",
    title: "Plural",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "A hidden live region reads the message one time at the start, and it reads a fixed message at the end. The region clears itself after 7 seconds.",
    title: "Start and end",
  },
  {
    text: 'The visible text has `aria-live="off"`, so a screen reader does not read each second, also in a Notice with `announce`. A person can still move to the text and read the current time.',
    title: "Each second",
  },
  {
    text: "The text has a contrast above 4.5:1 on the page and in the info Notice, in both themes. The design-system page measures it from the rendered text.",
    title: "Contrast",
  },
  {
    text: "The component has no animation. The number changes at once.",
    title: "Reduced motion",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "Must a long wait show minutes? The fallback for a 429 without Retry-After is 60 seconds, and a server can send more. The text then shows a large number of seconds.",
  "Does the wait use an error color? The text uses `util-color-error-700`, and the StatusBadge of the same state in ConfirmEmailPage uses the warning tone.",
];
