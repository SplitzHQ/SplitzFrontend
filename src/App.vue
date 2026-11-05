<script setup lang="ts">
import { watch } from "vue";
import { RouterView } from "vue-router";
import "vue-sonner/style.css";

import ReloadPrompt from "@/components/ReloadPrompt/ReloadPrompt.vue";
import Sonner from "@/components/Sonner/Sonner.vue";
import { DebugPanel } from "@/libs/devtools";
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
  <RouterView />
  <Sonner position="top-center" :offset="toastOffset" :mobile-offset="toastMobileOffset" />
  <ReloadPrompt />
  <component :is="DebugPanel" v-if="DebugPanel" />
</template>
