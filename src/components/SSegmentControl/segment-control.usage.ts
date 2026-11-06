/**
 * The usage rules of SSegmentControl. This file is the one place for these rules.
 * The design-system Segment control page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";
import type { SegmentSize } from "./segment";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: when not to use a segment control, the label and accessibility.",
    "The size rules apply: the tools use sm. The prototype kit has `SegmentPicker`, which uses `wrap`.",
    "Only `devtools/` uses `wrap`. A tool panel can have long lists, and a mouse cannot easily scroll a track sideways.",
    "A demo on a design-system page or a comparison frame in a prototype shows options on purpose. No rule applies to it.",
    "When a rule does not decide a devtools control, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use a segment control. */
export const WHEN_TO_USE: UsageRule[] = [
  { rule: "The user chooses one item from a short list on one row.", title: "One of a few" },
  { rule: "One item is always selected. The control has no empty state.", title: "Always a value" },
];

/** The cases with another component. */
export const NOT_A_SEGMENT_CONTROL: UseInsteadRule[] = [
  { use: "SSwitch", when: "The setting has two values: on and off." },
  { use: "SButton", when: "The tap runs one action and does not keep a value." },
];

/** What each size is for. The heights are measured from the rendered segment. The track adds 10px. */
export const SIZE_GUIDE: Record<SegmentSize, UsageRule> = {
  md: {
    rule: "36px high, 14px text. The default size in `src/`, for example the tabs of GroupDetailPage. The track is 46px high, so the tap area of 44px fits in the track. Do not add padding in the slot.",
    title: "md",
  },
  sm: {
    rule: "32px high, 14px text. The track is 42px high. When the track can scroll, it clips the tap area to 40px high. Use it in `src/` when the layout needs a compact control, for example in a row with other controls. The `devtools/` toolbars, panels and `SegmentPicker` also use it.",
    title: "sm",
  },
};

/** How to place a control. */
export const LAYOUT_RULES: UsageRule[] = [
  {
    rule: "The track has the width of its segments. The width of the parent is the limit. A caller does not add `self-start`.",
    title: "Width",
  },
  {
    rule: "The track does not wrap in `src/`. When the segments do not fit, they scroll inside the track. The edge fades on each side that has more segments. A page does not add its own scroll or fade. The four English tabs of GroupDetailPage are 325px wide. They fit in the 359px of free width on a 375px screen, and they scroll on a 320px screen.",
    title: "Segments that do not fit",
  },
  {
    rule: "A tap on a segment also shows the segment on each side of it. The track moves only when one of these segments is hidden.",
    title: "Scroll after a tap",
  },
];

/** How to write the text. */
export const COPY_RULES: UsageRule[] = [
  {
    rule: "Set `label` to the thing that the user chooses, for example Split method. Do not repeat the items. A screen reader reads it for the group.",
    title: "Name of the group",
  },
  {
    rule: "The text of a segment does not wrap. Keep each item short. The current items in the app have one word.",
    title: "Items",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The control is a radio group and each segment is a radio. A screen reader reads the name of the group, the item, and if it is selected. This fits all current uses, because no caller has a tab panel.",
    title: "Role",
  },
  {
    text: "Tab goes to the selected segment. An arrow key selects the next or the previous segment and moves the focus. The list wraps at each end.",
    title: "Keyboard",
  },
  {
    text: "Each segment has a tap area of at least 44px wide, from an invisible box. The look does not change. The target height is 44px, and md has it. With sm, the tap area is 44px high when the track does not scroll and 40px high when it can scroll. 40px is accepted when the layout needs sm.",
    title: "Tap area",
  },
  {
    text: "The text of a segment that is not selected uses `base-text-secondary`, because a person must read it to choose. It has at least 4.5:1 on the track in both themes. Do not use a muted text token here.",
    title: "Text contrast",
  },
  {
    text: "A ring shows when the user moves focus with an external keyboard. A tap does not show it.",
    title: "Focus ring",
  },
  {
    text: "An arrow key moves the focus and scrolls the track, so the focused segment and its neighbors are visible.",
    title: "Scroll with a keyboard",
  },
  {
    text: "While a finger or a mouse is on the track, the track looks larger with `--motion-scale-track-press`. A scroll does not end this. The track keeps its layout box, so the page under it does not move.",
    title: "Press",
  },
  {
    text: "The selected background slides with the motion tokens. Under reduced motion it moves at once, the track does not grow on a press, and the scroll has no animation.",
    title: "Reduced motion",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "What do the group detail tabs do? They do not change the content yet, and they stay in the radio role. When they get panels, should the control offer the tablist role? The old audit (G1) also says that Export does not look like a view.",
];
