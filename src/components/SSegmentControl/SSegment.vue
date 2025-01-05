<script setup lang="ts">
import { Hero } from 'hero-motion'

interface SegmentProps {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  active: boolean
}
type ButtonEvents = (e: 'click') => void

const { size, active } = defineProps<SegmentProps>()
const emit = defineEmits<ButtonEvents>()
</script>

<template>
  <button type="button" @click="emit('click')" class="relative">
    <Hero v-if="active" class="absolute inset-0 rounded-full bg-core-alpha-brand-20" layout-id="segment-bg" />
    <div
      :class="[
        size,
        active ? 'secondary' : 'ghost',
        'relative z-10 flex cursor-pointer items-center gap-1.5 rounded-full'
      ]"
    >
      <div v-if="$slots['icon-left']" class="icon shrink-0">
        <slot name="icon-left" />
      </div>
      <slot />
      <div v-if="$slots['icon-right']" class="icon shrink-0">
        <slot name="icon-right" />
      </div>
    </div>
  </button>
</template>

<style lang="scss" scoped>
.secondary,
.ghost {
  .icon {
    @apply text-base-fg-brand;

    @media (hover: hover) {
      &:hover {
        @apply text-base-fg-brand_hover;
      }
    }

    &:active {
      @apply text-base-fg-brand_pressed;
    }
  }
}

.secondary {
  @apply text-base-text-brand;
}

.ghost {
  @apply text-base-text-quaternary;

  @media (hover: hover) {
    &:hover {
      @apply bg-core-alpha-brand-10 text-base-text-brand_hover;
    }
  }

  &:active {
    @apply text-base-text-brand_pressed;
  }
}

.xs,
.sm,
.md {
  @apply text-sm font-semibold;
}

.lg,
.xl {
  @apply text-base font-semibold;
}

.xs {
  @apply px-1.5 py-1;
}

.sm {
  @apply px-2 py-1.5;
}

.md {
  @apply px-2 py-2;
}

.lg {
  @apply px-3 py-2;
}

.xl {
  @apply px-3 py-2.5;
}

.icon {
  @apply text-xl;
}
</style>
