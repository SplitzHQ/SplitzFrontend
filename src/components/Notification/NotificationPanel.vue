<script setup lang="ts">
import { PhGearSix } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed } from "vue";
import { useRouter } from "vue-router";

import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import { useNotificationStore } from "@/stores/notification";

import NotificationList from "./NotificationList.vue";

/**
 * The activity list in the popover of NotificationBell on a desktop. The header has the title, the two bulk actions and
 * the settings. A phone uses NotificationSheet. See `notification.usage.ts`.
 */
interface NotificationPanelEvents {
  /** Fired after the user navigated somewhere, so the container can close. */
  navigate: [];
}

const emit = defineEmits<NotificationPanelEvents>();

const { $t } = useFluent();
const router = useRouter();
const store = useNotificationStore();

const hasRows = computed(() => store.activity.length > 0);
const hasUnread = computed(() => store.unreadActivityCount > 0);

/** Opens the notification settings page. */
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
        <SButton v-if="hasUnread" variant="ghost" size="sm" @click="store.markAllRead('Activity')">
          {{ $t("notification-mark-all-read") }}
        </SButton>
        <SButton v-if="hasRows" variant="ghost" size="sm" @click="store.dismissAllActivity">
          {{ $t("notification-clear-all") }}
        </SButton>
        <SIconButton variant="ghost" size="sm" :aria-label="$t('notification-settings')" @click="openSettings">
          <PhGearSix />
        </SIconButton>
      </div>
    </div>

    <NotificationList @navigate="emit('navigate')" />
  </div>
</template>
