<script setup lang="ts">
import { useFluent } from "fluent-vue";

import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import { formatCurrency } from "@/libs/format-currency";
import { useInvoiceStore } from "@/stores/invoice";
import { useRouterHistoryStore } from "@/stores/routing-history";

import BackgroundCheckCircle from "../NewExpensePage/ReviewAndCompletePage/BackgroundCheckCircle.vue";

const { $t } = useFluent();
const routerHistoryStore = useRouterHistoryStore();
const invoiceStore = useInvoiceStore();

const invoice = invoiceStore.createdInvoice;

function handleDone() {
  invoiceStore.reset();
  routerHistoryStore.restoreSnapshot();
}
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true" :enable-close-button="true">
        <span class="text-base font-medium text-base-text-primary">{{ $t("settle-up-title") }}</span>
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-1 flex-col items-center px-4">
        <!-- Success Animation -->
        <div class="w-full max-w-xs py-4">
          <BackgroundCheckCircle />
        </div>

        <h2 class="text-display-xs font-semibold text-base-text-primary">
          {{ $t("settle-up-done-title") }}
        </h2>
        <p class="mt-1 text-sm text-base-text-quaternary">
          {{ $t("settle-up-done-subtitle") }}
        </p>

        <!-- Invoice Summary -->
        <div v-if="invoice" class="mt-6 flex w-full flex-col gap-3">
          <div v-if="invoice.name" class="text-center text-base font-medium text-base-text-primary">
            {{ invoice.name }}
          </div>
          <div class="flex flex-col gap-2 rounded-xl bg-base-bg-secondary px-4 py-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-base-text-quaternary">{{ $t("settle-up-transactions-count") }}</span>
              <span class="text-sm font-medium text-base-text-primary">
                {{ invoice.transactions?.length ?? 0 }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-base-text-quaternary">{{ $t("settle-up-total-amount") }}</span>
              <span class="text-sm font-medium text-base-text-primary">
                {{
                  formatCurrency(
                    (invoice.transactions ?? []).reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0),
                    invoice.currency
                  )
                }}
              </span>
            </div>
          </div>

          <!-- Debts -->
          <div v-if="invoice.debts && invoice.debts.length > 0" class="flex flex-col gap-2">
            <h3 class="text-sm font-medium text-base-text-secondary">{{ $t("settle-up-debts-title") }}</h3>
            <div
              v-for="(debt, index) in invoice.debts"
              :key="index"
              class="flex items-center justify-between rounded-xl bg-base-bg-secondary px-4 py-3"
            >
              <div class="flex flex-col">
                <span class="text-sm font-medium text-base-text-primary">
                  {{ debt.fromUser.userName }}
                </span>
                <span class="text-xs text-base-text-quaternary">
                  {{ $t("settle-up-owes", { name: debt.toUser.userName }) }}
                </span>
              </div>
              <span class="text-base font-semibold text-base-text-error">
                {{ formatCurrency(debt.amount, invoice.currency) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Done Button -->
        <div class="pb-safe w-full pb-4">
          <SButton variant="primary" color="brand" size="xxl" class="w-full" @click="handleDone">
            {{ $t("settle-up-done-button") }}
          </SButton>
        </div>
      </div>
    </template>
  </Layout>
</template>
