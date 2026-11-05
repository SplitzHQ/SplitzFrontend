<script setup lang="ts">
/**
 * The action of a page, fixed to the bottom of the screen, with a progressive blur behind it. See `layout.usage.ts`.
 * The slot holds the button. The area around the button does not take a tap, so a tap there goes to the content under it.
 */
import BlurBand from "@/components/BlurBand/BlurBand.vue";
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-0 z-10 px-safe-4 pb-safe-4" data-test="bottom-action">
    <BlurBand edge="bottom" />
    <div class="pointer-events-auto relative">
      <slot />
    </div>
  </div>
</template>
