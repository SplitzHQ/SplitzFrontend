/**
 * The usage rules of CategoryIcon, CategoryText and the category maps. This file is the one place for these rules.
 * The design-system Category page renders them, and agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import type { AccessibilityNote, RuleScope, UsageRule } from "../usage-rules";

/** The parts that the folder exports. */
export type CategoryPart = "CategoryIcon" | "CategoryText" | "categoryColorMap" | "categoryIconMap";

/** One size of the category tile that the app uses today. */
export interface CategoryTileUse {
  place: string;
  box: string;
  radius: string;
  icon: string;
}

/** Where the rules apply. */
export const RULE_SCOPE: RuleScope = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "These rules apply: where the color and the icon come from, and the accessibility notes.",
    "When a rule does not decide a devtools case, choose and continue. Do not stop to ask, and do not add the choice to this file.",
  ],
};

/** Which part to use. */
export const PART_RULES: Record<CategoryPart, UsageRule> = {
  CategoryIcon: {
    rule: "The icon of a subcategory. Set the size on it or on its parent with an `icon-*` class.",
    title: "An icon",
  },
  CategoryText: {
    rule: "The translated name of a subcategory, in a span.",
    title: "A name",
  },
  categoryColorMap: {
    rule: "The fill and the icon color of a main category, as Tailwind classes. Get the main category with `getMainCategory`. Do not write these color classes in a screen.",
    title: "A color",
  },
  categoryIconMap: {
    rule: "The icon component of each subcategory. Use CategoryIcon in a template. The type check fails when a new subcategory has no icon.",
    title: "An icon map",
  },
};

/** How the colors are chosen. These rules describe the map. */
export const COLOR_RULES: UsageRule[] = [
  {
    rule: "The fill uses `comp-palette-<family>-fill` and the icon uses `comp-palette-<family>-icon` of one family. The generator gives the fill the 50 step and the icon the 600 step. This pair is at least 3:1 (WCAG 1.4.11) for all main categories in both themes.",
    title: "Steps",
  },
  {
    rule: "The app has 13 different hues for 19 main categories, so six pairs share a family. A pair must have a related meaning: transport and travel, shopping and gifts_donations, health and sports_fitness, insurance and taxes, home and bills, fees_charges and other.",
    title: "Shared colors",
  },
];

/** How the icons are chosen. These rules describe the map. */
export const ICON_RULES: UsageRule[] = [
  {
    rule: "`PhQuestion` is the icon of `uncategorized` and of each `other_*` bucket. Do not use it as a placeholder for a named subcategory. A test checks this.",
    title: "Question mark",
  },
  {
    rule: "Two subcategories of one main category do not share an icon, because the select sheet shows them in one section. Insurance is the exception: the shield is the meaning of that category. A test checks this.",
    title: "Repeats",
  },
  {
    rule: '`fuel` is gasoline and charging: `PhGasPump`, "Gas & charging". `gas_utility` is natural gas at home: `PhFlame`, "Natural gas". Keep the two apart in the icon and in the name.',
    title: "Gas",
  },
  {
    rule: '`tv_streaming` in bills is cable and satellite TV: `PhTelevision`, "Cable & satellite TV". `streaming_subscriptions` in entertainment is apps such as video and music services: `PhMonitorPlay`, "Streaming subscriptions". Keep the two apart in the icon and in the name.',
    title: "TV",
  },
  {
    rule: 'Two subcategories must not have the same name, and a name must not fit two subcategories. Name the one with the narrow meaning for that meaning: "Textbooks" in education and "Books & media" in entertainment. "Study supplies" in education, "Kids\' school supplies" in kids and "Office supplies" in shopping.',
    title: "Names",
  },
  {
    rule: "Read a value from the backend with `getCategory` and `getMainCategory`. An unknown value gives `uncategorized` and `other`, so the icon and the color always exist. An old key from a merge gives its new key. The list of old keys is `legacySubcategoryAliases` in `src/libs/categories.ts`.",
    title: "Unknown values",
  },
];

/** The tiles that the app builds today. There is no shared tile. See the open questions. */
export const TILE_USES: CategoryTileUse[] = [
  { box: "48px", icon: "28px", place: "TransactionItemContent", radius: "12px" },
  { box: "48px", icon: "24px", place: "AddExpenseDetailsSheet", radius: "12px" },
  { box: "64px", icon: "32px", place: "TransactionDetailPage", radius: "16px" },
  { box: "Column width", icon: "36px", place: "SelectCategorySheet", radius: "16px" },
];

/** Accessibility rules that the component follows, written for the people who use it. */
export const ACCESSIBILITY_NOTES: AccessibilityNote[] = [
  {
    text: "CategoryIcon has `aria-hidden`, because every current use has a name beside the icon or on the parent button. A button with only the icon needs an `aria-label`, as AddExpenseDetailsSheet has.",
    title: "Icon",
  },
  {
    text: "Do not use color alone to show a category. Colors repeat, so the icon and the name identify the category.",
    title: "Color",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS = [
  "Should the tile be one shared component? Four screens build it, and the table above shows the sizes.",
];
