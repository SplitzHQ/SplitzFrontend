<script setup lang="ts">
import { PhCheckCircle, PhCircle } from "@phosphor-icons/vue";

import type { TransactionDto } from "@/backend";
import { LIST_ROW_CLASS } from "@/components/ListRow/list-row";
import TransactionItemContent from "@/components/TransactionItem/TransactionItemContent.vue";

/** A transaction row that the user can select. A screen reader reads the state from `aria-pressed`. */
defineProps<{
  transaction: TransactionDto;
  selected: boolean;
}>();

const emit = defineEmits<{ toggle: [] }>();
</script>

<template>
  <!-- The row reaches the edge of the scroll area, so an outer focus ring is cut. The ring stays inside the row. -->
  <button
    type="button"
    :class="[LIST_ROW_CLASS, 'focus-visible:-outline-offset-2']"
    :aria-pressed="selected"
    @click="emit('toggle')"
  >
    <TransactionItemContent :transaction="transaction">
      <Transition name="fade" mode="out-in">
        <PhCheckCircle
          v-if="selected"
          key="checked"
          weight="fill"
          class="size-6 text-util-color-success-600"
          aria-hidden="true"
        />
        <PhCircle v-else key="unchecked" class="size-6 text-base-text-quaternary" aria-hidden="true" />
      </Transition>
    </TransactionItemContent>
  </button>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--motion-duration-hover-in) var(--motion-easing-standard);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
