/**
 * The classes of the filter button in the home search field: a ghost sm SIconButton with a brand icon and a
 * translucent brand fill. The rule is "Search filter" in `ICON_RULES` of `src/components/SButton/button.usage.ts`.
 * Prototypes that draw the home header import this constant, so they show the same look as the app.
 */
export const HOME_FILTER_BUTTON_CLASS =
  "bg-comp-search-filter-bg [--s-button-ghost-icon:var(--base-fg-brand)] hover:bg-comp-search-filter-bg-hover active:bg-comp-search-filter-bg-pressed";
