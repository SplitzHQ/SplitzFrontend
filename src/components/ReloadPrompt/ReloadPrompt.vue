<script setup lang="ts">
import { useRegisterSW } from "virtual:pwa-register/vue";
import { watch } from "vue";
import { toast } from "vue-sonner";

const intervalMS = 60 * 60 * 1000; // Check for updates every 60 minutes

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered(r) {
    if (r) {
      setInterval(() => {
        r.update();
      }, intervalMS);
    }
  },
});

watch(needRefresh, (value) => {
  if (value) {
    toast.info("A new version is available", {
      action: {
        label: "Update",
        onClick: () => updateServiceWorker(true),
      },
      duration: Infinity,
    });
  }
});

watch(offlineReady, (value) => {
  if (value) {
    toast.success("App ready to work offline");
  }
});
</script>

<template>
  <div />
</template>
