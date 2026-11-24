/**
 * Tailwind classes for the filter icon button inside `HomeSearchBar`: a small `ghost` `SIconButton` with a brand icon
 * and translucent `comp-search-filter-*` fill (see "Search filter" in `src/components/SButton/button.usage.ts`).
 * Shared with devtools header previews so they stay visually aligned with `HomePage`.
 */
export const HOME_FILTER_BUTTON_CLASS =
  "bg-comp-search-filter-bg [--s-button-ghost-icon:var(--base-fg-brand)] hover:bg-comp-search-filter-bg-hover active:bg-comp-search-filter-bg-pressed";
