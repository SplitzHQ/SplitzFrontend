<script setup lang="ts">
import { PhCaretDown, PhCaretUp } from "@phosphor-icons/vue";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import ActionCard, { type ActionCardType } from "@/components/ActionCard/ActionCard.vue";

export interface PendingItem {
  id: string;
  type: ActionCardType;
  // Settle Up props
  userName?: string;
  userPhoto?: string | null;
  amount?: number;
  message?: string;
  // Draft props
  draftCount?: number;
  draftMessage?: string;
  // Placeholder props
  placeholderText?: string;
  // Common props
  actionButtonText?: string;
  currentIndex: number;
  totalCount: number;
}

interface PendingItemsProps {
  items: PendingItem[];
}

const props = defineProps<PendingItemsProps>();

interface PendingItemsEvents {
  view: [id: string];
}

const emit = defineEmits<PendingItemsEvents>();

const isExpanded = ref(true);
const currentIndex = ref(0);

// Swipe gesture state
const touchStartX = ref(0);
const touchStartY = ref(0);
const isDragging = ref(false);
const dragOffset = ref(0);
const isTransitioning = ref(false);
const previousDirection = ref<"right" | "left" | null>(null);

// Get visible items (first 3 for stacking effect)
const visibleItems = computed(() => {
  if (!isExpanded.value) return [];
  return props.items.slice(0, 3);
});

// Get current item to display
const currentItem = computed(() => {
  if (visibleItems.value.length === 0) return null;
  return visibleItems.value[currentIndex.value] ?? visibleItems.value[0];
});

// Get next item (for animation)
const nextItem = computed(() => {
  if (visibleItems.value.length <= 1) return null;
  const nextIdx = (currentIndex.value + 1) % visibleItems.value.length;
  return visibleItems.value[nextIdx];
});

// Get previous item (for animation)
const previousItem = computed(() => {
  if (visibleItems.value.length <= 1) return null;
  const prevIdx = currentIndex.value === 0 ? visibleItems.value.length - 1 : currentIndex.value - 1;
  return visibleItems.value[prevIdx];
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const handleAction = (item: PendingItem) => {
  emit("view", item.id);
};

// Swipe gesture handlers
const handleTouchStart = (e: TouchEvent) => {
  if (visibleItems.value.length <= 1 || isTransitioning.value) return;
  const touch = e.touches[0];
  if (!touch) return;
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
  isDragging.value = true;
  dragOffset.value = 0;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value || visibleItems.value.length <= 1 || isTransitioning.value) return;
  const touch = e.touches[0];
  if (!touch) return;
  const currentX = touch.clientX;
  const currentY = touch.clientY;
  const deltaX = currentX - touchStartX.value;
  const deltaY = currentY - touchStartY.value;

  // Only handle horizontal swipes
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    e.preventDefault();
    dragOffset.value = deltaX;
  }
};

const handleTouchEnd = () => {
  if (!isDragging.value || visibleItems.value.length <= 1 || isTransitioning.value) {
    isDragging.value = false;
    dragOffset.value = 0;
    return;
  }

  const swipeDistance = dragOffset.value;
  const minSwipeDistance = 50;

  // Swipe right (positive) = next item
  if (swipeDistance > minSwipeDistance) {
    goToNext();
  }
  // Swipe left (negative) = previous item
  else if (swipeDistance < -minSwipeDistance) {
    goToPrevious();
  } else {
    // Not enough distance, return to original position
    isDragging.value = false;
    dragOffset.value = 0;
  }
};

// Mouse drag support
const handleMouseDown = (e: MouseEvent) => {
  if (visibleItems.value.length <= 1 || isTransitioning.value) return;
  touchStartX.value = e.clientX;
  touchStartY.value = e.clientY;
  isDragging.value = true;
  dragOffset.value = 0;
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || visibleItems.value.length <= 1 || isTransitioning.value) return;
  const deltaX = e.clientX - touchStartX.value;
  const deltaY = e.clientY - touchStartY.value;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    dragOffset.value = deltaX;
  }
};

const handleMouseUp = () => {
  if (!isDragging.value || visibleItems.value.length <= 1 || isTransitioning.value) {
    isDragging.value = false;
    dragOffset.value = 0;
    return;
  }

  const swipeDistance = dragOffset.value;
  const minSwipeDistance = 50;

  if (swipeDistance > minSwipeDistance) {
    goToNext();
  } else if (swipeDistance < -minSwipeDistance) {
    goToPrevious();
  } else {
    isDragging.value = false;
    dragOffset.value = 0;
  }
};

