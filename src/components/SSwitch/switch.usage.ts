/**
 * The usage rules of SSwitch. This file is the one place for these rules.
 * The design-system Switch page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, CopyRule, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: when not to use a switch, the label and accessibility.",
    "The row layout does not apply. Choose what fits a desktop tool. `PanelSwitch` in the prototype kit already has a row.",
    "When a rule does not decide a devtools switch, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use a switch. */
export const WHEN_TO_USE: UsageRule[] = [
  { rule: "The setting has two values: on and off.", title: "Two values" },
  { rule: "The setting stays until the user changes it again.", title: "A lasting setting" },
];

/** The cases with another component. */
export const NOT_A_SWITCH: UseInsteadRule[] = [
  {
    use: "SSegmentControl",
    when: "The user chooses from more than two values, or the two values have their own names.",
  },
  { use: "SButton", when: "The tap runs one action and does not keep a value, for example Log out." },
];

/** How to place a switch. */
export const LAYOUT_RULES: UsageRule[] = [
  {
    rule: "Put the switch at the end of a row. Put the label and the hint at the start, in a block that can shrink (`min-w-0 flex-1`).",
    title: "Row",
  },
  { rule: "Do not add a size class. The switch has one size.", title: "One size" },
  {
    rule: "Set `busy` while a change of this switch saves. The switch keeps the keyboard focus and ignores taps, so the user cannot send a second change. After 300ms it fades to 60% and shows an arc on the thumb, so a fast save shows nothing. The thumb and the track show the new value at once.",
    title: "Saving",
  },
  {
    rule: "Set `disabled` when another action blocks the switch, for example while a form or a reset saves. Do not use it for a save of this switch, because a disabled switch loses the keyboard focus.",
    title: "Disabled",
  },
  {
    rule: "Set `inherited` only when the value comes from a parent setting, and show text in the row that says so. The look alone does not explain it.",
    title: "Inherited",
  },
];

/** How to write the label of the row. */
export const COPY_RULES: CopyRule[] = [
  {
    do: ["Payment reminders", "Use my own model"],
    dont: ["Turn on payment reminders", "Disable reminders"],
    rule: "Name the setting. The switch shows the state, so the label does not say on, off, enable or disable.",
    title: "Name the setting",
  },
  {
    do: ["Payment reminders"],
    dont: ["Payment reminders: on"],
    rule: "Do not put the current value in the label. A screen reader reads the value from the switch.",
    title: "No value in the label",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The track is 24px high. An invisible box makes the tap area 44px high. Leave 10px of free space above and below the switch, or the tap areas of two rows overlap.",
    title: "Tap area",
  },
  {
    text: "The `label` prop is required, because the switch has no visible text. Use the same text as the visible label of the row.",
    title: "Name",
  },
  {
    text: "The element is a native button with the switch role. Space and Enter toggle it, and a screen reader reads the value.",
    title: "Keyboard and screen reader",
  },
  {
    text: "A ring shows when the user moves focus with an external keyboard. A tap does not show it.",
    title: "Focus ring",
  },
  {
    text: "The color and the movement of the thumb use the motion tokens, so they turn off when the system asks for reduced motion. The arc of a saving switch then stays still.",
    title: "Reduced motion",
  },
  {
    text: "`busy` does not use the native disabled state, so the focus stays on the switch while it saves. The switch sets `aria-busy` and `aria-disabled`.",
    title: "Focus while it saves",
  },
  {
    text: "The off track has a contrast of about 1.6:1 with the page in light mode and 1.9:1 in dark mode. This is less than the 3:1 of WCAG 1.4.11. The thumb and the shape also show the state.",
    title: "Off track",
  },
  {
    text: "A saving switch has 60% opacity. In light mode the on track has a contrast of about 2.5:1 with its row, and the thumb has about 2.7:1 with the track. This is less than the 3:1 of WCAG 1.4.11. The state is short, `aria-busy` tells a screen reader, and the arc also shows it. The focus ring fades with the switch.",
    title: "While it saves",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "Can a switch be part of a form with a Save button? ReceiptRecognitionSettingsPage has one: the switch shows the other fields, and Save stores all of them. The old design-system page said that a switch takes effect at once and does not belong in such a form. Keep the page as it is until the user decides.",
];
