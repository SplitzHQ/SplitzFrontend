<script setup lang="ts">
import { PhCaretRight } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import Avatar from "@/components/Avatar/Avatar.vue";
import { useIsDesktop } from "@/libs/use-media-query";
import { useNotificationStore } from "@/stores/notification";
import { useUserStore } from "@/stores/user";

import NotificationBadge from "./NotificationBadge.vue";
import RequestCard, { type RequestNotification } from "./RequestCard.vue";

const { $t } = useFluent();
const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();
const isDesktop = useIsDesktop();

const open = ref(false);
const rootRef = ref<HTMLElement>();

const requests = computed(() => notificationStore.requests as RequestNotification[]);
const pendingRequestCount = computed(() => notificationStore.pendingRequestCount);
const avatarLabel = computed(() =>
  pendingRequestCount.value > 0
    ? $t("notification-requests-badge", { count: pendingRequestCount.value })
    : $t("home-profile")
);

function goToProfile() {
  open.value = false;
  void router.push({ name: "profile" });
}

// Desktop with pending requests: show them in place. Otherwise the avatar is a plain link to the profile.
function onClick() {
  if (isDesktop.value && pendingRequestCount.value > 0) {
    open.value = !open.value;
    if (open.value) void notificationStore.markAllRead("Request");
  } else {
    goToProfile();
  }
}

function onPointerDown(event: PointerEvent) {
  if (!rootRef.value?.contains(event.target as Node)) open.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") open.value = false;
}

watch(open, (active) => {
  if (active) {
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeydown);
  } else {
    document.removeEventListener("pointerdown", onPointerDown);
    document.removeEventListener("keydown", onKeydown);
  }
});

// Close once the last request is handled.
watch(pendingRequestCount, (value) => {
  if (value === 0) open.value = false;
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onPointerDown);
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="relative block rounded-05xl focus-visible:ring-2 focus-visible:ring-util-color-brand-600 focus-visible:outline-none"
      :aria-label="avatarLabel"
      :aria-expanded="isDesktop ? open : undefined"
      data-test="avatar-button"
      @click="onClick"
    >
      <Avatar :images="[{ src: userStore.user?.photo ?? null, alt: userStore.user?.userName ?? '' }]" size="xs" />
      <NotificationBadge :count="pendingRequestCount" class="-top-1 -right-1" />
    </button>

    <Transition name="popover">
      <div
        v-if="isDesktop && open"
        role="dialog"
        :aria-label="$t('notification-requests-title')"
        class="absolute top-full right-0 z-popover mt-2 flex max-h-[min(70vh,32rem)] w-[24rem] origin-top-right flex-col gap-3 overflow-y-auto rounded-3xl bg-base-bg-primary p-4 shadow-2xl ring-1 ring-base-border-tertiary"
      >
        <h2 class="text-lg font-semibold text-base-text-primary">{{ $t("notification-requests-title") }}</h2>
        <TransitionGroup tag="ul" name="list" class="relative flex flex-col gap-2">
          <li v-for="request in requests" :key="request.notificationId">
            <RequestCard :notification="request" compact />
          </li>
        </TransitionGroup>
        <button
          type="button"
          class="flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium text-base-text-secondary hover:bg-util-alpha-black-5"
          @click="goToProfile"
        >
          {{ $t("home-profile") }}
          <PhCaretRight class="size-4" />
        </button>
      </div>
    </Transition>
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

.list-move,
.list-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.2s ease;
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
