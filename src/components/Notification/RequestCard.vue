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

/** One friend request or group invite, with Accept and Ignore. See `notification.usage.ts`. */
export interface RequestCardProps {
  notification: RequestNotification;
  /** Less padding and a 40px avatar, for the AvatarMenu popover. The default is for ProfilePage, with a 48px avatar. */
  compact?: boolean;
}

const { notification, compact = false } = defineProps<RequestCardProps>();

const { $t } = useFluent();
const router = useRouter();
const store = useNotificationStore();

const text = computed(() => describeNotification($t, notification));
const time = computed(() => formatRelativeTime(notification.createTime));

const pending = ref<"accept" | "ignore" | null>(null);

/** Accepts the request. A group invite then opens the group page. */
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

/** Ignores the request. */
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
    :class="[
      'flex gap-3 rounded-2xl bg-comp-notification-tint ring-1 ring-comp-notification-tint-line',
      compact ? 'p-3' : 'p-4',
    ]"
  >
    <Avatar v-if="text.image" aria-hidden="true" :images="[text.image]" :size="compact ? 'xs' : 'sm'" />

    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <div class="flex flex-col gap-0.5">
        <div class="flex items-baseline justify-between gap-2">
          <p class="text-xs font-semibold tracking-wide text-base-text-brand uppercase">{{ text.title }}</p>
          <time class="shrink-0 text-xs text-base-text-muted" :datetime="notification.createTime.toISOString()">
            {{ time }}
          </time>
        </div>
        <p class="text-sm leading-5 text-base-text-primary">{{ text.body }}</p>
        <p
          v-if="notification.type === 'FriendRequest' && notification.data.remark"
          class="text-xs text-base-text-secondary"
        >
          {{ $t("notification-request-remark", { remark: notification.data.remark }) }}
        </p>
      </div>

      <div class="flex justify-end gap-2">
        <SButton
          variant="ghost"
          size="sm"
          :loading="pending === 'ignore'"
          :disabled="pending === 'accept'"
          data-test="request-ignore"
          @click="ignore"
        >
          {{ $t("notification-ignore") }}
        </SButton>
        <SButton
          variant="primary"
          size="sm"
          :loading="pending === 'accept'"
          :disabled="pending === 'ignore'"
          data-test="request-accept"
          @click="accept"
        >
          {{ $t("notification-accept") }}
        </SButton>
      </div>
    </div>
  </div>
</template>
