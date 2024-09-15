<script setup lang="ts">
import { PhCircleNotch } from '@phosphor-icons/vue'

interface ButtonBaseProps {
  color: 'neutral' | 'error' | 'brand'
  variant: 'primary' | 'secondary' | 'outline' | 'ghost'
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  iconOnly?: boolean
  disabled?: boolean
  loading?: boolean
}
const { color, variant, size, disabled, loading, iconOnly } = defineProps<ButtonBaseProps>()
</script>

<template>
  <div
    :class="[
      variant,
      size,
      disabled ? 'disabled' : color,
      iconOnly ? 'icon-only' : '',
      'flex cursor-pointer items-center gap-1 rounded-full'
    ]"
  >
    <PhCircleNotch v-if="loading" class="icon shrink-0 animate-spin" />
    <div v-if="$slots['icon-left']" class="icon shrink-0">
      <slot name="icon-left" />
    </div>
    <slot />
    <div v-if="$slots['icon-right']" class="icon shrink-0">
      <slot name="icon-right" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.neutral {
  &.primary {
    @apply bg-base-bg-primary-reverse text-base-text-primary-reverse;

    &:hover {
      @apply bg-base-bg-primary-reverse_hover text-base-text-primary-reverse_hover;
    }

    &:active {
      @apply bg-base-bg-primary-reverse_pressed text-base-text-primary-reverse_pressed;
    }

    .icon {
      @apply text-base-fg-primary-reverse;

      &:hover {
        @apply text-base-fg-primary-reverse_hover;
      }

      &:active {
        @apply text-base-fg-primary-reverse_pressed;
      }
    }
  }

  &.secondary,
  &.outline,
  &.ghost {
    &:hover {
      @apply bg-base-bg-neutral_hover text-base-text-primary_hover;
    }

    &:active {
      @apply bg-base-bg-neutral_pressed text-base-text-primary_pressed;
    }

    .icon {
      @apply text-base-fg-primary;

      &:hover {
        @apply text-base-fg-primary_hover;
      }

      &:active {
        @apply text-base-fg-primary_pressed;
      }
    }
  }

  &.secondary {
    @apply bg-base-bg-neutral text-base-text-primary;
  }

  &.outline,
  &.ghost {
    @apply bg-base-bg-primary text-base-text-primary;
  }

  &.outline {
    @apply border border-base-border-primary;
  }
}

.error {
  &.primary {
    @apply bg-base-bg-error-reverse text-base-text-primary-reverse;

    &:hover {
      @apply bg-base-bg-error-reverse_hover text-base-text-primary-reverse_hover;
    }

    &:active {
      @apply bg-base-bg-error-reverse_pressed text-base-text-primary-reverse_pressed;
    }

    .icon {
      @apply text-base-fg-primary-reverse;

      &:hover {
        @apply text-base-fg-primary-reverse_hover;
      }

      &:active {
        @apply text-base-fg-primary-reverse_pressed;
      }
    }
  }

  &.secondary,
  &.outline,
  &.ghost {
    &:hover {
      @apply bg-base-bg-error_hover text-base-text-error_hover;
    }

    &:active {
      @apply bg-base-bg-error_pressed text-base-text-error_pressed;
    }

    .icon {
      @apply text-base-fg-error;

      &:hover {
        @apply text-base-fg-error_hover;
      }

      &:active {
        @apply text-base-fg-error_pressed;
      }
    }
  }

  &.secondary {
    @apply bg-base-bg-error text-base-text-error;
  }

  &.outline,
  &.ghost {
    @apply bg-base-bg-primary text-base-text-error;
  }

  &.outline {
    @apply border border-base-border-error;
  }
}

.brand {
  &.primary {
    @apply bg-base-bg-brand-reverse text-base-text-primary-reverse;

    &:hover {
      @apply bg-base-bg-brand-reverse_hover text-base-text-primary-reverse_hover;
    }

    &:active {
      @apply bg-base-bg-brand-reverse_pressed text-base-text-primary-reverse_pressed;
    }

    .icon {
      @apply text-base-fg-primary-reverse;

      &:hover {
        @apply text-base-fg-primary-reverse_hover;
      }

      &:active {
        @apply text-base-fg-primary-reverse_pressed;
      }
    }
  }

  &.secondary,
  &.outline,
  &.ghost {
    &:hover {
      @apply bg-base-bg-brand_hover text-base-text-brand_hover;
    }

    &:active {
      @apply bg-base-bg-brand_pressed text-base-text-brand_pressed;
    }

    .icon {
      @apply text-base-fg-brand;

      &:hover {
        @apply text-base-fg-brand_hover;
      }

      &:active {
        @apply text-base-fg-brand_pressed;
      }
    }
  }

  &.secondary {
    @apply bg-base-bg-brand text-base-text-brand;
  }

  &.outline,
  &.ghost {
    @apply bg-base-bg-primary text-base-text-brand;
  }

  &.outline {
    @apply border border-base-border-brand;
  }
}

.disabled {
  @apply cursor-default bg-base-bg-disabled text-base-text-disabled;

  &.outline {
    @apply border-base-border-disabled;
  }
}

.primary,
.secondary,
.ghost {
  @apply border border-transparent;
}

.xs,
.sm,
.md {
  @apply text-sm font-medium;
}

.lg,
.xl {
  @apply text-base font-medium;
}

.xxl {
  @apply text-lg font-medium;
}

.xs {
  @apply px-1.5 py-1;

  &.icon-only {
    @apply px-1 py-1;
  }
}

.sm {
  @apply px-2 py-1.5;

  &.icon-only {
    @apply px-1.5 py-1.5;
  }
}

.md {
  @apply px-2 py-2;
}

.lg {
  @apply px-3 py-2;

  &.icon-only {
    @apply px-2.5 py-2.5;
  }
}

.xl {
  @apply px-3 py-2.5;

  &.icon-only {
    @apply px-3 py-3;
  }
}

.xxl {
  @apply px-4 py-2.5;

  &.icon-only {
    @apply px-3.5 py-3.5;
  }
}

.icon {
  @apply text-xl;
}
</style>
