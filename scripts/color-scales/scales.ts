import type { SemanticToken } from "@/assets/color.usage";

import { colorAtContrast, hexToOklch, oklchToHex } from "./color-math";

/**
 * The color scales of the app. Each scale has 12 steps for each theme, and each step has one job in both themes.
 * Each value stays on the curve of the `core-color-*` family, so a family keeps its hue. The position on the curve comes
 * from a target contrast on the page. The design decisions are in the prototype "Color token review".
 */

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

/** The steps of a `core-color-*` family, from light to dark. */
export const CORE_STEPS = ["25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;

/** The scales in `color.css`. The names of the families are the names of the `core-color-*` families. */
export const SCALE_FAMILIES = {
  brand: "brand",
  error: "error",
  neutral: "grey",
  success: "success",
  warning: "warning",
};
export type ScaleName = keyof typeof SCALE_FAMILIES;

/**
 * The target contrast of each neutral step on the page.
 * Step 8 holds the placeholder and the disabled text. Step 9 holds text-muted, step 10 holds text-secondary and step 12
 * holds text-primary. Step 9 is below the 4.5:1 of WCAG AA. This is a design decision.
 */
const NEUTRAL_TARGETS: Record<Theme, readonly number[]> = {
  dark: [1, 1.16, 1.28, 1.4, 1.55, 1.7, 1.9, 3.3, 4.7, 8.4, 10.5, 16.6],
  light: [1, 1.06, 1.12, 1.19, 1.27, 1.38, 1.7, 3.1, 4.2, 7.6, 10, 15.4],
};

/** The target contrast of a color scale on the page. Steps 9 and 10 use the solid targets, so their value here is 0. */
const COLOR_TARGETS: Record<Theme, readonly number[]> = {
  dark: [1.03, 1.08, 1.2, 1.35, 1.5, 1.75, 2.2, 3, 0, 0, 8, 11],
  light: [1.03, 1.07, 1.15, 1.24, 1.36, 1.52, 1.85, 2.5, 0, 0, 6.2, 10.5],
};

/** White text on step 9 has this contrast. Step 10 has more in the light theme and less in the dark theme. */
const SOLID_ON_WHITE = 4.6;
const SOLID_PRESSED_ON_WHITE: Record<Theme, number> = { dark: 3.9, light: 5.8 };
/** The brand keeps the color of the primary button, so its solid step has more contrast. */
const BRAND_SOLID_ON_WHITE = 6.4;
const BRAND_SOLID_PRESSED_ON_WHITE = 8.2;

/**
 * The contrast of step 9 and step 10 of the danger scale with `base-text-inverse`. This token is the label of the
 * destructive button. It is near white in the light theme and near black in the dark theme.
 */
const DANGER_ON_INVERSE: Record<number, number> = { 8: 4.6, 9: 5.8 };

/** The colors that the scales start from. They come from the `core-color-*` tokens, which the generator does not change. */
export interface ScaleSource {
  /** Returns the 12 colors of a family, from light to dark. */
  ramp: (family: string) => readonly string[];
  /** The page color of each theme. */
  page: Record<Theme, string>;
}

/** Returns the color of the page and of each curve in a theme. A curve starts at the page and moves away from it. */
function curveOf(family: string, theme: Theme, source: ScaleSource): { curve: string[]; page: string } {
  const page = source.page[theme];
  const ramp = source.ramp(family);
  return { curve: theme === "light" ? [page, ...ramp] : [page, ...[...ramp].reverse()], page };
}

/** Gives a neutral color the hue of the brand. The lightness does not change. The tint is strongest in the middle. */
function sageTinted(hex: string, source: ScaleSource): string {
  const { l } = hexToOklch(hex);
  const brandSolid = source.ramp("brand")[CORE_STEPS.indexOf("600")] as string;
  const chroma = 0.003 + 0.009 * (1 - Math.abs(l - 0.55) / 0.45);
  return oklchToHex({ c: Math.max(0.003, chroma), h: hexToOklch(brandSolid).h, l });
}

/** Returns the 12 neutral colors of a theme. */
export function neutralScale(theme: Theme, source: ScaleSource): string[] {
  const { curve, page } = curveOf(SCALE_FAMILIES.neutral, theme, source);
  return NEUTRAL_TARGETS[theme].map((target, index) =>
    sageTinted(index === 0 ? page : colorAtContrast(curve, page, target), source)
  );
}

/** Returns the 12 colors of a color family in a theme. */
export function colorScale(family: string, theme: Theme, source: ScaleSource): string[] {
  const { curve, page } = curveOf(family, theme, source);
  const solidCurve = ["#ffffff", ...source.ramp(family)];
  const isBrand = family === "brand";
  // The inverse text is step 1 of the neutral scale.
  const inverse = sageTinted(page, source);
  const inverseCurve = [inverse, ...curve.slice(1)];
  return COLOR_TARGETS[theme].map((target, index) => {
    const dangerTarget = family === "error" ? DANGER_ON_INVERSE[index] : undefined;
    if (dangerTarget !== undefined) return colorAtContrast(inverseCurve, inverse, dangerTarget);
    // The primary button in the dark theme keeps its color.
    if (isBrand && theme === "dark" && index === 11) return source.ramp(family)[CORE_STEPS.indexOf("300")] as string;
    if (index === 8) return colorAtContrast(solidCurve, "#ffffff", isBrand ? BRAND_SOLID_ON_WHITE : SOLID_ON_WHITE);
    if (index === 9) {
      const pressed = isBrand && theme === "light" ? BRAND_SOLID_PRESSED_ON_WHITE : SOLID_PRESSED_ON_WHITE[theme];
      return colorAtContrast(solidCurve, "#ffffff", pressed);
    }
    return colorAtContrast(curve, page, target);
  });
}

/** Returns the 12 colors of a scale in a theme. */
export function scaleColors(name: ScaleName, theme: Theme, source: ScaleSource): string[] {
  return name === "neutral" ? neutralScale(theme, source) : colorScale(SCALE_FAMILIES[name], theme, source);
}

/** A step of a scale. `N` is neutral. `B`, `E`, `S` and `W` are brand, error, success and warning. */
type StepRef = `${"N" | "B" | "E" | "S" | "W"}${number}`;
/** The value of a token: a step of a scale, or the name of another token. */
export type TokenRef = StepRef | `${"base" | "core" | "util"}-${string}`;
/** One value for both themes, or one value for each theme. */
export type ThemedRef = TokenRef | Record<Theme, TokenRef>;

const REF_NAMES: Record<string, ScaleName> = { B: "brand", E: "error", N: "neutral", S: "success", W: "warning" };

/** Returns the name of a scale token from a step, for example `core-scale-neutral-9` from `N9`. */
export function scaleToken(ref: StepRef): string {
  return `core-scale-${REF_NAMES[ref[0] as string] as ScaleName}-${ref.slice(1)}`;
}

/** Returns the name of the token that a value points at. */
export function tokenName(ref: TokenRef): string {
  return /^[BENSW]\d+$/.test(ref) ? scaleToken(ref as StepRef) : ref;
}

/** The translucent neutral at one opacity. The base color is black in the light theme and white in the dark theme. */
function neutralAlpha(opacity: number): Record<Theme, TokenRef> {
  return { dark: `core-alpha-white-${opacity}`, light: `core-alpha-black-${opacity}` };
}

/**
 * The value of each old `base-*` token. These values keep the look of the app until the components move to the new
 * semantic tokens. The app has three levels of reading text, so two old names of one level use one
 * step: secondary and tertiary use step 10, and quaternary and quinary use step 9.
 *
 * The `util-color-*` tokens do not move here. The category colors and the avatar colors use their steps 50, 100, 500 and
 * 600, and those values must not change.
 */
export const BASE_STEPS: Record<string, ThemedRef> = {
  "base-bg-brand": "B3",
  "base-bg-brand-reverse": { dark: "B12", light: "B9" },
  "base-bg-brand-reverse_hover": { dark: "B11", light: "B10" },
  "base-bg-brand-reverse_pressed": { dark: "B11", light: "B11" },
  "base-bg-brand_hover": "B4",
  "base-bg-brand_pressed": "B5",
  "base-bg-disabled": "N3",
  "base-bg-disabled_subtle": "N2",
  "base-bg-error": "E3",
  "base-bg-error-reverse": "E9",
  "base-bg-error-reverse_hover": "E10",
  "base-bg-error-reverse_pressed": "E11",
  "base-bg-error_hover": "E4",
  "base-bg-error_pressed": "E5",
  "base-bg-neutral": "N3",
  "base-bg-neutral_hover": "N4",
  "base-bg-neutral_pressed": "N5",
  "base-bg-primary": "N1",
  "base-bg-primary-reverse": "N12",
  "base-bg-primary-reverse_hover": "N11",
  "base-bg-primary-reverse_pressed": "N10",
  "base-bg-primary_alt": { dark: "N2", light: "N1" },
  "base-bg-quaternary": "N4",
  "base-bg-secondary": "N2",
  "base-bg-secondary_alt": { dark: "N1", light: "N2" },
  "base-bg-secondary_hover": "N3",
  "base-bg-secondary_pressed": "N4",
  "base-bg-tertiary": "N3",
  "base-bg-tertiary_alt": { dark: "N1", light: "N3" },
  "base-bg-tertiary_hover": "N4",
  "base-bg-tertiary_pressed": "N5",
  "base-border-brand-solid": { dark: "B11", light: "B9" },
  "base-border-disabled": "N6",
  "base-border-disabled_subtle": "N5",
  "base-border-error": "E7",
  "base-border-error-solid": "E9",
  "base-border-primary": "N7",
  "base-border-quaternary": "N3",
  "base-border-secondary": "N5",
  "base-border-tertiary": "N4",
  "base-fg-brand": "B11",
  "base-fg-brand-reverse": { dark: "N1", light: "B2" },
  "base-fg-brand_hover": "B12",
  "base-fg-brand_pressed": "B12",
  "base-fg-disabled": "N8",
  "base-fg-disabled_subtle": "N7",
  "base-fg-error": "E11",
  "base-fg-placeholder": "N8",
  "base-fg-primary": "N12",
  "base-fg-primary-reverse": "N1",
  "base-fg-primary_hover": "N11",
  "base-fg-quaternary": "N9",
  "base-fg-quinary": "N9",
  "base-fg-secondary": "N10",
  "base-fg-secondary_hover": "N11",
  "base-fg-tertiary": "N10",
  "base-text-brand": "B11",
  "base-text-brand_hover": "B12",
  "base-text-brand_pressed": "B12",
  "base-text-disabled": "N8",
  "base-text-error": "E11",
  "base-text-error_hover": "E12",
  "base-text-placeholder": "N8",
  "base-text-placeholder-subtle": "N7",
  "base-text-primary": "N12",
  "base-text-primary-reverse": "N1",
  "base-text-quaternary": "N9",
  "base-text-quinary": "N9",
  "base-text-secondary": "N10",
  "base-text-success": "S11",
  "base-text-tertiary": "N10",
};

/** A semantic token: its value and the old names that it replaces. */
export interface SemanticDefinition {
  value: ThemedRef;
  replaces: readonly string[];
}

/**
 * The semantic tokens, from the list "three" in section 7 of the prototype "Color token review". The rules for
 * each token are in `src/assets/color.usage.ts`. The hover fill and the active fill use the opacities of the outline
 * button, and the subtle fill keeps the value of `util-alpha-black-5`.
 */
export const SEMANTIC_TOKENS: Record<SemanticToken, SemanticDefinition> = {
  "base-bg-active": { replaces: ["base-bg-neutral_pressed"], value: neutralAlpha(10) },
  "base-bg-brand-solid": {
    replaces: ["base-bg-brand-reverse", "base-bg-brand-reverse_hover", "base-bg-brand-reverse_pressed"],
    value: { dark: "B12", light: "B9" },
  },
  "base-bg-brand-subtle": { replaces: ["base-bg-brand"], value: "B3" },
  "base-bg-danger-solid": {
    replaces: ["base-bg-error-reverse", "base-bg-error-reverse_hover", "base-bg-error-reverse_pressed"],
    value: "E9",
  },
  "base-bg-danger-subtle": { replaces: ["base-bg-error", "base-bg-error_hover", "base-bg-error_pressed"], value: "E3" },
  "base-bg-disabled": { replaces: ["base-bg-disabled_subtle"], value: "N3" },
  "base-bg-floating": { replaces: ["base-bg-primary_alt"], value: { dark: "N2", light: "N1" } },
  "base-bg-hover": {
    replaces: ["base-bg-secondary_hover", "base-bg-neutral", "base-bg-neutral_hover"],
    value: neutralAlpha(5),
  },
  "base-bg-primary": { replaces: [], value: "N1" },
  "base-bg-scrim": {
    replaces: ["base-bg-overlay"],
    value: { dark: "core-alpha-black-60", light: "core-alpha-black-40" },
  },
  "base-bg-secondary": { replaces: ["base-bg-secondary_alt"], value: "N2" },
  "base-bg-solid": { replaces: ["base-bg-primary-reverse", "base-bg-primary-reverse_hover"], value: "N12" },
  "base-bg-subtle": { replaces: [], value: neutralAlpha(5) },
  "base-bg-success-subtle": { replaces: [], value: "S3" },
  "base-bg-warning-subtle": { replaces: [], value: "W3" },
  "base-border-brand": { replaces: ["base-border-brand-solid"], value: { dark: "B11", light: "B9" } },
  "base-border-brand-subtle": { replaces: [], value: "B6" },
  "base-border-danger": { replaces: ["base-border-error-solid", "base-border-error"], value: "E9" },
  "base-border-default": { replaces: ["base-border-primary"], value: "N7" },
  "base-border-disabled": { replaces: ["base-border-disabled_subtle"], value: "N6" },
  "base-border-muted": { replaces: ["base-border-tertiary", "base-border-quaternary"], value: "N4" },
  "base-border-subtle": { replaces: ["base-border-secondary"], value: "N5" },
  "base-focus-ring": { replaces: [], value: { dark: "B11", light: "B9" } },
  "base-text-brand": {
    replaces: ["base-text-brand_hover", "base-text-brand_pressed", "base-fg-brand"],
    value: "B11",
  },
  "base-text-danger": {
    replaces: ["base-text-error", "base-text-error_hover", "base-fg-error", "base-fg-error_hover"],
    value: "E11",
  },
  "base-text-disabled": { replaces: ["base-fg-disabled"], value: "N8" },
  "base-text-inverse": {
    replaces: ["base-text-primary-reverse", "base-fg-primary-reverse", "base-fg-brand-reverse"],
    value: "N1",
  },
  "base-text-muted": { replaces: ["base-text-quaternary", "base-text-quinary", "base-fg-quaternary"], value: "N9" },
  "base-text-placeholder": { replaces: ["base-fg-placeholder"], value: "N8" },
  "base-text-primary": { replaces: ["base-fg-primary", "base-fg-primary_hover"], value: "N12" },
  "base-text-secondary": {
    replaces: ["base-text-tertiary", "base-fg-secondary", "base-fg-secondary_hover", "base-fg-tertiary"],
    value: "N10",
  },
  "base-text-success": { replaces: [], value: "S11" },
  "base-text-warning": { replaces: [], value: "W11" },
};

/** The old names whose value is not a step of a scale. Each one has the color of its semantic token in both themes. */
export const ALPHA_ALIASES: Record<string, SemanticToken> = { "base-bg-overlay": "base-bg-scrim" };

/** The color families of the main categories. Each family has a fill at step 50 and an icon at step 600. */
const PALETTE_FAMILIES = [
  "brand",
  "clearblue",
  "error",
  "forest",
  "grey",
  "leaf",
  "magenta",
  "purple",
  "rosered",
  "success",
  "warning",
  "waterblue",
  "yellow",
] as const;
/** The color families of the action tiles on the review page. These families also have a hover, a press and a label. */
const ACTION_FAMILIES = ["clearblue", "leaf", "purple", "rosered"] as const;
/** The text step of each avatar family. See `avatar-initial.ts` for why the steps are different. */
const AVATAR_TEXT_STEPS = {
  brand: 500,
  leaf: 600,
  magenta: 500,
  purple: 500,
  rosered: 500,
  waterblue: 600,
  yellow: 600,
};

/**
 * Returns the three parts of the status badge in one tone: the fill of the core, the icon, and the color of the rings.
 * The core and the rings use the 500 step, and StatusBadge draws them at a lower opacity: a solid core was a heavy block
 * in the dark theme. The tones have no alpha tokens, so the opacity is in the component. SPZ-76 picked the 600 icon,
 * because the 700 icon looked dull.
 */
function statusBadgeTone(tone: "error" | "success" | "warning"): Record<string, TokenRef> {
  return {
    [`comp-status-badge-${tone}-core`]: `util-color-${tone}-500`,
    [`comp-status-badge-${tone}-icon`]: `util-color-${tone}-600`,
    [`comp-status-badge-${tone}-ring`]: `util-color-${tone}-500`,
  };
}

/**
 * The component tokens from section 9 of the prototype. Each value is the color that the component uses today, so a
 * migration card can change the name and keep the look. The rules for each group are in `src/assets/color.usage.ts`.
 */
export const COMPONENT_TOKENS: Record<string, ThemedRef> = {
  "comp-button-outline-bg-hover": neutralAlpha(5),
  "comp-button-outline-bg-pressed": neutralAlpha(10),
  "comp-button-outline-border": { dark: "core-alpha-white-30", light: "core-alpha-black-20" },
  "comp-button-outline-border-disabled": neutralAlpha(10),
  "comp-button-outline-text-disabled": neutralAlpha(40),
  "comp-button-secondary-bg": "core-alpha-brand-20",
  "comp-button-secondary-bg-hover": "core-alpha-brand-30",
  "comp-button-secondary-bg-pressed": "core-alpha-brand-40",
  // The hover and pressed fill of a shared row. The dark theme needs a step between the page and N2: N2 is too
  // bright on the dark page, so the 3% white sits about half way.
  "comp-row-bg-hover": { dark: "core-alpha-white-3", light: "base-bg-secondary" },
  "comp-row-bg-pressed": { dark: "core-alpha-white-3", light: "base-bg-secondary" },
  "comp-search-filter-bg": "core-alpha-brand-10",
  "comp-search-filter-bg-hover": "core-alpha-brand-20",
  "comp-search-filter-bg-pressed": "core-alpha-brand-30",
  "comp-segment-hover": "core-alpha-brand-10",
  "comp-segment-selected": "core-alpha-brand-20",
  "comp-segment-track": "core-alpha-brand-5",
  "comp-switch-track-off": "util-alpha-black-20",
  "comp-switch-track-off-disabled": "base-bg-disabled",
  "comp-switch-track-on": "util-color-brand-700",
  "comp-switch-track-on-disabled": "core-alpha-brand-40",
  "comp-user-tag-border": neutralAlpha(10),
  ...statusBadgeTone("error"),
  ...statusBadgeTone("success"),
  ...statusBadgeTone("warning"),
  ...Object.fromEntries(
    PALETTE_FAMILIES.flatMap((family) => [
      [`comp-palette-${family}-fill`, `util-color-${family}-50`],
      [`comp-palette-${family}-icon`, `util-color-${family}-600`],
    ])
  ),
  ...Object.fromEntries(
    ACTION_FAMILIES.flatMap((family) => [
      [`comp-palette-${family}-fill-hover`, `util-color-${family}-100`],
      [`comp-palette-${family}-fill-pressed`, `util-color-${family}-200`],
      [`comp-palette-${family}-label`, `util-color-${family}-700`],
    ])
  ),
  ...Object.fromEntries(
    Object.entries(AVATAR_TEXT_STEPS).flatMap(([family, step]) => [
      [`comp-palette-avatar-${family}-fill`, `util-color-${family}-100`],
      [`comp-palette-avatar-${family}-text`, `util-color-${family}-${step}`],
    ])
  ),
};

/** Returns the value of a themed value in one theme. */
export function themedRef(value: ThemedRef, theme: Theme): TokenRef {
  return typeof value === "string" ? value : value[theme];
}

/** Returns the value of an old `base-*` token in a theme. */
export function baseStep(token: string, theme: Theme): TokenRef {
  return themedRef(BASE_STEPS[token] as ThemedRef, theme);
}

/**
 * Returns the value that a semantic token has in `color.css`. When one name is both an old token and a semantic token,
 * the old value stays. The app must not change color until the last old use of that name moves.
 */
export function semanticRef(token: SemanticToken, theme: Theme): TokenRef {
  return token in BASE_STEPS ? baseStep(token, theme) : themedRef(SEMANTIC_TOKENS[token].value, theme);
}

/** Returns the semantic tokens whose name is new. The generator adds these lines, and the other names already exist. */
export function newSemanticTokens(): SemanticToken[] {
  return (Object.keys(SEMANTIC_TOKENS) as SemanticToken[]).filter((token) => !(token in BASE_STEPS));
}

/**
 * Returns the semantic token that an old name can point at. An old name is an alias only when the color is the same in
 * both themes. Other old names keep their own value, and a later change deletes them after the components move.
 */
export function aliasOf(oldToken: string): SemanticToken | undefined {
  const tokens = Object.keys(SEMANTIC_TOKENS) as SemanticToken[];
  return tokens.find(
    (token) =>
      SEMANTIC_TOKENS[token].replaces.includes(oldToken) &&
      THEMES.every((theme) => baseStep(oldToken, theme) === semanticRef(token, theme))
  );
}
