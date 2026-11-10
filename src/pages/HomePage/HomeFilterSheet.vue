<script setup lang="ts">
import { PhArrowDownLeft, PhArrowUpRight, PhCircleHalf, PhSquaresFour } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, type Component } from "vue";

import { FILTER_PILL_STATE_CLASS } from "@/components/FilterPill/filter-pill";
import FilterPill from "@/components/FilterPill/FilterPill.vue";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";

import { HOME_SORTS, type HomeSort } from "./home-balances";
import { HOME_FILTER_LABELS, HOME_FILTERS, HOME_SORT_LABELS, type HomeFilter } from "./home-filter";

/**
 * The sheet of the filter and the sort of the group list. The prototype `2026-11-05-home-filter` (SPZ-84) decided it.
 * - `all`: the search filter button opens it. It has the sorts first and the filter second, and it stays open after a
 *   choice, so the user can change both.
 * - `filter` and `sort`: a pill above the list opens the sheet of its kind. A choice closes it.
 *
 * Each choice changes the list at once. Clear sits at the end of the title row and shows only when it has something to
 * clear. The sort is a preference of the device, so Clear in the full sheet clears only the filter.
 */
export type HomeFilterSheetMode = "all" | "filter" | "sort";

export interface HomeFilterSheetProps {
  mode: HomeFilterSheetMode;
  /** The number of groups that each condition shows, so the user sees an empty result before the tap. */
  counts: Record<HomeFilter, number>;
}

const { mode, counts } = defineProps<HomeFilterSheetProps>();

const open = defineModel<boolean>("open", { required: true });
const filter = defineModel<HomeFilter>("filter", { required: true });
const sort = defineModel<HomeSort>("sort", { required: true });

const { $t } = useFluent();

/** The icons of the tiles. The two debt states take the colors of the amounts in the group rows. */
const FILTER_ICONS: Record<HomeFilter, { icon: Component; class?: string }> = {
  all: { icon: PhSquaresFour },
  owe: { class: "text-base-text-owe", icon: PhArrowUpRight },
  owed: { class: "text-base-text-success", icon: PhArrowDownLeft },
  unsettled: { icon: PhCircleHalf },
};

const title = computed(() => {
  if (mode === "sort") return $t("home-sort-title");
  return $t(mode === "filter" ? "home-filter-show" : "home-filter-sheet-title");
});

const showsSort = computed(() => mode !== "filter");
const showsFilter = computed(() => mode !== "sort");

/** The sort sheet clears the sort. The other two clear only the filter, because the sort is a preference. */
const canClear = computed(() => (mode === "sort" ? sort.value !== "recent" : filter.value !== "all"));

function clear() {
  if (mode === "sort") sort.value = "recent";
  else filter.value = "all";
}

function chooseFilter(next: HomeFilter) {
  filter.value = next;
  if (mode !== "all") open.value = false;
}

function chooseSort(next: HomeSort) {
  sort.value = next;
  if (mode !== "all") open.value = false;
}
</script>

<template>
  <!--
    The title row holds Clear, so the sheet draws its own title and gets its name from `label`. The full sheet stays open
    after a choice, so it has a close button for a screen reader. A small sheet closes with the choice.
  -->
  <Sheet
    v-model="open"
    :label="title"
    :detent="mode === 'all' ? 'large' : 'medium'"
    :show-close-button="mode === 'all'"
  >
    <!-- `pt-1.5` and `gap-4.5` match the space of a Sheet `title`, as in NotificationPanel. -->
    <div class="flex flex-col gap-4.5">
      <div data-sheet-handle class="flex min-h-8 touch-none items-center justify-between gap-3 pt-1.5">
        <h2 class="text-display-xs font-semibold text-base-text-primary">{{ title }}</h2>
        <Transition
          enter-active-class="transition-opacity duration-state ease-enter"
          enter-from-class="opacity-0"
          leave-active-class="transition-opacity duration-exit ease-exit"
          leave-to-class="opacity-0"
        >
          <SButton v-if="canClear" variant="secondary" size="sm" data-testid="home-filter-clear" @click="clear">
            {{ $t("home-filter-clear") }}
          </SButton>
        </Transition>
      </div>

      <div class="flex flex-col gap-8">
        <!-- The sort always comes first. -->
        <section v-if="showsSort" class="flex flex-col gap-3">
          <h3 v-if="mode === 'all'" class="text-base font-semibold text-base-text-primary">
            {{ $t("home-sort-title") }}
          </h3>
          <div role="radiogroup" :aria-label="$t('home-sort-title')" class="flex flex-wrap gap-2">
            <FilterPill
              v-for="option in HOME_SORTS"
              :key="option"
              size="md"
              role="radio"
              :aria-checked="option === sort"
              :selected="option === sort"
              :data-sort="option"
              @click="chooseSort(option)"
            >
              {{ $t(HOME_SORT_LABELS[option]) }}
            </FilterPill>
          </div>
        </section>

        <section v-if="showsFilter" class="flex flex-col gap-3">
          <h3 v-if="mode === 'all'" class="text-base font-semibold text-base-text-primary">
            {{ $t("home-filter-show") }}
          </h3>
          <!--
            Each tile has the name and the icon in its first row, and the count in its own row. The icon sits at the top
            right, so the name and the count share one left edge. Text side by side has one size.
          -->
          <div role="radiogroup" :aria-label="$t('home-filter-show')" class="grid grid-cols-2 gap-2">
            <button
              v-for="option in HOME_FILTERS"
              :key="option"
              type="button"
              role="radio"
              :aria-checked="option === filter"
              :data-filter="option"
              :class="[
                'flex min-h-20 touch-manipulation flex-col items-start justify-between gap-2 rounded-2xl border p-3 text-left select-none',
                'transition-[color,background-color,border-color,scale] duration-state ease-standard active:scale-98',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-base-border-brand',
                FILTER_PILL_STATE_CLASS[option === filter ? 'selected' : 'idle'],
              ]"
              @click="chooseFilter(option)"
            >
              <span class="flex w-full items-start justify-between gap-2 text-sm font-medium">
                {{ $t(HOME_FILTER_LABELS[option]) }}
                <component
                  :is="FILTER_ICONS[option].icon"
                  aria-hidden="true"
                  :class="['shrink-0 icon-5', FILTER_ICONS[option].class]"
                />
              </span>
              <span class="text-display-xs font-semibold tabular-nums">{{ counts[option] }}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  </Sheet>
</template>
