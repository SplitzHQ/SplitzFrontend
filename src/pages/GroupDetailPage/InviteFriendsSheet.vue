<script setup lang="ts">
import { useQuery, useQueryCache } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";

import { GroupApi, type GroupDto } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import { LIST_ROW_TEXT } from "@/components/ListRow/list-row";
import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import SelectableRow from "@/components/SelectableRow/SelectableRow.vue";
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
const sendFailed = ref(false);

function toggle(id: string) {
  const next = new Set(selected.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selected.value = next;
}

watch(model, (open) => {
  if (open) return;
  selected.value = new Set();
  sendFailed.value = false;
});

async function send() {
  if (selected.value.size === 0) return;
  sending.value = true;
  sendFailed.value = false;
  try {
    const invites = await groupApi.inviteGroupMembers({ groupId: group.groupId, requestBody: [...selected.value] });
    await queryCache.invalidateQueries({ key: ["getGroupInvites", group.groupId] });
    toast.success($t("group-invite-success", { count: invites.length }));
    model.value = false;
  } catch (error) {
    reportError("group.invite", error);
    sendFailed.value = true;
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <Sheet v-model="model" :title="$t('group-invite-title')" detent="large" :show-close-button="true">
    <p v-if="(userStore.user?.friends?.length ?? 0) === 0" class="text-sm text-base-text-tertiary">
      {{ $t("group-invite-no-friends") }}
    </p>
    <p v-else-if="candidates.length === 0" class="text-sm text-base-text-tertiary">
      {{ $t("group-invite-empty") }}
    </p>

    <div v-else class="flex flex-col gap-1">
      <SelectableRow
        v-for="friend in candidates"
        :key="friend.friendUser.id"
        :selected="selected.has(friend.friendUser.id)"
        :disabled="friend.pending"
        :data-test="`invite-${friend.friendUser.id}`"
        @toggle="toggle(friend.friendUser.id)"
      >
        <Avatar
          aria-hidden="true"
          :images="[{ src: friend.friendUser.photo ?? null, alt: friend.friendUser.userName }]"
          size="xs"
        />
        <span class="flex min-w-0 flex-1 flex-col">
          <span :class="['truncate', LIST_ROW_TEXT.title]">
            {{ friend.remark || friend.friendUser.userName }}
          </span>
          <span v-if="friend.pending" :class="LIST_ROW_TEXT.subtitle">
            {{ $t("group-invite-pending") }}
          </span>
        </span>
      </SelectableRow>
    </div>

    <template #actions>
      <Notice v-if="sendFailed" tone="error" announce data-test="invite-error">
        <p>{{ $t("group-invite-error") }}</p>
      </Notice>

      <SButton variant="primary" size="xl" :disabled="selected.size === 0" :loading="sending" @click="send">
        {{ $t("group-invite-submit", { count: selected.size }) }}
      </SButton>
    </template>
  </Sheet>
</template>
