<script setup lang="ts">
import { PhGearSix, PhPlus, PhReceipt } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, ref, useTemplateRef } from "vue";
import { useRoute, useRouter } from "vue-router";

import { GroupApi, InvoiceApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import EmptyState from "@/components/EmptyState/EmptyState.vue";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import SSegmentControl from "@/components/SSegmentControl/SSegmentControl.vue";
import { getGroupAvatarImages } from "@/libs/group-avatar";
import { CONTENT_FADE_IN, useLoadFeedback, type LoadPhase } from "@/libs/use-load-feedback";
import { isActive, nextAction, roundProgress, roundTransfers } from "@/pages/SettleUpPage/settle-up-round";
import StartSettleUpSheet from "@/pages/SettleUpPage/StartSettleUpSheet.vue";
import { useRouterHistoryStore } from "@/stores/routing-history";
import { useUserStore } from "@/stores/user";

import BalanceCard from "./BalanceCard.vue";
import BalanceCardSkeleton from "./BalanceCardSkeleton.vue";
import GroupSettingsSheet from "./GroupSettingsSheet.vue";
import InviteFriendsSheet from "./InviteFriendsSheet.vue";
import RoundBar from "./RoundBar.vue";
import TransactionList, { type TimelineRound } from "./TransactionList.vue";
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
const invoiceApi = new InvoiceApi(config);

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

/** The settle-up rounds of the group. The backend keeps each round as an invoice, one for each currency (SPZ-105). */
const groupInvoices = computed(() => invoicesRequest.state.value.data ?? []);
const activeIds = computed(() => groupInvoices.value.filter(isActive).map((invoice) => invoice.invoiceId));

/** The transfers of the running round. The list of invoices has no transfers, so this loads each running one. */
const activeRoundsRequest = useQuery({
  enabled: () => activeIds.value.length > 0,
  key: () => ["getGroupRounds", groupId.value, ...activeIds.value],
  query: () => Promise.all(activeIds.value.map((id) => invoiceApi.getInvoice({ id }))),
});
const activeRounds = computed(() => (activeIds.value.length > 0 ? (activeRoundsRequest.state.value.data ?? []) : []));
const activeTransfers = computed(() => activeRounds.value.flatMap((round) => roundTransfers(round)));

/** The page of a round. */
const roundRoute = (invoiceId: string) => ({ name: "settleUpRound", params: { groupId: groupId.value, invoiceId } });

/** The round of the top line: the one that needs the current user, or else the first one. */
const barRoute = computed(() => {
  const action = nextAction(activeTransfers.value, userStore.user?.id);
  return roundRoute(action?.transfer.invoiceId ?? activeIds.value[0] ?? "");
});

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
/** True when both lists loaded and the group has no expense and no settle-up yet. */
const listsEmpty = computed(
  () =>
    transactionsRequest.state.value.status === "success" &&
    invoicesRequest.state.value.status === "success" &&
    transactions.value.length === 0 &&
    groupInvoices.value.length === 0
);

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
  const photos = new Map((group.value?.members ?? []).map((member) => [member.id, member.photo]));
  return summaries.map((summary) => ({
    ...summary,
    memberBalances: summary.memberBalances.map((member) => ({
      ...member,
      name: nicknames.get(member.userId) || member.name,
      photo: photos.get(member.userId),
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

/** One row for each round in the list, on the day that it started. */
const timelineRounds = computed<TimelineRound[]>(() =>
  groupInvoices.value.map((invoice) => {
    const day = new Date(invoice.createTime).toLocaleDateString(undefined, { day: "numeric", month: "short" });
    const base = { id: invoice.invoiceId, time: invoice.createTime, to: roundRoute(invoice.invoiceId) };
    if (!isActive(invoice)) {
      const count = transactions.value.filter((transaction) => transaction.invoiceId === invoice.invoiceId).length;
      return {
        ...base,
        done: true,
        subtitle: $t("settle-up-round-summary", { count, date: day }),
        title: $t("settle-up-round-settled"),
      };
    }
    const round = activeRounds.value.find((item) => item.invoiceId === invoice.invoiceId);
    const transfers = round ? roundTransfers(round) : [];
    const action = nextAction(transfers, userStore.user?.id);
    const progress = $t("settle-up-round-progress", roundProgress(transfers));
    let next = $t("settle-up-next-none");
    if (action?.kind === "confirm") next = $t("settle-up-next-confirm", { name: action.transfer.from.userName });
    if (action?.kind === "pay") next = $t("settle-up-next-pay", { name: action.transfer.to.userName });
    return {
      ...base,
      done: false,
      subtitle: round ? `${progress} · ${next}` : $t("settle-up-round-in-progress"),
      title: $t("settle-up-round-in-progress"),
    };
  })
);

const showStart = ref(false);

const addExpense = () => {
  routerHistoryStore.takeSnapshot();
  void router.push({ name: "newExpense" });
};

const settleUp = () => {
  showStart.value = true;
};
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true">
        <span v-if="group" class="flex items-center gap-2">
          <Avatar aria-hidden="true" class="shrink-0" :images="avatarImages" size="title" />
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

        <!--
          A successful retry removes the button that had the focus, so the focus moves to this block.
          The tabs control the lists, so they sit closer to the lists than to the balance cards: the gap above the tabs
          is larger than the gap below them (SPZ-81).
        -->
        <div ref="content" tabindex="-1" class="flex flex-col gap-5 outline-none">
          <!-- Balance Card -->
          <Transition v-bind="CONTENT_FADE_IN">
            <BalanceCardSkeleton v-if="groupPending" />
            <div v-else-if="group" class="flex flex-col gap-3">
              <!-- The running round stays at the top of the page, and the list also has its row (flow F, SPZ-105). -->
              <RoundBar
                v-if="activeTransfers.length > 0"
                :transfers="activeTransfers"
                :user-id="userStore.user?.id"
                :to="barRoute"
              />
              <BalanceCard
                v-for="summary in balanceSummaries"
                :key="summary.currency"
                :total-balance="summary.totalBalance"
                :currency="summary.currency"
                :member-balances="summary.memberBalances"
                :can-settle="activeIds.length === 0"
                @settle-up="settleUp"
              />
            </div>
          </Transition>

          <div class="flex flex-col gap-4">
            <!-- Tabs -->
            <Transition v-bind="CONTENT_FADE_IN">
              <SSegmentControl
                v-if="!groupFailed"
                v-model="activeTab"
                size="md"
                :label="$t('group-detail-tabs-label')"
                :items="tabs"
              />
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
              <!-- No button: the + button of the page records the first expense, and the description names it. -->
              <EmptyState
                v-else-if="!groupFailed && listsEmpty"
                :icon="PhReceipt"
                :title="$t('group-detail-empty-title')"
                :description="$t('group-detail-empty-description')"
              />
              <TransactionList v-else-if="!groupFailed" :transactions="transactions" :rounds="timelineRounds" />
            </Transition>
          </div>
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
  <StartSettleUpSheet v-model="showStart" :group-id="groupId" :transactions="transactions" />
</template>
