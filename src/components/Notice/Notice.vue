<script setup lang="ts">
export interface NoticeProps {
  tone?: "info" | "success" | "warning" | "error";
  title?: string;
}

const { tone = "info", title } = defineProps<NoticeProps>();

// Full class strings keep Tailwind's scanner happy; tokens flip automatically in dark mode.
const toneClasses: Record<NonNullable<NoticeProps["tone"]>, { body: string; container: string; icon: string }> = {
  error: {
    body: "text-util-color-error-900",
    container: "bg-util-color-error-50",
    icon: "text-util-color-error-600",
  },
  info: {
    body: "text-base-text-secondary",
    container: "bg-core-alpha-brand-10",
    icon: "text-util-color-brand-600",
  },
  success: {
    body: "text-util-color-success-900",
    container: "bg-util-color-success-50",
    icon: "text-util-color-success-600",
  },
  warning: {
    body: "text-util-color-warning-900",
    container: "bg-util-color-warning-50",
    icon: "text-util-color-warning-600",
  },
};
</script>

<template>
  <div :class="['flex gap-3 rounded-2xl p-4', toneClasses[tone].container]">
    <span
      v-if="$slots.icon"
      :class="['mt-0.5 flex size-5 shrink-0 items-center justify-center [&>svg]:size-5', toneClasses[tone].icon]"
    >
      <slot name="icon" />
    </span>
    <div :class="['flex min-w-0 flex-1 flex-col gap-1 text-sm', toneClasses[tone].body]">
      <p v-if="title" class="font-semibold">{{ title }}</p>
      <slot />
    </div>
  </div>
</template>
