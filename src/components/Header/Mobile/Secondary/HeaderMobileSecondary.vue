<script setup lang="ts">
import { PhArrowLeft, PhX } from "@phosphor-icons/vue";
import type { RouteLocationRaw } from "vue-router";

import SIconButton from "@/components/SButton/SIconButton.vue";
import { useRouterHistoryStore } from "@/stores/routing-history";

/**
 * The header of a secondary page. See `header.usage.ts`.
 * The default slot is the h1 of the page, so it must hold only phrasing content, for example text or a `span`.
 * The `right` slot holds the actions of the page, after the close button.
 */
export interface HeaderMobileSecondaryProps {
  /** Shows a button that opens the earlier page. */
  enableBackButton?: boolean;
  /** Shows a button that leaves the flow and opens the page where the flow started. */
  enableCloseButton?: boolean;
  /** The page that the two buttons open when the history has no page to return to. The default is the home page. */
  fallback?: RouteLocationRaw;
}

const routerHistoryStore = useRouterHistoryStore();

const { enableBackButton, enableCloseButton, fallback } = defineProps<HeaderMobileSecondaryProps>();

const goBack = () => {
  routerHistoryStore.goBack(fallback);
};

const close = () => {
  routerHistoryStore.restoreSnapshot(fallback);
};
</script>

<template>
  <!-- The custom property gives each ghost icon button in the header, also in the `right` slot, the brand color. -->
  <header
    class="sticky top-0 z-sticky flex items-center gap-2.5 bg-base-bg-primary px-4 pt-safe-4 pb-4 [--s-button-ghost-icon:var(--base-fg-brand)]"
  >
    <SIconButton v-if="enableBackButton" variant="ghost" size="md" :aria-label="$t('header-back')" @click="goBack">
      <PhArrowLeft />
    </SIconButton>
    <!-- This box keeps its width while a page loads its title. `empty:hidden` removes the empty heading for that time. -->
    <div class="min-w-0 grow">
      <h1 class="text-base font-medium wrap-break-word text-base-text-primary empty:hidden"><slot /></h1>
    </div>
    <SIconButton v-if="enableCloseButton" variant="ghost" size="md" :aria-label="$t('header-close')" @click="close">
      <PhX />
    </SIconButton>
    <slot name="right" />
  </header>
</template>
