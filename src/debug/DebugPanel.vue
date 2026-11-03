<script setup lang="ts">
/*
 * The debug panel: a bug button in the bottom-right corner, the panel that it opens, and the strip of active
 * simulations at the top of the screen. App.vue loads it only when gate.ts allows it.
 *
 * - Ctrl+Shift+D (Cmd+Shift+D on macOS) opens and closes the panel. It also shows the button again after "Hide".
 * - "Hide" removes the button and the strip until the next reload, for screenshots and screen recordings.
 * - Search finds rows by their label and by the labels of their choices and actions, in every locale.
 */
import { PhBug, PhMagnifyingGlass, PhX } from "@phosphor-icons/vue";
import { useQueryCache } from "@pinia/colada";
import { useEventListener, useIntervalFn } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { TooltipProvider } from "reka-ui";
import { computed, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { apiBasePath } from "@/backend/config";
import { useUserStore } from "@/stores/user";

import { installApiSimulation } from "./api-simulation";
import DebugPanelGroup from "./DebugPanelGroup.vue";
import DebugSimStrip from "./DebugSimStrip.vue";
import { formatInBundle } from "./locale";
import { addDebugMessages } from "./messages";
import { isPanelShortcut, loadPanelPrefs, savePanelPrefs, toggleId } from "./panel-prefs";
import { activeSims, rowSearchKeys, type DebugGroup, type DebugRow } from "./registry";
import { matchesQuery } from "./search";
import { createDebugGroups } from "./sections";

// backend/config.ts throws at start-up when the base URL is missing; the check here only narrows the type.
if (apiBasePath) installApiSimulation(apiBasePath);

const fluent = useFluent();
const { $t } = fluent;
const startBundles = [...fluent.bundles.value];
addDebugMessages(startBundles);

/** Read-outs from `localStorage` read this; it changes every 5 seconds and after each action. */
const tick = ref(0);
useIntervalFn(() => tick.value++, 5000);

const groups = createDebugGroups({
  bundles: fluent.bundles,
  queryCache: useQueryCache(),
  router: useRouter(),
  startBundles,
  t: (key, args) => $t(key, args),
  tick,
  userStore: useUserStore(),
});

const prefs = reactive(loadPanelPrefs(localStorage));
watch(prefs, () => savePanelPrefs(localStorage, prefs), { deep: true });

/** Hidden until the next reload; the shortcut brings the button back. */
const hidden = ref(false);

useEventListener(
  window,
  "keydown",
  (event: KeyboardEvent) => {
    if (!isPanelShortcut(event)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (hidden.value) {
      hidden.value = false;
      prefs.open = true;
    } else {
      prefs.open = !prefs.open;
    }
  },
  { capture: true }
);

function hide() {
  prefs.open = false;
  hidden.value = true;
}

const query = ref("");
const searching = computed(() => query.value.trim() !== "");

/** Formats each key in every locale. The texts never change, so this runs once per key. */
const searchNames = new Map<string, string[]>();
function namesOf(keys: string[]): string[] {
  return keys.flatMap((key) => {
    let names = searchNames.get(key);
    if (!names) {
      names = startBundles.map((bundle) => formatInBundle(bundle, key)).filter((name) => name !== null);
      searchNames.set(key, names);
    }
    return names;
  });
}

/** The rows of a group that the search finds. A hit on the group title shows all its rows. */
function visibleRows(group: DebugGroup): DebugRow[] {
  if (!searching.value || matchesQuery(namesOf([group.title]), query.value)) return group.rows;
  return group.rows.filter((row) => matchesQuery(namesOf(rowSearchKeys(row)), query.value));
}

const shownGroups = computed(() =>
  groups.map((group) => ({ group, rows: visibleRows(group) })).filter(({ rows }) => rows.length > 0)
);

const sims = computed(() => activeSims(groups));

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || !query.value) return;
  // Escape clears the search first; the next Escape goes to the page.
  event.stopPropagation();
  query.value = "";
}
</script>

