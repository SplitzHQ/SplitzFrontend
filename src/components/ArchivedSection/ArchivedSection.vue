<script setup lang="ts">
import { PhArchive, PhCaretDown } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { ref, useId } from "vue";

export interface ArchivedSectionProps {
  /** Number of archived items in the slot. The section is not shown when this is 0. */
  count: number;
}

const { count } = defineProps<ArchivedSectionProps>();

const { $t } = useFluent();

// Archived items stay hidden until the user asks for them.
const expanded = ref(false);
const panelId = useId();
</script>

<template>
  <section v-if="count > 0" class="flex flex-col gap-2">
    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-2xl px-1 py-2 text-left text-sm font-medium text-base-text-quaternary transition-colors duration-200 hover:text-base-text-secondary"
      :aria-expanded="expanded"
      :aria-controls="panelId"
      data-test="archived-toggle"
      @click="expanded = !expanded"
    >
      <PhArchive class="size-5 shrink-0" aria-hidden="true" />
      <span class="flex-1">
        {{ expanded ? $t("archived-section-hide") : $t("archived-section-show", { count }) }}
      </span>
      <PhCaretDown class="caret size-4 shrink-0" :class="{ 'caret-expanded': expanded }" aria-hidden="true" />
    </button>

    <Transition name="archived-reveal">
      <div v-if="expanded" :id="panelId" class="flex flex-col gap-5" data-test="archived-items">
        <slot />
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.caret {
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.caret-expanded {
  transform: rotate(180deg);
}

/* The panel drops in from the toggle that opened it, and leaves faster than it enters. */
.archived-reveal-enter-active {
  transition:
    opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.archived-reveal-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.archived-reveal-enter-from,
.archived-reveal-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .caret {
    transition: none;
  }

  .archived-reveal-enter-from,
  .archived-reveal-leave-to {
    transform: none;
  }
}
</style>
