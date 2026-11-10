<script setup lang="ts">
import { PhCheck, PhDotsThree, PhGearSix, PhTrash } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import { useNotificationStore } from "@/stores/notification";

import NotificationList from "./NotificationList.vue";

/**
 * The activity list in a sheet on a phone. The title row has a More button that opens a second sheet with all the
 * actions. Clear all and Mark all read also stay at the bottom, and the list scrolls under them.
 * See `notification.usage.ts`.
 */
const open = defineModel<boolean>({ required: true });

const { $t } = useFluent();
const router = useRouter();
const store = useNotificationStore();

const hasRows = computed(() => store.activity.length > 0);
const hasUnread = computed(() => store.unreadActivityCount > 0);
/** The classes of a row in the second sheet. */
const MENU_ROW =
  "flex min-h-12 items-center gap-3 rounded-lg text-left transition-opacity duration-feedback ease-standard active:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand-solid";
/** True when the second sheet with all the actions is open. */
const menuOpen = ref(false);

/** Closes both sheets and opens the notification settings page. */
function openSettings() {
  menuOpen.value = false;
  void router.push({ name: "notificationSettings" });
  open.value = false;
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
  <Sheet v-model="open" :aria-label="$t('notification-title')" detent="large" :show-close-button="true">
    <div class="flex min-h-0 flex-col gap-4.5">
      <!--
        This row takes the place of the title that Sheet draws, so the title must start and end on the same lines.
        The row also holds an icon button, so it is taller than one title line. `pt-1.5` and `gap-4.5` add the difference
        to the space above and below that Sheet gives its own title. If the size of SIconButton or of the title changes,
        check this row against a Sheet with `title` again. The right side of the row stays free for the close button.
      -->
      <div data-sheet-handle class="flex touch-none items-center justify-between gap-2 pt-1.5">
        <h2 class="text-display-xs font-semibold text-base-text-primary">{{ $t("notification-title") }}</h2>
        <SIconButton
          v-if="hasRows"
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

      <NotificationList @navigate="open = false" />
    </div>

    <!-- A choice list: a tap on a row runs the action and closes the sheet, so it has no close button. -->
    <Sheet v-model="menuOpen" :aria-label="$t('notification-more')" detent="medium">
      <div class="flex flex-col">
        <button
          v-if="hasUnread"
          type="button"
          :class="[MENU_ROW, 'text-base-text-primary']"
          @click="markAllReadFromMenu"
        >
          <PhCheck :size="20" />
          {{ $t("notification-mark-all-read") }}
        </button>
        <button v-if="hasRows" type="button" :class="[MENU_ROW, 'text-base-text-error']" @click="clearAllFromMenu">
          <PhTrash :size="20" />
          {{ $t("notification-clear-all") }}
        </button>
        <button type="button" :class="[MENU_ROW, 'text-base-text-primary']" @click="openSettings">
          <PhGearSix :size="20" />
          {{ $t("notification-settings") }}
        </button>
      </div>
    </Sheet>

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
