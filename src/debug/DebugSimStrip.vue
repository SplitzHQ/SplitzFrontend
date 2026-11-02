<script setup lang="ts">
import { PhArrowCounterClockwise } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { ref, watch } from "vue";

import DebugTip from "./DebugTip.vue";
import type { ActiveSim } from "./registry";

/**
 * A strip at the top of the screen that lists each simulation that is on, with an undo button for each. It is
 * outside the panel, so it shows while the panel is closed, and the panel does not move when a simulation starts
 * or stops. While it slides out, it keeps its last list.
 */
const { sims } = defineProps<{ sims: ActiveSim[] }>();

const { $t } = useFluent();

const shown = ref<ActiveSim[]>(sims);
watch(
  () => sims,
  (next) => {
    if (next.length > 0) shown.value = next;
  }
);

function simText(sim: ActiveSim): string {
  return sim.choice ? $t("debug-panel-sim-choice", { choice: $t(sim.choice), sim: $t(sim.label) }) : $t(sim.label);
}

function undoAll() {
  for (const sim of sims) sim.undo();
}
</script>

<template>
  <Transition name="debug-strip">
    <div
      v-if="sims.length"
      role="status"
      class="fixed inset-x-0 top-0 z-[1001] flex flex-wrap items-center justify-center gap-2 bg-util-color-warning-100 px-4 py-1.5 pt-[max(0.375rem,env(safe-area-inset-top))] text-xs text-base-text-primary shadow-sm"
    >
      <span class="flex items-center gap-1.5 font-semibold">
        <span aria-hidden="true" class="size-2 animate-pulse rounded-full bg-util-color-warning-400" />
        {{ $t("debug-panel-simulating", { count: shown.length }) }}
      </span>
      <span
        v-for="sim in shown"
        :key="sim.key"
        class="flex items-center gap-1 rounded-full bg-util-color-warning-50 py-0.5 pr-0.5 pl-2.5"
      >
        {{ simText(sim) }}
        <DebugTip :text="$t('debug-panel-undo')" side="bottom">
          <button
            type="button"
            :aria-label="$t('debug-panel-undo-sim', { sim: simText(sim) })"
            class="flex size-5 items-center justify-center rounded-full hover:bg-util-color-warning-200 focus-visible:ring-2 focus-visible:ring-util-color-brand-600 focus-visible:outline-none"
            @click="sim.undo()"
          >
            <PhArrowCounterClockwise aria-hidden="true" class="size-3.5" />
          </button>
        </DebugTip>
      </span>
      <button
        v-if="shown.length > 1"
        type="button"
        class="rounded-full px-2 py-0.5 font-medium hover:bg-util-color-warning-200 focus-visible:ring-2 focus-visible:ring-util-color-brand-600 focus-visible:outline-none"
        @click="undoAll"
      >
        {{ $t("debug-panel-undo-all") }}
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.debug-strip-enter-active {
  transition:
    transform 220ms cubic-bezier(0.25, 1, 0.5, 1),
    opacity 220ms cubic-bezier(0.25, 1, 0.5, 1);
}

.debug-strip-leave-active {
  transition:
    transform 150ms cubic-bezier(0.25, 1, 0.5, 1),
    opacity 150ms cubic-bezier(0.25, 1, 0.5, 1);
}

.debug-strip-enter-from,
.debug-strip-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .debug-strip-enter-active,
  .debug-strip-leave-active {
    transition: opacity 150ms linear;
  }

  .debug-strip-enter-from,
  .debug-strip-leave-to {
    transform: none;
  }
}
</style>
