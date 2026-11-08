/**
 * The brand rules of Splitz: the parts of the logo, the logo forms, the colors, the clear space, the minimum size, the
 * misuse, the app icons and the principles of the logo motion. This file is the one place for these rules.
 * Agents read them through the `spz-brand-use` skill. The rules for the logo components are in
 * `brand-wordmark.usage.ts`.
 * The app does not import this file, so the rules do not go into the app bundle.
 */
import { BRAND_COLOR, LIGHT_COLOR } from "./brand-glyph";

/** Where the rules apply. */
export const RULE_SCOPE = {
  app: "All rules in this file apply to `src/`, `public/` and `index.html`.",
  devtools: [
    "A prototype that compares logos, icons or brand colors shows options on purpose. No rule applies to it.",
    "Other tools show the logo with the rules of this file. When a rule does not decide a tool logo, choose and continue.",
  ],
};

/** One rule with a title. */
export interface BrandRule {
  title: string;
  rule: string;
}

/** The parts that make the brand. */
export const ELEMENTS: BrandRule[] = [
  {
    rule: "A dot, a bar and a diamond on a 600 by 600 grid. The bar goes from the bottom left to the top right, the dot is at the top left and the diamond is at the bottom right. The shape is in `brand-glyph.ts`.",
    title: "Glyph",
  },
  {
    rule: "A square with a corner radius of 150 on the same grid, in the plate color. Only the app icons and the full-screen opening use the plate.",
    title: "Plate",
  },
  {
    rule: "The word Splitz as outlines of Manrope 600. The diamond of the glyph replaces the dot of the i, and this diamond is the brand shape. The user chose this in the prototype `2026-11-04-wordmark-split-glyph`, in place of the older live text.",
    title: "Word mark",
  },
  {
    rule: "Two patterns made from the dot and the diamond: dot to diamond, and the checker. The app UI uses them faintly. Brand material outside the app can use them at full strength. The rules are in `PATTERN_TIER_GUIDE`, `PATTERN_USE_GUIDE` and `PATTERN_RULES`.",
    title: "Patterns",
  },
];

/** The forms of the logo. */
export const LOGO_FORMS = ["wordmark", "glyph", "icon"] as const;
export type LogoForm = (typeof LOGO_FORMS)[number];

/** When to use one form of the logo. */
export interface LogoFormGuide {
  form: LogoForm;
  name: string;
  use: string;
}

// A Record makes the type check fail when a new form has no rule.
const FORM_RULES: Record<LogoForm, Omit<LogoFormGuide, "form">> = {
  glyph: {
    name: "Glyph",
    use: "The glyph with no plate, on a page that shows no word. AuthShell shows it, and the collapsed HomePage header shows it at 18px in place of the word. It has the color of the word mark.",
  },
  icon: {
    name: "App icon",
    use: "The glyph in the light color on the plate. Use it only where the system shows the app: the favicon, the home screen, the install dialog and the opening. The icon files add the depth in `ICON_RULES`. The opening stays flat.",
  },
  wordmark: {
    name: "Word mark",
    use: "The default logo. Use it on each surface that shows the brand and is not an icon. The user compared the word alone with the glyph and the word together, and picked the word alone.",
  },
};

export const FORM_GUIDE: LogoFormGuide[] = LOGO_FORMS.map((form) => ({ form, ...FORM_RULES[form] }));

/** The color pairs that the logo can use. */
export const COLORWAYS = ["onPage", "onPlate"] as const;
export type Colorway = (typeof COLORWAYS)[number];

/** One allowed color pair of the logo. */
export interface ColorwayGuide {
  colorway: Colorway;
  name: string;
  /** The color of the logo: a CSS token or a hex value. */
  logo: string;
  /** The color under the logo: a CSS token or a hex value. */
  ground: string;
  use: string;
}

const COLORWAY_RULES: Record<Colorway, Omit<ColorwayGuide, "colorway">> = {
  onPage: {
    ground: "--base-bg-primary",
    logo: "--util-color-brand-700",
    name: "Brand on the page",
    use: "The word mark and the glyph on a page, in both themes. The dark theme gives the token a light value, so do not set a color for dark mode.",
  },
  onPlate: {
    ground: BRAND_COLOR,
    logo: LIGHT_COLOR,
    name: "Light on the plate",
    use: "The app icons and the opening only. Files and the system cannot read CSS tokens, so these are hex values.",
  },
};

export const COLORWAY_GUIDE: ColorwayGuide[] = COLORWAYS.map((colorway) => ({
  colorway,
  ...COLORWAY_RULES[colorway],
}));

