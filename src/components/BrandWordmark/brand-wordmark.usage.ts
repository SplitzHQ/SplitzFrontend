/**
 * The usage rules of BrandWordmark. This file is the one place for these rules.
 * Agents read them through the `spz-component-use` skill.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import { WORDMARK_SIZES, type WordmarkSize } from "./brand-wordmark";

/** Where the rules apply. */
export const RULE_SCOPE = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "A prototype that compares logos shows options on purpose. No rule applies to it.",
    "When a rule does not decide a devtools logo, choose and continue. Do not add the choice to this file.",
  ],
};

/** When to use each logo size. */
export interface WordmarkSizeGuide {
  size: WordmarkSize;
  use: string;
}

// A Record makes the type check fail when a new size has no rule.
const SIZE_RULES: Record<WordmarkSize, string> = {
  auth: "The header of AuthShell, on sign-in and account pages.",
  header: "The header of HomePage.",
  hero: "A splash page or a landing page. The app has no such page now, so no page uses this size.",
};

export const SIZE_GUIDE: WordmarkSizeGuide[] = WORDMARK_SIZES.map((size) => ({ size, use: SIZE_RULES[size] }));

/** The rules for the look of the logo. */
export const LOOK_RULES = [
  "Use this component each time that a page shows the brand name as a logo. Do not write the word as text in a heading or a span.",
  "Do not change the color. The component uses `util-color-brand-700`, and the dark theme gives this token a light value.",
  "Do not set a width or a height with a class. Use the `size` prop, so that each surface keeps its chosen size.",
  "Use the name Splitz in a sentence as usual text. These rules apply only to the logo.",
];

/** The rules for the word in the logo. */
export const WORD_RULES = [
  "The word is live text in Manrope 600, and `src/assets/base.css` loads this font. The user chose live text and not outlines.",
  "The browser shows a fallback font until Manrope loads. The size of the logo does not change.",
  "The positions in `brand-wordmark.ts` are correct only for Manrope 600. Measure them again in the prototype if the font changes.",
];

/** The rules for the glyph file. */
export const GLYPH_RULES = [
  "`brand-glyph.ts` holds the shape of the glyph and the two brand colors. BrandWordmark uses the shape.",
  "Two prototypes import `brand-glyph.ts`, so keep its exports when you change BrandWordmark.",
  "`public/favicon.svg` and the PNG icons use the same shape. If you change the numbers in `brand-glyph.ts`, change these icons too.",
];

/** The accessibility rules. */
export const ACCESSIBILITY_NOTES = [
  'The SVG has role="img" and the accessible name Splitz. Do not add a second text with this name next to the logo.',
  "On a page that uses the brand name as its h1, put the logo inside the h1. HomePage does this.",
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS: string[] = [];
