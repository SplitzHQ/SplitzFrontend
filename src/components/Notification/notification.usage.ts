/**
 * The usage rules of the Notification family: NotificationBell, NotificationPanel, NotificationSheet, NotificationItem,
 * NotificationBadge, AvatarMenu and RequestCard. This file is the one place for these rules.
 * The design-system Notification page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";

/** The components of the family. */
export type NotificationPart =
  | "NotificationBell"
  | "NotificationPanel"
  | "NotificationSheet"
  | "NotificationItem"
  | "NotificationBadge"
  | "AvatarMenu"
  | "RequestCard";

/** The states of the list in NotificationPanel. */
export type NotificationPanelState = "loading" | "error" | "empty" | "list";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: the names and accessibility.",
    "The placement rules do not apply. A page in `devtools/` shows these components only as a sample.",
    "These components read the real stores. The design-system page gives them sample stores with the same IDs, so a page does not call the backend.",
    "When a rule does not decide a devtools sample, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** What each component is for. A Record makes the type check fail when a new part has no rule. */
export const PARTS: Record<NotificationPart, UsageRule> = {
  AvatarMenu: {
    rule: "The avatar in the home header. It shows the pending requests. On a desktop with pending requests it opens a popover. In all other cases it opens the profile page.",
    title: "AvatarMenu",
  },
  NotificationBadge: {
    rule: "The count at the corner of the bell and the avatar. Zero hides it. A number above 99 shows as 99+. The fill is `base-bg-primary-reverse`. Do not use red, because red is only for an error, a debt or a destructive action.",
    title: "NotificationBadge",
  },
  NotificationBell: {
    rule: "The bell in the home header. It shows the unread activity. It opens NotificationPanel in a popover on a desktop and NotificationSheet on a phone.",
    title: "NotificationBell",
  },
  NotificationItem: {
    rule: "One row of activity. A tap marks it as read and opens its page. It shows the picture from the notification, or an icon tile. Its text uses the list row levels in `src/components/ListRow/list-row.usage.ts`: a read row has the quiet name.",
    title: "NotificationItem",
  },
  NotificationPanel: {
    rule: "The activity list with its title and its actions. It reads the store. Set `inSheet` only in NotificationSheet.",
    title: "NotificationPanel",
  },
  NotificationSheet: {
    rule: "NotificationPanel in a sheet on a phone, with Clear all and Mark all read at the bottom. It reads the store.",
    title: "NotificationSheet",
  },
  RequestCard: {
    rule: "One friend request or group invite that the user must answer, with Accept and Ignore. Use `compact` in a popover. ProfilePage uses the default.",
    title: "RequestCard",
  },
};

/** The cases with another component. */
export const NOT_A_NOTIFICATION: UseInsteadRule[] = [
  {
    use: "toast",
    when: "The message is the result of an action of the user, for example a request that the user accepted.",
  },
  { use: "Notice", when: "The message belongs to the page and stays until the state of the page changes." },
  { use: "RequestCard", when: "The user must answer. A request is not an activity row." },
];

/** Where the header parts go. Each rule describes the current use on HomePage. */
export const PLACEMENT_RULES: UsageRule[] = [
  {
    rule: "NotificationBell and AvatarMenu are only in the header of HomePage. They read the store, and they do not take props.",
    title: "One place",
  },
  {
    rule: "The bell keeps `text-util-color-brand-700` on its icon. This is the exception in `ICON_RULES` of `button.usage.ts`.",
    title: "Bell color",
  },
  {
    rule: "The ring of the badge has the color `base-bg-secondary_alt`, because the header has that background. The ring looks wrong on another surface. See the open questions.",
    title: "Surface of the badge",
  },
  {
    rule: "The parent of a badge must be `relative`. Set the position with `class`: the bell uses `top-0.5 right-0.5`, and the avatar and the home filter button use `-top-1 -right-1`.",
    title: "Position of the badge",
  },
  {
    rule: "Keep the default `neutral` tone. The home filter button uses `brand`, because the button takes the brand fill of a selected FilterPill while a filter is on (SPZ-84). Do not use `brand` on another control without a decision of the user.",
    title: "Tone of the badge",
  },
  {
    rule: "The name of the control must include the count, because a screen reader does not read the badge. Use `notification-unread-count` and `notification-requests-badge`.",
    title: "Name of the control",
  },
];

/** What the panel shows in each state. A Record makes the type check fail when a new state has no rule. */
export const PANEL_STATES: Record<NotificationPanelState, UsageRule> = {
  empty: {
    rule: "The request finished and the list has no rows. The empty message shows.",
    title: "Empty",
  },
  error: {
    rule: "The request failed and the list has no rows. The message and a Retry button show. A screen reader reads the message. When a later request fails, the old rows stay and the panel shows no error.",
    title: "Error",
  },
  list: {
    rule: "The rows show. Mark all read shows only with unread rows. Clear all shows only with rows. Settings always shows. `HEADER_RULES` says where each action goes.",
    title: "List",
  },
  loading: {
    rule: "The first request runs. Three skeleton rows show, and the empty message does not show. A later request does not show a loading state, because the old rows stay.",
    title: "Loading",
  },
};

