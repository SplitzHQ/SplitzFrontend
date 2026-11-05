/**
 * The usage rules of Avatar. This file is the one place for these rules.
 * The design-system Avatar page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";
import type { AvatarProps } from "./Avatar.vue";

/** The sizes of an avatar. */
export type AvatarSize = AvatarProps["size"];

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: the name rules and accessibility.",
    "The size guide does not apply. Choose what fits a desktop tool.",
    "When a rule does not decide a devtools avatar, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use an avatar. Each rule describes the current uses. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "The item is a person: a friend, a member, the user. Put the name next to the avatar.",
    title: "A person",
  },
  {
    rule: "The item is a group. Use `getGroupAvatarImages` from `@/libs/group-avatar`. It uses the group photo, or the first four members when the group has no photo.",
    title: "A group",
  },
];

/** The cases with another component. */
export const NOT_AN_AVATAR: UseInsteadRule[] = [
  { use: "CategoryIcon in a tile", when: "The item is an expense or an invoice and not a person." },
  {
    use: "An icon tile",
    when: "The item has no person or group picture. NotificationItem has this tile for activity, and JoinGroupPage has it for an invite to a group with no photo.",
  },
];

/** One size of an avatar, with the size of the picture and the places that use it. */
export interface AvatarSizeRule {
  /** The side of the avatar in pixels. */
  px: number;
  /** The corner radius in pixels. */
  radius: number;
  rule: string;
  /** The callers that use this size today. */
  callers: string;
}

/** A Record makes the type check fail when a new size has no rule. */
export const SIZE_GUIDE: Record<AvatarSize, AvatarSizeRule> = {
  header: {
    callers: "AvatarMenu",
    px: 32,
    radius: 8,
    rule: "Only the avatar in the home header. Do not use it with a grid.",
  },
  lg: {
    callers: "HomePage group rows, FrequentSelectionList, the ProfilePage identity card, JoinGroupPage",
    px: 64,
    radius: 16,
    rule: "A group row on the home screen, a chooser with the name under the avatar, or the main picture of a page.",
  },
  sm: {
    callers: "MarkPaidSheet, PaidByButton, UserItem, RequestCard on ProfilePage",
    px: 48,
    radius: 12,
    rule: "A person in a split or a payment, where the row has space or the name is under the avatar.",
  },
  xs: {
    callers:
      "NotificationItem, RequestCard in AvatarMenu, the header titles of GroupDetailPage, InvoiceDetailPage and TransactionDetailPage, GroupCard, InviteFriendsSheet, UserList, the friend rows of ProfilePage, the rows of InvoiceDetailPage and TransactionDetailPage",
    px: 40,
    radius: 10,
    rule: "A list row, a header title or a compact card. This is the usual size.",
  },
  xxs: {
    callers: "UserTag, with one picture",
    px: 20,
    radius: 6,
    rule: "A chip with a name. Use one picture only.",
  },
};

/** How a group avatar works. */
export const GROUP_RULES: UsageRule[] = [
  {
    rule: "The grid shows the first four pictures. You can pass all the members, and GroupCard, FrequentSelectionList and UserList do this.",
    title: "Four pictures",
  },
  {
    rule: "The app shows a grid only at `xs` and `lg`. At `xxs` each picture in a grid is 4px wide, so a person cannot see it. No caller uses `xxs` or `sm` with a grid.",
    title: "Sizes",
  },
  {
    rule: "One person in the list shows at full size, with no grid.",
    title: "One person",
  },
  {
    rule: "The corner of the frame is the corner of a tile plus the padding. The frame of a grid therefore has a smaller corner than one person at the same size: 12px at `lg` and 8px at `xs`. The tiles stay in the center of the frame, so 2 people leave space above and below.",
    title: "Corners",
  },
];

