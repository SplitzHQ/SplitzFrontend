<script setup lang="ts">
import { LIST_ROW_TEXT } from "./list-row";

/**
 * The parts of a list row: the icon or the avatar at the start, the name, the lines under the name and the end of the
 * row. The root is a fragment, so the parent must be the row: a link or a button with `LIST_ROW_CLASS`.
 * See `list-row.usage.ts`.
 */
export interface ListRowContentProps {
  /** The name of the row. It stays on one line and ends with an ellipsis. */
  title: string;
  /** One line under the name. Use the `subtitle` slot for other content. */
  subtitle?: string;
}

const { title, subtitle } = defineProps<ListRowContentProps>();

defineSlots<{
  /** The tile or the avatar at the start of the row. `list-row.usage.ts` gives its size. */
  leading?: () => unknown;
  /** The lines under the name, for example a direction and an `AmountChip`. It replaces the `subtitle` prop. */
  subtitle?: () => unknown;
  /** The end of the row, for example a direction above an amount, or a check mark. */
  trailing?: () => unknown;
}>();
</script>

<template>
  <slot name="leading" />
  <div class="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
    <p :class="['truncate', LIST_ROW_TEXT.title]">{{ title }}</p>
    <slot name="subtitle">
      <p v-if="subtitle" :class="['truncate', LIST_ROW_TEXT.subtitle]">{{ subtitle }}</p>
    </slot>
  </div>
  <slot name="trailing" />
</template>
