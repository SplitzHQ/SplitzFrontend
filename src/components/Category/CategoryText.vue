<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { computed } from "vue";

import type { Subcategory } from "@/libs/categories";

const props = defineProps<{ category: Subcategory }>();

const { $t } = useFluent();

const categoryName = computed(() => $t(`categories-${props.category}`));
</script>

<template>
  <span>{{ categoryName }}</span>
</template>
