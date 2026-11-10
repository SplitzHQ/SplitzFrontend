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
import AvatarMenu from "@/components/Notification/AvatarMenu.vue";
import NotificationBadge from "@/components/Notification/NotificationBadge.vue";
import NotificationBell from "@/components/Notification/NotificationBell.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import { frostedBarStyle, frostedColor } from "@/libs/frosted-bar";
import { motionSlow, prefersReducedMotion, scrollBehavior } from "@/libs/motion";

import { HOME_FILTER_BUTTON_CLASS } from "./home-filter-button";
import {
  clamp01,
  MORPH_CIRCLE_PX,
  MORPH_SEAM_PX,
  morphFrame,
  stepSpring,
  type MorphGeometry,
  type SpringState,
} from "./home-header-morph";
import HomeSearchBar from "./HomeSearchBar.vue";

/**
 * The header of HomePage. The row with the logo, the bell and the avatar stays at the top on a frosted bar. When
 * the page scrolls, the search field turns into a search icon in that row, and the word mark turns into the glyph with
 * the same progress. A tap on the search icon goes back to the top and puts the focus in the field. The user picked
 * this look in the prototype `2026-11-05-home-motion`. The math is in `home-header-morph.ts`.
 */
const keyword = defineModel<string>({ default: "" });

export interface HomeHeaderProps {
  /**
   * The number of conditions that are on. A number above zero gives the filter button the look of a selected
   * FilterPill and a brand count badge.
   */
  filterCount?: number;
}

const { filterCount = 0 } = defineProps<HomeHeaderProps>();

const emit = defineEmits<{
  /** The user pressed the filter button in the search field. */
  openFilter: [];
}>();

/**
 * The variant and the classes of the filter button. While a filter is on, the button is a secondary button: it has the
 * fill and the text color of a selected FilterPill. SPZ-112 picked this.
 */
const filterButton = computed(() =>
  filterCount > 0
    ? { class: undefined, variant: "secondary" as const }
    : { class: HOME_FILTER_BUTTON_CLASS, variant: "ghost" as const }
);

const { $t } = useFluent();

/** The time in which the morph reaches 95% of a scroll step. The spring keeps a wheel step or a flick soft. */
const FOLLOW_SETTLE_S = 0.28;

const header = useTemplateRef<HTMLElement>("header");
const topRow = useTemplateRef<HTMLElement>("topRow");
const searchRow = useTemplateRef<HTMLElement>("searchRow");
const morphEl = useTemplateRef<HTMLElement>("morphEl");
const searchIcon = useTemplateRef<ComponentPublicInstance>("searchIcon");
const logo = useTemplateRef<InstanceType<typeof BrandHomeLogo>>("logo");

// --- Scroll ---------------------------------------------------------------------------------------------------------

/** The scroll position of the page. */
const scrollTop = shallowRef(0);
/** The height of the search row. The field is gone when the page has scrolled this far. */
const searchRowHeight = shallowRef(0);

/**
 * Returns the scroll position of the page. During a page change the page is a fixed layer that scrolls itself (see
 * `src/libs/page-transition.ts`), and the window then has no scroll.
 */
function pageScroll(): { frozen: boolean; top: number } {
  const page = header.value?.closest<HTMLElement>(".page");
  if (page?.style.position === "fixed") return { frozen: true, top: page.scrollTop };
  return { frozen: false, top: window.scrollY };
}

// --- Geometry -------------------------------------------------------------------------------------------------------

const geometry = shallowRef<MorphGeometry>({
  barBase: 0,
  fieldHeight: MORPH_CIRCLE_PX,
  fieldLeft: 16,
  fieldTop: 0,
  fieldWidth: 0,
  filterRight: 36,
  filterTop: 4,
  iconLeft: 0,
  iconTop: 0,
  magnifierLeft: 10,
  magnifierTop: 10,
  rowBottom: 56,
  textLeft: 38,
  textTop: 10,
});

/** Returns the place of `el` relative to `ancestor`. Offsets ignore transforms, so the scale of a hidden icon does not count. */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement): { left: number; top: number } {
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { left, top };
}

