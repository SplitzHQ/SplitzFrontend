<script setup lang="ts">
import { useQuery } from '@pinia/colada'

import { GroupApi } from '@/backend'
import config from '@/backend/config'
import Avatar from '@/components/Avatar/Avatar.vue'
import { useTransactionStore } from '@/stores/transaction'

const transactionStore = useTransactionStore()
const transaction = transactionStore.transaction

const groupApi = new GroupApi(config)

function assertGroupId(groupId: string | null | undefined): asserts groupId is string {
  if (!groupId) {
    throw new Error('Transaction groupId is not set')
  }
}

assertGroupId(transaction.groupId)

const { data: group } = useQuery({
  key: ['getGroup', transaction.groupId],
  query: () => {
    assertGroupId(transaction.groupId)
    return groupApi.getGroup({ groupId: transaction.groupId })
  }
})
</script>

<template>
  <div
    v-if="group"
    class="py-2 pl-2 pr-3 bg-util-color-brand-50 rounded-2xl backdrop-blur-[2px] flex flex-col items-start gap-2"
  >
    <div class="flex items-center gap-3">
      <Avatar size="xs" :images="group.members.map((member) => ({ src: member.photo, alt: member.userName }))" />
      <div class="flex flex-col justify-center items-start">
        <div class="flex items-center gap-2">
          <div class="text-base-text-secondary text-base font-medium">
            {{ group.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
