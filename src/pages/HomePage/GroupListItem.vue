<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { computed } from "vue";
import { useRouter } from "vue-router";

import type { GroupDto } from "@/backend";
import Avatar from "@/components/Avatar/Avatar.vue";
import { formatCurrency } from "@/libs/format-currency";
import { useUserStore } from "@/stores/user";

export interface GroupListItemProps {
  group: GroupDto;
}

const { group } = defineProps<GroupListItemProps>();

const { $t } = useFluent();
const router = useRouter();
const userStore = useUserStore();

/** The current user's balance in each currency of the group. */
const myBalances = computed(() =>
  group.balances
    .filter((b) => b.user.id === userStore.user?.id)
    .map((b) => ({ ...b, amount: Number.parseFloat(b.balance) }))
);
const myBalanceNegative = computed(() => myBalances.value.filter((b) => b.amount < 0));
const myBalancePositive = computed(() => myBalances.value.filter((b) => b.amount > 0));
const myBalanceSettled = computed(() => myBalances.value.every((b) => b.amount === 0));
const groupSettled = computed(() => group.balances.every((b) => b.balance === "0"));
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 py-2 text-left"
    @click="router.push({ name: 'groupDetail', params: { groupId: group.groupId } })"
  >
    <Avatar v-if="group.photo" size="lg" :images="[{ src: group.photo, alt: group.name }]" />
    <Avatar
      v-else
      size="lg"
      :images="group.members.slice(0, 4).map((m) => ({ src: m.photo ?? null, alt: m.userName }))"
    />

    <div class="min-w-0 flex-1">
      <p class="truncate text-base font-semibold text-base-text-primary">
        {{ group.name }}
      </p>

      <div class="mt-1 flex items-center gap-1 text-sm font-medium">
        <template v-if="myBalancePositive.length > 0">
          <span class="text-base-text-quinary">{{ $t("home-you-lent") }}</span>
          <span v-for="balance in myBalancePositive" :key="balance.currency" class="text-util-color-success-600">
            {{ formatCurrency(balance.amount, balance.currency) }}
          </span>
        </template>
        <template v-if="myBalanceNegative.length > 0">
          <span class="text-base-text-quinary">{{ $t("home-you-owe") }}</span>
          <span v-for="balance in myBalanceNegative" :key="balance.currency" class="text-base-text-error">
            {{ formatCurrency(balance.amount, balance.currency) }}
          </span>
        </template>
        <span v-if="groupSettled" class="text-core-alpha-brand-80">
          {{ $t("home-all-settled-up") }}
        </span>
        <span v-else-if="myBalanceSettled" class="text-core-alpha-brand-80">
          {{ $t("home-you-are-settled-up") }}
        </span>
      </div>
    </div>
  </button>
</template>
