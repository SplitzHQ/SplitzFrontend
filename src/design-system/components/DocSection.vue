<script setup lang="ts">
/** A titled section of the design-system page, with an optional layer tag and summary. */
export interface DocSectionProps {
  title: string;
  /** Short tag next to the title, for example the token layer. */
  tag?: string;
  summary?: string;
  /** Source file of the tokens or component, shown as code. */
  source?: string;
}

const { title, tag, summary, source } = defineProps<DocSectionProps>();
</script>

<template>
  <section class="flex flex-col gap-4 border-b border-base-border-tertiary pb-10 last:border-b-0">
    <header class="flex flex-col gap-1">
      <h2 class="flex flex-wrap items-baseline gap-3 text-lg font-bold">
        {{ title }}
        <small v-if="tag" class="font-mono text-xs font-semibold tracking-wider text-base-text-brand uppercase">
          {{ tag }}
        </small>
      </h2>
      <p v-if="summary || source" class="max-w-prose text-sm text-base-text-tertiary">
        {{ summary }}
        <code v-if="source" class="font-mono text-xs text-base-text-secondary">{{ source }}</code>
      </p>
    </header>
    <slot />
  </section>
</template>
