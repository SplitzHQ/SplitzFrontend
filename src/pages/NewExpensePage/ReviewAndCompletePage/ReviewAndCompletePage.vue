<script setup lang="ts">
import { PhCheck, PhForkKnife, PhImageSquare, PhMapPin, PhPencil } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import Notice from "@/components/Notice/Notice.vue";
import SButton from "@/components/SButton/SButton.vue";
import StatusBadge from "@/components/StatusBadge/StatusBadge.vue";
import { getCategory } from "@/libs/categories";
import { useRouterHistoryStore } from "@/stores/routing-history";
import { useTransactionStore } from "@/stores/transaction";

import AddExpenseDetailsSheet from "./AddExpenseDetailsSheet.vue";
import ColoredButton from "./ColoredButton.vue";
import GroupCard from "./GroupCard.vue";
import SelectCategorySheet from "./SelectCategorySheet.vue";
import TransactionInfoCard from "./TransactionInfoCard.vue";

const { $t } = useFluent();
const routerHistoryStore = useRouterHistoryStore();

const transactionStore = useTransactionStore();
const { receiptId, transaction } = storeToRefs(transactionStore);
const showDetailsSheet = ref(false);
const showCategorySheet = ref(false);
const isSubmitting = ref(false);
const saveFailed = ref(false);

const selectedCategory = computed({
  get: () => getCategory(transaction.value.icon),
  set: (next) => {
    transaction.value.icon = next;
  },
});

async function handleComplete() {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;
    saveFailed.value = false;
    await transactionStore.saveTransaction();
    // clean up transaction store after saving
    transactionStore.resetTransactionStore();
    // Navigate to home page after successful submission
    routerHistoryStore.restoreSnapshot();
  } catch (error) {
    console.error("Error saving transaction:", error);
    saveFailed.value = true;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true" :enable-close-button="true">
        {{ $t("new-expense-review-title") }}
      </HeaderMobileSecondary>
    </template>
    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-10">
        <div class="flex flex-col items-center gap-3">
          <StatusBadge tone="success"><PhCheck /></StatusBadge>
          <div class="text-base font-medium text-base-text-brand">{{ $t("new-expense-review-expense-added-to") }}</div>
          <GroupCard v-if="transaction.groupId" />
        </div>
        <div class="flex flex-col gap-10">
          <div class="flex flex-col gap-4">
            <Notice v-if="receiptId" tone="info" data-test="receipt-check">
              <p>{{ $t("new-expense-review-receipt-check") }}</p>
            </Notice>
            <TransactionInfoCard />
          </div>
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <Notice v-if="saveFailed" tone="error" announce data-test="save-expense-error">
                <p>{{ $t("new-expense-review-error-saving-transaction") }}</p>
              </Notice>
              <SButton variant="primary" size="xl" :disabled="isSubmitting" @click="handleComplete">
                {{ $t("new-expense-review-actions-done") }}
              </SButton>
              <SButton variant="secondary" size="xl" @click="showDetailsSheet = true">
                {{ $t("new-expense-review-actions-add-details") }}
              </SButton>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <ColoredButton
                class="bg-comp-palette-clearblue-fill hover:bg-comp-palette-clearblue-fill-hover active:bg-comp-palette-clearblue-fill-pressed"
                @click="showDetailsSheet = true"
              >
                <template #icon>
                  <PhPencil class="text-comp-palette-clearblue-icon" />
                </template>
                <template #label>
                  <span class="text-comp-palette-clearblue-label">{{ $t("new-expense-review-button-name") }}</span>
                </template>
              </ColoredButton>
              <ColoredButton
                class="bg-comp-palette-purple-fill hover:bg-comp-palette-purple-fill-hover active:bg-comp-palette-purple-fill-pressed"
                @click="showCategorySheet = true"
              >
                <template #icon>
                  <PhForkKnife class="text-comp-palette-purple-icon" />
                </template>
                <template #label>
                  <span class="text-comp-palette-purple-label">{{ $t("new-expense-review-button-category") }}</span>
                </template>
              </ColoredButton>
              <ColoredButton
                class="bg-comp-palette-leaf-fill hover:bg-comp-palette-leaf-fill-hover active:bg-comp-palette-leaf-fill-pressed"
                @click="showDetailsSheet = true"
              >
                <template #icon>
                  <PhMapPin class="text-comp-palette-leaf-icon" />
                </template>
                <template #label>
                  <span class="text-comp-palette-leaf-label">{{ $t("new-expense-review-button-location") }}</span>
                </template>
              </ColoredButton>
              <ColoredButton
                class="bg-comp-palette-rosered-fill hover:bg-comp-palette-rosered-fill-hover active:bg-comp-palette-rosered-fill-pressed"
                @click="showDetailsSheet = true"
              >
                <template #icon>
                  <PhImageSquare class="text-comp-palette-rosered-icon" />
                </template>
                <template #label>
                  <span class="text-comp-palette-rosered-label">{{ $t("new-expense-review-button-receipt") }}</span>
                </template>
              </ColoredButton>
            </div>
          </div>
        </div>
        <AddExpenseDetailsSheet v-model="showDetailsSheet" />
        <SelectCategorySheet v-model="showCategorySheet" v-model:category="selectedCategory" />
      </div>
    </template>
  </Layout>
</template>