/** Reads the sizes of the real field, the search row and the search icon. */
function measure(): void {
  const row = topRow.value;
  const label = searchRow.value?.querySelector("label");
  const icon = searchIcon.value?.$el as HTMLElement | undefined;
  if (!row || !label || !icon || !searchRow.value) return;
  searchRowHeight.value = searchRow.value.offsetHeight;
  const rowRect = row.getBoundingClientRect();
  const field = label.getBoundingClientRect();
  const magnifier = label.querySelector("svg")?.getBoundingClientRect();
  const input = label.querySelector("input")?.getBoundingClientRect();
  const filter = label.parentElement?.querySelector("label ~ div button")?.getBoundingClientRect();
  const iconPlace = offsetWithin(icon, row);
  const fallback = geometry.value;
  geometry.value = {
    barBase: row.offsetHeight,
    fieldHeight: field.height,
    fieldLeft: field.left - rowRect.left,
    fieldTop: field.top - rowRect.top + pageScroll().top,
    fieldWidth: field.width,
    filterRight: filter ? field.right - filter.left : fallback.filterRight,
    filterTop: filter ? filter.top - field.top : fallback.filterTop,
    iconLeft: iconPlace.left,
    iconTop: iconPlace.top,
    magnifierLeft: magnifier ? magnifier.left - field.left : fallback.magnifierLeft,
    magnifierTop: magnifier ? magnifier.top - field.top : fallback.magnifierTop,
    rowBottom: searchRow.value.getBoundingClientRect().bottom - field.top,
    textLeft: input ? input.left - field.left : fallback.textLeft,
    textTop: input ? input.top - field.top + (input.height - 20) / 2 : fallback.textTop,
  };
}

// The sizes can change after the first paint, for example when the safe area arrives.
useResizeObserver([topRow, searchRow], measure);

// --- Progress -------------------------------------------------------------------------------------------------------

/**
 * True while the focus is in the search row. The morph then stays at the field, because the keyboard of a phone can
 * scroll the page, and the field must not turn into the icon while the person types.
 */
const searchFocused = shallowRef(false);

/** How far the search row has scrolled away, from 0 to 1. */
const searchAway = computed(() => {
  if (searchFocused.value || searchRowHeight.value <= 0) return 0;
  return clamp01(scrollTop.value / searchRowHeight.value);
});

// The spring also follows a change of the focus, not only a scroll.
watch(searchFocused, () => onScroll());

/** The progress of the morph. It follows `searchAway` through a spring. */
const progress = shallowRef(0);
const spring: SpringState = { speed: 0, value: 0 };
let frame = 0;
let lastTime = 0;

/** Moves the spring one frame toward `searchAway`. */
function springStep(now: number): void {
  const settled = stepSpring(spring, searchAway.value, (now - lastTime) / 1000, settleSeconds());
  lastTime = now;
  progress.value = clamp01(spring.value);
  frame = settled ? 0 : requestAnimationFrame(springStep);
}

/** The settle time of the spring. Reduced motion follows the scroll at once. */
function settleSeconds(): number {
  return prefersReducedMotion() ? 0 : FOLLOW_SETTLE_S * motionSlow();
}

/** Reads the scroll position, and starts the spring. A page that moves in a page change jumps to its place. */
function onScroll(): void {
  const { frozen, top } = pageScroll();
  scrollTop.value = top;
  if (frozen || settleSeconds() <= 0) {
    cancelAnimationFrame(frame);
    frame = 0;
    stepSpring(spring, searchAway.value, 0, 0);
    progress.value = spring.value;
    return;
  }
  if (frame) return;
  lastTime = performance.now();
  frame = requestAnimationFrame(springStep);
}

onMounted(() => {
  measure();
  onScroll();
  // The capture phase also gets the scroll of the page layer during a page change. A scroll event does not bubble.
  window.addEventListener("scroll", onScroll, { capture: true, passive: true });
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll, { capture: true });
  cancelAnimationFrame(frame);
});

// --- Frame ----------------------------------------------------------------------------------------------------------