<template>
  <Teleport to="body">
    <TooltipProvider>
      <DebugSimStrip v-if="!hidden" :sims="sims" />

      <div
        v-if="!hidden"
        class="fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[1000] flex flex-col items-end gap-2"
      >
        <Transition name="debug-panel">
          <section
            v-if="prefs.open"
            :aria-label="$t('debug-panel-title')"
            class="flex max-h-[min(36rem,calc(100dvh-6rem))] w-[min(22rem,calc(100vw-1.5rem))] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-base-border-secondary bg-base-bg-primary shadow-xl"
          >
            <header class="flex items-center gap-1 border-b border-base-border-secondary py-1.5 pr-1.5 pl-3">
              <span class="flex-1 text-sm font-semibold text-base-text-primary">{{ $t("debug-panel-title") }}</span>
              <button
                type="button"
                class="rounded-full px-2 py-1 text-xs font-medium text-base-text-secondary hover:bg-base-bg-secondary focus-visible:ring-2 focus-visible:ring-util-color-brand-600 focus-visible:outline-none"
                :title="$t('debug-panel-hide-tip')"
                @click="hide"
              >
                {{ $t("debug-panel-hide") }}
              </button>
              <button
                type="button"
                :aria-label="$t('debug-panel-close')"
                class="flex size-7 items-center justify-center rounded-full text-base-fg-secondary hover:bg-base-bg-secondary focus-visible:ring-2 focus-visible:ring-util-color-brand-600 focus-visible:outline-none"
                @click="prefs.open = false"
              >
                <PhX aria-hidden="true" class="size-4" />
              </button>
            </header>

            <div class="flex min-h-0 flex-1 scrollbar-styled flex-col gap-2 overflow-y-auto p-2">
              <DebugPanelGroup
                v-for="{ group, rows } in shownGroups"
                :key="group.id"
                :group="group"
                :rows="rows"
                :open="searching || !prefs.closed.includes(group.id)"
                :searching="searching"
                @toggle="prefs.closed = toggleId(prefs.closed, group.id)"
              />
              <p v-if="shownGroups.length === 0" class="px-2 py-6 text-center text-sm text-base-text-tertiary">
                {{ $t("debug-panel-no-match", { query: query.trim() }) }}
              </p>
            </div>

            <!-- At the foot, so the field stays in place while the results above it grow and shrink. -->
            <div class="flex items-center gap-2 border-t border-base-border-secondary px-3 py-2">
              <PhMagnifyingGlass aria-hidden="true" class="size-4 shrink-0 text-base-fg-tertiary" />
              <input
                v-model="query"
                type="search"
                :aria-label="$t('debug-panel-search-label')"
                :placeholder="$t('debug-panel-search')"
                class="min-w-0 flex-1 bg-transparent text-sm text-base-text-primary placeholder:text-base-text-tertiary focus-visible:outline-none"
                @keydown="onSearchKeydown"
              />
            </div>
          </section>
        </Transition>

        <button
          type="button"
          :aria-label="$t('debug-panel-title')"
          :aria-expanded="prefs.open"
          :title="$t('debug-panel-toggle-tip')"
          :class="[
            'flex size-10 items-center justify-center rounded-full border shadow-lg transition-[background-color,border-color,transform] duration-(--motion-duration-feedback) focus-visible:ring-2 focus-visible:ring-util-color-brand-600 focus-visible:outline-none active:scale-95',
            prefs.open
              ? 'border-base-border-brand bg-base-bg-brand text-base-fg-brand'
              : 'border-base-border-secondary bg-base-bg-primary text-base-fg-secondary hover:bg-base-bg-secondary',
          ]"
          @click="prefs.open = !prefs.open"
        >
          <PhBug aria-hidden="true" class="size-5" />
        </button>
      </div>
    </TooltipProvider>
  </Teleport>
</template>

<style scoped>
/*
 * The panel grows out of the bug button (origin bottom right). It enters a little slower than it leaves.
 * Under reduced motion the duration tokens are 0ms, so the panel shows and hides at once.
 */
.debug-panel-enter-active {
  transition:
    transform var(--motion-duration-state) var(--motion-easing-enter),
    opacity var(--motion-duration-state) var(--motion-easing-enter);
}

.debug-panel-leave-active {
  transition:
    transform var(--motion-duration-exit) var(--motion-easing-exit),
    opacity var(--motion-duration-exit) var(--motion-easing-exit);
}

.debug-panel-enter-from,
.debug-panel-leave-to {
  transform: translateY(8px) scale(0.96);
  opacity: 0;
}
</style>
