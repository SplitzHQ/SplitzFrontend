<script setup lang="ts">
import { useElementSize } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";

import HeaderMobileSecondary from "@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue";
import Keyboard from "@/components/Keyboard/Keyboard.vue";
import Layout from "@/components/Layout/Layout.vue";
import SLinkButton from "@/components/SButton/SLinkButton.vue";
import { useTransactionStore } from "@/stores/transaction";

import PaidByButton from "./PaidByButton.vue";
import SplitMethodButton from "./SplitMethodButton.vue";
import UserItem from "./UserItem.vue";
import { useKeyboardControl } from "./use-keyboard-control";

// i18n
const { $t } = useFluent();

// transaction store
const transactionStore = useTransactionStore();
const { keyboardValue, focusedInputUserId, setFocusedInputUserId } = useKeyboardControl();

// Handle click outside to close the keyboard
const handleClickOutside = () => {
  if (focusedInputUserId.value) {
    setFocusedInputUserId(null);
  }
};
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// get header's height to adjust the layout
const headerHeight = ref(0);
onMounted(() => {
  const headerElement = document.querySelector("header");
  if (headerElement) {
    headerHeight.value = headerElement.clientHeight;
  }
});

// get keyboard's height to adjust the layout
const keyboardContainer = useTemplateRef("keyboardContainer");
const { height: keyboardHeight } = useElementSize(keyboardContainer);

// async state for submit button
// const { state } = useAsyncState(async () => {
//   await transactionStore.saveTransaction()
// })
</script>

<template>
  <Layout class="h-dvh">
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true" :enable-close-button="true">
        {{ $t("new-expense-split-title") }}
      </HeaderMobileSecondary>
    </template>
    <template #default="layoutAttrs">
      <div class="flex grow flex-col" :style="{ height: `calc(100% - ${headerHeight}px)` }">
        <div v-bind="layoutAttrs" class="relative flex grow flex-col gap-4 overflow-y-auto">
          <div class="flex grow flex-col gap-4 pb-4">
            <div class="flex items-center gap-4">
              <PaidByButton />
              <div class="h-6 w-px bg-base-border-secondary" />
              <SplitMethodButton />
            </div>
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <div class="text-sm font-medium text-base-text-tertiary">
                  {{ $t("new-expense-split-summary-included", { count: transactionStore.includedMembersId.length }) }}
                </div>
                <div class="flex items-start justify-start gap-1">
                  <div class="justify-start text-sm leading-tight font-medium text-base-text-quaternary">
                    {{ $t("new-expense-split-summary-total-amount") }}
                  </div>
                  <div class="justify-start text-sm leading-tight font-medium text-base-text-primary">
                    {{
                      transactionStore.transaction.amount?.toLocaleString(undefined, {
                        style: "currency",
                        currency: transactionStore.transaction.currency ?? "USD"
                      })
                    }}
                  </div>
                  <div
                    v-if="!transactionStore.isUserInputValid"
                    class="justify-start text-sm leading-tight font-medium text-base-text-error"
                    role="alert"
                    aria-live="polite"
                  >
                    {{ $t("new-expense-split-validation-invalid-input") }}
                  </div>
                </div>
              </div>
              <UserItem v-for="memberId in transactionStore.includedMembersId" :key="memberId" :user-id="memberId" />
            </div>
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <div class="text-sm font-medium text-base-text-tertiary">
                  {{
                    $t("new-expense-split-summary-not-included", { count: transactionStore.excludedMembersId.length })
                  }}
                </div>
              </div>
              <UserItem v-for="memberId in transactionStore.excludedMembersId" :key="memberId" :user-id="memberId" />
            </div>
          </div>
          <div class="sticky bottom-4 z-sticky">
            <SLinkButton
              :disabled="!transactionStore.isUserInputValid"
              color="brand"
              variant="primary"
              size="xxl"
              class="w-full"
              href="/new-expense/review-and-complete"
            >
              {{ $t("new-expense-split-actions-complete") }}
            </SLinkButton>
          </div>
        </div>
        <div class="shrink-0" :style="{ height: `${keyboardHeight ?? 0}px` }" />
        <Teleport to="body">
          <div ref="keyboardContainer" class="fixed inset-x-0 bottom-0 z-fixed">
            <Transition name="slide-fade">
              <div v-if="focusedInputUserId" class="-mt-4" @click.stop>
                <Keyboard v-model="keyboardValue" class="px-4 pb-4" variant="primary" enable-calculator />
              </div>
            </Transition>
          </div>
        </Teleport>
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
  transform-origin: bottom;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
