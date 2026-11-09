<script setup lang="ts">
import { PhArrowLeft, PhX } from "@phosphor-icons/vue";
import { useEventListener } from "@vueuse/core";
import { computed, onMounted, shallowRef, useTemplateRef } from "vue";
import type { RouteLocationRaw } from "vue-router";

import SIconButton from "@/components/SButton/SIconButton.vue";
import { frostedBarStyle } from "@/libs/frosted-bar";
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
  routerHistoryStore.goBack({ fallback });
};

const close = () => {
  routerHistoryStore.restoreSnapshot({ fallback });
};

const header = useTemplateRef<HTMLElement>("header");
/** True while page content is under the header. The bottom line of the frosted bar then shows. */
const scrolled = shallowRef(false);

/**
 * Reads the scroll position of the page. Usually the window scrolls. A box that holds the header can scroll in its
 * place: the page during a page change (see `src/libs/page-transition.ts`), or the phone of a prototype. A scroll in
 * another box, for example a list in a sheet, does not change the value.
 */
function readScroll(event?: Event): void {
  const target = event?.target;
  const holdsHeader = target instanceof Element && header.value !== null && target.contains(header.value);
  scrolled.value = (holdsHeader ? target.scrollTop : window.scrollY) > 0;
}

// A scroll event does not bubble, so the capture phase on the window gets the scroll of each box.
useEventListener(window, "scroll", readScroll, { capture: true, passive: true });
onMounted(() => readScroll());

/** The page color behind a secondary page. */
const barStyle = computed(() => frostedBarStyle({ color: "var(--base-bg-primary)", edge: scrolled.value }));
</script>

<template>
  <!-- The custom property gives each ghost icon button in the header, also in the `right` slot, the brand color. -->
  <header
    ref="header"
    class="sticky top-0 z-sticky flex items-center gap-2.5 px-4 pt-safe-4 pb-4 [--s-button-ghost-icon:var(--base-fg-brand)]"
  >
    <!-- The frosted bar. The sticky header with its z-index keeps this layer behind its content. -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10 border-b transition-[border-color] duration-state ease-standard"
      :style="barStyle"
      data-test="header-frosted-bar"
    />
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
