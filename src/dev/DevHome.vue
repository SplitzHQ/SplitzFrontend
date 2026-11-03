<script setup lang="ts">
import { PhArrowUpRight } from "@phosphor-icons/vue";

import { countByStatus, listPrototypes } from "@/prototypes/kit/catalog";
import StatusMark from "@/prototypes/kit/StatusMark.vue";

import backlogMarkdown from "../../docs/待办与暂缓.md?raw";
import { recentTools, timeAgo, type RecentVisit } from "./recent";
import { summarizeBacklog } from "./summary";
import ToolIcon from "./ToolIcon.vue";
import { DEV_TOOLS, groupByCategory, TOOL_CATEGORIES, toolBySlug, type DevTool } from "./tools";

/**
 * The home page of the dev dashboard: totals, the tools opened last, the state of the backlog and the prototypes,
 * and all tools by work area. The backlog and prototype numbers come from their source files, so the dev server
 * updates this page when those files change.
 */
const { visits } = defineProps<{ visits: RecentVisit[] }>();
const emit = defineEmits<{ open: [tool: DevTool] }>();

const backlog = summarizeBacklog(backlogMarkdown);
// The same glob as the prototype index: the raw HTML has the title and the status meta tags.
// `listPrototypes` expects paths relative to the prototype folder (`./<folder>/<file>`), so the keys are cut to that.
const prototypePages = import.meta.glob<string>("@/prototypes/*/*.html", {
  eager: true,
  import: "default",
  query: "?raw",
});
const prototypes = listPrototypes(
  Object.fromEntries(
    Object.entries(prototypePages).map(([path, html]) => [`./${path.split("/").slice(-2).join("/")}`, html])
  )
);
const prototypeCounts = countByStatus(prototypes).filter(({ count }) => count > 0);
const groups = groupByCategory();
const now = new Date();

const totals = [
  { label: "Tools", unit: "available", value: DEV_TOOLS.length },
  { label: "Work areas", unit: "categories", value: TOOL_CATEGORIES.length },
  { label: "Backlog", unit: "open entries", value: backlog.total },
  { label: "Prototypes", unit: "pages", value: prototypes.length },
];

/** Opens a tool of the catalog by slug. Every slug that this page passes is in the catalog. */
function openSlug(slug: string): void {
  const tool = toolBySlug(slug);
  if (tool) emit("open", tool);
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-10 px-8 py-10">
    <header class="flex flex-col gap-1">
      <h1 class="text-display-xs font-semibold text-base-text-primary">Home</h1>
      <p class="text-sm text-base-text-tertiary">Dev tools for Splitz. They exist only on the dev server.</p>
    </header>

    <section aria-label="Totals" class="flex flex-wrap gap-x-12 gap-y-4">
      <div v-for="total in totals" :key="total.label" class="flex flex-col gap-1">
        <p class="text-xs font-medium tracking-wide text-base-text-quinary uppercase">{{ total.label }}</p>
        <p class="text-sm text-base-text-tertiary">
          <b class="font-semibold text-base-text-primary tabular-nums">{{ total.value }}</b> {{ total.unit }}
        </p>
      </div>
    </section>

    <div class="grid gap-10 lg:grid-cols-3">
      <section aria-labelledby="recent-heading" class="flex min-w-0 flex-col lg:col-span-2">
        <div class="dev-section-head">
          <h2 id="recent-heading">Continue working</h2>
          <span>{{ visits.length }} recent</span>
        </div>
        <ul v-if="visits.length > 0" class="flex flex-col">
          <li v-for="{ tool, at } in recentTools(visits)" :key="tool.slug">
            <button type="button" class="dev-row" @click="emit('open', tool)">
              <span class="dev-row-icon"><ToolIcon :icon="tool.icon" /></span>
              <span class="flex min-w-0 flex-1 flex-col gap-0.5">
                <b class="truncate text-sm font-medium text-base-text-primary">{{ tool.name }}</b>
                <span class="truncate text-xs text-base-text-quaternary">{{ tool.description }}</span>
              </span>
              <span class="text-xs text-base-text-quinary tabular-nums max-sm:hidden">{{ timeAgo(at, now) }}</span>
              <PhArrowUpRight class="dev-row-arrow" aria-hidden="true" />
            </button>
          </li>
        </ul>
        <div v-else class="flex flex-col gap-3 py-4">
          <p class="text-sm text-base-text-tertiary">The tools you open show here. Start with one of these:</p>
          <div class="flex flex-wrap gap-x-5 gap-y-2">
            <button
              v-for="slug in ['app', 'design-system', 'prototypes']"
              :key="slug"
              type="button"
              class="dev-link"
              @click="openSlug(slug)"
            >
              {{ toolBySlug(slug)?.name }}
              <PhArrowUpRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <div class="flex min-w-0 flex-col gap-10">
        <section aria-labelledby="backlog-heading" class="flex flex-col gap-3">
          <div class="flex flex-col">
            <div class="dev-section-head">
              <h2 id="backlog-heading">Backlog</h2>
              <span v-if="backlog.updated">Updated {{ backlog.updated }}</span>
            </div>
            <dl class="flex flex-col">
              <div v-for="group in backlog.groups" :key="group.text" class="dev-stat">
                <dt>{{ group.text }}</dt>
                <dd>{{ group.count }}</dd>
              </div>
            </dl>
          </div>
          <button type="button" class="dev-link self-start" @click="openSlug('backlog')">
            Open backlog <PhArrowUpRight aria-hidden="true" />
          </button>
        </section>

        <section aria-labelledby="prototypes-heading" class="flex flex-col gap-3">
          <div class="flex flex-col">
            <div class="dev-section-head">
              <h2 id="prototypes-heading">Prototypes</h2>
              <span>{{ prototypes.length }}</span>
            </div>
            <dl class="flex flex-col">
              <div v-for="{ status, count } in prototypeCounts" :key="status ?? 'none'" class="dev-stat">
                <dt><StatusMark :status="status" /></dt>
                <dd>{{ count }}</dd>
              </div>
            </dl>
          </div>
          <button type="button" class="dev-link self-start" @click="openSlug('prototypes')">
            Open prototypes <PhArrowUpRight aria-hidden="true" />
          </button>
        </section>
      </div>
    </div>

    <section aria-labelledby="all-heading" class="flex flex-col">
      <div class="dev-section-head">
        <h2 id="all-heading">All tools</h2>
        <span>{{ DEV_TOOLS.length }}</span>
      </div>
      <div class="grid gap-x-12 md:grid-cols-2">
        <div v-for="group in groups" :key="group.category" class="flex min-w-0 flex-col">
          <h3
            class="flex items-center justify-between py-3 text-xs font-medium tracking-wide text-base-text-quinary uppercase"
          >
            {{ group.category }} <span class="tabular-nums">{{ group.tools.length }}</span>
          </h3>
          <button
            v-for="tool in group.tools"
            :key="tool.slug"
            type="button"
            class="dev-row"
            @click="emit('open', tool)"
          >
            <span class="dev-row-icon"><ToolIcon :icon="tool.icon" /></span>
            <span class="flex min-w-0 flex-1 flex-col gap-0.5">
              <b class="truncate text-sm font-medium text-base-text-primary">{{ tool.name }}</b>
              <span class="truncate text-xs text-base-text-quaternary">{{ tool.note ?? tool.description }}</span>
            </span>
            <PhArrowUpRight class="dev-row-arrow" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
