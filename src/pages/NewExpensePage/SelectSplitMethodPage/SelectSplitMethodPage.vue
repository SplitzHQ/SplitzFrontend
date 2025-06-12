<script setup lang="ts">
import { useFluent } from 'fluent-vue'

import HeaderMobileSecondary from '@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue'
import Layout from '@/components/Layout/Layout.vue'
import { useTransactionStore } from '@/stores/transaction'

import PaidByButton from './PaidByButton.vue'
import SplitMethodButton from './SplitMethodButton.vue'

// i18n
const { $t } = useFluent()

// transaction store
const transaction = useTransactionStore()
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true" :enable-close-button="true">
        {{ $t('Select-split-method') }}
      </HeaderMobileSecondary>
    </template>
    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col gap-4">
        <div class="flex gap-4 items-center">
          <PaidByButton />
          <div class="w-[1px] h-6 bg-base-border-secondary" />
          <SplitMethodButton />
        </div>
        <div class="flex flex-col gap-1">
          <div class="flex justify-between items-center">
            <div class="text-base-text-tertiary text-sm font-medium">
              {{ $t('Included_People', { count: transaction.includedMembersId.length }) }}
            </div>
            <div class="flex justify-start items-start gap-1">
              <div class="justify-start text-base-text-quaternary text-sm font-medium leading-tight">
                {{ $t('Total_Amount') }}
              </div>
              <div class="justify-start text-base-text-primary text-sm font-medium leading-tight">
                {{
                  transaction.transaction.amount?.toLocaleString(undefined, {
                    style: 'currency',
                    currency: transaction.transaction.currency ?? 'USD'
                  })
                }}
              </div>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <div class="text-base-text-tertiary text-sm font-medium">
              {{ $t('Not_Included_People', { count: transaction.excludedMembersId.length }) }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </Layout>
</template>
