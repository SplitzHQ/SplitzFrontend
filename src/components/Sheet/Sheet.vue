<script setup lang="ts">
import { useEventListener, useResizeObserver } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { DialogContent, DialogDescription, DialogPortal, DialogRoot, DialogTitle } from "reka-ui";
import { computed, nextTick, ref, useTemplateRef, watch, watchEffect } from "vue";

import BlurBand from "@/components/BlurBand/BlurBand.vue";
import { useStatusBarDim } from "@/libs/status-bar-color";

import { lockPageScroll } from "./sheet-scroll-lock";
import { useSheetStack } from "./sheet-stack";

/**
 * A modal panel that comes up from the bottom of the screen. See `sheet.usage.ts` for when to use it.
 * Reka UI gives the dialog role, the focus trap, the return of focus, Escape and the order of layers.
 * This file adds the look, the layout of the title and the action area, and the drag.
 *
 * The default slot is the content, and it scrolls. The `actions` slot stays at the bottom, under the content.
 */
interface SheetBaseProps {
  /** The largest height: `large` is 90% of the visible screen, and `medium` is 50%. */
  detent?: "large" | "medium";
  /** `maxHeight` lets the sheet fit its content. `height` keeps the detent height when the content changes. */
  detentSizing?: "maxHeight" | "height";
  /** Shows the drag handle at the top. A drag of the handle changes the height of the sheet. */
  showHandle?: boolean;
  /** Adds a close button. It shows only when an external keyboard focuses it, and a screen reader can always find it. */
  showCloseButton?: boolean;
  /** Lets a drag down close the sheet. Turn it off when the content has its own drag, for example a custom slider. */
  dismissOnDrag?: boolean;
}

/** A sheet gets its name from its visible title. A sheet with no visible title must have a label. */
export type SheetProps = SheetBaseProps &
  (
    | {
        /** The visible title. The sheet draws it and gets its name from it. */
        title: string;
        /** A short line under the title. A screen reader reads it after the name of the sheet. */
        description?: string;
        label?: undefined;
      }
    | {
        title?: undefined;
        description?: undefined;
        /** The name for a screen reader, when the sheet has no visible title. */
        label: string;
      }
  );

const {
  title,
  description,
  label,
  detent = "large",
  detentSizing = "maxHeight",
  showHandle = true,
  showCloseButton = false,
  dismissOnDrag = true,
} = defineProps<SheetProps>();

const open = defineModel<boolean>({ required: true });

const { $t } = useFluent();

const { isBehind } = useSheetStack(open);

useStatusBarDim(open);

/** A touch or a mouse press on these elements does not start a drag, because they use the movement themselves. */
const NO_DRAG = "input, textarea, select, [contenteditable='true'], [role='slider']";
/** A mouse also fires `click` at the end of a drag, so a drag from these elements would also run the control. */
const NO_MOUSE_DRAG = `${NO_DRAG}, button, a, label, summary`;
/** The scroll position of the content, in pixels, above which a press scrolls the content and does not drag. */
const SCROLL_TOP_DRAG_LIMIT = 10;
/** The part of the opening height that a drag must pass below that height to close the sheet. */
const DISMISS_DRAG_RATIO = 0.3;
/** The number of pixels of a move that makes a press a drag. A shorter move is a tap, and a tap does nothing. */
const DRAG_SLOP = 3;
/** The largest height after a drag of the handle, as a part of the area around the panel. It fills the visible screen. */
const LARGE_RATIO = 0.9;
const LARGE_HEIGHT = "90%";
/** The part of a drag above the largest height that the sheet follows, and the most that it goes above that height. */
const OVERDRAG_RATIO = 0.2;
const OVERDRAG_LIMIT = 24;

const sheetRef = useTemplateRef<HTMLElement>("sheet");
const contentRef = useTemplateRef<HTMLElement>("content");
const actionsRef = useTemplateRef<HTMLElement>("actions");
const topBandRef = useTemplateRef<HTMLElement>("topBand");

