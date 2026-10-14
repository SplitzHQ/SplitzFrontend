<script setup lang="ts">
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger, type PopoverContentProps } from "reka-ui";
import { twMerge } from "tailwind-merge";
import { watch } from "vue";

// Attributes and classes belong to the floating panel, not the trigger.
defineOptions({ inheritAttrs: false });

/** Anchored panel for rich content, with focus management and viewport collision handling. */
export interface PopoverProps {
  label: string;
  class?: string;
  enabled?: boolean;
  side?: PopoverContentProps["side"];
  align?: PopoverContentProps["align"];
  sideOffset?: number;
}

const props = withDefaults(defineProps<PopoverProps>(), {
  align: "end",
  enabled: true,
  side: "bottom",
  sideOffset: 8,
});
const open = defineModel<boolean>({ default: false });

// A disabled popover leaves the trigger available for a link or mobile sheet.
watch(
  () => props.enabled,
  () => {
    open.value = false;
  }
);
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger v-if="props.enabled" as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <slot v-else name="trigger" />
    <PopoverPortal>
      <PopoverContent
        v-if="props.enabled"
        as-child
        :side="props.side"
        :align="props.align"
        :side-offset="props.sideOffset"
        :collision-padding="16"
        :class="
          twMerge(
            's-popover z-popover flex w-96 flex-col overflow-y-auto rounded-3xl bg-base-bg-primary p-4 text-base-text-primary shadow-2xl ring-1 ring-base-border-tertiary outline-none',
            props.class
          )
        "
      >
        <!-- Override Reka's trigger label so the panel has its own accessible name. -->
        <div v-bind="$attrs" :aria-label="props.label" aria-labelledby="">
          <slot />
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped>
.s-popover {
  max-width: var(--reka-popover-content-available-width);
  max-height: min(var(--s-popover-max-height), var(--reka-popover-content-available-height));
  transform-origin: var(--reka-popover-content-transform-origin);
  --popover-enter-x: 0px;
  --popover-enter-y: -4px;
}

.s-popover[data-side="top"] {
  --popover-enter-y: 4px;
}
.s-popover[data-side="left"] {
  --popover-enter-x: 4px;
  --popover-enter-y: 0px;
}
.s-popover[data-side="right"] {
  --popover-enter-x: -4px;
  --popover-enter-y: 0px;
}

.s-popover[data-state="open"] {
  animation: popover-in 0.16s cubic-bezier(0.22, 1, 0.36, 1);
}
.s-popover[data-state="closed"] {
  animation: popover-out 0.1s ease-out;
}

@keyframes popover-in {
  from {
    opacity: 0;
    transform: translate(var(--popover-enter-x), var(--popover-enter-y)) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}

@keyframes popover-out {
  from {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(var(--popover-enter-x), var(--popover-enter-y)) scale(0.98);
  }
}

@media (prefers-reduced-motion: reduce) {
  .s-popover[data-state] {
    animation: none;
  }
}
</style>
