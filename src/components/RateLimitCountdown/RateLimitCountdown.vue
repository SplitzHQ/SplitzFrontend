<script setup lang="ts">
import { useTimeoutFn } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { computed, onMounted, shallowRef, watch } from "vue";

/**
 * The time that is left in a rate-limit cooldown. The rules are in `rate-limit-countdown.usage.ts`.
 * `useRateLimitCooldown` from `@/libs/use-rate-limit-cooldown` gives the value of `seconds`.
 *
 * The visible text changes each second, so it stays out of the live regions (`aria-live="off"`). A screen reader then
 * does not read each second, also when the countdown is in a `Notice` with `announce`. A hidden live region reads one
 * message at the start of the cooldown and one message at the end.
 */
export interface RateLimitCountdownProps {
  /** Remaining cooldown in seconds. Nothing is visible at zero. */
  seconds: number;
  /** Fluent message id; it receives the remaining time as the `seconds` argument. */
  messageKey: string;
}

/** The time that a message stays in the live region. After this time, only the visible text gives the time. */
const ANNOUNCEMENT_MS = 7000;

// The attributes of the caller go to the visible text, not to the live region.
defineOptions({ inheritAttrs: false });

const { seconds, messageKey } = defineProps<RateLimitCountdownProps>();

const { $t } = useFluent();

const isActive = computed(() => seconds > 0);
const announcement = shallowRef("");
const { start: scheduleClear } = useTimeoutFn(
  () => {
    announcement.value = "";
  },
  ANNOUNCEMENT_MS,
  { immediate: false }
);

/** Puts one message in the live region and removes it later, so a screen reader does not find an old time. */
function announce(text: string) {
  announcement.value = text;
  scheduleClear();
}

watch(isActive, (active) => {
  announce(active ? $t(messageKey, { seconds }) : $t("rate-limit-countdown-ended"));
});

// A live region reads a change, not its first content. So a countdown that starts active fills the region after mount.
onMounted(() => {
  if (isActive.value) announce($t(messageKey, { seconds }));
});
</script>

<template>
  <p v-if="isActive" v-bind="$attrs" class="text-sm text-util-color-error-700" aria-live="off">
    {{ $t(messageKey, { seconds }) }}
  </p>
  <span class="sr-only" role="status">{{ announcement }}</span>
</template>
