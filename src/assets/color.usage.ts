/**
 * The usage rules of the color tokens. This file is the one place for these rules.
 * Agents read them before a UI change, and the later migration of the components uses them to choose a token.
 * The app does not import this file, so the rules do not go into the app bundle.
 * The generator `scripts/color-scales/` writes the values. A test checks that each token here has a value and a rule.
 */
import type { RuleScope, UsageRule } from "@/components/usage-rules";

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "The token rules apply to a devtools page: use a token for its job.",
    "A demo on a design-system page or a comparison frame in a prototype shows tokens on purpose. No rule applies to it.",
  ],
};

/** Ask these questions in this order before you choose a color. */
export const LAYER_RULES: UsageRule[] = [
  {
    rule: "If a shared component does the job, use its prop and do not write a color. For example, use the `tone` prop of Notice.",
    title: "A component does the job",
  },
  {
    rule: "If a semantic token describes the job, use it. Read `use` and `avoid` first. A value that looks correct is not a reason to use a token.",
    title: "A semantic token describes the job",
  },
  {
    rule: "If the color belongs to one part of one component, add a `comp-*` token in the generator. Point it at a semantic token when one fits. Only that component uses it.",
    title: "The color belongs to one component",
  },
  {
    rule: "If the job is new and at least two places need it, add a semantic token and do all `NEW_TOKEN_CHECKS`.",
    title: "The job is new and repeats",
  },
  {
    rule: "In all other cases, stop and ask the user. Do not use a primitive token.",
    title: "No answer",
  },
];

/** What a new semantic token needs. */
export const NEW_TOKEN_CHECKS: string[] = [
  "No token describes the job. A value that does not fit is not enough.",
  "Both themes use the same step. A different step needs a written reason.",
  "The contrast on the page and on a card meets the need of the job.",
  "The token has `use`, `avoid` and `typical` in `SEMANTIC_RULES`.",
  "`bun run color-scales` wrote the new files, and the tests pass.",
];

/** The only cases where code can use a primitive token (`core-*` or `util-*`). */
export const PRIMITIVE_EXCEPTIONS: string[] = [
  "The definition of a token, in `scripts/color-scales/` and in the input files of `scripts/css-var-to-tailwind/`.",
  "Artwork and the brand mark, for example EmptyStateBackground and the decoration of AuthShell.",
];

/** The semantic tokens, in the order of the prototype "Color token review". */
export const SEMANTIC_TOKENS = [
  "base-text-primary",
  "base-text-secondary",
  "base-text-muted",
  "base-text-placeholder",
  "base-text-disabled",
  "base-text-inverse",
  "base-text-brand",
  "base-text-danger",
  "base-text-success",
  "base-text-warning",
  "base-text-owe",
  "base-bg-primary",
  "base-bg-secondary",
  "base-bg-floating",
  "base-bg-subtle",
  "base-bg-hover",
  "base-bg-active",
  "base-bg-disabled",
  "base-bg-solid",
  "base-bg-scrim",
  "base-bg-brand-solid",
  "base-bg-brand-subtle",
  "base-bg-danger-solid",
  "base-bg-danger-subtle",
  "base-bg-success-subtle",
  "base-bg-warning-subtle",
  "base-border-default",
  "base-border-subtle",
  "base-border-muted",
  "base-border-disabled",
  "base-border-brand",
  "base-border-brand-subtle",
  "base-border-danger",
  "base-focus-ring",
] as const;

/** One semantic token. */
export type SemanticToken = (typeof SEMANTIC_TOKENS)[number];

/** What a semantic token is for. */
export interface TokenRule {
  /** The job of the token. */
  use: string;
  /** What the token is not for. */
  avoid: string;
  /** Where the token usually appears. */
  typical: string;
}

