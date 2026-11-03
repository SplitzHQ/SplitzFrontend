<script setup lang="ts">
import { TooltipContent, TooltipPortal, TooltipRoot, TooltipTrigger } from "reka-ui";

/** Hover text for one debug control. The slot is the trigger; it must take focus so that keyboard users see the tip. */
defineProps<{
  /** The text, already formatted. */
  text: string;
  side?: "top" | "right" | "bottom" | "left";
}>();
</script>

<template>
  <TooltipRoot :delay-duration="400">
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipPortal>
      <TooltipContent
        :side="side ?? 'top'"
        :side-offset="6"
        class="debug-tip z-[1002] max-w-64 rounded-lg bg-base-bg-primary-reverse px-2.5 py-1.5 text-xs text-base-text-primary-reverse shadow-lg"
      >
        {{ text }}
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>

<style scoped>
/* Tooltips enter at once and leave with a short fade (high-frequency UI). */
.debug-tip[data-state="closed"] {
  animation: debug-tip-out var(--motion-duration-exit) var(--motion-easing-exit);
}

@keyframes debug-tip-out {
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .debug-tip[data-state="closed"] {
    animation: none;
  }
}
</style>
