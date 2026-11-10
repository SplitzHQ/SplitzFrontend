<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core";
import { computed, nextTick, onMounted, shallowRef, useTemplateRef, watch } from "vue";

import { scrollBehavior } from "@/libs/motion";

import type { SegmentSize } from "./segment";
import { followLeft } from "./segment-scroll";
import SSegment from "./SSegment.vue";

/** A choice of one item from a short list on one row. See `segment-control.usage.ts` for when to use it. */
export interface SegmentControlProps {
  /** The size of each segment. */
  size: SegmentSize;
  /** The text of each segment. The default slot can draw the text with other markup. */
  items: string[];
  /** The name of the group for a screen reader. Say what the user chooses, for example "Split method". */
  label: string;
  /** Puts the segments that do not fit on more rows, and the track does not scroll. Only `devtools/` uses it. */
  wrap?: boolean;
}
const { size, items, label, wrap = false } = defineProps<SegmentControlProps>();
/** The index of the selected item. */
const model = defineModel<number>({ required: true });

/** The change of the selected index for each arrow key, as in the WAI-ARIA radio group pattern. */
const ARROW_STEPS: Record<string, number> = { ArrowDown: 1, ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1 };
/** A mouse must move this far before a press becomes a drag, in pixels. */
const DRAG_THRESHOLD = 4;
/** The widest edge fade, in pixels. */
const FADE_WIDTH = 40;

const scroller = useTemplateRef<HTMLElement>("scroller");
const content = useTemplateRef<HTMLElement>("content");

const pressed = shallowRef(false);
const selectionBox = shallowRef({ height: 0, left: 0, top: 0, width: 0 });
// The background must not slide from the corner when the control appears, so the transition starts after the first measure.
const selectionMoves = shallowRef(false);
const fadeStart = shallowRef(0);
const fadeEnd = shallowRef(0);

// Tab goes to the selected segment. If the index is outside the list, Tab goes to the first segment.
const tabbableIndex = computed(() => (items[model.value] === undefined ? 0 : model.value));

// An edge fades only on a side that has more segments. A control that fits has no mask.
const scrollerStyle = computed(() =>
  fadeStart.value === 0 && fadeEnd.value === 0
    ? undefined
    : {
        maskImage: `linear-gradient(to right, transparent, #000 ${fadeStart.value}px, #000 calc(100% - ${fadeEnd.value}px), transparent)`,
      }
);

const selectionStyle = computed(() => ({
  height: `${selectionBox.value.height}px`,
  transform: `translate(${selectionBox.value.left}px, ${selectionBox.value.top}px)`,
  width: `${selectionBox.value.width}px`,
}));

/** Returns the segments in the order of the items. */
function radios(): HTMLElement[] {
  return [...(content.value?.querySelectorAll<HTMLElement>('[role="radio"]') ?? [])];
}

/** Puts the selected background on the selected segment. A transform does not change `offsetLeft`, so a press has no effect. */
function measureSelection(): void {
  const radio = radios()[model.value];
  if (!radio) return;
  selectionBox.value = {
    height: radio.offsetHeight,
    left: radio.offsetLeft,
    top: radio.offsetTop,
    width: radio.offsetWidth,
  };
}

/** Sets the width of each edge fade from the distance that the track can still scroll on that side. */
function measureEdges(): void {
  if (!scroller.value) return;
  const { clientWidth, scrollLeft, scrollWidth } = scroller.value;
  fadeStart.value = Math.min(scrollLeft, FADE_WIDTH);
  fadeEnd.value = Math.min(Math.max(scrollWidth - clientWidth - scrollLeft, 0), FADE_WIDTH);
}

/** Returns the scroll position that shows the selected segment and the segments on each side of it. */
function followTarget(): number {
  const { clientWidth = 0, scrollLeft = 0 } = scroller.value ?? {};
  const boxes = radios().map((radio) => ({ left: radio.offsetLeft, width: radio.offsetWidth }));
  return followLeft(boxes, model.value, scrollLeft, clientWidth, content.value?.offsetWidth ?? 0);
}

function measure(): void {
  measureSelection();
  measureEdges();
}

onMounted(async () => {
  measureSelection();
  if (scroller.value) scroller.value.scrollLeft = followTarget();
  measureEdges();
  await nextTick();
  // This read makes the browser apply the first position with no transition.
  void content.value?.offsetWidth;
  selectionMoves.value = true;
});
useResizeObserver(content, measure);
useResizeObserver(scroller, measureEdges);

watch(
  () => [items, size] as const,
  async () => {
    await nextTick();
    measure();
  }
);
watch(model, async () => {
  await nextTick();
  measureSelection();
  const left = followTarget();
  if (scroller.value && left !== scroller.value.scrollLeft) {
    scroller.value.scrollTo({ behavior: scrollBehavior(), left });
  }
});

