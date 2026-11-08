<!--
  @fallthroughAttributes true
  The type check accepts the native attributes of the root element, such as `id` or `tabindex`, on this component.
-->
<script setup lang="ts">
import { NOTICE_ICONS } from "./notice-icons";

/**
 * A message in the page content. The rules are in `notice.usage.ts`.
 * The default slot holds the message. The `icon` slot replaces the default icon of the tone. The icon is decorative.
 * The `action` slot holds the buttons, below the message and on the right. The button sets its own variant and size.
 */
export interface NoticeProps {
  /** The color of the notice. */
  tone?: "info" | "success" | "warning" | "error";
  /** A short bold line above the message. */
  title?: string;
  /**
   * Makes a screen reader read the notice when it appears (`role="alert"`). Set it when the notice appears after the
   * first render of the page, for example after a submit. Do not set it on a notice that is part of the first render.
   */
  announce?: boolean;
}

const { tone = "info", title, announce = false } = defineProps<NoticeProps>();

// Full class strings keep Tailwind's scanner happy; tokens flip automatically in dark mode.
const toneClasses: Record<NonNullable<NoticeProps["tone"]>, { body: string; container: string; icon: string }> = {
  error: {
    body: "text-util-color-error-900",
    container: "bg-util-color-error-50",
    icon: "text-util-color-error-600",
  },
  info: {
    body: "text-util-color-brand-900",
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
  <div :class="['flex gap-3 rounded-2xl p-4', toneClasses[tone].container]" :role="announce ? 'alert' : undefined">
    <!-- h-5 is the line height of text-sm, so the icon stays in the center of the first line of text. -->
    <span
      aria-hidden="true"
      :class="['flex h-5 shrink-0 items-center justify-center [&>svg]:size-4.5', toneClasses[tone].icon]"
    >
      <slot name="icon">
        <component :is="NOTICE_ICONS[tone]" />
      </slot>
    </span>
    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <div :class="['flex flex-col gap-1 text-sm', toneClasses[tone].body]">
        <p v-if="title" class="font-semibold">{{ title }}</p>
        <slot />
      </div>
      <div v-if="$slots.action" class="flex justify-end gap-2">
        <slot name="action" />
      </div>
    </div>
  </div>
</template>
