<script setup lang="ts">
import { RouterLink } from "vue-router";

import type { TransactionDto } from "@/backend";
import TransactionItemContent from "@/components/TransactionItem/TransactionItemContent.vue";

import { TRANSACTION_ROW_CLASS } from "./transaction-row";

/** A row that opens the detail page of a transaction. See `transaction-item.usage.ts` for when to use it. */
export interface TransactionItemProps {
  transaction: TransactionDto;
}

defineProps<TransactionItemProps>();
</script>

<template>
  <RouterLink
    :to="{
      name: 'transactionDetail',
      params: { groupId: transaction.groupId, transactionId: transaction.transactionId },
    }"
    :class="[TRANSACTION_ROW_CLASS, 'focus-visible:outline-offset-2']"
  >
    <TransactionItemContent :transaction="transaction" />
  </RouterLink>
</template>
