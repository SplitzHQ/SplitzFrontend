/**
 * The usage rules of Layout. This file is the one place for these rules.
 * The design-system Layout page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules do not apply to the pages of the tools. They have their own shells.",
    "When a rule does not decide a devtools layout, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use Layout. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "Use Layout as the root of each page of a signed-in user. All 17 such pages use it.",
    title: "Signed-in pages",
  },
];

/** The cases with another component. */
export const NOT_A_LAYOUT: UseInsteadRule[] = [
  { use: "AuthShell", when: "The page is a sign-in page, an account page or a status page for a signed-out user." },
  { use: "Sheet", when: "The content opens over the current page." },
];

/** How to fill the slots. */
export const SLOT_RULES: UsageRule[] = [
  {
    rule: "Use `HeaderMobileSecondary` in this slot. HomePage has its own header, with the search field. No page leaves this slot empty.",
    title: "Header slot",
  },
  {
    rule: 'Write `<template #default="layoutAttrs">` and `v-bind="layoutAttrs"` on the root of the content. The prop gives `mx-4 mb-4 grow`. Without the bind, the content has no side margin.',
    title: "Default slot",
  },
  {
    rule: "The 16px of Layout is the full side padding of a page. Do not add a side padding on the root of the content. A sheet or a block in the page can still have its own padding.",
    title: "Side padding",
  },
  {
    rule: "Put a sheet of the page next to Layout, not in the slots. GroupDetailPage, ProfilePage and TwoFactorSetupPage do this.",
    title: "Sheets",
  },
  {
    rule: "Set `h-dvh` on Layout when the page scrolls its own content, and set `overflow-y-auto` on the block that scrolls. SelectSplitMethodPage does this, because its keyboard is fixed to the bottom of the screen.",
    title: "A page that scrolls its own content",
  },
];

/** A bottom action of a page. */
export const BOTTOM_ACTION_RULES: UsageRule[] = [
  {
    rule: "Put a button that is fixed to the bottom of a page in BottomAction, as the last element of the content. BottomAction adds the fixed position, the safe area and the progressive blur. The edges of the button are the edges of the content. CreateGroupPage, JoinGroupPage, SelectPeoplePage and ProfilePage use it.",
    title: "Use",
  },
  {
    rule: "The root of the content has `pb-28`, so the last item stops above the blur at the end of the scroll. The blur goes 24px above the button.",
    title: "Space for the action",
  },
  {
    rule: "The blur has the color of the page, so a short page shows no band. Do not add a condition for a short page. See `blur-band.usage.ts`.",
    title: "A short page",
  },
  {
    rule: "A tap next to the button goes to the content under it. Only the button takes a tap.",
    title: "Taps",
  },
  {
    rule: "A floating button with an icon, such as the add button of HomePage and GroupDetailPage, does not use BottomAction and has no blur.",
    title: "Not a bottom action",
  },
];

/** The safe area. */
export const SAFE_AREA_RULES: UsageRule[] = [
  {
    rule: "Layout adds the right, the bottom and the left safe area as padding on its root. Do not add these values on the content in the normal flow.",
    title: "In the normal flow",
  },
  {
    rule: "The header adds the top safe area. HomePage adds it in its own header.",
    title: "At the top",
  },
  {
    rule: "A `fixed` element ignores the padding of Layout, so it needs its own safe value. BottomAction adds this value for a bottom action. A floating button uses `fixed right-safe-5 bottom-safe-12`.",
    title: "Fixed elements",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The default slot is in a `main` element, and the header is outside it. Do not add a second `main` in a page.",
    title: "Landmark",
  },
  {
    text: "Layout does not add a heading. `HeaderMobileSecondary` makes its title the h1 of the page, and HomePage has its own h1.",
    title: "Heading",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS: string[] = [];