/** True after the morph has started. It changes only at the start, so a frame does not render the header again. */
const started = computed(() => progress.value > 0);
/** True when the search icon replaces the field. */
const iconShown = computed(() => progress.value >= 1);
/** True when content is under the bar, so the bar shows its bottom line. */
const edge = computed(() => searchRowHeight.value > 0 && scrollTop.value > searchRowHeight.value);

/** The progress of the last frame that `applyFrame` wrote. */
let lastProgress = 0;

/**
 * Writes the frame to the copy of the field, the bar and the logo. The values go to the elements directly, not through
 * the template, so a frame does not render the page again. Each part moves with a transform, so a frame needs no layout.
 */
function applyFrame(): void {
  const el = morphEl.value;
  const row = topRow.value;
  if (!el || !row) return;
  const t = progress.value;
  logo.value?.scrub(t);
  // The sizes are read again when the morph starts, so the copy matches the field at the swap.
  if (t > 0 && lastProgress <= 0) measure();
  lastProgress = t;
  const g = geometry.value;
  const f = morphFrame(g, t, scrollTop.value);
  const scale = f.height / g.fieldHeight;
  const cap = f.height / 2;
  const middle = Math.max(0, f.right - f.left - f.height) + 2 * MORPH_SEAM_PX;
  const set = (name: string, transform: string, opacity?: number) => {
    const node = el.querySelector<HTMLElement>(`[data-morph="${name}"]`);
    if (!node) return;
    node.style.transform = transform;
    if (opacity !== undefined) node.style.opacity = String(opacity);
  };
  set("left", `translate(${f.left}px, ${f.top}px) scale(${scale})`);
  set("mid", `translate(${f.left + cap - MORPH_SEAM_PX}px, ${f.top}px) scale(${middle}, ${scale})`);
  set("right", `translate(${f.right - cap}px, ${f.top}px) scale(${scale})`);
  set("icon", `translate(${f.left + f.iconLeft}px, ${f.top + f.iconTop}px)`);
  set("text", `translate(${f.left + g.textLeft}px, ${f.top + g.textTop}px)`, f.text);
  set("filter", `translate(${f.right - g.filterRight}px, ${f.top + g.filterTop}px)`, f.text);
  const frameNode = el.querySelector<HTMLElement>('[data-morph="frame"]');
  if (frameNode) frameNode.style.opacity = String(f.frame);
  const tint = el.querySelector<HTMLElement>('[data-morph="tint"]');
  if (tint) tint.style.opacity = String(f.tint);
  row.style.setProperty("--bar-extend", `${f.barExtend}px`);
}

watch([progress, geometry, scrollTop, morphEl], applyFrame, { flush: "post" });

// --- Look -----------------------------------------------------------------------------------------------------------

/** The size of one half circle of the outline. It changes only when the field changes size. */
const capSize = computed(() => ({
  height: `${geometry.value.fieldHeight}px`,
  width: `${geometry.value.fieldHeight / 2}px`,
}));

/** The room above the screen that lets the bar layer move down by `--bar-extend` with a transform. */
const extendMax = computed(() =>
  Math.max(0, geometry.value.fieldTop + geometry.value.rowBottom - geometry.value.barBase)
);

/** The color of the home page under the header. */
const HEADER_COLOR = "var(--comp-home-page-bg)";
/** The frosted color of the header. */
const glassColor = frostedColor(HEADER_COLOR);

/**
 * The frosted bar. The layer starts `--bar-extend-max` above the top row and moves down by `--bar-extend`, so its size
 * does not change on each frame. `frostedBarStyle` gives the look.
 */
const barStyle = computed(() => ({
  ...frostedBarStyle({
    color: HEADER_COLOR,
    edge: edge.value,
    screenTop: "(var(--bar-extend-max) - var(--bar-extend, 0px))",
  }),
  top: "calc(-1 * var(--bar-extend-max))",
  transform: "translateY(var(--bar-extend, 0px))",
}));

/** Goes back to the top of the page and puts the focus in the field. */
function openSearch(): void {
  searchRow.value?.querySelector("input")?.focus({ preventScroll: true });
  window.scrollTo({ behavior: scrollBehavior(), top: 0 });
}
</script>

