<script setup lang="ts">
import { PhEquals } from '@phosphor-icons/vue'
import { useFluent } from 'fluent-vue'
import { ref } from 'vue'

import SButton from '@/components/SButton/SButton.vue'
import Sheet from '@/components/Sheet/Sheet.vue'

// i18n
const { $t } = useFluent()

// define v-model
defineProps<{
  modelValue?: string
}>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// sheet related
/** Show sheet */
const showSheet = ref(false)

const setModelValue = (memberId: string) => {
  emit('update:modelValue', memberId)
  showSheet.value = false
}
</script>

<template>
  <SButton size="sm" variant="secondary" color="brand" @click="showSheet = true">
    {{ $t('equally') }}
    <template #icon-left>
      <PhEquals />
    </template>
  </SButton>
  <Sheet v-model="showSheet" detent="medium">
    <div class="flex flex-col gap-4">
      <button class="flex items-center gap-2" @click="setModelValue('equally')">
        <PhEquals />
        <span>{{ $t('equally') }}</span>
      </button>
    </div>
  </Sheet>
</template>
