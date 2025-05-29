<script setup lang="ts">
import { useFluent } from 'fluent-vue'

import TextInput from '@/components/TextInput/TextInput.vue'

import UserTag from './UserTag.vue'

const model = defineModel<string>()
const { $t } = useFluent()

const { selectedUsers } = defineProps<{ selectedUsers: { photo: string | null | undefined; name: string }[] }>()
</script>

<template>
  <div class="py-1.5 flex items-center gap-2">
    <div class="text-base-text-quinary text-sm font-semibold">{{ $t('With') }}</div>
    <UserTag v-for="user in selectedUsers" :key="user.name" :photo="user.photo" :name="user.name" class="shrink-0" />
    <TextInput v-model="model" :placeholder="$t('Search-by')" class="grow" />
  </div>
</template>
