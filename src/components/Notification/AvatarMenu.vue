<script setup lang="ts">
import { PhCaretRight } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";

import Avatar from "@/components/Avatar/Avatar.vue";
import SPopover from "@/components/SPopover/SPopover.vue";
import { useIsDesktop } from "@/libs/use-media-query";
import { useNotificationStore } from "@/stores/notification";
import { useUserStore } from "@/stores/user";

import NotificationBadge from "./NotificationBadge.vue";
import RequestCard, { type RequestNotification } from "./RequestCard.vue";

/**
 * The avatar in the home header. On a desktop with pending requests it opens a popover with the requests.
 * In other cases it opens the profile page. See `notification.usage.ts`.
 */
const { $t } = useFluent();
const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();
const isDesktop = useIsDesktop();

const open = ref(false);
const showRequests = computed(() => isDesktop.value && pendingRequestCount.value > 0);

const requests = computed(() => notificationStore.requests as RequestNotification[]);
const pendingRequestCount = computed(() => notificationStore.pendingRequestCount);
const avatarLabel = computed(() =>
  pendingRequestCount.value > 0
    ? $t("notification-requests-badge", { count: pendingRequestCount.value })
    : $t("home-profile")
);

/** Close the request panel before opening the profile page. */
function goToProfile() {
  open.value = false;
  void router.push({ name: "profile" });
}

/** Use the avatar as a profile link when the request panel is unavailable. */
function onClick() {
  if (!showRequests.value) goToProfile();
}

watch(open, (active) => {
  if (active) void notificationStore.markAllRead("Request");
});

// Close once the last request is handled.
watch(pendingRequestCount, (value) => {
  if (value === 0) open.value = false;
});
</script>

<template>
  <SPopover
    v-model="open"
    :enabled="showRequests"
    :label="$t('notification-requests-title')"
    class="gap-3 [--s-popover-max-height:min(70dvh,32rem)]"
  >
    <template #trigger>
      <!-- The avatar is 32px wide. The invisible box makes the tap area 44px. -->
      <button
        type="button"
        class="relative block rounded-lg after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand-solid"
        :aria-label="avatarLabel"
        data-test="avatar-button"
        @click="onClick"
      >
        <Avatar :images="[{ src: userStore.user?.photo ?? null, alt: userStore.user?.userName ?? '' }]" size="header" />
        <NotificationBadge :count="pendingRequestCount" class="-top-1 -right-1" />
      </button>
    </template>
    <h2 class="text-lg font-semibold text-base-text-primary">{{ $t("notification-requests-title") }}</h2>
    <TransitionGroup tag="ul" name="list" class="relative flex flex-col gap-2">
      <li v-for="request in requests" :key="request.notificationId">
        <RequestCard :notification="request" compact />
      </li>
    </TransitionGroup>
    <!-- The row is 36px high. The invisible box makes the tap area 44px. -->
    <button
      type="button"
      class="relative flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium text-base-text-secondary after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 hover:bg-util-alpha-black-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand-solid"
      @click="goToProfile"
    >
      {{ $t("home-profile") }}
      <PhCaretRight class="size-4" />
    </button>
  </SPopover>
</template>

<style scoped>
.list-move,
.list-leave-active {
  transition:
    transform var(--motion-duration-container) var(--motion-easing-standard),
    opacity var(--motion-duration-state) var(--motion-easing-standard);
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
