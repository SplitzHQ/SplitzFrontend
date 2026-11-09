<script setup lang="ts">
import { useEventListener, useResizeObserver } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { DialogContent, DialogPortal, DialogRoot, DialogTitle } from "reka-ui";
import { computed, nextTick, ref, useTemplateRef, watch, watchEffect } from "vue";

import BlurBand from "@/components/BlurBand/BlurBand.vue";

import { lockPageScroll } from "./sheet-scroll-lock";
import { useSheetStack } from "./sheet-stack";

/**
 * A modal bottom sheet. See `sheet.usage.ts` for usage rules.
 * Reka UI handles the dialog role, focus trap, focus restoration, Escape key, and layer stacking.
 * This component adds styling, the title and action bar layout, and drag gestures.
 *
 * The default slot holds the scrollable content. The `actions` slot stays pinned to the bottom.
 */
interface SheetBaseProps {
  /** Initial height cap: `large` is 90% of the dynamic viewport height, and `medium` is 50%. */
  detent?: "large" | "medium";
  /** `maxHeight` lets the sheet shrink to fit its content up to the detent. `height` fixes the sheet at the detent height. */
  detentSizing?: "maxHeight" | "height";
  /** Shows the top drag handle. Dragging the handle lets the user resize the sheet. */
  showHandle?: boolean;
  /** Renders a close button that remains visually hidden until focused by a keyboard, while always accessible to screen readers. */
  showCloseButton?: boolean;
  /** Allows dragging down to close the sheet. Disable this when the content handles its own vertical drag gestures. */
  dismissOnDrag?: boolean;
}

/** A sheet gets its accessible name from its visible `title`, or from `label` when no visible title is rendered. */
export type SheetProps = SheetBaseProps &
  (
    | {
        /** Visible heading text, also used as the dialog's accessible name. */
        title: string;
        label?: undefined;
      }
    | {
        title?: undefined;
        /** Screen-reader label required when the sheet has no visible `title`. */
        label: string;
      }
  );

