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
    class="placeholder:text-base-text-placeholder placeholder:text-sm placeholder:font-normal text-base-text-primary text-sm font-normal bg-transparent focus-visible:outline-hidden"
  />
</template>
