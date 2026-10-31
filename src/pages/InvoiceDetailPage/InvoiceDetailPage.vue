<script setup lang="ts">
import { PhArrowCounterClockwise, PhCheck, PhFileText, PhX } from "@phosphor-icons/vue";
import { useQuery, useQueryCache } from "@pinia/colada";
import { Big } from "big.js";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { toast } from "vue-sonner";

import { GroupApi, InvoiceApi, InvoiceStatus, type SplitzUserReducedDto } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import InvoiceStatusPill from "@/components/InvoiceStatusPill/InvoiceStatusPill.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import SIconButton from "@/components/SButton/SIconButton.vue";
import TransactionItem from "@/components/TransactionItem/TransactionItem.vue";
import { formatCurrency } from "@/libs/format-currency";
import { getGroupAvatarImages } from "@/libs/group-avatar";
import { useUserStore } from "@/stores/user";

import { type DebtProgress, getDebtProgress } from "./invoice-debts";
import MarkPaidSheet, { type PendingPayment } from "./MarkPaidSheet.vue";

const { $t } = useFluent();
const route = useRoute();
const userStore = useUserStore();
const queryCache = useQueryCache();

const groupId = computed(() => route.params.groupId as string);
const invoiceId = computed(() => route.params.invoiceId as string);

const invoiceApi = new InvoiceApi(config);
const groupApi = new GroupApi(config);

const { state: invoiceQuery } = useQuery({
  key: () => ["getInvoice", invoiceId.value],
  query: () => invoiceApi.getInvoice({ id: invoiceId.value }),
});

const { state: groupQuery } = useQuery({
  key: () => ["getGroup", groupId.value],
  query: () => groupApi.getGroup({ groupId: groupId.value }),
});

const invoice = computed(() => invoiceQuery.value.data);
const group = computed(() => groupQuery.value.data);
const avatarImages = computed(() => getGroupAvatarImages(group.value));

const myId = computed(() => userStore.user?.id);
const isSettled = computed(() => invoice.value?.status === InvoiceStatus.Settled);

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const money = (amount: Big | string) => formatCurrency(amount.toString(), invoice.value?.currency ?? "USD");

const displayName = (user: SplitzUserReducedDto) =>
  user.id === myId.value ? $t("new-expense-pronoun-you") : user.userName;

const totalAmount = computed(() =>
  (invoice.value?.transactions ?? []).reduce((sum, tx) => sum.plus(new Big(tx.amount).abs()), new Big(0))
);

const debts = computed(() => getDebtProgress(invoice.value?.debts ?? [], invoice.value?.settlements ?? []));

// Newest payment first, so a payment the user just recorded shows at the top.
const payments = computed(() =>
  [...(invoice.value?.settlements ?? [])].sort(
    (a, b) => new Date(b.recordedTime).getTime() - new Date(a.recordedTime).getTime()
  )
);

/** Fluent selector value, so a message can say "you" instead of the current user's name. */
const who = (user: SplitzUserReducedDto) => (user.id === myId.value ? "you" : "other");

const pairMessages = {
  debt: {
    between: "invoice-detail-debt-between",
    toYou: "invoice-detail-debt-to-you",
    youTo: "invoice-detail-debt-you-to",
  },
  payment: {
    between: "invoice-detail-payment-between",
    toYou: "invoice-detail-payment-to-you",
    youTo: "invoice-detail-payment-you-to",
  },
} as const;

/** "You owe Bob", "Bob owes you", or "Ann owes Bob". Payments use the same pattern with "paid". */
function pairLabel(fromUser: SplitzUserReducedDto, toUser: SplitzUserReducedDto, kind: "debt" | "payment"): string {
  const messages = pairMessages[kind];
  if (fromUser.id === myId.value) {
    return $t(messages.youTo, { name: toUser.userName });
  }
  if (toUser.id === myId.value) {
    return $t(messages.toYou, { name: fromUser.userName });
  }
  return $t(messages.between, { from: fromUser.userName, to: toUser.userName });
}

function debtAmountClass(progress: DebtProgress): string {
  if (progress.remaining.eq(0)) return "text-base-text-quaternary line-through";
  if (progress.debt.fromUser.id === myId.value) return "text-base-text-error";
  if (progress.debt.toUser.id === myId.value) return "text-util-color-success-600";
  return "text-base-text-primary";
}

/** Refetch the invoice and the group list so the status pill there stays in sync. */
async function refreshInvoice() {
  await Promise.all([
    queryCache.invalidateQueries({ key: ["getInvoice", invoiceId.value] }),
    queryCache.invalidateQueries({ key: ["getGroupInvoices", groupId.value] }),
  ]);
}

