<script setup lang="ts">
import { computed } from "vue";

import { BUTTON_ROOT_CLASS, type ButtonSize, type ButtonVariant } from "./button";
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
  <button
    type="button"
    :class="BUTTON_ROOT_CLASS"
    :disabled="disabled"
    :aria-disabled="loading ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    @click="clickHandler"
  >
    <SButtonBase :variant="variant" :size="size" :disabled="disabled" :loading="loading" icon-only>
      <template #icon-left>
        <slot />
      </template>
    </SButtonBase>
  </button>
</template>
