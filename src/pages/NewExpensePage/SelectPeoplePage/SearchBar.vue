<script setup lang="ts">
import { useFluent } from 'fluent-vue'

import TextInput from '@/components/TextInput/TextInput.vue'

const model = defineModel<string>()
const { $t } = useFluent()
</script>

<template>
  <div class="py-1.5 flex items-center gap-2">
    <div class="text-base-text-quinary text-sm font-semibold">{{ $t('With') }}</div>
    <TextInput v-model="model" :placeholder="$t('Search-by')" class="grow" />
  </div>
</template>
