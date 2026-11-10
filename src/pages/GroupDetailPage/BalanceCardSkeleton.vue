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
    class="flex flex-col gap-4 rounded-2xl bg-base-bg-secondary p-4"
    data-test="balance-card-skeleton"
  >
    <div class="flex items-center gap-3">
      <div class="flex flex-1 flex-col">
        <div class="flex h-5 items-center">
          <div class="h-3.5 w-24 skeleton bg-base-bg-subtle!" />
        </div>
        <div class="flex h-lh items-center text-display-lg">
          <div class="h-10 w-36 skeleton bg-base-bg-subtle!" />
        </div>
      </div>
      <div class="h-10 w-24 skeleton rounded-full bg-base-bg-subtle!" />
    </div>
    <!-- One member line: the avatar, the direction and the amount. -->
    <div class="flex h-5 items-center gap-2">
      <div class="size-5 skeleton rounded-md bg-base-bg-subtle!" />
      <div class="h-3.5 w-28 skeleton bg-base-bg-subtle!" />
      <div class="ml-auto h-3.5 w-14 skeleton bg-base-bg-subtle!" />
    </div>
  </div>
</template>
