<script setup lang="ts">
import { computed } from "vue";
import type { RouteLocationRaw } from "vue-router";

import type { TransactionDto } from "@/backend";
import TransactionItem from "@/components/TransactionItem/TransactionItem.vue";

import RoundRow from "./RoundRow.vue";

/** A settle-up round in the list: one row on the day that it started. */
export interface TimelineRound {
  id: string;
  time: Date;
  title: string;
  subtitle: string;
  done: boolean;
  to: RouteLocationRaw;
}

/**
 * The expenses and the settle-up rounds of a group, by day, newest first. An expense that a round covers does not show
 * here: the row of its round opens it (SPZ-105).
 */
const { rounds = [], transactions } = defineProps<{
  transactions: TransactionDto[];
  rounds?: TimelineRound[];
}>();

type Entry =
  | { kind: "expense"; time: number; item: TransactionDto }
  | { kind: "round"; time: number; item: TimelineRound };

interface Day {
  key: string;
  label: string;
  entries: Entry[];
}

const days = computed<Day[]>(() => {
  const entries: Entry[] = [
    ...transactions
      .filter((transaction) => !transaction.invoiceId)
      .map((item) => ({ item, kind: "expense" as const, time: new Date(item.transactionTime).getTime() })),
    ...rounds.map((item) => ({ item, kind: "round" as const, time: new Date(item.time).getTime() })),
  ].sort((a, b) => b.time - a.time);

  const byDay = new Map<string, Day>();
  for (const entry of entries) {
    const date = new Date(entry.time);
    const key = `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const day = byDay.get(key);
    if (day) day.entries.push(entry);
    else
      byDay.set(key, {
        entries: [entry],
        key,
        label: date.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      });
  }
  return [...byDay.values()];
});
</script>

<template>
  <div class="flex flex-col gap-3">
    <div v-for="day in days" :key="day.key" class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-base-text-primary">{{ day.label }}</p>
      <template
        v-for="entry in day.entries"
        :key="entry.kind + (entry.kind === 'round' ? entry.item.id : entry.item.transactionId)"
      >
        <RoundRow
          v-if="entry.kind === 'round'"
          :title="entry.item.title"
          :subtitle="entry.item.subtitle"
          :done="entry.item.done"
          :to="entry.item.to"
        />
        <TransactionItem v-else :transaction="entry.item" />
      </template>
    </div>
  </div>
</template>
