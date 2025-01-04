<script setup lang="ts">
import Keyboard from '@/components/Keyboard/Keyboard.vue'
import Layout from '@/components/Layout/Layout.vue'
import SButton from '@/components/SButton/SButton.vue'
import { PhArrowUpRight, PhCurrencyDollar } from '@phosphor-icons/vue'
import { useFluent } from 'fluent-vue'
import { computed, ref } from 'vue'

const { $t } = useFluent()

const value = ref(0)
const formattedValue = computed(() => {
  return value.value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD'
  })
})
</script>

<template>
  <Layout v-slot="layoutAttrs">
    <div v-bind="layoutAttrs" class="flex flex-col gap-4">
      <div class="flex grow flex-col items-center justify-center gap-6">
        <div class="text-[4.5rem] font-medium text-base-text-disabled">{{ formattedValue }}</div>
        <div class="flex items-center gap-2">
          <SButton color="brand" variant="secondary" size="sm">
            <template #icon-left><PhCurrencyDollar /></template>
            USD
          </SButton>
          <SButton color="brand" variant="secondary" size="sm">
            <template #icon-left><PhArrowUpRight /></template>
            {{ $t('One-time') }}
          </SButton>
        </div>
      </div>
      <Keyboard v-model="value" :enable-calculator="true" />
      <div class="grid grid-cols-2 items-center gap-3 py-3">
        <SButton color="brand" variant="outline" size="xxl">{{ $t('Skip') }}</SButton>
        <SButton color="brand" variant="primary" size="xxl">{{ $t('Next') }}</SButton>
      </div>
    </div>
  </Layout>
</template>
