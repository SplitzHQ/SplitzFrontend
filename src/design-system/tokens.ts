/**
 * Token registry for the design-system page.
 *
 * The CSS files are the source of truth for token names and values. This registry only sorts the tokens into groups
 * and says what each group is for. The page reads the values from the live CSS, so it cannot drift from the app.
 * The tests in `__tests__/tokens.spec.ts` check that each token in the CSS falls into exactly one group.
 */

/** The token files that the registry covers. The keys are file names under `src/assets/`. */
export type TokenFile = "color.css" | "motion.css";

/** One group of tokens with the same role. */
export interface TokenGroup {
  id: string;
  title: string;
  /** Primitive tokens hold literal values. The other layers point to primitives. */
  layer: "primitive" | "semantic" | "utility" | "component" | "motion";
  /** Tells the page how to draw a preview of each token. */
  kind: "color" | "duration" | "easing" | "number";
  file: TokenFile;
  /** Matches the names of the tokens in this group. */
  pattern: RegExp;
  summary: string;
}

export const TOKEN_GROUPS: TokenGroup[] = [
  {
    file: "color.css",
    id: "core-color",
    kind: "color",
    layer: "primitive",
    pattern: /^--core-color-/,
    summary:
      "Raw color scales from 25 (lightest) to 950 (darkest). The only tokens with literal colors. They do not change in dark mode.",
    title: "Core color scales",
  },
  {
    file: "color.css",
    id: "core-alpha",
    kind: "color",
    layer: "primitive",
    pattern: /^--core-alpha-/,
    summary: "Transparent versions of the core colors, from 0% to 100% opacity. Use them for overlays and tints.",
    title: "Core alpha scales",
  },
  {
    file: "color.css",
    id: "core-mono",
    kind: "color",
    layer: "primitive",
    pattern: /^--(white|black)$/,
    summary: "Pure white and pure black.",
    title: "White and black",
  },
  {
    file: "color.css",
    id: "base-text",
    kind: "color",
    layer: "semantic",
    pattern: /^--base-text-/,
    summary: "Text colors. Use them with text-* classes, for example text-base-text-primary.",
    title: "Text",
  },
  {
    file: "color.css",
    id: "base-fg",
    kind: "color",
    layer: "semantic",
    pattern: /^--base-fg-/,
    summary: "Foreground colors for icons and other marks that are not text.",
    title: "Foreground",
  },
  {
    file: "color.css",
    id: "base-border",
    kind: "color",
    layer: "semantic",
    pattern: /^--base-border-/,
    summary: "Border and divider colors.",
    title: "Border",
  },
  {
    file: "color.css",
    id: "base-bg",
    kind: "color",
    layer: "semantic",
    pattern: /^--base-bg-/,
    summary: "Surface colors: page, cards, buttons and overlays. _hover and _pressed are the interaction states.",
    title: "Background",
  },
  {
    file: "color.css",
    id: "util-color",
    kind: "color",
    layer: "utility",
    pattern: /^--util-color-/,
    summary: "Color scales that flip in dark mode: step 50 is light in the light theme and dark in the dark theme.",
    title: "Utility color scales",
  },
  {
    file: "color.css",
    id: "util-alpha",
    kind: "color",
    layer: "utility",
    pattern: /^--util-alpha-/,
    summary: "Alpha scales that flip in dark mode: white becomes near-black and black becomes white.",
    title: "Utility alpha scales",
  },
  {
    file: "color.css",
    id: "comp",
    kind: "color",
    layer: "component",
    pattern: /^--comp-/,
    summary: "Colors that belong to one component.",
    title: "Component colors",
  },
  {
    file: "motion.css",
    id: "motion-duration",
    kind: "duration",
    layer: "motion",
    pattern: /^--motion-duration-/,
    summary: "How long a transition lasts. Each token names a role. All of them become 0 under reduced motion.",
    title: "Durations",
  },
  {
    file: "motion.css",
    id: "motion-easing",
    kind: "easing",
    layer: "motion",
    pattern: /^--motion-easing-/,
    summary: "How a transition speeds up and slows down.",
    title: "Easing curves",
  },
  {
    file: "motion.css",
    id: "motion-slow",
    kind: "number",
    layer: "motion",
    pattern: /^--motion-slow$/,
    summary: "Slow-motion factor for debugging. Every duration is multiplied by it. Normal speed is 1.",
    title: "Slow motion",
  },
];

