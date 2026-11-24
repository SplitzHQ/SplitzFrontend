/**
 * Usage rules for the `BrandWordmark` component family. See `brand.usage.ts` for logo geometry, colorways, app icons,
 * and motion principles.
 * Agents read this file through the `spz-component-use` skill; app code never imports it, so it stays out of the
 * production bundle.
 */
import { WORDMARK_SIZES, type WordmarkSize } from "./brand-wordmark";

/** Environments where the rules in this file apply. */
export const RULE_SCOPE = {
  app: "All rules in this file apply to `src/`.",
  devtools: [
    "Prototypes that compare logo options intentionally break these rules.",
    "When a rule does not cover a devtools logo case, pick what fits the tool without adding the choice here.",
  ],
};

/** Guidance for when to use a `WordmarkSize` preset. */
export interface WordmarkSizeGuide {
  size: WordmarkSize;
  use: string;
}

// Using `Record` causes a type error whenever a new `WordmarkSize` is added without a usage rule.
const SIZE_RULES: Record<WordmarkSize, string> = {
  auth: "Unused in `src/` right now (`AuthShell` renders `BrandTapGlyph` instead).",
  header: "Used by `BrandHomeLogo` in the `HomePage` header, and by header previews in prototypes.",
  hero: "Reserved for splash or landing screens (no screen in `src/` uses it yet).",
};

/** Ordered usage guide for every `WordmarkSize` preset. */
export const SIZE_GUIDE: WordmarkSizeGuide[] = WORDMARK_SIZES.map((size) => ({ size, use: SIZE_RULES[size] }));

/** When to use each component in `src/components/BrandWordmark/`. */
export const COMPONENT_RULES = {
  BrandAnimatedGlyphParts:
    "Internal helper used by `BrandOpeningOverlay`, `BrandTapWordmark`, and `BrandTapGlyph`. Renders bare `<circle>`, `<path>`, and `<rect>` elements inside an existing glyph `<svg>`. Do not mount directly on a page.",
  BrandHomeLogo:
    "`HomePage` header only. Exposes `scrub(progress)` (`0..1`) so the collapsing header can scrub smoothly between the resting wordmark and the 18px standalone glyph.",
  BrandOpeningOverlay:
    "`HomePage` only. Plays the full-screen brand opening overlay once per cold app start. Mount it on a single page because the first mount consumes the session's only play.",
  BrandTapGlyph:
    "`AuthShell` only. Rests as the standalone glyph; tapping reassembles the glyph, briefly reveals the `" +
    'Splitz" wordmark beside it, and returns to the glyph alone.',
  BrandTapWordmark:
    "`HomePage` header only. Use inside `BrandHomeLogo`. Wraps `BrandWordmark` in a button that plays the tap animation.",
  BrandWordmark:
    "Every surface outside `HomePage`'s header and `AuthShell` that displays the brand wordmark. Shows the `" +
    'Splitz" wordmark outlines with the diamond tittle on the `i`, without a leading glyph.',
};

