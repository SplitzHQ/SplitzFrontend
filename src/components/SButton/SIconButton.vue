<script setup lang="ts">
import { computed } from "vue";

import type { ButtonSize, ButtonVariant } from "./button";
import SButtonBase from "./SButtonBase.vue";

/**
 * A circular button that holds one icon in the default slot.
 * It has no visible text, so always give it an `aria-label` that names the action.
 */
export interface IconButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  /** Replaces the icon with a spinner and blocks clicks. */
  loading?: boolean;
}
interface ButtonEvents {
  click: [e: MouseEvent];
}

const { variant = "ghost", size = "md", disabled, loading } = defineProps<IconButtonProps>();
const emit = defineEmits<ButtonEvents>();
const isDisabled = computed(() => disabled === true || loading === true);

function clickHandler(e: MouseEvent) {
  if (isDisabled.value) {
    e.preventDefault();
    return;
  }
  emit("click", e);
}
</script>

<template>
  <SButtonBase
    as="button"
    type="button"
    :variant="variant"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :aria-disabled="loading ? 'true' : undefined"
    icon-only
    @click="clickHandler"
  >
    <template #icon-left>
      <slot />
    </template>
  </SButtonBase>
</template>