// A Record makes the type check fail when a new token has no rule.
export const SEMANTIC_RULES: Record<SemanticToken, TokenRule> = {
  "base-bg-active": {
    avoid:
      "Do not use it for a hover on a control with no fill. Use `base-bg-hover`. Do not use it for a state of a status color.",
    typical: "A pressed row, a selected neutral item, the hover of a row with a subtle fill.",
    use: "The pressed and selected fill of all neutral controls. It is also the hover fill of a control that has `base-bg-subtle` at rest.",
  },
  "base-bg-brand-solid": {
    avoid: "Do not use it for a large surface or for a fill that a person only reads.",
    typical: "The primary button.",
    use: "The strongest brand fill. Put `base-text-inverse` on it.",
  },
  "base-bg-brand-subtle": {
    avoid: "Do not put `base-text-inverse` on it, and do not use it for a neutral fill.",
    typical: "A brand notice, a selected chip.",
    use: "A light brand fill. Put `base-text-brand` on it.",
  },
  "base-bg-danger-solid": {
    avoid: "Do not use it for a state that a person can only read. Use `base-bg-danger-subtle`.",
    typical: "The destructive button.",
    use: "The solid fill of a dangerous action or an error. Put `base-text-inverse` on it.",
  },
  "base-bg-danger-subtle": {
    avoid: "Do not use it for a category color or for decoration.",
    typical: "An error notice, the soft destructive button.",
    use: "A light error fill. Put `base-text-danger` on it.",
  },
  "base-bg-disabled": {
    avoid: "Do not use it for read-only content.",
    typical: "A disabled button or input.",
    use: "The fill of a control that is not available.",
  },
  "base-bg-floating": {
    avoid: "Do not use it for a scrim. Use `base-bg-scrim`.",
    typical: "Popover, Sheet.",
    use: "A container that floats above the page.",
  },
  "base-bg-hover": {
    avoid:
      "Do not use it to show a selected item. Use `base-bg-active`. Do not use it on a control with `base-bg-subtle` at rest: both are 5%, so the hover shows no change. Use `base-bg-active` there.",
    typical: "A ghost button, a list row.",
    use: "The hover fill of all neutral controls.",
  },
  "base-bg-primary": {
    avoid: "Do not use it for a floating container. Use `base-bg-floating`.",
    typical: "The page background.",
    use: "The page.",
  },
  "base-bg-scrim": {
    avoid: "Do not use it for the surface of a container.",
    typical: "The layer behind Sheet and a dialog.",
    use: "The layer behind a sheet or a dialog.",
  },
  "base-bg-secondary": {
    avoid: "Do not use it for a hover or for a disabled state.",
    typical: "A card, a nested section.",
    use: "A card or a nested area on the page.",
  },
  "base-bg-solid": {
    avoid: "Do not use it for a brand action. Use `base-bg-brand-solid`.",
    typical: "A strong neutral badge.",
    use: "A neutral fill with high contrast. Put `base-text-inverse` on it.",
  },
  "base-bg-subtle": {
    avoid: "Do not use it for a hover, a disabled state or a status.",
    typical: "A placeholder tile, a neutral chip.",
    use: "A light neutral fill that can go on all surfaces.",
  },
  "base-bg-success-subtle": {
    avoid: "Do not use it for a category color or for decoration.",
    typical: "A paid status pill.",
    use: "A light success fill. Put `base-text-success` on it.",
  },
  "base-bg-warning-subtle": {
    avoid: "Do not use it for a category color or for decoration.",
    typical: "A warning notice, a pending status pill.",
    use: "A light warning fill. Put `base-text-warning` on it.",
  },
  "base-border-brand": {
    avoid: "Do not use it for the keyboard focus. Use `base-focus-ring`.",
    typical: "A selected tile.",
    use: "A brand border that shows a selected or emphasized item.",
  },
  "base-border-brand-subtle": {
    avoid: "Do not use it to show a selected item. Use `base-border-brand`.",
    typical: "The border of a brand notice.",
    use: "The border of a light brand fill.",
  },
  "base-border-danger": {
    avoid: "Do not use it for a dangerous action that has no error yet.",
    typical: "An input with an error.",
    use: "The border of an item with an error.",
  },
  "base-border-default": {
    avoid: "Do not use it for a divider. Use `base-border-subtle`.",
    typical: "An input, an outlined container.",
    use: "The default border of an available control or a container.",
  },
  "base-border-disabled": {
    avoid: "Do not use it to make a border less strong.",
    typical: "A disabled input.",
    use: "The border of a control that is not available.",
  },
  "base-border-muted": {
    avoid: "Do not use it for the border of a control. Use `base-border-default`.",
    typical: "The line of a card, a list divider inside a card.",
    use: "A structure line that stays behind the content.",
  },
  "base-border-subtle": {
    avoid: "Do not use it on a translucent or tinted surface, and do not use it for a control.",
    typical: "A divider between sections.",
    use: "A divider between solid surfaces.",
  },
  "base-focus-ring": {
    avoid: "Do not use it to show a selected item. It shows only the keyboard focus.",
    typical: "The outline of all focusable controls.",
    use: "The keyboard focus.",
  },
  "base-text-brand": {
    avoid: "Do not put it on a solid brand fill.",
    typical: "A link, a brand icon, a selected label.",
    use: "A link, a brand icon or a selected label.",
  },
  "base-text-danger": {
    avoid:
      "Do not put it on a solid danger fill. Do not use it for money that the user owes, because that is not an error. Use `base-text-owe`.",
    typical: "An error message, a destructive label.",
    use: "The text and the icon of an error or a dangerous action.",
  },
  "base-text-disabled": {
    avoid: "Do not use it to make text less strong. Use `base-text-muted`.",
    typical: "The label of a disabled button.",
    use: "The text and the icon of a control that is not available.",
  },
  "base-text-inverse": {
    avoid: "Do not use it on a subtle fill or on the page.",
    typical: "The label of the primary button and of the destructive button.",
    use: "The text and the icon on `base-bg-solid`, `base-bg-brand-solid` or `base-bg-danger-solid`. It has at least 4.5:1 on each of them in both themes.",
  },
  "base-text-muted": {
    avoid:
      "Do not use it for a disabled state or a placeholder. Do not use it for a control that a person must read, because it is below WCAG AA on purpose. Use `base-text-secondary`.",
    typical: "A date, a payer, a group label, a secondary icon.",
    use: "The least important reading text: a date, a payer, a group label or a secondary icon.",
  },
  "base-text-owe": {
    avoid:
      "Do not use it for an error or a dangerous action. Use `base-text-danger`. Do not use it for money that the user gets. Use `base-text-success`.",
    typical: "The total on BalanceCard when the user owes money, the owes tone of AmountChip.",
    use: "The amount and the direction of money that the user owes. It has the color of `base-text-danger`, but a different job.",
  },
  "base-text-placeholder": {
    avoid: "Do not use it for an empty state or a loading message.",
    typical: "The hint in TextInput.",
    use: "The hint inside an input.",
  },
  "base-text-primary": {
    avoid: "Do not use it for all text on a screen, because the screen then has no order.",
    typical: "A title, an amount, the value of a control.",
    use: "A title, an amount, body text or the value of a control.",
  },
  "base-text-secondary": {
    avoid: "Do not use it for a disabled state.",
    typical: "A list row, a description, an unselected segment.",
    use: "A list row, a description, or a control that a person must read.",
  },
  "base-text-success": {
    avoid:
      "Do not put it on a solid fill. Do not use it for long text: in the light theme it is step 9 and has less than 4.5:1 on a card and on its subtle fill (SPZ-121 tracks the fix).",
    typical: "A paid status, a success icon.",
    use: "The text and the icon of a success.",
  },
  "base-text-warning": {
    avoid: "Do not put it on a solid fill.",
    typical: "A pending status, a warning icon.",
    use: "The text and the icon of a warning.",
  },
};

