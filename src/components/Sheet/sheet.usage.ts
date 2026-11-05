/**
 * The usage rules of Sheet. This file is the one place for these rules.
 * The design-system Sheet page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, CopyRule, RuleScope, UsageRule, UseInsteadRule } from "../usage-rules";

/** The `detent` values of Sheet. */
type SheetDetent = "large" | "medium";
/** The `detentSizing` values of Sheet. */
type SheetDetentSizing = "maxHeight" | "height";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: when not to use a sheet, the label, how a sheet closes, and accessibility.",
    "The detent rules and the layout rules do not apply. Choose what fits a desktop tool. `PrototypeShell` shows a sheet on a narrow page, with no handle and no drag, because its content has sliders.",
    "When a rule does not decide a devtools sheet, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use a sheet. Each rule describes the current sheets of the app. */
export const WHEN_TO_USE: UsageRule[] = [
  {
    rule: "The user does a short task and then returns to the same page. For example: a form with few fields (AddFriendSheet) or a task with a photo (ScanReceiptSheet).",
    title: "Short task",
  },
  {
    rule: "The user chooses one item from a list, and the choice closes the sheet (PaidByButton, SplitMethodButton, SelectCategorySheet).",
    title: "Choice",
  },
  {
    rule: "The user confirms an action that deletes data or that is difficult to undo (DeleteConfirmSheet, MarkPaidSheet, RemoveFriendSheet, RemoveProviderSheet, the 2FA confirm step). The button rules are in `button.usage.ts`.",
    title: "Confirm step",
  },
  {
    rule: "On a phone, use a sheet for a panel that a desktop shows as a popover. NotificationBell has this pair: `SPopover` on a desktop, and Sheet on a phone.",
    title: "Phone version of a popover",
  },
];

/** The cases with another component. */
export const NOT_A_SHEET: UseInsteadRule[] = [
  {
    use: "A page with its own route",
    when: "The task has more than one step or needs the full screen. For example: the steps of a new expense.",
  },
  {
    use: "SPopover",
    when: "The screen has a desktop width, and the panel belongs to the control that opens it.",
  },
  {
    use: "toast from vue-sonner",
    when: "The app shows a result, and the user does not make a decision.",
  },
];

/** When to use a detent. */
export const DETENT_GUIDE: Record<SheetDetent, UsageRule> = {
  large: {
    rule: "A list or a form that can be long. The sheet can be 90% of the visible screen. For example: NotificationBell, InviteFriendsSheet, AddExpenseDetailsSheet.",
    title: "large",
  },
  medium: {
    rule: "A confirm step, a short form or a short list. The sheet can be 50% of the visible screen. Taller content scrolls in the sheet. For example: DeleteConfirmSheet, AddFriendSheet, PaidByButton.",
    title: "medium",
  },
};

/** When to use a kind of detent sizing. */
export const SIZING_GUIDE: Record<SheetDetentSizing, UsageRule> = {
  height: {
    rule: "The content changes height while the sheet is open, and the sheet must not jump. SelectCategorySheet uses it, because a search changes the length of the list.",
    title: "height",
  },
  maxHeight: {
    rule: "The default. The sheet fits its content, up to the detent.",
    title: "maxHeight",
  },
};

/** How a user closes a sheet. */
export const CLOSE_RULES: UsageRule[] = [
  {
    rule: "A tap on the backdrop and the Escape key close each sheet. A drag down closes each sheet that has `dismissOnDrag`, and that is the default.",
    title: "Always",
  },
  {
    rule: "A confirm step has a Cancel button and no close button. A choice list closes when the user chooses, and it has no close button. Set `showCloseButton` on each other sheet. The button does not show on the screen. Only a screen reader and an external keyboard can get to it, so a finger closes the sheet with a tap on the backdrop or a drag.",
    title: "Close button",
  },
  {
    rule: "Turn off `dismissOnDrag` only when the content has its own drag that is not a native input. A native range input, a text field and a select do not start a drag.",
    title: "Drag",
  },
  {
    rule: "Keep `showHandle`, unless the content has a sticky header at the top of the sheet. SelectCategorySheet is that case. A tap on the handle does nothing, so it never closes the sheet.",
    title: "Handle",
  },
  {
    rule: "Use `v-model`, or `:model-value` with `@update:model-value`. The sheet has no other close event.",
    title: "State",
  },
];

