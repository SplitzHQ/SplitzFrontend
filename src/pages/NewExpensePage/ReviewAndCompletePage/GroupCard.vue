<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { storeToRefs } from "pinia";

import { GroupApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import { useTransactionStore } from "@/stores/transaction";

const transactionStore = useTransactionStore();
const { transaction } = storeToRefs(transactionStore);

const groupApi = new GroupApi(config);

function assertGroupId(groupId: string | null | undefined): asserts groupId is string {
  if (!groupId) {
    throw new Error("Transaction groupId is not set");
  }
}

assertGroupId(transaction.value.groupId);

const { data: group } = useQuery({
  key: ["getGroup", transaction.value.groupId],
  query: () => {
    assertGroupId(transaction.value.groupId);
    return groupApi.getGroup({ groupId: transaction.value.groupId });
  }
});
</script>

<template>
  <div
    v-if="group"
    class="flex flex-col items-start gap-2 rounded-2xl bg-util-color-brand-50 py-2 pr-3 pl-2 backdrop-blur-[2px]"
  >
    <div class="flex items-center gap-3">
      <Avatar size="xs" :images="group.members.map((member) => ({ src: member.photo, alt: member.userName }))" />
      <div class="flex flex-col items-start justify-center">
        <div class="flex items-center gap-2">
          <div class="text-base font-medium text-base-text-secondary">
            {{ group.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
