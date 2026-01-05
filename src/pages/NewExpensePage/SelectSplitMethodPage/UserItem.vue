<script setup lang="ts">
import { PhMinusCircle, PhPlusCircle } from "@phosphor-icons/vue";
import { computed } from "vue";

import Avatar from "@/components/Avatar/Avatar.vue";
import { useTransactionStore } from "@/stores/transaction";

import SplitDetailInput from "./SplitDetailInput.vue";

const { userId } = defineProps<{
  userId: string;
}>();

// transaction store
const transactionStore = useTransactionStore();

const user = computed(() => {
  return transactionStore.members.find((member) => member.id === userId);
});
const isInIncludedMembers = computed(() => {
  return transactionStore.includedMembersId.includes(userId);
});

const onPlusMinusButtonClick = () => {
  if (isInIncludedMembers.value) {
    transactionStore.removeFromIncludedMembers(userId);
  } else {
    transactionStore.addToIncludedMembers(userId);
  }
};
</script>

<template>
  <div v-if="user !== undefined" class="flex items-center justify-between gap-3 py-2">
    <div class="flex items-center gap-3">
      <div class="relative">
        <Avatar :images="[{ src: user.photo, alt: user.userName }]" size="sm" />
        <button class="absolute -right-1.5 -bottom-1.5 rounded-full bg-base-bg-primary" @click="onPlusMinusButtonClick">
          <PhMinusCircle v-if="isInIncludedMembers" class="text-xl text-base-fg-brand" />
          <PhPlusCircle v-else class="text-xl text-base-fg-brand" />
        </button>
      </div>
      <div class="flex flex-col gap-1">
        <div class="text-base font-semibold text-base-text-primary">
          {{ user.userName }}
        </div>
        <div
          v-if="
            transactionStore.splitMethod !== 'equally' &&
            transactionStore.splitMethod !== 'custom' &&
            isInIncludedMembers
          "
          class="text-sm font-normal text-base-text-primary"
        >
          {{
            transactionStore.finalSplitAmount[userId]?.toLocaleString(undefined, {
              style: "currency",
              currency: transactionStore.transaction.currency ?? "USD"
            })
          }}
        </div>
      </div>
    </div>
    <SplitDetailInput v-if="isInIncludedMembers" :user-id="userId" is-focused />
  </div>
</template>
