<script setup lang="ts">
import { computed } from "vue";

import SButtonBase from "./SButtonBase.vue";

export interface ButtonProps {
  color: "neutral" | "error" | "brand";
  variant: "primary" | "secondary" | "outline" | "ghost";
  size: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  disabled?: boolean;
  loading?: boolean;
}
interface ButtonEvents {
  click: [e: MouseEvent];
}

const { color, variant, size, disabled, loading } = defineProps<ButtonProps>();
const emit = defineEmits<ButtonEvents>();
const isDisabled = computed(() => disabled === true || loading === true);

function clickHandler(e: MouseEvent) {
  if (isDisabled.value) return;
  emit("click", e);
}
</script>

<template>
  <button type="button" :disabled="isDisabled" @click="clickHandler">
    <SButtonBase :color="color" :variant="variant" :size="size" :disabled="isDisabled" :loading="loading">
      <slot />
      <template #icon-left>
        <slot name="icon-left" />
      </template>
      <template #icon-right>
        <slot name="icon-right" />
      </template>
    </SButtonBase>
  </button>
</template>
