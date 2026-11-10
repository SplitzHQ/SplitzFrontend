/**
 * The usage rules of EmptyState. This file is the one place for these rules.
 * Agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";
import type { EmptyStateProps } from "./EmptyState.vue";

/** The tones of an empty state. */
export type EmptyStateTone = NonNullable<EmptyStateProps["tone"]>;

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "A demo on a design-system page or a prototype can use the component with sample data.",
    "When a rule does not decide a devtools empty state, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use an empty state. The prototype `2026-11-08-empty-states` (SPZ-104) decided these rules. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "A list, a sheet or a page loaded and has nothing to show. Put the empty state in the place of the list. Examples: a new group with no expenses, the notifications, the friends on ProfilePage and InviteFriendsSheet.",
    title: "Nothing to show",
  },
  {
    rule: "A search or a filter hides every item. The title names the keyword or the filter, and the action clears it. Examples: the search and the filter of HomePage, the search of SelectCategorySheet and SelectPeoplePage.",
    title: "No result",
  },
  {
    rule: "Show the empty state only after the load succeeds. During the first load, show the skeleton or the loading state of the page.",
    title: "After the load",
  },
];

/** The cases with another component or with no component. */
export const NOT_AN_EMPTY_STATE: UseInsteadRule[] = [
  {
    use: "HomeEmptyState",
    when: "HomePage of a person with no groups. Its art and its full-width buttons come from SPZ-85.",
  },
  {
    use: "A line of text in the section",
    when: "One section of a page is empty and the page has other content.",
  },
  {
    use: "Notice",
    when: "A function is not available, for example receipt scanning on a server with no model. That is not an empty list.",
  },
  {
    use: "Notice with a retry button, for now",
    when: "A failed load. SPZ-104 decided that a failed load uses the error tone of this component. SPZ-92 decides its copy and its actions. Until SPZ-92 lands, follow `notice.usage.ts`.",
  },
];

/** What each tone means. A Record makes the type check fail when a new tone has no rule. */
export const TONE_GUIDE: Record<EmptyStateTone, string> = {
  error: "A failed load. The tile and the icon use the danger color. No page uses it before SPZ-92 lands.",
  neutral: "Nothing to show, or no result. Every empty state of the app uses it.",
};

/** How to fill an empty state. */
export const CONTENT_RULES: UsageRule[] = [
  {
    rule: "Pass a Phosphor icon in `icon`. The component sets the weight, the size and the color. Use an icon that tells the kind of content: PhMagnifyingGlass for a search, PhReceipt for expenses, PhUsersThree for friends.",
    title: "Icon",
  },
  {
    rule: "The title says what is empty in a short sentence, with no full stop. The description says what the person can do, or why the list is empty. Leave out the description when the title says enough, for example the title of a filter.",
    title: "Text",
  },
  {
    rule: "The title is an `h2` by default. In a sheet or a section with an `h2` title, set `title-tag` to `h3`.",
    title: "Heading level",
  },
  {
    rule: "Do not put the empty state in a card, a box or a tinted frame. It sits on the surface of the list or the sheet.",
    title: "No frame",
  },
];

/** How to choose the buttons. */
export const ACTION_RULES: UsageRule[] = [
  {
    rule: "Put the buttons in the `action` slot. The component puts them under the text, in the center. Use `md`.",
    title: "Place and size",
  },
  {
    rule: "When the action is the only way forward from this state, use `primary`, for example Add friend or Copy invite link. SPZ-104 decided this.",
    title: "Only way forward",
  },
  {
    rule: "Use `secondary` for an action that only undoes a condition, for example Clear search or Clear filter, and for a second action next to a primary one.",
    title: "Other actions",
  },
  {
    rule: "Give no button when the page already has the action in a fixed place, for example the + button of GroupDetailPage or the settings button of the notifications. The description can name that place.",
    title: "No button",
  },
  {
    rule: "Hide the other controls that do nothing in this state, for example a disabled Send or Next button and a Select all row.",
    title: "No dead controls",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The icon tile has `aria-hidden`. The title and the description carry the full message.",
    title: "Icon",
  },
  {
    text: "The title is a heading, so a screen reader can find the state from the list of headings. Set `title-tag` so that the heading level follows the page.",
    title: "Heading",
  },
  {
    text: "The component is not a live region. When a search or a filter changes the list to the empty state, the page announces the result in its own status line. HomePage does this.",
    title: "Announce a result",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "SPZ-92: the copy, the actions and the retry feedback of a failed load with the error tone.",
  "SelectPeoplePage with no group and no friend: the page stays as it is. SPZ-117 (placeholder people) gives the way out.",
];
