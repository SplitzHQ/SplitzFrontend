<script setup lang="ts">
/**
 * An icon in three rings at the top of a result screen. The rules are in `status-badge.usage.ts`.
 * The default slot holds one icon. The icon is decorative, so the text of the screen must give the result.
 * The rings are inside the box, so the box is the full size of the badge and pushes the content under it down.
 */
export interface StatusBadgeProps {
  /** The color of the icon, the core and the rings. */
  tone: "success" | "warning" | "error";
}

const { tone } = defineProps<StatusBadgeProps>();

// Full class strings keep Tailwind's scanner happy. The tokens change with the theme. The core draws its token at a low
// opacity, so it is a tint of the tone over the page: in the dark theme a solid core was a heavy block.
const TONE_CLASSES: Record<StatusBadgeProps["tone"], { core: string; ring: string }> = {
  error: {
    core: "bg-comp-status-badge-error-core/15 text-comp-status-badge-error-icon",
    ring: "border-comp-status-badge-error-ring",
  },
  success: {
    core: "bg-comp-status-badge-success-core/15 text-comp-status-badge-success-icon",
    ring: "border-comp-status-badge-success-ring",
  },
  warning: {
    core: "bg-comp-status-badge-warning-core/15 text-comp-status-badge-warning-icon",
    ring: "border-comp-status-badge-warning-ring",
  },
};

/**
 * The rings from the inner ring to the outer ring. The gaps are even. All rings use one token, and the opacity falls
 * evenly toward the outside, so the rings fade into the page. SPZ-76 tuned these values in its prototype.
 */
const RINGS = ["inset-8 opacity-50", "inset-4 opacity-31", "inset-0 opacity-12"];
</script>

<template>
  <div class="relative flex size-42 shrink-0 items-center justify-center">
    <!-- The rings fade toward the bottom, so the lower half does not compete with the title under the badge. -->
    <div class="absolute inset-0 mask-b-from-40%">
      <span
        v-for="ring in RINGS"
        :key="ring"
        aria-hidden="true"
        :class="['absolute rounded-full border', ring, TONE_CLASSES[tone].ring]"
      />
    </div>
    <div
      aria-hidden="true"
      :class="[
        'relative flex size-18 items-center justify-center rounded-full [&>svg]:size-8',
        TONE_CLASSES[tone].core,
      ]"
    >
      <slot />
    </div>
  </div>
</template>
