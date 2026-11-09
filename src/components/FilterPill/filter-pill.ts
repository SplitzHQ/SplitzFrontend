/**
 * The colors of the two states of FilterPill. A control that must look like a pill in the same state, for example a
 * choice tile in a filter sheet, uses these classes and does not copy them. See `STATE_RULES` in `filter-pill.usage.ts`.
 */
export const FILTER_PILL_STATE_CLASS: Record<"idle" | "selected", string> = {
  idle: "border-base-border-secondary bg-transparent text-base-text-secondary hover:bg-base-bg-neutral active:bg-base-bg-neutral_hover",
  selected:
    "border-transparent bg-core-alpha-brand-20 text-base-text-primary hover:bg-core-alpha-brand-30 active:bg-core-alpha-brand-40",
};
