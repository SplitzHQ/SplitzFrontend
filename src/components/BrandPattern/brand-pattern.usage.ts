/**
 * The usage rules of BrandPattern. This file is the one place for the rules of the component. The rules for the
 * patterns themselves (where a pattern may go, the presets, the limits) are in
 * `src/components/BrandWordmark/brand.usage.ts`. Agents read both through the `spz-component-use` and the
 * `spz-brand-use` skills.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";
import type { AppPatternFade } from "./brand-pattern";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "The Patterns tool and the prototypes draw with `devtools/patterns/PatternSvg.vue`, which also has grounds and more fades. They read the generator in `brand-pattern.ts`, so the shapes are the same.",
    "When a rule does not decide a devtools page, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use BrandPattern. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "A screen shows a brand pattern of a `ui` use in `PATTERN_USE_GUIDE` of `brand.usage.ts`. Now only AuthShell shows one, with `SIGN_IN_PATTERN`.",
    title: "A brand pattern in the app",
  },
];

/** The cases with another component. */
export const NOT_A_BRAND_PATTERN: UseInsteadRule[] = [
  { use: "BrandWordmark or BrandTapMark", when: "The screen must show the logo." },
  {
    use: "No pattern",
    when: "The surface is a list, a form, a sheet or an amount, or the screen already shows a pattern. See `PATTERN_RULES` in `brand.usage.ts`.",
  },
];

/** How to set the component. */
export const SETUP_RULES: UsageRule[] = [
  {
    rule: "Give one `AppPattern` from `brand-pattern.ts`. Add a new pattern there as a constant, with the preset of its use. `brand.usage.ts` then reads the constant, so the rules and the app show the same values.",
    title: "Pattern",
  },
  {
    rule: "The parent sets the place and the size of the box, for example `absolute top-0 right-0 -z-10` and a width and a height. The shapes keep their size, so a bigger box shows more shapes and not bigger shapes.",
    title: "Box",
  },
  {
    rule: "Put the pattern under the content: in a parent with `isolate`, give the box `-z-10`. Then no field or text sits under the pattern in the stacking order.",
    title: "Under the content",
  },
];

/** When to use each fade. */
export const FADE_GUIDE: Record<AppPatternFade, UsageRule> = {
  corner: {
    rule: "The pattern is in the top right corner of a screen and fades toward the content. AuthShell uses it.",
    title: "corner",
  },
  none: {
    rule: "The box already has a clear edge, for example a group cover. No use in the app has it now.",
    title: "none",
  },
};

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The pattern has `aria-hidden` and `pointer-events: none`. A screen reader does not read it, and a tap goes through it.",
    title: "Decoration",
  },
  {
    text: "The pattern does not move, so reduced motion changes nothing.",
    title: "Motion",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS: string[] = [];
