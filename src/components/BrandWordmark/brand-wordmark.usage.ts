/**
 * The usage rules of the logo components in this folder. This file is the one place for these rules.
 * Agents read them through the `spz-component-use` skill. The brand rules (the parts of the logo, the colors, the clear
 * space, the minimum size, the misuse, the app icons and the principles of the motion) are in `brand.usage.ts`.
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
  auth: "No page uses this size now. AuthShell shows `BrandTapMark` in its place.",
  header: "`BrandHomeLogo`, on HomePage. No other page uses this size now, but prototypes do.",
  hero: "A splash page or a landing page. The app has no such page now, so no page uses this size.",
};

export const SIZE_GUIDE: WordmarkSizeGuide[] = WORDMARK_SIZES.map((size) => ({ size, use: SIZE_RULES[size] }));

/** When to use each component of this folder. */
export const COMPONENT_RULES = {
  BrandHomeLogo:
    "The header of HomePage only. It is `BrandTapLogo`, and `scrub()` changes it to the 18px glyph with the progress of the header collapse. The parent calls `scrub()`, so the logo moves with the search field.",
  BrandOpening:
    "`App.vue` only. It covers the screen once for each run of the app, over the first page of that run: HomePage, the sign-in page or a page from a link. The opening belongs to the start of the app, not to a page. Do not put it in a page, because a cold start on another page then has no opening. The user decided this on 2026-11-07, when a cold start on the sign-in page showed no opening.",
  BrandTapLogo: "Inside `BrandHomeLogo` only. It is `BrandWordmark` with the tap motion.",
  BrandTapMark:
    "AuthShell only. It rests as the glyph alone. A tap plays the small motion, shows the whole word next to the mark, and goes back to the glyph. The user asked for this after the prototype `2026-11-04-sign-in-flow`.",
  BrandWordmark:
    "Each surface that shows the logo and is not the header of HomePage. It shows only the word. The user compared the word alone with the glyph and the word in the prototype `2026-11-04-wordmark-split-glyph`, and picked the word alone. The diamond on the i is the brand shape.",
};

/**
 * The rules for the motion in the components. The principles are in `brand.usage.ts`, and the values are in
 * `brand-motion.ts`.
 */
export const MOTION_RULES = [
  "A tap during the motion does nothing.",
  "`BrandHomeLogo` builds the relay to the glyph once, paused, and `scrub()` sets its time. A scroll back moves the same relay backward. While the glyph shows, a tap does nothing, because the tap motion needs the letters.",
  "Each part of the glyph in `BrandHomeLogo` is its own `<svg>`, because a transform on a shape inside an `<svg>` needs a layout on each frame.",
  "The word next to the glyph has one em of the size of the mark, the same ratio as the mark on the word in `BrandTapLogo`. It takes no layout space, so the page does not move.",
  "The diamond on the word has its own `data-part`, so each list of steps must say where the diamond goes.",
  "After a tap on the word, the diamond leaves with the i. It comes back last: a small circle grows into a square, and the square turns 45 degrees. It has no drop and no fade, because the user found them too heavy or wrong in the prototype `2026-11-04-wordmark-split-glyph`. The times are `TITTLE_TIMING`.",
  "A `<rect>` draws the diamond while it forms, and it ends on the place of the path. If the diamond of the word moves, generate `WORDMARK_TITTLE` and `WORDMARK_TITTLE_SHAPE` together. A test checks that they agree.",
  "The opening plays after each cold start of the app: a new run of the JavaScript. It does not play when a person returns from another page, or from another app while this app is still alive. In the dev server, it does not play after a hot update, because `claimOpening` keeps its flag in `import.meta.hot.data`.",
  "A full-screen layer gives its color to the status bar through `holdStatusBarColor`. Do not set this color in another way.",
];

/** The rules for the look of the logo. */
export const LOOK_RULES = [
  "Use this component each time that a page shows the brand name as a logo.",
  "`BrandWordmark` sets the logo color, so do not set a color class on it. `BrandTapMark` takes the color of its class: give it `text-util-color-brand-700`. The colorways are in `brand.usage.ts`.",
  "Do not set a width or a height with a class. Use the `size` prop, so that each surface keeps its chosen size.",
];

/** The rules for the word in the logo. */
export const WORD_RULES = [
  "The logo needs no font. It never shows a fallback font, and it does not move when Manrope loads.",
  "The paths in `brand-wordmark.ts` are generated. To change the word, change the choices in the prototype and generate the paths again. Do not edit a path by hand.",
  "The tip of the diamond goes above the SVG box. Keep `overflow-visible` on the SVG, and do not put a clip around the logo.",
];

/** The accessibility rules. */
export const ACCESSIBILITY_NOTES = [
  'The SVG has role="img" and the accessible name Splitz. Do not add a second text with this name next to the logo.',
  "On a page that uses the brand name as its h1, put the logo inside the h1. HomePage does this.",
  "The collapsed glyph of `BrandHomeLogo` is hidden from assistive technology. The button keeps the name Splitz in both states.",
  "`BrandTapLogo` is a button with the name Splitz inside the h1. Its tap area is more than 44px high, and the area grows outside the button so that the header keeps its height.",
  "`BrandOpening` is hidden from assistive technology, because the page under it is already there.",
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS: string[] = [];