/** The scroll distance at which the top blur has full strength: the top padding and one line of the title. */
const TOP_BAND_RANGE = 52;
/** The gap between the content and the action area. The bottom blur goes over this gap, so the last item stays clear. */
const ACTIONS_GAP = "1.5rem";

const actionsHeight = ref(0);

// The action area goes over the content. An error or a countdown in the slot changes its height.
useResizeObserver(actionsRef, ([entry]) => {
  actionsHeight.value = entry?.borderBoxSize[0]?.blockSize ?? 0;
});

/** Keeps the end of the content, and a field that gets focus, clear of the action area. */
const contentStyle = computed(() => {
  const clearance = `calc(${actionsHeight.value}px + ${ACTIONS_GAP})`;
  return { paddingBottom: clearance, scrollPaddingBottom: clearance };
});

/**
 * Makes the top blur follow the scroll, so the title becomes clear with the finger and not after a timed fade.
 * This writes the style directly, because a render of the sheet on each scroll would cost more than the blur.
 */
function updateTopBand() {
  const strength = Math.min(1, (contentRef.value?.scrollTop ?? 0) / TOP_BAND_RANGE);
  topBandRef.value?.style.setProperty("--blur-band-strength", String(strength));
}

const isDragging = ref(false);
const isMouseDrag = ref(false);
/** True when the press started on the handle. Only such a press can make the sheet taller. */
const isHandleDrag = ref(false);
const dragStartY = ref(0);
const dragCurrentY = ref(0);
/** The height of the sheet when the press started. */
const startHeight = ref(0);
/** The height that the sheet opened at, and the largest height. A drag of the handle measures them. */
const openHeight = ref(0);
const largestHeight = ref(0);
/** True when a drag left the sheet at the largest height. */
const isExpanded = ref(false);
/** The height that the sheet moves to while it goes back to its opening height. Null at other times. */
const settlingHeight = ref<number | null>(null);
let settleId = 0;

/** The dvh unit follows the browser bars, so the top of the sheet stays on the screen when the address bar shows. */
const detentStyle = computed(() => {
  const size = detent === "medium" ? "50dvh" : "90dvh";
  return detentSizing === "height" ? { height: size } : { maxHeight: size };
});

const dragDelta = computed(() => (isDragging.value ? dragCurrentY.value - dragStartY.value : 0));
/** The height that the drag asks for. It can be above the largest height and below the opening height. */
const wantedHeight = computed(() => startHeight.value - dragDelta.value);
/** The height that the sheet shows during a drag. Above the largest height, it follows only a part of the drag. */
const dragHeight = computed(() => {
  const above = wantedHeight.value - largestHeight.value;
  if (above > 0) return largestHeight.value + Math.min(above * OVERDRAG_RATIO, OVERDRAG_LIMIT);
  return Math.max(openHeight.value, wantedHeight.value);
});
/** The distance that the sheet moves down. It starts when the drag goes below the opening height. */
const dragOffset = computed(() =>
  isDragging.value && (dismissOnDrag || !isHandleDrag.value) ? Math.max(0, openHeight.value - wantedHeight.value) : 0
);
const shouldDismiss = computed(() => dragOffset.value > openHeight.value * DISMISS_DRAG_RATIO);
/** True when the handle shows that the sheet follows the press. */
const isHandleActive = computed(
  () => isDragging.value && (isHandleDrag.value || Math.abs(dragDelta.value) > DRAG_SLOP)
);

/** A height set by a drag replaces the height of the detent. */
const heightStyle = computed(() => {
  if (isDragging.value && (isHandleDrag.value || isExpanded.value)) {
    return { height: `${dragHeight.value}px`, maxHeight: "none" };
  }
  if (isExpanded.value) return { height: LARGE_HEIGHT, maxHeight: "none" };
  if (settlingHeight.value !== null) return { height: `${settlingHeight.value}px`, maxHeight: "none" };
  return detentStyle.value;
});

/**
 * Makes the backdrop absolute for its way out, in the same place. iOS 27 holds the color of the status bar while a
 * full-screen fixed layer stays, and an absolute layer lets the bar return when the way out starts.
 * This reads the place, because the parent of the layer is the page in the app and a phone frame in the dev tools.
 */
