import { shallowRef } from "vue";

import type { HomeBalance, HomeSort } from "./home-balances";

/**
 * The filter of the group list on HomePage. The prototype `2026-11-05-home-filter` (SPZ-84) decided these rules:
 * - The filter is one choice. `all` turns it off.
 * - A group matches by the balances of the user, so a group with two currencies can match "You are owed" and "You owe".
 * - The filter and the search work together.
 * - The total balance does not follow the filter.
 */

/** The conditions of the filter, in the order of the sheet. */
export const HOME_FILTERS = ["all", "unsettled", "owed", "owe"] as const;
export type HomeFilter = (typeof HOME_FILTERS)[number];

/**
 * The filter of the list. It is module state, so it stays when the user opens a group and comes back, and it goes back
 * to `all` when the app starts again. A sort is different: the device keeps the sort.
 */
export const homeFilter = shallowRef<HomeFilter>("all");

/** Returns true when a group with these balances of the user matches the filter. */
export function matchesHomeFilter(myBalances: readonly HomeBalance[], filter: HomeFilter): boolean {
  if (filter === "owed") return myBalances.some(({ amount }) => amount > 0);
  if (filter === "owe") return myBalances.some(({ amount }) => amount < 0);
  if (filter === "unsettled") return myBalances.some(({ amount }) => amount !== 0);
  return true;
}

/** The message ids of the conditions. */
export const HOME_FILTER_LABELS: Record<HomeFilter, string> = {
  all: "home-all-groups",
  owe: "home-filter-owe",
  owed: "home-filter-owed",
  unsettled: "home-filter-unsettled",
};

/** The message ids of the line that shows when a condition hides every group. `all` never hides a group. */
export const HOME_FILTER_EMPTY_LABELS: Record<Exclude<HomeFilter, "all">, string> = {
  owe: "home-filter-empty-owe",
  owed: "home-filter-empty-owed",
  unsettled: "home-filter-empty-unsettled",
};

/** The message ids of the sort names. */
export const HOME_SORT_LABELS: Record<HomeSort, string> = {
  amount: "home-sort-amount",
  name: "home-sort-name",
  recent: "home-sort-recent",
};
