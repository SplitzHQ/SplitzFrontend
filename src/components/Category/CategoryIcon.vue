<script setup lang="ts">
import { computed } from 'vue'

import type { Subcategory } from '@/libs/categories'

import { categoryIconMap } from './category-icons'

const props = defineProps<{ category: Subcategory }>()
const Icon = computed(() => categoryIconMap[props.category])
</script>

<template>
  <component :is="Icon" />
</template>
