<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";

import colorCss from "@/assets/color.css?raw";
import { copyToClipboard } from "@/libs/copy-to-clipboard";

import DocSection from "../components/DocSection.vue";
import { docsDark } from "../docs-theme";
import { TOKEN_GROUPS, declarations, declaredTokens, ruleBody } from "../tokens";

/** Groups drawn as rows of steps, one row per hue. The other color groups are drawn as cards. */
const SCALE_GROUPS = new Set(["core-color", "core-alpha", "util-color", "util-alpha"]);

const tokens = declaredTokens(colorCss);
const lightRefs = new Map(declarations(ruleBody(colorCss, ":root") ?? ""));
const darkRefs = new Map(declarations(ruleBody(colorCss, ".dark") ?? ""));

const groups = TOKEN_GROUPS.filter((group) => group.file === "color.css").map((group) => {
  const names = tokens.filter((name) => group.pattern.test(name));
  // "--core-color-brand-25" → hue "brand", step "25"
  const rows = new Map<string, { name: string; step: string }[]>();
  for (const name of names) {
    const match = name.match(/^(.*)-([\w.]+)$/);
    const hue = match?.[1]?.replace(/^--(core|util)-(color|alpha)-/, "") ?? name;
    rows.set(hue, [...(rows.get(hue) ?? []), { name, step: match?.[2] ?? "" }]);
  }
  return { ...group, names, rows: [...rows.entries()], scale: SCALE_GROUPS.has(group.id) };
});

// The resolved values change with the theme, so read them again after each switch.
const resolved = ref(new Map<string, string>());
function readValues() {
  const style = getComputedStyle(document.documentElement);
  resolved.value = new Map(tokens.map((name) => [name, style.getPropertyValue(name).trim()]));
}
watch(docsDark, readValues, { flush: "post", immediate: true });

const query = ref("");
const visibleGroups = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((group) => ({
      ...group,
      names: group.names.filter((name) => name.includes(q)),
      rows: group.rows.filter(([, steps]) => steps.some(({ name }) => name.includes(q))),
    }))
    .filter((group) => group.names.length > 0);
});

/** Shows what a semantic token points to: the core token name, without the leading dashes. */
function refName(name: string, refs: Map<string, string>): string {
  return refs.get(name)?.replace(/^var\(--(.*)\)$/, "$1") ?? "—";
}

async function copy(name: string) {
  const text = `var(${name})`;
  if (await copyToClipboard(text)) toast.success(`Copied ${text}`);
}
</script>

<template>
  <div class="flex flex-col gap-10">
    <label class="flex flex-col gap-1.5 text-sm font-medium">
      Filter tokens
      <input
        v-model="query"
        type="search"
        placeholder="brand, error, bg-primary…"
        class="h-10 rounded-full border border-base-border-primary bg-base-bg-white px-4 text-base-text-primary placeholder:text-base-text-placeholder focus-visible:ring-2 focus-visible:ring-util-color-brand-600 focus-visible:outline-none dark:bg-base-bg-secondary"
      />
    </label>
    <p v-if="visibleGroups.length === 0" class="text-sm text-base-text-tertiary">No token matches “{{ query }}”.</p>
    <DocSection
      v-for="group in visibleGroups"
      :key="group.id"
      :title="group.title"
      :tag="`${group.layer} · ${group.names.length}`"
      :summary="group.summary"
    >
      <div v-if="group.scale" class="flex flex-col gap-2 overflow-x-auto">
        <div v-for="[hue, steps] in group.rows" :key="hue" class="flex items-center gap-3">
          <span class="w-24 shrink-0 font-mono text-xs text-base-text-secondary">{{ hue }}</span>
          <div class="flex gap-1">
            <button
              v-for="{ name, step } in steps"
              :key="name"
              type="button"
              class="ds-chip flex size-11 shrink-0 items-end justify-start rounded-lg p-1 font-mono text-[10px] ring-1 ring-base-border-tertiary ring-inset"
              :style="{ background: `var(${name})` }"
              :title="`${name}: ${resolved.get(name)}`"
              :aria-label="`Copy ${name}`"
              @click="copy(name)"
            >
              <span class="rounded bg-base-bg-white/80 px-0.5 text-base-text-primary dark:bg-base-bg-primary/80">
                {{ step }}
              </span>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
        <button
          v-for="name in group.names"
          :key="name"
          type="button"
          class="ds-chip flex items-center gap-3 rounded-2xl border border-base-border-tertiary p-3 text-left"
          :aria-label="`Copy ${name}`"
          @click="copy(name)"
        >
          <span
            class="size-10 shrink-0 rounded-lg ring-1 ring-base-border-tertiary ring-inset"
            :style="{ background: `var(${name})` }"
          />
          <span class="flex min-w-0 flex-col gap-0.5">
            <code class="truncate font-mono text-xs font-semibold text-base-text-primary">{{ name }}</code>
            <span class="truncate font-mono text-[11px] text-base-text-tertiary">
              {{ refName(name, docsDark ? darkRefs : lightRefs) }}
            </span>
            <span class="font-mono text-[11px] text-base-text-quaternary">{{ resolved.get(name) }}</span>
          </span>
        </button>
      </div>
    </DocSection>
  </div>
</template>

<style scoped>
.ds-chip {
  transition: transform var(--motion-duration-feedback) var(--motion-easing-standard);
}
.ds-chip:active {
  transform: scale(0.96);
}
.ds-chip:focus-visible {
  outline: 2px solid var(--util-color-brand-600);
  outline-offset: 2px;
}
</style>
