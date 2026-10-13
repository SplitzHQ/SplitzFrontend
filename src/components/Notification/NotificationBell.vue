<script setup lang="ts">
import { PhBell } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, onUnmounted, ref, watch } from "vue";

import SIconButton from "@/components/SButton/SIconButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import { useIsDesktop } from "@/libs/use-media-query";
import { useNotificationStore } from "@/stores/notification";

import NotificationBadge from "./NotificationBadge.vue";
import NotificationPanel from "./NotificationPanel.vue";

const { $t } = useFluent();
const store = useNotificationStore();
const isDesktop = useIsDesktop();

const open = ref(false);
const rootRef = ref<HTMLElement>();

const count = computed(() => store.unreadActivityCount);
const label = computed(() =>
  count.value > 0 ? $t("notification-unread-count", { count: count.value }) : $t("notification-open")
);

function toggle() {
  open.value = !open.value;
  if (open.value) void store.fetch();
}

function close() {
  open.value = false;
}

// Desktop popover: close on outside click or Escape. The sheet handles its own dismissal on mobile.
function onPointerDown(event: PointerEvent) {
  if (!rootRef.value?.contains(event.target as Node)) close();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") close();
}

watch(
  () => open.value && isDesktop.value,
  (active) => {
    if (active) {
      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("keydown", onKeydown);
    } else {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeydown);
    }
  }
);

onUnmounted(() => {
  document.removeEventListener("pointerdown", onPointerDown);
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div ref="rootRef" class="relative">
    <div class="relative">
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
      <NotificationBadge :count="count" class="top-0.5 right-0.5" />
    </div>

    <!-- Desktop: anchored popover -->
    <Transition name="popover">
      <div
        v-if="isDesktop && open"
        role="dialog"
        :aria-label="$t('notification-title')"
        class="absolute top-full right-0 z-popover mt-2 flex max-h-[min(70vh,36rem)] w-[26rem] origin-top-right flex-col overflow-y-auto rounded-3xl bg-base-bg-primary p-4 shadow-2xl ring-1 ring-base-border-tertiary"
      >
        <NotificationPanel @navigate="close" />
      </div>
    </Transition>

    <!-- Mobile: bottom sheet -->
    <Sheet v-if="!isDesktop" v-model="open" detent="large" :show-close-button="true">
      <NotificationPanel @navigate="close" />
    </Sheet>
  </div>
</template>

<style scoped>
.popover-enter-active {
  transition:
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.15s ease;
}

.popover-leave-active {
  transition:
    transform 0.12s ease-in,
    opacity 0.12s ease-in;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.96);
}

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
