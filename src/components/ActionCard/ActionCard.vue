<script setup lang="ts">
import { PhClock, PhPencilRuler } from "@phosphor-icons/vue";
import { computed, type Component } from "vue";

import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";

// Default secondary action icon for draft type
const defaultSecondaryActionIcon = PhClock;

export type ActionCardType = "settle-up" | "draft" | "placeholder";

export interface ActionCardProps {
  type?: ActionCardType;
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
  secondaryActionIcon?: Component;
  currentIndex?: number;
  totalCount?: number;
  onAction?: () => void;
  onSecondaryAction?: () => void;
}

const props = withDefaults(defineProps<ActionCardProps>(), {
  type: "settle-up",
  actionButtonText: "Action"
});

// Format amount as currency
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const isSettleUp = computed(() => props.type === "settle-up");
const isDraft = computed(() => props.type === "draft");
const isPlaceholder = computed(() => props.type === "placeholder");
</script>

<template>
  <div
    class="relative flex w-full min-w-[108px] shrink-0 flex-col items-start gap-2 overflow-clip rounded-2xl border border-solid border-base-border-primary p-2"
    :style="{
      backgroundImage: isSettleUp
        ? 'linear-gradient(90deg, rgba(121, 150, 137, 0.05) 0%, rgba(121, 150, 137, 0.05) 100%), linear-gradient(90deg, rgba(250, 251, 250, 1) 0%, rgba(250, 251, 250, 1) 100%)'
        : isDraft
          ? 'linear-gradient(90deg, rgba(121, 150, 137, 0.05) 0%, rgba(121, 150, 137, 0.05) 100%), linear-gradient(90deg, rgba(250, 251, 250, 1) 0%, rgba(250, 251, 250, 1) 100%)'
          : undefined
    }"
  >
    <!-- Settle Up & Draft Content -->
    <div v-if="isSettleUp || isDraft" class="relative flex w-full shrink-0 flex-col items-start gap-2">
      <!-- Header with Avatar/Icon and Title -->
      <div class="relative flex w-full shrink-0 items-center gap-2">
        <!-- Settle Up: Avatar -->
        <div v-if="isSettleUp" class="relative size-6 shrink-0 overflow-clip rounded-lg">
          <div class="absolute inset-0 rounded-md">
            <img
              :src="userPhoto || '/default-user.svg'"
              :alt="userName || 'User'"
              class="object-50%-50% pointer-events-none absolute inset-0 size-full max-w-none rounded-md object-cover"
            />
          </div>
        </div>

        <!-- Draft: Icon -->
        <div v-if="isDraft" class="relative size-6 shrink-0">
          <PhPencilRuler class="size-6 text-base-text-primary" />
        </div>

        <!-- Title -->
        <p class="relative shrink-0 text-base leading-6 font-semibold text-base-text-primary">
          <template v-if="isSettleUp">{{ userName }}</template>
          <template v-else-if="isDraft">{{ draftCount }} Draft expenses are pending</template>
        </p>
      </div>

      <!-- Message -->
      <p
        v-if="isSettleUp || isDraft"
        class="relative w-full shrink-0 text-sm leading-5 font-medium whitespace-pre-wrap text-base-text-primary"
      >
        <template v-if="isSettleUp">
          <span>{{ message }}</span>
          <span v-if="amount !== undefined" class="text-[#308c64]">{{ formatAmount(amount) }}</span>
          <span>, awaiting your confirmation.</span>
        </template>
        <template v-else-if="isDraft">
          {{ draftMessage }}
        </template>
      </p>
    </div>

    <!-- Placeholder Content -->
    <div v-else-if="isPlaceholder" class="relative flex w-full shrink-0 items-center justify-between">
      <div class="relative flex shrink-0 items-center">
        <p class="relative shrink-0 text-sm leading-5 font-medium text-base-text-disabled">
          <span class="text-[#535756]">{{ currentIndex }}</span>
          <span> / {{ totalCount }}</span>
        </p>
      </div>
      <SButton v-if="actionButtonText" variant="primary" color="brand" size="md" @click="onAction">
        {{ actionButtonText }}
      </SButton>
    </div>

    <!-- Action Buttons and Pagination (Settle Up & Draft) -->
    <div v-if="isSettleUp || isDraft" class="relative flex w-full shrink-0 items-center justify-between">
      <!-- Action Button -->
      <div class="relative flex shrink-0 items-center gap-2">
        <SButton variant="primary" color="brand" size="md" @click="onAction">
          {{ actionButtonText }}
        </SButton>
        <!-- Draft: Secondary Action (Clock Icon) -->
        <SIconButton v-if="isDraft" variant="outline" color="brand" size="md" @click="onSecondaryAction">
          <component :is="secondaryActionIcon || defaultSecondaryActionIcon" />
        </SIconButton>
      </div>

      <!-- Pagination -->
      <div v-if="currentIndex !== undefined && totalCount !== undefined" class="relative flex shrink-0 items-center">
        <p class="relative shrink-0 text-sm leading-5 font-medium text-base-text-disabled">
          <span class="text-[#535756]">{{ currentIndex }}</span>
          <span> / {{ totalCount }}</span>
        </p>
      </div>
    </div>

    <!-- Placeholder: Description Text -->
    <p
      v-if="isPlaceholder && placeholderText"
      class="relative w-full shrink-0 text-sm leading-5 font-medium whitespace-pre-wrap text-base-text-primary"
    >
      {{ placeholderText }}
    </p>
  </div>
</template>
