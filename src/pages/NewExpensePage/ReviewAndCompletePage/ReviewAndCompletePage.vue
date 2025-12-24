<script setup lang="ts">
import { PhForkKnife, PhImageSquare, PhMapPin, PhPencil } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";

import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import { useTransactionStore } from "@/stores/transaction";

import AddExpenseDetailsSheet from "./AddExpenseDetailsSheet.vue";
import BackgroundCheckCircle from "./BackgroundCheckCircle.svg";
import GroupCard from "./GroupCard.vue";
import TransactionInfoCard from "./TransactionInfoCard.vue";

const { $t } = useFluent();
const router = useRouter();
const transactionStore = useTransactionStore();
const { transaction } = storeToRefs(transactionStore);
const showDetailsSheet = ref(false);
const isSubmitting = ref(false);
const bgUrl = `url("${BackgroundCheckCircle}")`;

async function handleComplete() {
  if (isSubmitting.value) return;
  
  try {
    isSubmitting.value = true;
    await transactionStore.saveTransaction();
    // Navigate to home page after successful submission
    await router.push("/");
  } catch (error) {
    console.error("Failed to save transaction:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to save transaction, please try again";
    alert(errorMessage);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true">
        {{ $t("new-expense-review-title") }}
      </HeaderMobileSecondary>
    </template>
    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col">
        <div
          class="bg-center bg-no-repeat bg-cover w-full self-center max-w-lg aspect-square flex flex-col gap-3 justify-end items-center -translate-y-10"
          :style="{ backgroundImage: bgUrl }"
        >
          <div class="text-base-text-brand text-base font-medium">{{ $t("new-expense-review-expense-added-to") }}</div>
          <GroupCard v-if="transaction.groupId" />
        </div>
        <div class="flex flex-col gap-10">
          <TransactionInfoCard />
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <SButton
                variant="primary"
                size="xxl"
                color="brand"
                :disabled="isSubmitting"
                @click="handleComplete"
              >
                {{ $t("new-expense-review-actions-done") }}
              </SButton>
              <SButton variant="secondary" size="xxl" color="brand" @click="showDetailsSheet = true">
                {{ $t("new-expense-review-actions-add-details") }}
              </SButton>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                :class="[
                  'p-3 rounded-xl flex items-center gap-3 cursor-pointer',
                  'bg-util-color-clearblue-50 hover:bg-util-color-clearblue-100 active:bg-util-color-clearblue-200'
                ]"
              >
                <PhPencil class="text-util-color-clearblue-600 text-xl" />
                <span class="text-util-color-clearblue-700 text-sm font-medium">
                  {{ $t("new-expense-review-button-name") }}
                </span>
              </button>
              <button
                type="button"
                :class="[
                  'p-3 rounded-xl flex items-center gap-3 cursor-pointer',
                  'bg-util-color-purple-50 hover:bg-util-color-purple-100 active:bg-util-color-purple-200'
                ]"
              >
                <PhForkKnife class="text-util-color-purple-600 text-xl" />
                <span class="text-util-color-purple-700 text-sm font-medium">
                  {{ $t("new-expense-review-button-category") }}
                </span>
              </button>
              <button
                type="button"
                :class="[
                  'p-3 rounded-xl flex items-center gap-3 cursor-pointer',
                  'bg-util-color-leaf-50 hover:bg-util-color-leaf-100 active:bg-util-color-leaf-200'
                ]"
              >
                <PhMapPin class="text-util-color-leaf-600 text-xl" />
                <span class="text-util-color-leaf-700 text-sm font-medium">
                  {{ $t("new-expense-review-button-location") }}
                </span>
              </button>
              <button
                type="button"
                :class="[
                  'p-3 rounded-xl flex items-center gap-3 cursor-pointer',
                  'bg-util-color-rosered-50 hover:bg-util-color-rosered-100 active:bg-util-color-rosered-200'
                ]"
              >
                <PhImageSquare class="text-util-color-rosered-600 text-xl" />
                <span class="text-util-color-rosered-700 text-sm font-medium">
                  {{ $t("new-expense-review-button-receipt") }}
                </span>
              </button>
            </div>
          </div>
        </div>
        <AddExpenseDetailsSheet v-model="showDetailsSheet" />
      </div>
    </template>
  </Layout>
</template>
