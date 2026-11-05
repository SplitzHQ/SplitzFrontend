<script setup lang="ts">
/**
 * The frame of a signed-in page. See `layout.usage.ts`.
 * The `header` slot stays outside the `main` landmark, and the default slot is the content of `main`.
 *
 * The default slot gets the side margin, the bottom margin and the growth as a slot prop. A caller must bind that prop on
 * the root of its content: `<template #default="layoutAttrs"><div v-bind="layoutAttrs">`.
 */
</script>

<template>
  <div class="layout flex flex-col pr-safe-0 pb-safe-0 pl-safe-0">
    <slot name="header" />
    <!-- `min-h-0` lets a page with a fixed height scroll its own content. SelectSplitMethodPage is such a page. -->
    <main class="flex min-h-0 grow flex-col">
      <slot class="mx-4 mb-4 grow" />
    </main>
  </div>
</template>
