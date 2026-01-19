<script setup lang="ts">
import { RouterLink } from "vue-router";

import SButtonBase from "./SButtonBase.vue";

export interface LinkButtonProps {
  color: "neutral" | "error" | "brand";
  variant: "primary" | "secondary" | "outline" | "ghost";
  size: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  disabled?: boolean;
  href: string;
}
interface ButtonEvents {
  click: [e: MouseEvent];
}

const { color, variant, size, disabled, href } = defineProps<LinkButtonProps>();
const emit = defineEmits<ButtonEvents>();

function clickHandler(e: MouseEvent) {
  if (disabled) return;
  emit("click", e);
}
</script>

<template>
  <RouterLink :to="href" :class="[disabled ? 'pointer-events-none' : '']" @click="clickHandler">
    <SButtonBase :color="color" :variant="variant" :size="size" :disabled="disabled">
      <slot />
      <template #icon-left>
        <slot name="icon-left" />
      </template>
      <template #icon-right>
        <slot name="icon-right" />
      </template>
    </SButtonBase>
  </RouterLink>
</template>
