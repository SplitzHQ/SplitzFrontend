<script setup lang="ts">
import { onBeforeUnmount, shallowRef } from "vue";

import { exportChoices, hasChoices, onChoicesRegistered } from "./choices";
import { readStatus, statusLabel } from "./status";
import StatusMark from "./StatusMark.vue";

/**
 * The floating status pill at the top of a prototype page, and the "Export my choices" button.
 * `mountPrototype` adds it to every prototype page. A click on the pill hides it until the next load.
 */

const { note, status } = readStatus(document.head.innerHTML);
const visible = shallowRef(status !== "tool");
const title = [statusLabel(status), note, "Click to hide"].filter(Boolean).join(" · ");

const canExport = shallowRef(hasChoices());
const stopListening = onChoicesRegistered(() => (canExport.value = true));
onBeforeUnmount(stopListening);

const EXPORT_LABEL = "Export my choices";
const exportLabel = shallowRef(EXPORT_LABEL);
const exporting = shallowRef(false);

/** Saves the choices, shows where they went for three seconds, then resets the label. */
async function onExport() {
  exporting.value = true;
  exportLabel.value = await exportChoices();
  setTimeout(() => {
    exportLabel.value = EXPORT_LABEL;
    exporting.value = false;
  }, 3000);
}
</script>

<template>
  <Transition
    enter-from-class="opacity-0 -translate-y-2"
    leave-to-class="opacity-0 -translate-y-2"
    enter-active-class="transition-[opacity,translate] duration-(--motion-duration-state) ease-(--motion-easing-enter)"
    leave-active-class="transition-[opacity,translate] duration-(--motion-duration-exit) ease-(--motion-easing-exit)"
    appear
  >
    <button
      v-if="visible"
      type="button"
      class="fixed top-2 left-1/2 z-[2147483647] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-base-border-secondary bg-base-bg-primary/80 px-3 py-1 shadow-sm backdrop-blur-md max-sm:top-1/2 max-sm:left-0 max-sm:translate-x-0 max-sm:-translate-y-1/2 max-sm:rounded-l-none max-sm:border-l-0 max-sm:px-1.5 max-sm:[&_.status-mark-label]:sr-only"
      :title="title"
      @click="visible = false"
    >
      <StatusMark :status="status" />
      <span v-if="note" class="min-w-0 truncate text-sm text-base-text-quaternary max-sm:hidden">{{ note }}</span>
    </button>
  </Transition>
  <Transition
    enter-from-class="opacity-0 translate-y-2"
    enter-active-class="transition-[opacity,translate] duration-(--motion-duration-state) ease-(--motion-easing-enter)"
  >
    <button
      v-if="canExport"
      type="button"
      class="fixed right-4 bottom-4 z-[2147483647] h-9 rounded-full border border-base-border-secondary bg-base-bg-primary/80 px-4 text-sm font-medium text-base-text-primary shadow-md backdrop-blur-md transition-colors hover:border-base-border-brand-solid disabled:text-base-text-brand"
      :disabled="exporting"
      aria-live="polite"
      @click="onExport"
    >
      {{ exportLabel }}
    </button>
  </Transition>
</template>
