<script setup lang="ts">
import { PhForkKnife, PhImageSquare, PhMapPin, PhPencil } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";

import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Layout from "@/components/Layout/Layout.vue";
import SButton from "@/components/SButton/SButton.vue";
import { useTransactionStore } from "@/stores/transaction";

import AddExpenseDetailsSheet from "./AddExpenseDetailsSheet.vue";
import BackgroundCheckCircle from "./BackgroundCheckCircle.svg";
import ColoredButton from "./ColoredButton.vue";
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
    console.error("Error saving transaction:", error);
    toast.error($t("new-expense-review-error-saving-transaction"));
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
              <SButton variant="primary" size="xxl" color="brand" :disabled="isSubmitting" @click="handleComplete">
                {{ $t("new-expense-review-actions-done") }}
              </SButton>
              <SButton variant="secondary" size="xxl" color="brand" @click="showDetailsSheet = true">
                {{ $t("new-expense-review-actions-add-details") }}
              </SButton>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <ColoredButton
                class="bg-util-color-clearblue-50 hover:bg-util-color-clearblue-100 active:bg-util-color-clearblue-200"
                @click="showDetailsSheet = true"
              >
                <template #icon>
                  <PhPencil class="text-util-color-clearblue-600" />
                </template>
                <template #label>
                  <span class="text-util-color-clearblue-700">{{ $t("new-expense-review-button-name") }}</span>
                </template>
              </ColoredButton>
              <ColoredButton
                class="bg-util-color-purple-50 hover:bg-util-color-purple-100 active:bg-util-color-purple-200"
                @click="showDetailsSheet = true"
              >
                <template #icon>
                  <PhForkKnife class="text-util-color-purple-600" />
                </template>
                <template #label>
                  <span class="text-util-color-purple-700">{{ $t("new-expense-review-button-category") }}</span>
                </template>
              </ColoredButton>
              <ColoredButton
                class="bg-util-color-leaf-50 hover:bg-util-color-leaf-100 active:bg-util-color-leaf-200"
                @click="showDetailsSheet = true"
              >
                <template #icon>
                  <PhMapPin class="text-util-color-leaf-600" />
                </template>
                <template #label>
                  <span class="text-util-color-leaf-700">{{ $t("new-expense-review-button-location") }}</span>
                </template>
              </ColoredButton>
              <ColoredButton
                class="bg-util-color-rosered-50 hover:bg-util-color-rosered-100 active:bg-util-color-rosered-200"
                @click="showDetailsSheet = true"
              >
                <template #icon>
                  <PhImageSquare class="text-util-color-rosered-600" />
                </template>
                <template #label>
                  <span class="text-util-color-rosered-700">{{ $t("new-expense-review-button-receipt") }}</span>
                </template>
              </ColoredButton>
            </div>
          </div>
        </div>
        <AddExpenseDetailsSheet v-model="showDetailsSheet" />
      </div>
    </template>
  </Layout>
</template>
