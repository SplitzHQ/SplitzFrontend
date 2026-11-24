/**
 * Geometry interpolation and spring physics for the scroll-linked `HomePage` header collapse.
 * As the page scrolls, the full-width search bar morphs into the collapsed search icon button inside the sticky top bar
 * while the frosted header backdrop retracts in sync. `HomeHeader.vue` measures live DOM coordinates and applies the
 * per-frame transforms computed by `computeHeaderMorphFrame`.
 */

/** Width and height (in CSS pixels) of the collapsed search icon button and target pill circle. */
export const COLLAPSED_BUTTON_SIZE_PX = 40;
/** Width and height (in CSS pixels) of the centered magnifying-glass icon. */
export const MAGNIFIER_ICON_SIZE_PX = 20;
/** Horizontal overlap (in CSS pixels) between the left cap, center segment, and right cap to hide subpixel seams. */
export const PILL_SEAM_OVERLAP_PX = 0.5;
/** Collapse progress (`0..1`) at which placeholder text and the filter icon finish fading out. */
const CONTENT_FADE_END_PROGRESS = 0.3;
/** Collapse progress (`0..1`) at which the pill outline/fill begin fading out and the brand icon tint fades in. */
const OUTLINE_FADE_START_PROGRESS = 0.6;
/** Critically damped spring constant (`omega * settleSeconds`) reaching ~95% of a step in `settleSeconds`. */
const SPRING_SETTLE_FACTOR = 4.74;
/** Maximum integration time step (in seconds) so long frame gaps (such as backgrounded tabs) remain stable. */
const MAX_SPRING_STEP_SECONDS = 1 / 120;

/**
 * Live DOM layout coordinates consumed by `computeHeaderMorphFrame`.
 * Measured dynamically from rendered elements because browsers (such as iOS Safari) can size `<input type="search">`
 * differently, which would cause a hardcoded overlay height to jump when taking over from the real field.
 *
 * Outer coordinates are relative to the sticky top bar (`fieldTop - scrollTop` gives the live viewport position);
 * inner offsets are relative to the search field's top-left corner.
 */
export interface HeaderMorphGeometry {
  /** Height of the sticky top bar when collapsed. */
  topBarHeight: number;
  fieldHeight: number;
  fieldLeft: number;
  fieldTop: number;
  fieldWidth: number;
  /** Distance from the search field's right edge to the filter button's left edge. */
  filterOffsetFromRight: number;
  filterOffsetTop: number;
  /** Offset of the collapsed search icon button relative to the sticky top bar. */
  targetButtonLeft: number;
  targetButtonTop: number;
  /** Offset of the resting magnifying-glass icon relative to the search field's top-left corner. */
  magnifierOffsetLeft: number;
  magnifierOffsetTop: number;
  /** Distance from `fieldTop` to the bottom edge of the search row. */
  searchRowBottomOffset: number;
  /** Offset of the 20px-tall placeholder text box relative to the search field's top-left corner. */
  placeholderOffsetLeft: number;
  placeholderOffsetTop: number;
}

/** Per-frame layout and opacity values (in pixels relative to the sticky top bar) for the morphing search overlay. */
export interface HeaderMorphFrame {
  /** Downward extension (in pixels) of the frosted header backdrop below `topBarHeight`. */
  barExtensionPx: number;
  /** Opacity of the brand-colored magnifying-glass overlay (`0` = placeholder gray, `1` = brand shade). */
  brandIconOpacity: number;
  /** Opacity of the placeholder text and filter button (`1` at rest, `0` once faded out). */
  contentOpacity: number;
  /** Rendered height of the morphing pill outline. */
  height: number;
  left: number;
  /** Offset of the magnifying-glass icon relative to `(left, top)` of the morphing pill. */
  magnifierOffsetLeft: number;
  magnifierOffsetTop: number;
  /** Opacity of the morphing pill border and background fill. */
  outlineOpacity: number;
  right: number;
  top: number;
}

/** Clamps `value` into the closed `[0, 1]` interval. */
export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Linearly interpolates between `from` and `to` at `progress`. */
function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