function releaseStatusBarHold(element: Element) {
  const backdrop = element as HTMLElement;
  const { height, top } = backdrop.getBoundingClientRect();
  backdrop.style.position = "absolute";
  backdrop.style.bottom = "auto";
  backdrop.style.height = `${height}px`;
  backdrop.style.top = "0";
  backdrop.style.top = `${top - backdrop.getBoundingClientRect().top}px`;
}

/** Closes the sheet. */
function dismiss() {
  open.value = false;
}

/** Returns the vertical position of a touch or a mouse event. */
function eventY(event: TouchEvent | MouseEvent) {
  return "touches" in event ? (event.touches[0]?.clientY ?? 0) : event.clientY;
}

/** Starts a drag on the handle, or on a free part of the sheet when the content is at its top. */
function startDrag(event: TouchEvent | MouseEvent) {
  const isMouse = !("touches" in event);
  if (isMouse && event.button !== 0) return;

  const target = event.target as Element;
  if (target.closest(isMouse ? NO_MOUSE_DRAG : NO_DRAG)) return;

  const isHandle = showHandle && target.closest("[data-sheet-handle]") !== null;
  if (!isHandle) {
    if (!dismissOnDrag) return;
    if ((contentRef.value?.scrollTop ?? 0) > SCROLL_TOP_DRAG_LIMIT) return;
  }

  const height = sheetRef.value?.offsetHeight ?? 0;
  if (!isExpanded.value && settlingHeight.value === null) openHeight.value = height;
  startHeight.value = height;
  largestHeight.value = Math.max(openHeight.value, (sheetRef.value?.parentElement?.clientHeight ?? 0) * LARGE_RATIO);

  isDragging.value = true;
  isMouseDrag.value = isMouse;
  isHandleDrag.value = isHandle;
  dragStartY.value = eventY(event);
  dragCurrentY.value = dragStartY.value;
}

/** Follows the press. A move above the start of a free press ends the drag, so that the movement can scroll the content. */
function moveDrag(event: TouchEvent | MouseEvent) {
  dragCurrentY.value = eventY(event);
  if (!isHandleDrag.value && dragCurrentY.value < dragStartY.value) resetDrag();
}

/** Ends the drag. A long drag down closes the sheet. Each other drag leaves it at the nearest of its two heights. */
function endDrag() {
  const closes = shouldDismiss.value;
  const resizes = isHandleDrag.value || isExpanded.value;
  const isTap = Math.abs(dragDelta.value) <= DRAG_SLOP;
  const isNearLargest = dragOffset.value === 0 && dragHeight.value > (openHeight.value + largestHeight.value) / 2;

  if (resizes && !isTap) {
    if (!closes && isNearLargest) isExpanded.value = true;
    else void settleAtOpenHeight();
  }
  if (closes) dismiss();
  resetDrag();
}

/**
 * Moves the sheet to its opening height. CSS cannot animate a height to `auto`, so the sheet uses a height in pixels
 * until the animation ends. It then fits its content again.
 */
async function settleAtOpenHeight() {
  isExpanded.value = false;
  settlingHeight.value = openHeight.value;
  const id = ++settleId;
  await nextTick();
  await Promise.allSettled(sheetRef.value?.getAnimations?.().map(({ finished }) => finished) ?? []);
  if (id === settleId) settlingHeight.value = null;
}

/** Ends the press. The sheet goes back to the height that it had before the press. */
function resetDrag() {
  isDragging.value = false;
  isMouseDrag.value = false;
  isHandleDrag.value = false;
}

/** Focuses the panel and not the first control. On a phone, focus in a text field would open the keyboard. */
function focusPanel(event: Event) {
  event.preventDefault();
  sheetRef.value?.focus({ preventScroll: true });
}

// The document gets these listeners only during a drag, because a move can leave the sheet.
const dragTarget = () => (isDragging.value ? document : null);
useEventListener(dragTarget, ["mousemove", "touchmove"], moveDrag, {
  passive: true,
});
useEventListener(dragTarget, ["mouseup", "touchend"], endDrag);
useEventListener(dragTarget, "touchcancel", resetDrag);