/** Returns the custom property names that a style sheet declares, in source order, each name one time. */
export function declaredTokens(css: string): string[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const names = [...withoutComments.matchAll(/(?:^|[{;\s])(--[\w-]+)\s*:/g)].map((match) => match[1]);
  return [...new Set(names)];
}

/** Returns the groups whose pattern matches a token name. A valid token matches exactly one group. */
export function groupsOf(token: string): TokenGroup[] {
  return TOKEN_GROUPS.filter((group) => group.pattern.test(token));
}

/**
 * Returns the body of the first rule block whose selector matches exactly, for example `:root` or `.dark`.
 * Returns undefined when the style sheet has no such block. The block must not contain nested blocks.
 */
export function ruleBody(css: string, selector: string): string | undefined {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^{}]*)\\}`, "m"))?.[1];
}

/** Returns each `--name: value` declaration of a rule body as [name, value] pairs. */
export function declarations(body: string): [name: string, value: string][] {
  return [...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]);
}

/**
 * The Tailwind type scale, in the order of `theme.fontSize` in `tailwind.config.js`.
 * The class names are written in full so that Tailwind generates them. The tests check that the keys match the config.
 */
export const TYPE_SCALE = [
  { className: "text-xs", key: "xs" },
  { className: "text-sm", key: "sm" },
  { className: "text-base", key: "base" },
  { className: "text-md", key: "md" },
  { className: "text-lg", key: "lg" },
  { className: "text-lg-doc", key: "lg-doc" },
  { className: "text-xl", key: "xl" },
  { className: "text-display-xs", key: "display-xs" },
  { className: "text-display-sm", key: "display-sm" },
  { className: "text-display-md", key: "display-md" },
  { className: "text-display-lg", key: "display-lg" },
  { className: "text-display-xl", key: "display-xl" },
  { className: "text-display-2xl", key: "display-2xl" },
] as const;

/** The font weights that Manrope loads (200 to 800) and that the app uses. */
export const FONT_WEIGHTS = [
  { className: "font-normal", key: "normal" },
  { className: "font-medium", key: "medium" },
  { className: "font-semibold", key: "semibold" },
  { className: "font-bold", key: "bold" },
] as const;

/** Common steps of the Tailwind spacing scale. One step is `--spacing` (4px). Use them with flex and grid gap. */
export const SPACING_SCALE = [
  { className: "w-0.5", key: "0.5" },
  { className: "w-1", key: "1" },
  { className: "w-1.5", key: "1.5" },
  { className: "w-2", key: "2" },
  { className: "w-3", key: "3" },
  { className: "w-4", key: "4" },
  { className: "w-5", key: "5" },
  { className: "w-6", key: "6" },
  { className: "w-8", key: "8" },
  { className: "w-10", key: "10" },
  { className: "w-12", key: "12" },
  { className: "w-16", key: "16" },
] as const;

/**
 * The radius steps that the app uses. `05xl` comes from `theme.extend.borderRadius` in `tailwind.config.js`.
 * The others are Tailwind defaults. The tests check that each key in the config extension is listed here.
 */
export const RADIUS_SCALE = [
  { className: "rounded-sm", key: "sm" },
  { className: "rounded-md", key: "md" },
  { className: "rounded-lg", key: "lg" },
  { className: "rounded-xl", key: "xl" },
  { className: "rounded-05xl", key: "05xl" },
  { className: "rounded-2xl", key: "2xl" },
  { className: "rounded-3xl", key: "3xl" },
  { className: "rounded-full", key: "full" },
] as const;

/** The z-index layers from `theme.extend.zIndex` in `tailwind.config.js`, from low to high. */
export const Z_INDEX_SCALE = [
  { className: "z-dropdown", key: "dropdown" },
  { className: "z-sticky", key: "sticky" },
  { className: "z-fixed", key: "fixed" },
  { className: "z-offcanvasBackdrop", key: "offcanvasBackdrop" },
  { className: "z-offcanvas", key: "offcanvas" },
  { className: "z-modalBackdrop", key: "modalBackdrop" },
  { className: "z-modal", key: "modal" },
  { className: "z-popover", key: "popover" },
  { className: "z-tooltip", key: "tooltip" },
  { className: "z-toast", key: "toast" },
] as const;
