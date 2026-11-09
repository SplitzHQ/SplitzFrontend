<script setup lang="ts">
import { computed } from "vue";

/**
 * A small count at the corner of a control. See `notification.usage.ts`.
 * The caller sets the position with `class`, and the parent must be `relative`.
 * A screen reader does not read the badge, so the name of the control must include the count.
 */
export interface NotificationBadgeProps {
  /** The number to show. Zero hides the badge. */
  count: number;
}

/** A higher number shows as "99+", so the badge stays small. */
const MAX_COUNT = 99;

const { count } = defineProps<NotificationBadgeProps>();

const text = computed(() => (count > MAX_COUNT ? `${MAX_COUNT}+` : String(count)));
</script>

<template>
  <Transition name="badge">
    <span
      v-if="count > 0"
      aria-hidden="true"
      class="pointer-events-none absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-base-bg-primary-reverse px-1 text-[10px] leading-none font-semibold text-base-text-primary-reverse ring-2 ring-base-bg-secondary_alt"
    >
      {{ text }}
    </span>
  </Transition>
</template>

<style scoped>
.badge-enter-active {
  transition:
    transform var(--motion-duration-container) var(--motion-easing-pop),
    opacity var(--motion-duration-state) var(--motion-easing-standard);
}

.badge-leave-active {
  transition:
    transform var(--motion-duration-exit) var(--motion-easing-exit),
    opacity var(--motion-duration-exit) var(--motion-easing-exit);
}

.badge-enter-from,
.badge-leave-to {
  opacity: 0;
  transform: scale(0.4);
}
</style>
