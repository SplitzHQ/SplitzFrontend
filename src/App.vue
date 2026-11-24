<script setup lang="ts">
import { watch } from "vue";
import { RouterView, useRouter } from "vue-router";
import "vue-sonner/style.css";

import ReloadPrompt from "@/components/ReloadPrompt/ReloadPrompt.vue";
import Sonner from "@/components/Sonner/Sonner.vue";
import { DebugPanel } from "@/libs/devtools";
import { usePageTransition } from "@/libs/page-transition";
import { useStatusBarColor } from "@/libs/status-bar-color";
import { useNotificationStore } from "@/stores/notification";
import { useUserStore } from "@/stores/user";

/** Keeps the toasts out of the safe area. The numbers are the default offsets of vue-sonner. */
const toastOffset = {
  left: "calc(24px + var(--safe-area-left))",
  right: "calc(24px + var(--safe-area-right))",
  top: "calc(24px + var(--safe-area-top))",
};
/**
 * At phone width, vue-sonner adds `env(safe-area-inset-top)` to the top offset. The subtraction stops a second count on
 * a real phone, and `--safe-area-top` still works when a tool sets another value.
 */
const toastMobileOffset = {
  left: "calc(16px + var(--safe-area-left))",
  right: "calc(16px + var(--safe-area-right))",
  top: "calc(16px + var(--safe-area-top) - env(safe-area-inset-top, 0px))",
};

useStatusBarColor();

const { direction: pageTransitionDirection, hooks: pageTransitionHooks } = usePageTransition(useRouter());

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
    Wrap each route in a single `.page` container so `<Transition>` works even when a page component has multiple root
    nodes (see `src/libs/page-transition.ts`). Keying on `route.path` avoids re-running page transitions when only
    query parameters change.
  -->
  <RouterView v-slot="{ Component, route }">
    <Transition :name="`page-${pageTransitionDirection}`" v-bind="pageTransitionHooks">
      <div :key="route.path" class="page">
        <component :is="Component" />
      </div>
    </Transition>
  </RouterView>
  <Sonner position="top-center" :offset="toastOffset" :mobile-offset="toastMobileOffset" />
  <ReloadPrompt />
  <component :is="DebugPanel" v-if="DebugPanel" />
</template>

<style scoped>
/* Slide the top page across 100% of the viewport while shifting the underlying page by 30%, using sheet motion tokens. */
.page-forward-enter-active,
.page-forward-leave-active,
.page-back-enter-active,
.page-back-leave-active {
  transition: transform var(--motion-duration-sheet) var(--motion-easing-sheet);
}

/* Keep the full-travel page stacked on top with a soft shadow along its leading left edge. */
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
