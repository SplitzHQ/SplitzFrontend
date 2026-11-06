<script setup lang="ts">
import { PhArchive, PhArrowUUpLeft, PhBell, PhCaretRight, PhCircleNotch, PhUserPlus } from "@phosphor-icons/vue";
import { useQueryCache } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { GroupApi, ResponseError } from "@/backend";
import config from "@/backend/config";
import Sheet from "@/components/Sheet/Sheet.vue";

export interface GroupSettingsSheetProps {
  groupId: string;
  isArchived: boolean;
}

interface GroupSettingsSheetEvents {
  invite: [];
}

const model = defineModel<boolean>({ required: true });
const { groupId, isArchived } = defineProps<GroupSettingsSheetProps>();
const emit = defineEmits<GroupSettingsSheetEvents>();

const { $t } = useFluent();
const router = useRouter();
const queryCache = useQueryCache();

const groupApi = new GroupApi(config);
const isUpdatingArchive = ref(false);

/**
 * Archive the group, or unarchive it when it is archived.
 * The backend refuses to archive a group that still has unpaid expenses and answers with 400.
 */
async function toggleArchive() {
  if (isUpdatingArchive.value) return;
  const archiving = !isArchived;
  try {
    isUpdatingArchive.value = true;
    await (archiving ? groupApi.archiveGroup({ groupId }) : groupApi.unarchiveGroup({ groupId }));
    await Promise.all([
      queryCache.invalidateQueries({ key: ["getGroup", groupId] }),
      queryCache.invalidateQueries({ key: ["getGroups"] }),
    ]);
    toast.success($t(archiving ? "group-settings-archive-success" : "group-settings-unarchive-success"));
    model.value = false;
  } catch (error) {
    if (archiving && error instanceof ResponseError && error.response.status === 400) {
      toast.error($t("group-settings-archive-unpaid"));
      return;
    }
    console.error("Error updating group archive state:", error);
    toast.error($t(archiving ? "group-settings-archive-error" : "group-settings-unarchive-error"));
  } finally {
    isUpdatingArchive.value = false;
  }
}

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

        <button
          type="button"
          class="flex w-full items-center gap-3 bg-util-alpha-black-5 px-4 py-3 text-left hover:bg-util-alpha-black-10 disabled:cursor-wait"
          :disabled="isUpdatingArchive"
          :aria-busy="isUpdatingArchive"
          data-test="group-archive"
          @click="toggleArchive"
        >
          <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-core-alpha-brand-10">
            <PhArrowUUpLeft v-if="isArchived" class="size-5 text-util-color-brand-700" />
            <PhArchive v-else class="size-5 text-util-color-brand-700" />
          </span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="text-base font-medium text-base-text-primary">
              {{ isArchived ? $t("group-settings-unarchive") : $t("group-settings-archive") }}
            </span>
            <span class="text-xs text-base-text-quaternary">
              {{ isArchived ? $t("group-settings-unarchive-hint") : $t("group-settings-archive-hint") }}
            </span>
          </span>
          <PhCircleNotch v-if="isUpdatingArchive" class="size-5 shrink-0 animate-spin text-base-fg-quaternary" />
        </button>
      </div>
    </div>
  </Sheet>
</template>