// Navigation functions
const goToNext = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  isDragging.value = false;
  const wasMovingRight = previousDirection.value === "right";

  setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % visibleItems.value.length;
    isTransitioning.value = false;
    dragOffset.value = 0;

    // If the new card was previously moved to the right (off screen),
    // immediately position it at center without animation
    if (wasMovingRight) {
      previousDirection.value = null;
    } else {
      // Mark that we moved right for next time
      previousDirection.value = "right";
      // Reset after a frame to allow the card to appear immediately at center
      requestAnimationFrame(() => {
        previousDirection.value = null;
      });
    }
  }, 300);
};

const goToPrevious = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  isDragging.value = false;
  const wasMovingLeft = previousDirection.value === "left";

  setTimeout(() => {
    currentIndex.value = currentIndex.value === 0 ? visibleItems.value.length - 1 : currentIndex.value - 1;
    isTransitioning.value = false;
    dragOffset.value = 0;

    // If the new card was previously moved to the left (off screen),
    // immediately position it at center without animation
    if (wasMovingLeft) {
      previousDirection.value = null;
    } else {
      // Mark that we moved left for next time
      previousDirection.value = "left";
      // Reset after a frame to allow the card to appear immediately at center
      requestAnimationFrame(() => {
        previousDirection.value = null;
      });
    }
  }, 300);
};

// Global mouse up handler
const handleGlobalMouseUp = () => {
  if (isDragging.value && !isTransitioning.value) {
    isDragging.value = false;
    dragOffset.value = 0;
  }
};

onMounted(() => {
  globalThis.addEventListener("mouseup", handleGlobalMouseUp);
});

onBeforeUnmount(() => {
  globalThis.removeEventListener("mouseup", handleGlobalMouseUp);
});
</script>

