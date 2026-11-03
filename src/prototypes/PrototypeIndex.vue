<script setup lang="ts">
import { countByStatus, listPrototypes } from "./kit/catalog";
import StatusMark from "./kit/StatusMark.vue";

/**
 * The list of all prototypes: every `<date>-<name>/*.html` page in this folder, newest first.
 * Each row shows the page title, its status, and the status note. A row opens its prototype in a new tab.
 */

// The raw HTML is enough: the title and the status meta tags are in it.
const pages = import.meta.glob<string>("./*/*.html", { eager: true, import: "default", query: "?raw" });
const entries = listPrototypes(pages);
const counts = countByStatus(entries);
</script>

<template>
  <main class="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12 text-base-text-primary">
    <header class="flex flex-col gap-3">
      <h1 class="text-display-xs font-semibold">
        Prototypes <span class="text-base-text-quinary">{{ entries.length }}</span>
      </h1>
      <p class="flex flex-wrap gap-x-5 gap-y-2">
        <span v-for="{ status, count } in counts" :key="status ?? 'none'" class="inline-flex items-center gap-1.5">
          <StatusMark :status="status" />
          <b class="text-sm font-medium">{{ count }}</b>
        </span>
      </p>
    </header>

    <p v-if="entries.length === 0" class="text-sm text-base-text-tertiary">
      No prototypes yet. See <code>src/prototypes/README.md</code> to add one.
    </p>
    <ol v-else class="flex flex-col">
      <li
        v-for="(entry, index) in entries"
        :key="entry.href"
        class="grid grid-cols-[6rem_minmax(0,1fr)] items-center border-t border-base-border-tertiary max-sm:grid-cols-1"
      >
        <time :datetime="entry.date" class="font-mono text-xs text-base-text-quaternary max-sm:pt-3">
          {{ index > 0 && entries[index - 1]?.date === entry.date ? "" : entry.date }}
        </time>
        <a
          :href="entry.href"
          target="_blank"
          class="-mx-2 flex items-baseline justify-between gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-base-bg-secondary"
        >
          <span class="flex min-w-0 flex-col gap-0.5">
            <b class="text-sm font-medium">{{ entry.title }}</b>
            <span v-if="entry.note" class="truncate text-sm text-base-text-quaternary">{{ entry.note }}</span>
          </span>
          <span class="flex shrink-0 items-baseline gap-4">
            <code class="font-mono text-xs text-base-text-quaternary max-sm:hidden">{{ entry.name }}</code>
            <span class="w-28"><StatusMark :status="entry.status" /></span>
          </span>
        </a>
      </li>
    </ol>
  </main>
</template>
