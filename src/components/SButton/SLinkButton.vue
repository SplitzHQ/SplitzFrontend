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

const { color, variant, size } = defineProps<LinkButtonProps>();
</script>

<template>
  <RouterLink :to="href" :class="[disabled ? 'pointer-events-none' : '']">
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
