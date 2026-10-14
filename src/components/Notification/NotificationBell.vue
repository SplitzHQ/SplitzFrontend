<script setup lang="ts">
import { PhBell } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref, watch } from "vue";

import SIconButton from "@/components/SButton/SIconButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import SPopover from "@/components/SPopover/SPopover.vue";
import { useIsDesktop } from "@/libs/use-media-query";
import { useNotificationStore } from "@/stores/notification";

import NotificationBadge from "./NotificationBadge.vue";
import NotificationPanel from "./NotificationPanel.vue";

const { $t } = useFluent();
const store = useNotificationStore();
const isDesktop = useIsDesktop();

const open = ref(false);

const count = computed(() => store.unreadActivityCount);
const label = computed(() =>
  count.value > 0 ? $t("notification-unread-count", { count: count.value }) : $t("notification-open")
);

/** The popover handles desktop clicks; mobile clicks toggle the sheet. */
function toggle() {
  if (!isDesktop.value) open.value = !open.value;
}

/** Dismiss the current panel after navigation. */
function close() {
  open.value = false;
}

watch(open, (active) => {
  if (active) void store.fetch();
});
</script>

<template>
  <div class="relative">
    <SPopover v-model="open" :enabled="isDesktop" :label="$t('notification-title')" class="w-104">
      <template #trigger>
        <SIconButton
          variant="ghost"
          color="neutral"
          size="lg"
          :aria-label="label"
          :aria-expanded="open"
          aria-haspopup="dialog"
          data-test="notification-bell"
          @click="toggle"
        >
          <PhBell :class="['text-util-color-brand-700', count > 0 && !open ? 'bell-ring' : '']" />
        </SIconButton>
      </template>
      <NotificationPanel @navigate="close" />
    </SPopover>
    <NotificationBadge :count="count" class="top-0.5 right-0.5" />

    <!-- Mobile: bottom sheet -->
    <Sheet v-if="!isDesktop" v-model="open" detent="large" :show-close-button="true">
      <NotificationPanel @navigate="close" />
    </Sheet>
  </div>
</template>

<style scoped>
/* A short swing when unread activity arrives, respecting reduced-motion preferences. */
@keyframes bell-ring {
  0%,
  100% {
    transform: rotate(0);
  }
  20% {
    transform: rotate(14deg);
  }
  40% {
    transform: rotate(-12deg);
  }
  60% {
    transform: rotate(8deg);
  }
  80% {
    transform: rotate(-4deg);
  }
}

.bell-ring {
  transform-origin: top center;
  animation: bell-ring 0.8s ease-in-out 1;
}

@media (prefers-reduced-motion: reduce) {
  .bell-ring {
    animation: none;
  }
}
</style>
