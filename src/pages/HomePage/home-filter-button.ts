/**
 * The classes of the filter button in the home search field: a ghost sm SIconButton with a brand icon and a
 * translucent brand fill. The rule is "Search filter" in `ICON_RULES` of `src/components/SButton/button.usage.ts`.
 * Prototypes that draw the home header import this constant, so they show the same look as the app.
 *
 * The classes set only the ghost properties of SButtonBase. A `bg-*` class would paint the root `<button>`, which is
 * a square box around the round button.
 */
export const HOME_FILTER_BUTTON_CLASS =
  "[--s-button-ghost-bg:var(--comp-search-filter-bg)] [--s-button-ghost-bg-hover:var(--comp-search-filter-bg-hover)] [--s-button-ghost-bg-pressed:var(--comp-search-filter-bg-pressed)] [--s-button-ghost-icon:var(--base-fg-brand)]";
