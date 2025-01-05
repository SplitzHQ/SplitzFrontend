<script setup lang="ts">
import { PhArrowUpRight, PhCurrencyDollar } from '@phosphor-icons/vue'
import { useElementBounding } from '@vueuse/core'
import { useMotion } from '@vueuse/motion'
import { useFluent } from 'fluent-vue'
import { computed, nextTick, ref, watch } from 'vue'

import Keyboard from '@/components/Keyboard/Keyboard.vue'
import Layout from '@/components/Layout/Layout.vue'
import SButton from '@/components/SButton/SButton.vue'

const { $t } = useFluent()

// format value as currency
const value = ref(0)
const formattedValue = computed(() => {
  return value.value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
})

// format value layout animation
const formattedValueDivRef = ref<HTMLDivElement | null>(null)
const formattedValueDivBounding = useElementBounding(formattedValueDivRef)
watch(formattedValue, async () => {
  // watch for value change
  const { x } = formattedValueDivBounding
  const oldX = x.value
  await nextTick()
  const newX = x.value
  // animate x position
  useMotion(formattedValueDivRef, {
    initial: { x: oldX - newX },
    enter: { x: 0 }
  })
})
</script>

<template>
  <Layout v-slot="layoutAttrs">
    <div v-bind="layoutAttrs" class="flex flex-col gap-4">
      <div class="flex grow flex-col items-center justify-center gap-6">
        <div
          ref="formattedValueDivRef"
          :class="[
            'flex h-[4.5rem] items-center font-medium transition-none',
            value === 0 ? 'text-base-text-disabled' : 'text-base-text-primary'
          ]"
          :style="{ fontSize: `min(4.5rem, ${150 / formattedValue.length}vw)` }"
        >
          {{ formattedValue }}
        </div>
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
      <Keyboard varient="ghost" v-model="value" :enable-calculator="true" />
      <div class="grid grid-cols-2 items-center gap-3 py-3">
        <SButton color="brand" variant="outline" size="xxl">{{ $t('Skip') }}</SButton>
        <SButton color="brand" variant="primary" size="xxl">{{ $t('Next') }}</SButton>
      </div>
    </div>
  </Layout>
</template>
