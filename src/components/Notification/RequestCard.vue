<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

import Avatar from "@/components/Avatar/Avatar.vue";
import SButton from "@/components/SButton/SButton.vue";
import { formatRelativeTime } from "@/libs/format-relative-time";
import reportError from "@/libs/report-error";
import { useNotificationStore } from "@/stores/notification";
import type { TypedNotification } from "@/types/notification";

import { describeNotification } from "./notification-text";

export type RequestNotification = TypedNotification & { type: "FriendRequest" | "GroupInvite" };

export interface RequestCardProps {
  notification: RequestNotification;
  /** Compact layout for the dropdown; the default is for full-width lists. */
  compact?: boolean;
}

const { notification, compact = false } = defineProps<RequestCardProps>();

const { $t } = useFluent();
const router = useRouter();
const store = useNotificationStore();

const text = computed(() => describeNotification($t, notification));
const time = computed(() => formatRelativeTime(notification.createTime));

const pending = ref<"accept" | "ignore" | null>(null);

async function accept() {
  pending.value = "accept";
  try {
    switch (notification.type) {
      case "FriendRequest": {
        await store.acceptFriendRequest(notification);
        toast.success(
          $t("notification-friend-request-accepted-toast", {
            name: notification.data.fromUserName ?? $t("notification-someone"),
          })
        );
        break;
      }
      case "GroupInvite": {
        const group = await store.acceptGroupInvite(notification);
        toast.success($t("notification-group-invite-accepted-toast", { group: group.name }));
        void router.push({ name: "groupDetail", params: { groupId: group.groupId } });
        break;
      }
    }
  } catch (error) {
    reportError("request.accept", error);
    toast.error($t("notification-request-error"));
  } finally {
    pending.value = null;
  }
}

async function ignore() {
  pending.value = "ignore";
  try {
    switch (notification.type) {
      case "FriendRequest":
        await store.ignoreFriendRequest(notification);
        break;
      case "GroupInvite":
        await store.ignoreGroupInvite(notification);
        break;
    }
  } catch (error) {
    reportError("request.ignore", error);
    toast.error($t("notification-request-error"));
  } finally {
    pending.value = null;
  }
}
</script>

<template>
  <div
    :class="['flex gap-3 rounded-2xl bg-core-alpha-brand-5 ring-1 ring-core-alpha-brand-10', compact ? 'p-3' : 'p-4']"
  >
    <Avatar v-if="text.image" :images="[text.image]" :size="compact ? 'xs' : 'sm'" />

    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <div class="flex flex-col gap-0.5">
        <div class="flex items-baseline justify-between gap-2">
          <p class="text-xs font-semibold tracking-wide text-util-color-brand-700 uppercase">{{ text.title }}</p>
          <time class="shrink-0 text-xs text-base-text-quaternary" :datetime="notification.createTime.toISOString()">
            {{ time }}
          </time>
        </div>
        <p class="text-sm leading-5 text-base-text-primary">{{ text.body }}</p>
        <p
          v-if="notification.type === 'FriendRequest' && notification.data.remark"
          class="text-xs text-base-text-tertiary"
        >
          “{{ notification.data.remark }}”
        </p>
      </div>

      <div class="flex gap-2">
        <SButton
          variant="primary"
          color="brand"
          :size="compact ? 'sm' : 'md'"
          :loading="pending === 'accept'"
          :disabled="pending !== null"
          data-test="request-accept"
          @click="accept"
        >
          {{ $t("notification-accept") }}
        </SButton>
        <SButton
          variant="ghost"
          color="neutral"
          :size="compact ? 'sm' : 'md'"
          :loading="pending === 'ignore'"
          :disabled="pending !== null"
          data-test="request-ignore"
          @click="ignore"
        >
          {{ $t("notification-ignore") }}
        </SButton>
      </div>
    </div>
  </div>
</template>
