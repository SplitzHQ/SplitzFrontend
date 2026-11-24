/**
 * Brand rules for Splitz: logo anatomy, logo forms, colorways, brand colors, clear space, minimum sizes, misuse cases,
 * app icons, motion principles, and brand patterns.
 * Agents consult this file via `spz-brand-use`; component-level rules live in `brand-wordmark.usage.ts`.
 * App code never imports this file, keeping rule text out of the production bundle.
 */
import { BRAND_COLOR, LIGHT_COLOR } from "./brand-glyph";

/** Environments where the rules in this file apply. */
export const RULE_SCOPE = {
  app: "All rules in this file apply to `src/`, `public/`, and `index.html`.",
  devtools: [
    "Prototypes that compare logo, icon, or brand-color candidates intentionally deviate from these rules.",
    "All other devtools surfaces follow these rules; when a case is not covered here, pick what fits the tool and continue.",
  ],
};

/** Single titled brand rule. */
export interface BrandRule {
  title: string;
  rule: string;
}

/** Core visual building blocks of the Splitz brand. */
export const ELEMENTS: BrandRule[] = [
  {
    rule: "A circular dot (top-left), a diagonal bar (bottom-left to top-right), and a diamond (bottom-right) on a 600x600 coordinate grid, defined in `brand-glyph.ts`.",
    title: "Glyph",
  },
  {
    rule: "A 600x600 rounded square (`rx = 150`) filled with the brand plate color. Used exclusively for app icons and the full-screen cold-start opening overlay.",
    title: "Plate",
  },
  {
    rule: "Vector outlines of the word Splitz set in Manrope SemiBold (600), with the glyph's diamond replacing the circular dot on the `i`.",
    title: "Wordmark",
  },
  {
    rule: "Two geometric patterns built from the glyph's dot and diamond: dot-to-diamond (`morph`) and `checker`. App screens use them at low opacity; external brand graphics may use full strength (see `PATTERN_TIER_GUIDE`, `PATTERN_USE_GUIDE`, and `PATTERN_RULES`).",
    title: "Patterns",
  },
];

/** Canonical forms of the Splitz logo. */
export const LOGO_FORMS = ["wordmark", "glyph", "icon"] as const;
export type LogoForm = (typeof LOGO_FORMS)[number];

/** Usage guidance for a single `LogoForm`. */
export interface LogoFormGuide {
  form: LogoForm;
  name: string;
  use: string;
}

// Using `Record` enforces a compile-time error whenever a new `LogoForm` is added without a rule.
const FORM_RULES: Record<LogoForm, Omit<LogoFormGuide, "form">> = {
  glyph: {
    name: "Glyph",
    use: "Standalone glyph without a background plate, used on surfaces without the wordmark (`AuthShell` and the collapsed 18px `HomePage` header). Shares the wordmark's foreground token.",
  },
  icon: {
    name: "App icon",
    use: "Light foreground glyph centered on the brand plate. Reserved for OS and browser chrome: favicons, home-screen icons, PWA install prompts, and the cold-start opening overlay.",
  },
  wordmark: {
    name: "Wordmark",
    use: "Default brand mark on non-icon surfaces, rendered without an accompanying leading glyph.",
  },
};

export const FORM_GUIDE: LogoFormGuide[] = LOGO_FORMS.map((form) => ({ form, ...FORM_RULES[form] }));

/** Permitted foreground/background color pairings for the logo. */
export const COLORWAYS = ["onPage", "onPlate"] as const;
export type Colorway = (typeof COLORWAYS)[number];

/** Specification of an allowed logo colorway. */
export interface ColorwayGuide {
  colorway: Colorway;
  name: string;
  /** Foreground color of the logo (CSS custom property or hex value). */
  logo: string;
  /** Background surface beneath the logo (CSS custom property or hex value). */
  ground: string;
  use: string;
}

