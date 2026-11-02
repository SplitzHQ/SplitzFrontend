<script setup lang="ts">
import { PhMoon, PhSun } from "@phosphor-icons/vue";
import { computed, ref, watch } from "vue";

import SIconButton from "@/components/SButton/SIconButton.vue";
import Sonner from "@/components/Sonner/Sonner.vue";
import SSegmentControl from "@/components/SSegmentControl/SSegmentControl.vue";

import { docsDark } from "./docs-theme";
import ColorsPage from "./pages/ColorsPage.vue";
import ComponentsPage from "./pages/ComponentsPage.vue";
import FoundationsPage from "./pages/FoundationsPage.vue";
import MotionPage from "./pages/MotionPage.vue";
import OverviewPage from "./pages/OverviewPage.vue";

/** The tabs of the page. The hash in the URL holds the open tab, so a reload keeps it. */
const PAGES = [
  { component: OverviewPage, hash: "overview", label: "Overview" },
  { component: ColorsPage, hash: "colors", label: "Colors" },
  { component: FoundationsPage, hash: "foundations", label: "Foundations" },
  { component: MotionPage, hash: "motion", label: "Motion" },
  { component: ComponentsPage, hash: "components", label: "Components" },
] as const;

const pageIndex = ref(
  Math.max(
    0,
    PAGES.findIndex((page) => `#${page.hash}` === location.hash)
  )
);
const page = computed(() => PAGES[pageIndex.value]!);
watch(page, (value) => history.replaceState(null, "", `#${value.hash}`), { immediate: true });
</script>

<template>
  <div class="min-h-dvh bg-base-bg-primary text-base-text-primary">
    <header
      class="sticky top-0 z-sticky flex flex-wrap items-center justify-between gap-4 border-b border-base-border-secondary bg-base-bg-primary px-4 py-3 sm:px-8"
    >
      <h1 class="flex items-baseline gap-2 text-display-xs font-bold">
        SplitZ
        <span class="text-sm font-semibold text-base-text-tertiary">Design system</span>
      </h1>
      <nav
        aria-label="Design system sections"
        class="order-last w-full scrollbar-hide overflow-x-auto sm:order-none sm:w-auto"
      >
        <SSegmentControl v-model="pageIndex" size="sm" :items="PAGES.map((p) => p.label)">
          <template #default="{ item }">{{ item }}</template>
        </SSegmentControl>
      </nav>
      <SIconButton
        color="neutral"
        variant="ghost"
        size="md"
        :aria-label="docsDark ? 'Switch to light theme' : 'Switch to dark theme'"
        @click="docsDark = !docsDark"
      >
        <Transition name="ds-swap" mode="out-in">
          <PhMoon v-if="docsDark" />
          <PhSun v-else />
        </Transition>
      </SIconButton>
    </header>
    <main class="mx-auto flex max-w-5xl flex-col px-4 py-8 sm:px-8">
      <Transition name="ds-page" mode="out-in">
        <component :is="page.component" :key="page.hash" />
      </Transition>
    </main>
    <Sonner position="top-center" close-button />
  </div>
</template>

<style scoped>
.ds-page-enter-active {
  transition:
    opacity var(--motion-duration-state) var(--motion-easing-enter),
    transform var(--motion-duration-state) var(--motion-easing-enter);
}
.ds-page-leave-active {
  transition: opacity var(--motion-duration-exit) var(--motion-easing-exit);
}
.ds-page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.ds-page-leave-to {
  opacity: 0;
}

.ds-swap-enter-active,
.ds-swap-leave-active {
  transition:
    opacity var(--motion-duration-feedback) var(--motion-easing-standard),
    transform var(--motion-duration-feedback) var(--motion-easing-standard);
}
.ds-swap-enter-from,
.ds-swap-leave-to {
  opacity: 0;
  transform: rotate(-45deg) scale(0.8);
}
</style>
