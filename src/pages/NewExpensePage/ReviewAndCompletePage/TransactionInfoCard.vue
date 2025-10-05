<script setup lang="ts">
import { PhFiles } from '@phosphor-icons/vue'
import { useQuery } from '@pinia/colada'
import { useFluent } from 'fluent-vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { AccountApi } from '@/backend'
import config from '@/backend/config'
import { useTransactionStore } from '@/stores/transaction'

const { $t } = useFluent()
const transactionStore = useTransactionStore()
const { transaction } = storeToRefs(transactionStore)

const accountApi = new AccountApi(config)
const { data: userInfo } = useQuery({ key: ['getUserInfo'], query: () => accountApi.getUserInfo() })

const amountOwed = computed(() => {
  if (transactionStore.paidBy && userInfo.value?.id && transaction.value.amount) {
    let owed = transactionStore.finalSplitAmount[userInfo.value.id] ?? 0
    if (transactionStore.paidBy === userInfo.value.id) {
      owed = owed - transaction.value.amount
    }
    return owed
  }
  return 0
})
</script>

<template>
  <div
    class="p-3 bg-util-color-brand-50 rounded-2xl outline-solid outline-1 -outline-offset-1 outline-base-border-primary flex flex-col justify-center gap-3"
  >
    <div class="flex items-center gap-3">
      <div class="bg-util-color-brand-100 rounded-05xl flex justify-center items-center p-2.5">
        <PhFiles class="text-util-color-brand-500 text-[28px]" />
      </div>
      <div class="flex-1 flex flex-col justify-center">
        <div class="text-base-text-primary text-lg font-medium">
          {{
            transaction.amount?.toLocaleString(undefined, {
              style: 'currency',
              currency: transaction.currency ?? 'USD'
            })
          }}
        </div>
        <div class="flex items-end gap-1">
          <div class="text-base-text-quaternary text-sm font-normal">
            {{
              $t('Paid_By_Username', {
                username: transactionStore.members.find((member) => member.id === transactionStore.paidBy)?.userName
              })
            }}
          </div>
        </div>
      </div>
      <div class="flex flex-col justify-center items-end gap-1">
        <div class="text-base-text-quaternary text-sm font-normal">
          {{ amountOwed > 0 ? $t('You_owe') : $t('You_are_owed') }}
        </div>
        <div class="flex items-end gap-1">
          <div v-if="amountOwed > 0" class="text-base-text-error text-sm font-medium">
            {{
              amountOwed.toLocaleString(undefined, {
                style: 'currency',
                currency: transactionStore.transaction.currency ?? 'USD'
              })
            }}
          </div>
          <div v-else class="text-util-color-success-500 text-sm font-medium">
            {{
              (0 - amountOwed).toLocaleString(undefined, {
                style: 'currency',
                currency: transactionStore.transaction.currency ?? 'USD'
              })
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
