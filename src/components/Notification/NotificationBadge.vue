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
  /**
   * `neutral` is the dark badge of the bell and the avatar. `brand` takes the fill of a primary button. The home filter
   * button uses it, because the button takes the brand fill of a selected FilterPill.
   */
  tone?: "neutral" | "brand";
}

/** A higher number shows as "99+", so the badge stays small. */
const MAX_COUNT = 99;

const { count, tone = "neutral" } = defineProps<NotificationBadgeProps>();

const TONE_CLASS: Record<NonNullable<NotificationBadgeProps["tone"]>, string> = {
  brand: "bg-base-bg-brand-solid text-base-text-primary-reverse",
  neutral: "bg-base-bg-primary-reverse text-base-text-primary-reverse",
};

const text = computed(() => (count > MAX_COUNT ? `${MAX_COUNT}+` : String(count)));
</script>

<template>
  <Transition name="badge">
    <span
      v-if="count > 0"
      aria-hidden="true"
      :class="[
        'pointer-events-none absolute flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold ring-2 ring-base-bg-secondary_alt',
        TONE_CLASS[tone],
      ]"
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