/** How to place a sheet and its content. */
export const LAYOUT_RULES: UsageRule[] = [
  {
    rule: "The sheet dims the status bar area through `useStatusBarDim` in `src/libs/status-bar-color.ts`. Do not set a status bar color in a screen. A new overlay with a backdrop calls the same function.",
    title: "Status bar",
  },
  {
    rule: "Set `title`, and Sheet draws the title: an h2 with size display-xs and weight semibold. Do not write a title in the content. Only a panel that puts its own controls in the title row has no `title`, and it sets `label`. NotificationSheet is that case. Such a title row sets `data-sheet-handle` and `touch-none`, so a press on it also drags the handle.",
    title: "Title",
  },
  {
    rule: "Sheet gives the content 16px at the sides. It gives 24px above a title, 20px between a title and the content, and 16px at the top of a sheet with no title. The comparison is the prototype `2026-11-04-sheet-title-spacing`. At the bottom it gives 16px above the safe area, or 24px above an action area, because the blur goes over that gap. Do not add padding around the content.",
    title: "Padding",
  },
  {
    rule: "Set `description` for a short line that explains the title, for example in a confirm step. Sheet draws it 8px under the title, with size sm. Do not write this line in the content. The content then starts 20px under the line.",
    title: "Description",
  },
  {
    rule: "Put the actions in the `actions` slot. The slot stays at the bottom, and the content scrolls under it. A progressive blur with no line separates them. The comparison is the prototype `2026-11-04-sheet-action-divider`. The buttons use size xl and fill the width: see `SIZE_DECISION` in `button.usage.ts`. NotificationSheet is the one exception: its bulk actions are not the task of the sheet, so they use size sm. An error or a countdown about the action goes above the buttons in this slot, so the user can see it when the content is scrolled.",
    title: "Action area",
  },
  {
    rule: "A sheet with a handle has a progressive blur from the edge of the panel, with a fade to the color of the panel. The handle strip has no color. The strength follows the scroll, so it shows nothing at the start of the scroll and the title becomes clear with the finger. A sheet with no handle has no top blur, because it can have a sticky header. Sheet does this, so a caller adds nothing.",
    title: "Top blur",
  },
  {
    rule: "A sheet can open over another open sheet. AddExpenseDetailsSheet opens SelectCategorySheet in this way. Escape closes only the top sheet, and the page stays locked until the last sheet closes. The lower sheet scales down from its bottom edge to `--motion-scale-sheet-back`, and it moves back while the top sheet leaves. Sheet does this, so a caller adds nothing.",
    title: "Sheet over a sheet",
  },
  {
    rule: "A drag of the handle changes the height. The handle is the bar, the strip around it and the title. A drag up goes to 90% of the visible screen, also for short content. A drag down goes back to the opening height, and a longer drag moves the sheet down and closes it. On release the sheet stays at the nearer of the two heights. A drag on a free part of the panel goes only down, so a drag up can scroll the content. Each sheet opens at its opening height.",
    title: "Height",
  },
  {
    rule: "The panel comes in from 100% of its height and leaves to 105%, so the shadow also leaves the screen. Both directions and the fade use `--motion-duration-sheet` and `--motion-easing-sheet`. The backdrop fades its color, so the panel stays opaque. A tap goes to the page while a sheet leaves. The comparison is the prototype `2026-11-04-sheet-motion`.",
    title: "Motion",
  },
  {
    rule: "A parent `v-if` that removes an open sheet removes it with no close animation. NotificationBell and InviteFriendsSheet have such a `v-if`, but it does not change while the sheet is open in normal use. The page does not stay locked.",
    title: "Removed while open",
  },
  {
    rule: "The backdrop uses `base-bg-overlay` and has no blur. The page becomes darker in the light theme and in the dark theme.",
    title: "Scrim",
  },
  {
    rule: "The panel uses `comp-sheet-bg`. In the dark theme it is a little lighter than the page. A part of the content that must look like the panel, for example a sticky header, uses the same token.",
    title: "Panel color",
  },
  {
    rule: "The bar is 36×5 and is 6px from the top of the panel. While the user holds it, it gets 4px wider and changes to `base-fg-tertiary`. Only the two ends of the bar move, because a transform makes the bar thicker during the animation. The comparison is the prototype `2026-11-04-sheet-handle`.",
    title: "Handle look",
  },
];

