<script setup lang="ts">
import { ref, computed, watch } from "vue";

import InteractCard from "./InteractCard.vue";
import type { CardData } from "./types";

interface Props {
  cards: CardData[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  action: [card: CardData];
}>();

const currentIndex = ref(0);
const cardsData = ref<CardData[]>([...props.cards]);

// Watch for changes in props.cards
watch(
  () => props.cards,
  (newCards) => {
    cardsData.value = [...newCards];
    // Reset current index if needed
    if (currentIndex.value >= newCards.length) {
      currentIndex.value = 0;
    }
  },
  { deep: true }
);

// Show up to 3 cards at a time (main card + 2 stacked)
const visibleCards = computed(() => {
  const result: CardData[] = [];
  for (let i = 0; i < Math.min(3, cardsData.value.length); i++) {
    const idx = (currentIndex.value + i) % cardsData.value.length;
    const card = cardsData.value[idx];
    if (card) {
      result.push(card);
    }
  }
  return result;
});

function handleAccept() {
  nextCard();
}

function handleReject() {
  nextCard();
}

function handleSkip() {
  nextCard();
}

function handleHide() {
  nextCard();
}

function handleAction(card: CardData) {
  emit("action", card);
}

function nextCard() {
  if (cardsData.value.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % cardsData.value.length;
  }
}
</script>

<template>
  <div class="cards-container">
    <div class="card-background card-3" />
    <div class="card-background card-2" />

    <div class="interact-cards-wrapper">
      <InteractCard
        v-for="(card, index) in visibleCards"
        :key="`${card.id}-${currentIndex}-${index}`"
        :card="card"
        :card-index="(currentIndex + index) % cardsData.length"
        :total-cards="cardsData.length"
        :is-current="index === 0"
        :style="{ zIndex: 10 - index }"
        @accept="handleAccept"
        @reject="handleReject"
        @skip="handleSkip"
        @hide="handleHide"
        @action="handleAction"
      />
    </div>
  </div>
</template>

<style scoped>
.cards-container {
  position: relative;
  width: 100%;
  height: auto;
  min-height: 108px;
  padding-bottom: 0;
  padding-top: 0;
  margin-top: 0;
  margin-bottom: 0;
  overflow: visible;
}

.card-background {
  position: absolute;
  min-width: 108px;
  height: 108px;
  background-color: var(--color-bg-secondary-alt, #f2f5f3);
  border: 1px solid var(--color-border-secondary, #dbdcdc);
  border-radius: var(--radius-xl, 12px);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* 最底层卡片 */
.card-3 {
  position: absolute;
  bottom: 0;
  left: 32px;
  width: calc(100% - 64px);
  opacity: 0.6;
  z-index: 1;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease,
    width 0.3s ease;
}

/* 中间层卡片 */
.card-2 {
  position: absolute;
  bottom: 6px;
  left: 16px;
  width: calc(100% - 32px);
  opacity: 0.8;
  z-index: 2;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease,
    width 0.3s ease;
}

.interact-cards-wrapper {
  position: relative;
  width: 100%;
  min-height: 120px;
  height: auto;
  /* Prevent page scroll when interacting with cards */
  touch-action: pan-x pan-y;
  -ms-touch-action: pan-x pan-y;
}
</style>
