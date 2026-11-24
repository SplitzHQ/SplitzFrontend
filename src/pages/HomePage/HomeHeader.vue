<script setup lang="ts">
import { PhMagnifyingGlass, PhSlidersHorizontal } from "@phosphor-icons/vue";
import { useResizeObserver } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  useTemplateRef,
  watch,
  type ComponentPublicInstance,
} from "vue";

import BrandHomeLogo from "@/components/BrandWordmark/BrandHomeLogo.vue";
import BrandOpeningOverlay from "@/components/BrandWordmark/BrandOpeningOverlay.vue";
import AvatarMenu from "@/components/Notification/AvatarMenu.vue";
import NotificationBell from "@/components/Notification/NotificationBell.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import { motionSlow, prefersReducedMotion, scrollBehavior } from "@/libs/motion";
import { getPageScrollState } from "@/libs/page-transition";

import { HOME_FILTER_BUTTON_CLASS } from "./home-filter-button";
import {
  clamp01,
  COLLAPSED_BUTTON_SIZE_PX,
  computeHeaderMorphFrame,
  PILL_SEAM_OVERLAP_PX,
  stepSpring,
  type HeaderMorphGeometry,
  type SpringState,
} from "./home-header-morph";
import HomeSearchBar from "./HomeSearchBar.vue";

/**
 * Collapsing sticky header for `HomePage`.
 * Keeps the brand mark, notification bell, and profile menu anchored on a frosted top bar while scrolling collapses
 * the search bar into a search icon button and scrubs `BrandHomeLogo` into the standalone glyph. Tapping the collapsed
 * search icon scrolls back to the top and focuses the search input. Interpolation and spring physics live in
 * `home-header-morph.ts`.
 */
const keyword = defineModel<string>({ default: "" });

const { $t } = useFluent();

/** 95% spring response time (in seconds) smoothing discrete wheel ticks and flicks. */
const SPRING_SETTLE_SECONDS = 0.28;
/** Background opacity percentage of the frosted glass bar. */
const FROSTED_BG_OPACITY_PERCENT = 69;
/** Backdrop blur radius (in CSS pixels) of the frosted glass bar. */
const FROSTED_BLUR_PX = 18;
/** Bottom divider opacity as a percentage of `--base-border-quaternary`. */
const BOTTOM_BORDER_OPACITY_PERCENT = 50;
/** Vertical gradient distance (in CSS pixels) blending the opaque status-bar region into the frosted glass tint. */
const STATUS_BAR_FADE_HEIGHT_PX = 24;

const headerRoot = useTemplateRef<HTMLElement>("headerRoot");
const topBarElement = useTemplateRef<HTMLElement>("topBarElement");
const searchRowElement = useTemplateRef<HTMLElement>("searchRowElement");
const morphOverlayElement = useTemplateRef<HTMLElement>("morphOverlayElement");
const collapsedSearchButton = useTemplateRef<ComponentPublicInstance>("collapsedSearchButton");
const homeLogo = useTemplateRef<InstanceType<typeof BrandHomeLogo>>("homeLogo");

// --- Scroll tracking ------------------------------------------------------------------------------------------------

/** Current vertical scroll offset of the page in pixels. */
const scrollTop = shallowRef(0);
/** Measured height of `searchRowElement`, defining the scroll distance over which the search bar collapses. */
const searchRowHeight = shallowRef(0);

// --- Layout geometry ------------------------------------------------------------------------------------------------

const geometry = shallowRef<HeaderMorphGeometry>({
  fieldHeight: COLLAPSED_BUTTON_SIZE_PX,
  fieldLeft: 16,
  fieldTop: 0,
  fieldWidth: 0,
  filterOffsetFromRight: 36,
  filterOffsetTop: 4,
  magnifierOffsetLeft: 10,
  magnifierOffsetTop: 10,
  placeholderOffsetLeft: 38,
  placeholderOffsetTop: 10,
  searchRowBottomOffset: 56,
  targetButtonLeft: 0,
  targetButtonTop: 0,
  topBarHeight: 0,
});

