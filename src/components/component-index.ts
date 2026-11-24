/**
 * Registry of shared UI component folders under `src/components/`.
 * Consult this index before modifying UI code to find the right component and its `*.usage.ts` rules.
 * App code never imports this file; `component-index.spec.ts` verifies that every folder in `src/components/` is listed.
 */

/** Metadata entry for a single component folder in `src/components/`. */
export interface ComponentEntry {
  /** Directory name inside `src/components/`. */
  folder: string;
  /** Public components exported from this folder for pages to import. */
  components: string[];
  /** Summary of when to choose this component family. */
  use: string;
  /** Path to the component family's usage rules file, relative to the repository root. */
  usage: string;
}

export const COMPONENT_INDEX: ComponentEntry[] = [
  {
    components: ["AuthShell", "AuthStatusIcon", "PasswordChecklist"],
    folder: "AuthShell",
    usage: "src/components/AuthShell/auth-shell.usage.ts",
    use: "Page frame for sign-in and account recovery screens, rendering the brand mark and primary `<h1>`.",
  },
  {
    components: ["Avatar"],
    folder: "Avatar",
    usage: "src/components/Avatar/avatar.usage.ts",
    use: "Single user photo or multi-member group grid, falling back to a tinted initial tile when a photo is missing or fails to load.",
  },
  {
    components: ["BlurBand"],
    folder: "BlurBand",
    usage: "src/components/BlurBand/blur-band.usage.ts",
    use: "Progressive backdrop blur over scrolling content beneath fixed chrome. Mounted internally by `Sheet` and `BottomAction` rather than directly on pages.",
  },
  {
    components: ["BrandWordmark", "BrandHomeLogo", "BrandTapWordmark", "BrandTapGlyph", "BrandOpeningOverlay"],
    folder: "BrandWordmark",
    usage: "src/components/BrandWordmark/brand-wordmark.usage.ts",
    use: "Splitz logo components: static wordmark with the diamond tittle, `HomePage` header logo with tap animation and scroll-scrubbed glyph morph, `AuthShell` tap glyph, and cold-start opening overlay. Brand-wide rules live in `src/components/BrandWordmark/brand.usage.ts`.",
  },
  {
    components: ["CategoryIcon", "CategoryText"],
    folder: "Category",
    usage: "src/components/Category/category.usage.ts",
    use: "Icon or localized label for an expense category.",
  },
  {
    components: ["HeaderMobileSecondary"],
    folder: "Header",
    usage: "src/components/Header/header.usage.ts",
    use: "Top bar for secondary screens, containing the page `<h1>` plus optional back and close buttons.",
  },
  {
    components: ["InvoiceStatusPill"],
    folder: "InvoiceStatusPill",
    usage: "src/components/InvoiceStatusPill/invoice-status-pill.usage.ts",
    use: "Status badge for a settlement invoice.",
  },
  {
    components: ["Keyboard"],
    folder: "Keyboard",
    usage: "src/components/Keyboard/keyboard.usage.ts",
    use: "On-screen numeric keypad with inline arithmetic evaluation.",
  },
  {
    components: ["BottomAction", "Layout"],
    folder: "Layout",
    usage: "src/components/Layout/layout.usage.ts",
    use: "Signed-in page shell with a header slot and `<main>` landmark, plus `BottomAction` for fixed bottom action bars with progressive blur.",
  },
  {
    components: ["Notice"],
    folder: "Notice",
    usage: "src/components/Notice/notice.usage.ts",
    use: "Inline page callout supporting info, success, warning, and error tones.",
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
    use: "Notification bell, activity panel/sheet, notification rows, and friend/group request cards.",
  },
  {
    components: ["RateLimitCountdown"],
    folder: "RateLimitCountdown",
    usage: "src/components/RateLimitCountdown/rate-limit-countdown.usage.ts",
    use: "Live remaining-seconds status message during a rate-limit cooldown.",
  },
  {
    components: ["ReloadPrompt"],
    folder: "ReloadPrompt",
    usage: "src/components/ReloadPrompt/reload-prompt.usage.ts",
    use: "Singleton prompt announcing an updated service-worker build. Mounted once in `App.vue`.",
  },
  {
    components: ["SButton", "SIconButton", "SLinkButton", "SButtonBase"],
    folder: "SButton",
    usage: "src/components/SButton/button.usage.ts",
    use: "Interactive action buttons, icon buttons, and button-styled router links.",
  },
  {
    components: ["Sheet"],
    folder: "Sheet",
    usage: "src/components/Sheet/sheet.usage.ts",
    use: "Modal bottom sheet panel.",
  },
  {
    components: ["Sonner"],
    folder: "Sonner",
    usage: "src/components/Sonner/sonner.usage.ts",
    use: "Singleton toast host mounted in `App.vue`. Trigger toasts via `toast` from `vue-sonner`.",
  },
  {
    components: ["SPopover"],
    folder: "SPopover",
    usage: "src/components/SPopover/popover.usage.ts",
    use: "Anchored floating panel for desktop viewports; prefer `Sheet` or route navigation on mobile.",
  },
  {
    components: ["SSegmentControl"],
    folder: "SSegmentControl",
    usage: "src/components/SSegmentControl/segment-control.usage.ts",
    use: "Single-select segmented control for choosing among a short row of options.",
  },
  {
    components: ["SSwitch"],
    folder: "SSwitch",
    usage: "src/components/SSwitch/switch.usage.ts",
    use: "Boolean toggle switch.",
  },
  {
    components: ["StatusBadge"],
    folder: "StatusBadge",
    usage: "src/components/StatusBadge/status-badge.usage.ts",
    use: "Concentric-ring status icon for result screens, in brand, success, warning, or error tones.",
  },
  {
    components: ["TextInput"],
    folder: "TextInput",
    usage: "src/components/TextInput/text-input.usage.ts",
    use: "Labeled text field with validation and helper copy.",
  },
  {
    components: ["TransactionItem", "TransactionItemContent"],
    folder: "TransactionItem",
    usage: "src/components/TransactionItem/transaction-item.usage.ts",
    use: "Expense list row (`TransactionItem` wraps the row in a detail link; `TransactionItemContent` renders the inner content for custom row wrappers).",
  },
];
