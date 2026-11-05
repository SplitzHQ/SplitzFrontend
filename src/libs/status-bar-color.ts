import { onScopeDispose, shallowRef, toRef, watch, type MaybeRefOrGetter, type Ref } from "vue";

/**
 * The color of the area behind the status bar of a phone. This file is the one place that sets this color. A screen
 * or an overlay tells this file what it shows, and does not set a color itself.
 *
 * Real iPhone results (iOS 18 and iOS 27.0.1, November 2026):
 * - iOS 18 reads only the theme-color tag, in Safari and in a Home Screen app. A script can change the tag on each
 *   frame, and the bar follows smoothly.
 * - iOS 27 ignores the tag. It reads the `body` background, or a fixed layer at the top of the screen when one appears.
 *   It does not read a layer that fades in from transparent, and it holds the color while a full-screen fixed layer
 *   stays. The bar changes at one moment and cannot fade.
 *
 * So this file writes all of these values, and each iOS version uses the value that it can read.
 */

/** The token of the page background. The bar has this color when no page sets another color. */
const PAGE_BACKGROUND_TOKEN = "--base-bg-primary";
/** The token of the color that a backdrop puts over the page. */
const SCRIM_TOKEN = "--base-bg-scrim";
/**
 * How much sooner the tag starts its fade than the page in a Home Screen app, in milliseconds. On a real iPhone with
 * iOS 18, the bar and the page are in step with this value there, and with no lead in Safari.
 */
const HOME_SCREEN_LEAD_MS = 20;
/**
 * A tool can set these variables on the root element, to start the fade of the tag sooner than the page. A negative
 * time starts it later. The app does not set them.
 */
export const STATUS_BAR_LEAD_VARIABLES = { close: "--status-bar-lead-close", open: "--status-bar-lead-open" } as const;
/** The height of the invisible layer. iOS does not read a layer of 10px or less. */
const TINT_HEIGHT = "24px";
/** Puts the invisible layer over each overlay. A tap goes through it, so its order changes only what iOS reads. */
const TINT_Z_INDEX = "9999";

/** Returns how much sooner the tag starts its fade than the page on this device, in milliseconds. */
export function defaultStatusBarLeadMs(): number {
  // Only iOS has this property. Other systems have no measured lead.
  const { standalone } = navigator as Navigator & { standalone?: boolean };
  return standalone === true ? HOME_SCREEN_LEAD_MS : 0;
}

/** The number of backdrops that show now. Two sheets can be open at once, and each one dims the page again. */
const scrimCount = shallowRef(0);
/** The token of the color at the top of the current page. Null means the page background. */
const topColorToken = shallowRef<string | null>(null);
/** The token of a full-screen layer that covers the page. Null when no such layer shows. */
const heldColorToken = shallowRef<string | null>(null);

/** Returns the token of the color that the bar must have now. Null means the page background. */
function activeToken(): string | null {
  return heldColorToken.value ?? topColorToken.value;
}

/** Reads a color in hex or `rgb()` form as red, green, blue and alpha. The alpha is from 0 to 1. */
function parseColor(value: string): [number, number, number, number] | null {
  const hex = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?$/i.exec(value);
  if (hex) {
    const [, red, green, blue, alpha] = hex;
    return [
      Number.parseInt(red ?? "0", 16),
      Number.parseInt(green ?? "0", 16),
      Number.parseInt(blue ?? "0", 16),
      alpha ? Number.parseInt(alpha, 16) / 255 : 1,
    ];
  }
  const numbers = /^rgba?\(([^)]+)\)$/i
    .exec(value)?.[1]
    ?.split(/[\s,/]+/)
    .map(Number);
  if (!numbers || numbers.length < 3 || numbers.some(Number.isNaN)) return null;
  return [numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0, numbers[3] ?? 1];
}

/** Returns the solid color of the top of the page, under each backdrop that shows. Returns null when a token is not a known form. */
function currentColor(): string | null {
  const styles = getComputedStyle(document.documentElement);
  const base = parseColor(styles.getPropertyValue(activeToken() ?? PAGE_BACKGROUND_TOKEN).trim());
  if (!base) return null;
  const scrim = parseColor(styles.getPropertyValue(SCRIM_TOKEN).trim()) ?? [0, 0, 0, 0];
  const visible = (1 - scrim[3]) ** scrimCount.value;
  const channels = [0, 1, 2].map((index) => {
    const baseChannel = base[index] ?? 0;
    const scrimChannel = scrim[index] ?? 0;
    return Math.round(scrimChannel + (baseChannel - scrimChannel) * visible);
  });
  return `rgb(${channels.join(", ")})`;
}

/** Makes an element that the viewer cannot see and cannot tap. */
function makeHiddenLayer(style: string): HTMLElement {
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = `position: fixed; pointer-events: none; ${style}`;
  document.body.append(layer);
  return layer;
}