<template>
  <div class="relative flex w-full flex-col items-start gap-2">
    <!-- Section Header -->
    <div class="relative flex w-full shrink-0 items-start justify-between px-2 py-0">
      <div class="relative flex shrink-0 items-start gap-1">
        <p class="relative shrink-0 text-sm leading-5 font-semibold text-base-text-quaternary">Pending Items</p>
        <div
          v-if="!isExpanded && props.items.length > 0"
          class="relative flex size-5 shrink-0 flex-col items-center justify-center rounded-lg bg-base-fg-brand p-2"
        >
          <p class="relative shrink-0 text-xs leading-4 font-semibold text-base-text-primary-reverse">
            {{ props.items.length }}
          </p>
        </div>
      </div>
      <button
        type="button"
        class="relative flex shrink-0 cursor-pointer content-stretch items-center justify-center gap-1 overflow-clip p-0 shadow-xs"
        @click="toggleExpand"
      >
        <PhCaretDown v-if="isExpanded" class="size-5 text-base-text-quaternary" />
        <PhCaretUp v-else class="size-5 text-base-text-quaternary" />
      </button>
    </div>

    <!-- Content -->
    <div
      v-if="isExpanded && visibleItems.length > 0"
      class="relative w-full shrink-0"
      style="min-height: 120px; padding-bottom: 12px"
    >
      <!-- Stacked Cards Background (static visual effect) -->
      <template v-if="visibleItems.length > 1 && !isDragging && !isTransitioning">
        <!-- Second card (first stacked) -->
        <div
          v-if="visibleItems.length > 1"
          class="pointer-events-none absolute rounded-xl border border-solid border-base-border-secondary bg-base-bg-secondary_alt backdrop-blur-sm backdrop-filter"
          style="bottom: 6px; left: 16px; height: 108px; width: calc(100% - 32px); opacity: 0.8; z-index: 0"
        />
        <!-- Third card (second stacked) -->
        <div
          v-if="visibleItems.length > 2"
          class="pointer-events-none absolute rounded-xl border border-solid border-base-border-secondary bg-base-bg-secondary_alt backdrop-blur-sm backdrop-filter"
          style="bottom: 0px; left: 32px; height: 108px; width: calc(100% - 64px); opacity: 0.6; z-index: -1"
        />
      </template>

      <!-- Card Container (for swipe gestures) -->
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
      <div
        class="relative w-full overflow-hidden"
        style="user-select: none; touch-action: pan-y"
        role="application"
        aria-label="Swipeable pending items"
        tabindex="0"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @blur="handleMouseUp"
      >
        <!-- Next Card (coming from behind/stacked position when swiping right) -->
        <div
          v-if="nextItem && (isTransitioning || (isDragging && dragOffset > 0))"
          class="absolute top-0 left-0 w-full"
          style="z-index: 1"
          :style="{
            transform: isTransitioning
              ? 'translateX(0) translateY(0) scale(1)'
              : `translateX(${Math.max(-16, -16 + dragOffset / 10)}px) translateY(${Math.max(6, 6 - dragOffset / 20)}px) scale(${Math.min(1, 0.95 + dragOffset / 2000)})`,
            transition: isTransitioning ? 'transform 0.3s ease-out, opacity 0.3s ease-out' : 'none',
            opacity: isTransitioning ? 1 : Math.min(1, 0.8 + dragOffset / 500)
          }"
        >
          <ActionCard
            :type="nextItem.type"
            :user-name="nextItem.userName"
            :user-photo="nextItem.userPhoto"
            :amount="nextItem.amount"
            :message="nextItem.message"
            :draft-count="nextItem.draftCount"
            :draft-message="nextItem.draftMessage"
            :placeholder-text="nextItem.placeholderText"
            :action-button-text="nextItem.actionButtonText || 'View and Confirm'"
            :current-index="nextItem.currentIndex"
            :total-count="nextItem.totalCount"
            @action="handleAction(nextItem)"
          />
        </div>

        <!-- Previous Card (coming from front when swiping left) -->
        <div
          v-if="previousItem && (isTransitioning || (isDragging && dragOffset < 0))"
          class="absolute top-0 left-0 w-full"
          style="z-index: 1"
          :style="{
            transform: isTransitioning
              ? 'translateX(0) scale(1)'
              : `translateX(${Math.min(0, dragOffset)}px) scale(${Math.min(1, 0.95 + -dragOffset / 2000)})`,
            transition: isTransitioning ? 'transform 0.3s ease-out, opacity 0.3s ease-out' : 'none',
            opacity: isTransitioning ? 1 : Math.min(1, 0.8 + -dragOffset / 500)
          }"
        >
          <ActionCard
            :type="previousItem.type"
            :user-name="previousItem.userName"
            :user-photo="previousItem.userPhoto"
            :amount="previousItem.amount"
            :message="previousItem.message"
            :draft-count="previousItem.draftCount"
            :draft-message="previousItem.draftMessage"
            :placeholder-text="previousItem.placeholderText"
            :action-button-text="previousItem.actionButtonText || 'View and Confirm'"
            :current-index="previousItem.currentIndex"
            :total-count="previousItem.totalCount"
            @action="handleAction(previousItem)"
          />
        </div>

        <!-- Current Card (sliding out) -->
        <div
          v-if="currentItem"
          class="relative"
          style="z-index: 2"
          :style="{
            transform: isDragging
              ? `translateX(${dragOffset}px)`
              : isTransitioning && dragOffset > 0
                ? 'translateX(100%)'
                : isTransitioning && dragOffset < 0
                  ? 'translateX(-100%)'
                  : previousDirection === 'right'
                    ? 'translateX(100%)'
                    : previousDirection === 'left'
                      ? 'translateX(-100%)'
                      : 'translateX(0)',
            transition: isDragging
              ? 'none'
              : previousDirection
                ? 'none'
                : isTransitioning
                  ? 'transform 0.3s ease-out, opacity 0.3s ease-out'
                  : 'transform 0.3s ease-out, opacity 0.3s ease-out',
            opacity: isTransitioning ? 0 : previousDirection ? 0 : 1,
            pointerEvents: isTransitioning || previousDirection ? 'none' : 'auto'
          }"
        >
          <ActionCard
            :type="currentItem.type"
            :user-name="currentItem.userName"
            :user-photo="currentItem.userPhoto"
            :amount="currentItem.amount"
            :message="currentItem.message"
            :draft-count="currentItem.draftCount"
            :draft-message="currentItem.draftMessage"
            :placeholder-text="currentItem.placeholderText"
            :action-button-text="currentItem.actionButtonText || 'View and Confirm'"
            :current-index="currentItem.currentIndex"
            :total-count="currentItem.totalCount"
            @action="handleAction(currentItem)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