const COLORWAY_RULES: Record<Colorway, Omit<ColorwayGuide, "colorway">> = {
  onPage: {
    ground: "--base-bg-primary",
    logo: "--util-color-brand-700",
    name: "Brand on the page",
    use: "Wordmark and standalone glyph on app surfaces in both light and dark themes. `--util-color-brand-700` adapts automatically in dark mode, so never override dark-mode color manually.",
  },
  onPlate: {
    ground: BRAND_COLOR,
    logo: LIGHT_COLOR,
    name: "Light on the plate",
    use: "App icons and the cold-start opening overlay only, using literal hex values because static icon files and OS chrome cannot resolve CSS custom properties.",
  },
};

export const COLORWAY_GUIDE: ColorwayGuide[] = COLORWAYS.map((colorway) => ({
  colorway,
  ...COLORWAY_RULES[colorway],
}));

/** Brand color definitions and synchronization rules (general UI color tokens live in `src/assets/color.css`). */
export const COLOR_RULES: BrandRule[] = [
  {
    rule: `\`${BRAND_COLOR}\` (\`--core-color-brand-700\`), matching the solid primary brand shade in the UI so app icons and primary actions share one color, and keeping favicons and home-screen icons saturated instead of muted gray. Exported as \`BRAND_COLOR\` in \`brand-glyph.ts\` for static assets.`,
    title: "Plate color",
  },
  {
    rule: `\`${LIGHT_COLOR}\` (\`--core-color-brand-50\`), used for the glyph atop the brand plate and exported as \`LIGHT_COLOR\` in \`brand-glyph.ts\`.`,
    title: "Light color",
  },
  {
    rule: "`--util-color-brand-700` is the sole CSS token for on-page logos. Never substitute `BRAND_COLOR` on a page because the literal hex value stays dark in dark mode instead of shifting to the light theme value.",
    title: "Logo color",
  },
  {
    rule: 'Whenever a brand color changes, update all of these together: the token in `src/assets/`, `brand-glyph.ts`, `OPENING_STATUS_BAR_TOKEN` in `BrandOpeningOverlay.vue`, `pwa-assets.config.ts`, `public/favicon.svg`, and `<link rel="mask-icon">` in `index.html`, then run `bun run generate-pwa-assets`.',
    title: "Change a value",
  },
];

/**
 * Minimum clear space around the logo that must remain free of adjacent text, icons, or container edges.
 * Draft values pending confirmation in `OPEN_QUESTIONS`.
 */
export const CLEAR_SPACE = {
  /** Clear-space margin around the standalone glyph as a fraction of glyph width (`100 / 600`, equal to the dot diameter). */
  glyphShare: 1 / 6,
  /** Clear-space margin around the wordmark in `em` units (`10px` at the `20px` header preset). */
  wordmarkEm: 0.5,
} as const;

/** Smallest permitted rendered dimensions in CSS pixels (draft values pending confirmation in `OPEN_QUESTIONS`). */
export const MINIMUM_SIZE = {
  /** Minimum width of the standalone glyph without a plate. */
  glyphPx: 16,
  /** Minimum width of the app icon (matching browser favicons). */
  iconPx: 16,
  /** Minimum nominal font size of the wordmark, below which the `i`'s diamond shrinks under `3px`. */
  wordmarkFontPx: 16,
} as const;

/** Prohibited logo modifications. */
export const MISUSES = ["stretch", "rotate", "recolor", "effect", "lowContrast", "text", "clip", "lockup"] as const;
export type Misuse = (typeof MISUSES)[number];

/** Description of a prohibited logo modification. */
export interface MisuseGuide {
  misuse: Misuse;
  title: string;
  rule: string;
}

const MISUSE_RULES: Record<Misuse, Omit<MisuseGuide, "misuse">> = {
  clip: {
    rule: "The top vertex of the `i`'s diamond extends above the wordmark viewBox; never wrap the logo in `overflow: hidden` or a clipping mask.",
    title: "Do not clip the diamond",
  },
  effect: {
    rule: "Never apply drop shadows, strokes, gradients, blurs, or pattern fills to the logo.",
    title: "Do not add effects",
  },
  lockup: {
    rule: "The glyph and wordmark appear together only transiently during tap animations and the `HomePage` header collapse. Never combine them into a static lockup.",
    title: "Do not pair glyph and wordmark",
  },
  lowContrast: {
    rule: "Maintain at least 3:1 contrast against the underlying surface, and never place the logo directly over photography or busy patterns.",
    title: "Do not use low contrast",
  },
  recolor: {
    rule: "Use only the approved colorways in `COLORWAY_GUIDE`; never recolor the logo with category, status, or gradient fills.",
    title: "Do not change the color",
  },
  rotate: { rule: "Keep the logo upright; never rotate or tilt it.", title: "Do not rotate the logo" },
  stretch: {
    rule: "Preserve aspect ratio and scale `BrandWordmark` exclusively via its `size` prop.",
    title: "Do not stretch the logo",
  },
  text: {
    rule: 'Never substitute plain HTML text in a heading or `<span>` for the visual logo; write "Splitz" as plain text only inside prose sentences.',
    title: "Do not render the logo as text",
  },
};