/** Starts to write the color, and returns the function that stops this and removes what it added. */
function startStatusBarColor(): () => void {
  const existingMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const meta = existingMeta ?? document.head.appendChild(document.createElement("meta"));
  meta.name = "theme-color";

  const fadeSource = makeHiddenLayer("width: 0; height: 0; visibility: hidden; transition: none;");
  // iOS 27 reads this strip. The filter hides it, but on iOS 27 a full-screen layer with this filter grays the sheet.
  const tint = makeHiddenLayer(
    `inset: 0 0 auto; height: ${TINT_HEIGHT}; z-index: ${TINT_Z_INDEX}; filter: opacity(0); transition: none; display: none;`
  );

  let fadeFrame = 0;
  let tintFrame = 0;
  let startFrame = 0;
  let lastScrimCount = scrimCount.value;

  /** Copies the fade color to the tag on each frame, until the fade ends. */
  function followFade(): void {
    cancelAnimationFrame(fadeFrame);
    meta.content = getComputedStyle(fadeSource).backgroundColor;
    if (fadeSource.getAnimations?.().length) fadeFrame = requestAnimationFrame(followFade);
  }

  /** Shows the layer while a backdrop shows. iOS reads a layer when it appears, so a new color needs a new appearance. */
  function updateTint(color: string): void {
    cancelAnimationFrame(tintFrame);
    tint.style.backgroundColor = color;
    const wasShown = tint.style.display !== "none";
    tint.style.display = scrimCount.value > 0 && !wasShown ? "block" : "none";
    if (scrimCount.value > 0 && wasShown) {
      tintFrame = requestAnimationFrame(() => {
        tint.style.display = "block";
      });
    }
  }

  /** Starts the fade of the tag to this color. */
  function fadeTo(color: string): void {
    fadeSource.style.backgroundColor = color;
    followFade();
  }

  function apply(): void {
    const color = currentColor();
    if (!color) return;
    // iOS 27 reads this color. The app has its own background over the body, so the viewer does not see this change.
    const token = activeToken();
    document.body.style.backgroundColor = token ? `var(${token})` : "";
    updateTint(color);

    const change = scrimCount.value - lastScrimCount;
    lastScrimCount = scrimCount.value;
    cancelAnimationFrame(startFrame);
    if (change === 0) {
      fadeTo(color);
      return;
    }
    const lead = change > 0 ? STATUS_BAR_LEAD_VARIABLES.open : STATUS_BAR_LEAD_VARIABLES.close;
    fadeSource.style.transitionDelay = `calc(var(${lead}, ${defaultStatusBarLeadMs()}ms) * -1)`;
    // A Vue `Transition` waits two frames before it starts the fade of a backdrop, so the tag starts on the same frame.
    startFrame = requestAnimationFrame(() => {
      startFrame = requestAnimationFrame(() => fadeTo(color));
    });
  }

  const stopWatch = watch([scrimCount, topColorToken, heldColorToken], apply);
  // The theme is a class on the root element, and it changes the values of the tokens.
  const themeObserver = new MutationObserver(apply);
  themeObserver.observe(document.documentElement, { attributeFilter: ["class"], attributes: true });
  apply();
  // The first color has no fade, so the bar does not start from transparent. CSS then gives each frame of a fade, so the
  // tag follows the motion tokens, also for reduced motion.
  fadeSource.style.transition = "background-color var(--motion-duration-sheet) var(--motion-easing-sheet)";

  return () => {
    stopWatch();
    themeObserver.disconnect();
    cancelAnimationFrame(fadeFrame);
    cancelAnimationFrame(tintFrame);
    cancelAnimationFrame(startFrame);
    fadeSource.remove();
    tint.remove();
    document.body.style.backgroundColor = "";
    if (!existingMeta) meta.remove();
  };
}

/**
 * Keeps the status bar area in step with the page. Call this function once for a page: `App.vue` calls it for the app,
 * and the phone view of a prototype calls it while the view is open.
 */
export function useStatusBarColor(enabled: MaybeRefOrGetter<boolean> = true): void {
  watch(
    toRef(enabled),
    (isEnabled, _previous, onCleanup) => {
      if (isEnabled) onCleanup(startStatusBarColor());
    },
    { immediate: true }
  );
}

/**
 * Dims the status bar area while `open` is true. Each overlay with a backdrop must call this function.
 *
 * On iOS 27 the bar stays dim while a full-screen fixed layer stays. So a fixed backdrop must stop being fixed when its
 * way out starts. `Sheet.vue` has the example.
 */
export function useStatusBarDim(open: Readonly<Ref<boolean>>): void {
  watch(
    open,
    (isOpen, _previous, onCleanup) => {
      if (!isOpen) return;
      scrimCount.value += 1;
      onCleanup(() => {
        scrimCount.value -= 1;
      });
    },
    { immediate: true }
  );
}

/**
 * Gives the status bar area the color of a full-screen layer that covers the page, such as the opening of the app.
 * Returns the function that gives the area back to the page. Call it when the layer starts to leave.
 *
 * On iOS 27 the bar holds the color while a full-screen fixed layer stays. So the layer must stop being fixed when its way
 * out starts. `BrandOpening.vue` has the example.
 * @param token - The name of a color token.
 */
export function holdStatusBarColor(token: string): () => void {
  heldColorToken.value = token;
  return () => {
    if (heldColorToken.value === token) heldColorToken.value = null;
  };
}

/**
 * Gives the status bar area the color at the top of this page. Use this function on a page whose top has another color
 * than the page background. The bar keeps this color when the top of the page scrolls away.
 * @param token - The name of a color token, for example `--base-bg-secondary_alt`.
 */
export function useStatusBarTopColor(token: string): void {
  topColorToken.value = token;
  onScopeDispose(() => {
    if (topColorToken.value === token) topColorToken.value = null;
  });
}
