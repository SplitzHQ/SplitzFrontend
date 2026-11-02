<script setup lang="ts">
import { statusLabel, type PrototypeStatus } from "./status";

/** A dot in the status color, then the status name in the same color. */
const { status } = defineProps<{ status?: PrototypeStatus }>();

const COLORS: Record<PrototypeStatus | "none", string> = {
  done: "text-base-text-brand",
  dropped: "text-base-text-quinary",
  none: "text-base-text-error",
  partial: "text-util-color-warning-600",
  todo: "text-base-text-tertiary",
  tool: "text-base-text-quinary",
};
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap"
    :class="COLORS[status ?? 'none']"
    :data-status="status ?? 'none'"
  >
    <span class="size-2 shrink-0 rounded-full bg-current" aria-hidden="true" />
    <span class="status-mark-label">{{ statusLabel(status) }}</span>
  </span>
</template>
