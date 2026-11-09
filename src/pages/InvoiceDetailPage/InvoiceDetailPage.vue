<script setup lang="ts">
import { PhArrowCounterClockwise, PhCheck, PhFileText } from "@phosphor-icons/vue";
import { useQuery, useQueryCache } from "@pinia/colada";
import { Big } from "big.js";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { toast } from "vue-sonner";

import { GroupApi, InvoiceApi, type InvoiceDebtDto, InvoiceStatus, type SplitzUserReducedDto } from "@/backend";
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

import MarkPaidSheet from "./MarkPaidSheet.vue";

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

/** Format an invoice amount in its currency. */
const money = (amount: number | string | Big) => formatCurrency(amount.toString(), invoice.value?.currency ?? "USD");

const totalAmount = computed(() =>
  (invoice.value?.transactions ?? []).reduce((sum, tx) => sum.plus(Math.abs(Number(tx.amount))), new Big(0))
);

const debts = computed(() => invoice.value?.debts ?? []);

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

/** Choose the debt color from its remaining amount and the current user. */
function debtAmountClass(debt: InvoiceDebtDto): string {
  if (Number(debt.remaining) === 0) return "text-base-text-quaternary line-through";
  if (debt.fromUser.id === myId.value) return "text-base-text-error";
  if (debt.toUser.id === myId.value) return "text-base-text-success";
  return "text-base-text-primary";
}

/** Refetch the invoice and the group list so the status pill there stays in sync. */
async function refreshInvoice() {
  await Promise.all([
    queryCache.invalidateQueries({ key: ["getInvoice", invoiceId.value] }),
    queryCache.invalidateQueries({ key: ["getGroupInvoices", groupId.value] }),
  ]);
}

const showMarkPaidSheet = ref(false);
const pendingDebt = ref<InvoiceDebtDto | null>(null);

/** Open the payment sheet for the selected debt. */
function openMarkPaid(debt: InvoiceDebtDto) {
  pendingDebt.value = debt;
  showMarkPaidSheet.value = true;
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
      <HeaderMobileSecondary :enable-back-button="true" :fallback="{ name: 'groupDetail', params: { groupId } }">
        <span v-if="group" class="flex items-center gap-2">
          <Avatar aria-hidden="true" class="shrink-0" :images="avatarImages" size="title" />
          <span class="min-w-0">{{ group.name }}</span>
        </span>
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-1 flex-col gap-5 pb-8">
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
            <p class="text-center text-display-sm font-semibold text-base-text-primary">
              {{ invoice.name || $t("group-detail-invoice-unnamed") }}
            </p>
            <InvoiceStatusPill :status="invoice.status" />
            <p class="text-display-md font-bold text-base-text-primary tabular-nums">{{ money(totalAmount) }}</p>
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
                v-for="debt in debts"
                :key="`${debt.fromUser.id}-${debt.toUser.id}`"
                class="flex items-center gap-3 rounded-xl py-2"
                data-test="invoice-debt"
              >
                <Avatar
                  aria-hidden="true"
                  :images="[{ alt: debt.fromUser.userName, src: debt.fromUser.photo ?? null }]"
                  size="xs"
                />
                <div class="flex min-w-0 flex-1 flex-col">
                  <p class="truncate text-base font-medium text-base-text-primary">
                    {{ pairLabel(debt.fromUser, debt.toUser, "debt") }}
                  </p>
                  <p class="text-sm tabular-nums" :class="debtAmountClass(debt)">
                    {{ money(debt.amount) }}
                  </p>
                  <p
                    v-if="Number(debt.paid) > 0 && Number(debt.remaining) > 0"
                    class="text-xs text-base-text-quaternary tabular-nums"
                  >
                    {{ $t("invoice-detail-debt-remaining", { amount: money(debt.remaining) }) }}
                  </p>
                </div>
                <Transition name="swap" mode="out-in">
                  <span
                    v-if="Number(debt.remaining) === 0"
                    key="paid"
                    class="flex shrink-0 items-center gap-1 rounded-full bg-util-color-success-50 px-2.5 py-1 text-xs font-medium text-util-color-success-700"
                  >
                    <PhCheck weight="bold" aria-hidden="true" />
                    {{ $t("invoice-detail-debt-paid") }}
                  </span>
                  <SButton
                    v-else
                    key="mark"
                    variant="outline"
                    size="sm"
                    class="shrink-0"
                    data-test="mark-paid"
                    @click="openMarkPaid(debt)"
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
                  size="sm"
                  :loading="undoingPaymentId === payment.invoiceSettlementId"
                  :disabled="undoingPaymentId !== null && undoingPaymentId !== payment.invoiceSettlementId"
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

      <MarkPaidSheet v-model="showMarkPaidSheet" :pendingDebt="pendingDebt" />
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
