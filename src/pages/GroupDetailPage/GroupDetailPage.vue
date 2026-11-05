<script setup lang="ts">
import { PhGearSix, PhPlus } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref, useTemplateRef } from "vue";
import { useRoute, useRouter } from "vue-router";

import { GroupApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import SSegmentControl from "@/components/SSegmentControl/SSegmentControl.vue";
import { getGroupAvatarImages } from "@/libs/group-avatar";
import { CONTENT_FADE_IN, useLoadFeedback, type LoadPhase } from "@/libs/use-load-feedback";
import { useRouterHistoryStore } from "@/stores/routing-history";
import { useUserStore } from "@/stores/user";

import BalanceCard from "./BalanceCard.vue";
import BalanceCardSkeleton from "./BalanceCardSkeleton.vue";
import GroupSettingsSheet from "./GroupSettingsSheet.vue";
import InviteFriendsSheet from "./InviteFriendsSheet.vue";
import InvoiceList from "./InvoiceList.vue";
import TransactionList from "./TransactionList.vue";
import TransactionListSkeleton from "./TransactionListSkeleton.vue";

const { $t } = useFluent();
const route = useRoute();
const router = useRouter();
const routerHistoryStore = useRouterHistoryStore();
const userStore = useUserStore();

const groupId = computed(() => route.params.groupId as string);

const showSettings = ref(false);
const showInvite = ref(false);

const groupApi = new GroupApi(config);

const groupRequest = useQuery({
  key: () => ["getGroup", groupId.value],
  query: () => groupApi.getGroup({ groupId: groupId.value }),
});

const transactionsRequest = useQuery({
  key: () => ["getGroupTransactions", groupId.value],
  query: () => groupApi.getGroupTransactions({ groupId: groupId.value }),
});

const invoicesRequest = useQuery({
  key: () => ["getGroupInvoices", groupId.value],
  query: () => groupApi.getGroupInvoices({ groupId: groupId.value }),
});

const requests = [groupRequest, transactionsRequest, invoicesRequest];

const groupInvoices = computed(() => invoicesRequest.state.value.data ?? []);

const group = computed(() => groupRequest.state.value.data);
const transactions = computed(() => transactionsRequest.state.value.data ?? []);

/** True when a request failed and has no data. A failed refresh keeps the old data, and the page shows that data. */
function hasFailed(request: (typeof requests)[number]) {
  const { data, status } = request.state.value;
  return status === "error" && data === undefined;
}

const groupFailed = computed(() => hasFailed(groupRequest));
const transactionsFailed = computed(() => hasFailed(transactionsRequest));
const invoicesFailed = computed(() => hasFailed(invoicesRequest));
const loadFailed = computed(() => groupFailed.value || transactionsFailed.value || invoicesFailed.value);

const groupPending = computed(() => groupRequest.state.value.status === "pending");
const listsPending = computed(
  () => transactionsRequest.state.value.status === "pending" || invoicesRequest.state.value.status === "pending"
);
const isRetrying = computed(() =>
  requests.some((request) => hasFailed(request) && request.asyncStatus.value === "loading")
);

const loadPhase = computed<LoadPhase>(() => {
  if (groupPending.value || listsPending.value || isRetrying.value) return "loading";
  return loadFailed.value ? "failed" : "ready";
});

/** The message of the notice. A failed group request hides the lists, so its message covers all of the page. */
const loadErrorMessage = computed(() => {
  if (groupFailed.value) return $t("group-detail-error");
  if (transactionsFailed.value && invoicesFailed.value) return $t("group-detail-error-lists");
  return transactionsFailed.value ? $t("group-detail-error-transactions") : $t("group-detail-error-invoices");
});

const content = useTemplateRef<HTMLElement>("content");
const { announcement, retry } = useLoadFeedback({
  content,
  messages: {
    failed: () => loadErrorMessage.value,
    loaded: () => $t("group-detail-status-loaded"),
    loading: () => $t("group-detail-status-loading"),
  },
  phase: loadPhase,
});

/** Requests again only what failed, so the data that loaded stays on the page. */
const retryFailedRequests = () =>
  retry(() => Promise.all(requests.filter((request) => hasFailed(request)).map((request) => request.refetch())));

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
        <p role="status" class="sr-only">{{ announcement }}</p>

        <!-- A successful retry removes the button that had the focus, so the focus moves to this block. -->
        <div ref="content" tabindex="-1" class="flex flex-col gap-5 outline-none">
          <Transition v-bind="CONTENT_FADE_IN">
            <div v-if="!groupFailed" class="flex flex-col gap-3">
              <!-- Balance Card -->
              <Transition v-bind="CONTENT_FADE_IN">
                <BalanceCardSkeleton v-if="groupPending" />
                <div v-else-if="group" class="flex flex-col gap-3">
                  <BalanceCard
                    v-for="summary in balanceSummaries"
                    :key="summary.currency"
                    :total-balance="summary.totalBalance"
                    :currency="summary.currency"
                    :member-balances="summary.memberBalances"
                    @settle-up="settleUp"
                  />
                </div>
              </Transition>

              <!-- Tabs -->
              <SSegmentControl v-model="activeTab" size="md" :label="$t('group-detail-tabs-label')" :items="tabs" />
            </div>
          </Transition>

          <!-- Error State -->
          <Notice v-if="loadFailed" tone="error" announce data-test="group-detail-load-error">
            <p>{{ loadErrorMessage }}</p>
            <template #action>
              <SButton variant="outline" size="sm" :loading="isRetrying" @click="retryFailedRequests">
                {{ $t("group-detail-error-retry") }}
              </SButton>
            </template>
          </Notice>

          <Transition v-bind="CONTENT_FADE_IN">
            <TransactionListSkeleton v-if="listsPending && !groupFailed" />
            <div v-else-if="!groupFailed" class="flex flex-col gap-5">
              <!-- Invoices -->
              <InvoiceList :invoices="groupInvoices" />

              <!-- Transaction List -->
              <TransactionList :transactions="transactions" />
            </div>
          </Transition>
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
