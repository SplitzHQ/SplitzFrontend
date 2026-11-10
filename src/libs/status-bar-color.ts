import { onScopeDispose, shallowRef, toRef, watch, type MaybeRefOrGetter, type Ref } from "vue";

/**
 * Controls the color behind the phone's status bar. Screens and overlays report their state here instead of
 * touching the DOM or `<meta name="theme-color">` directly.
 *
 * Behavior tested on physical iPhones (iOS 18 and iOS 27.0.1, November 2026):
 * - iOS 18 only reads `<meta name="theme-color">`, both in Safari and when installed to the Home Screen. Updating
 *   that tag on every animation frame makes the status bar fade smoothly.
 * - iOS 27 ignores `<meta name="theme-color">`. Instead, it samples the `body` background or a fixed element
 *   appearing at the top of the viewport. It misses elements that fade in from `opacity: 0`, and it locks onto a
 *   color for as long as a full-screen `position: fixed` element remains on screen. Because of that, the status bar
 *   snaps to the new color instead of fading.
 *
 * This module updates all three mechanisms (`<meta name="theme-color">`, `document.body` background, and a hidden
 * top strip) so each iOS version picks up the source it supports.
 */

/** Default CSS variable for the page background, used when no screen overrides the top color. */
const DEFAULT_PAGE_BG_TOKEN = "--base-bg-primary";
/** CSS variable for the modal backdrop (scrim) color. */
const BACKDROP_SCRIM_TOKEN = "--base-bg-scrim";
/**
 * How many milliseconds early to start the `<meta name="theme-color">` transition in a Home Screen web app.
 * On an iOS 18 iPhone, a 20ms head start keeps the status bar fade visually in sync with the page, whereas Safari
 * needs no offset.
 */
const HOME_SCREEN_LEAD_MS = 20;
/**
 * Optional CSS variables that dev tools can set on `:root` to tune how early `<meta name="theme-color">` starts
 * fading (negative values delay it). Production code leaves these unset.
 */
export const STATUS_BAR_LEAD_VARIABLES = { close: "--status-bar-lead-close", open: "--status-bar-lead-open" } as const;
/** Height of the hidden top strip sampled by iOS 27 (iOS ignores strips 10px or shorter). */
const TOP_SAMPLING_STRIP_HEIGHT = "24px";
/** Places the hidden top strip above open overlays for iOS color sampling. `pointer-events: none` lets taps pass through. */
const TOP_SAMPLING_STRIP_Z_INDEX = "9999";

/** Returns the default head start (in ms) for `<meta name="theme-color">` transitions on the current device. */
export function defaultStatusBarLeadMs(): number {
  // `navigator.standalone` is iOS-only and is true when running from the Home Screen.
  const { standalone } = navigator as Navigator & { standalone?: boolean };
  return standalone === true ? HOME_SCREEN_LEAD_MS : 0;
}

/** Number of active modal backdrops. Stacked sheets each add a backdrop and dim the page further. */
const openBackdropCount = shallowRef(0);
/** CSS variable for the color at the top of the current screen, or `null` to use the default page background. */
const pageTopColorToken = shallowRef<string | null>(null);
/** CSS variable held by a full-screen overlay covering the page, or `null` when none is active. */
const fullScreenOverrideToken = shallowRef<string | null>(null);

/** Returns the active CSS color variable for the status bar, or `null` for the default page background. */
function getActiveColorToken(): string | null {
  return fullScreenOverrideToken.value ?? pageTopColorToken.value;
}

/** Parses a hex or `rgb()`/`rgba()` color string into `[r, g, b, a]`, with alpha normalized to `0..1`. */
function parseRgbaColor(cssColor: string): [number, number, number, number] | null {
  const hexMatch = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?$/i.exec(cssColor);
  if (hexMatch) {
    const [, red, green, blue, alpha] = hexMatch;
    return [
      Number.parseInt(red ?? "0", 16),
      Number.parseInt(green ?? "0", 16),
      Number.parseInt(blue ?? "0", 16),
      alpha ? Number.parseInt(alpha, 16) / 255 : 1,
    ];
  }
  const rgbaChannels = /^rgba?\(([^)]+)\)$/i
    .exec(cssColor)?.[1]
    ?.split(/[\s,/]+/)
    .map(Number);
  if (!rgbaChannels || rgbaChannels.length < 3 || rgbaChannels.some(Number.isNaN)) return null;
  return [rgbaChannels[0] ?? 0, rgbaChannels[1] ?? 0, rgbaChannels[2] ?? 0, rgbaChannels[3] ?? 1];
}

