<script setup lang="ts">
import { PhGearSix, PhPlus } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
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
import GroupSettingsSheet from "./GroupSettingsSheet.vue";
import InviteFriendsSheet from "./InviteFriendsSheet.vue";
import InvoiceList from "./InvoiceList.vue";
import TransactionList from "./TransactionList.vue";

const { $t } = useFluent();
const route = useRoute();
const router = useRouter();
const routerHistoryStore = useRouterHistoryStore();
const userStore = useUserStore();

const groupId = computed(() => route.params.groupId as string);

const showSettings = ref(false);
const showInvite = ref(false);

const groupApi = new GroupApi(config);

const { state: groupQuery } = useQuery({
  key: () => ["getGroup", groupId.value],
  query: () => groupApi.getGroup({ groupId: groupId.value }),
});

const { state: transactionsQuery } = useQuery({
  key: () => ["getGroupTransactions", groupId.value],
  query: () => groupApi.getGroupTransactions({ groupId: groupId.value }),
});

const { state: invoicesQuery } = useQuery({
  key: () => ["getGroupInvoices", groupId.value],
  query: () => groupApi.getGroupInvoices({ groupId: groupId.value }),
});

const groupInvoices = computed(() => invoicesQuery.value.data ?? []);

const group = computed(() => groupQuery.value.data);
const transactions = computed(() => transactionsQuery.value.data ?? []);

const avatarImages = computed(() => {
  if (!group.value) return [];
  if (group.value.photo) {
    return [{ alt: group.value.name, src: group.value.photo }];
  }
  return group.value.members.slice(0, 4).map((m) => ({ alt: m.userName, src: m.photo ?? null }));
});

const balanceSummaries = computed(() => {
  const summaries = group.value?.balanceSummaries ?? [];
  if (summaries.length === 0) return [{ currency: "USD", memberBalances: [], totalBalance: "0" }];

  const nicknames = new Map(
    (userStore.user?.friends ?? []).map((friend) => [friend.friendUser.id, friend.remark?.trim()])
  );
  return summaries.map((summary) => ({
    ...summary,
    memberBalances: summary.memberBalances.map((member) => ({
      ...member,
      name: nicknames.get(member.userId) || member.name,
    })),
  }));
});

const tabs = computed(() => [
  $t("group-detail-tab-balances"),
  $t("group-detail-tab-trend"),
  $t("group-detail-tab-history"),
  $t("group-detail-tab-export"),
]);

const addExpense = () => {
  routerHistoryStore.takeSnapshot();
  void router.push({ name: "newExpense" });
};

const settleUp = () => {
  routerHistoryStore.takeSnapshot();
  void router.push({ name: "settleUp", params: { groupId: groupId.value } });
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
          <SIconButton
            variant="ghost"
            color="neutral"
            size="lg"
            :aria-label="$t('group-settings-title')"
            data-test="group-settings"
            @click="showSettings = true"
          >
            <PhGearSix />
          </SIconButton>
        </template>
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-1 flex-col gap-5 px-2">
        <!-- Balance Card -->
        <div class="flex flex-col gap-3">
          <template v-if="group">
            <BalanceCard
              v-for="summary in balanceSummaries"
              :key="summary.currency"
              :total-balance="summary.totalBalance"
              :currency="summary.currency"
              :member-balances="summary.memberBalances"
              @settle-up="settleUp"
            />
          </template>

          <!-- Tab Buttons -->
          <div class="flex gap-2">
            <SButton v-for="tab in tabs" :key="tab" variant="secondary" color="brand" size="xl">
              {{ tab }}
            </SButton>
          </div>
        </div>

        <!-- Invoices -->
        <InvoiceList :invoices="groupInvoices" />

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

  <GroupSettingsSheet v-model="showSettings" :group-id="groupId" @invite="showInvite = true" />
  <InviteFriendsSheet v-if="group" v-model="showInvite" :group="group" />
</template>
