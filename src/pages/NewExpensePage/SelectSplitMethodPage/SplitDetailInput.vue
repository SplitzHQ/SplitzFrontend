<script setup lang="ts">
import { PhMinus, PhPlus } from '@phosphor-icons/vue'
import { useFluent } from 'fluent-vue'
import { computed } from 'vue'

import SIconButton from '@/components/SButton/SIconButton.vue'
import { useTransactionStore } from '@/stores/transaction'

import { useKeyboardControl } from './use-keyboard-control'

const { userId } = defineProps<{
  userId: string
}>()

// i18n
const { $t } = useFluent()

// transaction store
const transactionStore = useTransactionStore()

const { focusedInputUserId, setFocusedInputUserId } = useKeyboardControl()
const isFocused = computed(() => focusedInputUserId.value === userId)
</script>

<template>
  <button v-if="transactionStore.splitMethod === 'equally'" type="button" @click.stop="setFocusedInputUserId(userId)">
    <div class="px-2 py-1.5 bg-util-alpha-black-5 rounded-full flex justify-end items-center">
      <span class="text-center text-base-text-placeholder text-sm font-normal">
        {{
          transactionStore.finalSplitAmount[userId].toLocaleString(undefined, {
            style: 'currency',
            currency: transactionStore.transaction.currency ?? 'USD'
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
        'px-2 py-1.5 rounded-full flex justify-end items-center',
        isFocused ? 'bg-base-fg-brand-reverse' : 'bg-util-alpha-black-5',
        isFocused ? 'outline outline-1 outline-offset-[-1px] outline-base-border-brand-solid' : ''
      ]"
    >
      <span
        v-if="transactionStore.splitByPercentageDetails[userId] === undefined"
        class="text-center text-base-text-placeholder text-sm font-normal"
      >
        {{
          (1 / transactionStore.includedMembersId.length).toLocaleString(undefined, {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        }}
      </span>
      <span v-else class="text-center text-base-text-primary text-sm font-normal">
        {{
          (transactionStore.splitByPercentageDetails[userId] / 100).toLocaleString(undefined, {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        }}
      </span>
    </div>
  </button>

  <div v-else-if="transactionStore.splitMethod === 'shares'" class="flex justify-end items-center gap-1">
    <SIconButton color="brand" size="sm" variant="secondary" @click="transactionStore.decreaseSplitByShares(userId)">
      <PhMinus />
    </SIconButton>
    <button type="button" @click.stop="setFocusedInputUserId(userId)">
      <div class="px-2 py-1.5 bg-util-alpha-black-5 rounded-full items-center">
        <span class="text-center text-base-text-primary text-sm font-normal">
          {{ $t('countShare', { count: transactionStore.splitBySharesDetails[userId] ?? 1 }) }}
        </span>
      </div>
    </button>
    <SIconButton color="brand" size="sm" variant="secondary" @click="transactionStore.increaseSplitByShares(userId)">
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
        'px-2 py-1.5 rounded-full flex justify-end items-center',
        isFocused ? 'bg-base-fg-brand-reverse' : 'bg-util-alpha-black-5',
        isFocused ? 'outline outline-1 outline-offset-[-1px] outline-base-border-brand-solid' : ''
      ]"
    >
      <span
        v-if="transactionStore.splitByAdjustmentDetails[userId] === undefined"
        class="text-center text-base-text-placeholder text-sm font-normal"
      >
        {{
          (0).toLocaleString(undefined, {
            style: 'currency',
            currency: transactionStore.transaction.currency ?? 'USD',
            signDisplay: 'exceptZero'
          })
        }}
      </span>
      <span v-else class="text-center text-base-text-primary text-sm font-normal">
        {{
          transactionStore.splitByAdjustmentDetails[userId].toLocaleString(undefined, {
            style: 'currency',
            currency: transactionStore.transaction.currency ?? 'USD',
            signDisplay: 'exceptZero'
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
        'px-2 py-1.5 rounded-full flex justify-end items-center',
        isFocused ? 'bg-base-fg-brand-reverse' : 'bg-util-alpha-black-5',
        isFocused ? 'outline outline-1 outline-offset-[-1px] outline-base-border-brand-solid' : ''
      ]"
    >
      <span
        v-if="transactionStore.splitByCustomDetails[userId] === undefined"
        class="text-center text-base-text-placeholder text-sm font-normal"
      >
        {{
          (0).toLocaleString(undefined, {
            style: 'currency',
            currency: transactionStore.transaction.currency ?? 'USD'
          })
        }}
      </span>
      <span v-else class="text-center text-base-text-primary text-sm font-normal">
        {{
          transactionStore.splitByCustomDetails[userId].toLocaleString(undefined, {
            style: 'currency',
            currency: transactionStore.transaction.currency ?? 'USD'
          })
        }}
      </span>
    </div>
  </button>
</template>