const {
  title,
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

/** Elements that handle their own pointer gestures and should never initiate a sheet drag. */
const NON_DRAGGABLE_SELECTOR = "input, textarea, select, [contenteditable='true'], [role='slider']";
/** Mouse releases also fire a `click` event, so mouse drags must not start on interactive controls. */
const NON_MOUSE_DRAGGABLE_SELECTOR = `${NON_DRAGGABLE_SELECTOR}, button, a, label, summary`;
/** Maximum scroll offset (px) at which dragging the content area pulls the sheet instead of scrolling. */
const MAX_SCROLL_TOP_FOR_DRAG = 10;
/** Fraction of the resting height the user must drag down past to dismiss the sheet. */
const DISMISS_DRAG_RATIO = 0.3;
/** Minimum pointer movement (px) required to treat a press as a drag rather than a tap. */
const DRAG_THRESHOLD_PX = 3;
/** Expanded height target when dragging the handle upward, as a fraction and CSS percentage of the container. */
const EXPANDED_HEIGHT_RATIO = 0.9;
const EXPANDED_HEIGHT_CSS = "90%";
/** Damping factor and maximum pixel offset when dragging upward past the expanded height. */
const OVERDRAG_DAMPING = 0.2;
const MAX_OVERDRAG_PX = 24;

const sheetRef = useTemplateRef<HTMLElement>("sheet");
const contentRef = useTemplateRef<HTMLElement>("content");
const topBlurBandRef = useTemplateRef<HTMLElement>("topBlurBand");
const actionsRef = useTemplateRef<HTMLElement>("actions");

/** Scroll distance (px) over which the top blur band ramps from 0 to full strength (top padding + one title line). */
const TOP_BLUR_SCROLL_RANGE_PX = 44;
/** Extra space between the end of the scrollable content and the floating action bar. */
const ACTIONS_CLEARANCE_GAP = "1.5rem";

const actionsHeight = ref(0);

// Track the floating action bar height as its content changes (e.g., error notices or countdowns).
useResizeObserver(actionsRef, ([entry]) => {
  actionsHeight.value = entry?.borderBoxSize[0]?.blockSize ?? 0;
});

/** Bottom padding and scroll padding so the last content item and focused inputs stay above the floating action bar. */
const contentBottomClearanceStyle = computed(() => {
  const clearance = `calc(${actionsHeight.value}px + ${ACTIONS_CLEARANCE_GAP})`;
  return { paddingBottom: clearance, scrollPaddingBottom: clearance };
});

/**
 * Updates the top blur strength directly on the DOM element during scroll to avoid triggering Vue re-renders.
 */
function updateTopBlurBand() {
  const strength = Math.min(1, (contentRef.value?.scrollTop ?? 0) / TOP_BLUR_SCROLL_RANGE_PX);
  topBlurBandRef.value?.style.setProperty("--blur-band-strength", String(strength));
}

const isDragging = ref(false);
const isMouseDragging = ref(false);
/** True when the drag started on the handle or title. Only handle drags can expand the sheet. */
const isHandleDragging = ref(false);
const dragStartY = ref(0);
const dragCurrentY = ref(0);
/** Sheet height in pixels when the current drag gesture started. */
const dragStartHeight = ref(0);
/** Unexpanded height in pixels measured before expanding. Used as the baseline for dismissal and collapsing back. */
const defaultRestingHeight = ref(0);
/** Maximum expanded height in pixels (90% of the container, or `defaultRestingHeight` if already taller). */
const maxExpandedHeight = ref(0);
/** True when the user has dragged the handle up to lock the sheet at its expanded height. */
const isExpanded = ref(false);
/** Explicit pixel height used while animating back to the resting height, since CSS cannot transition to `auto`. */
const collapsingHeight = ref<number | null>(null);
let collapseAnimationId = 0;

/** Default CSS sizing from the `detent` and `detentSizing` props. Uses `dvh` to respect mobile browser toolbars. */
const sheetDefaultStyle = computed(() => {
  const size = detent === "medium" ? "50dvh" : "90dvh";
  return detentSizing === "height" ? { height: size } : { maxHeight: size };
});

/** Vertical pointer movement in pixels since the drag started (positive = downward, negative = upward). */
const dragDeltaY = computed(() => (isDragging.value ? dragCurrentY.value - dragStartY.value : 0));
/** Target height in pixels requested by the pointer position before clamping or overdrag damping. */
const unclampedDragHeight = computed(() => dragStartHeight.value - dragDeltaY.value);
/** Clamped height in pixels applied while resizing the sheet. Applies rubber-band damping above `maxExpandedHeight`. */
const activeDragHeight = computed(() => {
  const overdrag = unclampedDragHeight.value - maxExpandedHeight.value;
  if (overdrag > 0) return maxExpandedHeight.value + Math.min(overdrag * OVERDRAG_DAMPING, MAX_OVERDRAG_PX);
  return Math.max(defaultRestingHeight.value, unclampedDragHeight.value);
});
/**
 * Downward translation in pixels when dragging below `defaultRestingHeight`.
 * Only active when `dismissOnDrag` is enabled.
 */
const sheetTranslateY = computed(() =>
  isDragging.value && dismissOnDrag ? Math.max(0, defaultRestingHeight.value - unclampedDragHeight.value) : 0
);
const shouldDismiss = computed(() => sheetTranslateY.value > defaultRestingHeight.value * DISMISS_DRAG_RATIO);
/** Highlights the handle bar immediately on handle press, or once a content drag exceeds the tap threshold. */
const isHandleActive = computed(
  () => isDragging.value && (isHandleDragging.value || Math.abs(dragDeltaY.value) > DRAG_THRESHOLD_PX)
);

/** Active height style: overrides the default detent sizing during a resize drag, when expanded, or while collapsing. */
const sheetHeightStyle = computed(() => {
  if (isDragging.value && (isHandleDragging.value || isExpanded.value)) {
    return { height: `${activeDragHeight.value}px`, maxHeight: "none" };
  }
  if (isExpanded.value) return { height: EXPANDED_HEIGHT_CSS, maxHeight: "none" };
  if (collapsingHeight.value !== null) return { height: `${collapsingHeight.value}px`, maxHeight: "none" };
  return sheetDefaultStyle.value;
});

/** Closes the sheet. */
function dismiss() {
  open.value = false;
}

/** Extracts the client Y coordinate from a mouse or touch event. */
function getPointerY(event: TouchEvent | MouseEvent) {
  return "touches" in event ? (event.touches[0]?.clientY ?? 0) : event.clientY;
}

/** Starts a drag from the handle (resize + dismiss) or from the content area when scrolled to the top (dismiss only). */
function startDrag(event: TouchEvent | MouseEvent) {
  const isMouse = !("touches" in event);
  if (isMouse && event.button !== 0) return;

  const target = event.target as Element;
  if (target.closest(isMouse ? NON_MOUSE_DRAGGABLE_SELECTOR : NON_DRAGGABLE_SELECTOR)) return;

  const isHandle = showHandle && target.closest("[data-sheet-handle]") !== null;
  if (!isHandle) {
    if (!dismissOnDrag) return;
    if ((contentRef.value?.scrollTop ?? 0) > MAX_SCROLL_TOP_FOR_DRAG) return;
  }

  const currentHeight = sheetRef.value?.offsetHeight ?? 0;
  if (!isExpanded.value && collapsingHeight.value === null) defaultRestingHeight.value = currentHeight;
  dragStartHeight.value = currentHeight;
  maxExpandedHeight.value = Math.max(
    defaultRestingHeight.value,
    (sheetRef.value?.parentElement?.clientHeight ?? 0) * EXPANDED_HEIGHT_RATIO
  );

  isDragging.value = true;
  isMouseDragging.value = isMouse;
  isHandleDragging.value = isHandle;
  dragStartY.value = getPointerY(event);
  dragCurrentY.value = dragStartY.value;
}

/** Updates the drag position. Cancels non-handle drags if the pointer moves upward so the content can scroll normally. */
function moveDrag(event: TouchEvent | MouseEvent) {
  dragCurrentY.value = getPointerY(event);
  if (!isHandleDragging.value && dragCurrentY.value < dragStartY.value) cancelDrag();
}

/** Finishes the drag: dismisses if pulled far enough down, otherwise snaps to the nearest height (expanded or resting). */
function endDrag() {
  const willDismiss = shouldDismiss.value;
  const canResize = isHandleDragging.value || isExpanded.value;
  const isTap = Math.abs(dragDeltaY.value) <= DRAG_THRESHOLD_PX;
  const shouldExpand =
    sheetTranslateY.value === 0 && activeDragHeight.value > (defaultRestingHeight.value + maxExpandedHeight.value) / 2;

  if (canResize && !isTap) {
    if (!willDismiss && shouldExpand) isExpanded.value = true;
    else void collapseToRestingHeight();
  }
  if (willDismiss) dismiss();
  cancelDrag();
}

/**
 * Animates the sheet back to its initial resting height.
 * Because CSS cannot transition `height` to `auto`, this sets an explicit pixel height until the transition finishes.
 */
async function collapseToRestingHeight() {
  isExpanded.value = false;
  collapsingHeight.value = defaultRestingHeight.value;
  const id = ++collapseAnimationId;
  await nextTick();
  await Promise.allSettled(sheetRef.value?.getAnimations?.().map(({ finished }) => finished) ?? []);
  if (id === collapseAnimationId) collapsingHeight.value = null;
}

/** Clears active drag flags so the sheet snaps back or finishes its transition. */
function cancelDrag() {
  isDragging.value = false;
  isMouseDragging.value = false;
  isHandleDragging.value = false;
}

/** Moves initial focus to the dialog panel itself rather than the first input, preventing mobile keyboards from popping up automatically. */
function focusPanel(event: Event) {
  event.preventDefault();
  sheetRef.value?.focus({ preventScroll: true });
}

// Attach document-level move/end listeners only while a drag is active so pointer movement outside the sheet is tracked.
const activeDragDocument = () => (isDragging.value ? document : null);
useEventListener(activeDragDocument, ["mousemove", "touchmove"], moveDrag, {
  passive: true,
});
useEventListener(activeDragDocument, ["mouseup", "touchend"], endDrag);
useEventListener(activeDragDocument, "touchcancel", cancelDrag);

// Reset expansion state whenever the sheet opens so it always starts at its default detent height.
watch(open, (isOpen) => {
  if (!isOpen) return;
  isExpanded.value = false;
  collapsingHeight.value = null;
});

// Lock background page scroll while the sheet is open; cleanup also runs on unmount (e.g., during route navigation).
watchEffect((onCleanup) => {
  if (open.value) onCleanup(lockPageScroll());
});
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <Transition name="sheet-backdrop">
        <!-- Plain backdrop element instead of Reka UI's DialogOverlay, which sets `pointer-events: none` on body and blocks toast clicks. -->
        <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
        <div v-if="open" class="fixed inset-0 z-modalBackdrop bg-base-bg-overlay" @click="dismiss">
          <div class="absolute inset-0 z-modal flex items-end justify-center">
            <!-- Prevent outside interactions (like clicking a toast) from auto-closing the dialog; backdrop clicks call `dismiss` directly. -->
            <!-- Keep a single root element with no sibling HTML comments inside DialogContent (`as-child` requires a single child node in dev mode). -->
            <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
            <DialogContent
              as-child
              force-mount
              aria-modal="true"
              :aria-describedby="undefined"
              :disable-outside-pointer-events="false"
              @interact-outside.prevent
              @open-auto-focus="focusPanel"
            >
              <div
                ref="sheet"
                :class="[
                  'sheet relative flex w-full flex-col overflow-hidden rounded-t-3xl bg-comp-sheet-bg shadow-2xl outline-none',
                  { 'is-behind': isBehind, 'is-dragging': isDragging, 'select-none': isMouseDragging },
                ]"
                :style="{
                  ...sheetHeightStyle,
                  transform: isDragging ? `translateY(${sheetTranslateY}px)` : undefined,
                  opacity: isDragging && shouldDismiss ? 0.8 : undefined,
                }"
                @click.stop
                @touchstart.passive="startDrag"
                @mousedown="startDrag"
              >
                <!-- Transparent handle strip so the top blur band shows through to the panel edge. Hidden from screen readers since dragging is pointer-only. -->
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

                <!-- Visually hidden unless keyboard-focused; provides an accessible close control for keyboard and screen-reader users. -->
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
                    'sheet-content min-h-0 flex-1 overflow-y-auto pt-4 px-safe-4',
                    { 'pb-safe-4': !$slots.actions },
                  ]"
                  :style="$slots.actions ? contentBottomClearanceStyle : undefined"
                  @scroll.passive="updateTopBlurBand"
                >
                  <!--
                    Block layout (not flex) so sticky headers inside the default slot work as expected.
                    Marks the title with `data-sheet-handle` so dragging the title also resizes the sheet.
                  -->
                  <DialogTitle
                    v-if="title"
                    :data-sheet-handle="showHandle || undefined"
                    :class="['pb-4 text-lg font-semibold text-base-text-primary', { 'touch-none': showHandle }]"
                  >
                    {{ title }}
                  </DialogTitle>
                  <!-- Hidden DialogTitle provides the accessible dialog name when no visible `title` is used. -->
                  <DialogTitle v-else hidden>{{ label }}</DialogTitle>
                  <slot />
                </div>

                <!-- Only render the top blur band when `showHandle` is enabled so sheets without a handle can use their own sticky header. -->
                <div
                  v-if="showHandle"
                  ref="topBlurBand"
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
/* Animate background-color instead of opacity because `.sheet` is nested inside the backdrop and must stay fully opaque. */
.sheet-backdrop-enter-active,
.sheet-backdrop-leave-active {
  transition: background-color var(--motion-duration-sheet) var(--motion-easing-sheet);
}