export const MISUSE_GUIDE: MisuseGuide[] = MISUSES.map((misuse) => ({ misuse, ...MISUSE_RULES[misuse] }));

/** Maintenance rules for `brand-glyph.ts`. */
export const GLYPH_RULES: BrandRule[] = [
  {
    rule: "`brand-glyph.ts` is the single source of truth for glyph coordinates and static brand hex colors consumed by components and animations.",
    title: "One source",
  },
  {
    rule: "Devtools prototypes import `brand-glyph.ts`, so preserve its existing exports when editing.",
    title: "Exports",
  },
  {
    rule: "`brand-motion.ts` derives keyframe offsets from the dot center and diamond square metrics in `brand-glyph.ts`; keep them synchronized whenever glyph coordinates change (verified by unit tests).",
    title: "Motion numbers",
  },
  {
    rule: "`public/favicon.svg` mirrors the exact `BRAND_GLYPH` paths; update it and rerun `bun run generate-pwa-assets` whenever `brand-glyph.ts` changes.",
    title: "Icons",
  },
];

/** Metadata for a static icon asset in `public/`. */
export interface IconFile {
  path: string;
  /** Width and height in pixels (or `viewBox` size for SVG). */
  px: number;
  /** `true` when the OS applies its own mask, requiring a full-bleed opaque square with zero margin. */
  masked: boolean;
  use: string;
}

/** Static icon files in `public/`. All raster files are generated from `public/favicon.svg` via `bun run generate-pwa-assets`. */
export const ICON_FILES: IconFile[] = [
  {
    masked: false,
    path: "public/favicon.svg",
    px: 600,
    use: "Master vector source for generated icons, and favicon for modern browsers.",
  },
  { masked: false, path: "public/favicon.ico", px: 48, use: "Fallback favicon for legacy browsers." },
  { masked: false, path: "public/pwa-64x64.png", px: 64, use: "Small installed-PWA icon." },
  { masked: false, path: "public/pwa-192x192.png", px: 192, use: "Standard installed-PWA icon on Android." },
  {
    masked: false,
    path: "public/pwa-512x512.png",
    px: 512,
    use: "High-resolution installed-PWA icon and Android splash graphic.",
  },
  {
    masked: true,
    path: "public/maskable-icon-512x512.png",
    px: 512,
    use: "Full-bleed Android adaptive/maskable icon.",
  },
  { masked: true, path: "public/apple-touch-icon-180x180.png", px: 180, use: "iOS home-screen touch icon." },
];

/** Radius fraction (`0.8`) of the centered circle guaranteed to remain unclipped in Android maskable icons. */
export const MASKABLE_SAFE_ZONE = 0.8;

/** Generation and layout rules for app icons. */
export const ICON_RULES: BrandRule[] = [
  {
    rule: "Never hand-edit PNG or ICO files. Edit `public/favicon.svg` and run `bun run generate-pwa-assets` (configured in `pwa-assets.config.ts`).",
    title: "Generate the files",
  },
  {
    rule: "Apple touch and Android maskable icons are full-bleed opaque squares filled with `BRAND_COLOR` so the OS mask introduces a single clean corner radius.",
    title: "Masked icons",
  },
  {
    rule: "The outermost point of the glyph sits at 71% of the icon radius, safely inside the 80% maskable safe zone without extra padding. Keep any revised glyph geometry inside 80%.",
    title: "Safe zone",
  },
  {
    rule: "`favicon.ico` and the standard `pwa-*` icons preserve the rounded plate over a transparent background.",
    title: "Clear icons",
  },
  {
    rule: "iOS caches existing home-screen icons indefinitely; remove and re-add the home-screen shortcut when verifying icon updates on an iPhone.",
    title: "Check on a phone",
  },
];

