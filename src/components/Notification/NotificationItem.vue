<script setup lang="ts">
import { PhX } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed } from "vue";

import Avatar from "@/components/Avatar/Avatar.vue";
import { formatRelativeTime } from "@/libs/format-relative-time";
import type { TypedNotification } from "@/types/notification";

import { describeNotification } from "./notification-text";

export interface NotificationItemProps {
  notification: TypedNotification;
}

interface NotificationItemEvents {
  open: [notification: TypedNotification];
  dismiss: [notification: TypedNotification];
}

const { notification } = defineProps<NotificationItemProps>();
const emit = defineEmits<NotificationItemEvents>();

const { $t } = useFluent();

const text = computed(() => describeNotification($t, notification));
const time = computed(() => formatRelativeTime(notification.createTime));

// Full class strings keep Tailwind's scanner happy.
const toneClasses: Record<typeof text.value.tone, string> = {
  brand: "bg-core-alpha-brand-10 text-util-color-brand-700",
  neutral: "bg-util-alpha-black-5 text-base-text-tertiary",
  success: "bg-util-color-success-50 text-util-color-success-600",
};
</script>

<template>
  <div
    :class="[
      'group relative flex items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors',
      notification.isRead ? 'bg-transparent' : 'bg-core-alpha-brand-5',
    ]"
  >
    <button type="button" class="flex min-w-0 flex-1 items-start gap-3 text-left" @click="emit('open', notification)">
      <Avatar v-if="text.image" :images="[text.image]" size="xs" />
      <span
        v-else
        :class="[
          'flex size-10 shrink-0 items-center justify-center rounded-05xl [&>svg]:size-5',
          toneClasses[text.tone],
        ]"
      >
        <component :is="text.icon" weight="duotone" />
      </span>

      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="flex items-start gap-2">
          <span
            :class="[
              'min-w-0 flex-1 text-sm leading-5',
              notification.isRead ? 'font-medium text-base-text-secondary' : 'font-semibold text-base-text-primary',
            ]"
          >
            {{ text.title }}
          </span>
          <span
            v-if="!notification.isRead"
            aria-hidden="true"
            class="mt-1.5 size-2 shrink-0 rounded-full bg-util-color-brand-600"
          />
        </span>
        <span class="text-sm leading-5 text-base-text-tertiary">{{ text.body }}</span>
        <time class="text-xs text-base-text-quaternary" :datetime="notification.createTime.toISOString()">
          {{ time }}
        </time>
      </span>
    </button>

    <button
      type="button"
      class="flex size-7 shrink-0 items-center justify-center rounded-full text-base-fg-quaternary opacity-70 transition hover:bg-util-alpha-black-5 hover:text-base-text-primary md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
      :aria-label="$t('notification-dismiss')"
      @click.stop="emit('dismiss', notification)"
    >
      <PhX class="size-4" />
    </button>
  </div>
</template>
