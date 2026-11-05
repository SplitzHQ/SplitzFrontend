<script setup lang="ts">
import { motion } from "motion-v";

import { easingPoints, motionSeconds } from "@/libs/motion";

import type { SegmentSize } from "./segment";

/** One radio of SSegmentControl. Only SSegmentControl uses this component. */
export interface SegmentProps {
  /** The size of the segment. */
  size: SegmentSize;
  /** True for the selected segment. */
  active: boolean;
  /** True for the one segment of the control that is in the tab order. */
  tabbable: boolean;
  /** The shared name of the selected background. Each control needs its own, or motion shows only one background. */
  layoutId: string;
}
type SegmentEvents = (e: "click") => void;

const { size, active, tabbable, layoutId } = defineProps<SegmentProps>();
const emit = defineEmits<SegmentEvents>();
</script>

<template>
  <!-- An invisible box after the button makes the tap area at least 44px high and 44px wide. -->
  <button
    type="button"
    role="radio"
    :aria-checked="active"
    :tabindex="tabbable ? 0 : -1"
    class="relative rounded-full after:absolute after:top-1/2 after:left-1/2 after:h-11 after:w-full after:min-w-11 after:-translate-x-1/2 after:-translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand-solid"
    @click="emit('click')"
  >
    <motion.span
      v-if="active"
      class="absolute inset-0 rounded-full bg-core-alpha-brand-20"
      :layout-id="layoutId"
      :transition="{ duration: motionSeconds('state'), ease: easingPoints('standard') }"
    />
    <span
      :class="[
        size,
        active ? 'secondary' : 'ghost',
        'relative z-10 flex cursor-pointer items-center gap-1.5 rounded-full text-sm font-semibold whitespace-nowrap',
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
  @apply px-4 py-2.5;
}
</style>
