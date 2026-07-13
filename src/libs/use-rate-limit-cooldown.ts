import { useIntervalFn } from "@vueuse/core";
import { computed, ref } from "vue";

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

  function start(expiry: number) {
    expiresAt.value = expiry;
    currentTime.value = Date.now();
    if (isActive.value) {
      resume();
    } else {
      expiresAt.value = null;
      pause();
    }
  }

  function reset() {
    expiresAt.value = null;
    currentTime.value = Date.now();
    pause();
  }

  return { isActive, remainingSeconds, reset, start };
}
