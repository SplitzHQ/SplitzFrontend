<script setup lang="ts">
import type { Component } from "vue";

/**
 * The content of a list, a sheet or a page that has nothing to show. The rules are in `empty-state.usage.ts`.
 * The icon sits in a tinted tile above the title and the description. The `action` slot holds the buttons, below the
 * text and in the center. Each button sets its own variant and size.
 */
export interface EmptyStateProps {
  /** A Phosphor icon. The component draws it with the duotone weight, in the size and the color of the tone. */
  icon: Component;
  title: string;
  /** A second line under the title. */
  description?: string;
  /** `error` paints the tile and the icon in the danger color, for a failed load. */
  tone?: "neutral" | "error";
  /** The element of the title. Use `h3` in a sheet or a section that has an `h2` title. */
  titleTag?: "h2" | "h3";
}

const { icon, title, description, tone = "neutral", titleTag = "h2" } = defineProps<EmptyStateProps>();

// Full class strings keep Tailwind's scanner happy; tokens flip automatically in dark mode.
const toneClasses: Record<NonNullable<EmptyStateProps["tone"]>, { icon: string; tile: string }> = {
  error: { icon: "text-base-text-danger", tile: "bg-base-bg-danger-subtle" },
  neutral: { icon: "text-base-text-brand", tile: "bg-comp-empty-state-icon-bg" },
};
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-8 text-center">
    <div class="flex w-full flex-col items-center gap-3">
      <span
        aria-hidden="true"
        :class="['flex size-12 items-center justify-center rounded-2xl', toneClasses[tone].tile]"
      >
        <component :is="icon" weight="duotone" :class="['size-6', toneClasses[tone].icon]" />
      </span>
      <div class="flex w-full flex-col items-center gap-1">
        <!-- A keyword in the title can be one long word, so it must break to stay in the width. -->
        <component :is="titleTag" class="w-full text-base font-semibold wrap-anywhere text-base-text-primary">
          {{ title }}
        </component>
        <p v-if="description" class="text-sm text-base-text-secondary">{{ description }}</p>
      </div>
    </div>
    <div v-if="$slots.action" class="flex flex-wrap justify-center gap-3">
      <slot name="action" />
    </div>
  </div>
</template>
