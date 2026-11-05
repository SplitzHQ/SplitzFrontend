<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { computed } from "vue";

import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import { useNotificationStore } from "@/stores/notification";

import NotificationPanel from "./NotificationPanel.vue";

/**
 * The activity list in a sheet on a phone, with Clear all and Mark all read at the bottom.
 * The list scrolls, and the two buttons stay in view. See `notification.usage.ts`.
 */
const open = defineModel<boolean>({ required: true });

const { $t } = useFluent();
const store = useNotificationStore();

const hasRows = computed(() => store.activity.length > 0);
const hasUnread = computed(() => store.unreadActivityCount > 0);
</script>

<template>
  <Sheet v-model="open" :label="$t('notification-title')" detent="large" :show-close-button="true">
    <NotificationPanel in-sheet @navigate="open = false" />
    <template v-if="hasRows" #actions>
      <div class="flex items-center justify-between gap-2">
        <SButton variant="ghost" size="sm" @click="store.dismissAllActivity">
          {{ $t("notification-clear-all") }}
        </SButton>
        <SButton v-if="hasUnread" variant="secondary" size="sm" @click="store.markAllRead('Activity')">
          {{ $t("notification-mark-all-read") }}
        </SButton>
      </div>
    </template>
  </Sheet>
</template>