/** Motion principles governing brand animations (`brand-motion.ts` and `brand-wordmark.usage.ts`). */
export const MOTION_RULES: BrandRule[] = [
  {
    rule: "The logo animates only on cold-start opening, explicit user tap, and scroll-linked `HomePage` header collapse. Never loop or trigger logo animations on hover.",
    title: "When it moves",
  },
  {
    rule: "Scrolling `HomePage` scrubs `BrandHomeLogo` in lockstep with the collapsing search bar: letters fade out, the `i`'s diamond glides into the glyph's diamond position, and the dot and bar scale in, reversing smoothly when scrolling back up.",
    title: "Header collapse",
  },
  {
    rule: "Glyph assembly pops in one centered circle that shrinks and splits into two circles sliding to the dot and diamond positions while the bottom-right circle sharpens into a diamond and the diagonal bar extends between them.",
    title: "Glyph assembly",
  },
  {
    rule: "`BrandOpeningOverlay`, `BrandTapWordmark`, and `BrandTapGlyph` share the exact same glyph assembly choreography at different speed scales; update all three together.",
    title: "One motion",
  },
  {
    rule: "Brand motion never blocks interaction: `HomePage` mounts interactively underneath `BrandOpeningOverlay`, and both the overlay and tap animations pass pointer events through.",
    title: "Never block input",
  },
  {
    rule: "When reduced motion is enabled, `BrandOpeningOverlay` is skipped and tapping the wordmark or glyph is a no-op.",
    title: "Reduced motion",
  },
  {
    rule: "Use the shared easing curves and duration tokens from `src/libs/motion.ts`.",
    title: "Motion tokens",
  },
];

/**
 * Geometric brand patterns built from the glyph's dot and diamond.
 * Rendered and exported as SVGs by the devtools Patterns tool from the presets below.
 */
export const PATTERNS = ["morph", "checker"] as const;
export type BrandPattern = (typeof PATTERNS)[number];

/** Visual structure and product metaphor of a `BrandPattern`. */
export interface PatternGuide {
  pattern: BrandPattern;
  name: string;
  /** Visual arrangement and progression of shapes across the field. */
  look: string;
  /** Product concept represented by the pattern. */
  meaning: string;
}

const PATTERN_LOOKS: Record<BrandPattern, Omit<PatternGuide, "pattern">> = {
  checker: {
    look: "Alternating dots and diamonds on a checkerboard grid, varying color, scale, or opacity across the field while each cell keeps its shape.",
    meaning: "Group members side by side.",
    name: "Checker",
  },
  morph: {
    look: "Ordered rows where dots progressively sharpen into diamonds along a chosen direction, shifting color in step.",
    meaning: "An open expense balance (dot) progressing to settled (diamond).",
    name: "Dot to diamond",
  },
};

export const PATTERN_GUIDE: PatternGuide[] = PATTERNS.map((pattern) => ({ pattern, ...PATTERN_LOOKS[pattern] }));

/**
 * Generator parameters for a brand pattern preset, matching `devtools/patterns/playground.ts` so presets render
 * identically in the Patterns tool (lengths are relative to a 640-unit reference width).
 */
export interface PatternPreset {
  /** Base grid cell size in 640-wide coordinate units. */
  cell: number;
  /** Shape size multiplier relative to `cell`. */
  scale: number;
  /** Deterministic PRNG seed used by the `noise` direction. */
  seed: number;
  /** Grid density multiplier along both axes. */
  density: number;
  direction: "ltr" | "ttb" | "diagonal" | "radial" | "wave" | "noise";
  /** Reverses the progression direction when `true`. */
  reverse: boolean;
  ease: "linear" | "in" | "out" | "inOut" | "steps";
  /** Interpolates fill/stroke from the dot color to the diamond color when `true`. */
  color: boolean;
  /** Interpolates shape scale from `sizeFrom` to `1` when `true`. */
  sizeRamp: boolean;
  sizeFrom: number;
  /** Morphs dots into diamonds across the field (used only by the `morph` pattern). */
  shape: boolean;
  /** `split` outlines dots and fills diamonds; `grow` transitions from outline to solid fill. */
  fill: "solid" | "outline" | "split" | "grow";
  /** Stroke width when drawing outlined shapes. */
  stroke: number;
  /** Named background and foreground color palette defined in `devtools/patterns/playground.ts`. */
  ground: "white" | "tint" | "brand" | "deep";
  /** Overall opacity of the pattern shapes (`0..1`); the background stays opaque. */
  opacity: number;
}

