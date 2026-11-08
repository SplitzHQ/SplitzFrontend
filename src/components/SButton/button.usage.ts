/**
 * The usage rules of the SButton family. This file is the one place for these rules.
 * The design-system Button page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { CopyRule, UsageRule, UseInsteadRule } from "../usage-rules";
import { BUTTON_SIZES, BUTTON_VARIANTS, type ButtonSize, type ButtonVariant } from "./button";

/**
 * Where the rules apply. The main app is a phone app, so most rules are for `src/`.
 * `devtools/` is a set of desktop tools, so it follows only part of the rules.
 */
export const RULE_SCOPE = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: the component guide, when not to use a button, the variant roles, the labels, icons, loading and accessibility.",
    "These rules do not apply: the surface rule, sizes, button groups and full width. Choose what fits a desktop tool. The usual size is sm.",
    "A demo on a design-system page or a comparison frame in a prototype shows options on purpose. No rule applies to it.",
    "When a rule does not decide a devtools button, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** When to use each component of the family. */
export const COMPONENT_GUIDE = [
  {
    component: "SButton",
    use: "A button with a text label and optional icons. Use it when the tap runs logic.",
  },
  {
    component: "SIconButton",
    use: "A circular button that holds one icon. It has no visible text, so always give it an aria-label that names the action.",
  },
  {
    component: "SLinkButton",
    use: "A link that looks like a button. Use it when the tap only opens another page. If logic must run before the page opens, use SButton.",
  },
  {
    component: "SButtonBase",
    use: "The look of every button. Only SButton, SIconButton and SLinkButton use it. Do not import it in a page or in another component.",
  },
];

export const NOT_A_BUTTON: UseInsteadRule[] = [
  {
    use: "SSegmentControl",
    when: "The user chooses one item from a short list, and the items are all visible.",
  },
  { use: "SSwitch", when: "The user turns a setting on or off." },
  {
    use: "A <button> row with a plain icon inside",
    when: "The user can tap the full row.",
  },
  {
    use: "An empty <div> with a fixed size",
    when: "A layout needs a space. Do not use an invisible button.",
  },
];

/** When to use a variant. */
export interface VariantGuide {
  variant: ButtonVariant;
  role: string;
  use: string;
  example: string;
}

// A Record makes the type check fail when a new variant has no rule.
const VARIANT_RULES: Record<ButtonVariant, Omit<VariantGuide, "variant">> = {
  destructive: {
    example: "Delete expense, Turn off 2FA",
    role: "Confirm a destructive action",
    use: "The button that runs a destructive action in a confirm step. Use it only in a confirm step.",
  },
  "destructive-soft": {
    example: "Log out, Remove API key",
    role: "Start a destructive action",
    use: "The button that opens the confirm step of a destructive action. Also use it for an action that removes no data and has no confirm step, for example Log out.",
  },
  ghost: {
    example: "Back, Close, Mark all as read",
    role: "Light action",
    use: "An action in a header, a list row or a repeated item, or a Cancel beside the main action in a card or a row. It has no fill until it is pressed.",
  },
  outline: {
    example: "Copy codes in a tinted card",
    role: "Next action on a tinted surface",
    use: "Same rank as secondary. Use it on a tinted surface.",
  },
  primary: {
    example: "Add expense, Save, Settle up",
    role: "Main action",
    use: "The one action that moves the user forward. Use one on a screen. In a list, each item can have one primary when the item needs its own decision.",
  },
  secondary: {
    example: "Cancel, Skip, Scan receipt",
    role: "Next action on a plain surface",
    use: "The next action beside the main one, on a plain surface. On a tinted surface, use outline instead. It is also the default of SButton, SLinkButton and SButtonBase, when a button sets no `variant`. SIconButton has ghost as its default, because the user decided that icon buttons such as Close and More are not secondary.",
  },
};

export const VARIANT_GUIDE: VariantGuide[] = BUTTON_VARIANTS.map((variant) => ({
  variant,
  ...VARIANT_RULES[variant],
}));

/**
 * The emphasis ladder. Choose the rank first. The surface then chooses between `secondary` and `outline`.
 * The surface never changes the rank of an action.
 */
export interface EmphasisStep {
  variant: ButtonVariant;
  when: string;
}

export const EMPHASIS_LADDER: { intro: string; steps: EmphasisStep[] } = {
  intro:
    "Step 1: choose the rank of the action. Step 2: if the rank is next action, read the surface rule. It chooses between secondary and outline. Use one of the two in a group, not both.",
  steps: [
    { variant: "primary", when: "Main action." },
    { variant: "secondary", when: "Next action on a plain surface." },
    { variant: "outline", when: "Next action on a tinted surface." },
    {
      variant: "ghost",
      when: "Light action. The position decides this rank: a header, a list row, a repeated item, or a Cancel beside the main action in a card or a row. Do not use ghost at xl, except on number keys.",
    },
  ],
};

