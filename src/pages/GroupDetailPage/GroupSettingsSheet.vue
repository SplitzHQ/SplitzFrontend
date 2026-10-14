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
  <Sheet v-model="model" detent="medium" :show-close-button="true">
    <div class="flex flex-col gap-4 px-4 pt-2 pb-6">
      <h2 class="text-lg font-semibold text-base-text-primary">{{ $t("group-settings-title") }}</h2>

      <div class="flex flex-col divide-y divide-base-border-tertiary overflow-hidden rounded-3xl">
        <button
          type="button"
          class="flex w-full items-center gap-3 bg-util-alpha-black-5 px-4 py-3 text-left hover:bg-util-alpha-black-10"
          data-test="group-invite-friends"
          @click="openInvite"
        >
          <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-core-alpha-brand-10">
            <PhUserPlus class="size-5 text-util-color-brand-700" />
          </span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="text-base font-medium text-base-text-primary">{{ $t("group-settings-invite") }}</span>
            <span class="text-xs text-base-text-quaternary">{{ $t("group-settings-invite-hint") }}</span>
          </span>
          <PhCaretRight class="size-5 shrink-0 text-base-fg-quaternary" />
        </button>

        <button
          type="button"
          class="flex w-full items-center gap-3 bg-util-alpha-black-5 px-4 py-3 text-left hover:bg-util-alpha-black-10"
          data-test="group-notification-settings"
          @click="openNotifications"
        >
          <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-core-alpha-brand-10">
            <PhBell class="size-5 text-util-color-brand-700" />
          </span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="text-base font-medium text-base-text-primary">{{ $t("group-settings-notifications") }}</span>
            <span class="text-xs text-base-text-quaternary">{{ $t("group-settings-notifications-hint") }}</span>
          </span>
          <PhCaretRight class="size-5 shrink-0 text-base-fg-quaternary" />
        </button>
      </div>
    </div>
  </Sheet>
</template>