.sheet-backdrop-enter-from,
.sheet-backdrop-leave-to {
  background-color: transparent;
}

/* Allow clicks to pass through to the page immediately while the closing animation plays. */
.sheet-backdrop-leave-active {
  pointer-events: none;
}

.sheet-backdrop-enter-from .sheet {
  transform: translateY(100%);
}

/* Translate past 100% on exit so the panel's top shadow also clears the bottom of the viewport. */
.sheet-backdrop-leave-to .sheet {
  transform: translateY(105%);
}

/*
 * Match the blur band tint to the sheet background color (which differs from the page background in dark mode).
 * `will-change: opacity` establishes a backdrop root so the top blur band only samples content inside the sheet, not the backdrop scrim.
 */
.sheet {
  --blur-band-color: var(--comp-sheet-bg);
  will-change: opacity;
}

/* Use the standalone `scale` property so background-sheet scaling does not conflict with slide/drag `transform`. */
.sheet {
  transform-origin: bottom center;
  transition:
    transform var(--motion-duration-sheet) var(--motion-easing-sheet),
    height var(--motion-duration-sheet) var(--motion-easing-sheet),
    scale var(--motion-duration-sheet) var(--motion-easing-sheet),
    opacity var(--motion-duration-sheet) var(--motion-easing-standard);
}

/*
 * Expand the handle bar by 2px on each side when active by animating `left` and `right` instead of `transform: scaleX()`.
 * A transform promotes the 5px-tall bar to its own compositor layer, which causes fractional-pixel rounding on 1.5x displays
 * and makes the bar appear ~1px thicker during the transition.
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

/* Scale down slightly from the bottom center when another sheet opens on top of this one. */
.sheet.is-behind {
  scale: var(--motion-scale-sheet-back);
}

/* Disable transitions during an active drag so the sheet tracks the pointer without lag. */
.sheet.is-dragging {
  transition: none;
}

.sheet-content {
  /* Keep focused inputs from scrolling underneath the top handle strip and blur band. */
  scroll-padding-top: 2.5rem;
  touch-action: pan-y;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.sheet-content::-webkit-scrollbar {
  display: none;
}
</style>
