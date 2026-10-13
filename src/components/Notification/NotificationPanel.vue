<script setup lang="ts">
import { PhBellSlash, PhGearSix } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed } from "vue";
import { useRouter } from "vue-router";

import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import { useNotificationStore } from "@/stores/notification";
import { getNotificationRoute, type TypedNotification } from "@/types/notification";

import NotificationItem from "./NotificationItem.vue";

interface NotificationPanelEvents {
  /** Fired after the user navigated somewhere, so the container can close. */
  navigate: [];
}

const emit = defineEmits<NotificationPanelEvents>();

const { $t } = useFluent();
const router = useRouter();
const store = useNotificationStore();

const items = computed(() => store.activity);
const hasUnread = computed(() => store.unreadActivityCount > 0);

async function open(notification: TypedNotification) {
  void store.markRead(notification.notificationId);
  const route = getNotificationRoute(notification);
  if (route) {
    await router.push(route);
    emit("navigate");
  }
}

function openSettings() {
  void router.push({ name: "notificationSettings" });
  emit("navigate");
}
</script>

<template>
  <div class="flex min-h-0 flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-lg font-semibold text-base-text-primary">{{ $t("notification-title") }}</h2>
      <div class="flex items-center gap-1">
        <SButton v-if="hasUnread" variant="ghost" color="brand" size="sm" @click="store.markAllRead('Activity')">
          {{ $t("notification-mark-all-read") }}
        </SButton>
        <SButton v-if="items.length > 0" variant="ghost" color="neutral" size="sm" @click="store.dismissAllActivity">
          {{ $t("notification-clear-all") }}
        </SButton>
        <SIconButton
          variant="ghost"
          color="neutral"
          size="sm"
          :aria-label="$t('notification-settings')"
          @click="openSettings"
        >
          <PhGearSix />
        </SIconButton>
      </div>
    </div>

    <div v-if="store.error && items.length === 0" class="flex flex-col items-center gap-2 py-8 text-center">
      <p class="text-sm text-base-text-error">{{ $t("notification-error") }}</p>
      <SButton variant="secondary" color="neutral" size="sm" :loading="store.loading" @click="store.fetch">
        {{ $t("notification-retry") }}
      </SButton>
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
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.2s ease;
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
