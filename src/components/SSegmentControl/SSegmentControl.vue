<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core";
import { computed, nextTick, onMounted, shallowRef, useTemplateRef, watch } from "vue";

import { scrollBehavior } from "@/libs/motion";

import type { SegmentSize } from "./segment";
import { calculateRevealScrollLeft } from "./segment-scroll";
import SSegment from "./SSegment.vue";

/**
 * Single-choice segmented control displayed in a horizontal row. See `segment-control.usage.ts` for usage guidelines.
 * Pass `aria-label` to name the radio group for screen readers.
 */
export interface SegmentControlProps {
  /** Size variant applied to each segment. */
  size: SegmentSize;
  /** Labels for each segment. Use the default slot to render custom content instead. */
  items: string[];
  /** Wraps overflowing segments onto multiple rows instead of scrolling horizontally. Used only in `devtools/`. */
  wrap?: boolean;
}
const { size, items, wrap = false } = defineProps<SegmentControlProps>();
// Forward `aria-label` to the inner radiogroup; apply all other fallthrough attributes (like `class`) to the outer track.
defineOptions({ inheritAttrs: false });
/** Zero-based index of the selected item. */
const model = defineModel<number>({ required: true });

/** Index offset for each arrow key, following the WAI-ARIA radio group pattern. */
const ARROW_KEY_OFFSETS: Record<string, number> = { ArrowDown: 1, ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1 };
/** Minimum pointer movement in pixels before a mouse press is treated as a drag scroll. */
const DRAG_THRESHOLD_PX = 4;
/** Maximum width of the overflow fade mask at each edge, in pixels. */
const MAX_EDGE_FADE_PX = 40;

const scrollerEl = useTemplateRef<HTMLElement>("scroller");
const contentEl = useTemplateRef<HTMLElement>("content");

const isPressed = shallowRef(false);
const indicatorRect = shallowRef({ height: 0, left: 0, top: 0, width: 0 });
// Disable the indicator transition until after the initial layout measurement so it doesn't animate in from (0, 0) on mount.
const isIndicatorTransitionEnabled = shallowRef(false);
const leftFadeWidth = shallowRef(0);
const rightFadeWidth = shallowRef(0);

// Fade only the edges that have overflowing content scrolled out of view.
const scrollerMaskStyle = computed(() =>
  leftFadeWidth.value === 0 && rightFadeWidth.value === 0
    ? undefined
    : {
        maskImage: `linear-gradient(to right, transparent, #000 ${leftFadeWidth.value}px, #000 calc(100% - ${rightFadeWidth.value}px), transparent)`,
      }
);

const indicatorStyle = computed(() => ({
  height: `${indicatorRect.value.height}px`,
  transform: `translate(${indicatorRect.value.left}px, ${indicatorRect.value.top}px)`,
  width: `${indicatorRect.value.width}px`,
}));

/** Returns all segment radio elements in DOM order. */
function getSegmentElements(): HTMLElement[] {
  return [...(contentEl.value?.querySelectorAll<HTMLElement>('[role="radio"]') ?? [])];
}

/**
 * Syncs the active indicator's size and position with the selected segment element.
 * Uses `offsetLeft`/`offsetTop` so CSS `transform: scale()` on the pressed track doesn't skew measurements.
 */
function updateIndicatorRect(): void {
  const selectedEl = getSegmentElements()[model.value];
  if (!selectedEl) return;
  indicatorRect.value = {
    height: selectedEl.offsetHeight,
    left: selectedEl.offsetLeft,
    top: selectedEl.offsetTop,
    width: selectedEl.offsetWidth,
  };
}

/** Updates the left and right edge fade widths based on the remaining scrollable distance on each side. */
function updateEdgeFades(): void {
  if (!scrollerEl.value) return;
  const { clientWidth, scrollLeft, scrollWidth } = scrollerEl.value;
  leftFadeWidth.value = Math.min(scrollLeft, MAX_EDGE_FADE_PX);
  rightFadeWidth.value = Math.min(Math.max(scrollWidth - clientWidth - scrollLeft, 0), MAX_EDGE_FADE_PX);
}

/** Computes the horizontal scroll offset that keeps the selected segment and its immediate neighbors visible. */
function getTargetScrollLeft(): number {
  const { clientWidth = 0, scrollLeft = 0 } = scrollerEl.value ?? {};
  const boxes = getSegmentElements().map((el) => ({ left: el.offsetLeft, width: el.offsetWidth }));
  return calculateRevealScrollLeft(boxes, model.value, scrollLeft, clientWidth, contentEl.value?.offsetWidth ?? 0);
}

function updateLayout(): void {
  updateIndicatorRect();
  updateEdgeFades();
}

onMounted(async () => {
  updateIndicatorRect();
  if (scrollerEl.value) scrollerEl.value.scrollLeft = getTargetScrollLeft();
  updateEdgeFades();
  await nextTick();
  // Force a synchronous reflow so the browser paints the initial indicator position before transitions are enabled.
  void contentEl.value?.offsetWidth;
  isIndicatorTransitionEnabled.value = true;
});
useResizeObserver(contentEl, updateLayout);
useResizeObserver(scrollerEl, updateEdgeFades);

watch(
  () => [items, size] as const,
  async () => {
    await nextTick();
    updateLayout();
  }
);
watch(model, async () => {
  await nextTick();
  updateIndicatorRect();
  const targetLeft = getTargetScrollLeft();
  if (scrollerEl.value && targetLeft !== scrollerEl.value.scrollLeft) {
    scrollerEl.value.scrollTo({ behavior: scrollBehavior(), left: targetLeft });
  }
});

