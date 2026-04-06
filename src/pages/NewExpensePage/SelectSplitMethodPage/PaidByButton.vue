<script setup lang="ts">
import { PhCaretDown } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref, watch } from "vue";

import Avatar from "@/components/Avatar/Avatar.vue";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import { useTransactionStore } from "@/stores/transaction";
import { useUserStore } from "@/stores/user";

// i18n
const { $t } = useFluent();

const transactionStore = useTransactionStore();
const userStore = useUserStore();

// Ensure that the paidBy is set to the current user if not already set
watch(
  () => userStore.user,
  (newValue) => {
    if (newValue && !transactionStore.paidBy) {
      transactionStore.paidBy = newValue.id;
    }
  },
  { immediate: true }
);

/**
 * Computed property to get the username of the user who paid for the transaction.
 *
 * - If the paidBy user is the current user, it returns "You".
 * - If the paidBy user is a friend, it returns the friend's remark or username.
 * - If the paidBy user is not found, it returns "???".
 * - If the paidBy user is not set, it returns '...'.
 */
const paidByUsername = computed(() => {
  if (!transactionStore.paidBy) return "...";

  if (transactionStore.paidBy === userStore.user?.id) {
    return $t("new-expense-pronoun-you");
  }

  const friend = userStore.user?.friends?.find((friend) => friend.friendUser.id === transactionStore.paidBy);
  if (friend) {
    return friend.remark ?? friend.friendUser.userName;
  }
  return "???";
});

// sheet related
/** Show sheet */
const showSheet = ref(false);

const setPaidBy = (memberId: string) => {
  transactionStore.paidBy = memberId;
  showSheet.value = false;
};
</script>

<template>
  <SButton size="sm" variant="secondary" color="brand" @click="showSheet = true">
    {{ $t("new-expense-split-paid-by", { username: paidByUsername }) }}
    <template #icon-right>
      <PhCaretDown />
    </template>
  </SButton>
  <Sheet v-model="showSheet" detent="medium">
    <div class="flex flex-col gap-4">
      <button
        v-for="member in transactionStore.members"
        :key="member.id"
        class="flex items-center gap-3"
        @click="setPaidBy(member.id)"
      >
        <Avatar :images="[{ src: member.photo, alt: member.userName }]" size="sm" />
        <div class="text-base font-semibold text-base-text-primary">{{ member.userName }}</div>
      </button>
    </div>
  </Sheet>
</template>
