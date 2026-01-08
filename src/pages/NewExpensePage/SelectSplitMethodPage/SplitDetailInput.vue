<script setup lang="ts">
import { PhMinus, PhPlus } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed } from "vue";

import SIconButton from "@/components/SButton/SIconButton.vue";
import { useTransactionStore } from "@/stores/transaction";

import { useKeyboardControl } from "./use-keyboard-control";

const { userId } = defineProps<{
  userId: string;
}>();

// i18n
const { $t } = useFluent();

// transaction store
const transactionStore = useTransactionStore();

const { focusedInputUserId, setFocusedInputUserId } = useKeyboardControl();
const isFocused = computed(() => focusedInputUserId.value === userId);
</script>

<template>
  <button v-if="transactionStore.splitMethod === 'equally'" type="button" @click.stop="setFocusedInputUserId(userId)">
    <div class="flex items-center justify-end rounded-full bg-util-alpha-black-5 px-2 py-1.5">
      <span class="text-center text-sm font-normal text-base-text-placeholder">
        {{
          transactionStore.finalSplitAmount[userId]?.toLocaleString(undefined, {
            style: "currency",
            currency: transactionStore.transaction.currency ?? "USD"
          })
        }}
      </span>
    </div>
  </button>

  <button
    v-else-if="transactionStore.splitMethod === 'percentage'"
    type="button"
    @click.stop="setFocusedInputUserId(userId)"
  >
    <div
      :class="[
        'flex items-center justify-end rounded-full px-2 py-1.5',
        isFocused ? 'bg-base-fg-brand-reverse' : 'bg-util-alpha-black-5',
        isFocused ? 'outline-1 -outline-offset-1 outline-base-border-brand-solid outline-solid' : ''
      ]"
    >
      <span
        v-if="transactionStore.splitByPercentageDetails[userId] === undefined"
        class="text-center text-sm font-normal text-base-text-placeholder"
      >
        {{
          (1 / transactionStore.includedMembersId.length).toLocaleString(undefined, {
            style: "percent",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        }}
      </span>
      <span v-else class="text-center text-sm font-normal text-base-text-primary">
        {{
          (transactionStore.splitByPercentageDetails[userId] / 100).toLocaleString(undefined, {
            style: "percent",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        }}
      </span>
    </div>
  </button>

  <div v-else-if="transactionStore.splitMethod === 'shares'" class="flex items-center justify-end gap-1">
    <SIconButton
      aria-label="Decrease share"
      color="brand"
      size="sm"
      variant="secondary"
      @click="transactionStore.decreaseSplitByShares(userId)"
    >
      <PhMinus />
    </SIconButton>
    <button type="button" @click.stop="setFocusedInputUserId(userId)">
      <div class="items-center rounded-full bg-util-alpha-black-5 px-2 py-1.5">
        <span class="text-center text-sm font-normal text-base-text-primary">
          {{ $t("new-expense-split-shares-count", { count: transactionStore.splitBySharesDetails[userId] ?? 1 }) }}
        </span>
      </div>
    </button>
    <SIconButton
      aria-label="Increase share"
      color="brand"
      size="sm"
      variant="secondary"
      @click="transactionStore.increaseSplitByShares(userId)"
    >
      <PhPlus />
    </SIconButton>
  </div>

  <button
    v-else-if="transactionStore.splitMethod === 'adjustment'"
    type="button"
    @click.stop="setFocusedInputUserId(userId)"
  >
    <div
      :class="[
        'flex items-center justify-end rounded-full px-2 py-1.5',
        isFocused ? 'bg-base-fg-brand-reverse' : 'bg-util-alpha-black-5',
        isFocused ? 'outline-1 -outline-offset-1 outline-base-border-brand-solid outline-solid' : ''
      ]"
    >
      <span
        v-if="transactionStore.splitByAdjustmentDetails[userId] === undefined"
        class="text-center text-sm font-normal text-base-text-placeholder"
      >
        {{
          (0).toLocaleString(undefined, {
            style: "currency",
            currency: transactionStore.transaction.currency ?? "USD",
            signDisplay: "exceptZero"
          })
        }}
      </span>
      <span v-else class="text-center text-sm font-normal text-base-text-primary">
        {{
          transactionStore.splitByAdjustmentDetails[userId].toLocaleString(undefined, {
            style: "currency",
            currency: transactionStore.transaction.currency ?? "USD",
            signDisplay: "exceptZero"
          })
        }}
      </span>
    </div>
  </button>

  <button
    v-else-if="transactionStore.splitMethod === 'custom'"
    type="button"
    @click.stop="setFocusedInputUserId(userId)"
  >
    <div
      :class="[
        'flex items-center justify-end rounded-full px-2 py-1.5',
        isFocused ? 'bg-base-fg-brand-reverse' : 'bg-util-alpha-black-5',
        isFocused ? 'outline-1 -outline-offset-1 outline-base-border-brand-solid outline-solid' : ''
      ]"
    >
      <span
        v-if="transactionStore.splitByCustomDetails[userId] === undefined"
        class="text-center text-sm font-normal text-base-text-placeholder"
      >
        {{
          (0).toLocaleString(undefined, {
            style: "currency",
            currency: transactionStore.transaction.currency ?? "USD"
          })
        }}
      </span>
      <span v-else class="text-center text-sm font-normal text-base-text-primary">
        {{
          transactionStore.splitByCustomDetails[userId].toLocaleString(undefined, {
            style: "currency",
            currency: transactionStore.transaction.currency ?? "USD"
          })
        }}
      </span>
    </div>
  </button>
</template>