/** Selects and focuses the previous or next segment on arrow key press, wrapping around at either end. */
function handleKeydown(event: KeyboardEvent): void {
  const offset = ARROW_KEY_OFFSETS[event.key];
  if (offset === undefined || items.length === 0) return;
  event.preventDefault();
  const nextIndex = (model.value + offset + items.length) % items.length;
  model.value = nextIndex;
  // Prevent the browser's default focus scroll so the `model` watcher can smoothly scroll the track with neighbor padding.
  getSegmentElements()[nextIndex]?.focus({ preventScroll: true });
}

let mouseDragOrigin: { pointerId: number; startScrollLeft: number; startX: number } | null = null;
let isMouseDragging = false;

/** Marks the track as pressed and records the starting coordinates for desktop mouse drag-to-scroll. */
function handlePointerDown(event: PointerEvent): void {
  if (event.button !== 0) return;
  isPressed.value = true;
  isMouseDragging = false;
  const isScrollable = scrollerEl.value && scrollerEl.value.scrollWidth > scrollerEl.value.clientWidth;
  mouseDragOrigin =
    event.pointerType === "mouse" && isScrollable
      ? { pointerId: event.pointerId, startScrollLeft: scrollerEl.value.scrollLeft, startX: event.clientX }
      : null;
}

/** Scrolls the track during a mouse drag once movement exceeds the drag threshold. Captures the pointer so dragging continues outside the track. */
function handlePointerMove(event: PointerEvent): void {
  if (!mouseDragOrigin || !scrollerEl.value) return;
  const deltaX = event.clientX - mouseDragOrigin.startX;
  if (!isMouseDragging && Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;
  if (!isMouseDragging) {
    isMouseDragging = true;
    scrollerEl.value.setPointerCapture(mouseDragOrigin.pointerId);
  }
  scrollerEl.value.scrollLeft = mouseDragOrigin.startScrollLeft - deltaX;
}

/**
 * Clears the mouse drag state and releases the pressed state.
 * During a touch scroll, the browser fires `pointercancel` and `pointerleave` as soon as it takes over panning,
 * even though the user's finger is still on the screen. Ignore those events for touch so the track stays pressed until `touchend`.
 */
function handlePointerEnd(event: PointerEvent): void {
  mouseDragOrigin = null;
  if (event.pointerType !== "touch" || event.type === "pointerup") isPressed.value = false;
}

/** Releases the pressed state when the user's finger leaves the screen, even if momentum scrolling continues. */
function handleTouchEnd(): void {
  isPressed.value = false;
}

/** Suppresses the click event after a mouse drag so releasing the mouse button doesn't accidentally select a segment under the cursor. */
function suppressClickAfterDrag(event: MouseEvent): void {
  if (!isMouseDragging) return;
  isMouseDragging = false;
  event.stopPropagation();
}
</script>

<template>
  <div
    v-bind="{ ...$attrs, 'aria-label': undefined }"
    class="track w-fit max-w-full min-w-0 rounded-full border border-core-alpha-brand-5 bg-core-alpha-brand-5"
    :data-pressed="isPressed ? '' : undefined"
  >
    <!-- Native touch scrolling preserves platform momentum and rubber-band overscroll behavior. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <div
      ref="scroller"
      role="radiogroup"
      :aria-label="$attrs['aria-label'] as string | undefined"
      :class="[
        'touch-manipulation [scrollbar-width:none] overscroll-x-contain [-webkit-touch-callout:none] [&::-webkit-scrollbar]:hidden',
        wrap ? 'overflow-visible' : 'overflow-x-auto overflow-y-hidden rounded-full',
      ]"
      :style="scrollerMaskStyle"
      @click.capture="suppressClickAfterDrag"
      @keydown="handleKeydown"
      @pointercancel="handlePointerEnd"
      @pointerdown="handlePointerDown"
      @pointerleave="handlePointerEnd"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerEnd"
      @scroll.passive="updateEdgeFades"
      @touchcancel.passive="handleTouchEnd"
      @touchend.passive="handleTouchEnd"
    >
      <div ref="content" :class="['relative flex gap-1 p-1', wrap ? 'flex-wrap' : 'w-max']">
        <!-- Placed inside the scrollable content container so the active pill scrolls naturally alongside the segments. -->
        <span
          v-if="items[model] !== undefined"
          data-segment-selection
          :class="[
            'absolute top-0 left-0 rounded-full bg-core-alpha-brand-20',
            isIndicatorTransitionEnabled && 'transition-[transform,width,height] duration-state ease-standard',
          ]"
          :style="indicatorStyle"
        />
        <SSegment
          v-for="(item, index) in items"
          :key="index"
          :size="size"
          :active="model === index"
          @click="model = index"
        >
          <slot :item="item">{{ item }}</slot>
        </SSegment>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * Scale the track visually on press without affecting surrounding layout.
 * Keep `will-change: transform` permanently promoted so pressing the track doesn't create a new compositing layer
 * mid-gesture, which would abort an active horizontal touch pan in iOS Safari.
 */
.track {
  transition: transform var(--motion-duration-sheet) var(--motion-easing-sheet);
  will-change: transform;
}

.track[data-pressed] {
  transform: scale(var(--motion-scale-track-press));
  transition: transform var(--motion-duration-container) var(--motion-easing-standard);
}

/* Disable the press scale when reduced motion is enabled via the OS preference or the `:root[data-reduce-motion]` dev toggle. */
@media (prefers-reduced-motion: reduce) {
  .track[data-pressed] {
    transform: none;
  }
}

:root[data-reduce-motion] .track[data-pressed] {
  transform: none;
}
</style>
