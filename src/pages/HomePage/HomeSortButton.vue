<script setup lang="ts">
import { PhCaretDown, PhCheck } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { ref } from "vue";

import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";

import { HOME_SORTS, type HomeSort } from "./home-balances";

/**
 * Sort trigger acting as the header above the `HomePage` group list.
 * Displays the active sort label and opens a bottom sheet to switch sort modes.
 *
 * Negative inline-start margin (`-ms-3.75`) compensates for the button's horizontal padding (`12px`), `1px` border,
 * and `2px` inner label padding so its label text aligns flush with the group avatars below.
 */
const sort = defineModel<HomeSort>({ required: true });

const { $t } = useFluent();

const isSheetOpen = ref(false);

/** Fluent message IDs for each `HomeSort` option. */
const SORT_LABEL_IDS: Record<HomeSort, string> = {
  amount: "home-sort-amount",
  name: "home-sort-name",
  recent: "home-sort-recent",
  unsettled: "home-sort-unsettled",
};

function selectSort(nextSort: HomeSort): void {
  sort.value = nextSort;
  isSheetOpen.value = false;
}
</script>

<template>
  <SButton
    class="-ms-[15px] shrink-0"
    variant="ghost"
    size="sm"
    :aria-label="$t('home-sort-button', { sort: $t(SORT_LABEL_IDS[sort]) })"
    data-testid="home-sort"
    @click="isSheetOpen = true"
  >
    {{ $t(SORT_LABEL_IDS[sort]) }}
    <template #icon-right><PhCaretDown /></template>
  </SButton>

  <Sheet v-model="isSheetOpen" :title="$t('home-sort-title')" detent="medium">
    <div class="flex flex-col">
      <button
        v-for="option in HOME_SORTS"
        :key="option"
        type="button"
        class="flex min-h-12 touch-manipulation items-center justify-between gap-3 text-left text-base text-base-text-primary"
        :aria-pressed="option === sort"
        :data-sort="option"
        @click="selectSort(option)"
      >
        {{ $t(SORT_LABEL_IDS[option]) }}
        <PhCheck v-if="option === sort" class="icon-5 text-base-fg-brand" aria-hidden="true" />
      </button>
    </div>
  </Sheet>
</template>