/** Maps `progress` across `[rangeStart, rangeEnd]` onto `[0, 1]` with smoothstep easing (`3x^2 - 2x^3`). */
function smoothstepRange(progress: number, rangeStart: number, rangeEnd: number): number {
  const normalized = clamp01((progress - rangeStart) / (rangeEnd - rangeStart));
  return normalized * normalized * (3 - 2 * normalized);
}

/**
 * Computes the morphing header state at `progress` (`0` = resting search field, `1` = collapsed search icon button).
 *
 * Both horizontal edges of the pill interpolate linearly toward the collapsed button's bounds while its height shrinks
 * to `COLLAPSED_BUTTON_SIZE_PX`. The frosted backdrop extends downward to cover the morphing pill, clamped to the live
 * scrolled bottom of the search row (`fieldTop + searchRowBottomOffset - scrollTop`) so a trailing spring never covers
 * list rows that have already scrolled upward.
 */
export function computeHeaderMorphFrame(
  geometry: HeaderMorphGeometry,
  progress: number,
  scrollTop: number
): HeaderMorphFrame {
  const outlineFade = smoothstepRange(progress, OUTLINE_FADE_START_PROGRESS, 1);
  const centeredIconInset = (COLLAPSED_BUTTON_SIZE_PX - MAGNIFIER_ICON_SIZE_PX) / 2;
  const searchRowRestingBottom = geometry.fieldTop + geometry.searchRowBottomOffset;
  const barBottom = Math.min(
    lerp(searchRowRestingBottom, geometry.topBarHeight, progress),
    searchRowRestingBottom - scrollTop
  );
  return {
    barExtensionPx: progress > 0 ? Math.max(0, barBottom - geometry.topBarHeight) : 0,
    brandIconOpacity: outlineFade,
    contentOpacity: 1 - smoothstepRange(progress, 0, CONTENT_FADE_END_PROGRESS),
    height: lerp(geometry.fieldHeight, COLLAPSED_BUTTON_SIZE_PX, progress),
    left: lerp(geometry.fieldLeft, geometry.targetButtonLeft, progress),
    magnifierOffsetLeft: lerp(geometry.magnifierOffsetLeft, centeredIconInset, progress),
    magnifierOffsetTop: lerp(geometry.magnifierOffsetTop, centeredIconInset, progress),
    outlineOpacity: 1 - outlineFade,
    right: lerp(
      geometry.fieldLeft + geometry.fieldWidth,
      geometry.targetButtonLeft + COLLAPSED_BUTTON_SIZE_PX,
      progress
    ),
    top: lerp(geometry.fieldTop, geometry.targetButtonTop, progress),
  };
}

/** Mutable position and velocity of a 1D critically damped spring. */
export interface SpringState {
  value: number;
  velocity: number;
}

/**
 * Advances a critically damped spring (`state`) toward `target` by `elapsedSeconds` without overshooting, smoothing
 * discrete mouse-wheel ticks and fast flicks. `settleSeconds` specifies the 95% response time (`<= 0` snaps
 * immediately). Returns `true` once `state` settles onto `target`.
 */
export function stepSpring(state: SpringState, target: number, elapsedSeconds: number, settleSeconds: number): boolean {
  if (settleSeconds <= 0) {
    state.value = target;
    state.velocity = 0;
    return true;
  }
  const angularFrequency = SPRING_SETTLE_FACTOR / settleSeconds;
  let remainingSeconds = Math.min(elapsedSeconds, 0.1);
  while (remainingSeconds > 0) {
    const dt = Math.min(remainingSeconds, MAX_SPRING_STEP_SECONDS);
    const acceleration =
      angularFrequency * angularFrequency * (target - state.value) - 2 * angularFrequency * state.velocity;
    state.velocity += acceleration * dt;
    state.value += state.velocity * dt;
    remainingSeconds -= dt;
  }
  if (Math.abs(target - state.value) < 0.001 && Math.abs(state.velocity) < 0.01) {
    state.value = target;
    state.velocity = 0;
    return true;
  }
  return false;
}
