import { useIntervalFn } from "@vueuse/core";
import { computed, ref } from "vue";

import { getRateLimitExpiry } from "@/libs/rate-limit";

export type RateLimitCooldown = ReturnType<typeof useRateLimitCooldown>;

/**
 * Tracks a "try again in N seconds" cooldown after a 429 response. The countdown ticks once a
 * second while active and clears itself when it reaches zero.
 */
export function useRateLimitCooldown() {
  const expiresAt = ref<number | null>(null);
  const currentTime = ref(Date.now());

  const remainingSeconds = computed(() => {
    if (expiresAt.value === null) {
      return 0;
    }

    return Math.max(0, Math.ceil((expiresAt.value - currentTime.value) / 1000));
  });
  const isActive = computed(() => remainingSeconds.value > 0);

  const { pause, resume } = useIntervalFn(
    () => {
      currentTime.value = Date.now();
      if (!isActive.value) {
        expiresAt.value = null;
        pause();
      }
    },
    1000,
    { immediate: false }
  );

  /** Starts the countdown towards an absolute timestamp. An expiry in the past is ignored. */
  function start(expiry: number) {
    currentTime.value = Date.now();
    expiresAt.value = expiry > currentTime.value ? expiry : null;
    if (expiresAt.value === null) {
      pause();
    } else {
      resume();
    }
  }

  /**
   * Starts the countdown when `error` is a rate-limit response. Returns false for any other error
   * so the caller can fall through to its normal error handling.
   */
  function startFromError(error: unknown): boolean {
    const expiry = getRateLimitExpiry(error);
    if (expiry === null) {
      return false;
    }

    start(expiry);
    return true;
  }

  return { isActive, remainingSeconds, start, startFromError };
}
