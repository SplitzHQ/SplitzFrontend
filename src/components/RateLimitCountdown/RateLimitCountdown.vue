<script setup lang="ts">
import { useFluent } from "fluent-vue";

defineProps<{
  /** Remaining cooldown in seconds. Nothing is rendered at zero. */
  seconds: number;
  /** Fluent message id; it receives the remaining time as the `seconds` argument. */
  messageKey: string;
}>();

const { $t } = useFluent();
</script>

<template>
  <p v-if="seconds > 0" class="text-sm text-util-color-error-700" role="status" aria-live="polite">
    {{ $t(messageKey, { seconds }) }}
  </p>
</template>
