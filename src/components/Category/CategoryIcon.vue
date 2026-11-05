<script setup lang="ts">
import { computed } from "vue";

import type { Subcategory } from "@/libs/categories";

import { categoryIconMap } from "./category-icons";

/**
 * The icon of a subcategory. The icon is hidden from a screen reader, because the element around it has the name.
 * Set the size and the color on the icon or on its parent. See `category.usage.ts`.
 */
export interface CategoryIconProps {
  category: Subcategory;
}

const props = defineProps<CategoryIconProps>();
const Icon = computed(() => categoryIconMap[props.category]);
</script>

<template>
  <component :is="Icon" aria-hidden="true" />
</template>
