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
  /** The usage file, relative to the repository root. `null` means that nobody has written the usage rules yet. */
  usage: string | null;
}

export const COMPONENT_INDEX: ComponentEntry[] = [
  {
    components: ["AuthShell", "BrandMark"],
    folder: "AuthShell",
    usage: null,
    use: "The page frame of a sign-in or account page, with the brand and the only h1 of the page.",
  },
  {
    components: ["Avatar"],
    folder: "Avatar",
    usage: null,
    use: "A user picture, with a default picture when the source is missing.",
  },
  {
    components: ["CategoryIcon", "CategoryText"],
    folder: "Category",
    usage: null,
    use: "The icon or the translated name of an expense category.",
  },
  {
    components: ["HeaderMobileSecondary"],
    folder: "Header",
    usage: null,
    use: "The header of a secondary page, with an optional back button and close button.",
  },
  {
    components: ["InvoiceStatusPill"],
    folder: "InvoiceStatusPill",
    usage: null,
    use: "The status of an invoice.",
  },
  {
    components: ["Keyboard"],
    folder: "Keyboard",
    usage: null,
    use: "The on-screen number keyboard, with an optional calculator.",
  },
  {
    components: ["Layout"],
    folder: "Layout",
    usage: null,
    use: "The page container, with a header slot and a content slot.",
  },
  {
    components: ["Notice"],
    folder: "Notice",
    usage: null,
    use: "A message in the page content, with an info, success, warning or error tone.",
  },
  {
    components: [
      "AvatarMenu",
      "NotificationBadge",
      "NotificationBell",
      "NotificationItem",
      "NotificationPanel",
      "RequestCard",
    ],
    folder: "Notification",
    usage: null,
    use: "The notification bell, the panel, its rows and its request cards.",
  },
  {
    components: ["RateLimitCountdown"],
    folder: "RateLimitCountdown",
    usage: null,
    use: "The time that is left in a rate-limit cooldown.",
  },
  {
    components: ["ReloadPrompt"],
    folder: "ReloadPrompt",
    usage: null,
    use: "The prompt for a new app version. The app has one instance. Do not add another.",
  },
  {
    components: ["SButton", "SIconButton", "SLinkButton", "SButtonBase"],
    folder: "SButton",
    usage: "src/components/SButton/button.usage.ts",
    use: "An action that the user starts, or a link that looks like a button.",
  },
  {
    components: ["Sheet"],
    folder: "Sheet",
    usage: null,
    use: "A panel that comes from the bottom of the screen.",
  },
  {
    components: ["Sonner"],
    folder: "Sonner",
    usage: null,
    use: "The host of the toasts. The app has one instance. To show a toast, call `toast` from `vue-sonner`.",
  },
  {
    components: ["SPopover"],
    folder: "SPopover",
    usage: null,
    use: "An anchored panel for rich content.",
  },
  {
    components: ["SSegmentControl"],
    folder: "SSegmentControl",
    usage: null,
    use: "A choice of one item from a short list, shown side by side.",
  },
  {
    components: ["SSwitch"],
    folder: "SSwitch",
    usage: null,
    use: "A setting that is on or off.",
  },
  {
    components: ["StatusBadge"],
    folder: "StatusBadge",
    usage: null,
    use: "An icon in rings, with a brand, success, warning or error tone.",
  },
  {
    components: ["TextInput"],
    folder: "TextInput",
    usage: null,
    use: "A text field, with a label and helper text.",
  },
  {
    components: ["TransactionItem", "TransactionItemContent"],
    folder: "TransactionItem",
    usage: null,
    use: "A transaction row. `TransactionItem` links to the transaction, and `TransactionItemContent` is the row without the link.",
  },
];