// Mark as paid
const showMarkPaidSheet = ref(false);
const isMarkingPaid = ref(false);
const pendingDebt = ref<DebtProgress | null>(null);

const pendingPayment = computed<PendingPayment | null>(() => {
  if (!pendingDebt.value) return null;
  return {
    amountLabel: money(pendingDebt.value.remaining),
    fromUser: pendingDebt.value.debt.fromUser,
    toUser: pendingDebt.value.debt.toUser,
  };
});

function openMarkPaid(progress: DebtProgress) {
  pendingDebt.value = progress;
  showMarkPaidSheet.value = true;
}

async function confirmMarkPaid() {
  if (isMarkingPaid.value || !pendingDebt.value) return;
  const { debt, remaining } = pendingDebt.value;
  try {
    isMarkingPaid.value = true;
    // Pay the exact remaining amount, so the backend sees this debt as fully covered.
    await invoiceApi.addSettlement({
      id: invoiceId.value,
      invoiceSettlementInputDto: {
        amount: remaining.toString(),
        fromUserId: debt.fromUser.id,
        toUserId: debt.toUser.id,
      },
    });
    await refreshInvoice();
    showMarkPaidSheet.value = false;
  } catch (error) {
    console.error("Error marking debt as paid:", error);
    toast.error($t("invoice-detail-mark-paid-error"));
  } finally {
    isMarkingPaid.value = false;
  }
}

// Undo payment
const undoingPaymentId = ref<string | null>(null);