/** Where the actions of the panel go. The user chose this layout in a prototype. */
export const HEADER_RULES: UsageRule[] = [
  {
    rule: "The header has the title, Mark all read, Clear all and the settings icon in one row. A popover has no close button, so the row has space for them.",
    title: "Desktop",
  },
  {
    rule: "The header has the title and a ghost More button. A press on the free part of the row drags the handle of the sheet. A list with no rows shows the settings icon in place of More, because a second sheet would have only one row.",
    title: "Header on a phone",
  },
  {
    rule: "More opens a second sheet with all the actions: Mark all read, Clear all and Settings. A tap on a row runs the action and closes the second sheet.",
    title: "Second sheet",
  },
  {
    rule: "The `actions` slot of the sheet has Clear all on the left and Mark all read on the right, so a tap cannot easily hit the wrong one. Both use size sm. Clear all is ghost and Mark all read is secondary. When all rows are read, only Clear all shows, and it stays on the left.",
    title: "Bottom of the sheet",
  },
];

/** How a row works. */
export const ROW_RULES: UsageRule[] = [
  {
    rule: "An unread row has a tint, a dot and a bolder title. The dot is on the top-right corner of the picture or the icon tile. Its ring has the color `base-bg-primary`, because the popover and the sheet have that surface. A screen reader reads the word Unread.",
    title: "Unread",
  },
  {
    rule: "A row with no page only changes to read. `getNotificationRoute` returns the page.",
    title: "Tap",
  },
  {
    rule: "`describeNotification` in `notification-text.ts` writes the title, the body, the icon and the tone. Add a new type there, and add its strings to `src/locales/**/notification.ftl`.",
    title: "Text",
  },
  {
    rule: "The icon has `base-fg-quaternary` with no opacity, because WCAG 1.4.11 asks for 3:1. A device that can hover shows the dismiss button on hover or on keyboard focus at the `md` width. Other devices always show it.",
    title: "Dismiss",
  },
];

/** How a request card works. */
export const REQUEST_RULES: UsageRule[] = [
  {
    rule: "The buttons are `sm`, because each card in the list has its own buttons. See `SIZE_DECISION` in `button.usage.ts`. Accept is `primary` and Ignore is `ghost`. The two buttons align to the right, with Accept on the right. See `GROUP_RULES` in `button.usage.ts`.",
    title: "Buttons",
  },
  {
    rule: "The button that does the work shows `loading`, and the other button is `disabled`. See `LOADING_RULES` in `button.usage.ts`.",
    title: "While a request runs",
  },
  {
    rule: "The card has `core-alpha-brand-5`, and that is a plain surface in `SURFACE_RULE` of `button.usage.ts`.",
    title: "Surface",
  },
];

/** Accessibility rules that the components follow, written for the people who use them. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: 'The badge has `aria-hidden="true"`. The name of the bell and the name of the avatar already have the count. A screen reader therefore reads the count one time.',
    title: "Count",
  },
  {
    text: "The bell is 40px wide, and the button adds an invisible box to make the tap area 44px. The avatar button has its own invisible box. The dismiss button is 28px wide and has an invisible box of 44px. The Profile row in the popover has a box 44px high.",
    title: "Tap area",
  },
  {
    text: "Each button shows a ring when the user moves focus with an external keyboard. A tap does not show it. A row button has a ring around its content.",
    title: "Focus ring",
  },
  {
    text: "The word Unread is hidden text in the row button. The dot and the tint have no text of their own.",
    title: "Unread",
  },
  {
    text: "The picture and the icon tile of a row are hidden from a screen reader, because the text of the row has the name.",
    title: "Picture",
  },
  {
    text: "The popover and the sheet have the dialog role, with the name Notifications or Requests.",
    title: "Panel name",
  },
  {
    text: "The first load has the status role with a name. An error has the alert role, so a screen reader reads it when it appears.",
    title: "Status of the panel",
  },
  {
    text: "The badge and the list animations use the motion tokens, so they turn off when the system asks for reduced motion. The bell swing has its own length, and a media rule and `html[data-reduce-motion]` turn it off.",
    title: "Reduced motion",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "The button audit (D11 and D12) says that only AvatarMenu uses RequestCard and that it is always compact. ProfilePage also uses RequestCard, with no `compact`. So the prop stays. Do the two forms need two paddings and two avatar sizes?",
  "Must a phone show the requests behind the avatar? The open question in `popover.usage.ts` covers this. The name of the avatar says the number of pending requests, but the tap opens the profile page. Must the name also say that?",
  'Must a new notification be read by a screen reader when it arrives? The store polls each 5 minutes, and only the name of the bell changes. Nothing is read at that time. The old `role="status"` on the badge did not do this, because a browser reads such a role reliably only on an element that was already there.',
  "Must Clear all ask for a confirm step? It removes all rows at once, and the app has no way to undo it.",
  "Where must focus go after the user dismisses a row or answers a request? The element goes away, so a keyboard user loses the place.",
  "Must the ring of the badge follow the surface? Both callers are on `base-bg-secondary_alt`, so the fixed color is correct today.",
  "Must the time of a row change in the dark theme? It has `base-text-quaternary`, and its contrast is 3.30:1 in the dark theme. WCAG 1.4.3 asks for 4.5:1. Other screens use this token too, so this is a question about the token.",
  "Must the bell swing again each time? It swings when HomePage opens with unread activity and when the panel closes with unread activity left. It does not swing when a new notification arrives while the panel is closed and the count was already above zero.",
];