/** The rules for the brand colors. The UI colors are in `src/assets/color.css`, and these rules do not cover them. */
export const COLOR_RULES: BrandRule[] = [
  {
    rule: `\`${BRAND_COLOR}\`, the value of \`--core-color-brand-700\`. It is the solid brand color of the UI too, so the icon and the buttons have one color. \`BRAND_COLOR\` in \`brand-glyph.ts\` holds it for code that cannot read tokens. The user picked it in the prototype \`2026-11-05-plate-color\`, because brand-600 looked gray in the favicon and on the home screen.`,
    title: "Plate color",
  },
  {
    rule: `\`${LIGHT_COLOR}\`, the value of \`--core-color-brand-50\`. The glyph on the plate uses it. \`LIGHT_COLOR\` holds it for code. In the icon files, the glyph goes from white at the top to this color at the bottom. The user compared it with pure white and with white at 80 to 90% in \`2026-11-05-plate-color\`, and kept it.`,
    title: "Light color",
  },
  {
    rule: "`--util-color-brand-700`. Do not use another token for the logo. Do not use `BRAND_COLOR` for the logo on a page: the hex has the same value in the light theme, but the token gets a light value in the dark theme.",
    title: "Logo color",
  },
  {
    rule: "If a brand value changes, change these files together: the token in `src/assets`, `brand-glyph.ts`, `PLATE_COLOR_TOKEN` in `BrandOpening.vue`, `public/favicon.svg`, `public/app-icon-masked.svg` and the `mask-icon` color in `index.html`. The two SVG files also hold the stops of the plate gradient: make them again from the new color with `plateStops` in the prototype `2026-11-05-icon-depth`. Then run `bun run generate-pwa-assets`.",
    title: "Change a value",
  },
];

/**
 * The clear space around the logo: no other text, icon or edge goes into it. These values are drafts, see
 * `OPEN_QUESTIONS`.
 */
export const CLEAR_SPACE = {
  /** Around the glyph with no plate, as a share of its width. It is the width of the dot: 100 of 600. */
  glyphShare: 1 / 6,
  /** Around the word mark, as a share of its font size. At the header size of 20px, this is 10px. */
  wordmarkEm: 0.5,
} as const;

/** The smallest sizes on a screen, in CSS pixels. These values are drafts, see `OPEN_QUESTIONS`. */
export const MINIMUM_SIZE = {
  /** The width of the glyph with no plate. */
  glyphPx: 16,
  /** The width of the app icon. The favicon is the smallest use. */
  iconPx: 16,
  /** The font size of the word mark. Below it, the diamond on the i is less than 3px. */
  wordmarkFontPx: 16,
} as const;

/** The ways not to use the logo. */
export const MISUSES = ["stretch", "rotate", "recolor", "effect", "lowContrast", "text", "clip", "lockup"] as const;
export type Misuse = (typeof MISUSES)[number];

/** One way not to use the logo. */
export interface MisuseGuide {
  misuse: Misuse;
  title: string;
  rule: string;
}

const MISUSE_RULES: Record<Misuse, Omit<MisuseGuide, "misuse">> = {
  clip: {
    rule: "The tip of the diamond goes above the box of the word. Do not put a clip or a hidden overflow around the logo.",
    title: "Do not cut the diamond",
  },
  effect: {
    rule: "No shadow, outline, gradient, blur or pattern. The only exception is the depth of the app icon files in `ICON_RULES`. Do not add more effects to them.",
    title: "Do not add effects",
  },
  lockup: {
    rule: "The glyph and the word show together only during the tap motion and during the collapse of the HomePage header. Do not make a fixed logo from the two.",
    title: "Do not put the glyph next to the word",
  },
  lowContrast: {
    rule: "The logo needs 3:1 contrast or more against the color under it. Do not put it on a photo or on a busy pattern.",
    title: "Do not use low contrast",
  },
  recolor: {
    rule: "Use only the colorways in this file. A category color, a status color or a gradient is not a logo color.",
    title: "Do not change the color",
  },
  rotate: { rule: "The logo always stands up.", title: "Do not turn the logo" },
  stretch: {
    rule: "Keep the proportions. Change the size of the word mark only with its `size` prop.",
    title: "Do not stretch the logo",
  },
  text: {
    rule: "A heading or a span with the word Splitz is not a logo. Use the component. In a sentence, Splitz is usual text.",
    title: "Do not write the logo as text",
  },
};

export const MISUSE_GUIDE: MisuseGuide[] = MISUSES.map((misuse) => ({ misuse, ...MISUSE_RULES[misuse] }));

