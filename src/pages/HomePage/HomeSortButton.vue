<script setup lang="ts">
import { PhCaretDown, PhCheck } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { ref } from "vue";

import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";

import { HOME_SORTS, type HomeSort } from "./home-balances";

/**
 * The title of the group list. The page has only this list, so the sort button is its title and says the
 * current sort. A tap opens a choice sheet, and a choice closes the sheet.
 *
 * The button moves out by 15px (its 12px padding, its 1px border and the 2px padding of its label), so the ink of its
 * text starts at the left edge of the group avatars.
 */
const sort = defineModel<HomeSort>({ required: true });

const { $t } = useFluent();

const open = ref(false);

/** The message ids of the sort names. */
const SORT_LABELS: Record<HomeSort, string> = {
  amount: "home-sort-amount",
  name: "home-sort-name",
  recent: "home-sort-recent",
  unsettled: "home-sort-unsettled",
};

function pick(next: HomeSort) {
  sort.value = next;
  open.value = false;
}
</script>

<template>
  <SButton
    class="-ms-[15px] shrink-0"
    variant="ghost"
    size="sm"
    :aria-label="$t('home-sort-button', { sort: $t(SORT_LABELS[sort]) })"
    data-testid="home-sort"
    @click="open = true"
  >
    {{ $t(SORT_LABELS[sort]) }}
    <template #icon-right><PhCaretDown /></template>
  </SButton>

  <Sheet v-model="open" :title="$t('home-sort-title')" detent="medium">
    <div class="flex flex-col">
      <button
        v-for="option in HOME_SORTS"
        :key="option"
        type="button"
        class="flex min-h-12 touch-manipulation items-center justify-between gap-3 text-left text-base text-base-text-primary"
        :aria-pressed="option === sort"
        :data-sort="option"
        @click="pick(option)"
      >
        {{ $t(SORT_LABELS[option]) }}
        <PhCheck v-if="option === sort" class="icon-5 text-base-fg-brand" aria-hidden="true" />
      </button>
    </div>
  </Sheet>
</template>