/**
 * Usage tiers separating subtle in-app background textures (`ui`) from expressive external brand graphics (`brand`).
 */
export const PATTERN_TIERS = ["ui", "brand"] as const;
export type PatternTier = (typeof PATTERN_TIERS)[number];

/** Scope and constraints for a `PatternTier`. */
export interface PatternTierGuide {
  tier: PatternTier;
  name: string;
  where: string;
  limits: string[];
}

const PATTERN_TIER_RULES: Record<PatternTier, Omit<PatternTierGuide, "tier">> = {
  brand: {
    limits: [
      "Full opacity is permitted; start from the matching `brand` preset.",
      "Never apply a `brand` preset inside the app UI, where high-contrast patterns compete with content.",
    ],
    name: "Outside the app",
    where: "Marketing pages, store screenshots, social cards, press assets, and exported or printed settlement images.",
  },
  ui: {
    limits: [
      "Cap shape opacity at `0.3` or lower.",
      "Cover at most one third of the viewport.",
      "Fade shapes out toward content using the preset's `fade` mask.",
      "Render directly over the underlying surface without adding a separate background fill (except `groupCover`).",
    ],
    name: "In the app",
    where: "In-app screens.",
  },
};

export const PATTERN_TIER_GUIDE: PatternTierGuide[] = PATTERN_TIERS.map((tier) => ({
  tier,
  ...PATTERN_TIER_RULES[tier],
}));

/**
 * Spatial mask controlling where pattern shapes remain visible before fading into the surface:
 * `top` and `corner` anchor to one edge/corner, `center` keeps the middle, `edges` clears the center, and
 * `center-line` keeps a horizontal strip while fading both ends.
 */
export type PatternFade = "none" | "top" | "corner" | "center" | "edges" | "center-line";

/** Approved surfaces where Splitz patterns may appear. */
export const PATTERN_USES = [
  "pageTop",
  "cardCorner",
  "divider",
  "emptyState",
  "success",
  "groupCover",
  "signIn",
  "website",
  "social",
  "highlight",
  "store",
  "receipt",
] as const;
export type PatternUse = (typeof PATTERN_USES)[number];

/** Pattern preset and placement rules for a single `PatternUse`. */
export interface PatternUseGuide {
  use: PatternUse;
  tier: PatternTier;
  name: string;
  /** Target surface and placement constraints. */
  where: string;
  /** Design rationale for the chosen pattern and preset. */
  why: string;
  pattern: BrandPattern;
  preset: PatternPreset;
  fade: PatternFade;
  /** `true` when the pattern renders its own opaque background fill; `false` when overlaid on the host surface. */
  ground: boolean;
}

/** Shared baseline defaults overridden selectively by individual `PATTERN_USE_RULES` entries. */
const PRESET_BASE: PatternPreset = {
  cell: 64,
  color: true,
  density: 1,
  direction: "ttb",
  ease: "inOut",
  fill: "solid",
  ground: "white",
  opacity: 1,
  reverse: false,
  scale: 1,
  seed: 7,
  shape: false,
  sizeFrom: 0.35,
  sizeRamp: false,
  stroke: 0.8,
};

