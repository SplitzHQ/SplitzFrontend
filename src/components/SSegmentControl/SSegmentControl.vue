<script setup lang="ts">
import SSegment from './SSegment.vue'

export interface SegmentControlProps {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  items: string[]
}
const { size, items } = defineProps<SegmentControlProps>()
const model = defineModel<number>({ required: true })
</script>

<template>
  <div class="flex gap-1 rounded-full border border-core-alpha-brand-5 bg-core-alpha-brand-5 p-1">
    <SSegment v-for="(item, index) in items" :key="item" :size="size" :active="model === index" @click="model = index">
      <slot :item="item" />
    </SSegment>
  </div>
</template>
