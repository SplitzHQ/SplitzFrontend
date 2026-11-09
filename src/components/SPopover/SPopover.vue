<script setup lang="ts">
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger, type PopoverContentProps } from "reka-ui";
import { twMerge } from "tailwind-merge";
import { watch } from "vue";

// Attributes and classes belong to the floating panel, not the trigger.
defineOptions({ inheritAttrs: false });

/**
 * A panel anchored to its trigger. It moves focus into the panel, and it stays inside the screen.
 * Use it on a desktop width only. See `popover.usage.ts`, which also says when to use a sheet.
 *
 * To limit the height, set `--s-popover-max-height` in `class`. The panel never grows past the free space on the screen.
 */
export interface PopoverProps {
  /** The name of the panel for a screen reader. */
  label: string;
  /** Classes for the panel. They replace a class of the same kind, for example `w-104` replaces the default width. */
  class?: string;
  /** False renders the trigger only, with no popover behavior. The caller then handles the click of the trigger. */
  enabled?: boolean;
  /** The side of the trigger that the panel opens on. */
  side?: PopoverContentProps["side"];
  /** The edge of the trigger that the panel lines up with. */
  align?: PopoverContentProps["align"];
  /** The gap between the trigger and the panel, in pixels. */
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
  max-height: min(
    var(--s-popover-max-height, var(--reka-popover-content-available-height)),
    var(--reka-popover-content-available-height)
  );
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
  animation: popover-in var(--motion-duration-container) var(--motion-easing-enter);
}
.s-popover[data-state="closed"] {
  animation: popover-out var(--motion-duration-exit) var(--motion-easing-exit);
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
</style>
