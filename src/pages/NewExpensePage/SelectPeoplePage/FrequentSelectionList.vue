<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { computed } from "vue";

import { GroupApi } from "@/backend";
import config from "@/backend/config";
import Avatar from "@/components/Avatar/Avatar.vue";

const groupApi = new GroupApi(config);
const { state: groups } = useQuery({ key: ["getGroups"], query: () => groupApi.getGroups() });
const sortedGroups = computed(() => {
  if (!groups.value.data) return [];
  const groupsValue = [...groups.value.data];
  return groupsValue.sort((a, b) => b.transactionCount - a.transactionCount).slice(0, 10);
});

const emit = defineEmits<{
  select: [id: string];
}>();
</script>

<template>
  <div v-if="groups.status === 'pending'">
    <div class="flex items-center gap-3">
      <div class="flex flex-col items-center gap-1">
        <div class="h-16 w-16 skeleton" />
        <div class="h-3 w-16 skeleton py-0.5" />
      </div>
      <div class="flex flex-col items-center gap-1">
        <div class="h-16 w-16 skeleton" />
        <div class="h-3 w-16 skeleton py-0.5" />
      </div>
      <div class="flex flex-col items-center gap-1">
        <div class="h-16 w-16 skeleton" />
        <div class="h-3 w-16 skeleton py-0.5" />
      </div>
    </div>
  </div>
  <div v-else-if="groups.status === 'success'">
    <div class="flex items-center gap-3">
      <button
        v-for="group in sortedGroups"
        :key="group.groupId"
        class="flex cursor-pointer flex-col items-center gap-1"
        @click="() => emit('select', group.groupId)"
      >
        <Avatar :images="group.members.map((member) => ({ src: member.photo, alt: member.userName }))" size="lg" />
        <div class="text-center text-xs font-medium text-base-text-primary">{{ group.name }}</div>
      </button>
    </div>
  </div>
</template>
