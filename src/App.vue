<script setup lang="ts">
import { watch } from "vue";
import { RouterView } from "vue-router";
import "vue-sonner/style.css";

import ReloadPrompt from "@/components/ReloadPrompt/ReloadPrompt.vue";
import Sonner from "@/components/Sonner/Sonner.vue";
import { DebugPanel } from "@/debug/gate";
import { useNotificationStore } from "@/stores/notification";
import { useUserStore } from "@/stores/user";

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
  <Sonner position="top-center" close-button />
  <ReloadPrompt />
  <!-- Dev server, or a build with VITE_SPLITZ_DEBUG_TOOLS=true (src/debug/gate.ts). -->
  <component :is="DebugPanel" v-if="DebugPanel" />
</template>