/** Behavioral rules for the brand animations defined in `brand-motion.ts`. */
export const MOTION_RULES = [
  "`BrandHomeLogo` scrubs a single paused Web Animations timeline forward and backward as the header collapses or expands, and disables wordmark tap animations while `progress > 0`.",
  "`BrandTapWordmark` and `BrandTapGlyph` animate only when tapped, and ignore extra taps until the active animation finishes.",
  "In `BrandTapGlyph`, the revealed wordmark uses `1em` equal to the glyph height (matching the glyph-to-em ratio in `BrandTapWordmark`) and sits out of flow (`position: absolute`) so the page layout never shifts.",
  'The diamond tittle above the `i` has its own `data-part="tittle"`, so every wordmark animation sequence must explicitly include a step for `tittle`.',
  "When `BrandTapWordmark` is tapped, `tittle` exits alongside `letter-3` (`i`) and returns last via `tittle-morph`: a small circle pops in, expands into a sharp square, and rotates 45° into the diamond (`TITTLE_TIMING`), with no vertical drop or fade.",
  'A `<rect data-part="tittle-morph">` draws the morphing tittle and finishes on the exact bounds of `WORDMARK_TITTLE`. Always regenerate `WORDMARK_TITTLE` and `WORDMARK_TITTLE_GEOMETRY` together; a unit test verifies they match.',
  "`BrandOpeningOverlay` plays once per cold start (each fresh execution of the JavaScript bundle). Navigating back to `HomePage` or returning from the background while the SPA stays in memory does not replay it.",
  "`BrandOpeningOverlay`, `BrandTapWordmark`, and `BrandTapGlyph` all share `buildGlyphAssemblySteps` and differ only in `durationScale`. Update glyph assembly choreography in one place so all three stay consistent.",
  "When reduced motion is enabled, `BrandOpeningOverlay` does not render and tapping `BrandTapWordmark` or `BrandTapGlyph` does nothing.",
  "`BrandOpeningOverlay` sets `pointer-events-none` over the already-mounted page so it never blocks user input.",
  "`BrandOpeningOverlay` syncs the phone status bar color via `holdStatusBarColor`. Do not set the status bar color manually.",
];

/** Visual rules for rendering the logo. */
export const LOOK_RULES = [
  "Use a `BrandWordmark` component whenever displaying Splitz as a visual brand logo. Do not render the logo as plain HTML text in a heading or `<span>`.",
  "Keep the default `text-util-color-brand-700` color token, which adapts automatically in dark mode.",
  "Control wordmark dimensions exclusively through the `size` prop instead of custom CSS `width` or `height` classes.",
  'Write "Splitz" as ordinary text when the brand name appears inside a prose sentence.',
];

/** Typography and SVG rules for `brand-wordmark.ts`. */
export const WORD_RULES = [
  "The wordmark outlines come from Manrope SemiBold (600) with the `i`'s circular dot replaced by the Splitz glyph diamond.",
  "Because all letters are pre-built SVG paths, the wordmark requires no web font download and never flashes a fallback font or shifts when Manrope loads.",
  "Paths in `brand-wordmark.ts` are generated. Regenerate them instead of hand-editing path coordinates.",
  "The top tip of the `i`'s diamond extends above `WORDMARK_LAYOUT.box.y`. Always keep `overflow-visible` on the `<svg>` and avoid clipping ancestors.",
];

/** Geometry maintenance rules for `brand-glyph.ts`. */
export const GLYPH_RULES = [
  "`brand-glyph.ts` is the single source of truth for the glyph paths, square diamond metrics (`BRAND_GLYPH_DIAMOND_SQUARE`), and brand hex colors (`BRAND_COLOR`, `LIGHT_COLOR`).",
  "Devtools prototypes import `brand-glyph.ts`, so preserve `BRAND_GLYPH`, `BRAND_COLOR`, and `LIGHT_COLOR` exports.",
  "If `BRAND_GLYPH.diamond` changes, update `BRAND_GLYPH_DIAMOND_SQUARE` in `brand-glyph.ts` as well (checked by unit tests).",
  "`public/favicon.svg` and generated PNG app icons share the same `BRAND_GLYPH` geometry; regenerate icons whenever `BRAND_GLYPH` changes.",
];

/** Accessibility requirements enforced by the brand components. */
export const ACCESSIBILITY_NOTES = [
  '`BrandWordmark` sets `role="img"` and `aria-label="Splitz"`. Do not place duplicate screen-reader text beside it.',
  "When a screen uses the brand logo as its primary page heading (such as `HomePage`), wrap `BrandHomeLogo` inside the `<h1>`.",
  '`BrandTapWordmark` renders a `<button>` named "Splitz" inside `HomePage`\'s `<h1>`, with an invisible `::after` hit area taller than 44px so the header bar keeps its compact height.',
  '`BrandOpeningOverlay` sets `aria-hidden="true"` because the interactive page underneath is already present in the accessibility tree.',
];

/**
 * Unresolved design questions. Ask the user before relying on behavior affected by an open question, then move the
 * decision into the rules above and remove the question.
 */
export const OPEN_QUESTIONS: string[] = [];
