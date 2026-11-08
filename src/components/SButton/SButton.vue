<!--
  @fallthroughAttributes true
  The type check accepts the native attributes of the root element, such as `id` or `tabindex`, on this component.
-->
<script setup lang="ts">
import { computed } from "vue";

import { BUTTON_ROOT_CLASS, type ButtonSize, type ButtonVariant } from "./button";
import SButtonBase from "./SButtonBase.vue";

/** A button with a text label and optional icons. See `button.usage.ts` for when to use each variant and size. */
export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  /** Shows a spinner and blocks clicks. The label stays, so write it as the action ("Save"), not the progress. */
  loading?: boolean;
  /** Native button type. "submit" lets a surrounding form handle Enter key submission. */
  type?: "button" | "submit";
}
interface ButtonEvents {
  click: [e: MouseEvent];
}

const { variant = "secondary", size = "md", disabled, loading, type = "button" } = defineProps<ButtonProps>();
const emit = defineEmits<ButtonEvents>();
const isDisabled = computed(() => disabled === true || loading === true);

// A loading button is not natively disabled, so it keeps its colors and focus. preventDefault stops a form submit.
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
    :type="type"
    :class="BUTTON_ROOT_CLASS"
    :disabled="disabled"
    :aria-disabled="loading ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    @click="clickHandler"
  >
    <SButtonBase :variant="variant" :size="size" :disabled="disabled" :loading="loading">
      <template v-if="$slots['icon-left']" #icon-left>
        <slot name="icon-left" />
      </template>
      <template v-if="$slots.default" #default>
        <slot />
      </template>
      <template v-if="$slots['icon-right']" #icon-right>
        <slot name="icon-right" />
      </template>
    </SButtonBase>
  </button>
</template>
