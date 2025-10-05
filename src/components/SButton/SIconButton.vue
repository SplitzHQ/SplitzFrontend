<script setup lang="ts">
import SButtonBase from './SButtonBase.vue'

export interface ButtonProps {
  color: 'neutral' | 'error' | 'brand'
  variant: 'primary' | 'secondary' | 'outline' | 'ghost'
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  disabled?: boolean
  loading?: boolean
}
interface ButtonEvents {
  click: [e: MouseEvent]
}

const { color, variant, size, disabled, loading } = defineProps<ButtonProps>()
const emit = defineEmits<ButtonEvents>()

function clickHandler(e: MouseEvent) {
  if (disabled) return
  emit('click', e)
}
</script>

<template>
  <button type="button" :disabled="disabled" @click="clickHandler">
    <SButtonBase :color="color" :variant="variant" :size="size" :disabled="disabled" :loading="loading" icon-only>
      <template #icon-left>
        <slot />
      </template>
    </SButtonBase>
  </button>
</template>
