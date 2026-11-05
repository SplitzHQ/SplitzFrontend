/**
 * The usage rules of BlurBand. This file is the one place for these rules.
 * Agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";

/** The `edge` values of BlurBand. */
type BlurBandEdge = "bottom" | "top";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "The tools do not use this band. When a rule does not decide a devtools layout, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use the band. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "Content scrolls under a fixed area, and the fixed area must stay easy to read. The look is the pick of the prototype `2026-11-04-sheet-action-divider`: option D, with a fade height of 24px.",
    title: "Content under a fixed area",
  },
];

/** The cases with another component. */
export const NOT_A_BLUR_BAND: UseInsteadRule[] = [
  { use: "BottomAction", when: "A page has one action that is fixed to the bottom of the screen." },
  { use: "The `actions` slot of Sheet", when: "A sheet has actions. Sheet adds the band." },
  {
    use: "No band",
    when: "A small round button floats over a list, for example the add button of HomePage and GroupDetailPage. The user chose this, because a band for that button blurs about 124px of the list.",
  },
];

/** When to use an edge. */
export const EDGE_GUIDE: Record<BlurBandEdge, UsageRule> = {
  bottom: {
    rule: "The band fills its parent and goes 24px above it. The parent must have a position, and the parent holds the fixed content.",
    title: "bottom",
  },
  top: {
    rule: "The band is 1.25 times the fade height, so it is 30px high by default, and the parent sets its position. The top of the tint has the full color, so a strip of that color above the band shows no edge.",
    title: "top",
  },
};

/** How to set the band. */
export const SETUP_RULES: UsageRule[] = [
  {
    rule: "`--blur-band-color` is the color of the tint. The default is `--base-bg-primary`, the color of a page. Set the variable on the band or on an ancestor when another color is under the band. Read the real color in the rendered page. For example: a sheet uses `--comp-sheet-bg`, and in the dark theme this color is not the page color.",
    title: "Color",
  },
  {
    rule: "`--blur-band-size` is the height of the fade. The default is 24px. Sheet sets 40px, because its top band also covers the handle strip.",
    title: "Size",
  },
  {
    rule: "`--blur-band-strength` goes from 0 to 1, and the default is 1. Change this variable to show or hide the band. Do not change the opacity of the band: see the comment in `BlurBand.vue`.",
    title: "Strength",
  },
  {
    rule: "When the tint has the color of the surface and no content is under the band, the band shows no change. So a short page needs no condition.",
    title: "Nothing under the band",
  },
  {
    rule: "The content must stop above the band at the end of the scroll, so the last item stays clear.",
    title: "End of the scroll",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The band has `aria-hidden` and `pointer-events: none`. A screen reader does not read it, and a tap goes through it.",
    title: "No role",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS: string[] = [
  "Is the blur correct on a real iPhone? No device test exists. iOS 17 needs a check, because Safari 17.6 on a Mac had a bug with a mask and a blur together. The compositor cost in Chromium is in the prototype `2026-11-04-sheet-action-divider`, and that result is not a phone result.",
];
