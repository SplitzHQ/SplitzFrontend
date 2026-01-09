<script setup lang="ts">
import interact from "interactjs";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

import type { CardData } from "./types";

interface Props {
  card: CardData;
  cardIndex: number;
  totalCards: number;
  isCurrent: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  accept: [];
  reject: [];
  skip: [];
  hide: [card: CardData];
  action: [card: CardData];
}>();

const interactElement = ref<HTMLElement | null>(null);
const interactPosition = ref({ x: 0, y: 0 });
const isInteractAnimating = ref(true);
const isShowing = ref(true);

// Interaction thresholds
const INTERACT_X_THRESHOLD = 100;
const INTERACT_Y_THRESHOLD = 150;
const INTERACT_OUT_OF_SIGHT_X = 1000;
const INTERACT_OUT_OF_SIGHT_Y = 1000;

// Card display logic
const showHeader = computed(() => props.card.type !== "placeholder");
const showAvatar = computed(() => props.card.type === "settle-up");
const avatarSrc = computed(() => {
  return props.card.avatarUrl ?? "";
});
const displayUserName = computed(() => {
  if (props.card.type === "settle-up") return props.card.userName ?? "";
  if (props.card.type === "draft") {
    const count = props.card.draftCount ?? 0;
    return `${count.toString()} Draft expenses are pending`;
  }
  return "";
});
const displayMessage = computed(() => {
  if (props.card.type === "settle-up") {
    const amountStr =
      typeof props.card.amount === "number"
        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(props.card.amount)
        : (props.card.amount ?? "");
    return `${props.card.message ?? ""} <span class="amount">${amountStr}</span>, awaiting your confirmation.`;
  }
  return props.card.message ?? "";
});
const buttonText = computed(() => {
  return (
    props.card.actionButtonText ??
    (props.card.type === "settle-up" ? "View and Confirm" : props.card.type === "draft" ? "Complete" : "Action")
  );
});

// Transform string for card position
const transformString = computed(() => {
  // Only apply interactive transform for the current card
  if (!props.isCurrent) {
    return; // Non-current cards use CSS for stacking
  }

  const { x, y } = interactPosition.value;
  if (x === 0 && y === 0) {
    return; // Reset position
  }
  return `translate3D(${x.toString()}px, ${y.toString()}px, 0)`;
});

// Set position
function interactSetPosition(coordinates: { x?: number; y?: number }) {
  const { x = 0, y = 0 } = coordinates;
  interactPosition.value = { x, y };
}

// Reset card position
function resetCardPosition() {
  interactSetPosition({ x: 0, y: 0 });
}

// Unset interact element
function interactUnsetElement() {
  if (interactElement.value) {
    interact(interactElement.value).unset();
  }
}

// Play card (accept, reject, or skip)
function playCard(interaction: "accept" | "reject" | "skip") {
  interactUnsetElement();

  switch (interaction) {
    case "accept":
      interactSetPosition({ x: INTERACT_OUT_OF_SIGHT_X });
      emit("accept");
      break;
    case "reject":
      interactSetPosition({ x: -INTERACT_OUT_OF_SIGHT_X });
      emit("reject");
      break;
    case "skip":
      interactSetPosition({ y: INTERACT_OUT_OF_SIGHT_Y });
      emit("skip");
      break;
  }

  hideCard();
}

// Hide card after animation
function hideCard() {
  setTimeout(() => {
    isShowing.value = false;
    emit("hide", props.card);
  }, 300);
}

function handleAction() {
  emit("action", props.card);
}

onMounted(() => {
  if (!interactElement.value) return;

  // Only enable dragging for the current (first) card
  if (props.isCurrent) {
    const element = interactElement.value;

    interact(element).draggable({
      onstart: () => {
        // Disable animation/transition immediately when dragging starts
        isInteractAnimating.value = false;
      },
      onmove: (event: { dx: number; dy: number }) => {
        // Direct position update without transition
        const x = interactPosition.value.x + event.dx;
        const y = interactPosition.value.y + event.dy;
        interactSetPosition({ x, y });
      },
      onend: () => {
        const { x, y } = interactPosition.value;
        // Re-enable animation for smooth transitions
        isInteractAnimating.value = true;

        // Check thresholds
        if (x > INTERACT_X_THRESHOLD) {
          playCard("accept");
        } else if (x < -INTERACT_X_THRESHOLD) {
          playCard("reject");
        } else if (y > INTERACT_Y_THRESHOLD) {
          playCard("skip");
        } else {
          resetCardPosition();
        }
      }
    });
  }
});

