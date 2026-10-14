<script setup lang="ts">
import { computed } from "vue";

export interface NotificationBadgeProps {
  /** Number to show. Zero hides the badge. */
  count: number;
  /** Show a plain dot instead of the number. */
  dot?: boolean;
  /** Numbers above this show as "99+". */
  max?: number;
  label?: string;
}

const { count, dot = false, max = 99, label } = defineProps<NotificationBadgeProps>();

const text = computed(() => (count > max ? `${max}+` : String(count)));
</script>

<template>
  <Transition name="badge">
    <span
      v-if="count > 0"
      :aria-label="label"
      :class="[
        'pointer-events-none absolute flex items-center justify-center rounded-full bg-util-color-error-500 font-semibold text-base-text-primary-reverse ring-2 ring-base-bg-secondary_alt',
        dot ? 'size-2.5' : 'h-4 min-w-4 px-1 text-[10px] leading-none',
      ]"
      role="status"
    >
      <template v-if="!dot">{{ text }}</template>
    </span>
  </Transition>
</template>

<style scoped>
.badge-enter-active {
  transition:
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.2s ease;
}

.badge-leave-active {
  transition:
    transform 0.15s ease-in,
    opacity 0.15s ease-in;
}

.badge-enter-from,
.badge-leave-to {
  opacity: 0;
  transform: scale(0.4);
}
</style>
