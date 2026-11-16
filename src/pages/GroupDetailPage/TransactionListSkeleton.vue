<script setup lang="ts">
/**
 * The placeholder of TransactionList while the list requests run. It has the same date line and row sizes as the list, so
 * the page does not move when the list appears. A screen reader skips it and reads the status region of the page.
 */

/** The widths of the two lines of text in each row. Different widths look more like real text. */
const ROWS = [
  { detail: "w-1/3", name: "w-1/2" },
  { detail: "w-2/5", name: "w-1/3" },
  { detail: "w-1/4", name: "w-2/5" },
  { detail: "w-1/3", name: "w-1/2" },
];
</script>

<template>
  <div aria-hidden="true" class="flex flex-col gap-1" data-test="transaction-list-skeleton">
    <div class="flex h-5 items-center">
      <div class="h-3.5 w-14 skeleton" />
    </div>
    <div v-for="(row, index) in ROWS" :key="index" class="flex items-center gap-3 py-2">
      <div class="size-12 shrink-0 skeleton rounded-xl" />
      <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex h-7 items-center">
          <div :class="['h-4 skeleton', row.name]" />
        </div>
        <div class="flex h-5 items-center">
          <div :class="['h-3.5 skeleton', row.detail]" />
        </div>
      </div>
    </div>
  </div>
</template>
