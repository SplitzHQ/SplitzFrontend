<script setup lang="ts">
import { computed, useId } from "vue";

import type { SegmentSize } from "./segment";
import SSegment from "./SSegment.vue";

/** A choice of one item from a short list that is always visible. See `segment-control.usage.ts` for when to use it. */
export interface SegmentControlProps {
  /** The size of each segment. */
  size: SegmentSize;
  /** The text of each segment. The default slot can draw the text with other markup. */
  items: string[];
  /** The name of the group for a screen reader. Say what the user chooses, for example "Split method". */
  label: string;
}
const { size, items, label } = defineProps<SegmentControlProps>();
/** The index of the selected item. */
const model = defineModel<number>({ required: true });

/** The change of the selected index for each arrow key, as in the WAI-ARIA radio group pattern. */
const ARROW_STEPS: Record<string, number> = { ArrowDown: 1, ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1 };

// The selected background slides only inside this control, so a page can show more than one control.
const layoutId = useId();

// Tab goes to the selected segment. If the index is outside the list, Tab goes to the first segment.
const tabbableIndex = computed(() => (items[model.value] === undefined ? 0 : model.value));

/** An arrow key selects the next or the previous segment and moves the focus to it. The list wraps at each end. */
function onKeydown(event: KeyboardEvent): void {
  const step = ARROW_STEPS[event.key];
  if (step === undefined || items.length === 0) return;
  event.preventDefault();
  const next = (tabbableIndex.value + step + items.length) % items.length;
  model.value = next;
  const root = event.currentTarget as HTMLElement;
  root.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
}
</script>

<template>
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <div
    role="radiogroup"
    :aria-label="label"
    class="flex gap-1 rounded-full border border-core-alpha-brand-5 bg-core-alpha-brand-5 p-1"
    @keydown="onKeydown"
  >
    <SSegment
      v-for="(item, index) in items"
      :key="index"
      :size="size"
      :active="model === index"
      :tabbable="tabbableIndex === index"
      :layout-id="layoutId"
      @click="model = index"
    >
      <slot :item="item">{{ item }}</slot>
    </SSegment>
  </div>
</template>
