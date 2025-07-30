<script setup lang="ts">
import NumberFlow, { type Format } from '@number-flow/vue'
import { PhArrowUpRight, PhCurrencyDollar } from '@phosphor-icons/vue'
import { useFluent } from 'fluent-vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import HeaderMobileSecondary from '@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue'
import Keyboard from '@/components/Keyboard/Keyboard.vue'
import Layout from '@/components/Layout/Layout.vue'
import SButton from '@/components/SButton/SButton.vue'
import SLinkButton from '@/components/SButton/SLinkButton.vue'
import { useTransactionStore } from '@/stores/transaction'

const { $t } = useFluent()
const transactionStore = useTransactionStore()
const { transaction } = storeToRefs(transactionStore)

// format amount as currency
const formatOptions = computed(
  (): Format => ({
    style: 'currency',
    currency: transaction.value.currency ?? 'USD'
  })
)
const formattedAmount = computed(() => {
  const amount = transaction.value.amount
  return amount != null ? amount.toLocaleString(undefined, formatOptions.value) : ''
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
            :class="[
              'flex h-[4.5rem] items-center font-medium',
              transaction.amount === 0 ? 'text-base-text-disabled' : 'text-base-text-primary'
            ]"
            :style="{ fontSize: `min(4.5rem, ${150 / formattedAmount.length}vw)` }"
          >
            <NumberFlow :value="transaction.amount!" :format="formatOptions" />
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
        <Keyboard v-model="transaction.amount" variant="ghost" :enable-calculator="true" />
        <div class="grid grid-cols-2 items-center gap-3 py-3">
          <SButton color="brand" variant="outline" size="xxl">{{ $t('Skip') }}</SButton>
          <SLinkButton color="brand" variant="primary" size="xxl" href="/new-expense/select-people">
            {{ $t('Next') }}
          </SLinkButton>
        </div>
      </div>
    </template>
  </Layout>
</template>
