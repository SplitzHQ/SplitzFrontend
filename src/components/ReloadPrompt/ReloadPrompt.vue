<script setup lang="ts">
// The prompt for a new app version. The app has one instance. Do not add another.
import { useIntervalFn, useSessionStorage } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { useRegisterSW } from "virtual:pwa-register/vue";
import { watch } from "vue";
import { toast } from "vue-sonner";

/**
 * Shows a toast when a new app version is ready. It renders nothing.
 * The app has one instance. The rules are in `reload-prompt.usage.ts`.
 */

/** The time between two checks for a new version. */
const UPDATE_CHECK_MS = 60 * 60 * 1000;
/** The script path of the service worker that the dev server registered before `devOptions` was off. */
const DEV_SW_PATH = "/dev-sw.js";
/** The sessionStorage key that records a closed prompt. A new app start has a new session, so the prompt can show again. */
const DISMISSED_KEY = "reloadPromptDismissed";

/**
 * Removes the service worker of an old dev server. The dev server does not make one now, but the browser keeps the old
 * one. That worker can serve an old `index.html` from its cache. A production build does not include this code.
 */
async function removeDevServiceWorker(): Promise<void> {
  const registrations = await navigator.serviceWorker.getRegistrations();
  const devRegistrations = registrations.filter((registration) =>
    [registration.installing, registration.waiting, registration.active].some(
      (worker) => worker && new URL(worker.scriptURL).pathname === DEV_SW_PATH
    )
  );
  await Promise.all(devRegistrations.map((registration) => registration.unregister()));
}

if (import.meta.env.DEV && "serviceWorker" in navigator) void removeDevServiceWorker();

const { $t } = useFluent();

let registration: ServiceWorkerRegistration | undefined;
const { resume: startUpdateChecks } = useIntervalFn(() => void registration?.update(), UPDATE_CHECK_MS, {
  immediate: false,
});

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered(r) {
    if (r) {
      registration = r;
      startUpdateChecks();
    }
  },
});

/**
 * True after the user closes the prompt with the X or a swipe. The new service worker still waits, so each app open and
 * each hourly check sets `needRefresh` again. This flag keeps the prompt hidden for the rest of the session.
 */
const dismissed = useSessionStorage(DISMISSED_KEY, false);

watch(needRefresh, (value) => {
  if (value && !dismissed.value) {
    toast.info($t("reload-prompt-new-version"), {
      action: {
        label: $t("reload-prompt-update"),
        onClick: () => updateServiceWorker(true),
      },
      closeButton: true,
      duration: Infinity,
      // Only the X and a swipe call this. A tap on Update does not.
      onDismiss: () => {
        dismissed.value = true;
      },
      // At the top, the prompt covers the page title. Other toasts stay at the top of the host.
      position: "bottom-center",
    });
  }
});
</script>

<template></template>
