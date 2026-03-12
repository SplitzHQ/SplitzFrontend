<script setup lang="ts">
import { computed } from "vue";

import type { TransactionDto } from "@/backend";

import TransactionItem from "./TransactionItem.vue";

const props = defineProps<{
  transactions: TransactionDto[];
}>();

interface TransactionGroup {
  date: string;
  label: string;
  transactions: TransactionDto[];
}

const groupedTransactions = computed<TransactionGroup[]>(() => {
  const sorted = [...props.transactions].sort(
    (a, b) => new Date(b.transactionTime).getTime() - new Date(a.transactionTime).getTime()
  );

  const groups = new Map<string, TransactionDto[]>();
  for (const tx of sorted) {
    const date = new Date(tx.transactionTime);
    const key = `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const existing = groups.get(key);
    if (existing) {
      existing.push(tx);
    } else {
      groups.set(key, [tx]);
    }
  }

  return [...groups.entries()].map(([key, txs]) => {
    const date = new Date(txs[0]!.transactionTime);
    const label = date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
    return { date: key, label, transactions: txs };
  });
});
</script>

<template>
  <div class="flex flex-col gap-3">
    <div v-for="group in groupedTransactions" :key="group.date" class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-base-text-primary">{{ group.label }}</p>
      <TransactionItem v-for="tx in group.transactions" :key="tx.transactionId" :transaction="tx" />
    </div>
  </div>
</template>
