<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { computed } from 'vue'

import { GroupApi } from '@/backend'
import config from '@/backend/config'
import Avatar from '@/components/Avatar/Avatar.vue'

const groupApi = new GroupApi(config)
const { state } = useQuery({ key: ['getGroups'], query: () => groupApi.getGroups() })
const sortedGroups = computed(() => {
  if (!state.value.data) return []
  const groups = [...state.value.data]
  return groups.sort((a, b) => b.transactionCount - a.transactionCount)
})
</script>

<template>
  <div v-if="state.status === 'pending'">
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
  <div v-else-if="state.status === 'success'">
    <div class="flex items-center gap-3">
      <div v-for="group in sortedGroups" :key="group.groupId" class="flex flex-col items-center gap-1">
        <Avatar :images="group.members.map((member) => ({ src: member.photo, alt: member.userName }))" size="xs" />
        <div class="text-center text-base-text-primary text-xs font-medium">{{ group.name }}</div>
      </div>
    </div>
  </div>
</template>
