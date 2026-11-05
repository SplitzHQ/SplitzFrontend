<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { formatCurrency } from "@/libs/format-currency";
import { useInvoiceStore } from "@/stores/invoice";

const { $t } = useFluent();
const route = useRoute();
const router = useRouter();
const invoiceStore = useInvoiceStore();

const groupId = route.params.groupId as string;
const isSubmitting = ref(false);
const createFailed = ref(false);

async function handleCreate() {
  if (isSubmitting.value) return;
  try {
    isSubmitting.value = true;
    createFailed.value = false;
    await invoiceStore.saveInvoice();
    void router.push({ name: "settleUpDone", params: { groupId } });
  } catch (error) {
    console.error("Error creating invoice:", error);
    createFailed.value = true;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary
        :enable-back-button="true"
        :enable-close-button="true"
        :fallback="{ name: 'groupDetail', params: { groupId } }"
      >
        <span class="flex items-center justify-between">
          <span>{{ $t("settle-up-title") }}</span>
          <span class="text-sm font-normal text-base-text-quaternary">{{
            $t("settle-up-step", { current: "2", total: "2" })
          }}</span>
        </span>
      </HeaderMobileSecondary>
    </template>

    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-1 flex-col gap-6">
        <!-- Invoice Name -->
        <TextInput
          id="invoice-name"
          v-model="invoiceStore.invoice.name"
          :label="$t('settle-up-invoice-name-label')"
          :placeholder="$t('settle-up-invoice-name-placeholder')"
        />

        <!-- Summary -->
        <div class="flex flex-col gap-3">
          <h3 class="text-sm font-medium text-base-text-secondary">{{ $t("settle-up-summary") }}</h3>
          <div class="flex flex-col gap-2 rounded-xl bg-base-bg-secondary px-4 py-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-normal text-base-text-quaternary">{{
                $t("settle-up-transactions-count")
              }}</span>
              <span class="text-sm font-medium text-base-text-primary">{{
                invoiceStore.selectedTransactionsCount
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-normal text-base-text-quaternary">{{ $t("settle-up-total-amount") }}</span>
              <span class="text-sm font-medium text-base-text-primary">
                {{ formatCurrency(invoiceStore.selectedTransactionsTotalAmount, invoiceStore.invoice.currency) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-normal text-base-text-quaternary">{{ $t("settle-up-currency-label") }}</span>
              <span class="text-sm font-medium text-base-text-primary">{{ invoiceStore.invoice.currency }}</span>
            </div>
          </div>
        </div>

        <!-- Selected Transactions -->
        <div class="flex flex-col gap-3">
          <h3 class="text-sm font-medium text-base-text-secondary">{{ $t("settle-up-selected-transactions") }}</h3>
          <div class="flex flex-col gap-1">
            <div
              v-for="tx in invoiceStore.selectedTransactions"
              :key="tx.transactionId"
              class="flex items-center justify-between rounded-lg px-3 py-2"
            >
              <span class="truncate text-sm text-base-text-primary">{{ tx.name }}</span>
              <span class="shrink-0 text-sm font-medium text-base-text-secondary">
                {{ formatCurrency(Number(tx.amount), tx.currency) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Create Button -->
        <div class="flex flex-col gap-3 pb-4">
          <Notice v-if="createFailed" tone="error" announce data-test="create-invoice-error">
            <p>{{ $t("settle-up-error-creating") }}</p>
          </Notice>
          <SButton variant="primary" size="xl" class="w-full" :loading="isSubmitting" @click="handleCreate">
            {{ $t("settle-up-create-invoice") }}
          </SButton>
        </div>
      </div>
    </template>
  </Layout>
</template>
