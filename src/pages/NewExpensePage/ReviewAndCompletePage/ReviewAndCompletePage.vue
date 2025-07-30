<script setup lang="ts">
import { PhForkKnife, PhImageSquare, PhMapPin, PhPencil } from '@phosphor-icons/vue'
import { useFluent } from 'fluent-vue'
import { storeToRefs } from 'pinia'

import HeaderMobileSecondary from '@/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue'
import Layout from '@/components/Layout/Layout.vue'
import SButton from '@/components/SButton/SButton.vue'
import { useTransactionStore } from '@/stores/transaction'

import BackgroundCheckCircle from './BackgroundCheckCircle.svg'
import GroupCard from './GroupCard.vue'
import TransactionInfoCard from './TransactionInfoCard.vue'

const { $t } = useFluent()
const transactionStore = useTransactionStore()
const { transaction } = storeToRefs(transactionStore)
const bgUrl = `url("${BackgroundCheckCircle}")`
</script>

<template>
  <Layout>
    <template #header>
      <HeaderMobileSecondary :enable-back-button="true">
        {{ $t('Review_and_Complete') }}
      </HeaderMobileSecondary>
    </template>
    <template #default="layoutAttrs">
      <div v-bind="layoutAttrs" class="flex flex-col">
        <div
          class="bg-center bg-no-repeat bg-cover w-full aspect-square flex flex-col gap-3 justify-end items-center -translate-y-10"
          :style="{ backgroundImage: bgUrl }"
        >
          <div class="text-base-text-brand text-base font-medium">{{ $t('Expense_added_to') }}</div>
          <GroupCard v-if="transaction.groupId" />
        </div>
        <div class="flex flex-col gap-10">
          <TransactionInfoCard />
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <SButton variant="primary" size="xxl" color="brand">{{ $t('Done') }}</SButton>
              <SButton variant="secondary" size="xxl" color="brand">{{ $t('Add_Details') }}</SButton>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div class="p-3 bg-util-color-clearblue-50 rounded-xl flex items-center gap-3">
                <PhPencil class="text-util-color-clearblue-600 text-xl" />
                <div class="flex-1 text-util-color-clearblue-700 text-sm font-medium">
                  {{ $t('Give_It_a_Name') }}
                </div>
              </div>
              <div class="p-3 bg-util-color-purple-50 rounded-xl flex items-center gap-3">
                <PhForkKnife class="text-util-color-purple-600 text-xl" />
                <div class="flex-1 text-util-color-purple-700 text-sm font-medium">
                  {{ $t('Add_Category') }}
                </div>
              </div>
              <div class="p-3 bg-util-color-leaf-50 rounded-xl flex items-center gap-3">
                <PhMapPin class="text-util-color-leaf-600 text-xl" />
                <div class="flex-1 text-util-color-leaf-700 text-sm font-medium">
                  {{ $t('Add_Location') }}
                </div>
              </div>
              <div class="p-3 bg-util-color-rosered-50 rounded-xl flex items-center gap-3">
                <PhImageSquare class="text-util-color-rosered-600 text-xl" />
                <div class="flex-1 text-util-color-rosered-700 text-sm font-medium">
                  {{ $t('Upload_Receipt') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Layout>
</template>
