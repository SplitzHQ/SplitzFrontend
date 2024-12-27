<script setup lang="ts">
import { HeroProvider } from 'hero-motion'
import SSegment from './SSegment.vue'

interface SegmentControlProps {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  items: string[]
}
const { size, items } = defineProps<SegmentControlProps>()
const model = defineModel<number>({ required: true })
</script>

<template>
  <HeroProvider>
    <div class="flex gap-1 rounded-full border border-core-alpha-brand-5 bg-core-alpha-brand-5 p-1">
      <SSegment
        v-for="(item, index) in items"
        :key="item"
        @click="model = index"
        :size="size"
        :active="model === index"
      >
        <slot :item="item" />
      </SSegment></div
  ></HeroProvider>
</template>
