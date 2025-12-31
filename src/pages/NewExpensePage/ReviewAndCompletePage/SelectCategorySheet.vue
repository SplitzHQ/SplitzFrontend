<script setup lang="ts">
import { PhMagnifyingGlass } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { type ComponentPublicInstance, computed, ref, useTemplateRef, watch } from "vue";

import CategoryIcon from "@/components/Category/CategoryIcon.vue";
import CategoryText from "@/components/Category/CategoryText.vue";
import { categoryColorMap } from "@/components/Category/category-color";
import Sheet from "@/components/Sheet/Sheet.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import {
  categorySubcategories,
  getMainCategory,
  mainCategories,
  type MainCategory,
  type Subcategory
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
      return { main, items };
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
  stickyHeader.value?.parentElement?.scrollTo({ top: offsetTop, behavior: "smooth" });
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
  <Sheet v-model="model" detent="large" detent-sizing="height" :show-handle="false">
    <!-- Some hack here to override the transparent top padding from the sheet -->
    <div ref="stickyHeader" class="sticky -top-4 z-sticky -mt-4 flex flex-col gap-5 bg-base-bg-primary pt-4 pb-4">
      <div class="text-lg font-medium text-base-text-tertiary">
        {{ $t("new-expense-review-actions-select-category") }}
      </div>

      <div class="flex flex-col gap-3">
        <!-- Search -->
        <div class="flex items-center gap-2 rounded-full bg-util-alpha-black-5 px-3 py-2.5">
          <PhMagnifyingGlass class="icon-5 text-base-fg-brand" />
          <TextInput
            v-model="searchQuery"
            :placeholder="$t('new-expense-review-category-search-placeholder')"
            class="w-full"
          />
        </div>

        <!-- Category chips -->
        <div class="flex gap-2 overflow-x-auto whitespace-nowrap">
          <button
            v-for="main in mainCategories"
            :key="main"
            type="button"
            class="shrink-0 rounded-full bg-base-bg-brand px-3 py-1.5 text-sm font-medium text-base-text-brand"
            @click="scrollToSection(main)"
          >
            {{ $t(`main_categories-${main}`) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Sections -->
    <div class="flex grow flex-col gap-4">
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
                'flex aspect-square w-full items-center justify-center rounded-2xl p-4 icon-9'
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
