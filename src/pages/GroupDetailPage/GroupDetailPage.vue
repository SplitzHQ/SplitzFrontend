<script setup lang="ts">
import { PhArchive, PhGearSix, PhPlus } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { GroupApi } from "@/backend";
import config from "@/backend/config";
import ArchivedSection from "@/components/ArchivedSection/ArchivedSection.vue";
import Avatar from "@/components/Avatar/Avatar.vue";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import { partitionArchived } from "@/libs/archive";
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

// Archived items load too, so the page can show how many are hidden. The key keeps the default
// ["getGroupTransactions", groupId] prefix, so existing invalidations also refresh this query.
const { state: transactionsQuery } = useQuery({
  key: () => ["getGroupTransactions", groupId.value, { includeArchived: true }],
  query: () => groupApi.getGroupTransactions({ groupId: groupId.value, includeArchived: true }),
});

const { state: invoicesQuery } = useQuery({
  key: () => ["getGroupInvoices", groupId.value, { includeArchived: true }],
  query: () => groupApi.getGroupInvoices({ groupId: groupId.value, includeArchived: true }),
});

const invoices = computed(() => partitionArchived(invoicesQuery.value.data ?? []));
const transactions = computed(() => partitionArchived(transactionsQuery.value.data ?? []));
const archivedCount = computed(() => invoices.value.archived.length + transactions.value.archived.length);

const group = computed(() => groupQuery.value.data);
const isArchived = computed(() => group.value?.isArchived ?? false);

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
        <Notice v-if="isArchived" :title="$t('group-detail-archived-title')" data-test="group-archived-notice">
          <template #icon><PhArchive /></template>
          {{ $t("group-detail-archived-message") }}
        </Notice>

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
        <InvoiceList :invoices="invoices.active" />

        <!-- Transaction List -->
        <TransactionList :transactions="transactions.active" />

        <!-- Archived invoices and their expenses, hidden until the user opens them -->
        <ArchivedSection :count="archivedCount">
          <InvoiceList :invoices="invoices.archived" />
          <TransactionList :transactions="transactions.archived" />
        </ArchivedSection>

        <!-- Loading State -->
        <div v-if="groupQuery.status === 'pending'" class="px-4 pt-6 text-base text-base-text-tertiary">
          {{ $t("group-detail-loading") }}
        </div>

        <!-- Error State -->
        <div v-if="groupQuery.status === 'error'" class="px-4 pt-6 text-base text-base-text-error">
          {{ $t("group-detail-error") }}
        </div>

        <!-- FAB. An archived group takes no new expenses. -->
        <SIconButton
          v-if="!isArchived"
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

  <GroupSettingsSheet
    v-model="showSettings"
    :group-id="groupId"
    :is-archived="isArchived"
    @invite="showInvite = true"
  />
  <InviteFriendsSheet v-if="group" v-model="showInvite" :group="group" />
</template>
