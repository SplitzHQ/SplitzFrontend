import FlexSearch from "flexsearch";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";

import { getMainCategory, subcategories, type Subcategory } from "@/libs/categories";

interface FlexIndex {
  add: (id: string, content: string) => void;
  search: (query: string, limit?: number) => unknown;
}

export function useCategorySearch(options: { limit?: number } = {}) {
  const { $t } = useFluent();
  const { limit = 100 } = options;

  const searchQuery = ref("");
  const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase());

  const searchIndex = ref<FlexIndex | null>(null);

  function buildSearchIndex() {
    const index = new FlexSearch.Index({
      tokenize: "forward",
      cache: true
    });

    for (const sub of subcategories) {
      const main = getMainCategory(sub);
      const label = $t(`categories-${sub}`);
      const mainLabel = $t(`main_categories-${main}`);
      index.add(sub, `${label} ${mainLabel} ${sub.split("_").join(" ")} ${main}`);
    }

    searchIndex.value = index;
  }

  function ensureIndex() {
    if (!searchIndex.value) buildSearchIndex();
  }

  function clearSearch() {
    searchQuery.value = "";
  }

  const matchedSubcategories = computed<Set<Subcategory> | null>(() => {
    if (!normalizedQuery.value) return null;

    ensureIndex();

    const results = searchIndex.value?.search(normalizedQuery.value, limit);
    const set = new Set<Subcategory>();

    if (Array.isArray(results)) {
      for (const id of results) {
        if (typeof id === "string" && (subcategories as readonly string[]).includes(id)) {
          set.add(id as Subcategory);
        }
      }
    }

    return set;
  });

  return {
    searchQuery,
    normalizedQuery,
    matchedSubcategories,
    buildSearchIndex,
    clearSearch
  };
}
