<script setup lang="ts">
const emit = defineEmits<{
  click: [e: PointerEvent];
}>();
</script>

<template>
  <button
    type="button"
    :class="['flex cursor-pointer items-center gap-3 rounded-xl p-1']"
    @click="emit('click', $event)"
  >
    <div class="rounded-05xl bg-util-alpha-white-70/70 p-1.5 icon-5">
      <slot name="icon" />
    </div>
    <span class="text-sm font-medium">
      <slot name="label" />
    </span>
  </button>
</template>
