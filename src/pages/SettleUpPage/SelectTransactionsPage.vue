<script setup lang="ts">
import { PhCheckCircle, PhCircle } from "@phosphor-icons/vue";
import { useQuery } from "@pinia/colada";
import { useFluent } from "fluent-vue";
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { GroupApi } from "@/backend";
import config from "@/backend/config";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import { formatCurrency } from "@/libs/format-currency";
import { useInvoiceStore } from "@/stores/invoice";

import SelectableTransactionItem from "./SelectableTransactionItem.vue";

const { $t } = useFluent();
const route = useRoute();
const router = useRouter();
const invoiceStore = useInvoiceStore();

const groupId = computed(() => route.params.groupId as string);

const groupApi = new GroupApi(config);

const { state: transactionsQuery } = useQuery({
  key: () => ["getGroupTransactions", groupId.value],
  query: () => groupApi.getGroupTransactions({ groupId: groupId.value }),
});

watch(
  () => transactionsQuery.value.data,
  (txs) => {
    if (txs && invoiceStore.transactions.length === 0) {
      invoiceStore.transactions = txs;
      const available = txs.filter((tx) => !tx.invoiceId && tx.transactionId);
      invoiceStore.invoice = {
        currency: available[0]?.currency ?? "USD",
        groupId: groupId.value,
        name: undefined,
        transactionIds: available.map((tx) => tx.transactionId!),
      };
      invoiceStore.createdInvoice = null;
    }
  },
  { immediate: true }
);

interface TransactionGroup {
  date: string;
  label: string;
  transactions: typeof invoiceStore.availableTransactions;
}

const groupedTransactions = computed<TransactionGroup[]>(() => {
  const sorted = [...invoiceStore.availableTransactions].sort(
    (a, b) => new Date(b.transactionTime).getTime() - new Date(a.transactionTime).getTime()
  );

  const groups = new Map<string, typeof sorted>();
  for (const tx of sorted) {
    const date = new Date(tx.transactionTime);
    const key = `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const existing = groups.get(key);
    if (existing) {
      existing.push(tx);
    } else {
      groups.set(key, [tx]);
    }
  }

  return [...groups.entries()].map(([key, txs]) => {
    const date = new Date(txs[0]!.transactionTime);
    const label = date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
    return { date: key, label, transactions: txs };
  });
});

const handleNext = () => {
  void router.push({ name: "settleUpConfirmDetails", params: { groupId: groupId.value } });
};
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true" :enable-close-button="true">
        <div class="flex items-center justify-between">
          <span class="text-base font-medium text-base-text-primary">{{ $t("settle-up-title") }}</span>
          <span class="text-sm text-base-text-quaternary">{{
            $t("settle-up-step", { current: "1", total: "2" })
          }}</span>
        </div>
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-1 flex-col px-2">
        <p class="px-2 pb-4 text-sm text-base-text-quaternary">
          {{ $t("settle-up-select-instruction") }}
        </p>

        <!-- Transaction List -->
        <div class="flex flex-1 flex-col gap-3 overflow-y-auto pb-28">
          <div v-for="group in groupedTransactions" :key="group.date" class="flex flex-col gap-1">
            <p class="px-2 text-sm font-semibold text-base-text-primary">{{ group.label }}</p>
            <SelectableTransactionItem
              v-for="tx in group.transactions"
              :key="tx.transactionId"
              :transaction="tx"
              :selected="!!tx.transactionId && invoiceStore.invoice.transactionIds.includes(tx.transactionId)"
              @toggle="tx.transactionId && invoiceStore.toggleTransaction(tx.transactionId)"
            />
          </div>

          <!-- Empty State -->
          <div
            v-if="invoiceStore.availableTransactions.length === 0 && transactionsQuery.status !== 'pending'"
            class="flex flex-1 items-center justify-center"
          >
            <p class="text-base text-base-text-tertiary">{{ $t("settle-up-no-transactions") }}</p>
          </div>
        </div>

        <!-- Bottom Action Bar -->
        <div
          class="pb-safe fixed right-0 bottom-0 left-0 z-sticky flex items-center gap-3 bg-base-bg-primary px-4 py-3"
        >
          <!-- Select All -->
          <button
            type="button"
            class="flex shrink-0 items-center gap-1.5"
            @click="invoiceStore.toggleSelectAllTransactions()"
          >
            <PhCheckCircle
              v-if="invoiceStore.isAllTransactionsSelected"
              weight="fill"
              class="size-5 text-util-color-success-600"
            />
            <PhCircle v-else class="size-5 text-base-text-quaternary" />
            <span class="text-sm font-medium text-base-text-secondary">{{ $t("settle-up-select-all") }}</span>
          </button>

          <div class="flex flex-1 items-center justify-end gap-3">
            <!-- Count and Total -->
            <div class="flex flex-col items-end">
              <span class="text-xs text-base-text-quaternary">
                {{ $t("settle-up-selected-count", { count: String(invoiceStore.selectedTransactionsCount) }) }}
              </span>
              <span class="text-base font-semibold text-base-text-primary">
                {{ $t("settle-up-total") }}
                <span class="text-util-color-success-600">
                  {{ formatCurrency(invoiceStore.selectedTransactionsTotalAmount, invoiceStore.invoice.currency) }}
                </span>
              </span>
            </div>

            <!-- Next Button -->
            <SButton
              variant="primary"
              color="brand"
              size="xl"
              :disabled="invoiceStore.selectedTransactionsCount === 0"
              @click="handleNext"
            >
              {{ $t("settle-up-next") }}
            </SButton>
          </div>
        </div>
      </div>
    </template>
  </Layout>
</template>