/** One background token that counts as a plain surface. Each ratio compares the fill of secondary with the surface. */
export interface PlainSurface {
  token: string;
  light: number;
  dark: number;
}

/** The test that decides a plain surface. The ratios are measured from `src/assets/color.css`. */
export const SURFACE_RULE: {
  intro: string;
  plain: PlainSurface[];
  tinted: string;
} = {
  intro:
    "Read the real background under the button. A surface is plain only when the token is in this list. Each row shows the contrast of the secondary fill on that token.",
  plain: [
    { dark: 1.33, light: 1.21, token: "base-bg-primary" },
    { dark: 1.33, light: 1.2, token: "base-bg-secondary_alt" },
    { dark: 1.34, light: 1.2, token: "core-alpha-brand-5" },
  ],
  tinted:
    "Every other surface is tinted. For example: base-bg-secondary, base-bg-brand, core-alpha-brand-10, util-alpha-black-5, all util-color tokens, gradients and photos.",
};

/** When to use a size step. */
export interface SizeGuide {
  size: ButtonSize;
  use: string;
}

// A Record makes the type check fail when a new size has no rule.
const SIZE_RULES: Record<ButtonSize, string> = {
  md: "The default. A header icon button, the action of a single card, and a form submit button in a card.",
  sm: "A chip, an action in a dense row, the action of each card in a group of cards, and an `outline` action in a Notice.",
  xl: "The action area of a screen or a sheet, number keys and floating buttons.",
};

export const SIZE_GUIDE: SizeGuide[] = BUTTON_SIZES.map((size) => ({
  size,
  use: SIZE_RULES[size],
}));

/** One step of the size decision. */
export interface SizeDecisionStep {
  size: ButtonSize;
  when: string;
}

/**
 * Choose a size with these steps. Read them in order, and use the first step that matches.
 * The word "card" does not decide a size. The position of the button and the density around it decide the size.
 */
export const SIZE_DECISION: { steps: SizeDecisionStep[]; limit: string } = {
  limit:
    "The one main action of a screen is never smaller than md. If a step says sm for this action, use md. A primary on a repeated item is not the main action of the screen.",
  steps: [
    {
      size: "xl",
      when: "The button is in the action area. The action area is the last block of a screen or a sheet, and it holds only buttons. All buttons in the area use xl. NotificationSheet is the one exception, as `HEADER_RULES` in `notification.usage.ts` says.",
    },
    { size: "xl", when: "The button is a number key or a floating button." },
    {
      size: "sm",
      when: "The button is inside a search field. The field of HomeSearchBar is not as high as a md button, so a md button does not fit in it.",
    },
    {
      size: "md",
      when: "The button is in the header of the screen, or in a search row that belongs to the header.",
    },
    { size: "sm", when: "The button is a chip." },
    { size: "sm", when: "The button is an `outline` action in a Notice. See `notice.usage.ts`." },
    {
      size: "sm",
      when: "The button shares a row with text, data or a control that is not a button. Another button in the same group does not count.",
    },
    {
      size: "sm",
      when: "The screen shows several cards side by side or in a list, and each card has its own button.",
    },
    { size: "md", when: "No other step matches. This is the default." },
  ],
};

export const GROUP_RULES: UsageRule[] = [
  { rule: "In a stack, put the main action on top.", title: "Stack" },
  { rule: "In a row, put the main action on the right.", title: "Row" },
  { rule: "All buttons in a group use the same size.", title: "One size" },
  {
    rule: "A group uses secondary or outline, not both.",
    title: "One language",
  },
];

export const FULL_WIDTH_RULES: UsageRule[] = [
  {
    rule: "An xl button fills its action area. Number keys and floating buttons do not.",
    title: "xl",
  },
  {
    rule: "md and sm buttons fit their content. A form submit button in a card fills the card.",
    title: "md and sm",
  },
];

/** What to do when a label is long. The limits are in the "Keep it short" rule of `COPY_RULES`. */
export const LABEL_FIT_RULES: UsageRule[] = [
  {
    rule: "A label stays on one line. Fixed copy must fit, and must not end with an ellipsis.",
    title: "One line",
  },
  {
    rule: "Shorten the label. Put more detail in the text near the button, not in the label.",
    title: "Too long",
  },
  {
    rule: "If a label does not fit in a row at 375px wide, stack the group. Do not make the text smaller.",
    title: "Row",
  },
  {
    rule: "The rules apply to each locale. Check each translation at 375px wide.",
    title: "Translations",
  },
  {
    rule: "Only a label with user data, for example a person's name, can end with an ellipsis.",
    title: "User data",
  },
];