/** Computes `element`'s layout offset relative to `ancestor` using `offsetLeft`/`offsetTop` (ignoring CSS transforms). */
function getOffsetWithinAncestor(element: HTMLElement, ancestor: HTMLElement): { left: number; top: number } {
  let left = 0;
  let top = 0;
  let current: HTMLElement | null = element;
  while (current && current !== ancestor) {
    left += current.offsetLeft;
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return { left, top };
}

/** Measures the live search bar, search row, and target icon button bounds. */
function measureLayoutGeometry(): void {
  const topBar = topBarElement.value;
  const searchRow = searchRowElement.value;
  const searchLabel = searchRow?.querySelector("label");
  const targetButton = collapsedSearchButton.value?.$el as HTMLElement | undefined;
  if (!topBar || !searchRow || !searchLabel || targetButton === undefined) return;
  searchRowHeight.value = searchRow.offsetHeight;
  const topBarRect = topBar.getBoundingClientRect();
  const fieldRect = searchLabel.getBoundingClientRect();
  const magnifierRect = searchLabel.querySelector("svg")?.getBoundingClientRect();
  const inputRect = searchLabel.querySelector("input")?.getBoundingClientRect();
  const filterButtonRect = searchLabel.parentElement?.querySelector("label ~ div button")?.getBoundingClientRect();
  const targetButtonOffset = getOffsetWithinAncestor(targetButton, topBar);
  const previousGeometry = geometry.value;
  geometry.value = {
    fieldHeight: fieldRect.height,
    fieldLeft: fieldRect.left - topBarRect.left,
    fieldTop: fieldRect.top - topBarRect.top + getPageScrollState(headerRoot.value).scrollTop,
    fieldWidth: fieldRect.width,
    filterOffsetFromRight: filterButtonRect
      ? fieldRect.right - filterButtonRect.left
      : previousGeometry.filterOffsetFromRight,
    filterOffsetTop: filterButtonRect ? filterButtonRect.top - fieldRect.top : previousGeometry.filterOffsetTop,
    magnifierOffsetLeft: magnifierRect ? magnifierRect.left - fieldRect.left : previousGeometry.magnifierOffsetLeft,
    magnifierOffsetTop: magnifierRect ? magnifierRect.top - fieldRect.top : previousGeometry.magnifierOffsetTop,
    placeholderOffsetLeft: inputRect ? inputRect.left - fieldRect.left : previousGeometry.placeholderOffsetLeft,
    placeholderOffsetTop: inputRect
      ? inputRect.top - fieldRect.top + (inputRect.height - 20) / 2
      : previousGeometry.placeholderOffsetTop,
    searchRowBottomOffset: searchRow.getBoundingClientRect().bottom - fieldRect.top,
    targetButtonLeft: targetButtonOffset.left,
    targetButtonTop: targetButtonOffset.top,
    topBarHeight: topBar.offsetHeight,
  };
}

// Re-measure whenever safe-area insets or font metrics resize the header rows after first paint.
useResizeObserver([topBarElement, searchRowElement], measureLayoutGeometry);

// --- Collapse progress & spring -------------------------------------------------------------------------------------

/**
 * Keeps the search field expanded while focus sits inside `searchRowElement` so mobile virtual-keyboard scrolling
 * cannot collapse the input underneath the user's typing.
 */
const isSearchFocused = shallowRef(false);

/** Target collapse ratio (`0..1`) derived from scroll position and focus state. */
const targetCollapseProgress = computed(() => {
  if (isSearchFocused.value || searchRowHeight.value <= 0) return 0;
  return clamp01(scrollTop.value / searchRowHeight.value);
});

watch(isSearchFocused, () => syncWithScroll());

/** Smoothed collapse progress (`0..1`) trailing `targetCollapseProgress` via `spring`. */
const collapseProgress = shallowRef(0);
const spring: SpringState = { value: 0, velocity: 0 };
let animationFrameId = 0;
let lastFrameTimestampMs = 0;

/** Effective spring settle duration in seconds (`0` when reduced motion is active). */
function getSpringSettleSeconds(): number {
  return prefersReducedMotion() ? 0 : SPRING_SETTLE_SECONDS * motionSlow();
}

/** Integrates one animation frame of the collapse spring toward `targetCollapseProgress`. */
function advanceSpringFrame(timestampMs: number): void {
  const isSettled = stepSpring(
    spring,
    targetCollapseProgress.value,
    (timestampMs - lastFrameTimestampMs) / 1000,
    getSpringSettleSeconds()
  );
  lastFrameTimestampMs = timestampMs;
  collapseProgress.value = clamp01(spring.value);
  animationFrameId = isSettled ? 0 : requestAnimationFrame(advanceSpringFrame);
}

/** Reads scroll position and drives `collapseProgress` (snapping immediately during route transitions or reduced motion). */
function syncWithScroll(): void {
  const { isPinned, scrollTop: currentScrollTop } = getPageScrollState(headerRoot.value);
  scrollTop.value = currentScrollTop;
  if (isPinned || getSpringSettleSeconds() <= 0) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
    stepSpring(spring, targetCollapseProgress.value, 0, 0);
    collapseProgress.value = spring.value;
    return;
  }
  if (animationFrameId) return;
  lastFrameTimestampMs = performance.now();
  animationFrameId = requestAnimationFrame(advanceSpringFrame);
}