<template>
  <div ref="header" class="contents">
    <div
      ref="topRow"
      class="sticky top-0 isolate z-10 flex items-center justify-between px-4 pt-safe-4 pb-3"
      :style="{ '--bar-extend-max': `${extendMax}px` }"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 bottom-0 -z-10 border-b transition-[border-color] duration-state ease-standard"
        :style="barStyle"
      />

      <!--
        A copy of the field that turns into the search icon. The real field hides while it shows. It has the size of the
        real field, and each part moves and scales with a transform. The outline is two half circles and a middle part
        that scales on its width. The parts overlap by half a pixel, so no seam shows.
      -->
      <div
        ref="morphEl"
        v-show="started && !iconShown"
        class="pointer-events-none absolute top-0 left-0 z-10 h-0 w-0"
        aria-hidden="true"
        inert
      >
        <div data-morph="frame">
          <span
            data-morph="left"
            :style="capSize"
            class="absolute top-0 left-0 origin-top-left rounded-l-full border border-r-0 border-base-border-muted bg-base-bg-floating"
          />
          <span
            data-morph="mid"
            :style="{ height: capSize.height }"
            class="absolute top-0 left-0 w-px origin-top-left border-y border-base-border-muted bg-base-bg-floating"
          />
          <span
            data-morph="right"
            :style="capSize"
            class="absolute top-0 left-0 origin-top-left rounded-r-full border border-l-0 border-base-border-muted bg-base-bg-floating"
          />
        </div>
        <!-- The brand icon fades in over the gray one, so the color change needs no new paint of a color. -->
        <span data-morph="icon" class="absolute top-0 left-0 size-5">
          <PhMagnifyingGlass class="absolute inset-0 size-5 text-base-text-placeholder" />
          <PhMagnifyingGlass data-morph="tint" class="absolute inset-0 size-5 text-base-text-brand opacity-0" />
        </span>
        <span
          data-morph="text"
          class="absolute top-0 left-0 text-base leading-5 font-normal whitespace-nowrap text-base-text-placeholder"
        >
          {{ $t("home-search-placeholder") }}
        </span>
        <span data-morph="filter" class="absolute top-0 left-0 flex">
          <SIconButton :variant="filterButton.variant" size="sm" :class="filterButton.class" tabindex="-1">
            <PhSlidersHorizontal />
          </SIconButton>
        </span>
      </div>

      <h1><BrandHomeLogo ref="logo" /></h1>
      <!-- The copy of the field goes under the bell and the avatar. -->
      <div class="relative z-20 flex items-center gap-1">
        <SIconButton
          ref="searchIcon"
          variant="ghost"
          size="md"
          :aria-label="$t('home-search-placeholder')"
          :aria-hidden="!iconShown"
          :tabindex="iconShown ? undefined : -1"
          :class="iconShown ? undefined : 'pointer-events-none opacity-0'"
          data-testid="home-search-icon"
          @click="openSearch"
        >
          <PhMagnifyingGlass class="text-base-text-brand" />
        </SIconButton>
        <NotificationBell />
        <!-- The slot has the width of the bell, so the 32px avatar has the same space on each side. -->
        <div class="flex size-10 items-center justify-center">
          <AvatarMenu />
        </div>
      </div>
    </div>

    <div
      ref="searchRow"
      class="px-4 pb-4"
      :style="{ backgroundColor: glassColor, opacity: started ? 0 : undefined }"
      @focusin="searchFocused = true"
      @focusout="searchFocused = false"
    >
      <HomeSearchBar v-model="keyword">
        <template #action>
          <!-- The badge sits on the corner of the button, so the wrapper is `relative`. -->
          <div class="relative flex">
            <SIconButton
              :variant="filterButton.variant"
              size="sm"
              :class="filterButton.class"
              :aria-label="$t('home-filter-button', { count: filterCount })"
              aria-haspopup="dialog"
              data-testid="home-filter"
              @click="emit('openFilter')"
            >
              <PhSlidersHorizontal />
            </SIconButton>
            <NotificationBadge :count="filterCount" tone="brand" class="-top-1 -right-1" />
          </div>
        </template>
      </HomeSearchBar>
    </div>
  </div>
</template>