export const ICON_RULES: UsageRule[] = [
  {
    rule: "Put an icon in the icon-left or icon-right slot. Do not put it in the default slot.",
    title: "Slots",
  },
  {
    rule: "Do not add a size, color or margin class to the icon. The button sets these values.",
    title: "No extra classes",
  },
  {
    rule: "HeaderMobileSecondary sets `--s-button-ghost-icon` to `--base-fg-brand`, so each ghost icon button in that header has a brand icon. Do not set this property in another component without a decision of the user.",
    title: "Header icons",
  },
  {
    rule: "The filter button in the home search field is a ghost sm button with a brand icon and a translucent brand fill. The fill uses the `comp-search-filter-*` tokens through `--s-button-ghost-bg` and its `-hover` and `-pressed` forms. Do not put a `bg-*` class on the button: it paints the square root box, not the round button. Use `HOME_FILTER_BUTTON_CLASS` from `src/pages/HomePage/home-filter-button.ts`, and do not copy the classes. The clear button in the same field stays a plain ghost button. Do not copy this look to another button without a decision of the user.",
    title: "Search filter",
  },
  {
    rule: "Put a forward arrow and an expand arrow on the right. Put all other icons on the left.",
    title: "Side",
  },
  {
    rule: "The bell in the home header uses text-util-color-brand-700, to match the Splitz wordmark in the same row.",
    title: "Exception",
  },
];

export const LOADING_RULES: UsageRule[] = [
  {
    rule: "Set only loading on the button that does the work. The button then blocks taps.",
    title: "Loading",
  },
  {
    rule: "Do not set disabled and loading for the same work. A disabled button turns grey, so the loading button loses its colors.",
    title: "Not both",
  },
  {
    rule: "Set disabled on the other buttons of the group while the work runs.",
    title: "Other buttons",
  },
];

export const COPY_RULES: CopyRule[] = [
  {
    do: ["Add expense", "Settle up"],
    dont: ["Add Expense", "ADD EXPENSE"],
    rule: "Capitalize only the first word and names. The locale files use the same rule.",
    title: "Sentence case",
  },
  {
    do: ["Delete expense", "Invite friends"],
    dont: ["Deletion", "Friends"],
    rule: "Say what happens when the user taps. Put the verb first.",
    title: "Start with a verb",
  },
  {
    do: ["Save", "Scan receipt"],
    dont: ["Click here to save your changes", "与群组内所有人结清全部账单"],
    rule: "English: 1 to 3 words, about 20 characters. Chinese and Japanese: 2 to 6 characters.",
    title: "Keep it short",
  },
  {
    do: ["Delete expense", "Turn off"],
    dont: ["OK", "Yes"],
    rule: "In a confirm step, repeat the action. A bare OK makes the user read the question again.",
    title: "Name the result",
  },
  {
    do: ["Save", "Done"],
    dont: ["Save.", "Done!"],
    rule: "No period, exclamation mark or emoji in a label.",
    title: "No end punctuation",
  },
  {
    do: ["添加账单", "删除账单"],
    dont: ["添加 账单", "删除账单。"],
    rule: "Chinese labels have no spaces between words and no full stop.",
    title: "Chinese labels",
  },
  {
    do: ["Save (with a spinner)"],
    dont: ["Saving…", "Please wait"],
    rule: "The spinner shows the progress. Keep the label, so the width and the meaning do not change.",
    title: "Loading keeps the label",
  },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES = [
  {
    text: "Every step is at least 44px × 44px to a finger. An invisible box around small buttons adds the missing space.",
    title: "Tap area",
  },
  {
    text: "A ring shows when the user moves focus with an external keyboard or a switch control. A tap does not show it. VoiceOver and TalkBack draw their own focus box.",
    title: "Focus ring",
  },
  {
    text: "The press scale and the color fades turn off when the system asks for reduced motion. The spinner keeps turning, because it shows that work is in progress.",
    title: "Reduced motion",
  },
  {
    text: "An icon button has no visible text. Give it an aria-label that names the action, for example “Close”.",
    title: "Icon buttons",
  },
  {
    text: "A loading button keeps focus and sets aria-busy, so a screen reader does not lose its place.",
    title: "Loading",
  },
  {
    text: "Hover colors apply only on devices that can hover, so a tap on a phone does not leave a stuck hover color.",
    title: "No stuck hover",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "Can secondary replace outline on some tinted surfaces? The translucent fill of secondary has a contrast of 1.19 or more on core-alpha-brand-10, base-bg-brand and base-bg-secondary in both themes. The user will decide later. Keep the surface rule and the current buttons until then.",
  "Does a floating button count as the one primary of a screen? GroupDetailPage shows a floating button and a primary Settle up. HomePage shows a floating button and a primary in the empty state, and both start the same action. The user will decide later. Do not change these buttons until then.",
];
