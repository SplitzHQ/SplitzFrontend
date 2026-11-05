<script setup lang="ts">
import { PhMagnifyingGlass } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";

import SButton from "@/components/SButton/SButton.vue";

/**
 * The content of the home page when the search finds no group.
 * It is different from HomeEmptyState, which is for a user who has no groups.
 */
export interface HomeNoResultsProps {
  /** The text that the user searched for. */
  keyword: string;
}

defineProps<HomeNoResultsProps>();

const emit = defineEmits<{
  clear: [];
}>();

const { $t } = useFluent();
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-8 text-center">
    <div class="flex w-full flex-col items-center gap-1">
      <span class="mb-2 flex size-12 items-center justify-center rounded-2xl bg-core-alpha-brand-10">
        <PhMagnifyingGlass weight="duotone" class="size-6 text-util-color-brand-700" aria-hidden="true" />
      </span>
      <!-- The keyword can be one long word, so it must break to stay in the page width. -->
      <h2 class="w-full text-base font-semibold wrap-anywhere text-base-text-primary">
        {{ $t("home-no-results-title", { keyword }) }}
      </h2>
      <p class="text-sm text-base-text-tertiary">{{ $t("home-no-results-description") }}</p>
    </div>

    <SButton variant="secondary" size="md" data-testid="home-no-results-clear" @click="emit('clear')">
      {{ $t("home-button-clear-search") }}
    </SButton>
  </div>
</template>
