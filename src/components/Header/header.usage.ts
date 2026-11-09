/**
 * The usage rules of HeaderMobileSecondary. This file is the one place for these rules.
 * The design-system Header page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules do not apply to the headers of the tools. They have their own headers.",
    "When a rule does not decide a devtools header, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use the header. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "Use it in the `header` slot of Layout, on each page under the home page. All 16 such pages use it. Do not build a second back button.",
    title: "Secondary pages",
  },
];

/** The cases with another component. */
export const NOT_THIS_HEADER: UseInsteadRule[] = [
  { use: "The header of HomePage", when: "The page is the home page. That header has the logo and the search field." },
  { use: "AuthShell", when: "The page is a sign-in page or an account page. AuthShell shows the logo and the h1." },
];

/** What each button does. */
export const BUTTON_RULES: UsageRule[] = [
  {
    rule: "Set `enable-back-button` on each page, but not on a page from the Flow steps rule that has only the close button. The button opens the earlier page of the app. Twelve pages have it.",
    title: "Back",
  },
  {
    rule: "Set `enable-close-button` on a page of a flow, and call `takeSnapshot()` of the routing history store before the flow starts. The button returns to the position of that snapshot. Eight pages have it: create group, four steps of a new expense and three steps of settle up.",
    title: "Close",
  },
  {
    rule: "Show only the close button on the first step of a flow and on a result page, because the back button has no different page to open or must not return to a finished step. Show the back button and the close button on the other steps. CreateGroupPage, EnterAmountPage, SelectTransactionsPage and DonePage have only the close button.",
    title: "Flow steps",
  },
  {
    rule: "Set `fallback` when the page has a clear parent, for example the group of a transaction or the profile page of a setting. The two buttons open this page when no earlier page or snapshot exists, for example after a link from an email or a reload. The default is the home page.",
    title: "Fallback",
  },
  {
    rule: 'Put a page action in this slot, as an `SIconButton` with `variant="ghost"` and `size="md"`. Only GroupDetailPage has an action now.',
    title: "The right slot",
  },
];

/** The look of the header. */
export const LOOK_RULES: UsageRule[] = [
  {
    rule: "The header is a frosted bar, like the home header. The page shows through it with a blur. The status bar area has the full page color, and the color fades to the frosted color under it. `frostedBarStyle` in `@/libs/frosted-bar` holds the values for the two headers. The prototype `2026-11-05-group-detail-layout` (SPZ-81) decided this look for all secondary pages.",
    title: "Frosted bar",
  },
  {
    rule: "A faint line shows under the header while content is under it, and goes away at the top of the page. The header reads the scroll of the window, or of a box that holds the header. Do not give the header a fill or a border of your own.",
    title: "Bottom line",
  },
];

/** How to write the title. */
export const TITLE_RULES: UsageRule[] = [
  {
    rule: "The header sets the size, the weight (500) and the color of the title. Pass plain text. Do not add these classes to the title.",
    title: "Weight",
  },
  {
    rule: "The title starts at the left on all pages. Do not center it, and do not add an empty box to the `right` slot.",
    title: "Position",
  },
  {
    rule: "Give a step count in a row of the title the classes `text-sm font-normal text-base-text-quaternary`. The `font-normal` class is necessary because the count gets the weight of the title.",
    title: "Step count",
  },
  {
    rule: "The default slot is the h1 of the page. Do not add an h1 around it, and do not add a second h1 on the page. Use h2 for the sections of the page.",
    title: "Heading",
  },
  {
    rule: "Put only phrasing content in the slot: text and `span`. An h1 cannot hold a `div` or a `p`. Use a `span` with `flex` for a row.",
    title: "Content",
  },
  {
    rule: 'Use the `title` size for an avatar in the title, and set `aria-hidden="true"` on it. Its alt text gives member names, and the h1 then reads as a list of names.',
    title: "Avatar in the title",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The title is an h1 in a `header` landmark. While a page loads its title, the h1 is hidden, and the title box keeps its width.",
    title: "Heading and landmark",
  },
  {
    text: "The two buttons have the names `header-back` and `header-close` from the locale files. Give an `aria-label` to each icon button in the `right` slot.",
    title: "Names",
  },
  {
    text: "The icons use `--base-fg-brand`. The contrast on the light header is 4.3:1, and WCAG 1.4.11 asks for 3:1.",
    title: "Icon color",
  },
  {
    text: "`SIconButton` with the size `md` is 40px wide and high. The button rules set this size for a header. An invisible box in the button makes the tap area 44px.",
    title: "Tap area",
  },
  {
    text: "The header is sticky. A long title wraps, and a word that does not fit breaks, so the page has no sideways scroll.",
    title: "Long titles",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "Which token does the step count in a title use? `base-text-quaternary` has a contrast of 5.45:1 in the light theme and 3.30:1 in the dark theme, and WCAG 1.4.3 asks for 4.5:1. The app has no control that turns on the dark theme now.",
  "Does a focused element stay visible under the sticky header? The page has no `scroll-padding-top`. This check needs a signed-in session and an external keyboard.",
];
