<script setup lang="ts">
import { PhGearSix, PhPlus } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { GroupApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import { useRouterHistoryStore } from "@/stores/routing-history";
import { useUserStore } from "@/stores/user";

import BalanceCard from "./BalanceCard.vue";
import TransactionList from "./TransactionList.vue";

const { $t } = useFluent();
const route = useRoute();
const router = useRouter();
const routerHistoryStore = useRouterHistoryStore();
const userStore = useUserStore();

const groupId = computed(() => route.params.groupId as string);

const groupApi = new GroupApi(config);

const { state: groupQuery } = useQuery({
  key: () => ["getGroup", groupId.value],
  query: () => groupApi.getGroup({ groupId: groupId.value })
});

const { state: transactionsQuery } = useQuery({
  key: () => ["getGroupTransactions", groupId.value],
  query: () => groupApi.getGroupTransactions({ groupId: groupId.value })
});

const group = computed(() => groupQuery.value.data);
const transactions = computed(() => transactionsQuery.value.data ?? []);

const avatarImages = computed(() => {
  if (!group.value) return [];
  if (group.value.photo) {
    return [{ src: group.value.photo, alt: group.value.name }];
  }
  return group.value.members.slice(0, 4).map((m) => ({ src: m.photo ?? null, alt: m.userName }));
});

const totalBalance = computed(() => {
  if (!group.value) return 0;
  return group.value.balances
    .filter((b) => b.user.id === userStore.user?.id)
    .reduce((sum, b) => sum + Number.parseFloat(b.balance), 0);
});

const currency = computed(() => {
  if (!group.value) return "USD";
  const myBalance = group.value.balances.find((b) => b.user.id === userStore.user?.id);
  return myBalance?.currency ?? "USD";
});

const memberBalances = computed(() => {
  if (!group.value) return [];
  // Get all members except the current user, and find their balance
  return group.value.balances
    .filter((b) => b.user.id !== userStore.user?.id && b.balance !== "0")
    .map((b) => ({
      name: b.user.userName,
      // Other member's positive balance means they owe money (which the user is owed)
      // We negate it to match our convention: negative = they owe you, positive = you owe them
      amount: -Number.parseFloat(b.balance),
      currency: b.currency
    }));
});

const tabs = computed(() => [
  $t("group-detail-tab-balances"),
  $t("group-detail-tab-trend"),
  $t("group-detail-tab-history"),
  $t("group-detail-tab-export")
]);

const addExpense = () => {
  routerHistoryStore.takeSnapshot();
  void router.push({ name: "newExpense" });
};
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true">
        <div v-if="group" class="flex items-center justify-center gap-2">
          <Avatar :images="avatarImages" size="xs" />
          <p class="text-base font-medium text-base-text-primary">{{ group.name }}</p>
        </div>
        <template #right>
          <SIconButton variant="ghost" color="neutral" size="lg">
            <PhGearSix />
          </SIconButton>
        </template>
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-1 flex-col gap-5 px-2">
        <!-- Balance Card -->
        <div class="flex flex-col gap-3">
          <BalanceCard
            v-if="group"
            :total-balance="totalBalance"
            :currency="currency"
            :member-balances="memberBalances"
          />

          <!-- Tab Buttons -->
          <div class="flex gap-2">
            <SButton v-for="tab in tabs" :key="tab" variant="secondary" color="brand" size="xl">
              {{ tab }}
            </SButton>
          </div>
        </div>

        <!-- Transaction List -->
        <TransactionList :transactions="transactions" />

        <!-- Loading State -->
        <div v-if="groupQuery.status === 'pending'" class="px-4 pt-6 text-base text-base-text-tertiary">
          {{ $t("group-detail-loading") }}
        </div>

        <!-- Error State -->
        <div v-if="groupQuery.status === 'error'" class="px-4 pt-6 text-base text-base-text-error">
          {{ $t("group-detail-error") }}
        </div>

        <!-- FAB -->
        <SIconButton
          variant="primary"
          color="brand"
          size="xxl"
          class="fixed right-5 bottom-12 z-10"
          @click="addExpense"
        >
          <PhPlus />
        </SIconButton>
      </div>
    </template>
  </Layout>
</template>
