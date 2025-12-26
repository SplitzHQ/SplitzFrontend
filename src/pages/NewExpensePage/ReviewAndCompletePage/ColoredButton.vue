<script setup lang="ts">
const emit = defineEmits<{
  click: [e: PointerEvent];
}>();
</script>

<template>
  <button
    type="button"
    :class="['p-1 rounded-xl flex items-center gap-3 cursor-pointer']"
    @click="emit('click', $event)"
  >
    <div class="p-1.5 bg-util-alpha-white-70/70 rounded-05xl icon-5">
      <slot name="icon" />
    </div>
    <span class="text-sm font-medium">
      <slot name="label" />
    </span>
  </button>
</template>
