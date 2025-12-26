<script setup lang="ts">
import { PhX } from "@phosphor-icons/vue";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

export interface SheetProps {
  /** Whether the sheet is visible */
  modelValue: boolean;
  /** Size of the sheet - 'large' shows ~90% of screen, 'medium' shows ~50% */
  detent?: "large" | "medium";
  /** Whether to show the drag handle at the top */
  showHandle?: boolean;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Whether the sheet can be dismissed by tapping the backdrop */
  dismissOnBackdrop?: boolean;
  /** Whether the sheet can be dismissed by dragging down */
  dismissOnDrag?: boolean;
}

interface SheetEvents {
  "update:modelValue": [value: boolean];
  dismiss: [];
}

const props = withDefaults(defineProps<SheetProps>(), {
  detent: "large",
  showHandle: true,
  showCloseButton: false,
  dismissOnBackdrop: true,
  dismissOnDrag: true
});

const emit = defineEmits<SheetEvents>();

// Refs
const sheetRef = ref<HTMLElement>();
const isDragging = ref(false);
const dragStartY = ref(0);
const dragCurrentY = ref(0);
const sheetHeight = ref(0);

// Computed
const isVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit("update:modelValue", value);
  }
});

const detentHeight = computed(() => {
  switch (props.detent) {
    case "medium":
      return "50vh";
    default: // all other cases, including 'large'
      return "90vh";
  }
});

const dragOffset = computed(() => {
  if (!isDragging.value) return 0;
  const offset = dragCurrentY.value - dragStartY.value;
  return Math.max(0, offset); // Only allow dragging down
});

const shouldDismiss = computed(() => {
  return dragOffset.value > sheetHeight.value * 0.3; // Dismiss if dragged down more than 30%
});

// Methods
function dismiss() {
  isVisible.value = false;
  emit("dismiss");
}

function handleBackdropClick() {
  if (props.dismissOnBackdrop) {
    dismiss();
  }
}

// Touch/Mouse drag handlers
function handleDragStart(event: TouchEvent | MouseEvent) {
  if (!props.dismissOnDrag) return;

  isDragging.value = true;
  const clientY = "touches" in event ? (event.touches.length > 0 ? event.touches[0]!.clientY : 0) : event.clientY;
  dragStartY.value = clientY;
  dragCurrentY.value = clientY;

  if (sheetRef.value) {
    sheetHeight.value = sheetRef.value.offsetHeight;
  }

  // Prevent text selection during drag
  document.body.style.userSelect = "none";
}

function handleDragMove(event: TouchEvent | MouseEvent) {
  if (!isDragging.value) return;

  event.preventDefault();
  const clientY = "touches" in event ? (event.touches.length > 0 ? event.touches[0]!.clientY : 0) : event.clientY;
  dragCurrentY.value = clientY;
}

function handleDragEnd() {
  if (!isDragging.value) return;

  if (shouldDismiss.value) {
    dismiss();
  }

  // Reset drag values
  isDragging.value = false;
  document.body.style.userSelect = "";
  dragStartY.value = 0;
  dragCurrentY.value = 0;
}

// Keyboard handler
function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && isVisible.value) {
    dismiss();
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("mousemove", handleDragMove);
  document.addEventListener("mouseup", handleDragEnd);
  document.addEventListener("touchmove", handleDragMove, { passive: false });
  document.addEventListener("touchend", handleDragEnd);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("mousemove", handleDragMove);
  document.removeEventListener("mouseup", handleDragEnd);
  document.removeEventListener("touchmove", handleDragMove);
  document.removeEventListener("touchend", handleDragEnd);
});

// Watch for visibility changes to manage body scroll
watch(isVisible, async (newValue) => {
  if (newValue) {
    await nextTick();
    // Prevent body scroll when sheet is open
    document.body.style.overflow = "hidden";
  } else {
    // Restore body scroll
    document.body.style.overflow = "";
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet-backdrop">
      <!-- Backdrop -->
      <div
        v-if="isVisible"
        class="fixed inset-0 bg-util-alpha-black-10 backdrop-blur-xs z-modal-backdrop"
        @click="handleBackdropClick"
      >
        <div class="absolute inset-0 flex items-end justify-center z-modal">
          <!-- Sheet -->
          <div
            v-if="isVisible"
            ref="sheetRef"
            class="relative w-full flex flex-col bg-base-bg-primary shadow-2xl rounded-t-3xl overflow-hidden sheet"
            :style="{
              maxHeight: detentHeight,
              transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
              opacity: isDragging && shouldDismiss ? 0.8 : undefined
            }"
            @click.stop
            @touchstart="handleDragStart"
            @mousedown="handleDragStart"
          >
            <!-- Header -->
            <div>
              <!-- Drag Handle -->
              <div v-if="showHandle" class="absolute top-0 py-1 w-full flex justify-center bg-base-bg-primary">
                <button
                  class="w-10 h-1 bg-base-fg-secondary hover:bg-base-fg-secondary_hover rounded-full cursor-grab active:cursor-grabbing"
                />
              </div>
              <!-- Close Button -->
              <button
                v-if="showCloseButton"
                aria-label="Close"
                :class="[
                  'absolute top-3 right-3 transition-colors rounded-full p-2',
                  'text-comp-button-close-fg-default hover:bg-comp-button-close-bg-hover active:bg-comp-button-close-bg-pressed'
                ]"
                @click="dismiss"
              >
                <PhX :size="20" />
              </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto px-4 pt-4 pb-12 sheet-content">
              <slot />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
$transition-duration: 0.3s;

.sheet-backdrop-enter-active,
.sheet-backdrop-leave-active {
  transition: opacity $transition-duration ease;
}

.sheet-backdrop-enter-from,
.sheet-backdrop-leave-to {
  opacity: 0;

  .sheet {
    transform: translateY(100%);
  }
}

.sheet {
  transition:
    transform $transition-duration cubic-bezier(0.32, 0.72, 0, 1),
    opacity $transition-duration ease;
}

/* Ensure smooth dragging */
.sheet-content {
  touch-action: pan-y;

  /* Hide scrollbar for WebKit browsers (Chrome, Safari, Edge) */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for Firefox */
  scrollbar-width: none;

  /* Hide scrollbar for IE and Edge Legacy */
  -ms-overflow-style: none;
}
</style>