onBeforeUnmount(() => {
  if (interactElement.value) {
    interact(interactElement.value).unset();
  }
});
</script>

<template>
  <div
    v-show="isShowing"
    ref="interactElement"
    class="card card-1"
    :class="{
      isAnimating: isInteractAnimating,
      isCurrent,
      'card-stacked': !isCurrent
    }"
    :style="{
      transform: transformString,
      transition: isInteractAnimating ? 'transform 0.3s ease, opacity 0.3s ease' : 'none'
    }"
  >
    <div class="card-content">
      <div v-show="showHeader" class="card-header">
        <div v-show="showAvatar" class="avatar">
          <img v-if="avatarSrc" :src="avatarSrc" :alt="displayUserName" class="avatar-img" />
        </div>
        <p class="user-name">{{ displayUserName }}</p>
      </div>
      <p class="card-message" v-html="displayMessage" />
    </div>
    <div class="card-footer">
      <button class="confirm-button" @click="handleAction">
        <span>{{ buttonText }}</span>
      </button>
      <div class="pagination">
        <p class="pagination-text">
          <span class="current">{{ cardIndex + 1 }}</span
          >/ {{ totalCards }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  cursor: default;
  min-height: 108px;
  height: auto;
  border: 1px solid var(--color-border-primary, #c1c3c2);
  border-radius: var(--radius-2xl, 16px);
  background-color: #ffffff;
  padding: var(--spacing-md, 8px);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 8px);
  z-index: 10;
  box-shadow: var(--shadow-xs, 0px 1px 2px 0px rgba(23, 25, 33, 0.04));
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.card.isAnimating {
  /* Transition is controlled via inline style */
}

.card.isCurrent {
  cursor: grab;
  z-index: 10;
}

.card.isCurrent:active {
  cursor: grabbing;
}

.card.card-stacked {
  cursor: default;
  pointer-events: none;
}

/* Stacked card positions */
.card.card-stacked:nth-of-type(2) {
  transform: translateX(-16px) translateY(6px) scale(0.915);
}

.card.card-stacked:nth-of-type(3) {
  transform: translateX(-32px) translateY(12px) scale(0.83);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 8px);
  width: 100%;
  align-items: flex-start;
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 8px);
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-lg, 8px);
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-md, 6px);
}

.user-name {
  font-family: var(--font-family, "Manrope", sans-serif);
  font-weight: var(--font-weight-semibold, 600);
  font-size: var(--text-md-size, 16px);
  line-height: var(--text-md-line-height, 24px);
  letter-spacing: 0;
  color: var(--color-text-primary, #202221);
}

.card-message {
  font-family: var(--font-family, "Manrope", sans-serif);
  font-weight: var(--font-weight-medium, 500);
  font-size: var(--text-sm-size, 14px);
  line-height: var(--text-sm-line-height, 20px);
  letter-spacing: 0;
  color: var(--color-text-primary, #202221);
  white-space: normal;
  text-align: left;
  width: 100%;
  margin: 0;
  padding: 0;
}

.card-message :deep(.amount) {
  color: var(--color-amount, #308c64);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.confirm-button {
  background-color: var(--color-bg-brand-reverse, #4f635a);
  border: none;
  border-radius: var(--radius-full, 9999px);
  padding: var(--spacing-sm, 6px) var(--spacing-lg, 12px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs, 4px);
  box-shadow: var(--shadow-xs, 0px 1px 2px 0px rgba(23, 25, 33, 0.04));
  transition: background-color 0.2s ease;
}

.confirm-button:hover {
  background-color: #3d4f47;
}

.confirm-button span {
  font-family: var(--font-family, "Manrope", sans-serif);
  font-weight: var(--font-weight-medium, 500);
  font-size: var(--text-sm-size, 14px);
  line-height: var(--text-sm-line-height, 20px);
  letter-spacing: 0;
  color: var(--color-text-primary-reverse, #fafafa);
  text-align: center;
  white-space: nowrap;
}

.pagination {
  display: flex;
  align-items: center;
}

.pagination-text {
  font-family: var(--font-family, "Manrope", sans-serif);
  font-weight: var(--font-weight-medium, 500);
  font-size: var(--text-sm-size, 14px);
  line-height: var(--text-sm-line-height, 20px);
  letter-spacing: 0;
  color: var(--color-text-disabled, #909393);
}

.pagination-text .current {
  color: var(--color-text-tertiary, #535756);
}
</style>
