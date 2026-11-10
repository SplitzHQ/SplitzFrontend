/**
 * The list of shared components. Use it to choose a component before you change the UI.
 * Each entry says when to use the component and where its usage rules are.
 * The app does not import this file. A test keeps this list equal to the folders in `src/components`.
 */

/** One folder in `src/components`. */
export interface ComponentEntry {
  /** The folder name in `src/components`. */
  folder: string;
  /** The components that pages import from this folder. */
  components: string[];
  /** When to use the component. */
  use: string;
  /** The usage file, relative to the repository root. */
  usage: string;
}

export const COMPONENT_INDEX: ComponentEntry[] = [
  {
    components: ["AuthShell", "AuthStatusIcon", "PasswordChecklist"],
    folder: "AuthShell",
    usage: "src/components/AuthShell/auth-shell.usage.ts",
    use: "The page frame of a sign-in or account page, with the brand and the only h1 of the page.",
  },
  {
    components: ["Avatar"],
    folder: "Avatar",
    usage: "src/components/Avatar/avatar.usage.ts",
    use: "A user picture or a grid of pictures for a group. It shows a default picture when the source is missing or fails to load.",
  },
  {
    components: ["BlurBand"],
    folder: "BlurBand",
    usage: "src/components/BlurBand/blur-band.usage.ts",
    use: "A progressive blur over content that scrolls under a fixed area. Sheet and BottomAction add it, so a page does not use it directly.",
  },
  {
    components: ["BrandPattern"],
    folder: "BrandPattern",
    usage: "src/components/BrandPattern/brand-pattern.usage.ts",
    use: "A faint brand pattern of dots and diamonds behind the content of a screen, for example the top right corner of the account pages. The rules for where a pattern may go are in `src/components/BrandWordmark/brand.usage.ts`.",
  },
  {
    components: ["BrandWordmark", "BrandHomeLogo", "BrandTapLogo", "BrandTapMark", "BrandOpening"],
    folder: "BrandWordmark",
    usage: "src/components/BrandWordmark/brand-wordmark.usage.ts",
    use: "The Splitz logo: the word with the diamond on the i, the word mark of HomePage with its tap motion and its change to the glyph, and the full-screen opening. The brand rules for every logo and app icon are in `src/components/BrandWordmark/brand.usage.ts`.",
  },
  {
    components: ["CategoryIcon", "CategoryText"],
    folder: "Category",
    usage: "src/components/Category/category.usage.ts",
    use: "The icon or the translated name of an expense category.",
  },
  {
    components: ["EmptyState"],
    folder: "EmptyState",
    usage: "src/components/EmptyState/empty-state.usage.ts",
    use: "A list, a sheet or a page with nothing to show, or a search or a filter with no result: an icon in a tile, a title, a description and the actions.",
  },
  {
    components: ["FilterPill"],
    folder: "FilterPill",
    usage: "src/components/FilterPill/filter-pill.usage.ts",
    use: "A round choice button for a filter or a sort: a pill in a row above a list that opens a sheet, or one choice in that sheet.",
  },
  {
    components: ["HeaderMobileSecondary"],
    folder: "Header",
    usage: "src/components/Header/header.usage.ts",
    use: "The header of a secondary page. It holds the h1 of the page, an optional back button and an optional close button.",
  },
  {
    components: ["InvoiceStatusPill"],
    folder: "InvoiceStatusPill",
    usage: "src/components/InvoiceStatusPill/invoice-status-pill.usage.ts",
    use: "The status of an invoice.",
  },
  {
    components: ["Keyboard"],
    folder: "Keyboard",
    usage: "src/components/Keyboard/keyboard.usage.ts",
    use: "The on-screen number keyboard, with a calculator line.",
  },
  {
    components: ["BottomAction", "Layout"],
    folder: "Layout",
    usage: "src/components/Layout/layout.usage.ts",
    use: "The frame of a signed-in page, with a header slot and the main landmark. BottomAction is a page button that is fixed to the bottom of the screen, with a progressive blur.",
  },
  {
    components: ["ListRowContent", "AmountChip"],
    folder: "ListRow",
    usage: "src/components/ListRow/list-row.usage.ts",
    use: "A list row: the parts of a row that opens a page, the classes of a row that the user presses, the text levels of every list row, and an amount with a direction on a tinted fill.",
  },
  {
    components: ["Notice"],
    folder: "Notice",
    usage: "src/components/Notice/notice.usage.ts",
    use: "A message in the page content, with an info, success, warning or error tone.",
  },
  {
    components: [
      "AvatarMenu",
      "NotificationBadge",
      "NotificationBell",
      "NotificationItem",
      "NotificationPanel",
      "NotificationSheet",
      "RequestCard",
    ],
    folder: "Notification",
    usage: "src/components/Notification/notification.usage.ts",
    use: "The notification bell, the panel, its rows and its request cards.",
  },
  {
    components: ["RateLimitCountdown"],
    folder: "RateLimitCountdown",
    usage: "src/components/RateLimitCountdown/rate-limit-countdown.usage.ts",
    use: "The time that is left in a rate-limit cooldown.",
  },
  {
    components: ["ReloadPrompt"],
    folder: "ReloadPrompt",
    usage: "src/components/ReloadPrompt/reload-prompt.usage.ts",
    use: "The prompt for a new app version. The app has one instance. Do not add another.",
  },
  {
    components: ["SButton", "SIconButton", "SLinkButton", "SButtonBase"],
    folder: "SButton",
    usage: "src/components/SButton/button.usage.ts",
    use: "An action that the user starts, or a link that looks like a button.",
  },
  {
    components: ["SelectableRow"],
    folder: "SelectableRow",
    usage: "src/components/SelectableRow/selectable-row.usage.ts",
    use: "A row in a list where the user selects more than one item, with the selected fill and the check mark.",
  },
  {
    components: ["Sheet"],
    folder: "Sheet",
    usage: "src/components/Sheet/sheet.usage.ts",
    use: "A panel that comes from the bottom of the screen.",
  },
  {
    components: ["Sonner"],
    folder: "Sonner",
    usage: "src/components/Sonner/sonner.usage.ts",
    use: "The host of the toasts. The app has one instance. To show a toast, call `toast` from `vue-sonner`.",
  },
  {
    components: ["SPopover"],
    folder: "SPopover",
    usage: "src/components/SPopover/popover.usage.ts",
    use: "An anchored panel for rich content at a desktop width. On a phone, use Sheet or a link.",
  },
  {
    components: ["SSegmentControl"],
    folder: "SSegmentControl",
    usage: "src/components/SSegmentControl/segment-control.usage.ts",
    use: "A choice of one item from a short list, shown side by side.",
  },
  {
    components: ["SSwitch"],
    folder: "SSwitch",
    usage: "src/components/SSwitch/switch.usage.ts",
    use: "A setting that is on or off.",
  },
  {
    components: ["StatusBadge"],
    folder: "StatusBadge",
    usage: "src/components/StatusBadge/status-badge.usage.ts",
    use: "An icon in three rings at the top of a result card, with a success, warning or error tone.",
  },
  {
    components: ["TextInput"],
    folder: "TextInput",
    usage: "src/components/TextInput/text-input.usage.ts",
    use: "A text field, with a label and helper text.",
  },
  {
    components: ["TransactionItem", "TransactionItemContent"],
    folder: "TransactionItem",
    usage: "src/components/TransactionItem/transaction-item.usage.ts",
    use: "A transaction row. `TransactionItem` links to the transaction, and `TransactionItemContent` is the row without the link.",
  },
];
