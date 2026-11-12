<script setup lang="ts">
/**
 * The small icon at the top of a result page of AuthShell. The rules are in `auth-shell.usage.ts`.
 * The default slot holds one icon. The icon is decorative, so the title of the page must give the result.
 */
export interface AuthStatusIconProps {
  /** The color of the icon and its circle. */
  tone: "brand" | "success" | "warning" | "error";
}

const { tone } = defineProps<AuthStatusIconProps>();

// Full class strings keep Tailwind's scanner happy. The tokens change with the theme.
const TONE_CLASSES: Record<AuthStatusIconProps["tone"], string> = {
  brand: "bg-core-alpha-brand-10 text-util-color-brand-600",
  error: "bg-util-color-error-50 text-util-color-error-600",
  success: "bg-util-color-success-50 text-util-color-success-600",
  warning: "bg-util-color-warning-50 text-util-color-warning-600",
};
</script>

<template>
  <div
    aria-hidden="true"
    :class="['flex size-12 items-center justify-center rounded-full [&>svg]:size-6', TONE_CLASSES[tone]]"
  >
    <slot />
  </div>
</template>
