<script setup lang="ts">
/** A framed live example: a title bar, then the rendered content. */
export interface DocExampleProps {
  title: string;
}

const { title } = defineProps<DocExampleProps>();
</script>

<template>
  <div class="flex flex-col overflow-hidden rounded-2xl border border-base-border-secondary">
    <div class="bg-base-bg-secondary px-4 py-2 font-mono text-xs text-base-text-tertiary">{{ title }}</div>
    <div class="flex flex-wrap items-center gap-3 bg-base-bg-primary_alt p-6">
      <slot />
    </div>
  </div>
</template>