/** How to name an avatar for a screen reader. */
export const NAME_RULES: UsageRule[] = [
  {
    rule: "Set `alt` to the name of the person or the group. Set it in all cases, because it is the data of the avatar.",
    title: "alt",
  },
  {
    rule: 'Set `aria-hidden="true"` on the avatar when the name is next to it. A screen reader then reads the name one time. Each caller in the app has a visible name or a labeled parent. Only HomePage still has no `aria-hidden`, and its work is not finished.',
    title: "Name next to the avatar",
  },
  {
    rule: "Do not set `alt` to an empty string to hide a name. Use `aria-hidden`, so `alt` keeps the name.",
    title: "Not an empty alt",
  },
  {
    rule: "An avatar in a control with an `aria-label`, for example AvatarMenu, needs no `aria-hidden`. The label replaces the content.",
    title: "Inside a labeled control",
  },
];

/** What the avatar shows for each picture. */
export const PICTURE_RULES: UsageRule[] = [
  {
    rule: "Pass the path from the backend. Avatar adds the asset base URL. Pass `null` when the person has no picture.",
    title: "Source",
  },
  {
    rule: "A missing source, an empty source and a picture that fails to load all show the first character of `alt` on a colored tile. The tile stays until the page opens again. An empty `alt` shows a silhouette.",
    title: "No picture",
  },
  {
    rule: "A photo has a line of 1px inside its edge, so a photo with a pale or dark edge stays separate from the background. The line is black at 5% in the light theme and white at 10% in the dark theme. A tile with an initial has no line, because its fill is already different from the background. In a grid, each photo has its own line and the frame has none.",
    title: "Line on a photo",
  },
  {
    rule: "The color family comes from the name, so a person has one color on all pages. The families are brand, leaf, waterblue, purple, magenta, rosered and yellow. The size of the initial is 45% of the side of the tile, and 10px at the smallest.",
    title: "Color and size of the initial",
  },
  {
    rule: "The fill is step 100. The text is step 500, but leaf, waterblue and yellow use step 600 because step 500 of these families is too pale in the light theme. The contrast is 2.66 to 2.94 in the light theme and 2.78 to 5.58 in the dark theme. All families stay below 3:1 in the light theme, so the initial does not replace the name next to the avatar.",
    title: "Steps of the initial",
  },
  {
    rule: "A picture that is not square fills the avatar and the sides are cut. It is not stretched.",
    title: "Shape of the file",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "One picture is an image with `alt` as its name. A tile with an initial is also an image with `alt` as its name, so a screen reader does not read only the first character.",
    title: "One picture",
  },
  {
    text: 'A grid is one image for a screen reader. Its name is the names of the people that it shows, for example "Alex, Bo, Chen". Each picture in the grid has an empty `alt`.',
    title: "Group",
  },
  {
    text: 'The caller sets `aria-hidden="true"` when the name is next to the avatar. Without it, a screen reader reads the name two times.',
    title: "Do not read the name two times",
  },
  {
    text: "The avatar has no tap area of its own. A caller that makes it tappable must give the control a name and a tap area of 44px. AvatarMenu is an example.",
    title: "Tap area",
  },
  {
    text: "The avatar has no animation.",
    title: "Motion",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "Must the field `alt` get a new name? It now also sets the initial and the color.",
  "Must an avatar be hidden from a screen reader by default? Each caller has a visible name or a labeled parent, so each caller must now add `aria-hidden`. A default would remove that work, but a new caller with no name would then have no name.",
  "Must the size names change? `xs` is 40px and `sm` is 48px, but the `sm` button is 32px and the `md` button is 40px. The same word gives two heights.",
  "Must an avatar and a tile have one size in a list? A transaction tile (TransactionItemContent), an invoice tile (InvoiceItem) and an `sm` avatar are 48px with a radius of 12px. A list row avatar is 40px, and the NotificationItem tile is 40px.",
  "Must GroupCard, FrequentSelectionList and UserList use the group photo? They always show the members. HomePage and the page headers show the group photo when the group has one, so one group can have two pictures.",
];