/** The rules for `brand-glyph.ts`, the source of the glyph. */
export const GLYPH_RULES: BrandRule[] = [
  {
    rule: "`brand-glyph.ts` holds the shape of the glyph and the two brand colors. The motion and the components use the shape.",
    title: "One source",
  },
  {
    rule: "Prototypes import `brand-glyph.ts`, so keep its exports when you change it.",
    title: "Exports",
  },
  {
    rule: "`brand-motion.ts` has the center of the dot and of the diamond, and the size of the diamond. If you change the numbers in `brand-glyph.ts`, change these numbers too. A test checks the diamond.",
    title: "Motion numbers",
  },
  {
    rule: "`public/favicon.svg` and `public/app-icon-masked.svg` draw the same shape. If you change the numbers in `brand-glyph.ts`, change these files and generate the icons again.",
    title: "Icons",
  },
];

/** One icon file in `public/`. */
export interface IconFile {
  path: string;
  /** The width and the height in pixels. The SVG has its view box size. */
  px: number;
  /** True when the system cuts the shape, so the file is a square with no margin. */
  masked: boolean;
  use: string;
}

/**
 * The icon files. `bun run generate-pwa-assets` makes the PNG and ICO files from the two SVG files: the clear icons from
 * `public/favicon.svg` and the masked icons from `public/app-icon-masked.svg`.
 */
export const ICON_FILES: IconFile[] = [
  {
    masked: false,
    path: "public/favicon.svg",
    px: 600,
    use: "The source of the clear icons, and the favicon of new browsers.",
  },
  {
    masked: true,
    path: "public/app-icon-masked.svg",
    px: 600,
    use: "The source of the masked icons. No page shows it.",
  },
  { masked: false, path: "public/favicon.ico", px: 48, use: "The favicon of old browsers." },
  { masked: false, path: "public/pwa-64x64.png", px: 64, use: "The small icon of the installed app." },
  { masked: false, path: "public/pwa-192x192.png", px: 192, use: "The icon of the installed app on Android." },
  {
    masked: false,
    path: "public/pwa-512x512.png",
    px: 512,
    use: "The large icon of the installed app and its splash screen.",
  },
  {
    masked: true,
    path: "public/maskable-icon-512x512.png",
    px: 512,
    use: "The Android icon that the system cuts into its own shape.",
  },
  { masked: true, path: "public/apple-touch-icon-180x180.png", px: 180, use: "The iOS home screen icon." },
];

/** The maskable safe zone: a circle in the middle with this share of the radius of the icon. */
export const MASKABLE_SAFE_ZONE = 0.8;

/** The rules for the app icons. */
export const ICON_RULES: BrandRule[] = [
  {
    rule: "Do not edit a PNG or the ICO by hand. Change `public/favicon.svg` and `public/app-icon-masked.svg` together, then run `bun run generate-pwa-assets`. The options are in `pwa-assets.config.ts` and `pwa-assets-masked.config.ts`.",
    title: "Generate the files",
  },
  {
    rule: "The apple and maskable icons are opaque squares with no margin. The system cuts the shape, so their source `public/app-icon-masked.svg` has no corner radius of its own. Its rim and sheen follow the iOS cut, a radius of about 134 on the 600 grid. Android masks cut away most of the rim.",
    title: "Masked icons",
  },
  {
    rule: "The icon files draw look E of the prototype `2026-11-05-icon-depth`, with these strengths: gradient 0.5, shadow 0.2 and highlight 0.6. The plate goes from a lighter top to a darker bottom and has a light rim and a soft sheen at the top. The glyph goes from white to the light color, has a thin light edge at the top and casts a soft shadow. A Home Screen web app gives iOS one PNG, so the system adds no depth of its own. All effects are plain SVG, so the icon generator can draw them.",
    title: "Depth",
  },
  {
    rule: "The farthest point of the glyph is at 71% of the radius of the icon. The maskable safe zone ends at 80%, so the glyph needs no padding. Keep the glyph inside the safe zone when its shape changes.",
    title: "Safe zone",
  },
  {
    rule: "The favicon and the `pwa-*` icons keep the rounded plate on a clear ground.",
    title: "Clear icons",
  },
  {
    rule: "iOS does not update an icon that a person already added. To check a new icon on a phone, remove the old icon from the home screen and add the app again.",
    title: "Check on a phone",
  },
];

