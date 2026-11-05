<script setup lang="ts">
/**
 * An icon in rings at the top of a result screen. The rules are in `status-badge.usage.ts`.
 * The default slot holds one icon. The icon is decorative, so the text of the screen must give the result.
 * The rings draw 24px outside the 96px box and take no layout space.
 */
export interface StatusBadgeProps {
  /** The color of the icon and the rings. */
  tone: "brand" | "success" | "warning" | "error";
}

const { tone } = defineProps<StatusBadgeProps>();

// Full class strings keep Tailwind's scanner happy; tokens flip automatically in dark mode.
const toneClasses: Record<StatusBadgeProps["tone"], { core: string; icon: string; ring: string; halo: string }> = {
  brand: {
    core: "bg-core-alpha-brand-10",
    halo: "border-core-alpha-brand-5",
    icon: "text-util-color-brand-600",
    ring: "border-core-alpha-brand-20",
  },
  error: {
    core: "bg-util-color-error-50",
    halo: "border-util-color-error-50",
    icon: "text-util-color-error-600",
    ring: "border-util-color-error-100",
  },
  success: {
    core: "bg-util-color-success-50",
    halo: "border-util-color-success-50",
    icon: "text-util-color-success-600",
    ring: "border-util-color-success-200",
  },
  warning: {
    core: "bg-util-color-warning-50",
    halo: "border-util-color-warning-50",
    icon: "text-util-color-warning-600",
    ring: "border-util-color-warning-200",
  },
};
</script>

<template>
  <div class="relative flex size-24 items-center justify-center">
    <span aria-hidden="true" :class="['absolute -inset-6 rounded-full border', toneClasses[tone].halo]" />
    <span aria-hidden="true" :class="['absolute -inset-3 rounded-full border', toneClasses[tone].ring]" />
    <div
      aria-hidden="true"
      :class="[
        'relative flex size-full items-center justify-center rounded-full [&>svg]:size-10',
        toneClasses[tone].core,
        toneClasses[tone].icon,
      ]"
    >
      <slot />
    </div>
  </div>
</template>
