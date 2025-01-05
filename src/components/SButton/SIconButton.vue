<script setup lang="ts">
import SButtonBase from './SButtonBase.vue'

interface ButtonProps {
  color: 'neutral' | 'error' | 'brand'
  variant: 'primary' | 'secondary' | 'outline' | 'ghost'
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  disabled?: boolean
  loading?: boolean
}
type ButtonEvents = (e: 'click') => void

const { color, variant, size, disabled, loading } = defineProps<ButtonProps>()
const emit = defineEmits<ButtonEvents>()

function clickHandler() {
  if (disabled) return
  emit('click')
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
