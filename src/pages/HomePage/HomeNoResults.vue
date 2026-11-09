<script setup lang="ts">
import { PhMagnifyingGlass, PhSlidersHorizontal } from "@phosphor-icons/vue";

import SButton from "@/components/SButton/SButton.vue";

/**
 * The content of the home page when the search or the filter finds no group.
 * It is different from HomeEmptyState, which is for a user who has no groups. SPZ-104 reviews all empty states and can
 * replace this component.
 */
export interface HomeNoResultsProps {
  /** `search` when the search finds no group, `filter` when the filter alone hides every group. */
  kind: "search" | "filter";
  title: string;
  /** A second line under the title. */
  description?: string;
  /** The text of the button that removes the search or the filter. */
  clearLabel: string;
}

const { kind } = defineProps<HomeNoResultsProps>();

const emit = defineEmits<{
  clear: [];
}>();
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-8 text-center">
    <div class="flex w-full flex-col items-center gap-1">
      <span class="mb-2 flex size-12 items-center justify-center rounded-2xl bg-core-alpha-brand-10">
        <component
          :is="kind === 'search' ? PhMagnifyingGlass : PhSlidersHorizontal"
          weight="duotone"
          class="size-6 text-util-color-brand-700"
          aria-hidden="true"
        />
      </span>
      <!-- A keyword can be one long word, so it must break to stay in the page width. -->
      <h2 class="w-full text-base font-semibold wrap-anywhere text-base-text-primary">{{ title }}</h2>
      <p v-if="description" class="text-sm text-base-text-tertiary">{{ description }}</p>
    </div>

    <SButton variant="secondary" size="md" data-testid="home-no-results-clear" @click="emit('clear')">
      {{ clearLabel }}
    </SButton>
  </div>
</template>
