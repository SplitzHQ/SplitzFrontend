<script setup lang="ts">
import { PhArrowClockwise } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from "reka-ui";
import { computed, useId } from "vue";

import SSwitch from "@/components/SSwitch/SSwitch.vue";

import DebugTip from "./DebugTip.vue";
import { REAL, type DebugAction, type DebugRow } from "./registry";

/** One debug row. Each row kind has one look (see registry.ts). */
const { row } = defineProps<{ row: DebugRow }>();

const { $t } = useFluent();
const labelId = useId();

const value = computed(() => row.value?.());

const choices = computed(() =>
  row.kind === "state" ? [{ id: REAL, label: "debug-panel-real", tip: "debug-panel-real-tip" }, ...row.choices] : []
);
const chosen = computed({
  get: () => (row.kind === "state" ? row.chosen() : REAL),
  set: (id: string) => {
    if (row.kind === "state") row.choose(id);
  },
});

const switchOn = computed({
  get: () => (row.kind === "switch" ? row.on() : false),
  set: (on: boolean) => {
    if (row.kind === "switch") row.set(on);
  },
});

/** The accessible name of an action. A `change` action says that it changes what this browser keeps. */
function actionName(action: DebugAction): string {
  const label = $t(action.label);
  return action.change ? `${label} · ${$t("debug-panel-changes")}` : label;
}
</script>

<template>
  <div class="flex flex-col gap-2 rounded-xl px-2 py-2">
    <div class="flex min-h-7 items-center gap-2">
      <DebugTip :text="$t(row.tip)" side="left">
        <span :id="labelId" class="cursor-help text-sm font-medium text-base-text-primary" tabindex="0">
          {{ $t(row.label) }}
        </span>
      </DebugTip>
      <span class="min-w-0 flex-1 truncate text-right text-xs text-base-text-tertiary tabular-nums" :title="value">
        {{ value }}
      </span>
      <SSwitch v-if="row.kind === 'switch'" v-model="switchOn" :aria-labelledby="labelId" />
    </div>

    <RadioGroupRoot
      v-if="row.kind === 'state'"
      v-model="chosen"
      :aria-labelledby="labelId"
      class="flex flex-wrap gap-1.5"
      orientation="horizontal"
    >
      <DebugTip v-for="choice in choices" :key="choice.id" :text="$t(choice.tip)">
        <RadioGroupItem
          :value="choice.id"
          class="flex items-center gap-1.5 rounded-full border border-base-border-secondary px-2.5 py-1 text-xs font-medium text-base-text-secondary transition-[background-color,border-color,color] duration-150 hover:bg-base-bg-secondary focus-visible:ring-2 focus-visible:ring-util-color-brand-600 focus-visible:outline-none data-[state=checked]:border-base-border-brand data-[state=checked]:bg-base-bg-brand data-[state=checked]:text-base-text-brand"
        >
          <span
            aria-hidden="true"
            class="flex size-3 items-center justify-center rounded-full border border-current transition-colors"
          >
            <RadioGroupIndicator class="debug-radio-dot size-1.5 rounded-full bg-current" />
          </span>
          {{ $t(choice.label) }}
        </RadioGroupItem>
      </DebugTip>
    </RadioGroupRoot>

    <div v-else-if="row.kind === 'actions'" class="flex flex-wrap gap-1.5">
      <DebugTip v-for="action in row.actions" :key="action.id" :text="$t(action.tip)">
        <button
          type="button"
          :aria-label="actionName(action)"
          :disabled="action.disabled?.()"
          :class="[
            'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-[background-color,border-color,color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-util-color-brand-600 focus-visible:outline-none active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
            action.change
              ? 'border-base-border-error text-base-text-error hover:bg-base-bg-error'
              : 'border-base-border-secondary text-base-text-primary hover:bg-base-bg-secondary',
          ]"
          @click="action.run()"
        >
          {{ $t(action.label) }}
          <PhArrowClockwise v-if="action.reload" aria-hidden="true" class="size-3.5" />
        </button>
      </DebugTip>
    </div>
  </div>
</template>

<style scoped>
.debug-radio-dot[data-state="checked"] {
  animation: debug-radio-in 160ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes debug-radio-in {
  from {
    transform: scale(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .debug-radio-dot[data-state="checked"] {
    animation: none;
  }
}
</style>