/**
 * Computes the final opaque `rgb(...)` color at the top of the screen after blending any active backdrops over the
 * base color. Returns `null` if the CSS variable cannot be parsed.
 */
function computeBlendedStatusBarColor(): string | null {
  const rootStyles = getComputedStyle(document.documentElement);
  const baseColor = parseRgbaColor(rootStyles.getPropertyValue(getActiveColorToken() ?? DEFAULT_PAGE_BG_TOKEN).trim());
  if (!baseColor) return null;
  const scrimColor = parseRgbaColor(rootStyles.getPropertyValue(BACKDROP_SCRIM_TOKEN).trim()) ?? [0, 0, 0, 0];
  const scrimAlpha = scrimColor[3];
  const baseColorWeight = (1 - scrimAlpha) ** openBackdropCount.value;
  const blendedRgb = [0, 1, 2].map((channelIndex) => {
    const baseChannel = baseColor[channelIndex] ?? 0;
    const scrimChannel = scrimColor[channelIndex] ?? 0;
    return Math.round(scrimChannel + (baseChannel - scrimChannel) * baseColorWeight);
  });
  return `rgb(${blendedRgb.join(", ")})`;
}

/** Appends a fixed, non-interactive hidden `div` to `document.body`. */
function appendHiddenFixedElement(inlineStyle: string): HTMLElement {
  const element = document.createElement("div");
  element.setAttribute("aria-hidden", "true");
  element.style.cssText = `position: fixed; pointer-events: none; ${inlineStyle}`;
  document.body.append(element);
  return element;
}

/** Mounts the status bar color sync and returns a cleanup function that restores the DOM. */
function mountStatusBarColorSync(): () => void {
  const existingThemeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const themeColorMeta = existingThemeColorMeta ?? document.head.appendChild(document.createElement("meta"));
  themeColorMeta.name = "theme-color";

  const colorTransitionProbe = appendHiddenFixedElement("width: 0; height: 0; visibility: hidden; transition: none;");
  // iOS 27 samples this top strip when a backdrop is open. `filter: opacity(0)` keeps it invisible to the user while
  // still letting iOS read its color (kept to a thin strip because a full-screen layer with this filter tints the sheet gray on iOS 27).
  const topSamplingStrip = appendHiddenFixedElement(
    `inset: 0 0 auto; height: ${TOP_SAMPLING_STRIP_HEIGHT}; z-index: ${TOP_SAMPLING_STRIP_Z_INDEX}; filter: opacity(0); transition: none; display: none;`
  );

  let metaSyncFrameId = 0;
  let stripRemountFrameId = 0;
  let delayedStartFrameId = 0;
  let previousBackdropCount = openBackdropCount.value;

  /** Copies the interpolated background color from `colorTransitionProbe` into `<meta name="theme-color">` on each frame while the CSS transition runs. */
  function syncMetaTagWithTransition(): void {
    cancelAnimationFrame(metaSyncFrameId);
    themeColorMeta.content = getComputedStyle(colorTransitionProbe).backgroundColor;
    if (colorTransitionProbe.getAnimations?.().length) {
      metaSyncFrameId = requestAnimationFrame(syncMetaTagWithTransition);
    }
  }

  /**
   * Shows the top sampling strip whenever at least one backdrop is open. Because iOS 27 only samples a fixed layer when
   * it first appears, changing the color while already visible requires hiding the strip for one frame and showing it again.
   */
  function updateTopSamplingStrip(color: string): void {
    cancelAnimationFrame(stripRemountFrameId);
    topSamplingStrip.style.backgroundColor = color;
    const wasVisible = topSamplingStrip.style.display !== "none";
    const hasOpenBackdrop = openBackdropCount.value > 0;
    topSamplingStrip.style.display = hasOpenBackdrop && !wasVisible ? "block" : "none";
    if (hasOpenBackdrop && wasVisible) {
      stripRemountFrameId = requestAnimationFrame(() => {
        topSamplingStrip.style.display = "block";
      });
    }
  }

  /** Transitions `colorTransitionProbe` to `targetColor` and syncs `<meta name="theme-color">` on each animation frame. */
  function startMetaColorTransition(targetColor: string): void {
    colorTransitionProbe.style.backgroundColor = targetColor;
    syncMetaTagWithTransition();
  }

  function syncStatusBarColor(): void {
    const blendedColor = computeBlendedStatusBarColor();
    if (!blendedColor) return;
    // iOS 27 reads `document.body` when no top strip is shown. The app draws its own background over `body`, so
    // setting this style only affects the status bar.
    const activeColorToken = getActiveColorToken();
    document.body.style.backgroundColor = activeColorToken ? `var(${activeColorToken})` : "";
    updateTopSamplingStrip(blendedColor);

    const backdropCountDelta = openBackdropCount.value - previousBackdropCount;
    previousBackdropCount = openBackdropCount.value;
    cancelAnimationFrame(delayedStartFrameId);
    if (backdropCountDelta === 0) {
      startMetaColorTransition(blendedColor);
      return;
    }
    const leadTimeCssVar = backdropCountDelta > 0 ? STATUS_BAR_LEAD_VARIABLES.open : STATUS_BAR_LEAD_VARIABLES.close;
    colorTransitionProbe.style.transitionDelay = `calc(var(${leadTimeCssVar}, ${defaultStatusBarLeadMs()}ms) * -1)`;
    // Wait two frames to match Vue's `<Transition>`, which delays starting the backdrop fade by two frames.
    delayedStartFrameId = requestAnimationFrame(() => {
      delayedStartFrameId = requestAnimationFrame(() => startMetaColorTransition(blendedColor));
    });
  }

  const stopWatch = watch([openBackdropCount, pageTopColorToken, fullScreenOverrideToken], syncStatusBarColor);
  // Re-apply when the root theme class changes so updated CSS variable values take effect.
  const themeObserver = new MutationObserver(syncStatusBarColor);
  themeObserver.observe(document.documentElement, { attributeFilter: ["class"], attributes: true });
  syncStatusBarColor();
  // Enable the CSS transition only after the initial color is applied so the status bar does not fade in from
  // transparent on load. Using CSS transitions lets `colorTransitionProbe` follow the sheet motion tokens and respect reduced motion.
  colorTransitionProbe.style.transition = "background-color var(--motion-duration-sheet) var(--motion-easing-sheet)";

  return () => {
    stopWatch();
    themeObserver.disconnect();
    cancelAnimationFrame(metaSyncFrameId);
    cancelAnimationFrame(stripRemountFrameId);
    cancelAnimationFrame(delayedStartFrameId);
    colorTransitionProbe.remove();
    topSamplingStrip.remove();
    document.body.style.backgroundColor = "";
    if (!existingThemeColorMeta) themeColorMeta.remove();
  };
}

