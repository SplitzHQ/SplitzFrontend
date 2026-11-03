<script setup lang="ts">
import { PhCaretDown } from "@phosphor-icons/vue";
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from "reka-ui";

import DebugPanelRow from "./DebugPanelRow.vue";
import type { DebugGroup, DebugRow } from "./registry";

/** One group of rows that folds. While a search is on, the group stays open and you cannot fold it. */
defineProps<{
  group: DebugGroup;
  /** The rows to show: all rows, or the rows that match the search. */
  rows: DebugRow[];
  open: boolean;
  searching: boolean;
}>();
const emit = defineEmits<{ toggle: [] }>();
</script>

<template>
  <CollapsibleRoot :open="open" :disabled="searching" as="section" class="flex flex-col" @update:open="emit('toggle')">
    <CollapsibleTrigger
      class="group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold tracking-wide text-base-text-tertiary uppercase hover:text-base-text-primary focus-visible:ring-2 focus-visible:ring-util-color-brand-600 focus-visible:outline-none disabled:cursor-default"
    >
      <PhCaretDown
        aria-hidden="true"
        class="size-3.5 transition-transform duration-(--motion-duration-state) group-data-[state=closed]:-rotate-90 motion-reduce:transition-none"
      />
      {{ $t(group.title) }}
    </CollapsibleTrigger>
    <CollapsibleContent class="debug-collapsible overflow-hidden">
      <div class="flex flex-col gap-0.5">
        <DebugPanelRow v-for="row in rows" :key="row.id" :row="row" />
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<style scoped>
/* reka-ui sets --reka-collapsible-content-height to the measured height of the content. */
.debug-collapsible[data-state="open"] {
  animation: debug-collapse-down var(--motion-duration-state) var(--motion-easing-enter);
}

.debug-collapsible[data-state="closed"] {
  animation: debug-collapse-up var(--motion-duration-exit) var(--motion-easing-exit);
}

@keyframes debug-collapse-down {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: var(--reka-collapsible-content-height);
  }
}

@keyframes debug-collapse-up {
  from {
    height: var(--reka-collapsible-content-height);
  }
  to {
    height: 0;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .debug-collapsible[data-state] {
    animation: none;
  }
}
</style>