/** A group of component tokens with one rule. */
export interface ComponentTokenRule {
  /** Matches the names of the tokens in this group. */
  pattern: RegExp;
  use: string;
  avoid: string;
}

/** The groups of the component tokens. A test checks that each `comp-*` token is in exactly one group. */
export const COMPONENT_TOKEN_RULES: Record<string, ComponentTokenRule> = {
  avatarLine: {
    avoid: "Do not use it outside the photo of Avatar. Use `base-border-*` for the line of a control or a container.",
    pattern: /^comp-avatar-/,
    use: "The faint line inside the edge of a photo in Avatar. It is translucent, so it shows on a photo that has the color of the page.",
  },
  avatarPalette: {
    avoid: "Do not use it for a category color. Use the main palette group.",
    pattern: /^comp-palette-avatar-/,
    use: "The tile of a person with no picture. See `src/components/Avatar/avatar.usage.ts`.",
  },
  buttonClose: {
    avoid: "Do not use it outside the close button.",
    pattern: /^comp-button-close-/,
    use: "The close button.",
  },
  buttonOutline: {
    avoid: "Do not use it outside SButtonBase.",
    pattern: /^comp-button-outline-/,
    use: "The translucent line and fills of the outline button. They stay visible on all tinted surfaces.",
  },
  buttonSecondary: {
    avoid: "Do not use it outside SButtonBase.",
    pattern: /^comp-button-secondary-/,
    use: "The translucent fill of the secondary button. It takes the hue of the surface.",
  },
  buttonSolid: {
    avoid: "Do not use it outside SButtonBase. Use `base-bg-brand-solid` or `base-bg-danger-*` for the rest fill.",
    pattern: /^comp-button-(primary|destructive)-/,
    use: "The hover and pressed fills of the primary, destructive and soft destructive buttons. The semantic layer has only the rest fill.",
  },
  cardHover: {
    avoid:
      "Do not use it on a row. Use `LIST_ROW_CLASS`. Do not use it on a card with another fill, because the step is only one step lighter than `base-bg-secondary`.",
    pattern: /^comp-card-/,
    use: "The hover and pressed fill of a tappable card with the `base-bg-secondary` fill, for example the total balance card on HomePage.",
  },
  emptyState: {
    avoid: "Do not use it outside EmptyState. Use `base-bg-brand-subtle` for another light brand fill.",
    pattern: /^comp-empty-state-/,
    use: "The translucent brand tile behind the icon of EmptyState. It follows the surface under it, on the page and on a card.",
  },
  homePage: {
    avoid: "Do not use it outside HomePage and HomeHeader. Use `base-bg-primary` for another page.",
    pattern: /^comp-home-/,
    use: "The page of the home screen, the status bar on it and the frosted header. It is the card gray in the light theme and the page color in the dark theme.",
  },
  notification: {
    avoid:
      "Do not use it outside the Notification components. Use `base-bg-brand-subtle` for another light brand fill and `base-text-brand` for another brand icon.",
    pattern: /^comp-notification-/,
    use: "The faint brand tint of a request card and of an unread notification row, the line around the request card, and the bell icon. The tint is lighter than `base-bg-brand-subtle`, so the brand icon tile on an unread row stays visible. The bell has the color of the wordmark next to it.",
  },
  palette: {
    avoid: "Do not use it for a status. The color shows which item it is, and not a state.",
    pattern: /^comp-palette-(?!avatar-)/,
    use: "Data colors: the main categories and the action tiles on the review page. `comp-palette-action-icon-bg` is the circle behind the icon of an action tile, at 70% opacity. See `src/components/Category/category.usage.ts`.",
  },
  row: {
    avoid: "Do not use it outside `LIST_ROW_CLASS`.",
    pattern: /^comp-row-/,
    use: "The hover and pressed fill of a shared row. It is one step lighter than `base-bg-hover`, so the gray tiles and the amount fills in the row stay clear.",
  },
  searchFilter: {
    avoid: "Do not use it outside the filter button of HomePage.",
    pattern: /^comp-search-filter-/,
    use: "The translucent brand fill of the filter button in the home search field. A translucent fill stays visible in both themes.",
  },
  segment: {
    avoid: "Do not use it outside SSegmentControl.",
    pattern: /^comp-segment-/,
    use: "The track, the hover and the selected fill of the segment control. A later decision sets the look.",
  },
  sheet: {
    avoid: "Do not use it outside a sheet.",
    pattern: /^comp-sheet-/,
    use: "The panel of a sheet, and the parts of its content that must look like the panel.",
  },
  statusBadge: {
    avoid: "Do not use it outside StatusBadge. Use the semantic status tokens.",
    pattern: /^comp-status-badge-/,
    use: "The core, the rings and the icon of the badge on a result page. The rings use one token at lower opacities.",
  },
  switch: {
    avoid: "Do not use it outside SSwitch.",
    pattern: /^comp-switch-/,
    use: "The track of the switch in each state.",
  },
  userTag: {
    avoid: "Do not use it outside the row of selected people on SelectPeoplePage.",
    pattern: /^comp-user-tag-/,
    use: "The translucent line of the tag of a selected person and of its `+N` button. It stays visible on the tinted fill of the tag.",
  },
};

/** The rules for the old `base-*` names during the migration. */
export const OLD_NAME_RULES: UsageRule[] = [
  {
    rule: "New code uses only the tokens in `SEMANTIC_TOKENS`. Later migration work replaces the other `base-*` names and then deletes them.",
    title: "Do not add a use of an old name",
  },
  {
    rule: "An old name is an alias of a semantic token only when the color is the same in both themes. All other old names keep their value, so the look of the app does not change before its migration card.",
    title: "An old name keeps its color",
  },
];

/** The decisions that the user has not made. */
export const OPEN_QUESTIONS: string[] = [];
