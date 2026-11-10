/**
 * The usage rules of TextInput. This file is the one place for these rules.
 * The design-system Text input page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";
import type { TextInputProps } from "./TextInput.vue";

/** One variant of TextInput. */
export type TextInputVariant = NonNullable<TextInputProps["variant"]>;

/** One input type of TextInput. */
export type TextInputType = NonNullable<TextInputProps["type"]>;

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: when not to use a text input, labels and accessibility.",
    "The props of each input type do not apply. A desktop tool does not need a phone keyboard.",
    "A demo on a design-system page or a comparison frame in a prototype shows options on purpose. No rule applies to it.",
    "When a rule does not decide a devtools field, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use a text input. */
export const WHEN_TO_USE: UsageRule[] = [
  { rule: "The user types one line of text, for example a name, an email address or a code.", title: "One line" },
  { rule: "The user searches a list on the same screen.", title: "Search" },
];

/** The cases with another component. */
export const NOT_A_TEXT_INPUT: UseInsteadRule[] = [
  { use: "Keyboard", when: "The user enters an amount of money on the new expense screen." },
  { use: "SSegmentControl", when: "The user chooses one item from a short list, and the items are all visible." },
  { use: "HomeSearchBar", when: "The field is the search field in the header of the home page." },
];

/** What each variant is for. */
export const VARIANT_GUIDE: Record<TextInputVariant, UsageRule> = {
  outlined: {
    rule: "The default. It has the border, the label, the hint, the icon slot and the password button. Use it in forms and sheets.",
    title: "outlined",
  },
  plain: {
    rule: "The bare input, for an inline layout that has its own container. It shows no label, no hint and no icon. Its text is `text-base` and scaled to look like `text-sm`, so it fits a row of `text-sm` text. It sets its own width, so do not add a width class, and put it in a block element that has the width. A flex parent would shrink it. It clips its extra width, so the page does not scroll sideways, and a long placeholder ends with an ellipsis. `SelectPeoplePage/SearchBar.vue` is the only use. The container shows the focus.",
    title: "plain",
  },
};

/** The props that the current forms set for each input type. */
export const TYPE_GUIDE: Record<TextInputType, UsageRule> = {
  email: {
    rule: 'Set `autocomplete="email"` and `inputmode="email"`, so a phone shows the keyboard with the @ key.',
    title: "email",
  },
  password: {
    rule: 'Set `autocomplete="current-password"` to log in, and `autocomplete="new-password"` to set a password. The field adds the show and hide button.',
    title: "password",
  },
  text: {
    rule: 'The default. For a code, set `inputmode="numeric"` and `autocomplete="one-time-code"`.',
    title: "text",
  },
};

/** How to name a field. */
export const LABEL_RULES: UsageRule[] = [
  {
    rule: "Each field needs a name. Set `label`. A placeholder is not a name, because it goes away when the user types.",
    title: "Always a name",
  },
  {
    rule: "`hide-label` keeps the name for a screen reader only. The current uses are the username row on the profile page, which has the name above the field, and the category search, which has a search icon.",
    title: "Hidden label",
  },
  {
    rule: "If a control must sit between the label and the field, write a `<label>` with `for`, and give the field the same `id`. AddExpenseDetailsSheet does this for the category button and the location button.",
    title: "A label outside the field",
  },
  {
    rule: "The label, the text under the field and the text in the field line up with the icon in the field. The ink of the password icon ends on the same line at the other side, so its button has a small negative margin. This is the padding and the border of the field. A `<label>` outside the field uses `px-3.25` for the same line. The field keeps the edge of the page, so the label does not line up with the title of a section.",
    title: "Alignment",
  },
];

/** How to show help and errors. */
export const MESSAGE_RULES: UsageRule[] = [
  {
    rule: "Put help text in `hint`. A screen reader reads it after the label. A placeholder is not help text.",
    title: "Hint",
  },
  {
    rule: "If the text must be outside the field, give the element an `id` and pass the ID in `described-by`.",
    title: "Text outside the field",
  },
  {
    rule: "When the value of one field is wrong, put the text in `error`. The text shows directly under the field, replaces the hint and sets the error colors. RegisterPage and ResetPasswordPage do this for a password that breaks the rules.",
    title: "Error",
  },
  {
    rule: "When the problem is not about one field, for example a failed request, use a Notice. Do not put the same text in `error` and in a toast.",
    title: "Not about one field",
  },
  {
    rule: "Set `invalid` only when the text is outside the field, and link the text with `described-by`. Color alone does not tell the user what is wrong (WCAG 1.4.1). ForgotPasswordPage does this.",
    title: "Invalid",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "A tap anywhere on the `outlined` field moves the focus to the input, and the keyboard of a phone stays open when the input already has the focus.",
    title: "Tap area",
  },
  {
    text: "An invisible box around the show and hide button makes the tap area 44px. Its name follows the state, and the name comes from the locale files.",
    title: "Password button",
  },
  {
    text: "The `plain` input is as high as its tap area. Put it in a container that is at least as high, as SearchBar does.",
    title: "Plain tap area",
  },
  {
    text: "The brand border and a thin inset ring show the focus. An invalid field keeps the error border, so only the ring shows the focus. The `plain` input shows only the caret, so its container draws the focus. SearchBar puts the input in a frame with a search icon and the same border and ring as `outlined`.",
    title: "Focus",
  },
  {
    text: "All motion in the `outlined` field uses the motion tokens, so reduced motion turns it off. Hover and focus colors use `hover-in`, and the return to rest uses `exit`, so the return is slower. The text under the field fades, and the content below moves smoothly. A new error also shakes the field one time, by a small distance. A change from one error to another error does not shake it. Do not add another shake on a page.",
    title: "Motion",
  },
  {
    text: '`label` names the input. In the `plain` variant it is the `aria-label`. `hint`, `error` and `described-by` set `aria-describedby`. `error` and `invalid` set `aria-invalid`. The `error` text has `role="alert"`, so a screen reader reads it when it appears.',
    title: "Screen reader",
  },
  {
    text: "Each input that a person can type in has a computed text size of at least 16px, because a focused input under 16px makes iOS zoom the page. This includes HomeSearchBar and a raw `<input>` or `<textarea>`. A placeholder has the same size as the text. The `outlined` text is `text-base`. The `plain` text is `text-base` and scaled to look like `text-sm`. A real iPhone did not zoom for HomeSearchBar or for this scaled input (2026-11-04). Do not use `maximum-scale` in the viewport, because it can stop pinch zoom.",
    title: "Zoom on iOS",
  },
  {
    text: "The empty border, the placeholder and the dark hint are below the WCAG minimum in the contrast tables. See the open questions.",
    title: "Contrast",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 * A prototype will decide the first question.
 */
export const OPEN_QUESTIONS = [
  "Is the contrast of the quiet parts acceptable? The empty border is about 1.3:1, and the filled border is also below 3:1. WCAG 1.4.11 asks for 3:1. The placeholder is about 3:1 in both themes, and the hint is about 3.3:1 in dark mode. WCAG 1.4.3 asks for 4.5:1. A change affects all fields.",
  "Does a tap on the password button keep the keyboard of a phone open? Now the button takes the focus from the input, so the keyboard can close. A tap on the padding of the field does not do this.",
  "The notes field of AddExpenseDetailsSheet is a raw `<textarea>` with its own outline. It does not show the states of TextInput. Does the app need a multi-line field?",
];
