<script setup lang="ts">
import { PhX } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed } from "vue";

import Avatar from "@/components/Avatar/Avatar.vue";
import { LIST_ROW_TEXT } from "@/components/ListRow/list-row";
import { formatRelativeTime } from "@/libs/format-relative-time";
import type { TypedNotification } from "@/types/notification";

import { describeNotification } from "./notification-text";

/** One row of the notification list. See `notification.usage.ts`. */
export interface NotificationItemProps {
  /** An activity notification. The row builds its text with `describeNotification`. */
  notification: TypedNotification;
}

interface NotificationItemEvents {
  /** The user tapped the row. */
  open: [notification: TypedNotification];
  /** The user tapped the dismiss button. */
  dismiss: [notification: TypedNotification];
}

const { notification } = defineProps<NotificationItemProps>();
const emit = defineEmits<NotificationItemEvents>();

const { $t } = useFluent();

const text = computed(() => describeNotification($t, notification));
const time = computed(() => formatRelativeTime(notification.createTime));

// Full class strings keep Tailwind's scanner happy.
const toneClasses: Record<typeof text.value.tone, string> = {
  brand: "bg-base-bg-brand-subtle text-base-text-brand",
  neutral: "bg-base-bg-subtle text-base-text-secondary",
  success: "bg-base-bg-success-subtle text-base-text-success",
};
</script>

<template>
  <div
    :class="[
      'group relative flex items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors duration-state ease-standard',
      notification.isRead ? 'bg-transparent' : 'bg-comp-notification-tint',
    ]"
  >
    <button
      type="button"
      class="flex min-w-0 flex-1 items-start gap-3 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-focus-ring"
      @click="emit('open', notification)"
    >
      <span class="relative flex shrink-0">
        <Avatar v-if="text.image" aria-hidden="true" :images="[text.image]" size="xs" />
        <span
          v-else
          aria-hidden="true"
          :class="['flex size-10 items-center justify-center rounded-05xl [&>svg]:size-5', toneClasses[text.tone]]"
        >
          <component :is="text.icon" weight="duotone" />
        </span>
        <!-- The ring has the color of the popover and the sheet, so the dot stays apart from the icon. -->
        <span
          v-if="!notification.isRead"
          aria-hidden="true"
          class="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-base-bg-brand-solid ring-2 ring-base-bg-primary"
        />
      </span>

      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span :class="notification.isRead ? LIST_ROW_TEXT.titleQuiet : LIST_ROW_TEXT.title">
          {{ text.title }}
        </span>
        <span v-if="!notification.isRead" class="sr-only">{{ $t("notification-unread") }}</span>
        <span :class="LIST_ROW_TEXT.subtitle">{{ text.body }}</span>
        <time :class="LIST_ROW_TEXT.subtitle" :datetime="notification.createTime.toISOString()">
          {{ time }}
        </time>
      </span>
    </button>

    <!--
      The button is 28px wide. The invisible box makes the tap area 44px.
      Only a device that can hover hides the button until hover. A tablet has the `md` width and cannot hover.
    -->
    <button
      type="button"
      class="relative flex size-7 shrink-0 items-center justify-center rounded-full text-base-text-muted transition duration-feedback ease-standard after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 hover:bg-base-bg-hover hover:text-base-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-focus-ring md:group-hover:opacity-100 md:focus-visible:opacity-100 md:[@media(hover:hover)]:opacity-0"
      :aria-label="$t('notification-dismiss')"
      @click.stop="emit('dismiss', notification)"
    >
      <PhX class="size-4" />
    </button>
  </div>
</template>