const PATTERN_USE_RULES: Record<PatternUse, Omit<PatternUseGuide, "use">> = {
  cardCorner: {
    fade: "corner",
    ground: false,
    name: "Card corner",
    pattern: "checker",
    preset: {
      ...PRESET_BASE,
      density: 1.3,
      direction: "radial",
      opacity: 0.25,
      sizeFrom: 0.2,
      sizeRamp: true,
    },
    tier: "ui",
    where:
      "The top right corner of a card with free space there, for example a group card or a summary card. Text stays out of the corner.",
    why: "The shapes are largest in the corner and fade toward the text, so the card gets a brand mark and no noise.",
  },
  divider: {
    fade: "center-line",
    ground: false,
    name: "Divider",
    pattern: "morph",
    preset: { ...PRESET_BASE, cell: 48, density: 1.7, direction: "ltr", ease: "linear", opacity: 0.3, shape: true },
    tier: "ui",
    where: "A thin strip that closes a section, for example the end of a settlement or of a receipt.",
    why: "A row of dots that turn into diamonds reads as a small, quiet line.",
  },
  emptyState: {
    fade: "center",
    ground: false,
    name: "Empty state",
    pattern: "checker",
    preset: { ...PRESET_BASE, density: 1.7, direction: "radial", opacity: 0.25, sizeFrom: 0.2, sizeRamp: true },
    tier: "ui",
    where: "Behind the icon of an empty state, in a square of 96px or more.",
    why: "The shapes form a soft ring around the icon and fade out before the edge of the square.",
  },
  groupCover: {
    fade: "none",
    ground: true,
    name: "Group cover",
    pattern: "checker",
    preset: { ...PRESET_BASE, direction: "wave", ground: "tint", opacity: 0.3, reverse: true, seed: 34 },
    tier: "ui",
    where: "The cover of a group with no photo. The name and the avatars sit below the cover.",
    why: "The cover takes the place of a photo, so it has its own light ground. The shapes stay faint.",
  },
  highlight: {
    fade: "none",
    ground: true,
    name: "Summary image",
    pattern: "checker",
    preset: {
      ...PRESET_BASE,
      density: 1.3,
      direction: "noise",
      ground: "deep",
      seed: 52,
      sizeFrom: 0.5,
      sizeRamp: true,
    },
    tier: "brand",
    where: "A yearly or monthly summary image, and press graphics. The numbers sit on a solid area.",
    why: "The irregular field looks lively on the deep ground and does not point in one direction.",
  },
  pageTop: {
    fade: "top",
    ground: false,
    name: "Page top",
    pattern: "morph",
    preset: { ...PRESET_BASE, density: 1.3, direction: "ltr", opacity: 0.12, shape: true },
    tier: "ui",
    where: "The top of a page, behind the header and the title only. The fade ends before the first content.",
    why: "A faint field marks the page as Splitz and is gone before the content starts. The dots turn into diamonds from left to right, because the fade hides the lower part.",
  },
  receipt: {
    fade: "none",
    ground: true,
    name: "Exported receipt",
    pattern: "checker",
    preset: {
      ...PRESET_BASE,
      color: false,
      density: 1.3,
      direction: "ltr",
      fill: "split",
      opacity: 0.6,
      seed: 18,
      sizeFrom: 0.5,
    },
    tier: "brand",
    where: "An image of a settlement that a person exports or prints. The text sits on a white area.",
    why: "Outlined dots and solid diamonds stay light on white and print well.",
  },
  signIn: {
    fade: "edges",
    ground: false,
    name: "Sign-in page",
    pattern: "morph",
    preset: { ...PRESET_BASE, ease: "out", fill: "outline", opacity: 0.15, shape: true },
    tier: "ui",
    where:
      "Background of the sign-in screen, keeping shapes along the outer edges while the centered form sits on a clean surface.",
    why: "Subtle outlines frame the edges without encroaching on the form.",
  },
  social: {
    fade: "none",
    ground: true,
    name: "Social post",
    pattern: "checker",
    preset: { ...PRESET_BASE, density: 0.7, direction: "wave", ground: "tint", reverse: true, seed: 34, stroke: 1.2 },
    tier: "brand",
    where: "Social posts and invite images that people share outside the app. The text sits on a solid card.",
    why: "Large, calm shapes on the light brand ground. The wave keeps the image soft.",
  },
  store: {
    fade: "none",
    ground: true,
    name: "Store image",
    pattern: "checker",
    preset: {
      ...PRESET_BASE,
      color: false,
      density: 1.3,
      direction: "diagonal",
      ease: "steps",
      fill: "outline",
      ground: "deep",
      opacity: 0.7,
      seed: 39,
      sizeFrom: 0.2,
    },
    tier: "brand",
    where: "Store images. The glyph or the screenshots sit on solid areas.",
    why: "Thin outlines on the deep ground give texture and keep the glyph the strongest shape.",
  },
  success: {
    fade: "center",
    ground: false,
    name: "Success",
    pattern: "morph",
    preset: {
      ...PRESET_BASE,
      density: 1.3,
      direction: "radial",
      opacity: 0.2,
      shape: true,
      sizeFrom: 0.3,
      sizeRamp: true,
    },
    tier: "ui",
    where: "Behind the icon of a success message, for example after a balance is settled.",
    why: "Dots near the icon turn into diamonds further out, a quiet echo of a settled balance.",
  },
  website: {
    fade: "none",
    ground: true,
    name: "Website hero",
    pattern: "morph",
    preset: { ...PRESET_BASE, density: 0.7, ease: "linear", ground: "brand", seed: 78, shape: true, stroke: 1.2 },
    tier: "brand",
    where: "The hero of the website and large banners. The headline sits on a solid area.",
    why: "The dots at the top turn into diamonds at the bottom, so the image tells the story of settling up.",
  },
};