/** An arrow key selects the next or the previous segment and moves the focus to it. The list wraps at each end. */
function onKeydown(event: KeyboardEvent): void {
  const step = ARROW_STEPS[event.key];
  if (step === undefined || items.length === 0) return;
  event.preventDefault();
  const next = (tabbableIndex.value + step + items.length) % items.length;
  model.value = next;
  // The watcher above scrolls the track, so the focus must not scroll it also.
  radios()[next]?.focus({ preventScroll: true });
}

let dragStart: { pointerId: number; scrollLeft: number; x: number } | null = null;
let dragged = false;

/** Starts the press of the track. A mouse press can also start a drag, because a mouse has no native drag scroll. */
function onPointerDown(event: PointerEvent): void {
  if (event.button !== 0) return;
  pressed.value = true;
  dragged = false;
  const canScroll = scroller.value && scroller.value.scrollWidth > scroller.value.clientWidth;
  dragStart =
    event.pointerType === "mouse" && canScroll
      ? { pointerId: event.pointerId, scrollLeft: scroller.value.scrollLeft, x: event.clientX }
      : null;
}

/** Scrolls the track with a mouse after a small move. Pointer capture keeps the drag when the mouse leaves the track. */
function onPointerMove(event: PointerEvent): void {
  if (!dragStart || !scroller.value) return;
  const distance = event.clientX - dragStart.x;
  if (!dragged && Math.abs(distance) < DRAG_THRESHOLD) return;
  if (!dragged) {
    dragged = true;
    scroller.value.setPointerCapture(dragStart.pointerId);
  }
  scroller.value.scrollLeft = dragStart.scrollLeft - distance;
}

/**
 * Ends the press, unless a touch pan has started. The browser sends `pointercancel` and `pointerleave` when it takes a
 * pan, and the finger is still on the track. `onTouchEnd` ends the press in that case.
 */
function onPointerEnd(event: PointerEvent): void {
  dragStart = null;
  if (event.pointerType !== "touch" || event.type === "pointerup") pressed.value = false;
}

/** Ends the press when the finger lifts. The scroll can continue with its momentum. */
function onTouchEnd(): void {
  pressed.value = false;
}

/** Stops the click at the end of a mouse drag, so a drag does not select a segment. */
function onClickCapture(event: MouseEvent): void {
  if (!dragged) return;
  dragged = false;
  event.stopPropagation();
}
</script>

<template>
  <div
    class="track w-fit max-w-full min-w-0 rounded-full border border-comp-segment-track bg-comp-segment-track"
    :data-pressed="pressed ? '' : undefined"
  >
    <!-- The browser owns the touch scroll, so the momentum and the edge bounce are native. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <div
      ref="scroller"
      role="radiogroup"
      :aria-label="label"
      :class="[
        'touch-manipulation [scrollbar-width:none] overscroll-x-contain [-webkit-touch-callout:none] [&::-webkit-scrollbar]:hidden',
        wrap ? 'overflow-visible' : 'overflow-x-auto overflow-y-hidden rounded-full',
      ]"
      :style="scrollerStyle"
      @click.capture="onClickCapture"
      @keydown="onKeydown"
      @pointercancel="onPointerEnd"
      @pointerdown="onPointerDown"
      @pointerleave="onPointerEnd"
      @pointermove="onPointerMove"
      @pointerup="onPointerEnd"
      @scroll.passive="measureEdges"
      @touchcancel.passive="onTouchEnd"
      @touchend.passive="onTouchEnd"
    >
      <div ref="content" :class="['relative flex gap-1 p-1', wrap ? 'flex-wrap' : 'w-max']">
        <!-- The background is in the scrolling content, so it moves with the segments during a scroll. -->
        <span
          v-if="items[model] !== undefined"
          data-segment-selection
          :class="[
            'absolute top-0 left-0 rounded-full bg-comp-segment-selected',
            selectionMoves && 'transition-[transform,width,height] duration-state ease-standard',
          ]"
          :style="selectionStyle"
        />
        <SSegment
          v-for="(item, index) in items"
          :key="index"
          :size="size"
          :active="model === index"
          :tabbable="tabbableIndex === index"
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
 * A press changes only the look of the track, so the page under it does not move. `will-change` stays on, so a press does
 * not make a new layer around the scroller. A new layer could stop a pan that has just started on iOS Safari.
 */
.track {
  transition: transform var(--motion-duration-sheet) var(--motion-easing-sheet);
  will-change: transform;
}

.track[data-pressed] {
  transform: scale(var(--motion-scale-track-press));
  transition: transform var(--motion-duration-container) var(--motion-easing-standard);
}

/* The two rules are the same. The second rule lets a developer test reduced motion with no system setting. */
@media (prefers-reduced-motion: reduce) {
  .track[data-pressed] {
    transform: none;
  }
}

:root[data-reduce-motion] .track[data-pressed] {
  transform: none;
}
</style>