async function undoPayment(settlementId: string) {
  if (undoingPaymentId.value) return;
  try {
    undoingPaymentId.value = settlementId;
    await invoiceApi.deleteSettlement({ id: invoiceId.value, settlementId });
    await refreshInvoice();
  } catch (error) {
    console.error("Error undoing payment:", error);
    toast.error($t("invoice-detail-undo-error"));
  } finally {
    undoingPaymentId.value = null;
  }
}
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true">
        <div v-if="group" class="flex items-center justify-center gap-2">
          <Avatar :images="avatarImages" size="xs" />
          <p class="text-base font-medium text-base-text-primary">{{ group.name }}</p>
        </div>
        <!-- Add an invisible close button to make sure the header layout remains consistent -->
        <template #right>
          <SIconButton variant="ghost" color="neutral" size="lg" class="pointer-events-none">
            <PhX class="text-transparent" />
          </SIconButton>
        </template>
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-1 flex-col gap-5 px-4 pb-8">
        <!-- Loading -->
        <div v-if="invoiceQuery.status === 'pending'" class="pt-6 text-base text-base-text-tertiary">
          {{ $t("invoice-detail-loading") }}
        </div>

        <!-- Error -->
        <div v-else-if="invoiceQuery.status === 'error'" class="pt-6 text-base text-base-text-error">
          {{ $t("invoice-detail-error") }}
        </div>

        <!-- Content -->
        <template v-else-if="invoice">
          <!-- Summary -->
          <div class="flex flex-col items-center gap-3 pt-4">
            <div
              class="flex size-16 items-center justify-center rounded-2xl transition-colors duration-200"
              :class="isSettled ? 'bg-util-color-success-50' : 'bg-util-color-yellow-50'"
            >
              <PhFileText
                class="icon-8 transition-colors duration-200"
                :class="isSettled ? 'text-util-color-success-600' : 'text-util-color-yellow-600'"
              />
            </div>
            <p class="text-2xl text-center font-semibold text-base-text-primary">
              {{ invoice.name || $t("group-detail-invoice-unnamed") }}
            </p>
            <InvoiceStatusPill :status="invoice.status" />
            <p class="text-3xl font-bold text-base-text-primary tabular-nums">{{ money(totalAmount) }}</p>
            <p class="text-sm text-base-text-quaternary">
              {{
                $t("invoice-detail-created-by", {
                  date: formatDate(invoice.createTime),
                  name: invoice.createdBy.userName,
                  who: who(invoice.createdBy),
                })
              }}
            </p>
          </div>

          <!-- Balances to settle -->
          <section class="flex flex-col gap-2">
            <h2 class="text-sm font-semibold text-base-text-primary">{{ $t("invoice-detail-debts-title") }}</h2>
            <p
              v-if="debts.length === 0"
              class="rounded-2xl bg-base-bg-secondary p-4 text-center text-sm text-base-text-quaternary"
            >
              {{ $t("invoice-detail-debts-empty") }}
            </p>
            <ul v-else class="flex flex-col gap-1 rounded-2xl bg-base-bg-secondary p-3">
              <li
                v-for="progress in debts"
                :key="`${progress.debt.fromUser.id}-${progress.debt.toUser.id}`"
                class="flex items-center gap-3 rounded-xl py-2"
                data-test="invoice-debt"
              >
                <Avatar
                  :images="[{ alt: progress.debt.fromUser.userName, src: progress.debt.fromUser.photo ?? null }]"
                  size="xs"
                />
                <div class="flex min-w-0 flex-1 flex-col">
                  <p class="truncate text-base font-medium text-base-text-primary">
                    {{ pairLabel(progress.debt.fromUser, progress.debt.toUser, "debt") }}
                  </p>
                  <p class="text-sm tabular-nums" :class="debtAmountClass(progress)">
                    {{ money(progress.debt.amount) }}
                  </p>
                  <p
                    v-if="progress.paid.gt(0) && progress.remaining.gt(0)"
                    class="text-xs text-base-text-quaternary tabular-nums"
                  >
                    {{ $t("invoice-detail-debt-remaining", { amount: money(progress.remaining) }) }}
                  </p>
                </div>
                <Transition name="swap" mode="out-in">
                  <span
                    v-if="progress.remaining.eq(0)"
                    key="paid"
                    class="flex shrink-0 items-center gap-1 rounded-full bg-util-color-success-50 px-2.5 py-1 text-xs font-medium text-util-color-success-700"
                  >
                    <PhCheck weight="bold" aria-hidden="true" />
                    {{ $t("invoice-detail-debt-paid") }}
                  </span>
                  <SButton
                    v-else
                    key="mark"
                    variant="secondary"
                    color="brand"
                    size="sm"
                    class="shrink-0"
                    data-test="mark-paid"
                    @click="openMarkPaid(progress)"
                  >
                    {{ $t("invoice-detail-mark-paid") }}
                  </SButton>
                </Transition>
              </li>
            </ul>
          </section>

          <!-- Payments -->
          <section v-if="payments.length > 0" class="flex flex-col gap-2">
            <h2 class="text-sm font-semibold text-base-text-primary">{{ $t("invoice-detail-payments-title") }}</h2>
            <TransitionGroup tag="ul" name="list" class="relative flex flex-col">
              <li
                v-for="payment in payments"
                :key="payment.invoiceSettlementId"
                class="flex items-center gap-3 py-2"
                data-test="invoice-payment"
              >
                <div class="flex min-w-0 flex-1 flex-col">
                  <p class="truncate text-base font-medium text-base-text-primary">
                    {{ pairLabel(payment.fromUser, payment.toUser, "payment") }}
                  </p>
                  <p class="truncate text-xs text-base-text-quaternary">
                    {{
                      $t("invoice-detail-payment-recorded-by", {
                        date: formatDate(payment.recordedTime),
                        name: payment.recordedBy.userName,
                        who: who(payment.recordedBy),
                      })
                    }}
                  </p>
                </div>
                <p class="shrink-0 text-sm font-medium text-base-text-primary tabular-nums">
                  {{ money(payment.amount) }}
                </p>
                <SIconButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  :loading="undoingPaymentId === payment.invoiceSettlementId"
                  :disabled="undoingPaymentId !== null"
                  :aria-label="$t('invoice-detail-undo')"
                  :title="$t('invoice-detail-undo')"
                  data-test="undo-payment"
                  @click="undoPayment(payment.invoiceSettlementId)"
                >
                  <PhArrowCounterClockwise />
                </SIconButton>
              </li>
            </TransitionGroup>
          </section>

          <!-- Included expenses -->
          <section v-if="invoice.transactions?.length" class="flex flex-col gap-1">
            <h2 class="text-sm font-semibold text-base-text-primary">{{ $t("invoice-detail-expenses-title") }}</h2>
            <TransactionItem v-for="tx in invoice.transactions" :key="tx.transactionId" :transaction="tx" />
          </section>
        </template>
      </div>

      <MarkPaidSheet
        v-model="showMarkPaidSheet"
        :payment="pendingPayment"
        :is-submitting="isMarkingPaid"
        :display-name="displayName"
        @confirm="confirmMarkPaid"
      />
    </template>
  </Layout>
</template>

<style scoped>
/* "Mark as paid" button swaps in place for the "Paid" badge, so the result shows on the row the user tapped. */
.swap-enter-active,
.swap-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s cubic-bezier(0.22, 1, 0.36, 1);
}

.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.2s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .swap-enter-active,
  .swap-leave-active,
  .list-move,
  .list-enter-active,
  .list-leave-active {
    transition: opacity 0.15s ease;
  }

  .swap-enter-from,
  .swap-leave-to,
  .list-enter-from,
  .list-leave-to {
    transform: none;
  }
}
</style>
