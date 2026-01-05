<script setup lang="ts">
const model = defineModel<string>();

const { placeholder } = defineProps<{
  placeholder: string;
}>();
</script>

<template>
  <!-- eslint-disable vuejs-accessibility/form-control-has-label -->
  <input
    v-model="model"
    type="text"
    :placeholder="placeholder"
    class="bg-transparent text-sm font-normal text-base-text-primary placeholder:text-sm placeholder:font-normal placeholder:text-base-text-placeholder focus-visible:outline-hidden"
  />
</template>
