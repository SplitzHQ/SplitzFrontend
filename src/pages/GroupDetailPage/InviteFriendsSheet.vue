<script setup lang="ts">
import { PhCheck } from "@phosphor-icons/vue";
import { useQuery, useQueryCache } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";

import { GroupApi, type GroupDto } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import reportError from "@/libs/report-error";
import { useUserStore } from "@/stores/user";

export interface InviteFriendsSheetProps {
  group: GroupDto;
}

const model = defineModel<boolean>({ required: true });
const { group } = defineProps<InviteFriendsSheetProps>();

const { $t } = useFluent();
const queryCache = useQueryCache();
const userStore = useUserStore();
const groupApi = new GroupApi(config);

const { state: invitesQuery } = useQuery({
  enabled: () => model.value,
  key: () => ["getGroupInvites", group.groupId],
  query: () => groupApi.getGroupInvites({ groupId: group.groupId }),
});

const pendingIds = computed(() => new Set((invitesQuery.value.data ?? []).map((i) => i.invitedUser.id)));
const memberIds = computed(() => new Set(group.members.map((m) => m.id)));

/** Friends who are not members yet. Those with an open invite are shown but cannot be selected again. */
const candidates = computed(() =>
  (userStore.user?.friends ?? [])
    .filter((f) => !memberIds.value.has(f.friendUser.id))
    .map((f) => ({ ...f, pending: pendingIds.value.has(f.friendUser.id) }))
);

const selected = ref(new Set<string>());
const sending = ref(false);

function toggle(id: string) {
  const next = new Set(selected.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selected.value = next;
}

watch(model, (open) => {
  if (!open) selected.value = new Set();
});

async function send() {
  if (selected.value.size === 0) return;
  sending.value = true;
  try {
    const invites = await groupApi.inviteGroupMembers({ groupId: group.groupId, requestBody: [...selected.value] });
    await queryCache.invalidateQueries({ key: ["getGroupInvites", group.groupId] });
    toast.success($t("group-invite-success", { count: invites.length }));
    model.value = false;
  } catch (error) {
    reportError("group.invite", error);
    toast.error($t("group-invite-error"));
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <Sheet v-model="model" detent="large" :show-close-button="true">
    <div class="flex flex-col gap-4 px-4 pt-2 pb-6">
      <h2 class="text-lg font-semibold text-base-text-primary">{{ $t("group-invite-title") }}</h2>

      <p v-if="(userStore.user?.friends?.length ?? 0) === 0" class="text-sm text-base-text-tertiary">
        {{ $t("group-invite-no-friends") }}
      </p>
      <p v-else-if="candidates.length === 0" class="text-sm text-base-text-tertiary">
        {{ $t("group-invite-empty") }}
      </p>

      <div v-else class="flex flex-col divide-y divide-base-border-tertiary rounded-3xl bg-util-alpha-black-5">
        <button
          v-for="friend in candidates"
          :key="friend.friendUser.id"
          type="button"
          class="flex w-full items-center gap-3 px-4 py-3 text-left disabled:opacity-60"
          :disabled="friend.pending"
          :aria-pressed="selected.has(friend.friendUser.id)"
          :data-test="`invite-${friend.friendUser.id}`"
          @click="toggle(friend.friendUser.id)"
        >
          <Avatar :images="[{ src: friend.friendUser.photo ?? null, alt: friend.friendUser.userName }]" size="xs" />
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-base font-medium text-base-text-primary">
              {{ friend.remark || friend.friendUser.userName }}
            </span>
            <span v-if="friend.pending" class="text-xs text-base-text-quaternary">
              {{ $t("group-invite-pending") }}
            </span>
          </span>
          <span
            :class="[
              'flex size-6 items-center justify-center rounded-full border transition-colors',
              selected.has(friend.friendUser.id)
                ? 'border-util-color-brand-700 bg-util-color-brand-700 text-base-text-primary-reverse'
                : 'border-base-border-secondary bg-transparent text-transparent',
            ]"
          >
            <PhCheck class="size-3.5" weight="bold" />
          </span>
        </button>
      </div>

      <SButton
        variant="primary"
        color="brand"
        size="xxl"
        class="w-full"
        :disabled="selected.size === 0"
        :loading="sending"
        @click="send"
      >
        {{ $t("group-invite-submit", { count: selected.size }) }}
      </SButton>
    </div>
  </Sheet>
</template>