// A sheet always opens at its opening height, also when it was at the largest height when it closed.
watch(open, (isOpen) => {
  if (!isOpen) return;
  isExpanded.value = false;
  settlingHeight.value = null;
});

// The cleanup also runs on unmount, so a sheet that a route change removes does not leave the page locked.
watchEffect((onCleanup) => {
  if (open.value) onCleanup(lockPageScroll());
});
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <Transition name="sheet-backdrop" @before-leave="releaseStatusBarHold">
        <!-- The backdrop is a plain element. The DialogOverlay of Reka UI sets `pointer-events: none` on the body, and that stops a tap on a toast. -->
        <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
        <div v-if="open" class="fixed inset-0 z-modalBackdrop bg-base-bg-overlay" @click="dismiss">
          <div class="absolute inset-0 z-modal flex items-end justify-center">
            <!-- Only the backdrop closes the sheet on a tap, so a tap on a toast keeps the sheet open. -->
            <!-- Do not put a comment in the slot of DialogContent. A slot with a comment has no single root in dev mode. -->
            <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
            <DialogContent
              as-child
              force-mount
              aria-modal="true"
              v-bind="description ? {} : { 'aria-describedby': undefined }"
              :disable-outside-pointer-events="false"
              @interact-outside.prevent
              @open-auto-focus="focusPanel"
            >
              <div
                ref="sheet"
                :class="[
                  'sheet relative flex w-full flex-col overflow-hidden rounded-t-3xl bg-comp-sheet-bg shadow-2xl outline-none',
                  { 'is-behind': isBehind, 'is-dragging': isDragging, 'select-none': isMouseDrag },
                ]"
                :style="{
                  ...heightStyle,
                  transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
                  opacity: isDragging && shouldDismiss ? 0.8 : undefined,
                }"
                @click.stop
                @touchstart.passive="startDrag"
                @mousedown="startDrag"
              >
                <!-- The panel gets its name from a DialogTitle. With no visible title, this one holds the name and is hidden. -->
                <DialogTitle v-if="!title" hidden>{{ label }}</DialogTitle>

                <!-- The strip has no color, because the top blur goes under it to the edge of the panel. A screen reader does not need the handle, because it can only drag. -->
                <div
                  v-if="showHandle"
                  aria-hidden="true"
                  data-sheet-handle
                  class="absolute top-0 z-1 flex h-4 w-full cursor-grab touch-none justify-center pt-1.5 active:cursor-grabbing"
                >
                  <div class="sheet-handle-bar relative h-1.25 w-9" :data-active="isHandleActive || undefined">
                    <div class="sheet-handle-fill absolute inset-y-0 rounded-full bg-base-border-primary" />
                  </div>
                </div>

                <!-- A finger closes the sheet with a tap on the backdrop or a drag. This button is for a screen reader and an external keyboard. -->
                <button
                  v-if="showCloseButton"
                  type="button"
                  data-sheet-close
                  class="absolute top-3 right-safe-3 z-2 rounded-full bg-base-bg-secondary px-3 py-2 text-sm font-medium text-base-text-primary not-focus-visible:sr-only focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand-solid"
                  @click="dismiss"
                >
                  {{ $t("header-close") }}
                </button>

                <div
                  ref="content"
                  :class="[
                    'sheet-content min-h-0 flex-1 overflow-y-auto px-safe-4',
                    title ? 'pt-6' : 'pt-4',
                    { 'pb-safe-4': !$slots.actions },
                  ]"
                  :style="$slots.actions ? contentStyle : undefined"
                  @scroll.passive="updateTopBand"
                >
                  <!--
                    The content is not a flex box, so a sticky header in the slot keeps its place.
                    With the strip above it, the title makes the handle tall enough for a finger.
                  -->
                  <DialogTitle
                    v-if="title"
                    :data-sheet-handle="showHandle || undefined"
                    :class="[
                      'text-display-xs font-semibold text-base-text-primary',
                      description ? 'pb-2' : 'pb-5',
                      { 'touch-none': showHandle },
                    ]"
                  >
                    {{ title }}
                  </DialogTitle>
                  <!-- The gap under the line is for the content, so a sheet with only this line does not get taller. -->
                  <DialogDescription
                    v-if="description"
                    :class="['text-sm text-base-text-secondary', { 'pb-5': $slots.default }]"
                  >
                    {{ description }}
                  </DialogDescription>
                  <slot />
                </div>

                <!-- A sheet with no handle can have a sticky header, and this blur would cover it. The size is the strip and the fade. -->
                <div
                  v-if="showHandle"
                  ref="topBand"
                  class="absolute inset-x-0 top-0"
                  style="--blur-band-size: 2.5rem; --blur-band-strength: 0"
                >
                  <BlurBand edge="top" />
                </div>

                <div v-if="$slots.actions" ref="actions" class="absolute inset-x-0 bottom-0">
                  <BlurBand edge="bottom" />
                  <div class="relative flex flex-col gap-2 pt-3 px-safe-4 pb-safe-4">
                    <slot name="actions" />
                  </div>
                </div>
              </div>
            </DialogContent>
          </div>
        </div>
      </Transition>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
