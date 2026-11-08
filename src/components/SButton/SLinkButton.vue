<!--
  @fallthroughAttributes true
  The type check accepts the native attributes of the root element, such as `id` or `tabindex`, on this component.
-->
<script setup lang="ts">
import { RouterLink } from "vue-router";

import { BUTTON_ROOT_CLASS, type ButtonSize, type ButtonVariant } from "./button";
import SButtonBase from "./SButtonBase.vue";

/** A link that looks like a button. Use it when the action opens another page. */
export interface LinkButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** A link cannot be natively disabled. The button then ignores taps and leaves the tab order. */
  disabled?: boolean;
  href: string;
}
interface ButtonEvents {
  click: [e: MouseEvent];
}

const { variant = "secondary", size = "md", disabled, href } = defineProps<LinkButtonProps>();
const emit = defineEmits<ButtonEvents>();

function clickHandler(e: MouseEvent) {
  if (disabled) {
    e.preventDefault();
    return;
  }
  emit("click", e);
}
</script>

<template>
  <RouterLink
    :to="href"
    :class="[BUTTON_ROOT_CLASS, { 'pointer-events-none': disabled }]"
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="disabled ? -1 : undefined"
    @click="clickHandler"
  >
    <SButtonBase :variant="variant" :size="size" :disabled="disabled">
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
  </RouterLink>
</template>