/** The principles of the logo motion. The values are in `brand-motion.ts`. The component rules are in `brand-wordmark.usage.ts`. */
export const MOTION_RULES: BrandRule[] = [
  {
    rule: "The logo moves only in the opening, after a tap, and when the HomePage header collapses. It does not move by itself, for example in a loop or on hover.",
    title: "When it moves",
  },
  {
    rule: "When the page scrolls, the HomePage header collapses and the word changes to the glyph with the same progress as the search field. The change keeps the diamond: the letters leave, the diamond on the i moves to the place of the diamond in the glyph, and the dot and the bar grow. It follows the scroll, so it stops and goes back with the person. The user picked it in the prototype `2026-11-05-home-motion`, and allowed this case.",
    title: "The header collapse",
  },
  {
    rule: "One circle comes in and becomes two small circles. One goes to the place of the dot, the other goes to the place of the diamond and becomes the diamond. The bar grows between them.",
    title: "The small motion",
  },
  {
    rule: "The opening, a tap on the word mark and a tap on the glyph play the same small motion. Only the speed is different. Change all of them together.",
    title: "One motion",
  },
  {
    rule: "The motion takes no time from the person. The page is already under the opening, and the opening and a tap take no pointer events from the page.",
    title: "No wait",
  },
  {
    rule: "Under reduced motion the opening does not show, and a tap does nothing.",
    title: "Reduced motion",
  },
  {
    rule: "The times come from the prototype `2026-11-04-logo-opening`. Use the curves of `src/libs/motion.ts`.",
    title: "Source",
  },
];

/**
 * The brand patterns. Each pattern fills a surface with the dot and the diamond of the glyph. The Patterns tool in the
 * dev tools draws them from the presets in this file and saves them as SVG files. The user chose the patterns and the
 * presets in the prototype `2026-11-05-logo-pattern` and in the gallery of the Patterns tool.
 */
export const PATTERNS = ["morph", "checker"] as const;
export type BrandPattern = (typeof PATTERNS)[number];

/** What one pattern is and what it means. */
export interface PatternGuide {
  pattern: BrandPattern;
  name: string;
  /** The shapes and how they change. */
  look: string;
  /** The idea of the product that the pattern shows. */
  meaning: string;
}

const PATTERN_LOOKS: Record<BrandPattern, Omit<PatternGuide, "pattern">> = {
  checker: {
    look: "Dots and diamonds in a checker. Each shape keeps its kind. The color, the size or the opacity changes across the surface.",
    meaning: "The members of a group, side by side.",
    name: "Checker",
  },
  morph: {
    look: "Rows of shapes. Along one direction, each dot turns into a diamond. The color changes with the shape.",
    meaning:
      "A balance that goes from open to settled. The dot is the open balance and the diamond is the settled one.",
    name: "Dot to diamond",
  },
};

export const PATTERN_GUIDE: PatternGuide[] = PATTERNS.map((pattern) => ({ pattern, ...PATTERN_LOOKS[pattern] }));

/**
 * All settings of one pattern. The names and the values are the same as in `devtools/patterns/playground.ts`, so the
 * Patterns tool can draw a preset as it is. Lengths are in the units of a box that is 640 wide.
 */
export interface PatternPreset {
  /** The size of one repeat. */
  cell: number;
  /** The size of the shapes against the cell. */
  scale: number;
  /** The seed of the `noise` direction. */
  seed: number;
  /** The number of shapes against the default grid, in each direction. */
  density: number;
  direction: "ltr" | "ttb" | "diagonal" | "radial" | "wave" | "noise";
  /** True when the change starts from the other side. */
  reverse: boolean;
  ease: "linear" | "in" | "out" | "inOut" | "steps";
  /** True when the color changes from the dot color to the diamond color. */
  color: boolean;
  /** True when the size changes from `sizeFrom` to the full size. */
  sizeRamp: boolean;
  sizeFrom: number;
  /** True when a dot turns into a diamond. Only the `morph` pattern reads it. */
  shape: boolean;
  /** `split` draws the dots as outlines and fills the diamonds. `grow` goes from an outline to a solid shape. */
  fill: "solid" | "outline" | "split" | "grow";
  /** The width of an outline. */
  stroke: number;
  /** The ground and its shape colors. `devtools/patterns/playground.ts` has the tokens of each ground. */
  ground: "white" | "tint" | "brand" | "deep";
  /** The opacity of all shapes together. The ground stays opaque. */
  opacity: number;
}

/**
 * The two tiers of pattern use. In the app UI a pattern is subtle and stays behind the content. Outside the app a
 * pattern can be strong. The user decided this after the first use cases were too strong for the UI.
 */
export const PATTERN_TIERS = ["ui", "brand"] as const;
export type PatternTier = (typeof PATTERN_TIERS)[number];

/** Where one tier applies and its limits. */
export interface PatternTierGuide {
  tier: PatternTier;
  name: string;
  where: string;
  limits: string[];
}

