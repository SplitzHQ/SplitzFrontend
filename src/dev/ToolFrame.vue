<script setup lang="ts">
import { PhArrowClockwise, PhArrowSquareOut } from "@phosphor-icons/vue";
import { ref, watch } from "vue";

import { loadPanelPrefs, savePanelPrefs } from "@/debug/panel-prefs";

import ToolIcon from "./ToolIcon.vue";
import type { DevTool } from "./tools";

/**
 * Shows the page of one tool in an iframe, under a header with the tool name, a size switch and a reload button.
 * All tool pages are on the same dev server, so the iframe shares `localStorage` with them.
 */
const { tool } = defineProps<{ tool: DevTool }>();

/** True while the iframe shows the page at phone size. Tools with `view: "phone"` start so. */
const phone = ref(false);
/** Changing the key makes Vue create a new iframe, which loads the page again. */
const frameKey = ref(0);
const loaded = ref(false);

watch(
  () => tool.slug,
  () => {
    phone.value = tool.view === "phone";
    loaded.value = false;
    // The debug panel is in the app. Save it as open, so the app opens it when it loads in the frame.
    if (tool.slug === "debug") savePanelPrefs(localStorage, { ...loadPanelPrefs(localStorage), open: true });
  },
  { immediate: true }
);

function reload(): void {
  loaded.value = false;
  frameKey.value++;
}
</script>

<template>
  <section class="flex h-full min-h-0 flex-col">
    <header class="flex items-center gap-3 border-b border-base-border-tertiary px-5 py-3">
      <span class="grid size-8 shrink-0 place-items-center text-lg text-base-text-tertiary">
        <ToolIcon :icon="tool.icon" />
      </span>
      <div class="flex min-w-0 flex-1 flex-col">
        <h1 class="truncate text-sm font-semibold text-base-text-primary">{{ tool.name }}</h1>
        <p class="truncate text-xs text-base-text-quaternary">
          {{ tool.description }}
          <template v-if="tool.shortcut">
            Shortcut <kbd class="dev-kbd">{{ tool.shortcut }}</kbd>
          </template>
        </p>
      </div>

      <div
        v-if="tool.view === 'phone'"
        role="group"
        aria-label="Frame size"
        class="flex rounded-lg bg-base-bg-secondary p-0.5 text-xs font-medium"
      >
        <button
          v-for="option in [
            { label: 'Phone', value: true },
            { label: 'Full', value: false },
          ]"
          :key="option.label"
          type="button"
          :aria-pressed="phone === option.value"
          class="rounded-md px-2.5 py-1 text-base-text-tertiary transition-colors duration-(--motion-duration-hover-in) aria-pressed:bg-base-bg-primary aria-pressed:text-base-text-primary aria-pressed:shadow-xs"
          @click="phone = option.value"
        >
          {{ option.label }}
        </button>
      </div>
      <button type="button" class="dev-icon-button" title="Reload the page" @click="reload">
        <PhArrowClockwise aria-hidden="true" />
        <span class="sr-only">Reload</span>
      </button>
      <a :href="tool.href" target="_blank" rel="noopener" class="dev-icon-button" title="Open in a new tab">
        <PhArrowSquareOut aria-hidden="true" />
        <span class="sr-only">Open in a new tab</span>
      </a>
    </header>

    <div
      class="flex min-h-0 flex-1 justify-center overflow-auto"
      :class="phone ? 'items-start bg-base-bg-secondary p-6' : ''"
    >
      <iframe
        :key="`${tool.slug}-${frameKey}`"
        :src="tool.href"
        :title="tool.name"
        class="bg-base-bg-primary transition-opacity duration-(--motion-duration-state) ease-(--motion-easing-enter)"
        :class="[
          phone
            ? 'h-[844px] max-h-full w-[390px] shrink-0 rounded-[2rem] border border-base-border-secondary shadow-lg'
            : 'size-full',
          loaded ? 'opacity-100' : 'opacity-0',
        ]"
        @load="loaded = true"
      />
    </div>
  </section>
</template>
