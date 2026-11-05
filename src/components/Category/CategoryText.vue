<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { computed } from "vue";

import type { Subcategory } from "@/libs/categories";

/** The translated name of a subcategory, in a span. See `category.usage.ts`. */
export interface CategoryTextProps {
  category: Subcategory;
}

const props = defineProps<CategoryTextProps>();

const { $t } = useFluent();

const categoryName = computed(() => $t(`categories-${props.category}`));
</script>

<template>
  <span>{{ categoryName }}</span>
</template>
