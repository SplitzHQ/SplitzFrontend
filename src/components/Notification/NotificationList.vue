<script setup lang="ts">
import { PhBellSlash } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed } from "vue";
import { useRouter } from "vue-router";

import SButton from "@/components/SButton/SButton.vue";
import { useNotificationStore } from "@/stores/notification";
import { getNotificationRoute, type TypedNotification } from "@/types/notification";

import NotificationItem from "./NotificationItem.vue";

/**
 * The activity rows with the loading, error and empty states. It has no header.
 * NotificationPanel and NotificationSheet put their own header above it. See `notification.usage.ts`.
 */
interface NotificationListEvents {
  /** Fired after the user navigated somewhere, so the container can close. */
  navigate: [];
}

const emit = defineEmits<NotificationListEvents>();

const { $t } = useFluent();
const router = useRouter();
const store = useNotificationStore();

const items = computed(() => store.activity);
/** The first request runs and the list has no data yet. The empty message would be wrong here. */
const isFirstLoad = computed(() => store.loading && !store.loaded);
const SKELETON_ROWS = 3;

/** Marks the notification as read and opens its page, if it has one. */
async function open(notification: TypedNotification) {
  void store.markRead(notification.notificationId);
  const route = getNotificationRoute(notification);
  if (route) {
    await router.push(route);
    emit("navigate");
  }
}
</script>

<template>
  <div v-if="store.error && items.length === 0" class="flex flex-col items-center gap-2 py-8 text-center">
    <p role="alert" class="text-sm text-base-text-error">{{ $t("notification-error") }}</p>
    <SButton variant="secondary" size="md" :loading="store.loading" @click="store.fetch">
      {{ $t("notification-retry") }}
    </SButton>
  </div>

  <div v-else-if="isFirstLoad" role="status" :aria-label="$t('notification-loading')" class="flex flex-col gap-1">
    <div v-for="row in SKELETON_ROWS" :key="row" aria-hidden="true" class="flex items-start gap-3 px-3 py-3">
      <div class="size-10 shrink-0 skeleton rounded-05xl" />
      <div class="flex min-w-0 flex-1 flex-col gap-2 py-1">
        <div class="h-3 w-2/3 skeleton" />
        <div class="h-3 w-full skeleton" />
      </div>
    </div>
  </div>

  <div v-else-if="items.length === 0" class="flex flex-col items-center gap-2 px-4 py-10 text-center">
    <span class="flex size-12 items-center justify-center rounded-2xl bg-core-alpha-brand-10">
      <PhBellSlash weight="duotone" class="size-6 text-util-color-brand-700" />
    </span>
    <p class="text-sm font-medium text-base-text-secondary">{{ $t("notification-empty-title") }}</p>
    <p class="text-xs text-base-text-quaternary">{{ $t("notification-empty-hint") }}</p>
  </div>

  <TransitionGroup v-else tag="ul" name="list" class="relative flex flex-col gap-1">
    <li v-for="item in items" :key="item.notificationId">
      <NotificationItem :notification="item" @open="open" @dismiss="store.dismiss(item.notificationId)" />
    </li>
  </TransitionGroup>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition:
    transform var(--motion-duration-container) var(--motion-easing-standard),
    opacity var(--motion-duration-state) var(--motion-easing-standard);
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
