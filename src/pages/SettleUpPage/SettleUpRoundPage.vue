<script setup lang="ts">
import { useQuery, useQueryCache } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, shallowRef, useTemplateRef } from "vue";
import { useRoute, useRouter } from "vue-router";

import { InvoiceApi } from "@/backend";
import config from "@/backend/config";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import TransactionItem from "@/components/TransactionItem/TransactionItem.vue";
import { formatCurrency } from "@/libs/format-currency";
import reportError from "@/libs/report-error";
import { CONTENT_FADE_IN, useLoadFeedback, type LoadPhase } from "@/libs/use-load-feedback";
import { useUserStore } from "@/stores/user";

import RoundProgress from "./RoundProgress.vue";
import { canCancel, dateRange, isActive, roundProgress, roundTransfers, type RoundTransfer } from "./settle-up-round";
import TransferRow from "./TransferRow.vue";

/**
 * One settle-up round: the transfers with their state and the button of the current user, and the expenses that the
 * round covers. Group pages open it from the round line at the top and from the round row of the list. In the backend
 * the round is an invoice, so the route has its ID.
 */
const { $t } = useFluent();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const queryCache = useQueryCache();
const invoiceApi = new InvoiceApi(config);

const groupId = computed(() => route.params.groupId as string);
const invoiceId = computed(() => route.params.invoiceId as string);
const groupRoute = computed(() => ({ name: "groupDetail", params: { groupId: groupId.value } }));
const userId = computed(() => userStore.user?.id);

const roundRequest = useQuery({
  key: () => ["getInvoice", invoiceId.value],
  query: () => invoiceApi.getInvoice({ id: invoiceId.value }),
});

const round = computed(() => roundRequest.state.value.data);
const transfers = computed(() => (round.value ? roundTransfers(round.value) : []));
const progress = computed(() => roundProgress(transfers.value));
const active = computed(() => (round.value ? isActive(round.value) : false));
const expenses = computed(() =>
  [...(round.value?.transactions ?? [])].sort(
    (a, b) => new Date(b.transactionTime).getTime() - new Date(a.transactionTime).getTime()
  )
);
const cancellable = computed(() => active.value && !!round.value && canCancel([round.value], userId.value));

const formatDay = (date: Date) => new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short" });
const title = computed(() =>
  round.value ? $t("settle-up-round-title", { date: formatDay(round.value.createTime) }) : $t("settle-up-round-settled")
);
const range = computed(() => {
  const dates = dateRange(expenses.value);
  if (!dates) return "";
  const first = formatDay(dates.first);
  const last = formatDay(dates.last);
  return first === last ? first : `${first} – ${last}`;
});

const failed = computed(() => roundRequest.state.value.status === "error" && round.value === undefined);
const loadPhase = computed<LoadPhase>(() => {
  if (roundRequest.state.value.status === "pending" || roundRequest.asyncStatus.value === "loading") return "loading";
  return failed.value ? "failed" : "ready";
});
const content = useTemplateRef<HTMLElement>("content");
const { announcement, retry } = useLoadFeedback({
  content,
  messages: {
    failed: () => $t("settle-up-error"),
    loaded: () => $t("settle-up-status-loaded"),
    loading: () => $t("settle-up-status-loading"),
  },
  phase: loadPhase,
});

/** Loads the round again, and the group data that a payment or a cancel changes. */
async function refresh() {
  await Promise.all([
    queryCache.invalidateQueries({ key: ["getInvoice", invoiceId.value] }),
    queryCache.invalidateQueries({ key: ["getGroupInvoices", groupId.value] }),
    queryCache.invalidateQueries({ key: ["getGroupRounds", groupId.value] }),
    queryCache.invalidateQueries({ key: ["getGroupTransactions", groupId.value] }),
    queryCache.invalidateQueries({ key: ["getGroup", groupId.value] }),
  ]);
}

/** The transfer of the open sheet, and which sheet it is. */
const sheet = shallowRef<{ kind: "markPaid" | "confirm"; transfer: RoundTransfer } | null>(null);
const sheetOpen = computed({
  get: () => sheet.value !== null,
  set: (value) => {
    if (!value && !saving.value) sheet.value = null;
  },
});
const showCancel = shallowRef(false);
const saving = shallowRef(false);
const saveFailed = shallowRef(false);

function openSheet(kind: "markPaid" | "confirm", transfer: RoundTransfer) {
  saveFailed.value = false;
  sheet.value = { kind, transfer };
}

/** Runs one change of the round, then loads the data again. A failure keeps the sheet open with a notice. */
async function save(change: () => Promise<unknown>, after: () => void) {
  if (saving.value) return;
  saving.value = true;
  saveFailed.value = false;
  try {
    await change();
    after();
  } catch (error) {
    reportError("settle-up", error);
    saveFailed.value = true;
  } finally {
    saving.value = false;
    await refresh();
  }
}

/** The payer marks the rest of the transfer as paid. The payment then waits for the receiver. */
const markPaid = (transfer: RoundTransfer) =>
  save(
    () =>
      invoiceApi.addSettlement({
        id: transfer.invoiceId,
        invoiceSettlementInputDto: {
          amount: transfer.remaining,
          fromUserId: transfer.from.id,
          toUserId: transfer.to.id,
        },
      }),
    () => (sheet.value = null)
  );

/** The receiver answers a payment that waits: confirmed, or not received. */
const answer = (transfer: RoundTransfer, received: boolean) =>
  save(
    () => {
      const request = { id: transfer.invoiceId, settlementId: transfer.pending!.invoiceSettlementId };
      return received ? invoiceApi.confirmSettlement(request) : invoiceApi.rejectSettlement(request);
    },
    () => (sheet.value = null)
  );

