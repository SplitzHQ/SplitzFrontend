<script setup lang="ts">
import { PhBellSlash, PhCheck, PhDotsThree, PhGearSix, PhTrash } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import EmptyState from "@/components/EmptyState/EmptyState.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import { useNotificationStore } from "@/stores/notification";
import { getNotificationRoute, type TypedNotification } from "@/types/notification";

import NotificationItem from "./NotificationItem.vue";

/**
 * The activity list with its header. NotificationBell shows it in a popover on a desktop. On a phone,
 * NotificationSheet shows it in a sheet with `inSheet`. See `notification.usage.ts`.
 */
interface NotificationPanelProps {
  /**
   * Shows the header for a sheet: the title and a button that opens a second sheet with all the actions.
   * The right side of the header stays free for the close button of the sheet.
   */
  inSheet?: boolean;
}

interface NotificationPanelEvents {
  /** Fired after the user navigated somewhere, so the container can close. */
  navigate: [];
}

const { inSheet = false } = defineProps<NotificationPanelProps>();
const emit = defineEmits<NotificationPanelEvents>();

const { $t } = useFluent();
const router = useRouter();
const store = useNotificationStore();

const items = computed(() => store.activity);
const hasUnread = computed(() => store.unreadActivityCount > 0);
/** The first request runs and the list has no data yet. The empty message would be wrong here. */
const isFirstLoad = computed(() => store.loading && !store.loaded);
const SKELETON_ROWS = 3;
/** True when the second sheet with all the actions is open. */
const menuOpen = ref(false);

/** Marks the notification as read and opens its page, if it has one. */
async function open(notification: TypedNotification) {
  void store.markRead(notification.notificationId);
  const route = getNotificationRoute(notification);
  if (route) {
    await router.push(route);
    emit("navigate");
  }
}

/** Opens the notification settings page. */
function openSettings() {
  menuOpen.value = false;
  void router.push({ name: "notificationSettings" });
  emit("navigate");
}

/** Marks all activity as read and closes the second sheet. */
function markAllReadFromMenu() {
  menuOpen.value = false;
  void store.markAllRead("Activity");
}

/** Removes all activity and closes the second sheet. */
function clearAllFromMenu() {
  menuOpen.value = false;
  void store.dismissAllActivity();
}
</script>

<template>
  <div :class="['flex min-h-0 flex-col', inSheet ? 'gap-4.5' : 'gap-3']">
    <!--
      In a sheet, this row takes the place of the title that Sheet draws, so the title must start and end on the same lines.
      The row also holds the clear button, so it is taller than one title line. `pt-1.5` and `gap-4.5` add the difference
      to the space above and below that Sheet gives its own title. If the size of SIconButton or of the title changes,
      check this row against a Sheet with `title` again.
    -->
    <div v-if="inSheet" data-sheet-handle class="flex touch-none items-center justify-between gap-2 pt-1.5">
      <h2 class="text-display-xs font-semibold text-base-text-primary">{{ $t("notification-title") }}</h2>
      <SIconButton
        v-if="items.length > 0"
        variant="ghost"
        size="sm"
        aria-haspopup="dialog"
        :aria-expanded="menuOpen"
        :aria-label="$t('notification-more')"
        @click="menuOpen = true"
      >
        <PhDotsThree />
      </SIconButton>
      <!-- A list with no rows has only Settings to show, so a second sheet has no use. -->
      <SIconButton v-else variant="ghost" size="sm" :aria-label="$t('notification-settings')" @click="openSettings">
        <PhGearSix />
      </SIconButton>
    </div>

    <div v-else class="flex items-center justify-between gap-2">
      <h2 class="text-lg font-semibold text-base-text-primary">{{ $t("notification-title") }}</h2>
      <div class="flex items-center gap-1">
        <SButton v-if="hasUnread" variant="ghost" size="sm" @click="store.markAllRead('Activity')">
          {{ $t("notification-mark-all-read") }}
        </SButton>
        <SButton v-if="items.length > 0" variant="ghost" size="sm" @click="store.dismissAllActivity">
          {{ $t("notification-clear-all") }}
        </SButton>
        <SIconButton variant="ghost" size="sm" :aria-label="$t('notification-settings')" @click="openSettings">
          <PhGearSix />
        </SIconButton>
      </div>
    </div>

    <div v-if="store.error && items.length === 0" class="flex flex-col items-center gap-2 py-8 text-center">
      <p role="alert" class="text-sm text-base-text-danger">{{ $t("notification-error") }}</p>
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

    <!-- No button: the settings button in the header is the way to the notification settings. -->
    <EmptyState
      v-else-if="items.length === 0"
      :icon="PhBellSlash"
      :title="$t('notification-empty-title')"
      :description="$t('notification-empty-hint')"
      title-tag="h3"
    />

    <TransitionGroup v-else tag="ul" name="list" class="relative flex flex-col gap-1">
      <li v-for="item in items" :key="item.notificationId">
        <NotificationItem :notification="item" @open="open" @dismiss="store.dismiss(item.notificationId)" />
      </li>
    </TransitionGroup>

    <!-- A choice list: a tap on a row runs the action and closes the sheet, so it has no close button. -->
    <Sheet v-if="inSheet" v-model="menuOpen" :label="$t('notification-more')" detent="medium">
      <div class="flex flex-col">
        <button v-if="hasUnread" type="button" class="menu-row text-base-text-primary" @click="markAllReadFromMenu">
          <PhCheck :size="20" />
          {{ $t("notification-mark-all-read") }}
        </button>
        <button v-if="items.length > 0" type="button" class="menu-row text-base-text-danger" @click="clearAllFromMenu">
          <PhTrash :size="20" />
          {{ $t("notification-clear-all") }}
        </button>
        <button type="button" class="menu-row text-base-text-primary" @click="openSettings">
          <PhGearSix :size="20" />
          {{ $t("notification-settings") }}
        </button>
      </div>
    </Sheet>
  </div>
</template>

<style scoped>
.menu-row {
  display: flex;
  min-height: 3rem;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  border-radius: 0.5rem;
  transition: opacity var(--motion-duration-feedback) var(--motion-easing-standard);
}

.menu-row:active {
  opacity: 0.6;
}

.menu-row:focus-visible {
  outline: 2px solid var(--base-focus-ring);
  outline-offset: 2px;
}

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
