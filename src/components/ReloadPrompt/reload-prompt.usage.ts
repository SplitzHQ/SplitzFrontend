/**
 * The usage rules of ReloadPrompt. This file is the one place for these rules.
 * The design-system Toast page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { UsageRule } from "../usage-rules";

/** How to use the prompt. */
export const USAGE_RULES: UsageRule[] = [
  { rule: "`src/App.vue` mounts one ReloadPrompt. Do not add another.", title: "One instance" },
  {
    rule: "The component renders nothing. It shows its messages with `toast` from `vue-sonner`, so a Sonner must be in the app.",
    title: "No element",
  },
];

/** What the prompt does. */
export const BEHAVIOR_NOTES: UsageRule[] = [
  {
    rule: "An info toast with an Update action and a close button. It does not close by itself, because the app does not update without a tap.",
    title: "New version",
  },
  {
    rule: "The app shows no message. A person who did not ask for offline use may not know what it means.",
    title: "Ready for offline use",
  },
  { rule: "The service worker checks for a new version each hour. The timer stops on unmount.", title: "Update check" },
  {
    rule: "The dev server makes no service worker, so the prompt does not show in dev. In dev, the component removes the service worker of an old dev server. To test the prompt, build the app and run `vite preview`.",
    title: "Dev server",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS: string[] = [];
