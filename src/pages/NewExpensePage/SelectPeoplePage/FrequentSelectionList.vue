<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { GroupApi } from '@/backend'
import config from '@/backend/config'
import Avatar from '@/components/Avatar/Avatar.vue'
import { useTransactionStore } from '@/stores/transaction'

const router = useRouter()

const groupApi = new GroupApi(config)
const { state: groups } = useQuery({ key: ['getGroups'], query: () => groupApi.getGroups() })
const sortedGroups = computed(() => {
  if (!groups.value.data) return []
  const groupsValue = [...groups.value.data]
  return groupsValue.sort((a, b) => b.transactionCount - a.transactionCount).slice(0, 10)
})

const transaction = useTransactionStore()
const onGroupSelected = async (groupId: string) => {
  transaction.transaction.groupId = groupId
  await router.push({ name: 'newExpenseSelectSplitMethod' })
}
</script>

<template>
  <div v-if="groups.status === 'pending'">
    <div class="flex items-center gap-3">
      <div class="flex flex-col items-center gap-1">
        <div class="w-16 h-16 skeleton" />
        <div class="w-16 h-3 py-0.5 skeleton" />
      </div>
      <div class="flex flex-col items-center gap-1">
        <div class="w-16 h-16 skeleton" />
        <div class="w-16 h-3 py-0.5 skeleton" />
      </div>
      <div class="flex flex-col items-center gap-1">
        <div class="w-16 h-16 skeleton" />
        <div class="w-16 h-3 py-0.5 skeleton" />
      </div>
    </div>
  </div>
  <div v-else-if="groups.status === 'success'">
    <div class="flex items-center gap-3">
      <button
        v-for="group in sortedGroups"
        :key="group.groupId"
        class="flex flex-col items-center gap-1"
        @click="() => onGroupSelected(group.groupId)"
      >
        <Avatar :images="group.members.map((member) => ({ src: member.photo, alt: member.userName }))" size="lg" />
        <div class="text-center text-base-text-primary text-xs font-medium">{{ group.name }}</div>
      </button>
    </div>
  </div>
</template>