const PATTERN_TIER_RULES: Record<PatternTier, Omit<PatternTierGuide, "tier">> = {
  brand: {
    limits: [
      "Full strength is allowed. Start from the preset of a brand use.",
      "Do not use a brand preset in the app UI. It is too strong next to content.",
    ],
    name: "Outside the app",
    where: "The website, store images, social posts, press material, and images that a person exports or prints.",
  },
  ui: {
    limits: [
      "Keep the opacity of the shapes at 0.3 or less.",
      "Cover a third of the screen or less.",
      "Fade the shapes toward the content with the fade of the use.",
      "Let the pattern sit on the surface under it. A UI pattern has no ground of its own, except a group cover.",
    ],
    name: "In the app",
    where: "The screens of the app.",
  },
};

export const PATTERN_TIER_GUIDE: PatternTierGuide[] = PATTERN_TIERS.map((tier) => ({
  tier,
  ...PATTERN_TIER_RULES[tier],
}));

/**
 * Where the shapes of a pattern stay. The shapes fade away from that place, so a UI pattern blends into the surface.
 * `top` and `corner` keep one edge. `center` keeps the middle. `edges` keeps the edges and clears the middle.
 * `center-line` keeps the middle of a strip and fades both ends.
 */
export type PatternFade = "none" | "top" | "corner" | "center" | "edges" | "center-line";

/** The places where the app or the brand can show a pattern. */
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

/** The pattern and the preset for one use. */
export interface PatternUseGuide {
  use: PatternUse;
  tier: PatternTier;
  name: string;
  /** Where the pattern goes. */
  where: string;
  /** Why this pattern and this preset fit. */
  why: string;
  pattern: BrandPattern;
  preset: PatternPreset;
  fade: PatternFade;
  /** True when the pattern brings its own ground. False when it sits on the surface under it. */
  ground: boolean;
}

/** The settings that most presets share. A preset changes only what it needs. */
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
      "The background of the sign-in page. The shapes stay at the edges, and the form in the middle sits on clear page.",
    why: "Thin outlines at the edges frame the form and do not touch it.",
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

/** The rules for every pattern. */
export const PATTERN_RULES: BrandRule[] = [
  {
    rule: "A pattern uses only the dot and the diamond of the glyph. Make a new pattern in the Patterns tool. Do not draw one by hand.",
    title: "Shapes",
  },
  {
    rule: "Use a `ui` use in the app UI and a `brand` use outside the app. Do not use a brand preset in the app UI. The limits of each tier are in `PATTERN_TIER_GUIDE`.",
    title: "Tiers",
  },
  {
    rule: "Start from the preset and the fade of the use in `PATTERN_USE_GUIDE`. A small change to the density or the opacity is allowed. A new use needs the decision of the user.",
    title: "Presets",
  },
  {
    rule: "In the `morph` pattern, a dot always turns into a diamond. Do not set `shape` to false. The user asked for this.",
    title: "Dot to diamond",
  },
  {
    rule: "Use the grounds of the Patterns tool: white, light brand, brand and deep. Do not use a category color or a status color.",
    title: "Colors",
  },
  {
    rule: "Outside the app, use an outline only on the white ground and on the deep ground. In the app, an outline is allowed at opacity 0.3 or less.",
    title: "Outlines",
  },
  {
    rule: "The logo, text, numbers and buttons never sit directly on a pattern. Put them on a solid area or on a part that the fade clears. Keep the clear space of the logo free of the pattern.",
    title: "Content on a pattern",
  },
  {
    rule: "Show one pattern on a screen. Do not put a pattern in a list, in a form, in a sheet or behind an amount.",
    title: "Where not",
  },
  {
    rule: "A pattern surface is 96px wide or more. A divider strip is 16px high or more. Below that, the shapes become noise.",
    title: "Smallest surface",
  },
];

/**
 * Decisions that the user has not made. Ask the user before you rely on a rule that one of these questions affects.
 * Remove a question when the user decides it, and write the decision into the rules above.
 */
export const OPEN_QUESTIONS: string[] = [
  "Clear space: 0.5 em around the word mark and 1/6 of the width around the glyph are drafts. Confirm or change them.",
  "Minimum size: 16px for the font size of the word mark, for the glyph and for the app icon are drafts. Confirm or change them.",
  "Colorways: may the logo be one-color black or white, for example on a photo, in a store screenshot or in print? Now only the two colorways in this file are allowed.",
  "Misuse: the eight cases are a draft. Add, remove or change them.",
  "Pattern motion: may a pattern move, for example on the website or behind the success icon? Now all patterns are still.",
  "Pattern in the app: save SVG files from the Patterns tool into `src/assets`, or move the generator into a component? Now the app shows no pattern.",
];
