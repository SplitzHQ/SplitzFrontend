<script setup lang="ts">
/**
 * The placeholder of BalanceCard while the group request runs. It has the same surface and sizes as the card, so the page
 * does not move when the card appears. A screen reader skips it and reads the status region of the page.
 * The default fill of `skeleton` does not show on the tint of the card, so the bars use a stronger tint.
 */
</script>

<template>
  <div
    aria-hidden="true"
    class="flex flex-col gap-3 rounded-2xl bg-core-alpha-brand-5 px-4 py-3"
    data-test="balance-card-skeleton"
  >
    <div class="flex items-center gap-3">
      <div class="flex flex-1 flex-col">
        <div class="flex h-5 items-center">
          <div class="h-3.5 w-24 skeleton bg-core-alpha-brand-10!" />
        </div>
        <div class="flex h-lh items-center text-display-lg">
          <div class="h-10 w-36 skeleton bg-core-alpha-brand-10!" />
        </div>
      </div>
      <div class="h-10 w-24 skeleton rounded-full bg-core-alpha-brand-10!" />
    </div>
    <div class="flex h-5 items-center">
      <div class="h-3.5 w-40 skeleton bg-core-alpha-brand-10!" />
    </div>
  </div>
</template>
