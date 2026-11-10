<script setup lang="ts">
import { useFluent } from "fluent-vue";
import { computed } from "vue";

/**
 * The top of a round: the state, the count of paid transfers, a progress bar and the start line. The title and the
 * count sit in one row, so they have one size (`spz-component-use`: text side by side uses one size).
 */
const { active, count, done, started, total } = defineProps<{
  /** True while the round waits for payments. */
  active: boolean;
  done: number;
  total: number;
  /** The start day, already formatted. */
  started: string;
  /** The number of expenses that the round covers. */
  count: number;
}>();

const { $t } = useFluent();

const progressText = computed(() => $t("settle-up-round-progress", { done, total }));
const width = computed(() => `${String(total === 0 ? 100 : (done / total) * 100)}%`);
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-baseline justify-between gap-2">
      <h2 class="text-base font-semibold text-base-text-primary">
        {{ active ? $t("settle-up-round-in-progress") : $t("settle-up-round-settled") }}
      </h2>
      <p class="shrink-0 text-base font-medium text-base-text-secondary" data-test="round-progress">
        {{ progressText }}
      </p>
    </div>
    <div
      class="h-1.5 overflow-hidden rounded-full bg-base-border-subtle"
      role="progressbar"
      :aria-valuemax="total"
      :aria-valuenow="done"
      :aria-valuetext="progressText"
    >
      <div
        class="h-full rounded-full bg-base-bg-brand-solid transition-[width] duration-state ease-standard motion-reduce:transition-none"
        :style="{ width }"
      />
    </div>
    <p class="text-sm text-base-text-muted">{{ $t("settle-up-round-started", { count, date: started }) }}</p>
  </div>
</template>
