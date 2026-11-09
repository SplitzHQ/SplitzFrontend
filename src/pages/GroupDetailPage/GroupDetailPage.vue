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
import SIconButton from "@/components/SButton/SIconButton.vue";
import SSegmentControl from "@/components/SSegmentControl/SSegmentControl.vue";
import { getGroupAvatarImages } from "@/libs/group-avatar";
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

const avatarImages = computed(() => getGroupAvatarImages(group.value));

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

/** The selected tab. The tabs do not change the content yet. */
const activeTab = ref(0);
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
        <span v-if="group" class="flex items-center gap-2">
          <Avatar aria-hidden="true" class="shrink-0" :images="avatarImages" size="xs" />
          <span class="min-w-0">{{ group.name }}</span>
        </span>
        <template #right>
          <SIconButton
            variant="ghost"
            size="md"
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
      <div v-bind="layoutAttrs" class="flex flex-1 flex-col gap-5">
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

          <!-- Tabs -->
          <SSegmentControl
            v-model="activeTab"
            size="md"
            :aria-label="$t('group-detail-tabs-label')"
            :items="tabs"
            class="self-start"
          />
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
          size="xl"
          class="fixed right-safe-5 bottom-safe-12 z-10"
          :aria-label="$t('new-expense-title')"
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