onMounted(() => {
  measureLayoutGeometry();
  syncWithScroll();
  // Capture phase receives scroll events from pinned `.page` containers during route transitions (`scroll` does not bubble).
  window.addEventListener("scroll", syncWithScroll, { capture: true, passive: true });
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", syncWithScroll, { capture: true });
  cancelAnimationFrame(animationFrameId);
});

// --- Imperative DOM frame updates -----------------------------------------------------------------------------------

/** `true` once collapse begins (`collapseProgress > 0`), toggling only at the boundary to avoid per-frame Vue re-renders. */
const isMorphStarted = computed(() => collapseProgress.value > 0);
/** `true` once the search bar has fully collapsed into the top-bar search icon button. */
const isCollapsedIconVisible = computed(() => collapseProgress.value >= 1);
/** `true` once page content scrolls beneath the collapsed bar, revealing its bottom hairline border. */
const showBottomDivider = computed(() => searchRowHeight.value > 0 && scrollTop.value > searchRowHeight.value);

let lastRenderedProgress = 0;

/**
 * Applies per-frame `transform` and `opacity` styles directly to the morph overlay, backdrop, and `BrandHomeLogo`,
 * bypassing Vue template re-renders and layout recalculations during scroll.
 */
function renderMorphFrame(): void {
  const overlay = morphOverlayElement.value;
  const topBar = topBarElement.value;
  if (!overlay || !topBar) return;
  const currentProgress = collapseProgress.value;
  homeLogo.value?.scrub(currentProgress);
  // Refresh measurements right as collapse begins so the morph overlay aligns seamlessly with the live field.
  if (currentProgress > 0 && lastRenderedProgress <= 0) measureLayoutGeometry();
  lastRenderedProgress = currentProgress;

  const currentGeometry = geometry.value;
  const frame = computeHeaderMorphFrame(currentGeometry, currentProgress, scrollTop.value);
  const pillScale = frame.height / currentGeometry.fieldHeight;
  const endCapWidth = frame.height / 2;
  const middleSpanWidth = Math.max(0, frame.right - frame.left - frame.height) + 2 * PILL_SEAM_OVERLAP_PX;

  const setPartStyle = (partName: string, transform: string, opacity?: number) => {
    const partElement = overlay.querySelector<HTMLElement>(`[data-morph="${partName}"]`);
    if (!partElement) return;
    partElement.style.transform = transform;
    if (opacity !== undefined) partElement.style.opacity = String(opacity);
  };
  setPartStyle("left", `translate(${frame.left}px, ${frame.top}px) scale(${pillScale})`);
  setPartStyle(
    "mid",
    `translate(${frame.left + endCapWidth - PILL_SEAM_OVERLAP_PX}px, ${frame.top}px) scale(${middleSpanWidth}, ${pillScale})`
  );
  setPartStyle("right", `translate(${frame.right - endCapWidth}px, ${frame.top}px) scale(${pillScale})`);
  setPartStyle(
    "icon",
    `translate(${frame.left + frame.magnifierOffsetLeft}px, ${frame.top + frame.magnifierOffsetTop}px)`
  );
  setPartStyle(
    "text",
    `translate(${frame.left + currentGeometry.placeholderOffsetLeft}px, ${frame.top + currentGeometry.placeholderOffsetTop}px)`,
    frame.contentOpacity
  );
  setPartStyle(
    "filter",
    `translate(${frame.right - currentGeometry.filterOffsetFromRight}px, ${frame.top + currentGeometry.filterOffsetTop}px)`,
    frame.contentOpacity
  );

  const outlineNode = overlay.querySelector<HTMLElement>('[data-morph="frame"]');
  if (outlineNode) outlineNode.style.opacity = String(frame.outlineOpacity);
  const brandTintNode = overlay.querySelector<HTMLElement>('[data-morph="tint"]');
  if (brandTintNode) brandTintNode.style.opacity = String(frame.brandIconOpacity);
  topBar.style.setProperty("--bar-extend", `${frame.barExtensionPx}px`);
}

