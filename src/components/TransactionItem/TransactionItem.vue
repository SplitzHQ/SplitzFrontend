<script setup lang="ts">
import { RouterLink } from "vue-router";

import type { TransactionDto } from "@/backend";
import TransactionItemContent from "@/components/TransactionItem/TransactionItemContent.vue";

defineProps<{
  transaction: TransactionDto;
}>();
</script>

<template>
  <RouterLink
    :to="{
      name: 'transactionDetail',
      params: { groupId: transaction.groupId, transactionId: transaction.transactionId },
    }"
    class="flex items-center gap-3 rounded-2xl py-2 transition-colors active:bg-base-bg-secondary"
  >
    <TransactionItemContent :transaction="transaction" />
  </RouterLink>
</template>
