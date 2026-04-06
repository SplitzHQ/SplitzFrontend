<script setup lang="ts">
import { PhCheckCircle, PhCircle } from "@phosphor-icons/vue";

import type { TransactionDto } from "@/backend";
import TransactionItemContent from "@/components/TransactionItem/TransactionItemContent.vue";

const props = defineProps<{
  transaction: TransactionDto;
  selected: boolean;
}>();

const emit = defineEmits<{ toggle: [] }>();
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 rounded-2xl py-2 transition-colors active:bg-base-bg-secondary"
    @click="emit('toggle')"
  >
    <TransactionItemContent :transaction="transaction">
      <Transition name="fade" mode="out-in">
        <PhCheckCircle v-if="selected" key="checked" weight="fill" class="size-6 text-util-color-success-600" />
        <PhCircle v-else key="unchecked" class="size-6 text-base-text-quaternary" />
      </Transition>
    </TransactionItemContent>
  </button>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
