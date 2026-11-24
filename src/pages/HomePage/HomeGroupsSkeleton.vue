<script setup lang="ts">
/**
 * Loading skeleton matching the header bar and group rows on `HomePage` so initial data arrival causes no layout shift.
 * Hidden from assistive technology (`aria-hidden="true"`) because the page's `role="status"` live region announces
 * loading state.
 */

/** Varied line-width classes so placeholder rows resemble real group names and balance summaries. */
const SKELETON_ROW_WIDTHS = [
  { detailWidthClass: "w-2/5", nameWidthClass: "w-1/2" },
  { detailWidthClass: "w-1/3", nameWidthClass: "w-2/5" },
  { detailWidthClass: "w-1/2", nameWidthClass: "w-3/5" },
  { detailWidthClass: "w-2/5", nameWidthClass: "w-1/3" },
  { detailWidthClass: "w-1/3", nameWidthClass: "w-1/2" },
];
</script>

<template>
  <div aria-hidden="true" class="flex flex-col gap-1 pt-3 pb-4" data-testid="home-groups-skeleton">
    <div class="flex h-5 items-center justify-between px-1">
      <div class="h-3.5 w-20 skeleton" />
      <div class="h-3.5 w-28 skeleton" />
    </div>

    <div class="flex flex-col">
      <div v-for="(row, index) in SKELETON_ROW_WIDTHS" :key="index" class="flex items-center gap-3 py-3">
        <div class="size-12 shrink-0 skeleton rounded-xl" />
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <div class="flex h-6 items-center">
            <div :class="['h-4 skeleton', row.nameWidthClass]" />
          </div>
          <div class="flex h-5 items-center">
            <div :class="['h-3.5 skeleton', row.detailWidthClass]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
