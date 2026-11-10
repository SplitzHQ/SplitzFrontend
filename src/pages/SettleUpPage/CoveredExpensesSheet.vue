<script setup lang="ts">
import { PhCaretLeft, PhLock } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, shallowRef, watch } from "vue";

import type { TransactionDto } from "@/backend";
import Avatar from "@/components/Avatar/Avatar.vue";
import { LIST_ROW_CLASS, LIST_ROW_TEXT } from "@/components/ListRow/list-row";
import SIconButton from "@/components/SButton/SIconButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import { balanceOf, findTransactionPayer } from "@/components/TransactionItem/transaction-row";
import TransactionItemContent from "@/components/TransactionItem/TransactionItemContent.vue";
import { formatCurrency } from "@/libs/format-currency";

/**
 * The second level of the start sheet: every expense that the new settle-up covers. A tap on an expense pushes its
 * detail into this sheet, with a back button, so no third sheet opens. The prototype `2026-11-09-settle-up-flow`
 * (SPZ-105) picked this as 4C.
 */
const { range, transactions } = defineProps<{
  transactions: TransactionDto[];
  /** The dates of the expenses, for example "Nov 1 – Nov 5". */
  range: string;
}>();

const open = defineModel<boolean>({ required: true });

const { $t } = useFluent();

const detail = shallowRef<TransactionDto | null>(null);
// A closed sheet starts again at the list.
watch(open, (value) => {
  if (!value) detail.value = null;
});

const sorted = computed(() =>
  [...transactions].sort((a, b) => new Date(b.transactionTime).getTime() - new Date(a.transactionTime).getTime())
);

const title = computed(() => detail.value?.name ?? $t("settle-up-expenses-title", { count: transactions.length }));

/** The line under the amount of the detail: the day and the payer. */
const paidBy = computed(() => {
  if (!detail.value) return "";
  const date = new Date(detail.value.transactionTime).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const payer = findTransactionPayer(detail.value.balances);
  return $t("settle-up-expense-paid-by", { date, name: payer?.userName ?? "" });
});

/**
 * The share of each person. A balance is the amount paid minus the share, and only the payer paid, so the share is the
 * paid amount minus the balance.
 */
const shares = computed(() => {
  const expense = detail.value;
  if (!expense) return [];
  const payer = findTransactionPayer(expense.balances);
  return (expense.balances ?? []).map((entry) => ({
    amount: (entry.userId === payer?.id ? Number(expense.amount) : 0) - balanceOf(entry),
    user: entry.user,
  }));
});
</script>

<template>
  <Sheet v-model="open" :label="title" detent="large" show-close-button>
    <!-- The title row holds the back button, so the sheet draws no title. A press on the row also drags the handle. -->
    <div data-sheet-handle class="flex touch-none items-center gap-2 pb-5">
      <SIconButton
        v-if="detail"
        class="-ml-2 shrink-0"
        variant="ghost"
        size="md"
        :aria-label="$t('settle-up-back')"
        data-test="covered-back"
        @click="detail = null"
      >
        <PhCaretLeft />
      </SIconButton>
      <div class="flex min-w-0 flex-col">
        <h2 class="truncate text-display-xs font-semibold text-base-text-primary">{{ title }}</h2>
        <p v-if="!detail" class="text-sm text-base-text-secondary">{{ range }}</p>
      </div>
    </div>

    <div v-if="detail" class="flex flex-col gap-5" data-test="covered-detail">
      <div class="flex flex-col">
        <p class="text-display-lg font-medium text-base-text-primary">
          {{ formatCurrency(detail.amount, detail.currency) }}
        </p>
        <p class="text-sm text-base-text-muted">{{ paidBy }}</p>
      </div>
      <section class="flex flex-col gap-1">
        <h3 class="text-sm font-semibold text-base-text-primary">{{ $t("settle-up-expense-split") }}</h3>
        <ul class="flex flex-col">
          <li v-for="share in shares" :key="share.user.id" class="flex items-center gap-3 py-2">
            <Avatar
              aria-hidden="true"
              class="shrink-0"
              :images="[{ alt: share.user.userName, src: share.user.photo ?? null }]"
              size="xs"
            />
            <span :class="['min-w-0 flex-1 truncate', LIST_ROW_TEXT.title]">{{ share.user.userName }}</span>
            <span class="shrink-0 text-sm font-medium text-base-text-secondary">
              {{ formatCurrency(share.amount, detail.currency) }}
            </span>
          </li>
        </ul>
      </section>
      <p class="flex items-center gap-2 text-sm text-base-text-muted">
        <PhLock class="shrink-0 icon-4" aria-hidden="true" />
        <span>{{ $t("settle-up-expense-will-lock") }}</span>
      </p>
    </div>

    <div v-else class="flex flex-col" data-test="covered-list">
      <button
        v-for="row in sorted"
        :key="row.transactionId"
        type="button"
        :class="[LIST_ROW_CLASS, 'focus-visible:outline-offset-2']"
        @click="detail = row"
      >
        <TransactionItemContent :transaction="row" />
      </button>
    </div>
  </Sheet>
</template>
