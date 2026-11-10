<script setup lang="ts">
import { PhMagnifyingGlass } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { type ComponentPublicInstance, computed, ref, useTemplateRef, watch } from "vue";

import { categoryColorMap } from "@/components/Category/category-color";
import CategoryIcon from "@/components/Category/CategoryIcon.vue";
import CategoryText from "@/components/Category/CategoryText.vue";
import EmptyState from "@/components/EmptyState/EmptyState.vue";
import SButton from "@/components/SButton/SButton.vue";
import Sheet from "@/components/Sheet/Sheet.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import {
  categorySubcategories,
  getMainCategory,
  mainCategories,
  type MainCategory,
  type Subcategory,
} from "@/libs/categories";

import { useCategorySearch } from "./useCategorySearch";

const model = defineModel<boolean>({ required: true });
const category = defineModel<Subcategory>("category", { required: true });

const { $t } = useFluent();

const { searchQuery, matchedSubcategories, buildSearchIndex, clearSearch } = useCategorySearch();

const visibleSections = computed(() => {
  const matched = matchedSubcategories.value;
  return mainCategories
    .map((main) => {
      const items = categorySubcategories[main].filter((sub) => (matched ? matched.has(sub) : true));
      return { items, main };
    })
    .filter((section) => section.items.length > 0);
});

const stickyHeader = useTemplateRef<HTMLElement>("stickyHeader");
const sectionEls = ref<Record<MainCategory, HTMLElement | null>>({} as Record<MainCategory, HTMLElement | null>);

function setSectionEl(main: MainCategory, el: Element | ComponentPublicInstance | null) {
  sectionEls.value[main] = el instanceof HTMLElement ? el : null;
}

function scrollToSection(main: MainCategory) {
  const el = sectionEls.value[main];
  if (!el) return;
  const headerHeight = stickyHeader.value?.offsetHeight ?? 0;
  const offsetTop = el.offsetTop - headerHeight;
  stickyHeader.value?.parentElement?.scrollTo({ behavior: "smooth", top: offsetTop });
}

function selectCategory(next: Subcategory) {
  category.value = next;
  model.value = false;
}

watch(
  () => model.value,
  (isOpen) => {
    if (!isOpen) return;
    // Reset search when opening
    clearSearch();
    buildSearchIndex();
    // Ensure the current category's section is reachable
    const main = getMainCategory(category.value);
    // Defer scroll until after render
    queueMicrotask(() => {
      scrollToSection(main);
    });
  }
);
</script>

<template>
  <Sheet
    v-model="model"
    :title="$t('new-expense-review-actions-select-category')"
    detent="large"
    detent-sizing="height"
    :show-handle="false"
  >
    <!--
      The negative offset covers the top padding of the sheet, so a stuck header has no gap above it.
      The negative margin takes the gap under the title into the header, so this padding gives the same gap.
    -->
    <div ref="stickyHeader" class="sticky -top-6 z-sticky -mt-5 bg-comp-sheet-bg pt-5 pb-4">
      <div class="flex flex-col gap-3">
        <!-- Search -->
        <TextInput
          v-model="searchQuery"
          hide-label
          :label="$t('new-expense-review-category-search-placeholder')"
          :placeholder="$t('new-expense-review-category-search-placeholder')"
        >
          <template #icon>
            <PhMagnifyingGlass />
          </template>
        </TextInput>

        <!-- Category chips -->
        <div class="flex gap-2 overflow-x-auto whitespace-nowrap">
          <button
            v-for="main in mainCategories"
            :key="main"
            type="button"
            class="shrink-0 rounded-full bg-base-bg-brand-subtle px-3 py-1.5 text-sm font-medium text-base-text-brand"
            @click="scrollToSection(main)"
          >
            {{ $t(`main_categories-${main}`) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Sections -->
    <div class="flex grow flex-col gap-4">
      <EmptyState
        v-if="visibleSections.length === 0"
        :icon="PhMagnifyingGlass"
        :title="$t('new-expense-review-category-empty-title', { keyword: searchQuery.trim() })"
        title-tag="h3"
      >
        <template #action>
          <SButton variant="secondary" size="md" @click="clearSearch">
            {{ $t("new-expense-review-category-clear-search") }}
          </SButton>
        </template>
      </EmptyState>
      <section v-for="section in visibleSections" :key="section.main" :ref="(el) => setSectionEl(section.main, el)">
        <div class="mb-2 text-sm font-semibold text-base-text-secondary">
          {{ $t(`main_categories-${section.main}`) }}
        </div>

        <div class="grid grid-cols-4 gap-3">
          <button
            v-for="sub in section.items"
            :key="sub"
            type="button"
            class="flex flex-col items-center gap-1"
            @click="selectCategory(sub)"
          >
            <div
              :class="[
                categoryColorMap[section.main],
                'flex aspect-square w-full items-center justify-center rounded-2xl p-4 icon-9',
              ]"
            >
              <CategoryIcon :category="sub" />
            </div>
            <div class="w-full text-center text-xs leading-4 font-medium text-base-text-primary">
              <CategoryText :category="sub" />
            </div>
          </button>
        </div>
      </section>
    </div>
  </Sheet>
</template>