/**
 * Keeps the phone status bar color synced with the current screen and active overlays. Call once at the root
 * (`App.vue` in the main app, or inside a prototype's phone preview while open).
 */
export function useStatusBarColor(enabled: MaybeRefOrGetter<boolean> = true): void {
  watch(
    toRef(enabled),
    (isEnabled, _previous, onCleanup) => {
      if (isEnabled) onCleanup(mountStatusBarColorSync());
    },
    { immediate: true }
  );
}

/**
 * Dims the status bar while `open` is true. Call this in every overlay component that renders a backdrop.
 *
 * Note for iOS 27: iOS keeps the status bar dimmed for as long as a full-screen `position: fixed` element remains in
 * the DOM. A fixed backdrop must switch off `position: fixed` as soon as its exit animation begins (see `Sheet.vue`).
 */
export function useStatusBarDim(open: Readonly<Ref<boolean>>): void {
  watch(
    open,
    (isOpen, _previous, onCleanup) => {
      if (!isOpen) return;
      openBackdropCount.value += 1;
      onCleanup(() => {
        openBackdropCount.value -= 1;
      });
    },
    { immediate: true }
  );
}

/**
 * Overrides the status bar color while a full-screen layer (such as the app splash screen) covers the page.
 * Returns a release function to call when the layer begins its exit animation.
 *
 * Note for iOS 27: iOS locks onto the layer's color while a full-screen `position: fixed` element remains on screen,
 * so the layer must stop using `position: fixed` as soon as its exit animation starts (see `BrandOpening.vue`).
 * @param token - CSS color variable name (for example, `--base-bg-primary`).
 */
export function holdStatusBarColor(token: string): () => void {
  fullScreenOverrideToken.value = token;
  return () => {
    if (fullScreenOverrideToken.value === token) fullScreenOverrideToken.value = null;
  };
}

/**
 * Sets the status bar color for a screen whose header area uses a different background than `--base-bg-primary`.
 * The status bar keeps this color while the screen is mounted, even as the page scrolls.
 * @param token - CSS color variable name (for example, `--base-bg-secondary_alt`).
 */
export function useStatusBarTopColor(token: string): void {
  pageTopColorToken.value = token;
  onScopeDispose(() => {
    if (pageTopColorToken.value === token) pageTopColorToken.value = null;
  });
}