/** How to write the name of a sheet. */
export const COPY_RULES: CopyRule[] = [
  {
    do: ["Add friend", "Delete this expense?"],
    dont: ["Sheet", "Dialog", "Add friend sheet"],
    rule: "`title` is also the name of the sheet. A screen reader reads it when the sheet opens, and it says that the element is a dialog.",
    title: "Use the title",
  },
  {
    do: ["Split options", "Paid by Alex"],
    dont: ["Options", "Choose"],
    rule: "A choice list names its choice in `title`. Use the same text as the button that opens the sheet, if that text names the choice.",
    title: "Choice list",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "The panel has the dialog role and `aria-modal`. The type check requires `title` or `label`, and the panel gets its name from that prop. `description` gives the panel its `aria-describedby`.",
    title: "Role and name",
  },
  {
    text: "When the sheet opens, focus goes to the panel and not to the first control. A phone therefore does not open the keyboard by itself, and a screen reader starts at the name of the sheet.",
    title: "Focus on open",
  },
  {
    text: "When the sheet closes, focus goes back to the element that opened it. On iOS Safari a tap does not focus a button, so after a tap focus has no element to return to.",
    title: "Focus on close",
  },
  {
    text: "Tab stays in the top sheet. The page behind it is hidden from a screen reader, but a live region stays available, so a toast is still read.",
    title: "Focus trap",
  },
  {
    text: "A drag is not the only way to close a sheet (WCAG 2.5.7), because a tap on the backdrop also closes it. A person with a screen reader cannot use the backdrop or a drag, so `CLOSE_RULES` gives each sheet a control that closes it: a close button, a Cancel button or a choice.",
    title: "No drag needed",
  },
  {
    text: "The close button is the first stop of Tab. It shows with a ring only when an external keyboard focuses it. A screen reader reads its text and can always find it.",
    title: "Close button",
  },
  {
    text: "A screen reader does not read the handle, because it can only drag. A tap on the handle does nothing, so a person who cannot drag does not get the largest height (WCAG 2.5.7). The content still scrolls, so this person can get to all of it. The bar has a contrast of about 1.7:1. This is less than the 3:1 of WCAG 1.4.11. The user chose this look so that the bar does not take attention from the content.",
    title: "Handle",
  },
  {
    text: "The slide, the fade and the animation of the handle use the motion tokens, so they turn off when the system asks for reduced motion. A drag still moves the sheet, because the finger controls that movement.",
    title: "Reduced motion",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "Is the blur correct on a real iPhone? No device test exists. A drag sets the opacity of the panel near the point of dismissal, and one closed report from iOS 18 shows a black area when a blur changes its opacity. iOS 17 also needs a check, because Safari 17.6 on a Mac had a bug with a mask and a blur together. The compositor cost of the blur in Chromium is in the prototype `2026-11-04-sheet-action-divider`.",
  "Can a sheet close while its action runs? A tap on the backdrop closes DeleteConfirmSheet, MarkPaidSheet, EditNicknameSheet and the 2FA confirm step while the request runs. No caller blocks this now, and the old `dismissOnBackdrop` prop had no caller, so this work removed it.",
  "Must a mouse drag start only on the handle? A mouse drag now starts on each free part of the panel, so a person with a mouse cannot select the text in a sheet. A finger is not affected.",
  "Must a sheet move above the on-screen keyboard? `dvh` does not change when the keyboard opens, and `index.html` does not set `interactive-widget`. The browser scrolls to the focused field, but a Save button under the field can stay under the keyboard. Test this on a device before you decide.",
];
