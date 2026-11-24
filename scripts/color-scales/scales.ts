import { colorAtContrast, hexToOklch, oklchToHex } from "./color-math";

/**
 * Theme color scales for the app. Each scale defines 12 contrast-targeted steps per theme so every step plays the same
 * visual role in light and dark modes. Values stay on the `core-color-*` curve of each family to preserve hue.
 */

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

/** Steps of a `core-color-*` family, ordered from light to dark. */
export const CORE_STEPS = ["25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;

/** Scale names in `color.css` mapped to their `core-color-*` source families. */
export const SCALE_FAMILIES = {
  brand: "brand",
  error: "error",
  neutral: "grey",
  success: "success",
  warning: "warning",
};
export type ScaleName = keyof typeof SCALE_FAMILIES;

/**
 * Target contrast ratios against the page surface for each neutral step.
 * Step 8 serves placeholder and disabled text, step 9 serves `text-muted`, step 10 serves `text-secondary`, and step 12
 * serves `text-primary`. Step 9 intentionally sits below the 4.5:1 WCAG AA threshold for secondary metadata.
 */
const NEUTRAL_TARGETS: Record<Theme, readonly number[]> = {
  dark: [1, 1.16, 1.28, 1.4, 1.55, 1.7, 1.9, 3.3, 4.7, 8.4, 10.5, 16.6],
  light: [1, 1.06, 1.12, 1.19, 1.27, 1.38, 1.7, 3.1, 4.2, 7.6, 10, 15.4],
};

/** Target contrast ratios against the page surface for chromatic scales (steps 9 and 10 use solid contrast targets instead). */
const COLOR_TARGETS: Record<Theme, readonly number[]> = {
  dark: [1.03, 1.08, 1.2, 1.35, 1.5, 1.75, 2.2, 3, 0, 0, 8, 11],
  light: [1.03, 1.07, 1.15, 1.24, 1.36, 1.52, 1.85, 2.5, 0, 0, 6.2, 10.5],
};

/** Target contrast of white text on solid step 9; step 10 increases contrast in light mode and lowers it in dark mode. */
const SOLID_ON_WHITE = 4.6;
const SOLID_PRESSED_ON_WHITE: Record<Theme, number> = { dark: 3.9, light: 5.8 };
/** Higher solid contrast targets for the brand scale so the primary button retains its deeper shade. */
const BRAND_SOLID_ON_WHITE = 6.4;
const BRAND_SOLID_PRESSED_ON_WHITE = 8.2;

/**
 * Target contrast of danger steps 9 and 10 (zero-based indices 8 and 9) against `base-text-inverse`, the label color
 * of the destructive button (near-white in light mode, near-black in dark mode).
 */
const DANGER_ON_INVERSE: Record<number, number> = { 8: 4.6, 9: 5.8 };

/** Base color inputs read from the static `core-color-*` palette tokens. */
export interface ScaleSource {
  /** Returns the 12 hex colors of `family` from light to dark. */
  ramp: (family: string) => readonly string[];
  /** Page background hex color for each theme. */
  page: Record<Theme, string>;
}

/** Builds a color curve starting at the theme's page surface and progressing away from it in lightness. */
function curveOf(family: string, theme: Theme, source: ScaleSource): { curve: string[]; page: string } {
  const page = source.page[theme];
  const ramp = source.ramp(family);
  return { curve: theme === "light" ? [page, ...ramp] : [page, ...[...ramp].reverse()], page };
}

/** Tints a neutral hex color with the brand hue while preserving lightness, peaking in chroma near mid-tones. */
function sageTinted(hex: string, source: ScaleSource): string {
  const { l } = hexToOklch(hex);
  const brandSolid = source.ramp("brand")[CORE_STEPS.indexOf("600")] as string;
  const chroma = 0.003 + 0.009 * (1 - Math.abs(l - 0.55) / 0.45);
  return oklchToHex({ c: Math.max(0.003, chroma), h: hexToOklch(brandSolid).h, l });
}

/** Computes the 12 sage-tinted neutral scale colors for `theme`. */
export function neutralScale(theme: Theme, source: ScaleSource): string[] {
  const { curve, page } = curveOf(SCALE_FAMILIES.neutral, theme, source);
  return NEUTRAL_TARGETS[theme].map((target, index) =>
    sageTinted(index === 0 ? page : colorAtContrast(curve, page, target), source)
  );
}

/** Computes the 12 chromatic scale colors for `family` in `theme`. */
export function colorScale(family: string, theme: Theme, source: ScaleSource): string[] {
  const { curve, page } = curveOf(family, theme, source);
  const solidCurve = ["#ffffff", ...source.ramp(family)];
  const isBrand = family === "brand";
  // `base-text-inverse` matches step 1 of the neutral scale.
  const inverse = sageTinted(page, source);
  const inverseCurve = [inverse, ...curve.slice(1)];
  return COLOR_TARGETS[theme].map((target, index) => {
    const dangerTarget = family === "error" ? DANGER_ON_INVERSE[index] : undefined;
    if (dangerTarget !== undefined) return colorAtContrast(inverseCurve, inverse, dangerTarget);
    // Preserve the exact dark-mode primary button fill (`brand-300`).
    if (isBrand && theme === "dark" && index === 11) return source.ramp(family)[CORE_STEPS.indexOf("300")] as string;
    if (index === 8) return colorAtContrast(solidCurve, "#ffffff", isBrand ? BRAND_SOLID_ON_WHITE : SOLID_ON_WHITE);
    if (index === 9) {
      const pressed = isBrand && theme === "light" ? BRAND_SOLID_PRESSED_ON_WHITE : SOLID_PRESSED_ON_WHITE[theme];
      return colorAtContrast(solidCurve, "#ffffff", pressed);
    }
    return colorAtContrast(curve, page, target);
  });
}

/** Computes the 12 scale colors for `name` in `theme`. */
export function scaleColors(name: ScaleName, theme: Theme, source: ScaleSource): string[] {
  return name === "neutral" ? neutralScale(theme, source) : colorScale(SCALE_FAMILIES[name], theme, source);
}

/** Compact shorthand for a scale step (`N` = neutral, `B` = brand, `E` = error, `S` = success, `W` = warning). */
type StepRef = `${"N" | "B" | "E" | "S" | "W"}${number}`;
/** Reference to either a scale step shorthand or an existing CSS token name. */
export type TokenRef = StepRef | `${"base" | "core" | "util"}-${string}`;
/** Token reference shared across both themes or specified per theme. */
export type ThemedRef = TokenRef | Record<Theme, TokenRef>;

const REF_NAMES: Record<string, ScaleName> = { B: "brand", E: "error", N: "neutral", S: "success", W: "warning" };

/** Expands a step shorthand such as `N9` into its CSS variable name (`core-scale-neutral-9`). */
export function scaleToken(ref: StepRef): string {
  return `core-scale-${REF_NAMES[ref[0] as string] as ScaleName}-${ref.slice(1)}`;
}

/** Resolves a `TokenRef` into a full CSS custom property name (without `--`). */
export function tokenName(ref: TokenRef): string {
  return /^[BENSW]\d+$/.test(ref) ? scaleToken(ref as StepRef) : ref;
}

/** Builds a translucent neutral token pair using black alpha in light mode and white alpha in dark mode. */
function neutralAlpha(opacity: number): Record<Theme, TokenRef> {
  return { dark: `core-alpha-white-${opacity}`, light: `core-alpha-black-${opacity}` };
}

/**
 * Scale-step mappings for legacy `base-*` tokens while components migrate to `SEMANTIC_TOKENS`.
 * Reading text uses three hierarchy levels, so `secondary`/`tertiary` share step 10 and `quaternary`/`quinary` share step 9.
 *
 * `util-color-*` tokens are excluded so category and avatar palette steps (50, 100, 500, 600) remain unchanged.
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

/** Semantic token definition pairing its target value with the legacy `base-*` names it replaces. */
export interface SemanticDefinition {
  value: ThemedRef;
  replaces: readonly string[];
}

/**
 * Semantic color tokens. Usage rules for each token live in `src/assets/color.usage.ts`.
 * Neutral hover and active fills share the outline button's alpha steps, and `base-bg-subtle` matches `util-alpha-black-5`.
 */
export const SEMANTIC_TOKENS: Record<string, SemanticDefinition> = {
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

/** Legacy tokens whose values come from alpha tokens instead of scale steps, aliased directly in both themes. */
export const ALPHA_ALIASES: Record<string, string> = { "base-bg-overlay": "base-bg-scrim" };

/** Main category color families, each providing a fill at step 50 and an icon color at step 600. */
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
/** Color families for the review-page action tiles, which also define hover, pressed, and label steps. */
const ACTION_FAMILIES = ["clearblue", "leaf", "purple", "rosered"] as const;
/** Foreground text step per avatar color family (see `avatar-initial.ts` for contrast details). */
const AVATAR_TEXT_STEPS = {
  brand: 500,
  leaf: 600,
  magenta: 500,
  purple: 500,
  rosered: 500,
  waterblue: 600,
  yellow: 600,
};

/** Builds the four `comp-status-badge-<tone>-*` token entries for a single badge tone. */
function statusBadgeTone(
  tone: string,
  parts: { core: TokenRef; halo: TokenRef; icon: TokenRef; ring: TokenRef }
): Record<string, TokenRef> {
  return Object.fromEntries(
    Object.entries(parts).map(([part, ref]) => [`comp-status-badge-${tone}-${part}`, ref])
  ) as Record<string, TokenRef>;
}

/**
 * Component-scoped color tokens (`comp-*`). Values match current component colors so token migrations preserve visuals.
 * Group rules live in `src/assets/color.usage.ts`.
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
  // Dark mode needs an intermediate step between the page surface and `N2` because `N2` looks too bright on a row hover;
  // 3% white lands roughly halfway.
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
  ...statusBadgeTone("brand", {
    core: "core-alpha-brand-10",
    halo: "core-alpha-brand-5",
    icon: "util-color-brand-600",
    ring: "core-alpha-brand-20",
  }),
  ...statusBadgeTone("error", {
    core: "util-color-error-50",
    halo: "util-color-error-50",
    icon: "util-color-error-600",
    ring: "util-color-error-100",
  }),
  ...statusBadgeTone("success", {
    core: "util-color-success-50",
    halo: "util-color-success-50",
    icon: "util-color-success-600",
    ring: "util-color-success-200",
  }),
  ...statusBadgeTone("warning", {
    core: "util-color-warning-50",
    halo: "util-color-warning-50",
    icon: "util-color-warning-600",
    ring: "util-color-warning-200",
  }),
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

/** Resolves `value` for a single `theme`. */
export function themedRef(value: ThemedRef, theme: Theme): TokenRef {
  return typeof value === "string" ? value : value[theme];
}

/** Resolves the scale-step reference for a legacy `base-*` token in `theme`. */
export function baseStep(token: string, theme: Theme): TokenRef {
  return themedRef(BASE_STEPS[token] as ThemedRef, theme);
}

/**
 * Resolves the `color.css` reference for a semantic token. When a token name exists in both `BASE_STEPS` and
 * `SEMANTIC_TOKENS`, the legacy step wins until all legacy call sites migrate.
 */
export function semanticRef(token: string, theme: Theme): TokenRef {
  return token in BASE_STEPS ? baseStep(token, theme) : themedRef(SEMANTIC_TOKENS[token].value, theme);
}

/** Returns semantic token names that do not collide with existing `BASE_STEPS` entries. */
export function newSemanticTokens(): string[] {
  return Object.keys(SEMANTIC_TOKENS).filter((token) => !(token in BASE_STEPS));
}

/**
 * Finds the semantic token that `oldToken` can alias directly when both themes resolve to the exact same color.
 * Legacy tokens whose light or dark step differs keep their own value until components migrate.
 */
export function aliasOf(oldToken: string): string | undefined {
  return Object.keys(SEMANTIC_TOKENS).find(
    (token) =>
      SEMANTIC_TOKENS[token].replaces.includes(oldToken) &&
      THEMES.every((theme) => baseStep(oldToken, theme) === semanticRef(token, theme))
  );
}
