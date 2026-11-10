<script setup lang="ts">
import { PhBell, PhCaretRight, PhUserPlus } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { useRouter } from "vue-router";

import Sheet from "@/components/Sheet/Sheet.vue";

export interface GroupSettingsSheetProps {
  groupId: string;
}

interface GroupSettingsSheetEvents {
  invite: [];
}

const model = defineModel<boolean>({ required: true });
const { groupId } = defineProps<GroupSettingsSheetProps>();
const emit = defineEmits<GroupSettingsSheetEvents>();

const { $t } = useFluent();
const router = useRouter();

function openInvite() {
  model.value = false;
  emit("invite");
}

function openNotifications() {
  model.value = false;
  void router.push({ name: "groupNotificationSettings", params: { groupId } });
}
</script>

<template>
  <Sheet v-model="model" :title="$t('group-settings-title')" detent="medium" :show-close-button="true">
    <div class="flex flex-col divide-y divide-base-border-muted overflow-hidden rounded-3xl">
      <button
        type="button"
        class="flex w-full items-center gap-3 bg-base-bg-secondary px-4 py-3 text-left hover:bg-base-bg-active"
        data-test="group-invite-friends"
        @click="openInvite"
      >
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-base-bg-brand-subtle">
          <PhUserPlus class="size-5 text-base-text-brand" />
        </span>
        <span class="flex min-w-0 flex-1 flex-col">
          <span class="text-base font-medium text-base-text-primary">{{ $t("group-settings-invite") }}</span>
          <span class="text-xs text-base-text-muted">{{ $t("group-settings-invite-hint") }}</span>
        </span>
        <PhCaretRight class="size-5 shrink-0 text-base-text-muted" />
      </button>

      <button
        type="button"
        class="flex w-full items-center gap-3 bg-base-bg-secondary px-4 py-3 text-left hover:bg-base-bg-active"
        data-test="group-notification-settings"
        @click="openNotifications"
      >
        <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-base-bg-brand-subtle">
          <PhBell class="size-5 text-base-text-brand" />
        </span>
        <span class="flex min-w-0 flex-1 flex-col">
          <span class="text-base font-medium text-base-text-primary">{{ $t("group-settings-notifications") }}</span>
          <span class="text-xs text-base-text-muted">{{ $t("group-settings-notifications-hint") }}</span>
        </span>
        <PhCaretRight class="size-5 shrink-0 text-base-text-muted" />
      </button>
    </div>
  </Sheet>
</template>
