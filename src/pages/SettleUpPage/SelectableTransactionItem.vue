<script setup lang="ts">
import type { TransactionDto } from "@/backend";
import SelectableRow from "@/components/SelectableRow/SelectableRow.vue";
import TransactionItemContent from "@/components/TransactionItem/TransactionItemContent.vue";

/** A transaction row that the user can select on SelectTransactionsPage. SelectableRow gives the state and the mark. */
defineProps<{
  transaction: TransactionDto;
  selected: boolean;
}>();

const emit = defineEmits<{ toggle: [] }>();
</script>

<template>
  <SelectableRow :selected="selected" @toggle="emit('toggle')">
    <TransactionItemContent :transaction="transaction" />
  </SelectableRow>
</template>