watch([collapseProgress, geometry, scrollTop, morphOverlayElement], renderMorphFrame, { flush: "post" });

// --- Frosted backdrop styles ----------------------------------------------------------------------------------------

/** Resting dimensions of each semicircular pill end-cap. */
const pillEndCapSizeStyle = computed(() => ({
  height: `${geometry.value.fieldHeight}px`,
  width: `${geometry.value.fieldHeight / 2}px`,
}));

/** Headroom above the viewport allowing the frosted backdrop to extend downward via `translateY(--bar-extend)` without resizing. */
const maxBarExtensionPx = computed(() =>
  Math.max(0, geometry.value.fieldTop + geometry.value.searchRowBottomOffset - geometry.value.topBarHeight)
);

const frostedBackgroundColor = `color-mix(in oklab, var(--base-bg-secondary_alt) ${FROSTED_BG_OPACITY_PERCENT}%, transparent)`;

/**
 * Styles for the fixed-height frosted backdrop layer. Kept opaque across `--safe-area-top` so scrolling content never
 * bleeds behind OS status-bar icons, then feathered into `frostedBackgroundColor` over `STATUS_BAR_FADE_HEIGHT_PX`.
 */
const frostedBarStyle = computed(() => {
  const viewportTopOffset = "(var(--bar-extend-max) - var(--bar-extend, 0px))";
  const opaqueSurface = "var(--base-bg-secondary_alt)";
  const fadeStart = `calc(${viewportTopOffset} + var(--safe-area-top, 0px))`;
  const fadeEnd = `calc(${viewportTopOffset} + var(--safe-area-top, 0px) + ${STATUS_BAR_FADE_HEIGHT_PX}px)`;
  return {
    WebkitBackdropFilter: `blur(${FROSTED_BLUR_PX}px)`,
    backdropFilter: `blur(${FROSTED_BLUR_PX}px)`,
    backgroundColor: frostedBackgroundColor,
    backgroundImage: `linear-gradient(to bottom, ${opaqueSurface} 0, ${opaqueSurface} ${fadeStart}, transparent ${fadeEnd})`,
    borderBottomColor: showBottomDivider.value
      ? `color-mix(in oklab, var(--base-border-quaternary) ${BOTTOM_BORDER_OPACITY_PERCENT}%, transparent)`
      : "transparent",
    top: "calc(-1 * var(--bar-extend-max))",
    transform: "translateY(var(--bar-extend, 0px))",
  };
});

/** Focuses the search input and scrolls back to the top of the page when the collapsed search button is tapped. */
function expandAndFocusSearch(): void {
  searchRowElement.value?.querySelector("input")?.focus({ preventScroll: true });
  window.scrollTo({ behavior: scrollBehavior(), top: 0 });
}
</script>

