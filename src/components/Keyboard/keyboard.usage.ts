/**
 * The usage rules of Keyboard. This file is the one place for these rules.
 * The design-system Keyboard page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";

/** The values of the `variant` prop. */
export type KeyboardVariant = "ghost" | "primary";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: the keys stay native buttons, and the caller shows the value.",
    "A desktop tool has a physical keyboard. Use a number field in a tool, not this component.",
    "When a rule does not decide a devtools case, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use the keyboard. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "The screen asks for one amount or one number, and the user can calculate it. The two current uses are the amount of a new expense and the split detail of one person.",
    title: "An amount on a phone",
  },
];

/** The cases with another component. */
export const NOT_A_KEYBOARD: UseInsteadRule[] = [
  {
    use: "TextInput",
    when: "The value is not a number, or the screen has several fields that the user fills together.",
  },
];

/** Which frame goes where. The rule is what the two current uses do. */
export const VARIANT_RULES: Record<KeyboardVariant, UsageRule> = {
  ghost: {
    rule: "The keyboard is a block of the page, and the page has its own background. EnterAmountPage uses this frame.",
    title: "Part of the page",
  },
  primary: {
    rule: "The keyboard is fixed to the bottom of the screen, above other content. The top line and the fill separate it from that content. SelectSplitMethodPage uses this frame.",
    title: "Above other content",
  },
};

/** How to place the keyboard and connect it to the screen. */
export const LAYOUT_RULES: UsageRule[] = [
  {
    rule: "Show the value of `v-model` in the screen, near the keyboard. The keyboard shows only the line that the user types. An operator or a zero divisor can make the line and the value different.",
    title: "Show the value",
  },
  {
    rule: "A fixed keyboard at the bottom of the screen must add the safe area. SelectSplitMethodPage uses `px-safe-4 pb-safe-4`. Layout adds the safe area for a keyboard in the page.",
    title: "Safe area",
  },
  {
    rule: "If one keyboard edits several values, set `key` to the ID of the value. The keyboard keeps its line when the next value is equal to the current value, so without a key the user can continue the line of another person.",
    title: "One keyboard, several values",
  },
  {
    rule: "Do not change the keys. `button.usage.ts` says that a number key is an xl ghost button that does not fill an action area. The height is 52px.",
    title: "Keys",
  },
];

/** What the keys do. These rules describe the code, and the tests in `__tests__` check them. */
export const BEHAVIOR_RULES: UsageRule[] = [
  {
    rule: "The value is calculated from left to right, as on a simple calculator. The line shows this order with parentheses: `( 1 + 2 ) × 3` is 9.",
    title: "Order",
  },
  {
    rule: "The math uses big.js, so `0.1 + 0.2` is `0.3`. The value in `v-model` is a JavaScript number. A division that does not end has the precision of a number. The caller rounds the value, as `saveTransaction` does.",
    title: "Exact math",
  },
  {
    rule: "An operator with no number after it does not change the value. A zero divisor also does not change the value, because the zero can be the start of `0.5`.",
    title: "Unfinished input",
  },
  {
    rule: "A second operator replaces the first. Plus, times and divide do nothing on an empty line. Minus on an empty line starts `0 -`, because an adjustment can be negative.",
    title: "Operators",
  },
  {
    rule: "Backspace removes one character. The line keeps the dot and the zeros that the user typed, so `1.50` stays `1.50`.",
    title: "Backspace",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "Each key is a native button. Tab moves to it, and Space and Enter press it.",
    title: "Keyboard and screen reader",
  },
  {
    text: "The icon keys and the dot key have a translated name, for example “Plus” and “Decimal point”. A digit key reads its digit. The group of keys has the name “Number keys”.",
    title: "Names",
  },
  {
    text: "The line is a polite live region, so a screen reader reads it after a key press. The line does not have the final value, so the caller must show the value as text or with a label. NumberFlow on EnterAmountPage has the image role and a label with the value.",
    title: "The entered value",
  },
  {
    text: "Each key is 52px high. The narrowest key is 69px wide.",
    title: "Tap area",
  },
  {
    text: "The press scale and the color fades come from SButton. They use the motion tokens and turn off when the system asks for reduced motion. SButton also sets `touch-action: manipulation`, so fast presses do not zoom the page.",
    title: "Motion and fast presses",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "How long can the input be? Now it has no limit. Twenty digits show on the line, but the value is the nearest JavaScript number. A value above about 1e21 saves as `1e+21`, because `saveTransaction` uses `toFixed`. Card SPZ-27.",
  "How many decimal places can the user type? Now it has no limit, for every currency. `saveTransaction` always saves two places, so `1.239` saves as `1.24`, and JPY also gets two places. See the same card.",
  "What does the line show for `5 ÷ 0`? Now the value stays 5, and the line stays `5 ÷ 0` with no message. The correct result is not an error while the user types `0.5`, but it can look wrong if the user stops at zero.",
  "Which decimal mark does the key show? The key and the line always show a dot. The amount uses the locale of the browser, so a German browser shows `1,50` above a key with a dot. English and Simplified Chinese both use a dot, so the two app languages are correct.",
  "Does a desktop user type with a physical keyboard? Now the keys react only to a press. Card SPZ-28.",
  "Is `variant` the correct name? `ghost` and `primary` change only the frame, and they do not have the meaning of the same names on SButton. A name such as `surface` can be clearer.",
];
