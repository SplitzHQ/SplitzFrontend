/**
 * The usage rules of SPopover. This file is the one place for these rules.
 * The design-system Popover page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: the label and accessibility.",
    "The rule about the screen width does not apply, because the tools are for a desktop. Use a popover where it fits.",
    "When a rule does not decide a devtools popover, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use a popover. Each rule describes the current popovers of the app. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "The screen has a desktop width. Set `enabled` from `useIsDesktop`. The app is for phones first, so each popover needs a phone version.",
    title: "Desktop only",
  },
  {
    rule: "The panel belongs to the control that opens it, and the page stays usable around it. A tap outside closes it. For example: the notification list and the friend requests.",
    title: "Panel of a control",
  },
];

/** The cases with another component. */
export const NOT_A_POPOVER: UseInsteadRule[] = [
  {
    use: "Sheet",
    when: "The screen has a phone width and the phone must show the same content. NotificationBell has this pair.",
  },
  {
    use: "A link on the trigger",
    when: "The screen has a phone width and the content has its own page. AvatarMenu has this pair: the avatar opens the profile page.",
  },
  {
    use: "Sheet",
    when: "The user must make a decision before anything else, for example a confirm step. A popover is not modal.",
  },
];

/** How to set up the trigger and the panel. */
export const SETUP_RULES: UsageRule[] = [
  {
    rule: "The `trigger` slot must hold one element that accepts a click and a ref, for example `SIconButton` or a `<button>`.",
    title: "Trigger",
  },
  {
    rule: "When `enabled` is false, the trigger gets no popover behavior. Handle its click in the caller, to open a sheet or a page. A change of `enabled` closes an open panel.",
    title: "enabled",
  },
  {
    rule: "The default width is 384px (`w-96`). Change it with a class, for example `w-104`. Do not add a margin or a position class. The panel never gets wider than the free space on the screen. On a 375px screen, the default width becomes 343px, and a panel that opens to the right of its trigger can become 84px wide.",
    title: "Width",
  },
  {
    rule: "The panel never gets taller than the free space on the screen, and then its content scrolls. To set a smaller limit, set `--s-popover-max-height` in `class`. AvatarMenu uses `[--s-popover-max-height:min(70dvh,32rem)]`.",
    title: "Height",
  },
  {
    rule: "The panel has 16px padding and is a flex column. Add `gap-*` in `class` for the space between its children.",
    title: "Layout",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The panel has the dialog role. Set `aria-label`, and the panel gets its name from it. The trigger gets `aria-expanded` and `aria-haspopup`.",
    title: "Role and name",
  },
  {
    text: "When the panel opens, focus goes to its first control, if it has one. Escape closes the panel and returns focus to the trigger.",
    title: "Focus",
  },
  {
    text: "Focus can leave the panel, because a popover is not modal. The panel closes when focus goes outside.",
    title: "Not modal",
  },
  {
    text: "The trigger must have a name and a tap area of 44px. The popover does not add them.",
    title: "Trigger",
  },
  {
    text: "The animation uses the motion tokens, so it turns off when the system asks for reduced motion.",
    title: "Reduced motion",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "Must a popover have a phone version with the same content? NotificationBell shows the same list in a sheet. AvatarMenu has no request list on a phone: the avatar only opens the profile page, and the user finds the requests there. Keep each caller as it is until the user decides.",
];