/** Deletes the round. Its expenses go back to the list of the group. */
const cancelRound = () =>
  save(
    () => invoiceApi.deleteInvoice({ id: invoiceId.value }),
    () => {
      showCancel.value = false;
      void router.replace(groupRoute.value);
    }
  );

const sheetAmount = computed(() =>
  sheet.value ? formatCurrency(sheet.value.transfer.remaining, sheet.value.transfer.currency) : ""
);
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true" :fallback="groupRoute">
        {{ title }}
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-1 flex-col gap-5">
        <p role="status" class="sr-only">{{ announcement }}</p>

        <Notice v-if="failed" tone="error" announce data-test="settle-up-load-error">
          <p>{{ $t("settle-up-error") }}</p>
          <template #action>
            <SButton
              variant="outline"
              size="sm"
              :loading="loadPhase === 'loading'"
              @click="retry(() => roundRequest.refetch())"
            >
              {{ $t("settle-up-retry") }}
            </SButton>
          </template>
        </Notice>

        <Transition v-bind="CONTENT_FADE_IN">
          <div v-if="round" ref="content" tabindex="-1" class="flex flex-1 flex-col gap-5 outline-none">
            <section class="flex flex-col gap-3 rounded-2xl bg-base-bg-secondary p-4" data-test="settle-up-round">
              <RoundProgress
                :active="active"
                :done="progress.done"
                :total="progress.total"
                :started="formatDay(round.createTime)"
                :count="expenses.length"
              />
              <ul class="flex flex-col">
                <TransferRow
                  v-for="transfer in transfers"
                  :key="`${transfer.from.id}-${transfer.to.id}`"
                  :from="transfer.from"
                  :to="transfer.to"
                  :amount="transfer.amount"
                  :currency="transfer.currency"
                  :user-id="userId"
                  :state="transfer.state"
                  @mark-paid="openSheet('markPaid', transfer)"
                  @confirm="openSheet('confirm', transfer)"
                />
              </ul>
            </section>

            <!-- The expenses that the round covers. They are locked, and each row opens its detail. -->
            <section class="flex flex-col gap-1">
              <h2 class="text-sm font-semibold text-base-text-primary">
                {{ $t("settle-up-expenses-title", { count: expenses.length }) }} · {{ range }}
              </h2>
              <div class="flex flex-col">
                <TransactionItem v-for="row in expenses" :key="row.transactionId" :transaction="row" />
              </div>
            </section>

            <div v-if="cancellable" class="mt-auto flex flex-col pt-4">
              <SButton variant="destructive-soft" size="xl" data-test="settle-up-cancel" @click="showCancel = true">
                {{ $t("settle-up-cancel") }}
              </SButton>
            </div>
          </div>
        </Transition>
      </div>
    </template>
  </Layout>

  <!-- The payer marks a transfer paid, or the receiver answers a payment. -->
  <Sheet
    v-model="sheetOpen"
    :title="
      sheet?.kind === 'confirm'
        ? $t('settle-up-confirm-title', { name: sheet.transfer.from.userName })
        : $t('settle-up-mark-paid-title', { amount: sheetAmount })
    "
    :description="
      sheet?.kind === 'confirm'
        ? $t('settle-up-confirm-description', { amount: sheetAmount, name: sheet.transfer.from.userName })
        : $t('settle-up-mark-paid-description', { name: sheet?.transfer.to.userName ?? '' })
    "
    detent="medium"
  >
    <template #actions>
      <Notice v-if="saveFailed" tone="error" announce data-test="settle-up-save-error">
        <p>{{ sheet?.kind === "confirm" ? $t("settle-up-confirm-error") : $t("settle-up-mark-paid-error") }}</p>
      </Notice>
      <template v-if="sheet?.kind === 'confirm'">
        <SButton
          variant="primary"
          size="xl"
          :loading="saving"
          data-test="settle-up-confirm-submit"
          @click="answer(sheet.transfer, true)"
        >
          {{ $t("settle-up-confirm-submit", { amount: sheetAmount }) }}
        </SButton>
        <SButton variant="secondary" size="xl" :disabled="saving" @click="answer(sheet.transfer, false)">
          {{ $t("settle-up-confirm-reject") }}
        </SButton>
      </template>
      <template v-else-if="sheet">
        <SButton
          variant="primary"
          size="xl"
          :loading="saving"
          data-test="settle-up-mark-paid-submit"
          @click="markPaid(sheet.transfer)"
        >
          {{ $t("settle-up-mark-paid") }}
        </SButton>
        <SButton variant="secondary" size="xl" :disabled="saving" @click="sheet = null">
          {{ $t("settle-up-mark-paid-cancel") }}
        </SButton>
      </template>
    </template>
  </Sheet>

  <Sheet
    v-model="showCancel"
    :title="$t('settle-up-cancel-title')"
    :description="$t('settle-up-cancel-description')"
    detent="medium"
  >
    <template #actions>
      <Notice v-if="saveFailed" tone="error" announce>
        <p>{{ $t("settle-up-cancel-error") }}</p>
      </Notice>
      <SButton
        variant="destructive"
        size="xl"
        :loading="saving"
        data-test="settle-up-cancel-submit"
        @click="cancelRound"
      >
        {{ $t("settle-up-cancel") }}
      </SButton>
      <SButton variant="secondary" size="xl" :disabled="saving" @click="showCancel = false">
        {{ $t("settle-up-cancel-keep") }}
      </SButton>
    </template>
  </Sheet>
</template>
