<script setup lang="ts">
import { PhMinus, PhPlus } from '@phosphor-icons/vue'
import { useFluent } from 'fluent-vue'

import SIconButton from '@/components/SButton/SIconButton.vue'
import { useTransactionStore } from '@/stores/transaction'

const { userId } = defineProps<{
  userId: string
}>()

// i18n
const { $t } = useFluent()

// transaction store
const transactionStore = useTransactionStore()
</script>

<template>
  <div
    v-if="transactionStore.splitMethod === 'equally'"
    class="px-2 py-1.5 bg-util-alpha-black-5 rounded-full flex justify-end items-center"
  >
    <span class="text-center text-base-text-placeholder text-sm font-normal">
      $ {{ ((transactionStore.transaction.amount ?? 0) / transactionStore.includedMembersId.length).toFixed(2) }}
    </span>
  </div>

  <div
    v-else-if="transactionStore.splitMethod === 'percentage'"
    class="px-2 py-1.5 bg-util-alpha-black-5 rounded-full flex justify-end items-center"
  >
    <span
      v-if="transactionStore.splitByPercentageDetails[userId] === undefined"
      class="text-center text-base-text-placeholder text-sm font-normal"
    >
      {{ (100 / transactionStore.includedMembersId.length).toFixed(2) }} %
    </span>
    <span v-else class="text-center text-base-text-primary text-sm font-normal">
      {{ transactionStore.splitByPercentageDetails[userId].toFixed(2) }} %
    </span>
  </div>

  <div v-else-if="transactionStore.splitMethod === 'shares'" class="flex justify-end items-center gap-1">
    <SIconButton color="brand" size="sm" variant="secondary" @click="transactionStore.decreaseSplitByShares(userId)">
      <PhMinus />
    </SIconButton>
    <div class="px-2 py-1.5 bg-util-alpha-black-5 rounded-full items-center">
      <span class="text-center text-base-text-primary text-sm font-normal">
        {{ $t('countShare', { count: transactionStore.splitBySharesDetails[userId] ?? 1 }) }}
      </span>
    </div>
    <SIconButton color="brand" size="sm" variant="secondary" @click="transactionStore.increaseSplitByShares(userId)">
      <PhPlus />
    </SIconButton>
  </div>

  <div
    v-else-if="transactionStore.splitMethod === 'adjustment'"
    class="px-2 py-1.5 bg-util-alpha-black-5 rounded-full flex justify-end items-center"
  >
    <span
      v-if="transactionStore.splitByAdjustmentDetails[userId] === undefined"
      class="text-center text-base-text-placeholder text-sm font-normal"
    >
      + $ {{ (0).toFixed(2) }}
    </span>
    <span v-else class="text-center text-base-text-primary text-sm font-normal">
      + $ {{ transactionStore.splitByAdjustmentDetails[userId].toFixed(2) }}
    </span>
  </div>

  <div
    v-else-if="transactionStore.splitMethod === 'custom'"
    class="px-2 py-1.5 bg-util-alpha-black-5 rounded-full flex justify-end items-center"
  >
    <span
      v-if="transactionStore.splitByCustomDetails[userId] === undefined"
      class="text-center text-base-text-placeholder text-sm font-normal"
    >
      $ {{ (0).toFixed(2) }}
    </span>
    <span v-else class="text-center text-base-text-primary text-sm font-normal">
      $ {{ transactionStore.splitByCustomDetails[userId].toFixed(2) }}
    </span>
  </div>
</template>
