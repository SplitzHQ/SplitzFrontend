<script setup lang="ts">
import { PhArrowSquareOut, PhHouse, PhMagnifyingGlass, PhMoon, PhSun } from "@phosphor-icons/vue";
import { useEventListener } from "@vueuse/core";
import { computed, ref, useTemplateRef } from "vue";

import { docsDark } from "@/design-system/docs-theme";

import DevHome from "./DevHome.vue";
import { addVisit, loadRecent, saveRecent } from "./recent";
import ToolFrame from "./ToolFrame.vue";
import ToolIcon from "./ToolIcon.vue";
import { groupByCategory, searchTools, toolBySlug, type DevTool } from "./tools";

/**
 * The dev dashboard: a sidebar with every tool of `tools.ts`, and the home page or the open tool on the right.
 * The URL hash names the open tool (`#/design-system`), so a reload or a shared link opens the same tool.
 * Ctrl+K (Cmd+K on macOS) moves the focus to the search field.
 */

const slugFromHash = () => decodeURIComponent(location.hash.replace(/^#\/?/, ""));
const slug = ref(slugFromHash());
useEventListener(window, "hashchange", () => (slug.value = slugFromHash()));

const current = computed(() => toolBySlug(slug.value));
const visits = ref(loadRecent(localStorage));

const query = ref("");
const results = computed(() => searchTools(query.value));
const groups = computed(() => groupByCategory(results.value));
const search = useTemplateRef<HTMLInputElement>("search");

/** Opens a tool: in the dashboard, or in a new tab for a tool on another server. Records the visit in both cases. */
function open(tool: DevTool): void {
  visits.value = addVisit(visits.value, tool.slug, new Date());
  saveRecent(localStorage, visits.value);
  if (tool.view === "tab") window.open(tool.href, "_blank", "noopener");
  else location.hash = `/${tool.slug}`;
}

function goHome(): void {
  history.pushState(null, "", location.pathname);
  slug.value = "";
}

function onSearchKey(event: KeyboardEvent): void {
  if (event.key === "Enter" && results.value[0]) {
    open(results.value[0]);
    query.value = "";
    search.value?.blur();
  } else if (event.key === "Escape") {
    query.value = "";
    search.value?.blur();
  }
}

useEventListener(window, "keydown", (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    search.value?.focus();
  }
});
</script>

<template>
  <div class="flex h-dvh bg-base-bg-primary text-base-text-primary">
    <aside class="flex w-64 shrink-0 flex-col gap-4 border-r border-base-border-tertiary px-3 py-4 max-md:w-16">
      <div class="flex items-center gap-2 px-2">
        <img src="/favicon.svg" alt="" class="size-6" />
        <b class="text-sm font-semibold max-md:hidden">Splitz Dev</b>
      </div>

      <label class="relative flex items-center max-md:hidden">
        <PhMagnifyingGlass class="pointer-events-none absolute left-2.5 text-base-text-quaternary" aria-hidden="true" />
        <span class="sr-only">Search tools</span>
        <input
          ref="search"
          v-model="query"
          type="search"
          placeholder="Search"
          class="w-full rounded-lg border border-base-border-tertiary bg-base-bg-secondary py-1.5 pr-12 pl-8 text-sm placeholder:text-base-text-placeholder focus-visible:border-base-border-brand focus-visible:outline-none"
          @keydown="onSearchKey"
        />
        <kbd class="dev-kbd pointer-events-none absolute right-2">Ctrl K</kbd>
      </label>

      <nav aria-label="Tools" class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        <button type="button" class="dev-nav-item" :aria-current="current ? undefined : 'page'" @click="goHome">
          <PhHouse aria-hidden="true" />
          <span class="max-md:sr-only">Home</span>
        </button>

        <div v-for="group in groups" :key="group.category" class="flex flex-col gap-0.5">
          <p class="px-2 pb-1 text-xs font-medium text-base-text-quinary max-md:sr-only">{{ group.category }}</p>
          <button
            v-for="tool in group.tools"
            :key="tool.slug"
            type="button"
            class="dev-nav-item"
            :title="tool.description"
            :aria-current="current?.slug === tool.slug ? 'page' : undefined"
            @click="open(tool)"
          >
            <ToolIcon :icon="tool.icon" />
            <span class="flex-1 truncate text-left max-md:sr-only">{{ tool.name }}</span>
            <PhArrowSquareOut
              v-if="tool.view === 'tab'"
              class="text-base-text-quinary max-md:hidden"
              aria-hidden="true"
            />
          </button>
        </div>
        <p v-if="results.length === 0" class="px-2 text-sm text-base-text-quaternary">No tool matches.</p>
      </nav>

      <button type="button" class="dev-nav-item" @click="docsDark = !docsDark">
        <component :is="docsDark ? PhSun : PhMoon" aria-hidden="true" />
        <span class="max-md:sr-only">{{ docsDark ? "Light theme" : "Dark theme" }}</span>
      </button>
    </aside>

    <main class="min-w-0 flex-1 overflow-y-auto">
      <ToolFrame v-if="current" :tool="current" />
      <DevHome v-else :visits="visits" @open="open" />
    </main>
  </div>
</template>
