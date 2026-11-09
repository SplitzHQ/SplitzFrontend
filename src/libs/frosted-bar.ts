import type { CSSProperties } from "vue";

/**
 * The look of a frosted top bar: the home header and `HeaderMobileSecondary`. The page shows through the bar with a
 * blur. The status bar area has the full color, so no content shows behind the time and the battery. Under the status
 * bar, the color fades to the frosted color. A faint bottom line shows while content is under the bar.
 */

/** The opacity of the frosted color, in percent. */
const GLASS_ALPHA = 69;
/** The blur behind the bar, in pixels. */
const GLASS_BLUR_PX = 18;
/** The strength of the bottom line, in percent of `--base-border-quaternary`. */
const GLASS_LINE = 50;
/** Under the status bar, the length of the fade from the full color to the frosted color, in pixels. */
const TOP_FADE_PX = 24;

/** Returns the frosted form of a color, for example `var(--base-bg-primary)`. */
export function frostedColor(color: string): string {
  return `color-mix(in oklch, ${color} ${GLASS_ALPHA}%, transparent)`;
}

/** The input of `frostedBarStyle`. */
export interface FrostedBarOptions {
  /** The full color of the bar. It must be the color of the page under the bar. */
  color: string;
  /** True while content is under the bar. The bottom line then shows. */
  edge: boolean;
  /**
   * The distance from the top of the layer to the top of the screen, as a CSS length expression. A layer that starts
   * above the screen sets it, so the fade still starts under the status bar.
   */
  screenTop?: string;
}

/** Returns the style of the layer behind the content of a frosted bar. The layer needs a bottom border of 1px. */
export function frostedBarStyle({ color, edge, screenTop = "0px" }: FrostedBarOptions): CSSProperties {
  const fadeStart = `calc(${screenTop} + var(--safe-area-top, 0px))`;
  const fadeEnd = `calc(${screenTop} + var(--safe-area-top, 0px) + ${TOP_FADE_PX}px)`;
  return {
    WebkitBackdropFilter: `blur(${GLASS_BLUR_PX}px)`,
    backdropFilter: `blur(${GLASS_BLUR_PX}px)`,
    backgroundColor: frostedColor(color),
    backgroundImage: `linear-gradient(to bottom, ${color} 0, ${color} ${fadeStart}, transparent ${fadeEnd})`,
    borderBottomColor: edge
      ? `color-mix(in oklch, var(--base-border-quaternary) ${GLASS_LINE}%, transparent)`
      : "transparent",
  };
}
