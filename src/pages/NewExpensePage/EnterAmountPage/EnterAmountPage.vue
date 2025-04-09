<script setup lang="ts">
import { PhArrowUpRight, PhCurrencyDollar } from '@phosphor-icons/vue'
import { useElementBounding } from '@vueuse/core'
import { useMotion } from '@vueuse/motion'
import { useFluent } from 'fluent-vue'
import { computed, nextTick, ref, watch } from 'vue'

import HeaderMobileSecondary from '@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue'
import Keyboard from '@/components/Keyboard/Keyboard.vue'
import Layout from '@/components/Layout/Layout.vue'
import SButton from '@/components/SButton/SButton.vue'
import { useTransactionStore } from '@/stores/transaction'

const { $t } = useFluent()
const transactionStore = useTransactionStore()
const transaction = transactionStore.transaction

if (!transaction.amount) {
  transaction.amount = 0
}

// format amount as currency
const formattedAmount = computed(() => {
  return transaction.amount!.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
})

// format amount layout animation
const formattedAmountDivRef = ref<HTMLDivElement | null>(null)
const formattedAmountDivBounding = useElementBounding(formattedAmountDivRef)
watch(formattedAmount, async () => {
  // watch for amount change
  const { x } = formattedAmountDivBounding
  const oldX = x.value
  await nextTick()
  const newX = x.value
  // animate x position
  useMotion(formattedAmountDivRef, {
    initial: { x: oldX - newX },
    enter: { x: 0 }
  })
})
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true" :enable-close-button="true">
        {{ $t('New-Expense') }}
      </HeaderMobileSecondary>
    </template>
    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-4">
        <div class="flex grow flex-col items-center justify-center gap-6">
          <div
            ref="formattedAmountDivRef"
            :class="[
              'flex h-[4.5rem] items-center font-medium transition-none',
              transaction.amount === 0 ? 'text-base-text-disabled' : 'text-base-text-primary'
            ]"
            :style="{ fontSize: `min(4.5rem, ${150 / formattedAmount.length}vw)` }"
          >
            {{ formattedAmount }}
          </div>
          <div class="flex items-center gap-2">
            <SButton color="brand" variant="secondary" size="sm">
              <template #icon-left><PhCurrencyDollar /></template>
              USD
            </SButton>
            <SButton color="brand" variant="secondary" size="sm">
              <template #icon-left><PhArrowUpRight /></template>
              {{ $t('One-time') }}
            </SButton>
          </div>
        </div>
        <Keyboard v-model="transaction.amount" varient="ghost" :enable-calculator="true" />
        <div class="grid grid-cols-2 items-center gap-3 py-3">
          <SButton color="brand" variant="outline" size="xxl">{{ $t('Skip') }}</SButton>
          <SButton color="brand" variant="primary" size="xxl">{{ $t('Next') }}</SButton>
        </div>
      </div>
    </template>
  </Layout>
</template>
