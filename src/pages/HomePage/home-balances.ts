/**
 * Balance summary and sorting helpers for `HomePage`: group settlement status labels, primary total selection, and
 * group-list sorting.
 *
 * Because Splitz does not convert between currencies, balances in different currencies are never summed or compared
 * directly; cross-group comparisons operate on the user's most frequent non-zero currency instead.
 */

/** Single-currency balance for the current user (positive means owed to the user; negative means owed by the user). */
export interface HomeBalance {
  amount: number;
  currency: string;
}

/**
 * Settlement status label for a group row where the current user has no open balance:
 * - `"none"`: the group has zero recorded expenses.
 * - `"all"`: every member in the group is settled at zero.
 * - `"you"`: the current user is settled, while other members still carry open balances.
 * - `null`: the current user has a non-zero balance, so the row renders currency pills instead.
 */
export type SettledState = "none" | "all" | "you" | null;

/** Group fields consumed by `HomePage` balance and sort helpers. */
export interface HomeGroupBalances {
  name: string;
  lastActivityTime: Date;
  /** Current user's balances in this group (may include zero-valued entries). */
  myBalances: readonly HomeBalance[];
  settled: SettledState;
}

/** Group-list sort modes ordered as presented in `HomeSortButton`. */
export const HOME_SORTS = ["recent", "unsettled", "amount", "name"] as const;
export type HomeSort = (typeof HOME_SORTS)[number];

/**
 * Determines the `SettledState` label for a group row.
 *
 * @param transactionCount - Total number of expenses recorded in the group.
 * @param myBalances - Current user's parsed balances in the group.
 * @param groupBalances - Raw decimal balance strings for all group members from the backend.
 */
export function settledState(
  transactionCount: number,
  myBalances: readonly HomeBalance[],
  groupBalances: readonly { balance: string }[]
): SettledState {
  if (transactionCount === 0) return "none";
  if (myBalances.some(({ amount }) => amount !== 0)) return null;
  // Parse numerically so `"0"`, `"0.00"`, and `"-0"` all evaluate to zero.
  return groupBalances.every(({ balance }) => Number.parseFloat(balance) === 0) ? "all" : "you";
}

/**
 * Finds the currency with non-zero balances across the largest number of groups.
 * Ties go to the first currency encountered, so pass `groups` ordered most-recent-first to break ties by recent activity.
 */
export function mostUsedCurrency(groups: readonly Pick<HomeGroupBalances, "myBalances">[]): string | undefined {
  const groupCountByCurrency = new Map<string, number>();
  for (const { myBalances } of groups) {
    // Count each currency at most once per group, even if the group contains multiple balance entries for it.
    const groupCurrencies = new Set(myBalances.filter(({ amount }) => amount !== 0).map(({ currency }) => currency));
    for (const currency of groupCurrencies) {
      groupCountByCurrency.set(currency, (groupCountByCurrency.get(currency) ?? 0) + 1);
    }
  }
  let topCurrency: string | undefined;
  let topGroupCount = 0;
  for (const [currency, count] of groupCountByCurrency) {
    if (count > topGroupCount) {
      topCurrency = currency;
      topGroupCount = count;
    }
  }
  return topCurrency;
}

/**
 * Picks the headline total displayed on `HomeTotalBalance`: prefers `preferredCurrency` when present, falling back to
 * the entry with the largest raw numeric magnitude when no net total exists in `preferredCurrency`.
 */
export function selectPrimaryTotal(
  totals: readonly HomeBalance[],
  preferredCurrency: string | undefined
): HomeBalance | undefined {
  const preferredMatch = totals.find(({ currency }) => currency === preferredCurrency);
  if (preferredMatch) return preferredMatch;
  return [...totals].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0];
}

/**
 * Computes a sort key for `"amount"` mode: `-1` places settled groups last, `0` places groups without an open balance
 * in `primaryCurrency` behind comparable groups, and `Math.abs(amount)` orders comparable groups largest-first.
 */
function getSortableBalanceMagnitude(balances: readonly HomeBalance[], primaryCurrency: string | undefined): number {
  const nonZeroBalances = balances.filter(({ amount }) => amount !== 0);
  if (nonZeroBalances.length === 0) return -1;
  const primaryMatch = nonZeroBalances.find(({ currency }) => currency === primaryCurrency);
  return primaryMatch ? Math.abs(primaryMatch.amount) : 0;
}

const nameCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

/** Returns a sorted shallow copy of `groups`, breaking all ties by most recent activity. */
export function sortGroups<T extends HomeGroupBalances>(groups: readonly T[], sort: HomeSort): T[] {
  const byRecentActivity = (a: T, b: T) => b.lastActivityTime.getTime() - a.lastActivityTime.getTime();
  const recentFirst = [...groups].sort(byRecentActivity);
  if (sort === "recent") return recentFirst;
  if (sort === "name") return recentFirst.sort((a, b) => nameCollator.compare(a.name, b.name));
  if (sort === "unsettled") {
    const settledRank = (group: T) => (group.settled === null ? 0 : 1);
    return recentFirst.sort((a, b) => settledRank(a) - settledRank(b));
  }
  // `recentFirst` is already ordered by activity, so currency-frequency ties favor the most recently active group.
  const primaryCurrency = mostUsedCurrency(recentFirst);
  return recentFirst.sort(
    (a, b) =>
      getSortableBalanceMagnitude(b.myBalances, primaryCurrency) -
      getSortableBalanceMagnitude(a.myBalances, primaryCurrency)
  );
}
