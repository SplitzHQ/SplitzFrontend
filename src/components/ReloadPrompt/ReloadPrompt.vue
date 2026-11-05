<script setup lang="ts">
// The prompt for a new app version. The app has one instance. Do not add another.
import { useIntervalFn } from "@vueuse/core";
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

watch(needRefresh, (value) => {
  if (value) {
    toast.info($t("reload-prompt-new-version"), {
      action: {
        label: $t("reload-prompt-update"),
        onClick: () => updateServiceWorker(true),
      },
      closeButton: true,
      duration: Infinity,
    });
  }
});
</script>

<template></template>
