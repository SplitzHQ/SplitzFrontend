<script setup lang="ts">
import type { SegmentSize } from "./segment";

/** One radio of SSegmentControl. Only SSegmentControl uses this component. */
export interface SegmentProps {
  /** The size of the segment. */
  size: SegmentSize;
  /** True for the selected segment. Only the selected segment is in the tab order. */
  active: boolean;
}
type SegmentEvents = (e: "click") => void;

const { size, active } = defineProps<SegmentProps>();
const emit = defineEmits<SegmentEvents>();
</script>

<template>
  <!-- An invisible box after the button makes the tap area at least 44px high and 44px wide. -->
  <button
    type="button"
    role="radio"
    :aria-checked="active"
    :tabindex="active ? 0 : -1"
    class="relative rounded-full select-none after:absolute after:top-1/2 after:left-1/2 after:h-11 after:w-full after:min-w-11 after:-translate-x-1/2 after:-translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand-solid"
    @click="emit('click')"
  >
    <span
      :class="[
        size,
        active ? 'secondary' : 'ghost',
        'flex cursor-pointer items-center gap-1.5 rounded-full text-sm font-semibold whitespace-nowrap',
      ]"
    >
      <slot />
    </span>
  </button>
</template>

<style lang="scss" scoped>
@reference '../../assets/base.css';

.secondary {
  @apply text-base-text-brand;
}

.ghost {
  @apply text-base-text-secondary;

  @media (hover: hover) {
    &:hover {
      @apply bg-core-alpha-brand-10 text-base-text-brand_hover;
    }
  }

  &:active {
    @apply text-base-text-brand_pressed;
  }
}

.sm {
  @apply px-3 py-1.5;
}

.md {
  @apply px-3.5 py-2;
}
</style>