/* The panel is inside the backdrop, so the backdrop fades its color and not its opacity. The panel stays opaque. */
.sheet-backdrop-enter-active,
.sheet-backdrop-leave-active {
  transition: background-color var(--motion-duration-sheet) var(--motion-easing-sheet);
}

.sheet-backdrop-enter-from,
.sheet-backdrop-leave-to {
  background-color: transparent;
}

/* A leaving sheet does not stop a tap on the page, because the way out takes some time. */
.sheet-backdrop-leave-active {
  pointer-events: none;
}

.sheet-backdrop-enter-from .sheet {
  transform: translateY(100%);
}

/* The way out goes past 100%, so the shadow also leaves the screen. */
.sheet-backdrop-leave-to .sheet {
  transform: translateY(105%);
}

/*
 * The blur bands use the color of the panel. In the dark theme it is not the color of the page.
 * `will-change` makes the panel a backdrop root, so the top blur does not read the scrim above the panel.
 */
.sheet {
  --blur-band-color: var(--comp-sheet-bg);
  will-change: opacity;
}

/* `scale` is separate from `transform`, so the step back and the slide or the drag do not change each other. */
.sheet {
  transform-origin: bottom center;
  transition:
    transform var(--motion-duration-sheet) var(--motion-easing-sheet),
    height var(--motion-duration-sheet) var(--motion-easing-sheet),
    scale var(--motion-duration-sheet) var(--motion-easing-sheet),
    opacity var(--motion-duration-sheet) var(--motion-easing-standard);
}

/*
 * The bar gets 4px wider, and only its two ends move. Do not use a transform here. A running transform puts the bar on
 * its own layer. On a 1.5x screen the 5px bar is 7.5 device pixels, so that layer draws it about 1px thicker until the
 * animation stops.
 */
.sheet-handle-fill {
  left: 0;
  right: 0;
  transition:
    left var(--motion-duration-container) var(--motion-easing-pop),
    right var(--motion-duration-container) var(--motion-easing-pop),
    background-color var(--motion-duration-feedback) var(--motion-easing-standard);
}

.sheet-handle-bar[data-active] .sheet-handle-fill {
  left: -2px;
  right: -2px;
  background-color: var(--base-fg-tertiary);
}

/* Another sheet is open over this one. The bottom edge stays on the edge of the screen. */
.sheet.is-behind {
  scale: var(--motion-scale-sheet-back);
}

/* The sheet follows the press with no delay. The transition returns when the press ends. */
.sheet.is-dragging {
  transition: none;
}

.sheet-content {
  /* A field that gets focus stays clear of the handle strip and the top blur. */
  scroll-padding-top: 2.5rem;
  touch-action: pan-y;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.sheet-content::-webkit-scrollbar {
  display: none;
}
</style>
