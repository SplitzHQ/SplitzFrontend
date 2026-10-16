<script setup lang="ts">
import NumberFlow, { type Format } from "@number-flow/vue";
import { PhArrowUpRight, PhCurrencyDollar, PhScan } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

import type { ReceiptRecognitionDto } from "@/backend";
import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Keyboard from "@/components/Keyboard/Keyboard.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import SLinkButton from "@/components/SButton/SLinkButton.vue";
import { useTransactionStore } from "@/stores/transaction";

import ScanReceiptSheet from "./ScanReceiptSheet.vue";

const { $t } = useFluent();
const transactionStore = useTransactionStore();
const { transaction, previewPhotoBase64, receiptRecognitionId } = storeToRefs(transactionStore);

const showScanSheet = ref(false);

// format amount as currency
const formatOptions = computed(
  (): Format => ({
    currency: transaction.value.currency ?? "USD",
    style: "currency",
  })
);
const formattedAmount = computed(() => {
  const amount = transaction.value.amount;
  return amount === null || amount === undefined ? "" : amount.toLocaleString(undefined, formatOptions.value);
});

/** Copy the recognized fields into the draft and tell the user to check them. */
function handleRecognized(recognition: ReceiptRecognitionDto) {
  transactionStore.applyReceiptRecognition(recognition);
  toast.success($t("new-expense-scan-applied"));
}
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true" :enable-close-button="true">
        {{ $t("new-expense-title") }}
      </HeaderMobileSecondary>
    </template>
    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-4">
        <div class="flex grow flex-col items-center justify-center gap-6">
          <div
            :class="[
              'flex h-18 items-center font-medium',
              transaction.amount === 0 ? 'text-base-text-disabled' : 'text-base-text-primary',
            ]"
            :style="{ fontSize: `min(4.5rem, ${150 / formattedAmount.length}vw)` }"
          >
            <NumberFlow :value="transaction.amount!" :format="formatOptions" />
          </div>
          <div class="flex flex-wrap items-center justify-center gap-2">
            <SButton color="brand" variant="secondary" size="sm">
              <template #icon-left><PhCurrencyDollar /></template>
              {{ transaction.currency ?? "USD" }}
            </SButton>
            <SButton color="brand" variant="secondary" size="sm">
              <template #icon-left><PhArrowUpRight /></template>
              {{ $t("new-expense-frequency-one-time") }}
            </SButton>
            <SButton color="brand" variant="secondary" size="sm" data-test="scan-receipt" @click="showScanSheet = true">
              <template #icon-left><PhScan /></template>
              {{ $t("new-expense-scan-button") }}
            </SButton>
          </div>
          <Transition name="receipt-hint">
            <div
              v-if="receiptRecognitionId"
              class="flex items-center gap-2 rounded-full bg-util-alpha-black-5 py-1 pr-3 pl-1"
              data-test="scan-applied"
            >
              <img
                v-if="previewPhotoBase64"
                :src="previewPhotoBase64"
                alt=""
                class="size-7 rounded-full border border-base-border-primary object-cover"
              />
              <span class="text-xs text-base-text-tertiary">
                {{ $t("new-expense-scan-from-receipt", { name: transaction.name ?? "" }) }}
              </span>
            </div>
          </Transition>
        </div>
        <Keyboard v-model="transaction.amount" variant="ghost" :enable-calculator="true" />
        <div class="grid grid-cols-2 items-center gap-3 py-3">
          <SButton color="brand" variant="outline" size="xxl">{{ $t("new-expense-actions-skip") }}</SButton>
          <SLinkButton color="brand" variant="primary" size="xxl" href="/new-expense/select-people">
            {{ $t("new-expense-actions-next") }}
          </SLinkButton>
        </div>
        <ScanReceiptSheet v-model="showScanSheet" @recognized="handleRecognized" />
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.receipt-hint-enter-active,
.receipt-hint-leave-active {
  transition:
    transform 200ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 150ms ease;
}

.receipt-hint-enter-from,
.receipt-hint-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
