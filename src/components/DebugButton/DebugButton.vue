<script setup lang="ts">
interface DebugButtonProps {
  /** Button text */
  label: string;
  /** Position classes (default: "bottom-4 left-4") */
  position?: string;
}

interface DebugButtonEmits {
  click: [];
}

withDefaults(defineProps<DebugButtonProps>(), {
  position: "bottom-4 left-4"
});

const emit = defineEmits<DebugButtonEmits>();

// Use compile-time constant for tree-shaking
// Vite replaces import.meta.env.DEV with false in production builds
// This allows the bundler to completely remove dead code via tree-shaking
const isDev = import.meta.env.DEV;

const handleClick = () => {
  emit("click");
};
</script>

<template>
  <!-- 
    This entire block will be removed in production builds via tree-shaking
    because import.meta.env.DEV is replaced with false at build time
  -->
  <button
    v-if="isDev"
    type="button"
    :class="[
      'fixed bg-util-color-error-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium',
      $props.position
    ]"
    @click="handleClick"
  >
    {{ label }}
  </button>
</template>