<template>
  <div ref="headerRoot" class="contents">
    <div
      ref="topBarElement"
      class="sticky top-0 isolate z-10 flex items-center justify-between px-4 pt-safe-4 pb-3"
      :style="{ '--bar-extend-max': `${maxBarExtensionPx}px` }"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 bottom-0 -z-10 border-b transition-[border-color] duration-state ease-standard"
        :style="frostedBarStyle"
      />

      <!--
        Stand-in proxy for the search bar while `0 < collapseProgress < 1` (the real search row hides in parallel).
        Split into two semicircular end-caps and a 1px center strip scaled horizontally, overlapping by `0.5px` so
        the pill shrinks cleanly on the compositor without subpixel seams.
      -->
      <div
        ref="morphOverlayElement"
        v-show="isMorphStarted && !isCollapsedIconVisible"
        class="pointer-events-none absolute top-0 left-0 z-10 h-0 w-0"
        aria-hidden="true"
        inert
      >
        <div data-morph="frame">
          <span
            data-morph="left"
            :style="pillEndCapSizeStyle"
            class="absolute top-0 left-0 origin-top-left rounded-l-full border border-r-0 border-base-border-muted bg-base-bg-primary_alt"
          />
          <span
            data-morph="mid"
            :style="{ height: pillEndCapSizeStyle.height }"
            class="absolute top-0 left-0 w-px origin-top-left border-y border-base-border-muted bg-base-bg-primary_alt"
          />
          <span
            data-morph="right"
            :style="pillEndCapSizeStyle"
            class="absolute top-0 left-0 origin-top-left rounded-r-full border border-l-0 border-base-border-muted bg-base-bg-primary_alt"
          />
        </div>
        <!-- Cross-fade a brand-tinted icon over the placeholder icon to avoid repainting stroke colors mid-scroll. -->
        <span data-morph="icon" class="absolute top-0 left-0 size-5">
          <PhMagnifyingGlass class="absolute inset-0 size-5 text-base-fg-placeholder" />
          <PhMagnifyingGlass data-morph="tint" class="absolute inset-0 size-5 text-util-color-brand-700 opacity-0" />
        </span>
        <span
          data-morph="text"
          class="absolute top-0 left-0 text-base leading-5 font-normal whitespace-nowrap text-base-text-placeholder"
        >
          {{ $t("home-search-placeholder") }}
        </span>
        <span data-morph="filter" class="absolute top-0 left-0 flex">
          <SIconButton variant="ghost" size="sm" :class="HOME_FILTER_BUTTON_CLASS" tabindex="-1">
            <PhSlidersHorizontal />
          </SIconButton>
        </span>
      </div>

      <BrandOpeningOverlay />
      <h1><BrandHomeLogo ref="homeLogo" /></h1>
      <!-- Stack top-bar actions above the morphing search proxy (`z-20` over `z-10`). -->
      <div class="relative z-20 flex items-center gap-1">
        <SIconButton
          ref="collapsedSearchButton"
          variant="ghost"
          size="md"
          :aria-label="$t('home-search-placeholder')"
          :aria-hidden="!isCollapsedIconVisible"
          :tabindex="isCollapsedIconVisible ? undefined : -1"
          :class="isCollapsedIconVisible ? undefined : 'pointer-events-none opacity-0'"
          data-testid="home-search-icon"
          @click="expandAndFocusSearch"
        >
          <PhMagnifyingGlass class="text-util-color-brand-700" />
        </SIconButton>
        <NotificationBell />
        <!-- Match the 40px width of `NotificationBell` so the 32px avatar has symmetric hit spacing. -->
        <div class="flex size-10 items-center justify-center">
          <AvatarMenu />
        </div>
      </div>
    </div>

    <div
      ref="searchRowElement"
      class="px-4 pb-4"
      :style="{ backgroundColor: frostedBackgroundColor, opacity: isMorphStarted ? 0 : undefined }"
      @focusin="isSearchFocused = true"
      @focusout="isSearchFocused = false"
    >
      <HomeSearchBar v-model="keyword">
        <template #action>
          <SIconButton variant="ghost" size="sm" :class="HOME_FILTER_BUTTON_CLASS" :aria-label="$t('home-filter')">
            <PhSlidersHorizontal />
          </SIconButton>
        </template>
      </HomeSearchBar>
    </div>
  </div>
</template>
