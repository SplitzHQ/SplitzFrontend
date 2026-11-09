<script setup lang="ts">
import { watch } from "vue";
import { RouterView, useRouter } from "vue-router";
import "vue-sonner/style.css";

import BrandOpening from "@/components/BrandWordmark/BrandOpening.vue";
import ReloadPrompt from "@/components/ReloadPrompt/ReloadPrompt.vue";
import Sonner from "@/components/Sonner/Sonner.vue";
import { DebugPanel } from "@/libs/devtools";
import { usePageTransition } from "@/libs/page-transition";
import { useStatusBarColor } from "@/libs/status-bar-color";
import { useNotificationStore } from "@/stores/notification";
import { useUserStore } from "@/stores/user";

/** Keeps the toasts out of the safe area. The numbers are the default offsets of vue-sonner. */
const toastOffset = {
  bottom: "calc(24px + var(--safe-area-bottom))",
  left: "calc(24px + var(--safe-area-left))",
  right: "calc(24px + var(--safe-area-right))",
  top: "calc(24px + var(--safe-area-top))",
};
/**
 * At phone width, vue-sonner adds `env(safe-area-inset-top)` to the top offset and `env(safe-area-inset-bottom)` to the
 * bottom offset. The subtraction stops a second count on a real phone, and the `--safe-area-*` values still work when a
 * tool sets other values.
 */
const toastMobileOffset = {
  bottom: "calc(16px + var(--safe-area-bottom) - env(safe-area-inset-bottom, 0px))",
  left: "calc(16px + var(--safe-area-left))",
  right: "calc(16px + var(--safe-area-right))",
  top: "calc(16px + var(--safe-area-top) - env(safe-area-inset-top, 0px))",
};

useStatusBarColor();

const { direction: pageDirection, hooks: pageHooks } = usePageTransition(useRouter());

const userStore = useUserStore();
const notificationStore = useNotificationStore();

// Notifications follow the session: poll while signed in, forget everything on sign-out.
watch(
  () => userStore.isAuthenticated,
  (signedIn) => {
    if (signedIn) notificationStore.startPolling();
    else notificationStore.reset();
  },
  { immediate: true }
);
</script>

<template>
  <!--
    The page change of the app. See `src/libs/page-transition.ts`. The box gives Transition one element, also for a page
    with more than one root. A change of the query only keeps the page, because the key is the path.
  -->
  <RouterView v-slot="{ Component, route }">
    <Transition :name="`page-${pageDirection}`" v-bind="pageHooks">
      <div :key="route.path" class="page">
        <component :is="Component" />
      </div>
    </Transition>
  </RouterView>
  <!-- The opening plays over the first page of each cold start, whatever that page is. See `brand-wordmark.usage.ts`. -->
  <BrandOpening />
  <Sonner position="top-center" :offset="toastOffset" :mobile-offset="toastMobileOffset" />
  <ReloadPrompt />
  <component :is="DebugPanel" v-if="DebugPanel" />
</template>

<style scoped>
/* The new page moves the full width and the page under it moves 30%, with the time and the curve of a sheet. */
.page-forward-enter-active,
.page-forward-leave-active,
.page-back-enter-active,
.page-back-leave-active {
  transition: transform var(--motion-duration-sheet) var(--motion-easing-sheet);
}

/* The page that moves the full width is on top, with a soft shadow on its left edge. */
.page-forward-enter-active,
.page-back-leave-active {
  z-index: 2;
  box-shadow: -8px 0 24px color-mix(in oklab, var(--base-bg-scrim) 30%, transparent);
}

.page-forward-enter-from,
.page-back-leave-to {
  transform: translateX(100%);
}

.page-forward-leave-to,
.page-back-enter-from {
  transform: translateX(-30%);
}
</style>