export const PATTERN_USE_GUIDE: PatternUseGuide[] = PATTERN_USES.map((use) => ({ use, ...PATTERN_USE_RULES[use] }));

/** Rules that apply across all brand patterns. */
export const PATTERN_RULES: BrandRule[] = [
  {
    rule: "Patterns use only the glyph's dot and diamond. Author new patterns in the devtools Patterns tool instead of drawing SVGs by hand.",
    title: "Shapes",
  },
  {
    rule: "Use `ui`-tier presets inside the app and `brand`-tier presets outside the app, following `PATTERN_TIER_GUIDE`. Never apply a `brand` preset inside the app UI.",
    title: "Tiers",
  },
  {
    rule: "Start from the preset and `fade` mask defined in `PATTERN_USE_GUIDE`. Minor density or opacity adjustments are fine; adding a new use case requires user approval.",
    title: "Presets",
  },
  {
    rule: "In the `morph` pattern, always keep `shape: true` so dots transition into diamonds.",
    title: "Dot to diamond",
  },
  {
    rule: "Stick to the four approved pattern grounds (`white`, `tint`, `brand`, `deep`); never use category or status colors.",
    title: "Colors",
  },
  {
    rule: "Outside the app, use outlined shapes only on `white` or `deep` grounds. Inside the app, outlines are permitted at `opacity <= 0.3`.",
    title: "Outlines",
  },
  {
    rule: "Never place the logo, body text, amounts, or buttons directly over visible pattern shapes; keep them on solid regions or faded-out areas, and keep the logo's clear space free of pattern.",
    title: "Content on a pattern",
  },
  {
    rule: "Render at most one pattern per screen, and never place patterns inside lists, forms, sheets, or behind currency amounts.",
    title: "Where not",
  },
  {
    rule: "Pattern regions must be at least 96px wide, and divider strips at least 16px tall, so shapes stay legible.",
    title: "Smallest surface",
  },
];

/**
 * Unresolved brand questions. Ask the user before relying on behavior affected by an open question, then move the
 * decision into the rules above and remove the question.
 */
export const OPEN_QUESTIONS: string[] = [
  "Clear space: `0.5em` around the wordmark and `1/6` width around the standalone glyph are draft values awaiting confirmation.",
  "Minimum size: `16px` for the wordmark font size, standalone glyph, and app icon are draft values awaiting confirmation.",
  "Colorways: should monochrome black or white logos be permitted over photos, store graphics, or print? Currently only `onPage` and `onPlate` are allowed.",
  "Misuse: the eight cases in `MISUSE_GUIDE` are a draft awaiting confirmation or additions.",
  "Pattern motion: may patterns animate on marketing pages or behind settlement confirmation icons? Currently all patterns are static.",
  "In-app pattern delivery: commit exported SVGs from the Patterns tool under `src/assets/`, or ship a runtime generator component? Currently no app screen renders a pattern.",
];
